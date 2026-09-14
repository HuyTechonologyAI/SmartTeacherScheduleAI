import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface PaymentOrder {
  id: string;
  syncCode: string;
  planId: 'PRO1M' | 'PRO1Y' | 'SCHOOL1Y';
  tier: 'PRO' | 'SCHOOL';
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

export interface LicenseRecord {
  syncCode: string;
  tier: 'PRO' | 'SCHOOL';
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
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Cannot read payment_records.json, using fallback:', err);
  }
  return { orders: {}, licenses: {}, vatRequests: {} };
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
    const tier: 'PRO' | 'SCHOOL' = isSchool ? 'SCHOOL' : 'PRO';
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
        planId: (cleanPlan as any) || (isSchool ? 'SCHOOL1Y' : 'PRO1Y'),
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

  getAllTransactions(): PaymentOrder[] {
    memoryStore = loadStore();
    return Object.values(memoryStore.orders).reverse();
  },

  getAllVatRequests(): VATInvoiceRequest[] {
    memoryStore = loadStore();
    return Object.values(memoryStore.vatRequests).reverse();
  }
};
