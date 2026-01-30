
import { Subscription, ReminderLog } from '../types';

declare const puter: any;

const STORAGE_KEY = 'subtracker_pro_v1_data';

export interface AppData {
  subscriptions: Subscription[];
  reminderLogs: ReminderLog[];
  version: string;
  updatedAt: string;
}

export class PuterStorageService {
  private static instance: PuterStorageService;

  private constructor() {}

  static getInstance() {
    if (!PuterStorageService.instance) {
      PuterStorageService.instance = new PuterStorageService();
    }
    return PuterStorageService.instance;
  }

  async syncToCloud(data: AppData): Promise<void> {
    console.log('[PUTER STORAGE] Syncing to KV store...', data);
    await puter.kv.set(STORAGE_KEY, JSON.stringify(data));
  }

  async fetchFromCloud(): Promise<AppData | null> {
    console.log('[PUTER STORAGE] Fetching from KV store...');
    const saved = await puter.kv.get(STORAGE_KEY);
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse Cloud data", e);
        return null;
      }
    }
    return null;
  }
}

export const cloudStorage = PuterStorageService.getInstance();
