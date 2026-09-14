'use client';

export interface HuyTechUserSession {
  huyTechId: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'TEACHER' | 'PRINCIPAL' | 'ACCOUNTANT' | 'ADMIN';
  ecosystemAccess: {
    eduViet: boolean;
    smartTax: boolean;
    masterHub: boolean;
  };
  token: string;
  createdAt: string;
}

const STORAGE_KEY = 'huytech_ecosystem_sso_session_v1';

export function getHuyTechSession(): HuyTechUserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHuyTechSession(session: HuyTechUserSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving HuyTech SSO session:', e);
  }
}

export function clearHuyTechSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateHuyTechSsoSession(identifier = '0961364600', fullName = 'Thầy/Cô Giáo Viên'): HuyTechUserSession {
  const cleanId = (identifier || '0961364600').replace(/[^0-9]/g, '').slice(-4) || '8888';
  const timestamp = Date.now().toString().slice(-4);
  const huyTechId = `HTID-${cleanId}-${timestamp}`;

  const session: HuyTechUserSession = {
    huyTechId,
    fullName,
    email: identifier.includes('@') ? identifier : `teacher.${cleanId}@huycncdsai.io.vn`,
    phone: identifier.includes('@') ? '0961364600' : identifier,
    role: 'TEACHER',
    ecosystemAccess: {
      eduViet: true,
      smartTax: true,
      masterHub: true
    },
    token: `ht_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  saveHuyTechSession(session);
  return session;
}
