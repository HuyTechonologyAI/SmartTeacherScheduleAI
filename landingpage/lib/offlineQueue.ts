// ============================================================================
// OFFLINE MUTATION QUEUE - TỰ ĐỘNG ĐỒNG BỘ KHI CÓ MẠNG TRỞ LẠI
// ============================================================================

import { dbGet, dbSet } from './storageEngine';

export interface OfflineAction {
  id: string;
  type: 'CREATE_EVENT' | 'UPDATE_EVENT' | 'DELETE_EVENT' | 'SUBMIT_LEAVE' | 'APPROVE_PLAN';
  payload: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_QUEUE_KEY = 'smart_offline_mutation_queue_v1';

/**
 * Thêm một thao tác vào hàng đợi ngoại tuyến
 */
export async function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  const queue = await dbGet<OfflineAction[]>(STORAGE_QUEUE_KEY, []);
  const newAction: OfflineAction = {
    ...action,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    retryCount: 0
  };
  queue.push(newAction);
  await dbSet(STORAGE_QUEUE_KEY, queue);
}

/**
 * Lấy toàn bộ hàng đợi thao tác ngoại tuyến
 */
export async function getOfflineQueue(): Promise<OfflineAction[]> {
  return dbGet<OfflineAction[]>(STORAGE_QUEUE_KEY, []);
}

/**
 * Xóa một hành động khỏi hàng đợi khi đã đồng bộ thành công
 */
export async function dequeueOfflineAction(actionId: string): Promise<void> {
  const queue = await dbGet<OfflineAction[]>(STORAGE_QUEUE_KEY, []);
  const filtered = queue.filter(a => a.id !== actionId);
  await dbSet(STORAGE_QUEUE_KEY, filtered);
}

/**
 * Xóa sạch hàng đợi
 */
export async function clearOfflineQueue(): Promise<void> {
  await dbSet(STORAGE_QUEUE_KEY, []);
}
