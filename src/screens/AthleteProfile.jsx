import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export default function AthleteProfile({ navigateTo, athleteId }) {
  const [athlete, setAthlete] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Load the specific athlete from local storage[cite: 1]
    const targetId = athleteId || 'ATH-001';
    const allAthletes = storageService.getAthletes();
    const foundAthlete = allAthletes.find(a => a.id === targetId);
    
    setAthlete(foundAthlete || allAthletes[0]); // Fallback to first if not found
    
    // Dynamically load real session history for this specific athlete[cite: 1]
    setSessions(storageService.getSessionsByAthlete(targetId));
  }, [athleteId]);

  // Prevent rendering before the data is loaded
  if (!athlete) return <div className="p-8 text-slate-500 font-bold">Loading profile...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('Dashboard')}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to Athletes
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Dashboard &gt; Athletes &gt; Athlete Profile
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">Physiotherapist</p>
          </div>
          <button 
            onClick={() => navigateTo('ConnectCalibrate')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-colors"
          >
            + Start Session
          </button>
        </div>
      </header>

      {/* Top Banner: Athlete Identity & State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-4">
            {athlete.name} 
            <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{athlete.id}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-medium">Age: {athlete.age} • Sport: {athlete.sport} • Position: {athlete.position}</p>
          <p className="text-sm text-slate-500 italic mt-3 border-l-4 border-blue-500 pl-3">"{athlete.quote}"</p>
        </div>
        <div className="text-right">
          <span className="bg-amber-100 text-amber-800 text-sm font-extrabold px-4 py-2 rounded-lg uppercase tracking-wider">
            {athlete.state} - Week {athlete.week}
          </span>
          <p className="text-lg font-bold text-slate-800 mt-3">{athlete.region} ({athlete.side})</p>
          <p className="text-sm text-slate-600">{athlete.diagnosis}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Context, Pain & Program */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Target & Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Target & Clinician Notes</h3>
            <p className="text-sm font-bold text-slate-900 mb-1">Return to Sport: 12-16 weeks</p>
            <p className="text-sm text-slate-600 mb-4">Good progress. Focus on symmetry and load tolerance.</p>
            
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 border-t border-slate-100 pt-4">Pain (NPRS 0-10)</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">Current (Rest):</span>
              <span className="text-lg font-bold text-emerald-600">{athlete.painRest}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-700 font-medium">Worst (7 days):</span>
              <span className="text-lg font-bold text-amber-600">{athlete.painWorst}</span>
            </div>
          </div>

          {/* Current Exercise Programme */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Programme</h3>
              <button 
                onClick={() => navigateTo('ExerciseSetup', { athleteId: athlete.id })}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Bilateral Squat</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">3 x 10</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Sit-to-Stand</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">3 x 10</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Calf Raise</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">3 x 12</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800">Step-Up (R)</span>
                <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">3 x 10</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Progress, Sensors & History */}
        <div className="col-span-8 flex flex-col gap-6">
          
          {/* Recent Progress Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Strength Symmetry</p>
              <p className="text-2xl font-extrabold text-slate-900">92%</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">↑ +8% (vs. last week)</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Target Compliance</p>
              <p className="text-2xl font-extrabold text-slate-900">87%</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">↑ +12%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pain Trend</p>
              <p className="text-2xl font-extrabold text-emerald-600">Low</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">↓ -50% (vs. start)</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Session Consistency</p>
              <p className="text-2xl font-extrabold text-slate-900">Good</p>
              <p className="text-xs text-slate-500 font-bold mt-1">Last 5 sessions</p>
            </div>
          </div>

          {/* Session History & Sensors */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Session History Table */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Session History</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Exercise</th>
                    <th className="pb-2 font-semibold">Compliance</th>
                    <th className="pb-2 font-semibold">Pain</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {sessions.length > 0 ? (
                    sessions.map((session) => {
                      const dateObj = new Date(session.timestamp);
                      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
                      
                      return (
                        <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 text-slate-600">{formattedDate}</td>
                          <td className="py-3 font-bold text-slate-800">{session.exercise || 'Bilateral Squat'}</td>
                          <td className="py-3 font-semibold text-emerald-600">{session.compliance || '--'}%</td>
                          <td className="py-3 text-slate-600">{session.painPre || '--'} → {session.painPost || '--'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-slate-500 italic font-medium">
                        No sessions recorded yet. Start a new session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sensor / Device Status */}
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sensor Status</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">Manage</button>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Left Insole</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 100%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Connected</p>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">Right Insole</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 100%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Connected</p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-2">
                <p className="text-xs text-slate-500 flex justify-between"><span className="font-semibold">Last Calib:</span> 8 Sep 2026</p>
                <p className="text-xs text-slate-500 flex justify-between mt-1"><span className="font-semibold">Data Quality:</span> <span className="text-emerald-600">Good</span></p>
              </div>
            </div>
            
          </div>
          
          {/* Recommendation Banner */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">Today's Recommendation</h4>
              <p className="text-sm text-blue-800">Continue current programme. Good progress. Focus on movement quality and symmetry.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}