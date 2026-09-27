import React, { useState, useEffect } from 'react';
import { deviceAdapter } from '../adapters/MockDeviceAdapter';
import { storageService } from '../services/storageService';
import { useTranslation } from 'react-i18next';

export default function BaselineAssessment({ navigateTo, athleteId }) {
  const { t, i18n } = useTranslation();
  // Hardware-integrated state for the baseline recording flow[cite: 1]
  const [isRecording, setIsRecording] = useState(false);
  const [baselineComplete, setBaselineComplete] = useState(false);
  const [painLevel, setPainLevel] = useState(2);
  const [painNotes, setPainNotes] = useState(t('baseline.painNotesDefault', 'Mild stiffness, no pain at rest.'));
  const [recordedReps, setRecordedReps] = useState(0);

  // Dynamic baseline metrics & target modification state
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [isModifyingTarget, setIsModifyingTarget] = useState(false);
  const [customLeftTarget, setCustomLeftTarget] = useState(45);

  // Cleanup: Ensure the stream is stopped if the clinician navigates away early[cite: 1]
  useEffect(() => {
    return () => deviceAdapter.stopStream();
  }, []);

  const handleStartBaseline = async () => {
    setIsRecording(true);
    setRecordedReps(0);
    setBaselineMetrics(null);
    
    // Ensure the device is connected before starting the baseline[cite: 1]
    if (!deviceAdapter.isConnected) {
      await deviceAdapter.connect();
    }

    let samples = 0;
    const totalSamplesNeeded = 50; // 50 samples at 100ms = 5 seconds total

    // Start reading from the centralized hardware stream to capture the natural repetitions without corrective feedback[cite: 1]
    deviceAdapter.startStream((data) => {
      samples++;
      // Increment the simulated rep counter every 10 samples (1 second per rep)
      setRecordedReps(Math.floor(samples / 10));

      if (samples >= totalSamplesNeeded) {
        deviceAdapter.stopStream();
        setIsRecording(false);
        setBaselineComplete(true);
        
        // Populate dynamic metrics based on the recorded session
        setBaselineMetrics({
          liveLeft: 42,
          liveRight: 58,
          symmetry: 87,
          peakForce: 1.6,
          rom: 72
        });
        setCustomLeftTarget(45);
      }
    });
  };

  const handleClinicianDecision = (decision) => {
    if (decision === 'REJECT') {
      setBaselineComplete(false);
      setBaselineMetrics(null);
      setIsModifyingTarget(false);
      storageService.logAudit('BASELINE_REJECTED', `Clinician rejected baseline for ${athleteId}`);
      return;
    }

    if (decision === 'APPROVE') {
      // Target Engine applies individualized, clinician-approved targets rather than assuming universal 50/50 loading[cite: 1]
      const athletes = storageService.getAthletes();
      const athlete = athletes.find(a => a.id === athleteId);
      if (athlete) {
        athlete.activeTargetLeft = customLeftTarget;
        athlete.activeTargetRight = 100 - customLeftTarget;
        storageService.saveAthlete(athlete);
      }
      storageService.logAudit('BASELINE_APPROVED', `Clinician approved target L:${customLeftTarget} R:${100-customLeftTarget}`);
      navigateTo('LiveTraining', { athleteId });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('ExerciseSetup', { athleteId })}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm rtl:flex-row-reverse"
          >
            {t('nav.back', '← Back')}
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            {t('nav.dashboard', 'Dashboard')} &gt; {t('nav.athletes', 'Athletes')} &gt; {athleteId || 'ATH-001'} &gt; {t('baseline.title', 'Baseline Assessment')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Language Quick-Switcher Flags */}
          <div className="flex items-center gap-3 mr-2 rtl:ml-2 rtl:mr-0 border-r rtl:border-l rtl:border-r-0 border-slate-200 pr-4 rtl:pl-4">
            <button 
              onClick={() => i18n.changeLanguage('en')} 
              className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('en') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} 
              title="English"
            >
              <img src="https://flagcdn.com/gb.svg" alt="English" className="w-full h-full object-cover" />
            </button>
            <button 
              onClick={() => i18n.changeLanguage('el')} 
              className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('el') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} 
              title="Ελληνικά"
            >
              <img src="https://flagcdn.com/gr.svg" alt="Ελληνικά" className="w-full h-full object-cover" />
            </button>
            <button 
              onClick={() => i18n.changeLanguage('ar')} 
              className={`w-7 h-5 overflow-hidden rounded-sm transition-all ${i18n.language.startsWith('ar') ? 'opacity-100 drop-shadow-md scale-110 ring-2 ring-blue-500 ring-offset-1' : 'opacity-40 hover:opacity-80'}`} 
              title="العربية"
            >
              <img src="https://flagcdn.com/sa.svg" alt="العربية" className="w-full h-full object-cover" />
            </button>
          </div>

          <div className="text-right rtl:text-left">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">{t('profile.physiotherapist', 'Physiotherapist')}</p>
          </div>
          <button 
            className="text-sm font-bold text-blue-600 hover:underline"
            onClick={() => navigateTo('AthleteProfile', { athleteId })}
          >
            {t('actions.viewPrevious', 'View Previous Sessions')}
          </button>
        </div>
      </header>

      {/* Progress Stepper - Step 3 Active[cite: 1] */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm">✓</span>
          {t('calibration.step1', '1. Connect Sensors').replace('1. ', '')}
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm">✓</span>
          {t('setup.title', 'Exercise Setup')}
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">3</span>
          {t('baseline.title', 'Baseline Assessment')}
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">4</span>
          {t('nav.liveTraining', 'Training Session')}
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">5</span>
          {t('nav.results', 'Results & Review')}
        </div>
      </div>

      <div className="mb-4 text-left rtl:text-right">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('baseline.title', 'Baseline Assessment')}</h1>
        <p className="text-sm text-slate-600">{t('baseline.subtitle', 'Record initial performance to generate individualized targets.')}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Prep & Execution */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* 1. Pain Assessment */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">{t('baseline.step1', '1. Pain Assessment (NPRS 0-10)')}</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase">{t('baseline.painBefore', 'Pain Before')}</span>
              <input 
                type="range" min="0" max="10" 
                value={painLevel} 
                onChange={(e) => setPainLevel(e.target.value)}
                className="flex-1 accent-blue-600" 
              />
              <span className="w-8 h-8 rounded bg-slate-100 text-slate-900 font-bold flex items-center justify-center">{painLevel}</span>
            </div>
            <textarea 
              value={painNotes}
              onChange={(e) => setPainNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm text-slate-700 resize-none text-left rtl:text-right" 
              rows="2" 
              placeholder={t('baseline.notesOptional', 'Notes (optional)')}
            ></textarea>
          </div>

          {/* 2. Warm-up */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-2">{t('baseline.step2', '2. Warm-up / Familiarization')}</h2>
            <p className="text-xs text-slate-600 mb-4 text-left rtl:text-right">{t('baseline.step2Desc', 'Allow the athlete to perform a few practice repetitions to get familiar with the movement.')}</p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
              {t('baseline.warmupCompleted', 'Warm-up completed')}
            </div>
          </div>

          {/* 3. Record Baseline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-slate-800 mb-2">{t('baseline.step3', '3. Record Baseline Repetitions')}</h2>
            <p className="text-xs text-slate-600 mb-4 text-left rtl:text-right">{t('baseline.step3Desc1', 'Record 5 steady repetitions at natural pace')} <strong className="text-red-500">{t('baseline.step3Desc2', '(no feedback)')}</strong>.</p>
            
            {!baselineComplete ? (
              <button 
                onClick={handleStartBaseline}
                disabled={isRecording}
                className={`w-full py-4 rounded-lg font-bold shadow-md transition-all text-lg ${
                  isRecording ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isRecording ? t('baseline.recording', 'Recording ({{count}}/5)...', { count: Math.min(recordedReps, 5) }) : t('baseline.start', 'Start Baseline (5 reps)')}
              </button>
            ) : (
              <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-emerald-600 font-bold text-lg mb-1 block">{t('baseline.recorded', 'Baseline Recorded')}</span>
                <button onClick={() => setBaselineComplete(false)} className="text-xs text-blue-600 hover:underline font-bold flex items-center justify-center gap-1 mx-auto">
                  <span>↻</span> {t('baseline.retake', 'Retake Baseline')}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live View, Quality, Analysis & Decision */}
        <div className={`col-span-8 flex flex-col gap-6 transition-opacity duration-500 ${baselineComplete ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          
          <div className="grid grid-cols-2 gap-6">
            {/* 4. Live Repetitions & Graph Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-800">{t('baseline.step4', '4. Live Repetitions')}</h2>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{t('baseline.repCount', 'Rep {{current}}/5', { current: recordedReps })}</span>
              </div>
              {/* Simulated Graph Area */}
              <div className="h-32 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-end">
                   {/* Mock wavy lines representing left/right force */}
                   <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                     <path d="M0,80 Q25,20 50,80 T100,80" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.8"/>
                     <path d="M0,85 Q25,30 50,85 T100,85" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4" opacity="0.8"/>
                   </svg>
                </div>
                <span className="text-slate-400 font-bold text-xs relative z-10 bg-white/80 px-2 py-1 rounded">{t('baseline.liveForceCurve', 'Live Force Curve Visualization')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">{t('baseline.weightDist', 'Weight Dist.')}</span>
                  <span className="font-bold text-slate-900" dir="ltr">
                    {t('baseline.left', 'L:')} {baselineMetrics ? baselineMetrics.liveLeft : '--'}% | {t('baseline.right', 'R:')} {baselineMetrics ? baselineMetrics.liveRight : '--'}%
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">{t('baseline.symmetry', 'Symmetry')}</span>
                  <span className="font-bold text-amber-600">{baselineMetrics ? baselineMetrics.symmetry : '--'}%</span>
                </div>
              </div>
            </div>

            {/* 5. Data Quality Check */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 mb-4">{t('baseline.step5', '5. Data Quality Check')}</h2>
              <ul className="space-y-3 mb-4">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span> {t('baseline.dq1', 'All 5 repetitions recorded')}
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span> {t('baseline.dq2', 'Good signal quality')}
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span> {t('baseline.dq3', 'Consistent movement pattern')}
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span> {t('baseline.dq4', 'Valid sensor data')}
                </li>
              </ul>
              <div className="mt-auto bg-emerald-50 text-emerald-800 text-sm font-bold p-3 rounded-lg border border-emerald-200">
                {t('baseline.dqStatus', 'Data quality: Good. Ready for analysis.')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 6. Baseline Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 mb-4">{t('baseline.step6', '6. Baseline Analysis')}</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">{t('baseline.ba1', 'Repetition consistency')}</span>
                  <span className="font-bold text-emerald-600">{t('baseline.ba1Status', 'Good (CV 6%)')}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">{t('baseline.ba2', 'Movement quality')}</span>
                  <span className="font-bold text-emerald-600">{t('baseline.good', 'Good')}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">{t('baseline.ba3', 'Left/right asymmetry')}</span>
                  <span className="font-bold text-amber-600">{t('baseline.moderate', 'Moderate')} ({baselineMetrics ? 100 - baselineMetrics.symmetry : '--'}%)</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">{t('baseline.ba4', 'Range of motion')}</span>
                  <span className="font-bold text-slate-700">{t('baseline.slightlyReduced', 'Slightly reduced')}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-600">{t('baseline.ba5', 'Pain behaviour')}</span>
                  <span className="font-bold text-emerald-600">{t('baseline.stable', 'Stable')}</span>
                </li>
              </ul>
            </div>

            {/* Target Proposal */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-sm font-bold text-blue-900 mb-4">{t('baseline.suggestedTargetTitle', 'RehabForce Suggested Target')}</h2>
              <ul className="space-y-3 text-sm mb-4">
                <li className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{t('baseline.weightDistribution', 'Weight Distribution')}</span>
                  {isModifyingTarget ? (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-300" dir="ltr">
                      <span className="text-blue-900 font-bold">{t('baseline.left', 'L:')}</span>
                      <input 
                        type="number" 
                        value={customLeftTarget} 
                        onChange={e => setCustomLeftTarget(Number(e.target.value))} 
                        className="w-12 text-center font-bold text-blue-900 bg-blue-50 rounded"
                        min="0" max="100"
                      />
                      <span className="text-blue-900 font-bold">% | {t('baseline.right', 'R:')} {100 - customLeftTarget}%</span>
                    </div>
                  ) : (
                    <span className="font-bold text-blue-900 bg-white px-2 py-1 rounded" dir="ltr">
                      {t('baseline.left', 'L:')} {customLeftTarget}% | {t('baseline.right', 'R:')} {100 - customLeftTarget}%
                    </span>
                  )}
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{t('baseline.movementSymmetry', 'Movement Symmetry')}</span>
                  <span className="font-bold text-blue-900 bg-white px-2 py-1 rounded" dir="ltr">≥ {baselineMetrics ? baselineMetrics.symmetry + 5 : '--'}%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{t('baseline.peakForce', 'Peak Force (BW)')}</span>
                  <span className="font-bold text-blue-900 bg-white px-2 py-1 rounded" dir="ltr">≥ {baselineMetrics ? (baselineMetrics.peakForce + 0.2).toFixed(1) : '--'} x</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-blue-800 font-medium">{t('setup.targetRom', 'Range of Motion')}</span>
                  <span className="font-bold text-blue-900 bg-white px-2 py-1 rounded" dir="ltr">≥ {baselineMetrics ? baselineMetrics.rom + 13 : '--'}°</span>
                </li>
              </ul>
              <p className="text-[10px] text-blue-700 leading-tight text-left rtl:text-right">{t('baseline.targetDisclaimer', 'Targets are individualized based on baseline performance, exercise, rehabilitation phase, data quality and clinical evidence. Clinician review and approval required.')}</p>
            </div>
          </div>

          {/* 7. Clinician Decision */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between mt-auto flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-1">{t('baseline.step7', '7. Clinician Decision')}</h2>
              <p className="text-xs text-slate-500">{t('baseline.step7Desc', 'Review the analysis and suggested targets. You can approve, modify or reject.')}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleClinicianDecision('REJECT')}
                className="px-6 py-3 rounded-lg font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {t('actions.reject', 'X Reject')}
              </button>
              <button 
                onClick={() => setIsModifyingTarget(!isModifyingTarget)}
                className={`px-6 py-3 rounded-lg font-bold transition-colors ${isModifyingTarget ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
              >
                {isModifyingTarget ? t('actions.saveTarget', 'Save Target') : t('actions.modifyTarget', 'Modify Target')}
              </button>
              <button 
                onClick={() => handleClinicianDecision('APPROVE')}
                className="px-6 py-3 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors"
              >
                {t('actions.approveContinue', '✓ Approve & Continue')}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}