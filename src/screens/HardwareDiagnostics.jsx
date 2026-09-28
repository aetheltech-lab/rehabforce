import React, { useState, useEffect, useRef } from 'react';
import { deviceAdapter } from '../adapters/MockDeviceAdapter';
import { Terminal, Activity, Zap, ShieldAlert, Cpu, Clock, Power, RefreshCw, Wifi } from 'lucide-react';

export default function HardwareDiagnostics({ navigateTo }) {
  const [payload, setPayload] = useState(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initDiagnostics = async () => {
      // Connect if not already connected
      if (!deviceAdapter.isConnected) {
        await deviceAdapter.connect();
      }
      
      // Tap into the high-frequency diagnostic stream
      if (isMounted) {
        deviceAdapter.startStream((data) => {
          setPayload(data);
        });
      }
    };

    initDiagnostics();

    return () => {
      isMounted = false;
      deviceAdapter.stopStream();
    };
  }, []);

  // Keep the diagnostic log auto-scrolled to the bottom (newest entries)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // The log is unshifted (newest at index 0)
    }
  }, [payload?.diagnostics?.log]);

  if (!payload) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xl animate-pulse">
        Establishing Hardware Telemetry Link...
      </div>
    );
  }

  const { diagnostics, dataQuality, syncStatus, leftConnected, rightConnected } = payload;
  const isCalibrated = deviceAdapter.isCalibrated;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-300 font-mono p-6 overflow-hidden">
      
      {/* Diagnostics Header */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-widest">HARDWARE TELEMETRY & DIAGNOSTICS</h1>
            <p className="text-xs text-slate-500 uppercase">Phase 1 Moticon OpenGo SDK Simulator</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => deviceAdapter.calibrate()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded border border-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Force Calibration
          </button>
          <button 
            onClick={() => navigateTo('Dashboard')}
            className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-xs font-bold rounded border border-red-800 transition-colors"
          >
            CLOSE DIAGNOSTICS
          </button>
        </div>
      </header>

      {/* Main Telemetry Grid */}
      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        
        {/* Left Column: Live Metrics */}
        <div className="col-span-8 flex flex-col gap-4">
          
          {/* Top Row: Core Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded border ${dataQuality === 'VALID' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : dataQuality === 'INVALID' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-amber-950/30 border-amber-900/50 text-amber-400'}`}>
              <div className="flex items-center gap-2 mb-2 opacity-80"><ShieldAlert size={14} /> OVERALL DATA QUALITY</div>
              <div className="text-2xl font-bold">{dataQuality}</div>
            </div>
            <div className={`p-4 rounded border ${syncStatus === 'SYNCED' ? 'bg-slate-900 border-slate-800' : 'bg-amber-950/30 border-amber-900/50 text-amber-400'}`}>
              <div className="flex items-center gap-2 mb-2 opacity-80 text-slate-400"><Clock size={14} /> L/R SYNC STATUS</div>
              <div className="text-xl font-bold">{syncStatus}</div>
              <div className="text-xs mt-1">Skew: {diagnostics.syncSkewMs} ms</div>
            </div>
            <div className={`p-4 rounded border ${isCalibrated ? 'bg-slate-900 border-slate-800' : 'bg-amber-950/30 border-amber-900/50 text-amber-400'}`}>
              <div className="flex items-center gap-2 mb-2 opacity-80 text-slate-400"><RefreshCw size={14} /> CALIBRATION</div>
              <div className="text-xl font-bold">{isCalibrated ? 'ZEROED' : 'PENDING'}</div>
            </div>
          </div>

          {/* Middle Row: BLE & Throughput */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4 text-slate-400"><Power size={14} /> CONNECTION STATUS</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Left Sensor</div>
                  <div className={`text-xl font-bold ${leftConnected ? 'text-emerald-500' : 'text-red-500'}`}>{leftConnected ? 'CONNECTED' : 'DROPPED'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Right Sensor</div>
                  <div className={`text-xl font-bold ${rightConnected ? 'text-emerald-500' : 'text-red-500'}`}>{rightConnected ? 'CONNECTED' : 'DROPPED'}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4 text-slate-400"><Activity size={14} /> SAMPLING RATE (Hz)</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Left Stream</div>
                  <div className={`text-2xl font-bold ${diagnostics.leftHz >= 50 ? 'text-cyan-400' : 'text-amber-500'}`}>{diagnostics.leftHz} <span className="text-sm">Hz</span></div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Right Stream</div>
                  <div className={`text-2xl font-bold ${diagnostics.rightHz >= 50 ? 'text-cyan-400' : 'text-amber-500'}`}>{diagnostics.rightHz} <span className="text-sm">Hz</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Latency & Errors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-400"><Zap size={14} /> LATENCY (E2E)</div>
              <div className={`text-2xl font-bold ${diagnostics.latencyMs <= 100 ? 'text-cyan-400' : diagnostics.latencyMs <= 150 ? 'text-amber-400' : 'text-red-500'}`}>
                {diagnostics.latencyMs} <span className="text-sm">ms</span>
              </div>
            </div>
            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-400"><Cpu size={14} /> DATA AGE (STALE)</div>
              <div className={`text-2xl font-bold ${diagnostics.dataAgeMs > 100 ? 'text-red-500' : 'text-white'}`}>
                {diagnostics.dataAgeMs} <span className="text-sm">ms</span>
              </div>
            </div>
            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-400"><Wifi size={14} /> DROPPED PACKETS</div>
              <div className={`text-2xl font-bold ${diagnostics.droppedPackets > 0 ? 'text-red-500' : 'text-white'}`}>
                {diagnostics.droppedPackets}
              </div>
            </div>
          </div>
          
          {/* Active Testing Controls */}
          <div className="mt-auto p-4 rounded bg-slate-950 border border-slate-800">
             <div className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Inject Hardware Failure</div>
             <div className="flex gap-2">
                <button onClick={() => deviceAdapter.triggerSimulationEvent('NONE')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] rounded">RESET</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('LEFT_DISCONNECT')} className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 text-[10px] rounded border border-red-900/50">DROP L</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('RIGHT_DISCONNECT')} className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-200 text-[10px] rounded border border-red-900/50">DROP R</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('SYNC_ERROR')} className="px-3 py-1 bg-amber-900/50 hover:bg-amber-900 text-amber-200 text-[10px] rounded border border-amber-900/50">SYNC SKEW</button>
                <button onClick={() => deviceAdapter.triggerSimulationEvent('STALE_DATA')} className="px-3 py-1 bg-amber-900/50 hover:bg-amber-900 text-amber-200 text-[10px] rounded border border-amber-900/50">STALE DATA</button>
             </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Log */}
        <div className="col-span-4 flex flex-col bg-slate-900 border border-slate-800 rounded overflow-hidden">
          <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 tracking-widest">
            SYSTEM LOG
          </div>
          <div 
            ref={logContainerRef}
            className="flex-1 p-4 overflow-y-auto text-[10px] leading-relaxed font-mono flex flex-col gap-1"
          >
            {diagnostics.log.map((entry, index) => (
              <div key={index} className={`${entry.includes('ERROR') || entry.includes('DROPPED') || entry.includes('INJECTED') ? 'text-red-400' : 'text-cyan-600'}`}>
                {entry}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}