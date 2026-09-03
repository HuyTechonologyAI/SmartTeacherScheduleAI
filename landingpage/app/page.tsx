"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import ExpertSection from "@/components/ExpertSection";
import PricingSection from "@/components/PricingSection";
import SupportFormSection from "@/components/SupportFormSection";
import Footer from "@/components/Footer";
import AIAssistantWidget from "@/components/AIAssistantWidget";

export default function HomePage() {
  const [selectedPlanForForm, setSelectedPlanForForm] = useState(
    "Gói Giáo Viên Pro (VIP Cá Nhân)"
  );

  const handleSelectPlan = (planName: string) => {
    setSelectedPlanForForm(planName);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#090D16] text-white">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. [YÊU CẦU 1] TẢI APP NẰM VỊ TRÍ ĐẦU TIÊN (HERO DOWNLOAD SECTION) */}
      <HeroSection />

      {/* 3. [YÊU CẦU 2] GIỚI THIỆU VỀ APP & 6 TÍNH NĂNG ĐỘT PHÁ */}
      <FeatureSection />

      {/* 4. [YÊU CẦU 3] GIỚI THIỆU CHUYÊN GIA TẠO APP (MADE IN HUY TECHNOLOGY AI) */}
      <ExpertSection />

      {/* 5. [YÊU CẦU 4] ĐĂNG KÝ LÊN CÁC GÓI TRẢ PHÍ (MONETIZATION / PRICING) */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* 6. [YÊU CẦU 5 & 6] LIÊN HỆ, PROMPT MẪU CHO THẦY CÔ & LƯU SUPABASE */}
      <SupportFormSection initialPlan={selectedPlanForForm} />

      {/* 7. Chân trang bản quyền và liên hệ */}
      <Footer />

      {/* 8. Nút & Hộp thoại AI Hỗ Trợ 24/7 Giải Đáp Mọi Thắc Mắc Về App */}
      <AIAssistantWidget />
    </main>
  );
}
