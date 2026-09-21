import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export default function Login({ navigateTo }) {
  const [clinicians, setClinicians] = useState([]);
  const [selectedClinicianId, setSelectedClinicianId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Physiotherapist');
  const [newPin, setNewPin] = useState('');

  const loadClinicians = () => {
    const loadedClinicians = storageService.getClinicians();
    setClinicians(loadedClinicians);
    if (loadedClinicians.length > 0) {
      setSelectedClinicianId(loadedClinicians[0].id);
    }
  };

  // Fetch the registered clinicians from local storage[cite: 1]
  useEffect(() => {
    loadClinicians();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Authenticate against the dynamic local storage registry[cite: 1]
    const authenticatedUser = storageService.authenticateClinician(pin);
    
    // Verify the PIN belongs to the specific clinician selected in the dropdown
    if (authenticatedUser && authenticatedUser.id === selectedClinicianId) {
      setError('');
      // Pass the secure clinician ID into the main app router state
      navigateTo('Dashboard', { clinicianId: authenticatedUser.id });
    } else {
      setError('Invalid PIN for the selected clinician. Please try again.');
      setPin('');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4) {
      setError('Please provide a valid name and a 4-digit PIN.');
      return;
    }
    
    // Save the new clinician to the persistence layer[cite: 1]
    const newClinician = storageService.saveClinician({
      name: newName.trim(),
      role: newRole,
      pin: newPin
    });

    if (newClinician) {
      loadClinicians();
      setSelectedClinicianId(newClinician.id);
      setIsRegistering(false);
      setPin('');
      setNewName('');
      setNewPin('');
      setError('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        
        {/* App Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">REHABFORCE</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-semibold">Measure. Guide. Progress.</p>
        </div>

        {/* Clinician Selection & Form */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Clinician</label>
              <select 
                className="w-full p-4 border border-slate-300 rounded-lg font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                value={selectedClinicianId}
                onChange={(e) => setSelectedClinicianId(e.target.value)}
              >
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    {clinician.name} ({clinician.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter PIN</label>
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength="4"
                className={`w-full p-4 border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} rounded-lg font-bold text-center text-2xl tracking-[1em] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {error && <p className="text-xs font-bold text-red-500 mt-2 text-center">{error}</p>}
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-lg shadow-md transition-colors"
            >
              Access Dashboard
            </button>

            <button 
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className="text-sm font-bold text-blue-600 hover:underline mt-2 text-center"
            >
              + Register New Clinician
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Dr. Alexopoulos"
                className="w-full p-4 border border-slate-300 rounded-lg font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-lg font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Athletic Trainer">Athletic Trainer</option>
                <option value="S&C Coach">S&C Coach</option>
                <option value="Orthopaedic Surgeon">Orthopaedic Surgeon</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Create 4-Digit PIN</label>
              <input 
                type="password" 
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                maxLength="4"
                className={`w-full p-4 border ${error ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-slate-50'} rounded-lg font-bold text-center text-2xl tracking-[1em] text-slate-900 focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {error && <p className="text-xs font-bold text-red-500 mt-2 text-center">{error}</p>}
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-lg shadow-md transition-colors"
            >
              Create Account
            </button>
            <button 
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 mt-2 text-center"
            >
              Cancel
            </button>
          </form>
        )}

        {/* System Status Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">System Status: Local Persistence Active</p>
          <p className="text-[10px] text-slate-400 mt-1">RehabForce MVP v1.0.0</p>
        </div>

      </div>
    </div>
  );
}