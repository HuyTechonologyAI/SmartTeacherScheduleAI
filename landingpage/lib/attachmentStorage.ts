// ============================================================================
// ATTACHMENT STORAGE ENGINE - TÁCH RỜI TỆP ĐÍNH KÈM WORD/PDF KHỎI LOCALSTORAGE
// Hỗ trợ lưu trữ Supabase Storage (Online) & IndexedDB Blob Store (Offline)
// ============================================================================

import { supabase } from './supabase';
import { dbSetBlob, dbGetBlob } from './storageEngine';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  mimeType: string;
  storageType: 'SUPABASE_CLOUD' | 'INDEXEDDB_OFFLINE';
  fileKey: string;
}

const BUCKET_NAME = 'lesson-plans';

/**
 * Upload tệp bài giảng / văn bản (Word, PDF, PowerPoint, Ảnh)
 * Tự động chọn Supabase Cloud Storage nếu có mạng, hoặc IndexedDB Blob nếu ngoại tuyến
 */
export async function uploadAttachmentFile(
  file: File | Blob,
  fileName: string,
  folderPrefix: string = 'general'
): Promise<UploadResult> {
  const timestamp = Date.now();
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileKey = `${folderPrefix}/${timestamp}_${cleanName}`;
  const mimeType = file.type || 'application/octet-stream';
  const size = file.size;

  // 1. Thử upload lên Supabase Storage nếu online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileKey, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: mimeType
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileKey);

        const cloudUrl = publicUrlData?.publicUrl || '';
        if (cloudUrl) {
          return {
            url: cloudUrl,
            name: fileName,
            size,
            mimeType,
            storageType: 'SUPABASE_CLOUD',
            fileKey
          };
        }
      }
    } catch (err) {
      console.warn('[AttachmentStorage] Supabase Storage upload không thành công, chuyển sang IndexedDB Blob:', err);
    }
  }

  // 2. Fallback ngoại tuyến: Lưu trực tiếp Blob vào IndexedDB Blob Store
  const idbKey = `blob_${fileKey}`;
  await dbSetBlob(idbKey, file);

  // Tạo URL Object hoặc URI quy ước idb://
  let localUrl = `idb://${idbKey}`;
  if (typeof window !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      localUrl = URL.createObjectURL(file);
    } catch (_) {}
  }

  return {
    url: localUrl,
    name: fileName,
    size,
    mimeType,
    storageType: 'INDEXEDDB_OFFLINE',
    fileKey: idbKey
  };
}

/**
 * Lấy URL để xem hoặc tải tệp đính kèm (hỗ trợ cả link Cloud và IndexedDB Blob)
 */
export async function resolveAttachmentUrl(urlOrIdbUri: string, fileKey?: string): Promise<string> {
  if (!urlOrIdbUri) return '';
  if (urlOrIdbUri.startsWith('http://') || urlOrIdbUri.startsWith('https://')) {
    return urlOrIdbUri;
  }

  // Nếu là idb:// hoặc blob key
  const targetKey = fileKey || (urlOrIdbUri.startsWith('idb://') ? urlOrIdbUri.replace('idb://', '') : urlOrIdbUri);
  const blob = await dbGetBlob(targetKey);
  if (blob && typeof window !== 'undefined' && typeof URL !== 'undefined') {
    return URL.createObjectURL(blob);
  }

  return urlOrIdbUri;
}
