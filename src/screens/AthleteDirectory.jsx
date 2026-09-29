import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { useTranslation } from 'react-i18next';
import { Search, Edit, Trash2, UserPlus, AlertTriangle, ChevronDown, Check, X } from 'lucide-react';

const DIAGNOSIS_OPTIONS = {
  Knee: [
    'ACL Injury / Reconstruction', 'PCL Injury / Reconstruction', 'MCL Injury', 'LCL Injury',
    'Meniscal Injury / Repair', 'Patellofemoral Pain', 'Patellar Tendinopathy', 'Knee Osteoarthritis',
    'Chondral / Osteochondral Injury', 'Post-operative Knee', 'Knee Sprain', 'Other / Custom Diagnosis'
  ],
  Hip: [
    'Hip Osteoarthritis', 'Femoroacetabular Impingement (FAI)', 'Hip Labral Injury', 'Gluteal Tendinopathy',
    'Greater Trochanteric Pain Syndrome', 'Adductor Injury', 'Hip Flexor Injury', 'Hamstring Injury',
    'Post-operative Hip', 'Hip Sprain / Strain', 'Other / Custom Diagnosis'
  ],
  Ankle: [
    'Lateral Ankle Sprain', 'Medial Ankle Sprain', 'Syndesmosis / High Ankle Sprain', 'Achilles Tendinopathy',
    'Achilles Tendon Rupture / Repair', 'Ankle Instability', 'Ankle Osteoarthritis', 'Ankle Fracture / Post-operative',
    'Anterior Ankle Impingement', 'Posterior Ankle Impingement', 'Other / Custom Diagnosis'
  ],
  Foot: [
    'Plantar Fasciopathy', 'Metatarsalgia', 'Stress Fracture / Bone Stress Injury', 'Metatarsal Fracture',
    'Lisfranc Injury', 'Hallux Valgus', 'Hallux Rigidus', 'Posterior Tibial Tendon Dysfunction',
    'Peroneal Tendinopathy', 'Midfoot / Forefoot Injury', 'Post-operative Foot', 'Other / Custom Diagnosis'
  ]
};

const DiagnosisSelector = ({ region, value, onChange, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const options = DIAGNOSIS_OPTIONS[region] || [];
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedItems = value ? value.split(', ').filter(Boolean) : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItem = (item) => {
    const newItems = selectedItems.includes(item) 
      ? selectedItems.filter(i => i !== item) 
      : [...selectedItems, item];
    onChange(newItems.join(', '));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full p-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white flex justify-between items-center cursor-pointer min-h-[46px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 pr-2">
          {selectedItems.length > 0 ? (
            selectedItems.map((item, idx) => (
              <span key={idx} className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                {t(`diagnosis.${item.replace(/[^a-zA-Z0-9]/g, '')}`, item)}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item);
                  }}
                  className="hover:bg-cyan-200 hover:text-cyan-900 text-cyan-600 rounded-full cursor-pointer transition-colors"
                  title={t('actions.remove', 'Remove')}
                >
                  <X size={12} strokeWidth={3} />
                </div>
              </span>
            ))
          ) : (
            <span className="text-slate-400 p-1">{t('dashboard.selectDiagnosis', 'Select diagnosis...')}</span>
          )}
        </div>
        <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-cyan-500"
              placeholder={t('dashboard.searchDiagnosis', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-slate-500 text-center">{t('dashboard.noOptions', 'No options found')}</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedItems.includes(opt);
                return (
                  <div
                    key={opt}
                    className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer rounded text-sm ${isSelected ? 'font-bold text-cyan-700 bg-cyan-50' : 'font-medium text-slate-700'}`}
                    onClick={(e) => { e.stopPropagation(); toggleItem(opt); }}
                  >
                    <span className="truncate">{t(`diagnosis.${opt.replace(/[^a-zA-Z0-9]/g, '')}`, opt)}</span>
                    {isSelected && <Check size={16} className="text-cyan-600 flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AthleteDirectory({ navigateTo, clinicianId }) {
  const { t } = useTranslation();
  const [athletes, setAthletes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Tab states
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('existing'); // 'existing' or 'new'
  const [selectedExistingAthleteId, setSelectedExistingAthleteId] = useState('');
  const [latestSessionsMap, setLatestSessionsMap] = useState({});
  
  const [editingAthlete, setEditingAthlete] = useState({
    id: '', name: '', age: '', sport: '', position: '', region: 'Knee', side: 'Right (R)', diagnosis: '', customDiagnosis: '', state: 'REHAB', compliance: 100
  });

  const [newAthlete, setNewAthlete] = useState({
    name: '', age: '', sport: '', position: '', region: 'Knee', side: 'Right (R)', diagnosis: '', customDiagnosis: '', state: 'REHAB', week: 1
  });

  const loadDirectory = () => {
    const clinicianAthletes = storageService.getAthletesByClinician(clinicianId);
    setAthletes(clinicianAthletes);

    // Dynamically fetch the latest session data for every patient in the roster
    const allSessions = JSON.parse(localStorage.getItem('rehabforce_sessions') || '[]');
    const sessionMap = {};
    clinicianAthletes.forEach(athlete => {
      const athleteSessions = allSessions
        .filter(s => s.athleteId === athlete.id)
        .sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
      if (athleteSessions.length > 0) {
        sessionMap[athlete.id] = athleteSessions[0];
      }
    });
    setLatestSessionsMap(sessionMap);
  };

  useEffect(() => {
    loadDirectory();
  }, [clinicianId]);

  const handleEditClick = (athlete) => {
    setEditingAthlete(athlete);
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingAthlete.name.trim()) return;

    // storageService.saveAthlete typically upserts based on ID
    storageService.saveAthlete(editingAthlete);
    setIsEditing(false);
    loadDirectory();
  };

  const handleStartExistingSession = (e) => {
    e.preventDefault();
    if (!selectedExistingAthleteId) return;
    setIsSessionModalOpen(false);
    navigateTo('ConnectCalibrate', { athleteId: selectedExistingAthleteId });
  };

  const handleCreateAndStartSession = (e) => {
    e.preventDefault();
    if (!newAthlete.name.trim()) return;

    // Generate a secure patient ID to bind all future sessions
    const generatedAthleteId = `ATH-${Date.now().toString().slice(-4)}`;

    storageService.saveAthlete({
      ...newAthlete,
      id: generatedAthleteId,
      clinicianId: clinicianId,
      painRest: 0,
      painWorst: 0,
      compliance: 100,
      quote: "Ready to begin rehabilitation.",
      flag: "New Admission"
    });

    setIsSessionModalOpen(false);
    setNewAthlete({ name: '', age: '', sport: '', position: '', region: 'Knee', side: 'Right (R)', diagnosis: '', state: 'REHAB', week: 1 });
    loadDirectory();
    
    // Immediately route the newly created patient to Calibration
    navigateTo('ConnectCalibrate', { athleteId: generatedAthleteId });
  };

  const confirmDelete = (id) => {
    // 1. Optimistic UI Update: Instantly remove the patient from the screen
    setAthletes(prevAthletes => prevAthletes.filter(a => a.id !== id));

    // 2. Delete the Athlete Profile
    if (typeof storageService.deleteAthlete === 'function') {
      storageService.deleteAthlete(id);
    } else {
      const allAthletes = JSON.parse(localStorage.getItem('rehabforce_athletes') || '[]');
      const filteredAthletes = allAthletes.filter(a => a.id !== id);
      localStorage.setItem('rehabforce_athletes', JSON.stringify(filteredAthletes));
    }
    
    // 3. Cascading Delete: Purge all session data linked to this Athlete ID
    const allSessions = JSON.parse(localStorage.getItem('rehabforce_sessions') || '[]');
    const filteredSessions = allSessions.filter(s => s.athleteId !== id);
    localStorage.setItem('rehabforce_sessions', JSON.stringify(filteredSessions));
    
    setIsDeleting(null);
    // We explicitly DO NOT call loadDirectory() here to prevent memory cache overrides.
  };

  // Filter by search term
  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 relative overflow-y-auto">
      
      {/* Header section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('nav.directory', 'Patient Directory')}</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">{t('directory.subtitle', 'Manage active and past patient records')}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (athletes.length === 0) {
                setModalTab('new');
              } else {
                setModalTab('existing');
                if (!selectedExistingAthleteId) setSelectedExistingAthleteId(athletes[0].id);
              }
              setIsSessionModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            {t('actions.startSession', '+ Start Session')}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('directory.search', 'Search patients...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:border-cyan-500 w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
              <th className="p-4 font-bold">{t('dashboard.athlete', 'Athlete')}</th>
              <th className="p-4 font-bold">{t('dashboard.diagnosis', 'Diagnosis')}</th>
              <th className="p-4 font-bold">{t('directory.state', 'Clinical State')}</th>
              <th className="p-4 font-bold text-center">{t('dashboard.compliance', 'Latest Compliance')}</th>
              <th className="p-4 font-bold text-right rtl:text-left">{t('dashboard.action', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-semibold bg-slate-50">
                  {t('directory.noResults', 'No patients found matching your search.')}
                </td>
              </tr>
            ) : (
              filteredAthletes.map((athlete) => {
                // Dynamically fetch the compliance of their most recent session
                const latestSession = latestSessionsMap[athlete.id];
                const displayCompliance = latestSession ? latestSession.compliance : athlete.compliance;

                return (
                  <tr key={athlete.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{athlete.name}</div>
                      <div className="text-xs font-mono text-slate-400 mt-1">{athlete.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-700">{athlete.diagnosis}</div>
                      <div className="text-xs text-slate-500 mt-1">{t(`dashboard.${athlete.region.toLowerCase()}`, athlete.region)} ({t(`dashboard.${athlete.side === 'Right (R)' ? 'right' : 'left'}`, athlete.side)})</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-md ${
                        athlete.state === 'REHAB' ? 'bg-amber-100 text-amber-800' : 
                        athlete.state === 'RTS' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {athlete.state}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-sm ${displayCompliance >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {displayCompliance || '--'}%
                      </span>
                    </td>
                    <td className="p-4 text-right rtl:text-left flex justify-end gap-2">
                      <button 
                        onClick={() => navigateTo('ConnectCalibrate', { athleteId: athlete.id })}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded transition-colors"
                      >
                        {t('actions.startSession', 'Start Session')}
                      </button>
                      <button 
                        onClick={() => navigateTo('AthleteProfile', { athleteId: athlete.id })}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded transition-colors"
                      >
                        {t('dashboard.review', 'Review')}
                      </button>
                      <button 
                        onClick={() => handleEditClick(athlete)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title={t('directory.edit', 'Edit Profile')}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setIsDeleting(athlete.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t('directory.delete', 'Delete Patient')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Start Session / Patient Initialization Modal Overlay */}
      {isSessionModalOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{t('actions.startSession', 'Start Session')}</h2>
            
            {/* Modal Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setModalTab('existing')}
                className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${modalTab === 'existing' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Select Existing Patient
              </button>
              <button 
                onClick={() => setModalTab('new')}
                className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${modalTab === 'new' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Register New Patient
              </button>
            </div>

            {/* Tab 1: Existing Athlete */}
            {modalTab === 'existing' && (
              <form onSubmit={handleStartExistingSession} className="flex flex-col gap-6">
                {athletes.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 font-semibold bg-slate-50 rounded-lg border border-slate-200">
                    No existing patients found. Please register a new patient.
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Patient Record</label>
                    <select 
                      className="w-full p-4 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-cyan-500 shadow-sm"
                      value={selectedExistingAthleteId}
                      onChange={(e) => setSelectedExistingAthleteId(e.target.value)}
                    >
                      {athletes.map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.name} | {athlete.diagnosis} | {athlete.state}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsSessionModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    {t('dashboard.cancel', 'Cancel')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={athletes.length === 0}
                    className="px-8 py-3 bg-cyan-600 disabled:bg-slate-300 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-md transition-colors"
                  >
                    Start Session
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Register New Athlete */}
            {modalTab === 'new' && (
              <form onSubmit={handleCreateAndStartSession} className="grid grid-cols-2 gap-6 rtl:text-right">
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.fullName', 'Full Name')}</label>
                  <input required type="text" value={newAthlete.name} onChange={e => setNewAthlete({...newAthlete, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. John Doe" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.age', 'Age')}</label>
                  <input required type="number" value={newAthlete.age} onChange={e => setNewAthlete({...newAthlete, age: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. 28" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.sport', 'Sport')}</label>
                  <input type="text" value={newAthlete.sport} onChange={e => setNewAthlete({...newAthlete, sport: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. Basketball" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.position', 'Position')}</label>
                  <input type="text" value={newAthlete.position} onChange={e => setNewAthlete({...newAthlete, position: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" placeholder="e.g. Point Guard" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.regionSide', 'Region & Side')}</label>
                  <div className="flex gap-2">
                    <select value={newAthlete.region} onChange={e => setNewAthlete({...newAthlete, region: e.target.value, diagnosis: ''})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                      <option value="Knee">{t('dashboard.knee', 'Knee')}</option>
                      <option value="Hip">{t('dashboard.hip', 'Hip')}</option>
                      <option value="Ankle">{t('dashboard.ankle', 'Ankle')}</option>
                      <option value="Foot">{t('dashboard.foot', 'Foot')}</option>
                    </select>
                    <select value={newAthlete.side} onChange={e => setNewAthlete({...newAthlete, side: e.target.value})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                      <option value="Right (R)">{t('dashboard.right', 'Right (R)')}</option>
                      <option value="Left (L)">{t('dashboard.left', 'Left (L)')}</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.diagnosis', 'Diagnosis')}</label>
                  <DiagnosisSelector 
                    region={newAthlete.region} 
                    value={newAthlete.diagnosis} 
                    onChange={(val) => setNewAthlete({...newAthlete, diagnosis: val})} 
                    t={t} 
                  />
                </div>

                {/* Conditional Custom Diagnosis Input */}
                {newAthlete.diagnosis.includes('Other / Custom Diagnosis') && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.customDiagnosis', 'Custom Diagnosis')}</label>
                    <input 
                      required 
                      type="text" 
                      value={newAthlete.customDiagnosis} 
                      onChange={e => setNewAthlete({...newAthlete, customDiagnosis: e.target.value})} 
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold focus:border-cyan-500 focus:outline-none bg-amber-50" 
                      placeholder={t('dashboard.enterCustom', 'Please describe the custom diagnosis...')} 
                    />
                  </div>
                )}

                <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setIsSessionModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    {t('dashboard.cancel', 'Cancel')}
                  </button>
                  <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors">
                    Register & Start Session
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Athlete Modal Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{t('directory.editTitle', 'Edit Patient Profile')}</h2>
            
            <form onSubmit={handleSaveEdit} className="grid grid-cols-2 gap-6 rtl:text-right">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.fullName', 'Full Name')}</label>
                <input required type="text" value={editingAthlete.name} onChange={e => setEditingAthlete({...editingAthlete, name: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.age', 'Age')}</label>
                <input required type="number" value={editingAthlete.age} onChange={e => setEditingAthlete({...editingAthlete, age: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.sport', 'Sport')}</label>
                <input type="text" value={editingAthlete.sport} onChange={e => setEditingAthlete({...editingAthlete, sport: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold" />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('directory.state', 'Clinical State')}</label>
                <select value={editingAthlete.state} onChange={e => setEditingAthlete({...editingAthlete, state: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                  <option value="REHAB">REHAB</option>
                  <option value="RTS">RETURN TO SPORT (RTS)</option>
                  <option value="PERFORMANCE">PERFORMANCE</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.regionSide', 'Region & Side')}</label>
                <div className="flex gap-2">
                  <select value={editingAthlete.region} onChange={e => setEditingAthlete({...editingAthlete, region: e.target.value, diagnosis: ''})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                    <option value="Knee">{t('dashboard.knee', 'Knee')}</option>
                    <option value="Hip">{t('dashboard.hip', 'Hip')}</option>
                    <option value="Ankle">{t('dashboard.ankle', 'Ankle')}</option>
                    <option value="Foot">{t('dashboard.foot', 'Foot')}</option>
                  </select>
                  <select value={editingAthlete.side} onChange={e => setEditingAthlete({...editingAthlete, side: e.target.value})} className="w-1/2 p-3 border border-slate-300 rounded-lg text-sm font-semibold bg-white">
                    <option value="Right (R)">{t('dashboard.right', 'Right (R)')}</option>
                    <option value="Left (L)">{t('dashboard.left', 'Left (L)')}</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.diagnosis', 'Diagnosis')}</label>
                <DiagnosisSelector 
                  region={editingAthlete.region} 
                  value={editingAthlete.diagnosis} 
                  onChange={(val) => setEditingAthlete({...editingAthlete, diagnosis: val})} 
                  t={t} 
                />
              </div>

              {/* Conditional Custom Diagnosis Input */}
              {editingAthlete.diagnosis.includes('Other / Custom Diagnosis') && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('dashboard.customDiagnosis', 'Custom Diagnosis')}</label>
                  <input 
                    required 
                    type="text" 
                    value={editingAthlete.customDiagnosis} 
                    onChange={e => setEditingAthlete({...editingAthlete, customDiagnosis: e.target.value})} 
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm font-semibold focus:border-cyan-500 focus:outline-none bg-amber-50" 
                    placeholder={t('dashboard.enterCustom', 'Please describe the custom diagnosis...')} 
                  />
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  {t('dashboard.cancel', 'Cancel')}
                </button>
                <button type="submit" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-md transition-colors">
                  {t('directory.saveChanges', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Strict Permanent Deletion) */}
      {isDeleting && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">{t('directory.deleteConfirmTitle', 'Delete Patient Record?')}</h2>
            <p className="text-sm text-slate-500 mb-8">{t('directory.deleteConfirmText', 'This action will permanently remove the patient and all associated session data. This cannot be undone.')}</p>
            
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsDeleting(null)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                {t('dashboard.cancel', 'Cancel')}
              </button>
              <button onClick={() => confirmDelete(isDeleting)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors">
                {t('directory.confirmDelete', 'Yes, Delete Patient')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}