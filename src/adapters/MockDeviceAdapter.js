/**
 * RehabForce Mock Device Adapter
 * Hardware-agnostic simulator for Phase 1 clinical logic validation.
 * Implements strict Data Quality Gating and Simulated Hardware Failures.
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
  }

  /**
   * Simulates the BLE connection process to bilateral sensors.
   */
  async connect() {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));

    this.isConnected = true;
    this.deviceState = {
      leftConnected: true,
      rightConnected: true,
      leftBattery: 100,
      rightBattery: 98,
      signalQuality: 'EXCELLENT',
      syncStatus: 'SYNCED',
      dataQuality: 'NOT_ASSESSED' // Data quality is only assessed during active streaming
    };

    return { success: true, status: this.deviceState };
  }

  /**
   * Gracefully disconnects and resets the hardware states.
   */
  async disconnect() {
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
    
    return { success: true };
  }

  /**
   * Simulates the static 5-second calibration/zeroing workflow.
   */
  async calibrate() {
    if (this.activeFailure === 'CALIBRATION_FAIL') {
      this.isCalibrated = false;
      return false;
    }
    
    // Simulate the 5-second calibration hold
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.isCalibrated = true;
    return true;
  }

  /**
   * High-frequency data stream simulating <=100ms BLE packets.
   * Enforces the Data Quality Gate before yielding payload to the UI.
   */
  startStream(callback) {
    if (this.streamInterval) clearInterval(this.streamInterval);

    let tick = 0;
    
    this.streamInterval = setInterval(() => {
      tick++;

      // Base healthy biomechanical simulation (oscillating around 50/50)
      let leftLoad = 50 + Math.sin(tick * 0.1) * 20;
      let rightLoad = 50 - Math.sin(tick * 0.1) * 20;
      let currentDataQuality = 'VALID';

      // ==========================================
      // SIMULATED HARDWARE FAILURE INJECTION
      // ==========================================
      switch (this.activeFailure) {
        case 'LEFT_DISCONNECT':
          leftLoad = 0;
          this.deviceState.leftConnected = false;
          this.deviceState.signalQuality = 'POOR';
          currentDataQuality = 'INVALID';
          break;
          
        case 'RIGHT_DISCONNECT':
          rightLoad = 0;
          this.deviceState.rightConnected = false;
          this.deviceState.signalQuality = 'POOR';
          currentDataQuality = 'INVALID';
          break;
          
        case 'STALE_DATA':
          // Freeze the load values to simulate dropped packets
          leftLoad = 52; 
          rightLoad = 48;
          this.deviceState.signalQuality = 'POOR';
          currentDataQuality = 'INVALID';
          break;
          
        case 'SYNC_ERROR':
          // Simulate L/R time skew causing artificial asymmetry
          this.deviceState.syncStatus = 'OUT_OF_SYNC';
          leftLoad = Math.random() * 100;
          rightLoad = Math.random() * 100;
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

      // ==========================================
      // CLINICAL DATA QUALITY GATE
      // Connection OK + Calibration OK + Sync OK -> VALID
      // ==========================================
      if (!this.isConnected || !this.isCalibrated) {
        currentDataQuality = 'NOT_ASSESSED';
      }

      this.deviceState.dataQuality = currentDataQuality;

      // Construct the normalized payload conforming to RehabForce internal schema
      const payload = {
        timestamp_sensor: Date.now(),
        leftLoadPct: Math.max(0, Math.round(leftLoad)),
        rightLoadPct: Math.max(0, Math.round(rightLoad)),
        dataQuality: this.deviceState.dataQuality,
        syncStatus: this.deviceState.syncStatus,
        signalQuality: this.deviceState.signalQuality,
        leftConnected: this.deviceState.leftConnected,
        rightConnected: this.deviceState.rightConnected
      };

      // Yield normalized payload to the application
      callback(payload);

    }, 100); // 100ms simulation loop to mimic target hardware capability
  }

  /**
   * Safely kills the active data stream.
   */
  stopStream() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
  }

  /**
   * Developer utility to trigger Nikos's requested testing scenarios on the fly.
   * @param {string} eventType - 'NONE', 'LEFT_DISCONNECT', 'RIGHT_DISCONNECT', 'SYNC_ERROR', 'STALE_DATA', 'CALIBRATION_FAIL'
   */
  triggerSimulationEvent(eventType) {
    console.warn(`[Hardware Simulator] Injecting Failure Event: ${eventType}`);
    this.activeFailure = eventType;
  }
}

// Export a single instance to act as our centralized hardware singleton
export const deviceAdapter = new MockDeviceAdapter();