// Module quản lý lưu trữ tệp gốc qua IndexedDB và trích xuất toàn văn nội dung tệp (Word .docx, PDF, Text)
import JSZip from 'jszip';
import { KnowledgeDocument } from './knowledgeBaseData';

const DB_NAME = 'SmartTeacherKnowledgeFiles';
const STORE_NAME = 'files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not available in current environment'));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Lưu trữ tệp gốc vào IndexedDB (dung lượng không giới hạn, không gây tràn LocalStorage)
 */
export async function saveOriginalFileToStorage(docId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, docId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not save file to IndexedDB', e);
  }
}

/**
 * Lấy tệp gốc từ IndexedDB
 */
export async function getOriginalFileFromStorage(docId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(docId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not retrieve file from IndexedDB', e);
    return null;
  }
}

/**
 * Xóa tệp khỏi IndexedDB khi tài liệu bị xóa
 */
export async function deleteOriginalFileFromStorage(docId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(docId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not delete file from IndexedDB', e);
  }
}

/**
 * Chuyển Base64 data URL thành Blob URL an toàn cho iframe và download
 */
export function dataUrlToBlobUrl(dataUrl: string): string | null {
  try {
    if (!dataUrl) return null;
    if (dataUrl.startsWith('blob:')) return dataUrl;
    if (!dataUrl.startsWith('data:')) return dataUrl;

    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) return dataUrl;
    const contentType = parts[0].split(':')[1] || 'application/octet-stream';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: contentType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Error converting dataUrl to Blob URL', e);
    return null;
  }
}

/**
 * Nạp thư viện PDF.js giải mã chuẩn cho các file PDF giáo trình / tài liệu lớn
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) {
    const lib = (window as any).pdfjsLib;
    if (!lib.GlobalWorkerOptions?.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
    }
    return lib;
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-pdfjs="true"]');
    if (existing) {
      existing.addEventListener('load', () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
        }
        resolve(lib || null);
      });
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
        return resolve(lib);
      }
    }

    const script = document.createElement('script');
    script.src = '/pdfjs/pdf.min.js';
    script.setAttribute('data-pdfjs', 'true');
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
      }
      resolve(lib || null);
    };
    script.onerror = () => {
      // CDN Fallback
      const cdnScript = document.createElement('script');
      cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      cdnScript.async = true;
      cdnScript.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        resolve(lib || null);
      };
      cdnScript.onerror = () => resolve(null);
      document.head.appendChild(cdnScript);
    };
    document.head.appendChild(script);
  });
}

/**
 * Trích xuất toàn văn nội dung tệp (Word .docx, PDF, Text...) để xem trước và nạp cho AI đối chiếu
 */
export async function extractFullTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Định dạng Text thuần
  if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm'].includes(ext)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  }

  // 2. Định dạng Microsoft Word (.docx)
  if (ext === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      let docXml = '';
      const docFile = zip.file(/word\/document\.xml$/i)[0];
      if (docFile) {
        docXml = await docFile.async('string');
      }

      if (docXml) {
        // Tách theo từng đoạn văn <w:p> để bảo toàn cấu trúc xuống dòng
        const paragraphs = docXml.split(/<w:p[ >]/);
        const lines: string[] = [];

        for (const p of paragraphs) {
          const textMatches = p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (textMatches && textMatches.length > 0) {
            const line = textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('');
            if (line.trim()) lines.push(line.trim());
          }
        }

        const extracted = lines.join('\n\n');
        if (extracted.trim().length > 20) {
          return extracted;
        }
      }
    } catch (err) {
      console.warn('Failed to parse docx using JSZip', err);
    }
  }

  // 3. Định dạng PDF (.pdf) bằng PDF.js (giải mã FlateDecode, CMap và trích xuất từng trang)
  if (ext === 'pdf') {
    try {
      const pdfjs = await loadPdfJs();
      if (pdfjs) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pageTexts: string[] = [];

        // Đọc tuần tự các trang (hỗ trợ tài liệu lớn tới 300 trang)
        const maxPages = Math.min(numPages, 300);
        for (let i = 1; i <= maxPages; i++) {
          try {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items
              .map((item: any) => item.str || '')
              .join(' ')
              .replace(/\s+/g, ' ');
            if (text.trim()) {
              pageTexts.push(`--- TRANG ${i} / ${numPages} ---\n${text.trim()}`);
            }
          } catch (pErr) {
            console.warn(`Error reading page ${i}`, pErr);
          }
        }

        if (pageTexts.length > 0) {
          const extracted = pageTexts.join('\n\n');
          if (extracted.trim().length > 20) {
            return extracted;
          }
        }
      }
    } catch (err) {
      console.warn('Failed to extract PDF text with pdf.js', err);
    }
  }

  // Fallback nếu là tài liệu scan / ảnh
  return `TÀI LIỆU DẠNG HÌNH ẢNH / SCAN NGUYÊN BẢN: ${file.name}\nDung lượng: ${(file.size / 1024).toFixed(1)} KB\nĐịnh dạng: ${ext.toUpperCase() || 'FILE'}\n\n(Tài liệu không chứa lớp văn bản vector hoặc dạng ảnh scan. Hệ thống đã lưu trữ nguyên vẹn tệp đính kèm - Thầy/Cô có thể bấm 'Xem PDF trực quan' để xem trực tiếp hoặc bấm 'Tải về file gốc').`;
}

/**
 * Tải về đúng định dạng và tệp tin gốc mà Thầy/Cô đã tải lên ban đầu
 */
export async function downloadOriginalUploadedFile(doc: KnowledgeDocument): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let dataUrl = doc.fileData;
  if (!dataUrl) {
    dataUrl = (await getOriginalFileFromStorage(doc.id)) || undefined;
  }

  if (!dataUrl) {
    alert(`Chưa tìm thấy tệp đính kèm gốc của '${doc.title}'. Thầy/Cô vui lòng cập nhật lại tệp trong mục Xem trước hoặc Chỉnh sửa.`);
    return false;
  }

  try {
    const blobUrl = dataUrlToBlobUrl(dataUrl) || dataUrl;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.fileName || `${doc.code}_${doc.title}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (blobUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
    return true;
  } catch (e) {
    console.error('Error downloading original file', e);
    return false;
  }
}
