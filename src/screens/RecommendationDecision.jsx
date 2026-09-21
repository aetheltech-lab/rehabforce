import React, { useState } from 'react';
import { storageService } from '../services/storageService';

export default function RecommendationDecision({ navigateTo, athleteId }) {
  const [clinicianNote, setClinicianNote] = useState('');

  const handleSessionComplete = (decision) => {
    // Construct the finalized session payload for the audit and history logs[cite: 1]
    const sessionPayload = {
      athleteId: athleteId || 'ATH-001',
      exercise: 'Bilateral Squat',
      compliance: 90, // Derived from the session's overall target compliance
      painPre: 2,
      painPost: 2,
      recommendation: 'Progress to 3 x 10 @ +10 kg',
      clinicianDecision: decision,
      notes: clinicianNote
    };
    
    // Save to device persistence layer
    storageService.saveSession(sessionPayload);
    
    // Return to dashboard after successful save
    navigateTo('Dashboard');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('SessionResults', { athleteId })}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to Session Results
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Dashboard &gt; Athletes &gt; {athleteId || 'ATH-001'} &gt; RehabForce Recommendation
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">Physiotherapist</p>
          </div>
          <button 
            onClick={() => navigateTo('AthleteProfile', { athleteId })}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            View Athlete Profile
          </button>
        </div>
      </header>

      {/* Warning / Context Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-extrabold text-blue-900 mb-2">RehabForce Recommendation</h1>
        <p className="text-sm text-blue-800 font-medium">
          System-supported progression based on objective data and clinical rules. Clinician review and decision required. 
          <strong className="block mt-1">This is a recommendation, not an automated decision. You remain in full control of the rehabilitation plan.</strong>
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Left Column: Criteria & Trends */}
        <div className="col-span-7 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200">
            <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Recommended Progression</h2>
            <p className="text-xl font-extrabold text-slate-900">Progress to next stage</p>
            <p className="text-sm text-slate-600">All key criteria are met for progression.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Key Criteria for Progression</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-600">Consecutive successful sessions</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">3/3</span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-600">Target compliance</span>
                <span className="font-bold text-slate-900">≥ 85% <span className="text-slate-400 font-normal">(avg 90%)</span></span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-600">Movement symmetry</span>
                <span className="font-bold text-slate-900">≥ 90% <span className="text-slate-400 font-normal">(avg 88%)</span></span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-600">Variability (consistency)</span>
                <span className="font-bold text-emerald-600">Good <span className="text-slate-400 font-normal">(CV 7%)</span></span>
              </li>
              <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-600">Tempo compliance</span>
                <span className="font-bold text-emerald-600">Good <span className="text-slate-400 font-normal">(92%)</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600">Pain response</span>
                <span className="font-bold text-emerald-600">Stable <span className="text-slate-400 font-normal">(≤ 2)</span></span>
              </li>
            </ul>
          </div>

          {/* Simulated Trend Graph */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Recent Session Trend</h2>
            <div className="h-40 bg-slate-50 border border-slate-200 rounded-lg relative overflow-hidden flex items-end">
              <svg className="w-full h-full absolute inset-0 opacity-70" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,70 L25,50 L50,40 L75,20 L100,10" fill="none" stroke="#10b981" strokeWidth="3"/>
                <path d="M0,80 L25,60 L50,55 L75,30 L100,20" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-xs bg-white/80 px-2 py-1 rounded">Trend Visualization (Weeks 6-10)</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs font-bold text-slate-500 justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Target compliance</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Movement symmetry</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Prescription & Actions */}
        <div className="col-span-5 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Prescription Change</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current</span>
                <p className="font-bold text-slate-900 text-sm">Bilateral Squat</p>
                <p className="text-sm text-slate-600">3 x 10 @ BW</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Recommended</span>
                <p className="font-bold text-blue-900 text-sm">Bilateral Squat</p>
                <p className="text-sm text-blue-800 font-bold">3 x 10 @ +10 kg</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Criteria met BW only</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Current load tolerance Excellent</li>
              <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">•</span> Next phase: Strength & Load Progression</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Additional Considerations</h2>
            <ul className="text-xs text-slate-600 space-y-2 mb-4">
              <li>• No compensatory patterns detected</li>
              <li>• Left/Right difference within acceptable range</li>
              <li>• Monitor slight left side overload (1 rep)</li>
              <li>• Athlete reports good confidence</li>
            </ul>
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clinician Notes (optional)</label>
              <textarea 
                value={clinicianNote}
                onChange={(e) => setClinicianNote(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded font-medium text-slate-900 text-sm resize-none" 
                rows="2"
                placeholder="e.g. good control, ready to increase load"
              ></textarea>
            </div>
          </div>

          {/* Clinician Decision Box */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg mt-auto text-white">
            <h2 className="text-sm font-bold mb-1">Clinician Decision</h2>
            <p className="text-xs text-slate-400 mb-6">Review the recommendation and choose an option. This will be saved in the athlete's record.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleSessionComplete('APPROVED')}
                className="w-full py-3 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-colors text-left px-4 flex justify-between items-center"
              >
                <span>✓ Approve</span>
                <span className="text-xs font-normal text-emerald-100">Apply progression</span>
              </button>
              <button 
                onClick={() => handleSessionComplete('MODIFIED')}
                className="w-full py-3 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors text-left px-4 flex justify-between items-center"
              >
                <span>Modify</span>
                <span className="text-xs font-normal text-slate-400">Adjust parameters</span>
              </button>
              <button 
                onClick={() => handleSessionComplete('REJECTED')}
                className="w-full py-3 rounded-lg font-bold bg-red-900 hover:bg-red-800 text-white transition-colors text-left px-4 flex justify-between items-center border border-red-700"
              >
                <span>X Reject</span>
                <span className="text-xs font-normal text-red-300">Keep current plan</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}