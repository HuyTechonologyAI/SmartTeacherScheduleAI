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

-- Bật tính năng Row Level Security (RLS) để bảo vệ dữ liệu
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

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

-- Chỉ service_role (Admin) mới có quyền đọc danh sách
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
