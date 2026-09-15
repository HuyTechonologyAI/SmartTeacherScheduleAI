-- ==============================================================================
-- SCHEMA CHO LANDING PAGE SMART TEACHER SCHEDULE AI (SUPABASE)
-- Tác giả: Made in Huy Technology AI (0961364600 - huytechnologyai2025@gmail.com)
-- ==============================================================================

-- 1. Bảng lưu trữ yêu cầu hỗ trợ và đăng ký nhận Prompt từ Thầy/Cô
CREATE TABLE IF NOT EXISTS public.support_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_or_zalo TEXT NOT NULL,
    email TEXT,
    school_name TEXT,
    subject_taught TEXT,
    selected_plan TEXT DEFAULT 'Gói Miễn Phí',
    message TEXT,
    prompt_selected TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng lưu trữ thông tin giáo viên đăng ký nâng cấp gói trả phí
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    teacher_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    plan_name TEXT NOT NULL, -- 'PRO_MONTHLY', 'PRO_YEARLY', 'SCHOOL_ENTERPRISE'
    billing_cycle TEXT NOT NULL, -- 'MONTHLY' | 'YEARLY'
    amount_expected NUMERIC,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'CANCELLED'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng đồng bộ dữ liệu đám mây đa nền tảng an toàn (Web, Android, Desktop)
CREATE TABLE IF NOT EXISTS public.teacher_sync_stores (
    sync_code TEXT PRIMARY KEY,
    pin_hash TEXT, -- Mã băm SHA-256 của PIN bảo vệ (null nếu chưa bật PIN)
    payload JSONB NOT NULL,
    version TEXT DEFAULT '1.6.0',
    device_name TEXT,
    platform TEXT,
    updated_at BIGINT NOT NULL, -- Unix timestamp (ms)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật tính năng Row Level Security (RLS) để bảo vệ dữ liệu
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_sync_stores ENABLE ROW LEVEL SECURITY;

-- Cho phép khách truy cập (anon) gửi form đăng ký hỗ trợ
CREATE POLICY "Cho phép gửi form hỗ trợ" 
ON public.support_requests 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Cho phép khách truy cập (anon) gửi yêu cầu nâng cấp gói
CREATE POLICY "Cho phép gửi đăng ký gói" 
ON public.subscriptions 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Cho phép API đồng bộ tương tác với teacher_sync_stores (Xác thực PIN thực hiện qua API Route)
CREATE POLICY "Cho phép API đọc sync store"
ON public.teacher_sync_stores
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Cho phép API tạo mới sync store"
ON public.teacher_sync_stores
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Cho phép API cập nhật sync store"
ON public.teacher_sync_stores
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Quyền Admin cho service_role
CREATE POLICY "Admin đọc danh sách hỗ trợ" 
ON public.support_requests 
FOR SELECT 
TO service_role 
USING (true);

CREATE POLICY "Admin đọc danh sách đăng ký gói" 
ON public.subscriptions 
FOR SELECT 
TO service_role 
USING (true);

CREATE POLICY "Admin toàn quyền sync store" 
ON public.teacher_sync_stores 
FOR ALL 
TO service_role 
USING (true);

-- 4. Bảng lưu trữ Voucher Khuyến Mãi do Admin khởi tạo và quản lý
CREATE TABLE IF NOT EXISTS public.vouchers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT DEFAULT 'PERCENT', -- 'PERCENT', 'FIXED_AMOUNT', 'FREE_TRIAL', 'GRANT_TIER'
    discount_value NUMERIC DEFAULT 0,
    target_tier TEXT DEFAULT 'VIP1', -- 'ALL', 'VIP1', 'VIP2', 'SCHOOL', 'PRO'
    grant_tier TEXT DEFAULT 'VIP1', -- 'NONE', 'VIP1', 'VIP2', 'SCHOOL'
    grant_duration_days INT DEFAULT 30,
    target_audience TEXT DEFAULT 'ALL',
    max_usage INT DEFAULT 100,
    used_count INT DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '[]'::jsonb,
    gift_message TEXT,
    assigned_teachers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Bảng lịch sử kích hoạt Voucher từ giáo viên
CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
    id TEXT PRIMARY KEY,
    voucher_code TEXT NOT NULL,
    sync_code TEXT NOT NULL,
    teacher_name TEXT,
    school_name TEXT,
    phone TEXT,
    original_price NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    final_price NUMERIC DEFAULT 0,
    applied_tier TEXT,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc vouchers đang hoạt động"
ON public.vouchers FOR SELECT TO anon USING (true);

CREATE POLICY "Cho phép kích hoạt voucher"
ON public.voucher_redemptions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admin toàn quyền vouchers"
ON public.vouchers FOR ALL TO service_role USING (true);

CREATE POLICY "Admin toàn quyền voucher redemptions"
ON public.voucher_redemptions FOR ALL TO service_role USING (true);


