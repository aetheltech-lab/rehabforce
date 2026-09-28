/**
 * RehabForce Mock Device Adapter
 * Hardware-agnostic simulator for Phase 1 clinical logic validation.
 * Implements strict Data Quality Gating, Simulated Hardware Failures, and Diagnostics.
 */
class MockDeviceAdapter {
  constructor() {
    this.isConnected = false;
    this.isCalibrated = false;
    this.streamInterval = null;
    
    // Active failure state for simulated hardware testing
    this.activeFailure = 'NONE'; // NONE, LEFT_DISCONNECT, RIGHT_DISCONNECT, SYNC_ERROR, STALE_DATA, CALIBRATION_FAIL

    // Isolated Hardware Status
    this.deviceState = {
      leftConnected: false,
      rightConnected: false,
      leftBattery: 0,
      rightBattery: 0,
      signalQuality: 'DISCONNECTED', // EXCELLENT, POOR, DISCONNECTED
      syncStatus: 'NOT_ASSESSED',    // SYNCED, OUT_OF_SYNC, NOT_ASSESSED
      dataQuality: 'NOT_ASSESSED'    // VALID, INVALID, NOT_ASSESSED
    };

    // Hardware Diagnostics State for Developer Mode[cite: 4, 5]
    this.diagnosticMetrics = {
      leftHz: 0,
      rightHz: 0,
      syncSkewMs: 0,
      droppedPackets: 0,
      dataAgeMs: 0,
      latencyMs: 0
    };
    this.diagnosticLog = [];
  }

  /**
   * Internal logger for the Hardware Diagnostics screen
   */
  logDiagnostic(message) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    this.diagnosticLog.unshift(`[${timestamp}] ${message}`);
    // Keep log size manageable (latest 50 events)
    if (this.diagnosticLog.length > 50) this.diagnosticLog.pop();
  }

  async connect() {
    this.logDiagnostic('Initiating BLE connection to L/R sensors...');
    await new Promise(resolve => setTimeout(resolve, 800));

    this.isConnected = true;
    this.deviceState = {
      leftConnected: true,
      rightConnected: true,
      leftBattery: 100,
      rightBattery: 98,
      signalQuality: 'EXCELLENT',
      syncStatus: 'SYNCED',
      dataQuality: 'NOT_ASSESSED' 
    };

    this.diagnosticMetrics.droppedPackets = 0;
    this.logDiagnostic('Connection successful. Battery L:100% R:98%.');

    return { success: true, status: this.deviceState };
  }

  async disconnect() {
    this.logDiagnostic('Disconnecting sensors...');
    this.isConnected = false;
    this.isCalibrated = false;
    this.stopStream();
    
    this.deviceState = {
      leftConnected: false,
      rightConnected: false,
      leftBattery: 0,
      rightBattery: 0,
      signalQuality: 'DISCONNECTED',
      syncStatus: 'NOT_ASSESSED',
      dataQuality: 'NOT_ASSESSED'
    };

    this.diagnosticMetrics = {
      leftHz: 0, rightHz: 0, syncSkewMs: 0, droppedPackets: 0, dataAgeMs: 0, latencyMs: 0
    };
    this.logDiagnostic('Sensors disconnected safely.');
    
    return { success: true };
  }

  async calibrate() {
    this.logDiagnostic('Starting 5-second calibration zeroing sequence...');
    if (this.activeFailure === 'CALIBRATION_FAIL') {
      this.isCalibrated = false;
      this.logDiagnostic('ERROR: Calibration failed. Sensors unstable.');
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.isCalibrated = true;
    this.logDiagnostic('Calibration successful. Sensors zeroed.');
    return true;
  }

  /**
   * High-frequency data stream simulating Moticon OpenGo hardware.
   * Runs at 50Hz (20ms interval) to validate high-throughput performance[cite: 7].
   */
  startStream(callback) {
    if (this.streamInterval) clearInterval(this.streamInterval);

    this.logDiagnostic('Data stream started at 50 Hz target.');
    let tick = 0;
    
    // 20ms interval = 50Hz Target
    this.streamInterval = setInterval(() => {
      tick++;

      let leftLoad = 50 + Math.sin(tick * 0.05) * 20;
      let rightLoad = 50 - Math.sin(tick * 0.05) * 20;
      let currentDataQuality = 'VALID';

      // Reset baseline diagnostic metrics for a healthy tick
      this.diagnosticMetrics.leftHz = 50;
      this.diagnosticMetrics.rightHz = 50;
      this.diagnosticMetrics.syncSkewMs = Math.floor(Math.random() * 5); // 0-4ms natural BLE jitter
      this.diagnosticMetrics.dataAgeMs = 20;
      this.diagnosticMetrics.latencyMs = 45 + Math.floor(Math.random() * 15); // 45-60ms baseline latency

      // ==========================================
      // SIMULATED HARDWARE FAILURE INJECTION
      // ==========================================
      switch (this.activeFailure) {
        case 'LEFT_DISCONNECT':
          leftLoad = 0;
          this.deviceState.leftConnected = false;
          this.deviceState.signalQuality = 'POOR';
          this.diagnosticMetrics.leftHz = 0;
          this.diagnosticMetrics.droppedPackets++;
          currentDataQuality = 'INVALID';
          break;
          
        case 'RIGHT_DISCONNECT':
          rightLoad = 0;
          this.deviceState.rightConnected = false;
          this.deviceState.signalQuality = 'POOR';
          this.diagnosticMetrics.rightHz = 0;
          this.diagnosticMetrics.droppedPackets++;
          currentDataQuality = 'INVALID';
          break;
          
        case 'STALE_DATA':
          leftLoad = 52; 
          rightLoad = 48;
          this.deviceState.signalQuality = 'POOR';
          this.diagnosticMetrics.leftHz = 12; // Dropping frames
          this.diagnosticMetrics.rightHz = 12;
          this.diagnosticMetrics.dataAgeMs += 20; // Age climbs indefinitely
          this.diagnosticMetrics.droppedPackets++;
          currentDataQuality = 'INVALID';
          break;
          
        case 'SYNC_ERROR':
          this.deviceState.syncStatus = 'OUT_OF_SYNC';
          leftLoad = Math.random() * 100;
          rightLoad = Math.random() * 100;
          this.diagnosticMetrics.syncSkewMs = 150 + Math.floor(Math.random() * 100); // 150-250ms severe skew
          currentDataQuality = 'INVALID';
          break;
          
        case 'NONE':
        default:
          this.deviceState.leftConnected = true;
          this.deviceState.rightConnected = true;
          this.deviceState.signalQuality = 'EXCELLENT';
          this.deviceState.syncStatus = 'SYNCED';
          break;
      }

      if (!this.isConnected || !this.isCalibrated) {
        currentDataQuality = 'NOT_ASSESSED';
      }

      this.deviceState.dataQuality = currentDataQuality;

      // Construct payload conforming to RehabForce internal schema
      const payload = {
        timestamp_sensor: Date.now() - this.diagnosticMetrics.latencyMs,
        leftLoadPct: Math.max(0, Math.round(leftLoad)),
        rightLoadPct: Math.max(0, Math.round(rightLoad)),
        dataQuality: this.deviceState.dataQuality,
        syncStatus: this.deviceState.syncStatus,
        signalQuality: this.deviceState.signalQuality,
        leftConnected: this.deviceState.leftConnected,
        rightConnected: this.deviceState.rightConnected,
        // Hidden diagnostics payload for the Developer Mode[cite: 4]
        diagnostics: { ...this.diagnosticMetrics, log: [...this.diagnosticLog] }
      };

      callback(payload);
    }, 20); 
  }

  stopStream() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
      this.logDiagnostic('Data stream stopped.');
    }
  }

  triggerSimulationEvent(eventType) {
    if (this.activeFailure !== eventType) {
      this.logDiagnostic(`SIMULATION EVENT INJECTED: ${eventType}`);
      this.activeFailure = eventType;
    }
  }
}

export const deviceAdapter = new MockDeviceAdapter();