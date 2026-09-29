/**
 * Local-First Storage Service for RehabForce v1.0.0
 * Manages persistence for athletes, sessions, and clinical audit trails using localStorage[cite: 1].
 */

const STORAGE_KEYS = {
  CLINICIANS: 'rehabforce_clinicians_v1',
  ATHLETES: 'rehabforce_athletes_v1',
  SESSIONS: 'rehabforce_sessions_v1',
  AUDIT_LOG: 'rehabforce_audit_v1'
};

// MVP default clinician so the app works out of the box
const INITIAL_CLINICIANS = [
  { id: 'CLIN-001', name: 'Dr. Papadopoulos', role: 'Physiotherapist', pin: '1234' }
];

// Initial MVP seed data, now strictly linked to CLIN-001
const INITIAL_ATHLETES = [
  { id: 'ATH-001', clinicianId: 'CLIN-001', name: 'Nikos K.', age: 24, sport: 'Football', position: 'Midfielder', region: 'Knee', side: 'Right (R)', diagnosis: 'ACL Reconstruction (Post-op)', state: 'REHAB', week: 10, quote: 'My goal is to return to full training and be ready for the next season.', painRest: 2, painWorst: 4, compliance: 87, flag: 'Progression candidate' },
  { id: 'ATH-002', clinicianId: 'CLIN-001', name: 'Maria S.', age: 22, sport: 'Running', position: 'Distance', region: 'Ankle', side: 'Left (L)', diagnosis: 'Lateral Ankle Sprain', state: 'REHAB', week: 4, quote: 'Wishing to run pain-free.', painRest: 1, painWorst: 3, compliance: 76, flag: 'Target compliance declining' },
  { id: 'ATH-003', clinicianId: 'CLIN-001', name: 'Alex P.', age: 27, sport: 'Basketball', position: 'Guard', region: 'Hip', side: 'Right (R)', diagnosis: 'FAI (Post-op)', state: 'RTS', week: 12, quote: 'Ready for court testing.', painRest: 0, painWorst: 1, compliance: 92, flag: 'Good progress' }
];

export const storageService = {
  /**
   * CLINICIAN MANAGEMENT
   */
  getClinicians() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLINICIANS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLINICIANS, JSON.stringify(INITIAL_CLINICIANS));
        return INITIAL_CLINICIANS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load clinicians:", error);
      return [];
    }
  },

  saveClinician(clinicianData) {
    try {
      const clinicians = this.getClinicians();
      const newClinician = {
        id: 'CLIN-' + Date.now(),
        ...clinicianData
      };
      clinicians.push(newClinician);
      localStorage.setItem(STORAGE_KEYS.CLINICIANS, JSON.stringify(clinicians));
      this.logAudit('REGISTER_CLINICIAN', `New clinician registered: ${newClinician.name}`);
      return newClinician;
    } catch (error) {
      console.error("Failed to save clinician:", error);
      return null;
    }
  },

  authenticateClinician(pin) {
    const clinicians = this.getClinicians();
    return clinicians.find(c => c.pin === pin) || null;
  },

  /**
   * Retrieves all registered athletes. Initializes with seed data if empty.
   */
  getAthletes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATHLETES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(INITIAL_ATHLETES));
        return INITIAL_ATHLETES;
      }
      
      let parsedAthletes = JSON.parse(data);
      let needsUpdate = false;
      
      // MIGRATION PATCH: If legacy athletes from earlier testing lack a clinicianId,
      // assign them to the default Dr. Papadopoulos account ('CLIN-001') so they aren't lost.
      parsedAthletes = parsedAthletes.map(athlete => {
        if (!athlete.clinicianId) {
          needsUpdate = true;
          return { ...athlete, clinicianId: 'CLIN-001' };
        }
        return athlete;
      });
      
      if (needsUpdate) {
        localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(parsedAthletes));
      }
      
      return parsedAthletes;
    } catch (error) {
      console.error("Failed to load athletes:", error);
      return [];
    }
  },

  /**
   * Retrieves athletes assigned to a specific clinician[cite: 1].
   */
  getAthletesByClinician(clinicianId) {
    const athletes = this.getAthletes();
    return athletes.filter(a => a.clinicianId === clinicianId);
  },

  /**
   * Saves or updates an athlete profile. Generates a new ID if creating.
   */
  saveAthlete(athlete) {
    try {
      const athletes = this.getAthletes();
      
      // Generate a new ID if it is a brand new athlete profile
      if (!athlete.id) {
        athlete.id = 'ATH-' + Date.now();
      }

      const index = athletes.findIndex(a => a.id === athlete.id);
      if (index >= 0) {
        athletes[index] = athlete;
      } else {
        athletes.unshift(athlete); // Add new athletes to the top of the list
      }
      localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
      this.logAudit('SAVE_ATHLETE', `Saved profile for athlete ${athlete.id}`);
      return athlete;
    } catch (error) {
      console.error("Failed to save athlete:", error);
      return null;
    }
  },

  /**
   * Permanently deletes an athlete and cascades the deletion to all associated sessions.
   */
  deleteAthlete(athleteId) {
    try {
      // 1. Remove the athlete
      const athletes = this.getAthletes();
      const filteredAthletes = athletes.filter(a => a.id !== athleteId);
      localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(filteredAthletes));

      // 2. Cascade delete all sessions tied to this athlete
      const sessions = this.getSessions();
      const filteredSessions = sessions.filter(s => s.athleteId !== athleteId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filteredSessions));

      this.logAudit('DELETE_ATHLETE', `Permanently deleted athlete ${athleteId} and their associated sessions`);
      return true;
    } catch (error) {
      console.error("Failed to delete athlete and sessions:", error);
      return false;
    }
  },

  /**
   * Retrieves the full session history.
   */
  getSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load sessions:", error);
      return [];
    }
  },

  /**
   * Retrieves session history for a specific athlete.
   */
  getSessionsByAthlete(athleteId) {
    const sessions = this.getSessions();
    return sessions.filter(session => session.athleteId === athleteId);
  },

  /**
   * Retrieves all sessions across all athletes assigned to a specific clinician.
   */
  getRecentSessionsByClinician(clinicianId) {
    const allSessions = this.getSessions();
    // Get the IDs of all athletes belonging to this clinician
    const clinicianAthleteIds = this.getAthletesByClinician(clinicianId).map(a => a.id);
    
    // Return only the sessions that belong to those athletes
    return allSessions.filter(session => clinicianAthleteIds.includes(session.athleteId));
  },

  /**
   * Saves a newly completed session to the history.
   */
  saveSession(sessionData) {
    try {
      const sessions = this.getSessions();
      const newSession = {
        id: 'SES-' + Date.now(),
        timestamp: new Date().toISOString(),
        ...sessionData
      };
      // Add the newest session to the front of the array
      sessions.unshift(newSession); 
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      this.logAudit('SAVE_SESSION', `Saved session ${newSession.id} for athlete ${sessionData.athleteId}`);
      return newSession;
    } catch (error) {
      console.error("Failed to save session:", error);
      return null;
    }
  },

  /**
   * Retrieves the security audit trail[cite: 1].
   */
  getAuditLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load audit log:", error);
      return [];
    }
  },

  /**
   * Records important clinical and system events to the audit trail[cite: 1].
   */
  logAudit(action, details) {
    try {
      const log = this.getAuditLog();
      log.unshift({
        timestamp: new Date().toISOString(),
        action,
        details
      });
      // Cap the audit log at 1000 entries to prevent local storage overflow
      if (log.length > 1000) log.pop(); 
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log));
    } catch (error) {
      console.error("Failed to write to audit log:", error);
    }
  }
};