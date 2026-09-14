'use client';

export interface HuyTechHubResource {
  id: number | string;
  title: string;
  description?: string;
  type?: string;
  link?: string;
  is_premium?: boolean;
  isPremium?: boolean;
  folder_id?: number;
  created_at?: string;
  sourceApp?: string;
}

export interface EcosystemSyncResult {
  success: boolean;
  isDuplicate: boolean;
  synced: boolean;
  message: string;
  duplicateReason?: string;
  matchedDocument?: {
    id: number | string;
    title: string;
    link?: string;
  };
}

/**
 * Lấy danh sách tài liệu từ kho huycncdsai.io.vn
 */
export async function fetchHuyTechHubResources(): Promise<{
  connected: boolean;
  resources: HuyTechHubResource[];
}> {
  try {
    const res = await fetch('/api/ecosystem/resources', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        connected: data.hubConnected ?? true,
        resources: data.resources || []
      };
    }
  } catch (err) {
    console.warn('Không thể nạp danh sách tài liệu từ huycncdsai.io.vn:', err);
  }
  return { connected: false, resources: [] };
}

/**
 * Đồng bộ tài liệu giáo viên upload sang huycncdsai.io.vn
 * Có BỘ LỌC TỰ ĐỘNG CHỐNG TRÙNG LẶP
 */
export async function syncDocumentToHuyTechHub(doc: {
  title: string;
  description?: string;
  code?: string;
  fileName?: string;
  fileType?: string;
  content?: string;
  author?: string;
  category?: string;
}): Promise<EcosystemSyncResult> {
  try {
    const res = await fetch('/api/ecosystem/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });

    if (res.ok) {
      const result: EcosystemSyncResult = await res.json();
      return result;
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        isDuplicate: false,
        synced: false,
        message: errData.error || 'Máy chủ hệ sinh thái phản hồi không thành công.'
      };
    }
  } catch (err: any) {
    console.error('Lỗi khi gọi đồng bộ tài liệu sang huycncdsai.io.vn:', err);
    return {
      success: false,
      isDuplicate: false,
      synced: false,
      message: 'Không thể kết nối đến máy chủ đồng bộ hệ sinh thái huycncdsai.io.vn.'
    };
  }
}
