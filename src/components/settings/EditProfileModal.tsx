'use client';

import React, { useState } from 'react';
import { X, Check, User, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { Lang } from '../../lib/types';
import { FarmerProfile } from '../../lib/profileAndSecurity';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile;
  onSave: (updated: FarmerProfile) => void;
  lang: Lang;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
  lang,
}: EditProfileModalProps) {
  const isHi = lang === 'hi';
  const [formData, setFormData] = useState<FarmerProfile>({ ...profile });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(isHi ? 'कृपया किसान का नाम दर्ज करें।' : 'Please enter farmer name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError(isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0c1a13] border border-[#1e3c2c] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#1a3525] flex items-center justify-between bg-[#07130e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isHi ? 'किसान प्रोफाइल एडिट करें' : 'Edit Farmer Profile'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'अपनी व्यक्तिगत व गाँव की जानकारी अपडेट करें' : 'Update your personal & village details'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* 1. Farmer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'किसान का नाम' : 'Farmer Name'} <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isHi ? 'उदा. रामेश्वर प्रसाद पाटीदार' : 'e.g. Rameshwar Patidar'}
                className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] pl-9 pr-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
              />
              <User size={15} className="absolute left-3 top-3 text-emerald-500/80" />
            </div>
          </div>

          {/* 2. Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isHi ? 'मोबाइल नंबर' : 'Mobile Number'} <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="98260XXXXX"
                className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] pl-9 pr-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500 font-mono"
              />
              <Phone size={15} className="absolute left-3 top-3 text-emerald-500/80" />
            </div>
          </div>

          {/* 3. Village & Tehsil */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'गाँव' : 'Village'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder={isHi ? 'गाँव का नाम' : 'Village'}
                  className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] pl-8 pr-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
                />
                <MapPin size={13} className="absolute left-2.5 top-3.5 text-emerald-500/80" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'तहसील' : 'Tehsil'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.tehsil}
                  onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                  placeholder={isHi ? 'तहसील' : 'Tehsil'}
                  className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] pl-8 pr-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
                />
                <Building size={13} className="absolute left-2.5 top-3.5 text-emerald-500/80" />
              </div>
            </div>
          </div>

          {/* 4. District & State */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'जिला' : 'District'}
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder={isHi ? 'जिला (उदा. इन्दौर)' : 'District'}
                className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] px-3 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isHi ? 'राज्य' : 'State'}
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder={isHi ? 'मध्य प्रदेश' : 'State'}
                className="w-full h-10 rounded-xl border border-[#1e3c2c] bg-[#07130e] px-3 text-xs sm:text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2.5 pt-3 border-t border-[#1a3525]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-[#1e3c2c] text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950"
            >
              <Check size={14} />
              <span>{isHi ? 'प्रोफाइल सहेजें' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
