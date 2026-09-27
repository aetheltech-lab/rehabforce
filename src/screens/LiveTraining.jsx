import React, { useState, useEffect } from 'react';
import { deviceAdapter } from '../adapters/MockDeviceAdapter';
import { useTranslation } from 'react-i18next';

export default function LiveTraining({ navigateTo, athleteId }) {
  const { t, i18n } = useTranslation();
  
  // Phase 1: UI Simulation State
  const [isAthleteView, setIsAthleteView] = useState(false);
  const [repCount, setRepCount] = useState(0); 
  const [liveLeft, setLiveLeft] = useState(50);
  const [liveRight, setLiveRight] = useState(50);
  const [painLevel, setPainLevel] = useState(2);
  const [activeGraph, setActiveGraph] = useState('load');

  // Hardware Status & Data Quality Gate[cite: 1]
  const [dataQuality, setDataQuality] = useState('NOT_ASSESSED');
  const [leftConnected, setLeftConnected] = useState(false);
  const [rightConnected, setRightConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('NOT_ASSESSED');

  // Integrate the modular Device Adapter for <=100ms real-time simulated BLE streaming[cite: 1]
  useEffect(() => {
    let isMounted = true;
    let samples = 0;

    const initializeStream = async () => {
      if (!deviceAdapter.isConnected) {
        await deviceAdapter.connect();
      }
      
      if (isMounted) {
        deviceAdapter.startStream((data) => {
          // Update clinical UI with normalized payload[cite: 1]
          setLiveLeft(data.leftLoadPct);
          setLiveRight(data.rightLoadPct);
          setDataQuality(data.dataQuality);
          setLeftConnected(data.leftConnected);
          setRightConnected(data.rightConnected);
          setSyncStatus(data.syncStatus);
          
          // Safety Rule: Only progress clinical metrics if data is VALID[cite: 1]
          if (data.dataQuality === 'VALID') {
            samples++;
            if (samples % 30 === 0) {
              setRepCount(prev => (prev < 10 ? prev + 1 : 10));
            }
          }
        });
      }
    };

    initializeStream();

    // Cleanup: Safely stop the high-frequency stream when leaving the screen[cite: 1]
    return () => {
      isMounted = false;
      deviceAdapter.stopStream();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-hidden relative">
      
      {/* ATHLETE SAFETY OVERLAY: Blocks feedback if data is unreliable[cite: 1] */}
      {isAthleteView && dataQuality !== 'VALID' && (
        <div className="absolute inset-0 bg-red-900/95 z-50 flex flex-col items-center justify-center p-12 text-center">
          <button 
            onClick={() => setIsAthleteView(false)}
            className="absolute top-8 right-8 rtl:left-8 rtl:right-auto text-white/50 hover:text-white text-5xl font-bold transition-colors"
            title="Exit Athlete View"
          >
            ✕
          </button>
          <span className="text-8xl mb-6">⚠️</span>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-widest">{t('clinical.dataQualityWarning', 'DATA QUALITY WARNING')}</h1>
          <p className="text-2xl text-red-200 font-bold">Please wait for the clinician to resolve the sensor issue.</p>
        </div>
      )}

      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2 rtl:text-right">
            {t('nav.dashboard', 'Dashboard')} &gt; {t('nav.athletes', 'Athletes')} &gt; {athleteId || 'ATH-001'} &gt; {t('live.title', 'Live Training')}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 rtl:text-right">
            {isAthleteView ? t('live.athleteViewTitle', 'Athlete Live View') : t('live.clinicianViewTitle', 'Clinician Live View')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Language Quick-Switcher Flags */}
          <div className="flex items-center gap-3 mr-2 rtl:ml-2 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-slate-200 pr-4 rtl:pl-4">
            <button onClick={() => i18n.changeLanguage('en')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('en') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="English"><img src="https://flagcdn.com/gb.svg" alt="English" className="w-full h-full object-cover" /></button>
            <button onClick={() => i18n.changeLanguage('el')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('el') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="Ελληνικά"><img src="https://flagcdn.com/gr.svg" alt="Ελληνικά" className="w-full h-full object-cover" /></button>
            <button onClick={() => i18n.changeLanguage('ar')} className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('ar') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} title="العربية"><img src="https://flagcdn.com/sa.svg" alt="العربية" className="w-full h-full object-cover" /></button>
          </div>

          <button 
            onClick={() => setIsAthleteView(!isAthleteView)}
            className="px-6 py-3 rounded-lg font-bold bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {isAthleteView ? t('live.switchClinician', 'Switch to Clinician View') : t('live.switchAthlete', 'Switch to Athlete View')}
          </button>
          <button 
            onClick={() => navigateTo('SessionResults', { athleteId })}
            className="px-6 py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
          >
            {t('live.endSession', 'End Session')}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* ATHLETE VIEW (Simple & Clear)[cite: 1] */}
        {isAthleteView ? (
          <div className="absolute inset-0 flex flex-col items-center justify-start bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-12 overflow-y-auto">
            
            <div className="flex flex-col items-center justify-center mb-6 shrink-0 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{t('exercises.bilateralSquat', 'Bilateral Squat')}</h2>
              <p className="text-lg md:text-xl text-slate-500 font-bold">{t('live.setXofY', 'Set {{current}} of {{total}}', { current: 1, total: 3 })}</p>
            </div>
            
            <div className="flex w-full max-w-4xl gap-8 mb-10 items-end justify-center h-64 flex-row rtl:flex-row-reverse shrink-0">
              {/* Left Bar */}
              <div className="flex flex-col items-center gap-4 w-1/3">
                <span className="text-4xl font-extrabold text-slate-900">{liveLeft}%</span>
                <div className="w-full bg-slate-100 h-64 rounded-xl flex items-end overflow-hidden relative border border-slate-200">
                  <div 
                    className="w-full bg-blue-500 transition-all duration-300 rounded-b-xl" 
                    style={{ height: `${liveLeft}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">{t('live.left', 'Left')}</span>
              </div>
              
              {/* Right Bar */}
              <div className="flex flex-col items-center gap-4 w-1/3">
                <span className="text-4xl font-extrabold text-slate-900">{liveRight}%</span>
                <div className="w-full bg-slate-100 h-64 rounded-xl flex items-end overflow-hidden relative border border-slate-200">
                  <div 
                    className="w-full bg-blue-500 transition-all duration-300 rounded-b-xl" 
                    style={{ height: `${liveRight}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">{t('live.right', 'Right')}</span>
              </div>
            </div>

            {/* Rep Counter & Active Cue */}
            <div className="w-full max-w-4xl flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 p-8 rounded-2xl shadow-lg rtl:flex-row-reverse shrink-0">
              <div className="rtl:text-right text-left">
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest block mb-2">{t('live.primaryCue', 'Primary Cue')}</span>
                <span className="text-2xl md:text-4xl font-extrabold text-emerald-700">{t('live.goodRepCue', 'Good rep! Keep your weight evenly distributed.')}</span>
              </div>
              <div className="text-right rtl:text-left shrink-0 ml-4 rtl:ml-0 rtl:mr-4">
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest block mb-1">{t('live.completed', 'Completed')}</span>
                <span className="text-5xl md:text-6xl font-extrabold text-emerald-700">{repCount}<span className="text-2xl md:text-3xl text-emerald-600/50">/10</span></span>
              </div>
            </div>
          </div>
        ) : (
          
          /* CLINICIAN VIEW (Detailed Data)[cite: 1] */
          <div className="absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-8">
            
            {/* Top Row: Core Metrics & Data Quality Gate */}
            <div className="grid grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between ${dataQuality === 'VALID' ? 'bg-white border-slate-200' : 'bg-red-50 border-red-300'}`}>
                <span className={`text-xs font-bold uppercase rtl:text-right ${dataQuality === 'VALID' ? 'text-slate-500' : 'text-red-700'}`}>{t('live.loadDistribution', 'Load Distribution')}</span>
                <div className="mt-2 rtl:text-right">
                  <span className={`text-2xl font-extrabold ${dataQuality === 'VALID' ? 'text-slate-900' : 'text-red-700'}`} dir="ltr">
                    {dataQuality === 'VALID' ? `${liveLeft}% ${t('live.left', 'Left')[0]} | ${liveRight}% ${t('live.right', 'Right')[0]}` : '--'}
                  </span>
                  <span className={`block text-[10px] font-bold mt-1 ${dataQuality === 'VALID' ? 'text-slate-400' : 'text-red-500'}`}>
                    {dataQuality === 'VALID' ? t('live.targetLoad', 'Target: 50/50 ±10%') : 'INVALID DATA'}
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between ${dataQuality === 'VALID' ? 'bg-white border-slate-200' : 'bg-red-50 border-red-300'}`}>
                <span className={`text-xs font-bold uppercase rtl:text-right ${dataQuality === 'VALID' ? 'text-slate-500' : 'text-red-700'}`}>{t('live.movementSymmetry', 'Movement Symmetry')}</span>
                <div className="mt-2 rtl:text-right">
                  <span className={`text-2xl font-extrabold ${dataQuality === 'VALID' ? 'text-emerald-600' : 'text-red-700'}`}>
                    {dataQuality === 'VALID' ? '92%' : '--'}
                  </span>
                  <span className={`block text-[10px] font-bold mt-1 ${dataQuality === 'VALID' ? 'text-slate-400' : 'text-red-500'}`}>
                    {dataQuality === 'VALID' ? t('live.targetSym', 'Target: ≥ 90%') : 'NOT ASSESSED'}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase rtl:text-right">{t('live.tempo', 'Tempo (s)')}</span>
                <div className="mt-2 rtl:text-right">
                  <span className="text-2xl font-extrabold text-slate-900">3.0 - 1.0 - 3.0</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">{t('live.eccPauseConc', 'Ecc - Pause - Conc')}</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between ${dataQuality === 'VALID' ? 'bg-white border-slate-200' : 'bg-red-50 border-red-300'}`}>
                <span className={`text-xs font-bold uppercase rtl:text-right ${dataQuality === 'VALID' ? 'text-slate-500' : 'text-red-700'}`}>{t('live.peakForce', 'Peak Force (BW)')}</span>
                <div className="mt-2 rtl:text-right">
                  <span className={`text-2xl font-extrabold ${dataQuality === 'VALID' ? 'text-slate-900' : 'text-red-700'}`} dir="ltr">
                    {dataQuality === 'VALID' ? '1.6 x' : '--'}
                  </span>
                  <span className={`block text-[10px] font-bold mt-1 ${dataQuality === 'VALID' ? 'text-slate-400' : 'text-red-500'}`}>
                    {dataQuality === 'VALID' ? t('live.targetForce', 'Target: 1.4 - 1.8') : 'NOT ASSESSED'}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase rtl:text-right">Sensor Health</span>
                <div className="mt-2 rtl:text-right flex flex-col gap-1">
                  <span className={`text-[10px] font-bold ${leftConnected ? 'text-emerald-600' : 'text-red-600'}`}>L: {leftConnected ? 'Connected' : 'Disconnected'}</span>
                  <span className={`text-[10px] font-bold ${rightConnected ? 'text-emerald-600' : 'text-red-600'}`}>R: {rightConnected ? 'Connected' : 'Disconnected'}</span>
                  <span className={`text-[10px] font-bold ${syncStatus === 'SYNCED' ? 'text-emerald-600' : 'text-amber-600'}`}>Sync: {syncStatus}</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Live Graphs & Rep Progress */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-[300px]">
              {/* Graphs Section */}
              <div className="col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-slate-800">{t('live.realTimeGraphs', 'Real-time Graphs')}</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveGraph('load')}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${activeGraph === 'load' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {t('live.loadDistribution', 'Load Distribution')}
                    </button>
                    <button 
                      onClick={() => setActiveGraph('force')}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${activeGraph === 'force' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {t('live.force', 'Force')}
                    </button>
                    <button 
                      onClick={() => alert(t('live.alertGraph', 'Graph expansion will map to the external clinician monitor view in Phase 2.'))}
                      className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1 rounded border border-slate-900 hover:bg-slate-700 ml-2 rtl:mr-2 rtl:ml-0"
                    >
                      {t('live.expand', '⛶ Expand')}
                    </button>
                  </div>
                </div>
                
                {/* Simulated Waveform Visualization */}
                <div className={`flex-1 rounded-lg border relative overflow-hidden flex items-end pb-4 transition-colors ${dataQuality === 'VALID' ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-300'}`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="text-xl font-extrabold text-slate-400">
                      {dataQuality === 'VALID' ? t('live.liveDataStream', 'Live Data Stream (Phase 1 Mock)') : 'STREAM INTERRUPTED'}
                    </span>
                  </div>
                  {dataQuality === 'VALID' && (
                    <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,90 Q10,20 20,90 T40,90 T60,90 T80,90 T100,90" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                      <path d="M0,90 Q12,25 22,90 T42,90 T62,90 T82,90 T100,90" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4"/>
                    </svg>
                  )}
                  <div className="absolute bottom-2 left-4 rtl:left-auto rtl:right-4 flex gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> {t('live.left', 'Left')}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-500 rounded-sm"></span> {t('live.right', 'Right')}</span>
                  </div>
                </div>
              </div>

              {/* Set Progress & Pain */}
              <div className="col-span-4 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-800">{t('live.setProgress', 'Set Progress')}</h2>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{t('live.setXofY', 'Set {{current}} of {{total}}', { current: 1, total: 3 })}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-2" dir="ltr">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rep) => (
                    <button 
                      key={rep} 
                      onClick={() => setRepCount(rep)}
                      className={`h-10 flex items-center justify-center font-bold text-sm rounded cursor-pointer transition-colors ${
                        rep < repCount ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' :
                        rep === repCount ? 'bg-blue-600 text-white animate-pulse shadow-md' :
                        'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rep}
                    </button>
                  ))}
                  </div>
                  <p className="text-xs font-bold text-slate-400 text-right rtl:text-left mt-2">{t('live.repXofY', '{{current}} of {{total}} Reps', { current: repCount, total: 10 })}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center">
                  <h2 className="text-sm font-bold text-slate-800 mb-4 rtl:text-right">{t('live.painDuring', 'Pain During Exercise (NPRS 0-10)')}</h2>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="10" 
                      value={painLevel} 
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="flex-1 accent-amber-500" 
                    />
                    <span className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg shrink-0">{painLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DEVELOPER TESTING PANEL: Phase 1 Simulator Controls[cite: 1] */}
            <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-700 text-white mt-auto">
              <h2 className="text-xs font-bold mb-3 text-slate-400 uppercase tracking-widest text-left rtl:text-right">Developer Simulation Panel (Phase 1 Testing)</h2>
              <div className="flex flex-wrap gap-3 rtl:flex-row-reverse">
                <button onClick={() => deviceAdapter.triggerSimulationEvent('NONE')} className="px-4 py-2 bg-emerald-600 rounded font-bold text-xs hover:bg-emerald-500 transition-colors">Normal Operation</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('LEFT_DISCONNECT')} className="px-4 py-2 bg-red-600 rounded font-bold text-xs hover:bg-red-500 transition-colors">Left Disconnect</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('RIGHT_DISCONNECT')} className="px-4 py-2 bg-red-600 rounded font-bold text-xs hover:bg-red-500 transition-colors">Right Disconnect</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('SYNC_ERROR')} className="px-4 py-2 bg-amber-600 rounded font-bold text-xs hover:bg-amber-500 transition-colors">Sync Error</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('STALE_DATA')} className="px-4 py-2 bg-amber-600 rounded font-bold text-xs hover:bg-amber-500 transition-colors">Stale Data</button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}