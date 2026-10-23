'use client';

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  MapPin,
  Calculator,
  Bell,
  Trash2,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import { MandiPrice, Lang, MandiAlert } from '../../lib/types';
import { SAMPLE_MANDI_PRICES } from '../../lib/mandiData';
import { fmt } from '../../lib/utils';
import { FormCard } from '../common/UI';

interface MandiSectionProps {
  lang: Lang;
  onNavigateToSale?: (crop: string, price: number) => void;
}

const STORAGE_ALERTS_KEY = 'kisan-mitra-mandi-alerts';

export function MandiSection({ lang, onNavigateToSale }: MandiSectionProps) {
  const isHi = lang === 'hi';
  const [prices] = useState<MandiPrice[]>(SAMPLE_MANDI_PRICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'change'>('price-desc');

  // Profit Calculator State
  const [calcCrop, setCalcCrop] = useState<string>('Wheat');
  const [calcQuantity, setCalcQuantity] = useState<string>('25'); // quintals
  const [calcCustomPrice, setCalcCustomPrice] = useState<string>('2650');
  const [calcTractorCost, setCalcTractorCost] = useState<string>('800'); // transport / mandi bhada
  const [calcLaborCost, setCalcLaborCost] = useState<string>('400'); // hamali / tulaai

  // Mandi Alerts State
  const [alerts, setAlerts] = useState<MandiAlert[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_ALERTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertCrop, setNewAlertCrop] = useState('Wheat');
  const [newAlertTarget, setNewAlertTarget] = useState('2800');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);

  // States list from dataset
  const states = useMemo(() => {
    const s = new Set<string>();
    prices.forEach((p) => s.add(p.state));
    return Array.from(s);
  }, [prices]);

  // Unique commodities
  const commodities = useMemo(() => {
    const c = new Set<string>();
    prices.forEach((p) => c.add(p.commodity));
    return Array.from(c);
  }, [prices]);

  // Filtered & sorted prices
  const filteredPrices = useMemo(() => {
    return prices
      .filter((p) => {
        if (selectedState !== 'all' && p.state !== selectedState) return false;
        if (selectedCrop !== 'all' && p.commodity !== selectedCrop) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matches =
            p.commodity.toLowerCase().includes(q) ||
            p.commodityHi.toLowerCase().includes(q) ||
            p.market.toLowerCase().includes(q) ||
            p.district.toLowerCase().includes(q) ||
            p.variety.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-desc') return b.modalPrice - a.modalPrice;
        if (sortBy === 'price-asc') return a.modalPrice - b.modalPrice;
        if (sortBy === 'change') return b.changePercent - a.changePercent;
        return 0;
      });
  }, [prices, selectedState, selectedCrop, searchTerm, sortBy]);

  const handleCalcCropChange = (crop: string) => {
    setCalcCrop(crop);
    const matched = prices.find((p) => p.commodity === crop);
    if (matched) {
      setCalcCustomPrice(String(matched.modalPrice));
    }
  };

  const calcResult = useMemo(() => {
    const q = parseFloat(calcQuantity) || 0;
    const rate = parseFloat(calcCustomPrice) || 0;
    const tractor = parseFloat(calcTractorCost) || 0;
    const labor = parseFloat(calcLaborCost) || 0;
    const grossValue = q * rate;
    const deductions = tractor + labor;
    const netInHand = Math.max(0, grossValue - deductions);
    return {
      grossValue,
      deductions,
      netInHand,
      ratePerKg: rate > 0 ? (rate / 100).toFixed(2) : '0',
    };
  }, [calcQuantity, calcCustomPrice, calcTractorCost, calcLaborCost]);

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newAlertTarget);
    if (!target || target <= 0) return;
    const alert: MandiAlert = {
      id: `alert-${Date.now()}`,
      crop: newAlertCrop,
      targetPrice: target,
      condition: newAlertCondition,
      createdAt: new Date().toISOString().slice(0, 10),
      isActive: true,
    };
    const updated = [alert, ...alerts];
    setAlerts(updated);
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(updated));
    setShowAlertModal(false);
    setAlertSuccessMsg(
      isHi
        ? `₹${target} भाव का अलर्ट सेट हो गया!`
        : `Alert for ₹${target} set successfully!`
    );
    setTimeout(() => setAlertSuccessMsg(null), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-28 sm:pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={24} />
            {isHi ? 'दैनिक मंडी भाव व बाजार रुझान' : 'Live Mandi Rates & Market Trends'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {isHi
              ? 'प्रमुख कृषि उपज मंडियों के न्यूनतम, अधिकतम और मॉडल भाव'
              : 'Daily minimum, maximum and modal commodity prices across top agricultural mandis'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAlertModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300 active:scale-95 transition cursor-pointer"
          >
            <Bell size={14} className="text-amber-400" />
            <span>{isHi ? 'भाव अलर्ट सेट करें' : 'Set Price Alert'}</span>
            {alerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {alertSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alertSuccessMsg}</span>
        </div>
      )}

      {/* QUICK 1-TAP CROP SELECTOR CHIPS (Mobile Friendly) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCrop('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCrop === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
          }`}
        >
          {isHi ? '🌾 सभी फसलें' : 'All Crops'}
        </button>
        {commodities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedCrop(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCrop === c
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            {c === 'Wheat' ? '🌾 गेहूं' : c === 'Soybean' ? '🌱 सोयाबीन' : c === 'Gram' ? '🌾 चना' : c === 'Mustard' ? '🌻 सरसों' : c === 'Garlic' ? '🧄 लहसुन' : c === 'Rice' ? '🌾 धान' : c}
          </button>
        ))}
      </div>

      {/* SEARCH AND SELECT CONTROLS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="relative col-span-2 sm:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHi ? 'मंडी, जिला या फसल खोजें...' : 'Search mandi, district or crop...'}
            className="w-full h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] pl-9 pr-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 placeholder:text-slate-500"
          />
        </div>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">{isHi ? 'सभी राज्य (All States)' : 'All States'}</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] px-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="price-desc">{isHi ? 'भाव: अधिक से कम' : 'Price: High to Low'}</option>
          <option value="price-asc">{isHi ? 'भाव: कम से अधिक' : 'Price: Low to High'}</option>
          <option value="change">{isHi ? 'सर्वाधिक तेजी %' : 'Highest Gain %'}</option>
        </select>
      </div>

      {/* LIVE MANDI RATES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPrices.map((item) => {
          const isUp = item.trend === 'up';
          const isDown = item.trend === 'down';
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-4 hover:border-emerald-500/50 hover:bg-white/[0.02] transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
                      {item.commodityHi}
                    </h3>
                    <div className="text-[11px] text-[var(--sk-muted)] mt-0.5 flex items-center gap-1">
                      <MapPin size={11} className="text-emerald-400 shrink-0" />
                      <span>{item.market}, {item.district} ({item.state})</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                      isUp
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isDown
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {isUp ? '+' : ''}{item.changePercent}%
                  </span>
                </div>

                {/* Primary Modal Price */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-[10px] text-[var(--sk-muted)] font-medium">
                    {isHi ? 'मॉडल भाव (औसत व्यापार)' : 'Modal Price (Avg Trade)'}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-1">
                    <span>₹{item.modalPrice.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-normal text-[var(--sk-dim)]">/क्विंटल</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ≈ ₹{(item.modalPrice / 100).toFixed(2)} प्रति किलो (Kg)
                  </div>
                </div>

                {/* Min - Max Range */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[var(--sk-card2)] border border-[var(--sk-border)]">
                    <div className="text-[10px] text-[var(--sk-dim)]">{isHi ? 'न्यूनतम भाव' : 'Min Price'}</div>
                    <div className="font-mono font-semibold text-slate-300 mt-0.5">
                      ₹{item.minPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--sk-card2)] border border-[var(--sk-border)]">
                    <div className="text-[10px] text-[var(--sk-dim)]">{isHi ? 'अधिकतम भाव' : 'Max Price'}</div>
                    <div className="font-mono font-semibold text-emerald-400 mt-0.5">
                      ₹{item.maxPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Use in Ledger & Calculator */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[var(--sk-dim)] font-mono">
                  {item.arrivalDate}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleCalcCropChange(item.commodity);
                    setCalcCustomPrice(String(item.modalPrice));
                    const element = document.getElementById('mandi-calculator-box');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Calculator size={13} />
                  <span>{isHi ? 'मुनाफा निकालें' : 'Calculate'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPrices.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)]">
          <p className="text-sm text-[var(--sk-muted)]">
            {isHi ? 'खोज अनुसार कोई मंडी भाव नहीं मिला।' : 'No mandi records matching query.'}
          </p>
        </div>
      )}

      {/* MANDI SALE & NET PROFIT CALCULATOR */}
      <div id="mandi-calculator-box" className="pt-2">
        <FormCard className="border-emerald-500/40 bg-gradient-to-br from-[var(--sk-card)] to-emerald-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--sk-border)] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calculator size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
                  {isHi ? 'मंडी बिक्री व शुद्ध हाथ में आई नकद राशि कैलकुलेटर' : 'Mandi Harvest Value & Net Cash Calculator'}
                </h3>
                <p className="text-[11px] text-[var(--sk-muted)]">
                  {isHi
                    ? 'ट्रैक्टर भाड़ा, हमाली व तुलाई खर्च काटकर हाथ में आने वाली शुद्ध रकम जानें'
                    : 'Calculate net in-hand earnings after mandi transportation and labor charges'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Inputs */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--sk-text2)] mb-1">
                    {isHi ? 'फसल:' : 'Crop:'}
                  </label>
                  <select
                    value={calcCrop}
                    onChange={(e) => handleCalcCropChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-[var(--sk-text)] outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--sk-text2)] mb-1">
                    {isHi ? 'मात्रा (क्विंटल):' : 'Quantity (Quintals):'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-[var(--sk-text)] font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--sk-text2)] mb-1">
                    {isHi ? 'भाव (₹/क्विंटल):' : 'Rate (₹/Qtl):'}
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={calcCustomPrice}
                    onChange={(e) => setCalcCustomPrice(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--sk-text2)] mb-1">
                    {isHi ? 'ट्रैक्टर भाड़ा (₹):' : 'Transport (₹):'}
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={calcTractorCost}
                    onChange={(e) => setCalcTractorCost(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-red-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--sk-text2)] mb-1">
                    {isHi ? 'हमाली व तुलाई (₹):' : 'Mandi Labor (₹):'}
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={calcLaborCost}
                    onChange={(e) => setCalcLaborCost(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-red-400 font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Output Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[var(--sk-muted)]">
                  <span>{isHi ? 'कुल फसल मूल्य (Gross):' : 'Gross Harvest Value:'}</span>
                  <span className="font-mono font-bold text-sm text-[var(--sk-text)]">
                    {fmt(calcResult.grossValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-red-300">
                  <span>- {isHi ? 'कुल कटौतियां (भाड़ा + हमाली):' : 'Total Deductions:'}</span>
                  <span className="font-mono font-bold text-sm text-red-400">
                    -{fmt(calcResult.deductions)}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isHi ? 'शुद्ध हाथ में आई राशि (In-Hand Cash):' : 'Net In-Hand Realization:'}
                    </div>
                    <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
                      ≈ ₹{calcResult.ratePerKg}/किलो शुद्ध
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                    {fmt(calcResult.netInHand)}
                  </div>
                </div>
              </div>

              {onNavigateToSale && (
                <button
                  type="button"
                  onClick={() => onNavigateToSale(calcCrop, parseFloat(calcCustomPrice) || 0)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <IndianRupee size={14} />
                  <span>{isHi ? 'बहीखाते में बिक्री दर्ज करें' : 'Record in Farm Ledger'}</span>
                </button>
              )}
            </div>
          </div>
        </FormCard>
      </div>

      {/* PRICE ALERTS MODAL */}
      {showAlertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAlertModal(false);
          }}
        >
          <form
            onSubmit={handleSaveAlert}
            className="w-full max-w-md rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--sk-border)] pb-3">
              <h2 className="text-base font-bold text-[var(--sk-text)] flex items-center gap-2">
                <Bell size={18} className="text-amber-400" />
                <span>{isHi ? 'मंडी भाव अलर्ट बनाएं' : 'Create Price Alert'}</span>
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">{isHi ? 'फसल:' : 'Crop:'}</label>
                <select
                  value={newAlertCrop}
                  onChange={(e) => setNewAlertCrop(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-[var(--sk-text)] outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {commodities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">
                  {isHi ? 'लक्ष्य भाव (₹/क्विंटल):' : 'Target Price (₹/Quintal):'}
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newAlertTarget}
                  onChange={(e) => setNewAlertTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs sm:text-sm text-[var(--sk-text)] font-mono outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[var(--sk-muted)] mb-1">{isHi ? 'शर्त (Condition):' : 'Condition:'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAlertCondition('above')}
                    className={`p-2.5 rounded-xl border font-semibold text-center transition cursor-pointer ${
                      newAlertCondition === 'above'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isHi ? 'भाव ऊपर जाए (Above)' : 'Price rises above'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAlertCondition('below')}
                    className={`p-2.5 rounded-xl border font-semibold text-center transition cursor-pointer ${
                      newAlertCondition === 'below'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isHi ? 'भाव नीचे गिरे (Below)' : 'Price drops below'}
                  </button>
                </div>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="pt-2 border-t border-[var(--sk-border)]">
                <div className="text-[11px] text-[var(--sk-muted)] mb-2 font-semibold">
                  {isHi ? 'सक्रिय अलर्ट:' : 'Active Alerts:'}
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <span>
                        🔔 {al.crop} {al.condition === 'above' ? 'ऊपर' : 'नीचे'} ₹{al.targetPrice}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(al.id)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-[var(--sk-border)]">
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="flex-1 h-10 rounded-xl border border-[var(--sk-border)] text-xs text-[var(--sk-muted)] hover:text-white transition cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {isHi ? 'अलर्ट सहेजें' : 'Save Alert'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
