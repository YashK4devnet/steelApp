/**
 * Lightweight native IndexedDB service for offline-capable analytics and event tracking.
 * Zero external dependencies.
 */

export interface GateActivityLog {
  id: string;
  truckId: number;
  truckPlate: string;
  truckType?: string;
  action: 'inbound' | 'outbound';
  timestamp: number;
  dateString: string; // YYYY-MM-DD
  reportingDateTime: string;
  note?: string;
}

export interface GateHourlyStat {
  hour: string; // e.g., "08:00", "09:00"
  inbound: number;
  outbound: number;
  total: number;
}

export interface GateDailyStat {
  label: string; // e.g., "Mon", "Tue"
  date: string;  // YYYY-MM-DD
  inbound: number;
  outbound: number;
  total: number;
}

export interface GatePeriodStats {
  inbound: number;
  outbound: number;
  total: number;
  breakdown: Array<{
    label: string;
    inbound: number;
    outbound: number;
    total: number;
  }>;
}

const DB_NAME = 'rne_mobile_analytics';
const DB_VERSION = 1;
const STORE_NAME = 'gate_activity_logs';

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('dateString', 'dateString', { unique: false });
          store.createIndex('action', 'action', { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Records a gate action log (inbound arrival or outbound exit).
   */
  async recordGateLog(
    entry: Omit<GateActivityLog, 'id' | 'timestamp' | 'dateString'>
  ): Promise<GateActivityLog> {
    const db = await this.getDb();
    const now = new Date();
    const log: GateActivityLog = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now.getTime(),
      dateString: formatDateString(now),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(log);

      request.onsuccess = () => resolve(log);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves all gate logs with optional timestamp threshold.
   */
  async getGateLogs(sinceTimestamp?: number): Promise<GateActivityLog[]> {
    const db = await this.getDb();
    await this.ensureSeedData();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let logs: GateActivityLog[] = request.result || [];
        if (sinceTimestamp) {
          logs = logs.filter((l) => l.timestamp >= sinceTimestamp);
        }
        logs.sort((a, b) => b.timestamp - a.timestamp);
        resolve(logs);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns aggregated stats for today (hourly breakdown from 08:00 to 18:00).
   */
  async getTodayStats(): Promise<GatePeriodStats> {
    const today = new Date();
    const todayStr = formatDateString(today);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const logs = await this.getGateLogs(startOfToday);
    const todayLogs = logs.filter((l) => l.dateString === todayStr);

    let inboundCount = 0;
    let outboundCount = 0;

    // Initialize 2-hour buckets: 08:00, 10:00, 12:00, 14:00, 16:00, 18:00
    const buckets = [
      { label: '8 AM', minHour: 8, maxHour: 9, inbound: 0, outbound: 0 },
      { label: '10 AM', minHour: 10, maxHour: 11, inbound: 0, outbound: 0 },
      { label: '12 PM', minHour: 12, maxHour: 13, inbound: 0, outbound: 0 },
      { label: '2 PM', minHour: 14, maxHour: 15, inbound: 0, outbound: 0 },
      { label: '4 PM', minHour: 16, maxHour: 17, inbound: 0, outbound: 0 },
      { label: '6 PM', minHour: 18, maxHour: 19, inbound: 0, outbound: 0 },
    ];

    for (const log of todayLogs) {
      if (log.action === 'inbound') inboundCount++;
      if (log.action === 'outbound') outboundCount++;

      const logHour = new Date(log.timestamp).getHours();
      for (const bucket of buckets) {
        if (logHour >= bucket.minHour && logHour <= bucket.maxHour) {
          if (log.action === 'inbound') bucket.inbound++;
          if (log.action === 'outbound') bucket.outbound++;
          break;
        }
      }
    }

    return {
      inbound: inboundCount,
      outbound: outboundCount,
      total: inboundCount + outboundCount,
      breakdown: buckets.map((b) => ({
        label: b.label,
        inbound: b.inbound,
        outbound: b.outbound,
        total: b.inbound + b.outbound,
      })),
    };
  }

  /**
   * Returns aggregated stats over the past 7 days.
   */
  async getSevenDayStats(): Promise<GatePeriodStats> {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await this.getGateLogs(sevenDaysAgo.getTime());

    // Generate array of past 7 days in order
    const daysMap = new Map<string, { label: string; inbound: number; outbound: number }>();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = formatDateString(d);
      daysMap.set(dStr, {
        label: dayNames[d.getDay()],
        inbound: 0,
        outbound: 0,
      });
    }

    let inboundCount = 0;
    let outboundCount = 0;

    for (const log of logs) {
      const item = daysMap.get(log.dateString);
      if (item) {
        if (log.action === 'inbound') {
          item.inbound++;
          inboundCount++;
        } else if (log.action === 'outbound') {
          item.outbound++;
          outboundCount++;
        }
      }
    }

    const breakdown = Array.from(daysMap.entries()).map(([dateStr, val]) => ({
      label: val.label,
      date: dateStr,
      inbound: val.inbound,
      outbound: val.outbound,
      total: val.inbound + val.outbound,
    }));

    return {
      inbound: inboundCount,
      outbound: outboundCount,
      total: inboundCount + outboundCount,
      breakdown,
    };
  }

  /**
   * Seeds demo gate logs if the database is newly initialized.
   */
  private async ensureSeedData(): Promise<void> {
    const db = await this.getDb();
    const count = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (count > 0) return;

    // Seed realistic activity logs across past 7 days and current shift
    const seedLogs: GateActivityLog[] = [];
    const now = new Date();

    const samplePlates = ['AS-01-EF-4512', 'ML-05-AB-9821', 'TR-01-GH-3344', 'NL-07-BC-1122', 'AS-25-DC-7890'];
    const sampleTypes = ['20 Ft Container', 'Open Body 16 Ton', 'Trailer 32 Ton', 'Closed Truck'];

    // Today's shift (8 logs)
    const todayHours = [8, 9, 10, 11, 12, 14, 15];
    todayHours.forEach((hour, idx) => {
      const logDate = new Date(now);
      logDate.setHours(hour, 15 + idx * 5, 0, 0);
      const action: 'inbound' | 'outbound' = idx % 3 === 0 ? 'outbound' : 'inbound';
      seedLogs.push({
        id: `seed-today-${idx}`,
        truckId: 100 + idx,
        truckPlate: samplePlates[idx % samplePlates.length],
        truckType: sampleTypes[idx % sampleTypes.length],
        action,
        timestamp: logDate.getTime(),
        dateString: formatDateString(logDate),
        reportingDateTime: logDate.toISOString().replace('T', ' ').substring(0, 19),
        note: action === 'inbound' ? 'Arrived at Gate 1' : 'Cleared inspection exit',
      });
    });

    // Past 6 days (3-5 logs per day)
    for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - dayOffset);
      const dayLogsCount = 4 + (dayOffset % 3);

      for (let i = 0; i < dayLogsCount; i++) {
        const itemDate = new Date(pastDate);
        itemDate.setHours(9 + i * 2, 20, 0, 0);
        const action: 'inbound' | 'outbound' = i % 2 === 0 ? 'inbound' : 'outbound';
        seedLogs.push({
          id: `seed-past-${dayOffset}-${i}`,
          truckId: 200 + dayOffset * 10 + i,
          truckPlate: samplePlates[(i + dayOffset) % samplePlates.length],
          truckType: sampleTypes[i % sampleTypes.length],
          action,
          timestamp: itemDate.getTime(),
          dateString: formatDateString(itemDate),
          reportingDateTime: itemDate.toISOString().replace('T', ' ').substring(0, 19),
        });
      }
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const log of seedLogs) {
        store.add(log);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const indexedDbService = new IndexedDbService();
