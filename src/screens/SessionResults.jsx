import React from 'react';

export default function SessionResults({ navigateTo, athleteId }) {
  // Simulated session data for Phase 1 UI validation[cite: 1]
  const reps = [
    { id: 1, left: 52, right: 48, valid: true, tempo: 'Good' },
    { id: 2, left: 55, right: 45, valid: false, tempo: 'Fast' },
    { id: 3, left: 51, right: 49, valid: true, tempo: 'Good' },
    { id: 4, left: 48, right: 52, valid: true, tempo: 'Good' },
    { id: 5, left: 50, right: 50, valid: true, tempo: 'Good' },
    { id: 6, left: 53, right: 47, valid: true, tempo: 'Good' },
    { id: 7, left: 56, right: 44, valid: false, tempo: 'Slow' },
    { id: 8, left: 54, right: 46, valid: true, tempo: 'Good' },
    { id: 9, left: 51, right: 49, valid: true, tempo: 'Good' },
    { id: 10, left: 49, right: 51, valid: true, tempo: 'Good' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('LiveTraining', { athleteId })}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to Live Training
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Dashboard &gt; Athletes &gt; {athleteId || 'ATH-001'} &gt; Session Results
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

      {/* Session Context Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Bilateral Squat</h1>
          <p className="text-sm text-slate-600 mt-1">Session Date: Tue 12 Sep 2026 09:12 • Set 1 of 3</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="block text-slate-500 font-bold uppercase text-[10px]">Load Type</span>
            <span className="font-bold text-slate-900">Body Weight</span>
          </div>
          <div>
            <span className="block text-slate-500 font-bold uppercase text-[10px]">Sets x Reps</span>
            <span className="font-bold text-slate-900">3 x 10</span>
          </div>
          <div>
            <span className="block text-slate-500 font-bold uppercase text-[10px]">Tempo</span>
            <span className="font-bold text-slate-900">3-1-3-1</span>
          </div>
          <div>
            <span className="block text-slate-500 font-bold uppercase text-[10px]">Rest</span>
            <span className="font-bold text-slate-900">60 sec</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Reps</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">10</span>
            <span className="text-lg font-bold text-slate-400">/ 10</span>
          </div>
          <p className="text-xs font-bold text-emerald-600 mt-2">100% Completed</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Target Compliance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-600">80%</span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-2">8/10 Within target range</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Movement Consistency</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">Good</span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-2">(Lower variability)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tempo Compliance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">Good</span>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-2">(Target: 3-1-3-1)</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Left Column: Graphs & Data */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* L vs R Graph Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Left vs Right Load Distribution</h2>
            <div className="h-48 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center relative">
              <span className="text-slate-400 font-bold text-sm">Load Distribution Chart (L/R % across 10 reps)</span>
              {/* Mock visual lines */}
              <svg className="w-full h-full absolute inset-0 opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,52 L10,55 L20,51 L30,48 L40,50 L50,53 L60,56 L70,54 L80,51 L90,49 L100,50" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                <path d="M0,48 L10,45 L20,49 L30,52 L40,50 L50,47 L60,44 L70,46 L80,49 L90,51 L100,50" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4"/>
              </svg>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Left</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Right</span>
            </div>
          </div>

          {/* Rep by Rep Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Rep by Rep Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Rep</th>
                    <th className="pb-2 font-semibold">Left Load (%)</th>
                    <th className="pb-2 font-semibold">Right Load (%)</th>
                    <th className="pb-2 font-semibold">Within Target</th>
                    <th className="pb-2 font-semibold">Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reps.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="py-2 font-bold text-slate-900">{rep.id}</td>
                      <td className="py-2 text-slate-700">{rep.left}</td>
                      <td className="py-2 text-slate-700">{rep.right}</td>
                      <td className="py-2">
                        {rep.valid ? (
                          <span className="text-emerald-500 font-bold">✓</span>
                        ) : (
                          <span className="text-red-500 font-bold">✗</span>
                        )}
                      </td>
                      <td className="py-2 text-slate-700">{rep.tempo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Pain, Phase, Notes */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Pain Tracking */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Pain (NPRS 0-10)</h2>
            <div className="flex justify-between items-center text-center">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Pre</span>
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <div className="h-px bg-slate-200 w-8"></div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">During</span>
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
              <div className="h-px bg-slate-200 w-8"></div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Post</span>
                <span className="text-xl font-bold text-emerald-600">2</span>
              </div>
            </div>
          </div>

          {/* Phase Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Phase Analysis (Average)</h2>
            <p className="text-xs text-slate-500 mb-4">Target Range (±10%)</p>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Eccentric</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">88%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Bottom Hold</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">90%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">Concentric</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">82%</span>
              </li>
            </ul>
          </div>

          {/* Key Takeaways */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-blue-900 mb-4">Key Takeaways</h2>
            <ul className="space-y-2 mb-6 flex-1">
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-600 font-bold">✓</span> Completed all planned repetitions
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-600 font-bold">✓</span> Good movement symmetry
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-blue-600 font-bold">✓</span> Tempo well controlled
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="text-amber-600 font-bold">•</span> Mild left side overload in 1 rep
              </li>
            </ul>
            <button 
              onClick={() => navigateTo('RecommendationDecision', { athleteId })}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              Generate Recommendation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}