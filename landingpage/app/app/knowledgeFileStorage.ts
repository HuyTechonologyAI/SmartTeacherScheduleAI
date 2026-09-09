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
      
      // Tìm file document.xml
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

  // 3. Định dạng PDF (.pdf)
  if (ext === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const latinStr = new TextDecoder('iso-8859-1').decode(bytes);

      // Trích xuất các khối ký tự text giữa /BT và /ET trong PDF
      const textMatches = latinStr.match(/\(([^()]+)\)\s*T[jJ]/g);
      if (textMatches && textMatches.length > 0) {
        const textParts = textMatches
          .map(m => {
            const inner = m.match(/\(([^()]+)\)/);
            return inner ? inner[1] : '';
          })
          .filter(t => t.trim().length > 0);
        
        const extracted = textParts.join(' ');
        if (extracted.trim().length > 50) {
          return extracted;
        }
      }
    } catch (err) {
      console.warn('Failed to parse pdf text', err);
    }
  }

  // Fallback nếu không trích xuất được text
  return `TÀI LIỆU ĐÍNH KÈM: ${file.name}\nDung lượng: ${(file.size / 1024).toFixed(1)} KB\nĐịnh dạng: ${ext.toUpperCase() || 'FILE'}\n\nThầy/Cô có thể bấm 'Tải về tệp gốc' để mở xem nguyên bản trên Microsoft Word, Adobe Acrobat hoặc ứng dụng tương ứng.`;
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
    return false;
  }

  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = doc.fileName || `${doc.code}_${doc.title}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error('Error downloading original file', e);
    return false;
  }
}
