
import { Subscription, ReminderLog } from '../types';

/**
 * GOOGLE DRIVE SYNC SERVICE
 * Manages the connection to the user's private drive and file persistence.
 */

const CONFIG_FILE_NAME = 'subtracker_pro_data.json';

export interface AppData {
  subscriptions: Subscription[];
  reminderLogs: ReminderLog[];
  version: string;
  updatedAt: string;
}

export class DriveSyncService {
  private static instance: DriveSyncService;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance() {
    if (!DriveSyncService.instance) {
      DriveSyncService.instance = new DriveSyncService();
    }
    return DriveSyncService.instance;
  }

  setToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Mock sync for the prototype environment
   * Real implementation would use fetch('https://www.googleapis.com/drive/v3/files')
   */
  async syncToDrive(data: AppData): Promise<void> {
    console.log('[DRIVE SYNC] Saving data to Google Drive...', data);
    // Persist to local storage as a fallback/simulation
    localStorage.setItem('subtracker_drive_sim', JSON.stringify(data));
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  async fetchFromDrive(): Promise<AppData | null> {
    console.log('[DRIVE SYNC] Fetching data from Google Drive...');
    const saved = localStorage.getItem('subtracker_drive_sim');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  async logout() {
    this.accessToken = null;
    localStorage.removeItem('subtracker_drive_sim');
  }
}

export const driveSync = DriveSyncService.getInstance();
