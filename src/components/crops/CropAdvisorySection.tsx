'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Wheat,
  Droplets,
  Sparkles,
  Bug,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { CropGuide, Lang } from '../../lib/types';
import { CROP_GUIDES } from '../../lib/mandiData';
import { FormCard } from '../common/UI';

interface CropAdvisorySectionProps {
  lang: Lang;
  onSelectCropForKhet?: (crop: string) => void;
}

export function CropAdvisorySection({ lang }: CropAdvisorySectionProps) {
  const isHi = lang === 'hi';
  const [guides] = useState<CropGuide[]>(CROP_GUIDES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchCrop, setSearchCrop] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string>(CROP_GUIDES[0]?.id || '');

  // Seasonal Advisory Planner
  const [plannerCrop, setPlannerCrop] = useState<string>('Wheat');
  const [plannerSowingDate, setPlannerSowingDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
      if (searchCrop.trim()) {
        const q = searchCrop.toLowerCase();
        return (
          g.nameHi.toLowerCase().includes(q) ||
          g.nameEn.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [guides, selectedCategory, searchCrop]);

  const scheduleTimeline = useMemo(() => {
    const d = new Date(plannerSowingDate);
    if (isNaN(d.getTime())) return [];
    const addDays = (days: number) => {
      const target = new Date(d);
      target.setDate(target.getDate() + days);
      return target.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    };

    if (plannerCrop === 'Wheat') {
      return [
        {
          stage: 'बुवाई के समय (Day 0)',
          date: addDays(0),
          action: '1 बोरी DAP + 15 किलो MOP पोटाश + 10 किलो जिंक बेसल डोज।',
          icon: Sparkles,
        },
        {
          stage: 'पहली सिंचाई (CRI अवस्था - Day 21)',
          date: addDays(21),
          action: 'क्राउन रूट अवस्था! 35 किलो यूरिया + 3 किलो 90% WDG सल्फर।',
          icon: Droplets,
        },
        {
          stage: 'खरपतवार नियंत्रण (Day 30-35)',
          date: addDays(32),
          action: 'सकड़ी व चौड़ी पत्ती खरपतवार हेतु मेटसल्फ्यूरॉन + क्लोडिनाफॉप स्प्रे।',
          icon: Bug,
        },
        {
          stage: 'दूसरी सिंचाई (Day 45)',
          date: addDays(45),
          action: 'गांठ बनने की अवस्था (25-30 किलो यूरिया का दूसरा छिड़काव)।',
          icon: Droplets,
        },
        {
          stage: 'फूल व दाना भराव (Day 75-80)',
          date: addDays(75),
          action: '0:52:34 या 0:0:50 (1 किलो/एकड़) का फोलियर स्प्रे दाना चमकदार बनाने हेतु।',
          icon: Wheat,
        },
        {
          stage: 'परिपक्वता व कटाई (Day 120-130)',
          date: addDays(125),
          action: 'दाना में नमी 12-14% होने पर कंबाइन हार्वेस्टर से कटाई करें।',
          icon: CheckCircle2,
        },
      ];
    }
    if (plannerCrop === 'Soybean') {
      return [
        {
          stage: 'बुवाई के समय (Day 0)',
          date: addDays(0),
          action: 'सिंगल सुपर फास्फेट (SSP) 3 बोरी प्रति एकड़। 48 घंटे में खरपतवार दवा।',
          icon: Sparkles,
        },
        {
          stage: 'कीट रोकथाम (Day 20)',
          date: addDays(20),
          action: 'गर्डल बीटल व तना मक्खी नियंत्रण हेतु कोराजन या इमामेक्टिन स्प्रे।',
          icon: Bug,
        },
        {
          stage: 'फूल आने से पहले (Day 35)',
          date: addDays(35),
          action: 'फूलों की संख्या बढ़ाने हेतु 19:19:19 NPK (1 किलो प्रति एकड़)।',
          icon: Droplets,
        },
        {
          stage: 'फली दाना भराव (Day 60)',
          date: addDays(60),
          action: '0:52:34 स्प्रे + फली छेदक इल्ली निगरानी।',
          icon: Wheat,
        },
        {
          stage: 'फसल कटाई (Day 90-100)',
          date: addDays(95),
          action: 'पत्तियां पीली पड़कर झड़ने पर कटाई प्रारंभ करें।',
          icon: CheckCircle2,
        },
      ];
    }
    return [
      {
        stage: 'बुवाई (Day 0)',
        date: addDays(0),
        action: 'बेसल उर्वरक संतुलित NPK मिश्रण व बीज उपचार।',
        icon: Sparkles,
      },
      {
        stage: 'निंदाई व सुरक्षा (Day 25)',
        date: addDays(25),
        action: 'खरपतवार नियंत्रण व सुरक्षा कीटनाशक स्प्रे।',
        icon: Bug,
      },
      {
        stage: 'पोषण छिड़काव (Day 55)',
        date: addDays(55),
        action: 'जल घुलनशील सूक्ष्म पोषक तत्व व फोलियर स्प्रे।',
        icon: Droplets,
      },
      {
        stage: 'कटाई व थ्रेसिंग (Day 90-110)',
        date: addDays(100),
        action: 'फसल पकने पर अनुकूल मौसम देखकर कटाई।',
        icon: CheckCircle2,
      },
    ];
  }, [plannerCrop, plannerSowingDate]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-5 lg:px-6 pb-28 sm:pb-16 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--sk-text)] flex items-center gap-2">
            <BookOpen className="text-emerald-500" size={24} />
            {isHi ? 'फसल कृषि सलाह व कार्यतालिका' : 'Crop Cultivation Guides & Pest Advisory'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--sk-muted)] mt-0.5">
            {isHi
              ? 'उन्नत किस्में, खाद की सटीक मात्रा, कीट-रोग पहचान व बुवाई तारीख अनुसार दिन-वार समय-सारणी'
              : 'Scientific agronomy guides, fertilizer dosage, disease remedies & day-wise timeline'}
          </p>
        </div>
      </div>

      {/* QUICK TIMELINE PLANNER GENERATOR */}
      <FormCard className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-[var(--sk-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--sk-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[var(--sk-text)]">
                {isHi ? 'बुवाई अनुसार दिन-वार कार्यतालिका' : 'Crop Lifecycle Timeline'}
              </h2>
              <p className="text-[11px] text-[var(--sk-muted)]">
                {isHi
                  ? 'बुवाई की तारीख दर्ज करें - खाद, सिंचाई और स्प्रे की सटीक तारीखें स्वतः मिलेंगी'
                  : 'Enter sowing date to get precision timeline for irrigation, fertilizers & sprays'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={plannerCrop}
              onChange={(e) => setPlannerCrop(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-[var(--sk-text)] outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Wheat">{isHi ? 'गेहूं (Wheat)' : 'Wheat'}</option>
              <option value="Soybean">{isHi ? 'सोयाबीन (Soybean)' : 'Soybean'}</option>
              <option value="Gram">{isHi ? 'चना (Chickpea)' : 'Gram'}</option>
              <option value="Mustard">{isHi ? 'सरसों (Mustard)' : 'Mustard'}</option>
              <option value="Garlic">{isHi ? 'लहसुन (Garlic)' : 'Garlic'}</option>
            </select>
            <input
              type="date"
              value={plannerSowingDate}
              onChange={(e) => setPlannerSowingDate(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] text-xs text-[var(--sk-text)] outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Timeline Steps Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scheduleTimeline.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Icon size={14} className="text-emerald-400 shrink-0" />
                      <span>{step.stage}</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                      {step.date}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--sk-muted)] mt-1.5 leading-relaxed">
                    {step.action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </FormCard>

      {/* CROP GUIDES CATALOG */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sk-dim)]" />
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              placeholder={isHi ? 'फसल या रोग का नाम खोजें...' : 'Search crops or diseases...'}
              className="w-full h-10 rounded-xl border border-[var(--sk-border)] bg-[var(--sk-card2)] pl-9 pr-3 text-xs sm:text-sm text-[var(--sk-text)] outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHi ? 'सभी' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('Rabi')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === 'Rabi'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHi ? 'रबी (Rabi)' : 'Rabi'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('Kharif')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === 'Kharif'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHi ? 'खरीफ (Kharif)' : 'Kharif'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('CashCrop')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === 'CashCrop'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHi ? 'नकदी फसल' : 'Cash Crops'}
            </button>
          </div>
        </div>

        {/* Guides Accordion List */}
        <div className="space-y-3">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedId === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl border border-[var(--sk-border)] bg-[var(--sk-card)] overflow-hidden transition shadow-sm"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? '' : guide.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Wheat size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[var(--sk-text)] flex items-center gap-2">
                        <span>{guide.nameHi}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                          {guide.category === 'Rabi'
                            ? 'रबी'
                            : guide.category === 'Kharif'
                            ? 'खरीफ'
                            : 'नकदी'}
                        </span>
                      </h3>
                      <div className="text-xs text-[var(--sk-muted)] mt-0.5 flex flex-wrap items-center gap-2">
                        <span>बुवाई: {guide.sowingMonths}</span>
                        <span>औसत पैदावार: <b className="text-emerald-400">{guide.avgYieldPerBigha}</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] text-[var(--sk-dim)]">मंडी भाव अनुमान</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {guide.currentMandiEstimate}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-[var(--sk-dim)]" />
                    ) : (
                      <ChevronDown size={20} className="text-[var(--sk-dim)]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-[var(--sk-border)] bg-slate-900/40 space-y-4 text-xs animate-in fade-in">
                    {/* Row 1: Seed Rate, Irrigation, Harvesting */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
                        <div className="text-[11px] text-[var(--sk-muted)] font-semibold mb-1">
                          बीज दर (Seed Rate):
                        </div>
                        <div className="text-slate-200">{guide.seedRatePerBigha}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
                        <div className="text-[11px] text-[var(--sk-muted)] font-semibold mb-1">
                          सिंचाई (Watering):
                        </div>
                        <div className="text-slate-200">{guide.waterRequirement}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)]">
                        <div className="text-[11px] text-[var(--sk-muted)] font-semibold mb-1">
                          कटाई समय (Harvesting):
                        </div>
                        <div className="text-slate-200">{guide.harvestMonths}</div>
                      </div>
                    </div>

                    {/* Row 2: Fertilizer Schedule */}
                    <div className="p-3.5 rounded-xl bg-[var(--sk-card2)] border border-[var(--sk-border)] space-y-2">
                      <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>{isHi ? 'उर्वरक व खाद प्रबंधन (Fertilizer Schedule):' : 'Fertilizers:'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {guide.recommendedFertilizers.map((fert, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                            <div className="text-[11px] font-semibold text-amber-300">{fert.stage}:</div>
                            <div className="text-slate-300 text-[11px] mt-0.5">{fert.items}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 3: Pests & Disease Treatment */}
                    <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
                      <div className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                        <Bug size={14} />
                        <span>{isHi ? 'प्रमुख कीट व रोग निदान (Pest & Disease Control):' : 'Pests & Remedies:'}</span>
                      </div>
                      <div className="space-y-1.5">
                        {guide.majorPestsAndDiseases.map((pest, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-900/90 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                          >
                            <span className="font-semibold text-red-300">⚠️ {pest.name}:</span>
                            <span className="text-slate-300 font-mono sm:text-right">{pest.remedy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
