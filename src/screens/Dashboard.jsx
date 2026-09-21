import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export default function Dashboard({ navigateTo, clinicianId }) {
  const [athletes, setAthletes] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [activeClinician, setActiveClinician] = useState({ name: 'Loading...', role: '', initials: '?' });
  
  // State for the "+ New Athlete" modal form
  const [isAddingAthlete, setIsAddingAthlete] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: '', age: '', sport: '', position: '', region: 'Knee', side: 'Right (R)', diagnosis: '', state: 'REHAB', week: 1
  });

  const loadDashboardData = () => {
    // 1. Load the specific clinician's identity for the header
    const allClinicians = storageService.getClinicians();
    const clinician = allClinicians.find(c => c.id === clinicianId) || allClinicians[0];
    
    const initials = clinician.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
      
    setActiveClinician({ ...clinician, initials });

    // 2. Strictly filter the athlete roster so clinicians only see their own patients
    const clinicianAthletes = storageService.getAthletesByClinician(clinicianId);
    setAthletes(clinicianAthletes);

    // 3. Fetch the recent sessions belonging only to these athletes
    setRecentSessions(storageService.getRecentSessionsByClinician(clinicianId));
  };

  useEffect(() => {
    loadDashboardData();
  }, [clinicianId]);

  const handleCreateAthlete = (e) => {
    e.preventDefault();
    if (!newAthlete.name.trim()) return;

    // Save the new athlete directly to this clinician's ID
    storageService.saveAthlete({
      ...newAthlete,
      clinicianId: clinicianId,
      painRest: 0,
      painWorst: 0,
      compliance: 100, // Starts at 100% until first session
      quote: "Ready to begin rehabilitation.",
      flag: "New Admission"
    });

    // Close modal, reset form, and refresh the roster
    setIsAddingAthlete(false);
    setNewAthlete({ name: '', age: '', sport: '', position: '', region: 'Knee', side: 'Right (R)', diagnosis: '', state: 'REHAB', week: 1 });
    loadDashboardData();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 p-8 relative">
      
      {/* Clinician Header - Now dynamically driven by the login identity */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">REHABFORCE</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-semibold">Measure. Guide. Progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{activeClinician.name}</p>
            <p className="text-xs text-slate-500">{activeClinician.role}</p>
          </div>
          <div className="h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
            {activeClinician.initials}
          </div>
          <button 
            onClick={() => navigateTo('Login')}
            className="ml-4 text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        
        {/* Left Column: Active Athletes */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Active Athletes</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{athletes.length} Total</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {athletes.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 text-sm font-semibold">
                  No athletes assigned to your roster yet. Click below to add one.
                </div>
              ) : (
                athletes.map((athlete) => (
                  <div 
                    key={athlete.id} 
                    onClick={() => navigateTo('AthleteProfile', { athleteId: athlete.id })}
                    className="p-4 border border-slate-100 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{athlete.name}</h3>
                      <span className="text-xs font-mono text-slate-400">{athlete.id}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">{athlete.region} ({athlete.side}) {athlete.diagnosis}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        athlete.state === 'REHAB' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {athlete.state}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">Compliance: {athlete.compliance}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setIsAddingAthlete(true)}
              className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
            >
              + New Athlete
            </button>
          </div>
        </div>

        {/* Right Column: Alerts & Recent Sessions */}
        <div className="col-span-8 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              Clinical Attention
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <p className="text-xs font-bold text-blue-800 mb-1">System Notice</p>
                <p className="text-sm font-semibold text-slate-900">End-to-End Data Pipeline Active</p>
                <p className="text-xs text-slate-600 mt-1">Sessions are successfully persisting to local storage.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Recent Sessions</h2>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-800">View All</button>
            </div>
            
            {recentSessions.length === 0 ? (
              <div className="text-center p-8 text-slate-500 text-sm font-medium border border-dashed border-slate-200 rounded-lg bg-slate-50">
                No recent sessions found. Complete a training session to see data here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Athlete</th>
                      <th className="pb-3 font-semibold">Exercise</th>
                      <th className="pb-3 font-semibold">Compliance</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {recentSessions.slice(0, 5).map((session) => {
                      // Match the session's athlete ID to the full athlete object to display their name
                      const athlete = athletes.find(a => a.id === session.athleteId);
                      const dateObj = new Date(session.timestamp);
                      const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString('default', { month: 'short' })}`;
                      
                      return (
                        <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 text-slate-600">{formattedDate}</td>
                          <td className="py-4 font-bold text-slate-900">{athlete ? athlete.name : session.athleteId}</td>
                          <td className="py-4 text-slate-700">{session.exercise || 'Bilateral Squat'}</td>
                          <td className="py-4">
                            <span className={`font-bold ${session.compliance >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {session.compliance || '--'}%
                            </span>
                          </td>
                          <td className="py-4">
                            <button 
                              className="text-blue-600 font-bold hover:underline" 
                              onClick={() => navigateTo('AthleteProfile', { athleteId: session.athleteId })}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Athlete Modal Overlay */}
      {isAddingAthlete && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Register New Athlete</h2>
            
            <form onSubmit={handleCreateAthlete} className="grid grid-cols-2 gap-6">
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                <input required type="text" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. John Doe" />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Age</label>
                <input required type="number" value={newAthlete.age} onChange={e => setNewAthlete({...newAthlete, age: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. 28" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sport</label>
                <input type="text" value={newAthlete.sport} onChange={e => setNewAthlete({...newAthlete, sport: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. Basketball" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Position</label>
                <input type="text" value={newAthlete.position} onChange={e => setNewAthlete({...newAthlete, position: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. Point Guard" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Region & Side</label>
                <div className="flex gap-2">
                  <select value={newAthlete.region} onChange={e => setNewAthlete({...newAthlete, region: e.target.value})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                    <option value="Knee">Knee</option>
                    <option value="Ankle">Ankle</option>
                    <option value="Hip">Hip</option>
                  </select>
                  <select value={newAthlete.side} onChange={e => setNewAthlete({...newAthlete, side: e.target.value})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                    <option value="Right (R)">Right (R)</option>
                    <option value="Left (L)">Left (L)</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Diagnosis</label>
                <input required type="text" value={newAthlete.diagnosis} onChange={e => setNewAthlete({...newAthlete, diagnosis: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. ACL Reconstruction" />
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddingAthlete(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors">
                  Save Athlete
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}