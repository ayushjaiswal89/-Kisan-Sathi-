'use client';

import React, { useMemo, useState } from 'react';
import {
  Plus,
  Warehouse,
  Share2,
  Sparkles,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { CropStock, Lang } from '../../lib/types';
import { SAMPLE_MANDI_PRICES } from '../../lib/mandiData';
import { INITIAL_STOCKS } from '../../lib/initialData';
import { cropLabel } from '../../lib/farmI18n';
import { formatDate } from '../../lib/utils';
import { shareViaWhatsApp } from '../../lib/whatsappSharing';

interface StockSectionProps {
  lang: Lang;
  stocks?: CropStock[];
  setStocks?: React.Dispatch<React.SetStateAction<CropStock[]>>;
  onSellStockDirect?: (crop: string, qty: number, price: number) => void;
  onNavigateToSale?: (crop: string) => void;
}

export function StockSection({
  lang,
  stocks: externalStocks,
  setStocks: setExternalStocks,
  onSellStockDirect,
  onNavigateToSale,
}: StockSectionProps) {
  const isHi = lang === 'hi';
  const [internalStocks, setInternalStocks] = useState<CropStock[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kisan-mitra-stocks-v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_STOCKS;
  });

  const stocks = externalStocks || internalStocks;
  const setStocks = setExternalStocks || setInternalStocks;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState<CropStock | null>(null);

  const [newStock, setNewStock] = useState({
    crop: 'Wheat',
    quantity: '40',
    unit: 'Quintal',
    bagCount: '80',
    location: 'घर का गोदाम',
    harvestSeason: 'Rabi 2026',
    storedDate: new Date().toISOString().slice(0, 10),
    quality: 'A-Grade' as CropStock['quality'],
    notes: '',
  });

  const stockWithValuation = useMemo(() => {
    return stocks.map((item) => {
      const matchedMandi = SAMPLE_MANDI_PRICES.find(
        (m) => m.commodity.toLowerCase() === item.crop.toLowerCase()
      );
      const modalRate = matchedMandi ? matchedMandi.modalPrice : 2500;
      const minRate = matchedMandi ? matchedMandi.minPrice : 2200;
      const maxRate = matchedMandi ? matchedMandi.maxPrice : 2800;
      const totalEstimatedValue = Math.round(item.quantity * modalRate);
      const minEstimatedValue = Math.round(item.quantity * minRate);
      const maxEstimatedValue = Math.round(item.quantity * maxRate);
      return {
        ...item,
        matchedMandi,
        modalRate,
        minRate,
        maxRate,
        totalEstimatedValue,
        minEstimatedValue,
        maxEstimatedValue,
      };
    });
  }, [stocks]);

  const overallMetrics = useMemo(() => {
    let totalQtyQuintal = 0;
    let totalBags = 0;
    let totalMarketValuation = 0;
    stockWithValuation.forEach((s) => {
      totalQtyQuintal += s.quantity;
      totalBags += s.bagCount || 0;
      totalMarketValuation += s.totalEstimatedValue;
    });
    return {
      totalQtyQuintal,
      totalBags,
      totalMarketValuation,
      cropCount: stockWithValuation.length,
    };
  }, [stockWithValuation]);

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newStock.quantity);
    if (!qty || qty <= 0) return;

    if (editingStock) {
      const updated = stocks.map((s) =>
        s.id === editingStock.id
          ? {
              ...editingStock,
              crop: newStock.crop,
              quantity: qty,
              unit: newStock.unit,
              bagCount: parseInt(newStock.bagCount) || 0,
              location: newStock.location,
              harvestSeason: newStock.harvestSeason,
              storedDate: newStock.storedDate,
              quality: newStock.quality,
              notes: newStock.notes.trim(),
            }
          : s
      );
      setStocks(updated);
      setEditingStock(null);
    } else {
      const created: CropStock = {
        id: `stock-${Date.now()}`,
        crop: newStock.crop,
        quantity: qty,
        unit: newStock.unit,
        bagCount: parseInt(newStock.bagCount) || 0,
        location: newStock.location,
        harvestSeason: newStock.harvestSeason,
        storedDate: newStock.storedDate,
        quality: newStock.quality,
        notes: newStock.notes.trim(),
      };
      setStocks([created, ...stocks]);
    }
    setShowAddModal(false);
    setNewStock({
      crop: 'Wheat',
      quantity: '40',
      unit: 'Quintal',
      bagCount: '80',
      location: 'घर का गोदाम',
      harvestSeason: 'Rabi 2026',
      storedDate: new Date().toISOString().slice(0, 10),
      quality: 'A-Grade',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm(isHi ? 'क्या आप इस स्टॉक को हटाना चाहते हैं?' : 'Delete stock?')) {
      setStocks(stocks.filter((s) => s.id !== id));
    }
  };

  const handleEdit = (s: CropStock) => {
    setEditingStock(s);
    setNewStock({
      crop: s.crop,
      quantity: String(s.quantity),
      unit: s.unit,
      bagCount: String(s.bagCount || ''),
      location: s.location || '',
      harvestSeason: s.harvestSeason || '',
      storedDate: s.storedDate || new Date().toISOString().slice(0, 10),
      quality: s.quality || 'A-Grade',
      notes: s.notes || '',
    });
    setShowAddModal(true);
  };

  const handleShareStockWhatsApp = () => {
    const lines = stockWithValuation.map(
      (s) =>
        `🌾 *${cropLabel(lang, s.crop)}:* ${s.quantity} क्विंटल (${s.bagCount ? `${s.bagCount} बोरी` : ''})\n• मंडी भाव: ₹${s.modalRate}/क्विंटल\n• अनुमानित मूल्य: *₹${s.totalEstimatedValue.toLocaleString('en-IN')}*\n• स्थान: ${s.location || 'गोदाम'}`
    );
    const msg = `📦 *घर का स्टॉक विवरण (किसान साथी)* 📦\nदिनांक: ${new Date().toLocaleDateString('hi-IN')}\n\n${lines.join('\n\n')}\n---------------------------------\n💰 *कुल मंडी मूल्यांकन: ₹${overallMetrics.totalMarketValuation.toLocaleString('en-IN')}*\n⚖️ *कुल मात्रा:* ${overallMetrics.totalQtyQuintal} क्विंटल (${overallMetrics.totalBags} बोरियां)`;
    shareViaWhatsApp(msg);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-28 sm:pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Warehouse className="text-emerald-400" size={24} />
            <span>{isHi ? 'घर का स्टॉक' : 'Ghar Ka Stock'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
              {isHi ? 'मंडी मूल्यांकन' : 'Mandi Valuation'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {isHi
              ? 'घर अथवा कोठी/गोदाम में रखी फसल (अनाज) और उसका लाइव मंडी भाव के अनुसार बाजार मूल्य'
              : 'Track crop stock stored at home or warehouse with live mandi market valuation'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={handleShareStockWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2.5 min-h-[44px] text-xs font-semibold text-emerald-300 active:scale-95 transition cursor-pointer shadow-sm"
            title="Share on WhatsApp"
          >
            <Share2 size={15} className="text-emerald-400" />
            <span>{isHi ? 'WhatsApp पर्चा' : 'Share WhatsApp'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingStock(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>{isHi ? '+ स्टॉक जोड़ें' : '+ Add Stock'}</span>
          </button>
        </div>
      </div>

      {/* TOP 3 VALUATION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Market Value */}
        <div className="p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 shadow-md">
          <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-between">
            <span>{isHi ? 'घर के स्टॉक का कुल बाजार मूल्य' : 'Total Home Stock Valuation'}</span>
            <Sparkles size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1">
            ₹{overallMetrics.totalMarketValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-200/70 mt-1">
            {isHi ? 'दैनिक औसत मंडी भाव पर आधारित' : 'Based on latest mandi rates'}
          </div>
        </div>

        {/* Total Quantity */}
        <div className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
          <div className="text-[11px] text-slate-400 font-medium">
            {isHi ? 'घर में कुल रखा स्टॉक (मात्रा)' : 'Total Stored Quantity'}
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 mt-1">
            {overallMetrics.totalQtyQuintal} <span className="text-sm font-normal">क्विंटल</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            ≈ {overallMetrics.totalBags} कट्टे / बोरियां (Bags)
          </div>
        </div>

        {/* Number of Crops Stored */}
        <div className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
          <div className="text-[11px] text-slate-400 font-medium">
            {isHi ? 'घर में रखी फसलें (Home Stock)' : 'Crops Held in Storage'}
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 mt-1">
            {overallMetrics.cropCount} <span className="text-sm font-normal">प्रकार</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            घर व कोठी में सुरक्षित
          </div>
        </div>
      </div>

      {/* STOCK CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {stockWithValuation.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] hover:border-emerald-500/40 transition flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    🌾
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {cropLabel(lang, item.crop)}
                    </h3>
                    <div className="text-xs text-[var(--sk-muted)] mt-0.5">
                      📍 {item.location || 'घर का गोदाम'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-1 rounded text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Quantity and Bags */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">{isHi ? 'भंडारित वजन:' : 'Stock Held:'}</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                    {item.quantity} <span className="text-xs font-normal">क्विंटल</span>
                  </div>
                </div>
                {item.bagCount ? (
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">{isHi ? 'बोरियां:' : 'Bags:'}</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {item.bagCount} बोरी
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Market Valuation Box */}
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">
                    {isHi ? 'वर्तमान मंडी भाव:' : 'Current Mandi Rate:'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{item.modalRate}/Qtl
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20 text-xs">
                  <span className="font-bold text-white">
                    {isHi ? 'अनुमानित कुल कीमत:' : 'Estimated Worth:'}
                  </span>
                  <span className="font-mono font-bold text-base text-emerald-400">
                    ₹{item.totalEstimatedValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="mt-2.5 text-xs text-[var(--sk-muted)] italic truncate">
                  "{item.notes}"
                </div>
              )}
            </div>

            {/* Quick Action Button: Sell or Record */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                📅 {formatDate(item.storedDate || '')}
              </span>
              {(onSellStockDirect || onNavigateToSale) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToSale) {
                      onNavigateToSale(item.crop);
                    } else if (onSellStockDirect) {
                      onSellStockDirect(item.crop, item.quantity, item.modalRate);
                    }
                  }}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isHi ? 'मंडी में बेचें →' : 'Sell in Mandi →'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {stocks.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
          <Warehouse size={36} className="mx-auto mb-2 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-300">
            {isHi ? 'घर में कोई स्टॉक दर्ज नहीं है' : 'No home stock recorded'}
          </h3>
          <p className="text-xs text-[var(--sk-muted)] mt-1 max-w-sm mx-auto">
            {isHi
              ? 'घर अथवा कोठी में रखी फसल का रिकॉर्ड रखें ताकि भाव बढ़ने पर सही समय पर बेच सकें।'
              : 'Record harvest stored at home or warehouse to monitor live worth.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingStock(null);
              setShowAddModal(true);
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            {isHi ? '+ घर का पहला स्टॉक जोड़ें' : '+ Add First Home Stock'}
          </button>
        </div>
      )}

      {/* ADD / EDIT STOCK MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <form
            onSubmit={handleSaveStock}
            className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Warehouse size={18} className="text-emerald-400" />
                <span>
                  {editingStock
                    ? isHi ? 'घर का स्टॉक विवरण बदलें' : 'Edit Stock'
                    : isHi ? 'घर का फसल स्टॉक दर्ज करें' : 'Record Home Stock'}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                  {isHi ? 'फसल (Crop):' : 'Crop:'}
                </label>
                <select
                  value={newStock.crop}
                  onChange={(e) => setNewStock({ ...newStock, crop: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Wheat">{isHi ? 'गेहूं (Wheat)' : 'Wheat'}</option>
                  <option value="Soybean">{isHi ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
                  <option value="Gram">{isHi ? 'चना (Gram)' : 'Gram'}</option>
                  <option value="Mustard">{isHi ? 'सरसों (Mustard)' : 'Mustard'}</option>
                  <option value="Garlic">{isHi ? 'लहसुन (Garlic)' : 'Garlic'}</option>
                  <option value="Groundnut">{isHi ? 'मूंगफली (Groundnut)' : 'Groundnut'}</option>
                  <option value="Onion">{isHi ? 'प्याज (Onion)' : 'Onion'}</option>
                  <option value="Potato">{isHi ? 'आलू (Potato)' : 'Potato'}</option>
                  <option value="Rice">{isHi ? 'धान (Paddy)' : 'Rice'}</option>
                  <option value="Maize">{isHi ? 'मक्का (Maize)' : 'Maize'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'मात्रा (क्विंटल):' : 'Quantity (Quintals):'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    placeholder="उदा. 40"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-sm text-cyan-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'बोरी संख्या (Bags):' : 'Bag Count:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="उदा. 80 कट्टे"
                    value={newStock.bagCount}
                    onChange={(e) => setNewStock({ ...newStock, bagCount: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-sm text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'भंडारण स्थान (Location):' : 'Storage Location:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHi ? 'घर का गोदाम / वेयरहाउस' : 'Warehouse'}
                    value={newStock.location}
                    onChange={(e) => setNewStock({ ...newStock, location: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--sk-muted)] mb-1 font-semibold">
                    {isHi ? 'भंडारण तारीख:' : 'Stored Date:'}
                  </label>
                  <input
                    type="date"
                    value={newStock.storedDate}
                    onChange={(e) => setNewStock({ ...newStock, storedDate: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">
                  {isHi ? 'टिप्पणी / लक्ष्य भाव (Notes):' : 'Remarks / Target Price:'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. भाव 2800+ होने तक रोकेंगे' : 'Hold until rate rises'}
                  value={newStock.notes}
                  onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[var(--sk-border)]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-10 rounded-xl border border-[var(--sk-border)] text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                {isHi ? 'घर का स्टॉक सहेजें' : 'Save Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
