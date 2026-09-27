import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Settings({ navigateTo, clinicianId }) {
  const { t, i18n } = useTranslation();
  
  // Initialize state from the currently active i18n language and local storage for units
  const [language, setLanguage] = useState(i18n.language?.split('-')[0] || 'en');
  const [region, setRegion] = useState(localStorage.getItem('rehabforce_units') || 'metric');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync local radio state if the global language is changed via the header flags
  useEffect(() => {
    setLanguage(i18n.language?.split('-')[0] || 'en');
  }, [i18n.language]);

  const handleSave = () => {
    // 1. Change the application language (this automatically triggers the RTL flip for Arabic via i18n.js)
    i18n.changeLanguage(language);
    
    // 2. Save the isolated units/regional preference
    localStorage.setItem('rehabforce_units', region);
    
    // 3. Show success feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => navigateTo('Dashboard')}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm rtl:flex-row-reverse"
          >
            {i18n.dir() === 'rtl' ? '→' : '←'} {t('nav.back', 'Back')}
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold rtl:text-right">
            {t('nav.dashboard', 'Dashboard')} &gt; {t('settings.title', 'Settings')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Language Quick-Switcher Flags */}
          <div className="flex items-center gap-3 mr-2 rtl:ml-2 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-slate-200 pr-4 rtl:pl-4">
            <button onClick={() => i18n.changeLanguage('en')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('en') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="English"><img src="https://flagcdn.com/gb.svg" alt="English" className="w-full h-full object-cover" /></button>
            <button onClick={() => i18n.changeLanguage('el')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('el') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="Ελληνικά"><img src="https://flagcdn.com/gr.svg" alt="Ελληνικά" className="w-full h-full object-cover" /></button>
            <button onClick={() => i18n.changeLanguage('ar')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('ar') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="العربية"><img src="https://flagcdn.com/sa.svg" alt="العربية" className="w-full h-full object-cover" /></button>
          </div>

          <div className="text-right rtl:text-left">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">{t('profile.physiotherapist', 'Physiotherapist')}</p>
          </div>
          <div className="h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold shadow-inner shrink-0">
            PA
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6 text-left rtl:text-right">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t('settings.title', 'Settings')}</h1>

        {/* Setting Card 1: Application Language */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
            {t('settings.language', 'Application Language')}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t('settings.langDesc', 'Select the interface language. Clinical data and exported reports will respect this presentation setting.')}
          </p>
          
          <div className="flex flex-col gap-3">
            <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${language === 'en' ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="language" value="en" checked={language === 'en'} onChange={(e) => setLanguage(e.target.value)} className="w-5 h-5 accent-blue-600" />
              <span className="font-bold text-slate-800">{t('settings.langEn', 'English')}</span>
            </label>
            
            <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${language === 'el' ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="language" value="el" checked={language === 'el'} onChange={(e) => setLanguage(e.target.value)} className="w-5 h-5 accent-blue-600" />
              <span className="font-bold text-slate-800">{t('settings.langEl', 'Ελληνικά (Greek)')}</span>
            </label>
            
            <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${language === 'ar' ? 'bg-blue-50 border-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name="language" value="ar" checked={language === 'ar'} onChange={(e) => setLanguage(e.target.value)} className="w-5 h-5 accent-blue-600" />
              <span className="font-bold text-slate-800">{t('settings.langAr', 'العربية (Arabic - RTL)')}</span>
            </label>
          </div>
        </div>

        {/* Setting Card 2: Regional Format & Units */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">
            {t('settings.region', 'Units & Regional Format')}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {t('settings.regionDesc', 'Configure the measurement units used for external load and biomechanical calculations. This setting is independent of the application language.')}
          </p>
          
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${region === 'metric' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" name="region" value="metric" checked={region === 'metric'} onChange={(e) => setRegion(e.target.value)} className="hidden" />
              <span className="font-bold">{t('settings.metric', 'Metric (kg, cm)')}</span>
            </label>
            
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${region === 'imperial' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" name="region" value="imperial" checked={region === 'imperial'} onChange={(e) => setRegion(e.target.value)} className="hidden" />
              <span className="font-bold">{t('settings.imperial', 'Imperial (lbs, in)')}</span>
            </label>
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-4 flex items-center justify-end gap-4 rtl:justify-start">
          {saveSuccess && (
            <span className="text-sm font-bold text-emerald-600 animate-pulse">
              ✓ {t('settings.saveSuccess', 'Preferences saved')}
            </span>
          )}
          <button 
            onClick={handleSave}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            {t('settings.save', 'Save Preferences')}
          </button>
        </div>

      </div>
    </div>
  );
}