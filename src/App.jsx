import React, { useState } from 'react';
import { Activity, LayoutDashboard, UserCircle, Target, Ruler, Zap, BarChart2, ClipboardCheck, Settings as SettingsIcon, LogOut, Terminal } from 'lucide-react';

// Real clinical screens
import Dashboard from './screens/Dashboard';
import AthleteProfile from './screens/AthleteProfile';
import ConnectCalibrate from './screens/ConnectCalibrate';
import ExerciseSetup from './screens/ExerciseSetup';
import BaselineAssessment from './screens/BaselineAssessment';
import LiveTraining from './screens/LiveTraining';
import SessionResults from './screens/SessionResults';
import RecommendationDecision from './screens/RecommendationDecision';
import Login from './screens/Login';
import Settings from './screens/Settings';
import HardwareDiagnostics from './screens/HardwareDiagnostics';

/**
 * Main Application Component for RehabForce
 * iPad-first design tailored for Clinician control.
 */
export default function App() {
  // MVP Security Gateway: Start at Login screen
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeAthleteId, setActiveAthleteId] = useState(null);
  const [activeClinicianId, setActiveClinicianId] = useState(null);
  
  // Hidden Developer State
  const [devTapCount, setDevTapCount] = useState(0);

  // Core router dispatcher for navigating the clinical workflow
  const navigateTo = (screen, context = {}) => {
    if (context.athleteId) {
      setActiveAthleteId(context.athleteId);
    }
    // Securely catch the authenticated clinician ID
    if (context.clinicianId) {
      setActiveClinicianId(context.clinicianId);
    }
    setCurrentScreen(screen);
  };

  // Render logic for the isolated clinical views
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <Login navigateTo={navigateTo} />;
      case 'Dashboard': 
        return <Dashboard navigateTo={navigateTo} clinicianId={activeClinicianId} />;
      case 'AthleteProfile': 
        return <AthleteProfile navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'ConnectCalibrate': 
        return <ConnectCalibrate navigateTo={navigateTo} />;
      case 'ExerciseSetup': 
        return <ExerciseSetup navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'BaselineAssessment': 
        return <BaselineAssessment navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'LiveTraining': 
        return <LiveTraining navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'SessionResults': 
        return <SessionResults navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'RecommendationDecision': 
        return <RecommendationDecision navigateTo={navigateTo} athleteId={activeAthleteId} />;
      case 'Settings': 
        return <Settings navigateTo={navigateTo} clinicianId={activeClinicianId} />;
      case 'HardwareDiagnostics':
        return <HardwareDiagnostics navigateTo={navigateTo} />;
      default: 
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  // ------------------------------------------------------------------
  // If we are on the Login screen, render it full-screen without the sidebar
  // ------------------------------------------------------------------
  if (currentScreen === 'Login') {
    return (
      <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
        <main className="flex-1 h-full relative flex items-center justify-center">
          {renderScreen()}
        </main>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Main Clinical Application Shell (Sidebar + Content Area)
  // ------------------------------------------------------------------
  return (
    <div className="flex h-screen w-screen bg-slate-900 font-sans overflow-hidden">
      
      {/* 
        CLINICIAN SIDEBAR NAVIGATION 
        Persistent left-hand navigation optimized for tablet landscape orientation
      */}
      <nav className="w-64 bg-[#0a1128] border-r border-slate-800 flex flex-col shrink-0 shadow-2xl z-50">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <img 
            src="/rehabforce-logo.png" 
            alt="RehabForce Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-[0_0_15px_rgba(0,229,255,0.3)]" 
          />
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">Rehab</span>
            <span className="text-[#00e5ff]">Force</span>
          </h1>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" target="Dashboard" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<UserCircle size={18} />} label="Athlete Profile" target="AthleteProfile" current={currentScreen} setScreen={navigateTo} />
          
          <div className="mt-4 mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Active Session</div>
          
          <NavItem icon={<Zap size={18} />} label="1. Calibrate" target="ConnectCalibrate" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<Target size={18} />} label="2. Setup" target="ExerciseSetup" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<Ruler size={18} />} label="3. Baseline" target="BaselineAssessment" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<Activity size={18} />} label="4. Live Training" target="LiveTraining" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<BarChart2 size={18} />} label="5. Results" target="SessionResults" current={currentScreen} setScreen={navigateTo} />
          <NavItem icon={<ClipboardCheck size={18} />} label="6. Decision" target="RecommendationDecision" current={currentScreen} setScreen={navigateTo} />
          
          <div className="mt-auto pt-4 border-t border-slate-800">
            <NavItem icon={<SettingsIcon size={18} />} label="Settings" target="Settings" current={currentScreen} setScreen={navigateTo} />
            <button
              onClick={() => navigateTo('Login')}
              className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut size={18} />
              Logout
            </button>
            
            {/* DEVELOPER DIAGNOSTICS (5-TAP TRIGGER) */}
            <button 
              onClick={() => {
                const newCount = devTapCount + 1;
                setDevTapCount(newCount);
                if (newCount >= 5) {
                  setCurrentScreen('HardwareDiagnostics');
                  setDevTapCount(0); // Reset after successful routing
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-3 mt-4 rounded-lg text-sm font-bold text-slate-500 bg-slate-800/40 hover:bg-slate-700 hover:text-slate-300 border border-slate-700/50 transition-all duration-200 select-none"
              title="Tap 5 times to access Hardware Telemetry"
            >
              <Terminal size={18} />
              Diagnostics
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative bg-slate-50 overflow-y-auto">
        {renderScreen()}
      </main>
      
    </div>
  );
}

// Reusable Sidebar Navigation Component
function NavItem({ icon, label, target, current, setScreen }) {
  const isActive = current === target;
  return (
    <button
      onClick={() => setScreen(target)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
        isActive 
          ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 shadow-[0_0_10px_rgba(0,229,255,0.05)]' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}