// ============================================================================
// SMART TEACHER SCHEDULE - HYBRID CLIENT STORAGE ENGINE (INDEXEDDB + IN-MEMORY)
// Sức chứa hàng Gigabyte (GB) - Giải quyết triệt để lỗi QuotaExceededError của LocalStorage
// ============================================================================

import { get, set, del, keys, createStore } from 'idb-keyval';

// Tạo custom IndexedDB store cho Smart Teacher Schedule
const customStore = typeof window !== 'undefined' 
  ? createStore('smart_teacher_database', 'app_state_store') 
  : null;

const blobStore = typeof window !== 'undefined'
  ? createStore('smart_teacher_blob_store', 'attachment_blobs')
  : null;

// In-memory cache nhằm đảm bảo component render đồng bộ không bị giật lag
const memoryCache = new Map<string, any>();

/**
 * Đọc dữ liệu từ IndexedDB kèm cơ chế tự động di trú (Auto-migration) từ localStorage
 */
export async function dbGet<T>(key: string, defaultValue: T): Promise<T> {
  // 1. Kiểm tra trong bộ nhớ RAM (Memory Cache)
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }

  if (typeof window === 'undefined' || !customStore) {
    return defaultValue;
  }

  try {
    // 2. Đọc từ IndexedDB
    const idbVal = await get<T>(key, customStore);
    if (idbVal !== undefined && idbVal !== null) {
      memoryCache.set(key, idbVal);
      return idbVal;
    }

    // 3. Nếu IndexedDB chưa có, kiểm tra và di trú từ localStorage cũ
    const localRaw = localStorage.getItem(key);
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw) as T;
        await set(key, parsed, customStore);
        memoryCache.set(key, parsed);
        
        // Nếu dữ liệu lớn (> 50KB), xóa khỏi localStorage để giải phóng không gian
        if (localRaw.length > 50000) {
          localStorage.removeItem(key);
          localStorage.setItem(`${key}_migrated_idb`, 'true');
        }
        return parsed;
      } catch {
        await set(key, localRaw as unknown as T, customStore);
        memoryCache.set(key, localRaw);
        return localRaw as unknown as T;
      }
    }

    return defaultValue;
  } catch (error) {
    console.warn(`[StorageEngine] Lỗi đọc key '${key}' từ IndexedDB:`, error);
    try {
      const localRaw = localStorage.getItem(key);
      return localRaw ? JSON.parse(localRaw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

/**
 * Đọc dữ liệu đồng bộ (từ MemoryCache hoặc LocalStorage) để phục vụ khởi tạo state React
 */
export function dbGetSync<T>(key: string, defaultValue: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch (_) {}
  return defaultValue;
}

/**
 * Ghi dữ liệu vào IndexedDB & cập nhật Memory Cache
 */
export async function dbSet<T>(key: string, value: T): Promise<void> {
  // 1. Cập nhật Memory Cache ngay lập tức
  memoryCache.set(key, value);

  if (typeof window === 'undefined' || !customStore) return;

  try {
    // 2. Ghi bất đồng bộ vào IndexedDB (sức chứa hàng GB)
    await set(key, value, customStore);

    // 3. Đồng bộ nhẹ với localStorage cho các khóa cấu hình nhỏ (< 20KB) để SSR tương thích
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length < 20000) {
        localStorage.setItem(key, serialized);
      } else {
        localStorage.setItem(`${key}_in_idb`, 'true');
      }
    } catch (_) {
      // Bỏ qua nếu localStorage đầy, IndexedDB đã lưu thành công
    }
  } catch (error) {
    console.error(`[StorageEngine] Lỗi ghi key '${key}' vào IndexedDB:`, error);
  }
}

/**
 * Xóa một key khỏi IndexedDB, Memory Cache và localStorage
 */
export async function dbRemove(key: string): Promise<void> {
  memoryCache.delete(key);
  if (typeof window === 'undefined') return;

  try {
    if (customStore) await del(key, customStore);
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_in_idb`);
    localStorage.removeItem(`${key}_migrated_idb`);
  } catch (error) {
    console.warn(`[StorageEngine] Lỗi xóa key '${key}':`, error);
  }
}

/**
 * Đọc danh sách tất cả các keys trong IndexedDB
 */
export async function dbKeys(): Promise<string[]> {
  if (typeof window === 'undefined' || !customStore) return [];
  try {
    const rawKeys = await keys(customStore);
    return rawKeys.map(String);
  } catch {
    return [];
  }
}

/**
 * Lưu tệp nhị phân Blob vào IndexedDB Blob Store riêng biệt
 */
export async function dbSetBlob(fileId: string, blob: Blob): Promise<void> {
  if (typeof window === 'undefined' || !blobStore) return;
  try {
    await set(fileId, blob, blobStore);
  } catch (err) {
    console.error(`[StorageEngine] Lỗi lưu blob '${fileId}':`, err);
  }
}

/**
 * Lấy tệp nhị phân Blob từ IndexedDB
 */
export async function dbGetBlob(fileId: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !blobStore) return null;
  try {
    const blob = await get<Blob>(fileId, blobStore);
    return blob || null;
  } catch {
    return null;
  }
}

/**
 * Xóa tệp nhị phân Blob
 */
export async function dbRemoveBlob(fileId: string): Promise<void> {
  if (typeof window === 'undefined' || !blobStore) return;
  try {
    await del(fileId, blobStore);
  } catch (_) {}
}

export interface StorageDiagnostics {
  engine: 'IndexedDB (idb-keyval) + RAM Cache';
  isSupported: boolean;
  usedBytes: number;
  quotaBytes: number;
  usedMB: string;
  quotaMB: string;
  quotaGB: string;
  percentUsed: string;
  safetyStatus: 'EXCELLENT' | 'GOOD' | 'WARNING';
}

/**
 * Đo lường dung lượng bộ nhớ thực tế của trình duyệt (Storage Quota Estimate)
 */
export async function getStorageDiagnostics(): Promise<StorageDiagnostics> {
  const result: StorageDiagnostics = {
    engine: 'IndexedDB (idb-keyval) + RAM Cache',
    isSupported: true,
    usedBytes: 0,
    quotaBytes: 0,
    usedMB: '0.00 MB',
    quotaMB: '0.00 MB',
    quotaGB: '0.00 GB',
    percentUsed: '0%',
    safetyStatus: 'EXCELLENT'
  };

  if (typeof window === 'undefined') return result;

  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || (1024 * 1024 * 1024 * 10);

      result.usedBytes = used;
      result.quotaBytes = quota;
      result.usedMB = (used / (1024 * 1024)).toFixed(2) + ' MB';
      result.quotaMB = (quota / (1024 * 1024)).toFixed(2) + ' MB';
      result.quotaGB = (quota / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

      const pct = quota > 0 ? ((used / quota) * 100) : 0;
      result.percentUsed = pct.toFixed(2) + '%';

      if (pct > 80) result.safetyStatus = 'WARNING';
      else if (pct > 50) result.safetyStatus = 'GOOD';
      else result.safetyStatus = 'EXCELLENT';
    }
  } catch (e) {
    console.warn('[StorageEngine] Không thể đo lường Storage Estimate:', e);
  }

  return result;
}
