/**
 * MockDeviceAdapter for RehabForce Phase 1
 * Simulates a BLE connection to bilateral smart insoles.
 * Normalizes data into the common RehabForce schema as defined in the technical specification.
 */
class MockDeviceAdapter {
  constructor() {
    this.isConnected = false;
    this.isCalibrated = false;
    this.streamInterval = null;
    
    // Simulated device state
    this.deviceState = {
      leftBattery: 100,
      rightBattery: 98,
      signalQuality: 'Excellent',
      firmware: 'v1.2.3 (Mock)'
    };
  }

  /**
   * Simulates connecting to the bilateral insoles.
   * @returns {Promise<Object>} The connection status and device capabilities.
   */
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        resolve({
          success: true,
          status: this.deviceState,
          capabilities: ['force_l', 'force_r', 'loading_pct', 'sync_status']
        });
      }, 1500); // Simulate 1.5s BLE pairing delay
    });
  }

  /**
   * Simulates disconnecting the sensors safely.
   */
  async disconnect() {
    this.stopStream();
    this.isConnected = false;
    this.isCalibrated = false;
    return { success: true, message: 'Devices disconnected safely.' };
  }

  /**
   * Simulates the 5-second static calibration phase.
   * @returns {Promise<Boolean>} True if calibration is successful.
   */
  async calibrate() {
    if (!this.isConnected) throw new Error('Cannot calibrate: Sensors not connected.');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isCalibrated = true;
        resolve(true);
      }, 2000); // 2-second simulated calibration process
    });
  }

  /**
   * Starts the high-frequency data stream.
   * Target latency is <= 100ms update intervals.
   * @param {Function} onData - Callback function receiving the normalized RehabForce data schema.
   */
  startStream(onData) {
    if (!this.isConnected) {
      console.warn('Attempted to start stream without connection.');
      return;
    }
    
    if (this.streamInterval) {
      this.stopStream();
    }

    // Emit data every 100ms (10Hz) to satisfy the MVP low-latency requirement
    this.streamInterval = setInterval(() => {
      // Generate a slight random fluctuation for realistic biomechanical data
      const fluctuation = Math.floor(Math.random() * 5) - 2; 
      const leftLoad = Math.min(Math.max(50 + fluctuation, 40), 60);
      const rightLoad = 100 - leftLoad;

      // Normalized RehabForce Schema
      const normalizedData = {
        timestamp: Date.now(),
        validity: 'VALID', // VALID, DEGRADED, or INVALID
        leftLoadPct: leftLoad,
        rightLoadPct: rightLoad,
        absoluteDifference: Math.abs(leftLoad - rightLoad),
        peakForceBW: (1.5 + (Math.random() * 0.2)).toFixed(2), // Simulated peak force in BW
        deviceMetadata: {
          syncStatus: 'OK',
          quality: this.deviceState.signalQuality
        }
      };

      onData(normalizedData);
    }, 100); 
  }

  /**
   * Stops the live data stream.
   */
  stopStream() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
  }
}

// Export a singleton instance to be used across the application
export const deviceAdapter = new MockDeviceAdapter();