import React, { useState } from 'react';
import Dashboard from './screens/Dashboard';
import AthleteProfile from './screens/AthleteProfile';
import ConnectCalibrate from './screens/ConnectCalibrate';
import ExerciseSetup from './screens/ExerciseSetup';
import BaselineAssessment from './screens/BaselineAssessment';
import LiveTraining from './screens/LiveTraining';
import SessionResults from './screens/SessionResults';
import RecommendationDecision from './screens/RecommendationDecision';
import Login from './screens/Login';

// Phase 1 UI scaffolding complete[cite: 1]

/**
 * Main Application Component for RehabForce
 * iPad-first design tailored for Clinician control[cite: 1].
 */
export default function App() {
  // MVP Security Gateway: Start at Login screen[cite: 1]
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [activeAthleteId, setActiveAthleteId] = useState(null);
  const [activeClinicianId, setActiveClinicianId] = useState(null);

  // Core router dispatcher for navigating the clinical workflow
  const navigateTo = (screen, context = {}) => {
    if (context.athleteId) {
      setActiveAthleteId(context.athleteId);
    }
    // Securely catch the authenticated clinician ID[cite: 1]
    if (context.clinicianId) {
      setActiveClinicianId(context.clinicianId);
    }
    setCurrentScreen(screen);
  };

  // Render logic for the isolated clinical views[cite: 1]
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
      default: 
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <main className="flex-1 h-full relative flex items-center justify-center">
        {renderScreen()}
      </main>
    </div>
  );
}