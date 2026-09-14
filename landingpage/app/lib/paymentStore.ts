import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DetailedQuoteResult } from './paymentConfig';

export interface PaymentOrder {
  id: string;
  syncCode: string;
  planId: string;
  tier: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';
  amount: number;
  syntax: string;
  status: 'PENDING' | 'SUCCESS' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
  gateway?: string;
  transactionRef?: string;
  receiptId?: string;
  receiptHash?: string;
}

export interface VATInvoiceRequest {
  id: string;
  orderId: string;
  syncCode: string;
  companyName: string;
  taxCode: string;
  address: string;
  email: string;
  notes?: string;
  amount: number;
  status: 'PENDING' | 'ISSUED';
  requestedAt: string;
  issuedAt?: string;
}

export interface QuoteRequest {
  id: string;
  type: 'VIP2_CLASS' | 'SCHOOL_SCALE';
  syncCode: string;
  contactName: string;
  phone: string;
  email: string;
  organizationName: string; // Tên trường hoặc Tên lớp
  teacherCount?: number; // Số lượng Giáo viên
  studentCount?: number; // Số lượng Học sinh
  parentCount?: number; // Số lượng Phụ huynh
  notes?: string;
  status: 'PENDING' | 'CONTACTED' | 'QUOTED';
  createdAt: string;
  quoteDetails?: DetailedQuoteResult;
}

export interface LicenseRecord {
  syncCode: string;
  tier: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';
  planId: string;
  activatedAt: string;
  expiresAt: string;
  receiptId: string;
  receiptHash: string;
  amount: number;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'payment_records.json');

interface StoreData {
  orders: Record<string, PaymentOrder>;
  licenses: Record<string, LicenseRecord>;
  vatRequests: Record<string, VATInvoiceRequest>;
  quoteRequests: Record<string, QuoteRequest>;
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return {
        orders: parsed.orders || {},
        licenses: parsed.licenses || {},
        vatRequests: parsed.vatRequests || {},
        quoteRequests: parsed.quoteRequests || {}
      };
    }
  } catch (err) {
    console.warn('Cannot read payment_records.json, using fallback:', err);
  }
  return { orders: {}, licenses: {}, vatRequests: {}, quoteRequests: {} };
}

function saveStore(data: StoreData) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Cannot write payment_records.json:', err);
  }
}

let memoryStore: StoreData = loadStore();

export const PaymentStore = {
  createOrder(order: PaymentOrder): PaymentOrder {
    memoryStore = loadStore();
    memoryStore.orders[order.id] = order;
    saveStore(memoryStore);
    return order;
  },

  getOrder(id: string): PaymentOrder | undefined {
    memoryStore = loadStore();
    return memoryStore.orders[id];
  },

  getOrderBySyncCode(syncCode: string): PaymentOrder | undefined {
    memoryStore = loadStore();
    const clean = syncCode.trim().toUpperCase();
    const list = Object.values(memoryStore.orders);
    return list.reverse().find(o => o.syncCode.toUpperCase() === clean);
  },

  markOrderPaid(
    syncCode: string,
    planId: string,
    amount: number,
    transactionRef: string,
    gateway = 'SePay/ACB'
  ): { order: PaymentOrder; license: LicenseRecord } {
    memoryStore = loadStore();
    const cleanSync = syncCode.trim().toUpperCase();
    const cleanPlan = planId.trim().toUpperCase();

    const isSchool = cleanPlan.startsWith('SCHOOL');
    const isVip2 = cleanPlan.startsWith('VIP2');
    const isVip1 = cleanPlan.startsWith('VIP1') || cleanPlan.startsWith('PRO');
    const tier: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO' = isSchool ? 'SCHOOL' : (isVip2 ? 'VIP2' : 'VIP1');
    const isOneMonth = cleanPlan.includes('1M') || cleanPlan.includes('MONTH');
    const durationDays = isOneMonth ? 30 : 365;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const receiptId = `BL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const hashData = `${receiptId}|${cleanSync}|${tier}|${amount}|${now.toISOString()}|HUY_TECH_AI_KEY`;
    const receiptHash = crypto.createHash('sha256').update(hashData).digest('hex').substring(0, 32).toUpperCase();

    let order = Object.values(memoryStore.orders).reverse().find(
      o => o.syncCode.toUpperCase() === cleanSync && o.status === 'PENDING'
    );

    if (!order) {
      order = {
        id: `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        syncCode: cleanSync,
        planId: (cleanPlan as any) || (isSchool ? 'SCHOOL' : (isVip2 ? 'VIP2' : 'VIP1_1Y')),
        tier,
        amount,
        syntax: `ST ${cleanSync} ${cleanPlan}`,
        status: 'SUCCESS',
        createdAt: now.toISOString()
      };
    }

    order.status = 'SUCCESS';
    order.paidAt = now.toISOString();
    order.gateway = gateway;
    order.transactionRef = transactionRef;
    order.receiptId = receiptId;
    order.receiptHash = receiptHash;
    order.amount = amount || order.amount;

    memoryStore.orders[order.id] = order;

    const license: LicenseRecord = {
      syncCode: cleanSync,
      tier,
      planId: order.planId,
      activatedAt: now.toISOString(),
      expiresAt,
      receiptId,
      receiptHash,
      amount: order.amount
    };

    memoryStore.licenses[cleanSync] = license;
    saveStore(memoryStore);

    return { order, license };
  },

  getLicense(syncCode: string): LicenseRecord | undefined {
    memoryStore = loadStore();
    const clean = syncCode.trim().toUpperCase();
    const lic = memoryStore.licenses[clean];
    if (!lic) return undefined;
    if (new Date(lic.expiresAt).getTime() > Date.now()) {
      return lic;
    }
    return undefined;
  },

  saveVatRequest(req: Omit<VATInvoiceRequest, 'id' | 'status' | 'requestedAt'>): VATInvoiceRequest {
    memoryStore = loadStore();
    const id = `VAT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const record: VATInvoiceRequest = {
      ...req,
      id,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };
    memoryStore.vatRequests[id] = record;
    saveStore(memoryStore);
    return record;
  },

  saveQuoteRequest(req: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>): QuoteRequest {
    memoryStore = loadStore();
    const id = `QUOTE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const record: QuoteRequest = {
      ...req,
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    memoryStore.quoteRequests[id] = record;
    saveStore(memoryStore);
    return record;
  },

  getAllTransactions(): PaymentOrder[] {
    memoryStore = loadStore();
    return Object.values(memoryStore.orders).reverse();
  },

  getAllVatRequests(): VATInvoiceRequest[] {
    memoryStore = loadStore();
    return Object.values(memoryStore.vatRequests).reverse();
  },

  getAllQuoteRequests(): QuoteRequest[] {
    memoryStore = loadStore();
    return Object.values(memoryStore.quoteRequests).reverse();
  }
};
