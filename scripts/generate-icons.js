import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

// Precompute CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const c = crc32(typeAndData);
  chunk.writeUInt32BE(c, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const bytesPerRow = 1 + width * 4;
  const rawData = Buffer.alloc(bytesPerRow * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;
  
  // Safe scale factor for maskable icons (Android safe zone is inner 80%)
  const scale = isMaskable ? 0.75 : 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * bytesPerRow;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: Deep lush agricultural green
      // Gradient from top #064e3b (6, 78, 59) to bottom #022c22 (2, 44, 34)
      const gradRatio = y / height;
      let r = Math.round(6 * (1 - gradRatio) + 2 * gradRatio);
      let g = Math.round(78 * (1 - gradRatio) + 44 * gradRatio);
      let b = Math.round(59 * (1 - gradRatio) + 34 * gradRatio);
      let a = 255;

      // Inner circular badge (green glow)
      const badgeR = 0.42 * width * (isMaskable ? 0.85 : 1);
      if (dist < badgeR) {
        const glowFactor = 1 - (dist / badgeR);
        r = Math.min(255, Math.round(r + 10 + 20 * glowFactor));
        g = Math.min(255, Math.round(g + 60 + 60 * glowFactor)); // Emerald 059669
        b = Math.min(255, Math.round(b + 30 + 35 * glowFactor));
      }

      // Draw stylized sprout stem & leaves
      // Stem in center: x close to cx, between cy - 0.2*h and cy + 0.25*h
      const nx = (x - cx) / (width * scale);
      const ny = (y - cy) / (height * scale);

      // Stem
      if (Math.abs(nx) < 0.022 && ny > -0.22 && ny < 0.28) {
        r = 52; g = 211; b = 153; // #34d399 bright emerald
      }

      // Left leaf: curved bezier approximation
      // ny around 0.05, nx < 0
      if (nx < 0 && nx > -0.22 && ny > -0.18 && ny < 0.16) {
        const leafDist = Math.hypot(nx - (-0.11), ny - (-0.02));
        if (leafDist < 0.11) {
          r = 16; g = 185; b = 129; // #10b981
        }
      }

      // Right leaf: higher up
      if (nx > 0 && nx < 0.22 && ny > -0.28 && ny < 0.06) {
        const leafDist = Math.hypot(nx - 0.11, ny - (-0.12));
        if (leafDist < 0.11) {
          r = 52; g = 211; b = 153; // #34d399
        }
      }

      // Golden wheat grains at top
      // Top grain
      if (Math.hypot(nx, ny - (-0.29)) < 0.04) {
        r = 253; g = 224; b = 71; // gold
      }
      // Left grain
      if (Math.hypot(nx - (-0.06), ny - (-0.24)) < 0.035) {
        r = 245; g = 158; b = 11; // amber
      }
      // Right grain
      if (Math.hypot(nx - 0.06, ny - (-0.24)) < 0.035) {
        r = 245; g = 158; b = 11; // amber
      }

      // Bottom furrows (soil / field wave)
      if (ny > 0.24 && ny < 0.32 && Math.abs(nx) < 0.28) {
        const furrowY = 0.27 + 0.04 * (nx * nx * 8);
        if (Math.abs(ny - furrowY) < 0.015) {
          r = 217; g = 119; b = 6; // amber/earth
        }
      }

      // Write pixel RGBA
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: 6 = RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192 standard icon
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));

// 512x512 standard icon
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));

// 512x512 maskable icon (padded safe zone)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));

// 180x180 Apple touch icon
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

// Favicon 64x64 PNG
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));

console.log('Successfully generated all PWA icons!');
