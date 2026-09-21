import React, { useState, useEffect } from 'react';
import { deviceAdapter } from '../adapters/MockDeviceAdapter';

export default function ConnectCalibrate({ navigateTo, athleteId }) {
  // Hardware connection states using the modular Device Adapter[cite: 1]
  const [isConnected, setIsConnected] = useState(deviceAdapter.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(deviceAdapter.isCalibrated);
  const [deviceState, setDeviceState] = useState(deviceAdapter.deviceState);

  const connectSensors = async () => {
    setIsConnecting(true);
    const response = await deviceAdapter.connect();
    if (response.success) {
      setIsConnected(true);
      setDeviceState(response.status);
    }
    setIsConnecting(false);
  };

  const disconnectSensors = async () => {
    await deviceAdapter.disconnect();
    setIsConnected(false);
    setIsCalibrated(false); // Disconnecting inherently invalidates calibration
  };

  // Auto-connect when entering the screen (simulating background BLE pairing)[cite: 1]
  useEffect(() => {
    if (!deviceAdapter.isConnected) {
      connectSensors();
    } else {
      setIsConnected(true);
      setDeviceState(deviceAdapter.deviceState);
    }
  }, []);

  const handleCalibration = async () => {
    setIsCalibrating(true);
    try {
      // Await the centralized calibration process[cite: 1]
      const success = await deviceAdapter.calibrate();
      if (success) {
        setIsCalibrated(true);
      }
    } catch (error) {
      console.error("Calibration failed:", error);
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-8 overflow-y-auto">
      {/* Clinician Navigation & Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigateTo('AthleteProfile', { athleteId })}
            className="text-blue-600 font-bold hover:underline mb-2 flex items-center gap-1 text-sm"
          >
            ← Back to Athlete Profile
          </button>
          <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Dashboard &gt; Athletes &gt; {athleteId || 'ATH-001'} &gt; Connect & Calibrate
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Dr. Papadopoulos</p>
            <p className="text-xs text-slate-500">Physiotherapist</p>
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm">1</span>
          Connect Sensors
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className={`flex items-center gap-2 font-bold ${isCalibrated ? 'text-emerald-700' : 'text-slate-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isCalibrated ? 'bg-emerald-100' : 'bg-slate-100'}`}>2</span>
          Calibrate
        </div>
        <div className="h-px bg-slate-300 flex-1 mx-4"></div>
        <div className="flex items-center gap-2 text-slate-500 font-bold">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
          Verify & Check
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Device Connection */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4">1. Connect Sensors</h2>
            <p className="text-sm text-slate-600 mb-6">Ensure both insoles are connected and ready.</p>
            
            {/* Left Insole Card */}
            <div className={`border p-4 rounded-lg mb-4 transition-colors ${isConnected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded text-white flex items-center justify-center font-bold ${isConnected ? 'bg-blue-600' : 'bg-slate-400'}`}>L</div>
                  <div>
                    <h3 className={`font-bold ${isConnected ? 'text-blue-900' : 'text-slate-700'}`}>Left Insole</h3>
                    <p className={`text-xs ${isConnected ? 'text-blue-700' : 'text-slate-500'}`}>
                      {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isConnected ? `${deviceState.leftBattery}%` : '--'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">ID: L-7F3A</p>
                </div>
              </div>
              <div className={`mt-3 pt-3 flex justify-between items-center text-xs border-t ${isConnected ? 'border-blue-100' : 'border-slate-200'}`}>
                <span className="text-slate-600">Signal: <strong className={isConnected ? 'text-emerald-600' : 'text-slate-400'}>{isConnected ? deviceState.signalQuality : 'N/A'}</strong></span>
                {isConnected ? (
                  <button onClick={disconnectSensors} className="text-red-500 hover:underline font-semibold">
                    Disconnect
                  </button>
                ) : (
                  <button onClick={connectSensors} disabled={isConnecting} className="text-blue-600 hover:underline font-semibold">
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {/* Right Insole Card */}
            <div className={`border p-4 rounded-lg transition-colors ${isConnected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded text-white flex items-center justify-center font-bold ${isConnected ? 'bg-blue-600' : 'bg-slate-400'}`}>R</div>
                  <div>
                    <h3 className={`font-bold ${isConnected ? 'text-blue-900' : 'text-slate-700'}`}>Right Insole</h3>
                    <p className={`text-xs ${isConnected ? 'text-blue-700' : 'text-slate-500'}`}>
                      {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isConnected ? `${deviceState.rightBattery}%` : '--'}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">ID: R-9K2D</p>
                </div>
              </div>
              <div className={`mt-3 pt-3 flex justify-between items-center text-xs border-t ${isConnected ? 'border-blue-100' : 'border-slate-200'}`}>
                <span className="text-slate-600">Signal: <strong className={isConnected ? 'text-emerald-600' : 'text-slate-400'}>{isConnected ? deviceState.signalQuality : 'N/A'}</strong></span>
                {isConnected ? (
                  <button onClick={disconnectSensors} className="text-red-500 hover:underline font-semibold">
                    Disconnect
                  </button>
                ) : (
                  <button onClick={connectSensors} disabled={isConnecting} className="text-blue-600 hover:underline font-semibold">
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Calibration Process */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col items-center text-center justify-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2 w-full text-left">2. Calibrate Sensors</h2>
            <p className="text-sm text-slate-600 mb-8 w-full text-left">Stand still for 5 seconds in a neutral position (equal weight on both legs).</p>

            {/* Simulated Live Weight Distribution */}
            <div className="flex justify-between w-full max-w-sm mb-2 text-sm font-bold text-slate-700">
              <span>Left 50%</span>
              <span>Right 50%</span>
            </div>
            <div className="w-full max-w-sm h-12 flex rounded-lg overflow-hidden mb-8 bg-slate-100 border border-slate-300">
              <div className={`h-full transition-all duration-500 ${isCalibrated ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: '50%' }}></div>
              <div className={`h-full transition-all duration-500 ${isCalibrated ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: '50%' }}></div>
            </div>

            <button 
              onClick={handleCalibration}
              disabled={!isConnected || isCalibrating || isCalibrated}
              className={`px-8 py-3 rounded-lg font-bold shadow-md transition-all ${
                !isConnected ? 'bg-slate-200 text-slate-500 cursor-not-allowed' :
                isCalibrating ? 'bg-amber-500 text-white' : 
                isCalibrated ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {!isConnected ? 'Connecting Sensors...' : isCalibrating ? 'Calibrating...' : isCalibrated ? 'Calibration Complete' : 'Start Calibration'}
            </button>

            {isCalibrated && (
              <button 
                onClick={() => {
                  deviceAdapter.isCalibrated = false;
                  setIsCalibrated(false);
                }} 
                className="mt-4 text-xs font-bold text-blue-600 hover:underline"
              >
                ↻ Recalibrate
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Verification & Proceed */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-4">3. Verify & Check</h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                Both sensors connected
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                Battery &gt; 20%
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
                Good signal quality
              </li>
              <li className={`flex items-center gap-3 text-sm transition-colors ${isCalibrated ? 'text-slate-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded flex items-center justify-center font-bold ${isCalibrated ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  {isCalibrated ? '✓' : '○'}
                </span>
                Static calibration
              </li>
            </ul>

            {isCalibrated && (
              <div className="mt-auto">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-4 text-sm text-emerald-800">
                  <strong>Calibration Successful.</strong><br/>
                  Sensors are ready for use.
                </div>
                <button 
                  onClick={() => navigateTo('ExerciseSetup', { athleteId })}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  Continue to Exercise Setup →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}