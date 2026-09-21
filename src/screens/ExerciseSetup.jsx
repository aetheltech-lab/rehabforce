import React, { useState, useEffect } from 'react';

export default function ExerciseSetup({ navigateTo, athleteId }) {
  // Controlled state for all UI parameters[cite: 1]
  const [selectedExercise, setSelectedExercise] = useState('Bilateral Squat');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [painLimit, setPainLimit] = useState(4);
  const [feedbackFocus, setFeedbackFocus] = useState({
    weightDist: true,
    symmetry: true,
    tempo: true,
    rom: false,
    other: false
  });

  // Persist draft setup across screen navigation so checkboxes don't reset
  useEffect(() => {
    const draft = localStorage.getItem(`draft_setup_${athleteId}`);
    if (draft) {
      const parsed = JSON.parse(draft);
      setSelectedExercise(parsed.selectedExercise || 'Bilateral Squat');
      setPainLimit(parsed.painLimit || 4);
      setFeedbackFocus(parsed.feedbackFocus || { weightDist: true, symmetry: true, tempo: true, rom: false, other: false });
    }
  }, [athleteId]);

  useEffect(() => {
    localStorage.setItem(`draft_setup_${athleteId}`, JSON.stringify({
      selectedExercise, painLimit, feedbackFocus
    }));
  }, [selectedExercise, painLimit, feedbackFocus, athleteId]);
  
  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('ConnectCalibrate', { athleteId })}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to Connect Sensors
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Dashboard &gt; Athletes &gt; {athleteId || 'ATH-001'} &gt; Exercise Setup
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">Physiotherapist</p>
          </div>
          <button 
            className="text-sm font-bold text-blue-600 hover:underline"
            onClick={() => navigateTo('AthleteProfile', { athleteId })}
          >
            View Recent Sessions
          </button>
        </div>
      </header>

      {/* Progress Stepper - Step 2 Active[cite: 1] */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 text-emerald-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm">✓</span>
          Connect Sensors
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">2</span>
          Exercise Setup
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
          Baseline Assessment
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">4</span>
          Training Session
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">5</span>
          Results & Review
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Select Exercise & Preview */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Select Exercise</h2>
            <p className="text-xs text-slate-500 mb-4">Choose the exercise and set the parameters.</p>
            
            <div className="space-y-2">
              {['Bilateral Squat', 'Sit-to-Stand', 'Calf Raise', 'Step-Up'].map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors ${
                    selectedExercise === exercise 
                      ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                      : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {selectedExercise === exercise && <span className="mr-2 text-blue-600">✓</span>}
                  {exercise}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800">Exercise Preview</h2>
              <button 
                onClick={() => setIsInstructionsOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Instructions
              </button>
            </div>
            {/* Interactive video placeholder simulating embedded media playback */}
            <div className="w-full h-32 bg-slate-800 rounded-lg flex flex-col items-center justify-center mb-4 border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors relative overflow-hidden">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
              </div>
              <span className="text-slate-300 text-xs font-bold">Play {selectedExercise} Demo</span>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Points</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-slate-700"><span className="text-emerald-500 font-bold">✓</span> Feet shoulder width</li>
              <li className="flex items-center gap-2 text-xs text-slate-700"><span className="text-emerald-500 font-bold">✓</span> Keep neutral spine</li>
              <li className="flex items-center gap-2 text-xs text-slate-700"><span className="text-emerald-500 font-bold">✓</span> Knees aligned with toes</li>
              <li className="flex items-center gap-2 text-xs text-slate-700"><span className="text-emerald-500 font-bold">✓</span> Controlled movement</li>
              <li className="flex items-center gap-2 text-xs text-slate-700"><span className="text-emerald-500 font-bold">✓</span> Full range (as tolerated)</li>
            </ul>
          </div>
        </div>

        {/* Middle Column: Exercise Parameters */}
        <div className="col-span-5 flex flex-col">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Exercise Parameters</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sets x Reps</label>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={3} className="w-16 p-2 border border-slate-300 rounded font-bold text-slate-900 text-center" />
                  <span className="font-bold text-slate-400">X</span>
                  <input type="number" defaultValue={10} className="w-16 p-2 border border-slate-300 rounded font-bold text-slate-900 text-center" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Load Type</label>
                <select className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 bg-white">
                  <option>Body Weight</option>
                  <option>External Resistance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">External Load (kg)</label>
                <input type="text" placeholder="e.g. Vest/Other" className="w-full p-2 border border-slate-300 rounded font-medium text-slate-900" disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hand Position</label>
                <select className="w-full p-2 border border-slate-300 rounded font-medium text-slate-900 bg-white">
                  <option>Hands on hips</option>
                  <option>Crossed on chest</option>
                  <option>Free</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tempo (ecc - pause - conc - pause)</label>
                <input type="text" defaultValue="3-1-3-1" className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900 text-center tracking-widest" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rest Between Sets (sec)</label>
                <input type="number" defaultValue={60} className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900" />
              </div>
            </div>

            <div className="mb-6 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pain Limit During Exercise (NPRS 0-10)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={painLimit}
                  onChange={(e) => setPainLimit(Number(e.target.value))}
                  className="flex-1 accent-blue-600" 
                />
                <span className="w-8 h-8 rounded bg-blue-100 text-blue-900 font-bold flex items-center justify-center">{painLimit}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Additional Notes (optional)</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded font-medium text-slate-900 text-sm resize-none" 
                rows="3"
                defaultValue="focus on depth and control"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Focus & Action */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Feedback Focus</h2>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={feedbackFocus.weightDist} onChange={(e) => setFeedbackFocus({...feedbackFocus, weightDist: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-bold text-slate-700 text-sm">Weight distribution (L/R)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={feedbackFocus.symmetry} onChange={(e) => setFeedbackFocus({...feedbackFocus, symmetry: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-bold text-slate-700 text-sm">Movement symmetry</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={feedbackFocus.tempo} onChange={(e) => setFeedbackFocus({...feedbackFocus, tempo: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-bold text-slate-700 text-sm">Tempo control</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={feedbackFocus.rom} onChange={(e) => setFeedbackFocus({...feedbackFocus, rom: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-bold text-slate-700 text-sm">Range of motion</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={feedbackFocus.other} onChange={(e) => setFeedbackFocus({...feedbackFocus, other: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="font-bold text-slate-700 text-sm">Other</span>
              </label>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-t border-slate-100 pt-4">
              Target Metrics (will be set after baseline)
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-600">Weight Distribution L/R%</span>
                <span className="font-bold text-slate-400 italic">Target: -</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-600">Movement Symmetry</span>
                <span className="font-bold text-slate-400 italic">Target: -</span>
              </li>
              <li className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-600">Tempo</span>
                <span className="font-bold text-slate-400 italic">Target: -</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Range of Motion</span>
                <span className="font-bold text-slate-400 italic">Target: -</span>
              </li>
            </ul>
          </div>

          {/* Action Area */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mt-auto">
            <h3 className="font-bold text-blue-900 mb-2">Next Step</h3>
            <p className="text-xs text-blue-800 mb-4">Press "Start Baseline" to record 5 baseline repetitions and generate individualized targets.</p>
            <button 
              onClick={() => navigateTo('BaselineAssessment', { athleteId })}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors text-lg"
            >
              Start Baseline →
            </button>
          </div>
        </div>

      </div>

      {/* Instructions Modal Overlay */}
      {isInstructionsOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">{selectedExercise} Instructions</h2>
            <p className="text-sm text-slate-600 mb-6 border-b border-slate-100 pb-4">
              Ensure the athlete understands the movement criteria. The application will track compliance based on these technical points.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                <span className="text-sm text-slate-800 font-medium">Start from a neutral standing position with feet shoulder-width apart.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                <span className="text-sm text-slate-800 font-medium">Perform the movement maintaining a neutral spine and avoiding valgus knee collapse.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                <span className="text-sm text-slate-800 font-medium">Follow the prescribed tempo exactly to ensure accurate target measurement.</span>
              </li>
            </ul>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={() => setIsInstructionsOpen(false)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}