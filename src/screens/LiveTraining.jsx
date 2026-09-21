import React, { useState, useEffect } from 'react';
import { deviceAdapter } from '../adapters/MockDeviceAdapter';

export default function LiveTraining({ navigateTo, athleteId }) {
  // Phase 1: UI Simulation State
  const [isAthleteView, setIsAthleteView] = useState(false);
  const [repCount, setRepCount] = useState(0); // Start at 0
  const [liveLeft, setLiveLeft] = useState(52);
  const [liveRight, setLiveRight] = useState(48);
  const [painLevel, setPainLevel] = useState(2);
  const [activeGraph, setActiveGraph] = useState('load');

  // Integrate the modular Device Adapter for <=100ms real-time simulated BLE streaming[cite: 1]
  useEffect(() => {
    let isMounted = true;
    let samples = 0;

    const initializeStream = async () => {
      // Ensure connection is established before streaming
      if (!deviceAdapter.isConnected) {
        await deviceAdapter.connect();
      }
      
      if (isMounted) {
        deviceAdapter.startStream((data) => {
          // Update state using the normalized RehabForce schema data[cite: 1]
          setLiveLeft(data.leftLoadPct);
          setLiveRight(data.rightLoadPct);
          
          // Simulate live rep progression (1 rep every ~3 seconds)
          samples++;
          if (samples % 30 === 0) {
            setRepCount(prev => (prev < 10 ? prev + 1 : 10));
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
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-hidden">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Dashboard &gt; Athletes &gt; {athleteId || 'ATH-001'} &gt; Live Training
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAthleteView ? 'Athlete Live View' : 'Clinician Live View'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAthleteView(!isAthleteView)}
            className="px-6 py-3 rounded-lg font-bold bg-white border border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            {isAthleteView ? 'Switch to Clinician View' : 'Switch to Athlete View'}
          </button>
          <button 
            onClick={() => navigateTo('SessionResults', { athleteId })}
            className="px-6 py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
          >
            End Session
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* ATHLETE VIEW (Simple & Clear)[cite: 1] */}
        {isAthleteView ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Bilateral Squat</h2>
            <p className="text-xl text-slate-500 font-bold mb-12">Set 1 of 3</p>
            
            <div className="flex w-full max-w-4xl gap-8 mb-16 items-end justify-center h-64">
              {/* Left Bar */}
              <div className="flex flex-col items-center gap-4 w-1/3">
                <span className="text-4xl font-extrabold text-slate-900">{liveLeft}%</span>
                <div className="w-full bg-slate-100 h-64 rounded-xl flex items-end overflow-hidden relative border border-slate-200">
                  <div 
                    className="w-full bg-blue-500 transition-all duration-300 rounded-b-xl" 
                    style={{ height: `${liveLeft}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">Left</span>
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
                <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">Right</span>
              </div>
            </div>

            {/* Rep Counter & Active Cue */}
            <div className="w-full max-w-4xl flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 p-8 rounded-2xl shadow-lg">
              <div>
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest block mb-2">Primary Cue</span>
                <span className="text-4xl font-extrabold text-emerald-700">Good rep! Keep your weight evenly distributed.</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest block mb-1">Completed</span>
                <span className="text-6xl font-extrabold text-emerald-700">{repCount}<span className="text-3xl text-emerald-600/50">/10</span></span>
              </div>
            </div>
          </div>
        ) : (
          
          /* CLINICIAN VIEW (Detailed Data)[cite: 1] */
          <div className="absolute inset-0 flex flex-col gap-6 overflow-y-auto pb-8">
            
            {/* Top Row: Core Metrics */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Load Distribution</span>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">{liveLeft}% L | {liveRight}% R</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">Target: 50/50 ±10%</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Movement Symmetry</span>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-emerald-600">92%</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">Target: ≥ 90%</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Tempo (s)</span>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">3.0 - 1.0 - 3.0</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">Ecc - Pause - Conc</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Peak Force (BW)</span>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">1.6 x</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">Target: 1.4 - 1.8</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Ground Contact Time</span>
                <div className="mt-2">
                  <span className="text-2xl font-extrabold text-slate-900">0.8 s</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">Target: 0.6 - 1.0</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Live Graphs & Rep Progress */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-[300px]">
              {/* Graphs Section */}
              <div className="col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-slate-800">Real-time Graphs</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveGraph('load')}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${activeGraph === 'load' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      Load Distribution
                    </button>
                    <button 
                      onClick={() => setActiveGraph('force')}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition-colors ${activeGraph === 'force' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      Force
                    </button>
                    <button 
                      onClick={() => alert('Graph expansion will map to the external clinician monitor view in Phase 2.')}
                      className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1 rounded border border-slate-900 hover:bg-slate-700 ml-2"
                    >
                      ⛶ Expand
                    </button>
                  </div>
                </div>
                
                {/* Simulated Waveform Visualization */}
                <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden flex items-end pb-4">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <span className="text-xl font-extrabold text-slate-400">Live Data Stream (Phase 1 Mock)</span>
                  </div>
                  <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                     {/* Simulating moving curves */}
                     <path d="M0,90 Q10,20 20,90 T40,90 T60,90 T80,90 T100,90" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                     <path d="M0,90 Q12,25 22,90 T42,90 T62,90 T82,90 T100,90" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4"/>
                  </svg>
                  <div className="absolute bottom-2 left-4 flex gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Left</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Right</span>
                  </div>
                </div>
              </div>

              {/* Set Progress & Pain */}
              <div className="col-span-4 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-800">Set Progress</h2>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">Set 1/3</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-2">
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
                <p className="text-xs font-bold text-slate-400 text-right mt-2">{repCount} of 10 Reps</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col justify-center">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Pain During Exercise (NPRS 0-10)</h2>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="10" 
                    value={painLevel} 
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="flex-1 accent-amber-500" 
                  />
                  <span className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg">{painLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Feedback Priority Queue */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800">Feedback Queue (Priority Order)</h2>
              <button 
                onClick={() => alert('Feedback priority queue drag-and-drop will be unlocked when the clinical rules engine is finalized in Phase 2.')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Adjust Feedback Priority
              </button>
            </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Active Cue</p>
                    <p className="text-sm font-bold text-slate-900">Weight distribution (L/R)</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-4 opacity-70">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Next Priority</p>
                    <p className="text-sm font-bold text-slate-700">Knee alignment</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-4 opacity-50">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pending</p>
                    <p className="text-sm font-bold text-slate-700">Trunk control</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}