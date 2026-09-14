// Module Tạo và Xuất Bản File Thuyết Trình PowerPoint (.pptx) Trực Tiếp Dành Cho Giáo Viên
// Hỗ trợ đầy đủ: Nội dung bài học, Hình ảnh minh họa chất lượng cao, Hiệu ứng chuyển slide (Transitions)
import JSZip from 'jszip';
import { LessonSlideItem } from './lessonPlanAi';

/**
 * Tạo hình ảnh minh họa vector chuẩn sư phạm dạng SVG cho từng loại slide
 */
function createSlideIllustrationSvg(type: string, title: string, subject: string): string {
  const cleanSub = (subject || '').toLowerCase();
  const isTechOrElectric = cleanSub.includes('điện') || cleanSub.includes('công nghệ') || cleanSub.includes('kỹ thuật') || cleanSub.includes('vật lí') || cleanSub.includes('tin học');

  switch (type) {
    case 'cover':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0369a1" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <rect width="600" height="450" rx="24" fill="url(#bgGrad)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="300" cy="200" r="110" fill="url(#circGrad)" opacity="0.15"/>
        <circle cx="300" cy="200" r="85" fill="#ffffff" stroke="#0284c7" stroke-width="4"/>
        <path d="M260 170 L340 170 L300 240 Z" fill="#0284c7" opacity="0.2"/>
        <circle cx="300" cy="180" r="24" fill="#0284c7"/>
        <path d="M260 235 C260 205 340 205 340 235 Z" fill="#0369a1"/>
        <path d="M240 140 L300 115 L360 140 L300 160 Z" fill="#0f172a"/>
        <path d="M350 145 L350 175" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
        <circle cx="350" cy="180" r="5" fill="#eab308"/>
        <path d="M160 290 L440 290" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
        <path d="M200 320 L400 320" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
        <rect x="170" y="345" width="260" height="36" rx="18" fill="#0284c7"/>
        <text x="300" y="368" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">HỌC LIỆU SỐ GDPT 2018</text>
        <path d="M100 100 L140 130 M460 120 L500 90 M110 320 L150 350 M450 350 L490 310" stroke="#38bdf8" stroke-width="2" opacity="0.6"/>
      </svg>`;

    case 'objectives':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <g transform="translate(50, 40)">
          <rect width="230" height="160" rx="16" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="50" cy="50" r="24" fill="#3b82f6"/>
          <text x="50" y="56" font-family="Arial" font-size="20" fill="#ffffff" text-anchor="middle">📖</text>
          <text x="90" y="45" font-family="Arial" font-size="16" font-weight="bold" fill="#1e40af">1. KIẾN THỨC</text>
          <text x="90" y="70" font-family="Arial" font-size="12" fill="#3b82f6">Khái niệm cốt lõi</text>
          <text x="30" y="110" font-family="Arial" font-size="12" fill="#1e3a8a">• Bản chất quy luật khoa học</text>
          <text x="30" y="135" font-family="Arial" font-size="12" fill="#1e3a8a">• Nắm vững định nghĩa chuẩn</text>
        </g>
        <g transform="translate(320, 40)">
          <rect width="230" height="160" rx="16" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
          <circle cx="50" cy="50" r="24" fill="#10b981"/>
          <text x="50" y="56" font-family="Arial" font-size="20" fill="#ffffff" text-anchor="middle">⚙️</text>
          <text x="90" y="45" font-family="Arial" font-size="16" font-weight="bold" fill="#065f46">2. KỸ NĂNG</text>
          <text x="90" y="70" font-family="Arial" font-size="12" fill="#059669">Thao tác thực hành</text>
          <text x="30" y="110" font-family="Arial" font-size="12" fill="#064e3b">• Phân tích & giải quyết vấn đề</text>
          <text x="30" y="135" font-family="Arial" font-size="12" fill="#064e3b">• Quy trình thao tác chuẩn xác</text>
        </g>
        <g transform="translate(50, 240)">
          <rect width="230" height="160" rx="16" fill="#fefce8" stroke="#f59e0b" stroke-width="2"/>
          <circle cx="50" cy="50" r="24" fill="#f59e0b"/>
          <text x="50" y="56" font-family="Arial" font-size="20" fill="#ffffff" text-anchor="middle">⭐</text>
          <text x="90" y="45" font-family="Arial" font-size="16" font-weight="bold" fill="#92400e">3. PHẨM CHẤT</text>
          <text x="90" y="70" font-family="Arial" font-size="12" fill="#d97706">Kỷ luật & Đạo đức</text>
          <text x="30" y="110" font-family="Arial" font-size="12" fill="#78350f">• Tinh thần trách nhiệm nghề</text>
          <text x="30" y="135" font-family="Arial" font-size="12" fill="#78350f">• Tuân thủ an toàn tuyệt đối</text>
        </g>
        <g transform="translate(320, 240)">
          <rect width="230" height="160" rx="16" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="2"/>
          <circle cx="50" cy="50" r="24" fill="#8b5cf6"/>
          <text x="50" y="56" font-family="Arial" font-size="20" fill="#ffffff" text-anchor="middle">💻</text>
          <text x="90" y="45" font-family="Arial" font-size="16" font-weight="bold" fill="#5b21b6">4. NĂNG LỰC SỐ</text>
          <text x="90" y="70" font-family="Arial" font-size="12" fill="#7c3aed">Chuyển đổi số giáo dục</text>
          <text x="30" y="110" font-family="Arial" font-size="12" fill="#4c1d95">• Tra cứu dữ liệu số hóa</text>
          <text x="30" y="135" font-family="Arial" font-size="12" fill="#4c1d95">• Tương tác học tập trực tuyến</text>
        </g>
      </svg>`;

    case 'warmup':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#fffbeb" stroke="#fef08a" stroke-width="2"/>
        <circle cx="300" cy="180" r="90" fill="#fef3c7" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="M300 110 C265 110 240 135 240 170 C240 195 260 215 280 230 L320 230 C340 215 360 195 360 170 C360 135 335 110 300 110 Z" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
        <rect x="285" y="230" width="30" height="20" rx="4" fill="#94a3b8"/>
        <rect x="290" y="250" width="20" height="8" rx="3" fill="#64748b"/>
        <line x1="300" y1="75" x2="300" y2="95" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <line x1="225" y1="105" x2="240" y2="120" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <line x1="375" y1="105" x2="360" y2="120" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
        <text x="300" y="190" font-family="Arial" font-size="48" font-weight="bold" fill="#b45309" text-anchor="middle">?</text>
        <rect x="100" y="290" width="400" height="80" rx="16" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <text x="300" y="325" font-family="Arial" font-size="16" font-weight="bold" fill="#b45309" text-anchor="middle">TÌNH HUỐNG THỰC TIỄN DẪN NHẬP</text>
        <text x="300" y="350" font-family="Arial" font-size="13" fill="#78350f" text-anchor="middle">Thời gian thảo luận mở đầu: 2 - 3 phút</text>
      </svg>`;

    case 'theory':
      if (isTechOrElectric) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
          <rect width="600" height="450" rx="24" fill="#f0f9ff" stroke="#bae6fd" stroke-width="2"/>
          <rect x="50" y="60" width="130" height="100" rx="12" fill="#0284c7"/>
          <text x="115" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">NGUỒN ĐIỆN</text>
          <text x="115" y="130" font-family="Arial" font-size="12" fill="#e0f2fe" text-anchor="middle">~ 220V / 380V</text>
          <path d="M180 110 L260 110" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
          <polygon points="260,105 270,110 260,115" fill="#0284c7"/>
          <rect x="270" y="60" width="140" height="100" rx="12" fill="#0369a1"/>
          <text x="340" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">TRẠM PHÂN PHỐI</text>
          <text x="340" y="130" font-family="Arial" font-size="12" fill="#e0f2fe" text-anchor="middle">Hệ thống bảo vệ</text>
          <path d="M410 110 L470 110" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
          <polygon points="470,105 480,110 470,115" fill="#0284c7"/>
          <rect x="480" y="60" width="90" height="100" rx="12" fill="#075985"/>
          <text x="525" y="105" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">PHỤ TẢI</text>
          <text x="525" y="130" font-family="Arial" font-size="12" fill="#e0f2fe" text-anchor="middle">Tiêu thụ</text>
          <rect x="80" y="210" width="440" height="180" rx="16" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
          <text x="300" y="245" font-family="Arial" font-size="16" font-weight="bold" fill="#0369a1" text-anchor="middle">QUY CHUẨN KỸ THUẬT & AN TOÀN ĐIỆN</text>
          <line x1="120" y1="265" x2="480" y2="265" stroke="#e2e8f0" stroke-width="2"/>
          <text x="120" y="295" font-family="Arial" font-size="13" fill="#0f172a">⚡ Tiêu chuẩn quốc gia: QCVN 01:2020/BCT</text>
          <text x="120" y="325" font-family="Arial" font-size="13" fill="#0f172a">🔒 Quy tắc 5 bước cắt điện & cô lập an toàn</text>
          <text x="120" y="355" font-family="Arial" font-size="13" fill="#0f172a">📐 Công thức: I = U / R | P = √3·U·I·cosφ</text>
        </svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="200" y="50" width="200" height="70" rx="14" fill="#0284c7"/>
        <text x="300" y="92" font-family="Arial" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">KHÁI NIỆM TRỌNG TÂM</text>
        <line x1="300" y1="120" x2="300" y2="160" stroke="#0284c7" stroke-width="3"/>
        <line x1="140" y1="160" x2="460" y2="160" stroke="#0284c7" stroke-width="3"/>
        <line x1="140" y1="160" x2="140" y2="200" stroke="#0284c7" stroke-width="3"/>
        <line x1="460" y1="160" x2="460" y2="200" stroke="#0284c7" stroke-width="3"/>
        <rect x="50" y="200" width="180" height="180" rx="14" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
        <text x="140" y="235" font-family="Arial" font-size="14" font-weight="bold" fill="#0369a1" text-anchor="middle">BẢN CHẤT KHOA HỌC</text>
        <text x="70" y="275" font-family="Arial" font-size="12" fill="#334155">• Cơ chế hình thành</text>
        <text x="70" y="305" font-family="Arial" font-size="12" fill="#334155">• Các thành phần cấu tạo</text>
        <text x="70" y="335" font-family="Arial" font-size="12" fill="#334155">• Mối quan hệ tương tác</text>
        <rect x="370" y="200" width="180" height="180" rx="14" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
        <text x="460" y="235" font-family="Arial" font-size="14" font-weight="bold" fill="#0369a1" text-anchor="middle">ỨNG DỤNG THỰC TẾ</text>
        <text x="390" y="275" font-family="Arial" font-size="12" fill="#334155">• Triển khai công nghiệp</text>
        <text x="390" y="305" font-family="Arial" font-size="12" fill="#334155">• Đời sống sinh hoạt</text>
        <text x="390" y="335" font-family="Arial" font-size="12" fill="#334155">• Định hướng phát triển</text>
      </svg>`;

    case 'procedure':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/>
        <g transform="translate(50, 60)">
          <circle cx="35" cy="35" r="28" fill="#16a34a"/>
          <text x="35" y="43" font-family="Arial" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
          <rect x="80" y="5" width="420" height="60" rx="12" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
          <text x="100" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#15803d">BƯỚC 1: CHUẨN BỊ & KHẢO SÁT</text>
          <text x="100" y="50" font-family="Arial" font-size="12" fill="#334155">Kiểm tra dụng cụ đo kiểm, trang bị bảo hộ lao động đạt chuẩn.</text>
        </g>
        <g transform="translate(50, 160)">
          <circle cx="35" cy="35" r="28" fill="#0284c7"/>
          <text x="35" y="43" font-family="Arial" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">2</text>
          <rect x="80" y="5" width="420" height="60" rx="12" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
          <text x="100" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#0369a1">BƯỚC 2: THỰC HIỆN THAO TÁC KỸ THUẬT</text>
          <text x="100" y="50" font-family="Arial" font-size="12" fill="#334155">Triển khai đúng sơ đồ, quy chuẩn kỹ thuật và giám sát thông số.</text>
        </g>
        <g transform="translate(50, 260)">
          <circle cx="35" cy="35" r="28" fill="#d97706"/>
          <text x="35" y="43" font-family="Arial" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">3</text>
          <rect x="80" y="5" width="420" height="60" rx="12" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>
          <text x="100" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#b45309">BƯỚC 3: KIỂM TRA & NGHIỆM THU</text>
          <text x="100" y="50" font-family="Arial" font-size="12" fill="#334155">Đánh giá kết quả, thu dọn vệ sinh 5S và lưu hồ sơ kỹ thuật.</text>
        </g>
        <rect x="120" y="360" width="360" height="44" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
        <text x="300" y="388" font-family="Arial" font-size="13" font-weight="bold" fill="#b91c1c" text-anchor="middle">⚠️ NGUYÊN TẮC: TUYỆT ĐỐI TUÂN THỦ QUY TRÌNH AN TOÀN</text>
      </svg>`;

    case 'discussion':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="2"/>
        <circle cx="300" cy="200" r="100" fill="#ffffff" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="6 4"/>
        <circle cx="300" cy="200" r="65" fill="#8b5cf6" opacity="0.1"/>
        <text x="300" y="195" font-family="Arial" font-size="18" font-weight="bold" fill="#6d28d9" text-anchor="middle">HOẠT ĐỘNG</text>
        <text x="300" y="220" font-family="Arial" font-size="14" fill="#7c3aed" text-anchor="middle">HỢP TÁC SỐ</text>
        <g transform="translate(150, 80)">
          <circle cx="30" cy="30" r="25" fill="#3b82f6"/>
          <text x="30" y="36" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">N1</text>
        </g>
        <g transform="translate(390, 80)">
          <circle cx="30" cy="30" r="25" fill="#10b981"/>
          <text x="30" y="36" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">N2</text>
        </g>
        <g transform="translate(150, 260)">
          <circle cx="30" cy="30" r="25" fill="#f59e0b"/>
          <text x="30" y="36" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">N3</text>
        </g>
        <g transform="translate(390, 260)">
          <circle cx="30" cy="30" r="25" fill="#ec4899"/>
          <text x="30" y="36" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">N4</text>
        </g>
        <rect x="100" y="355" width="400" height="55" rx="14" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.5"/>
        <text x="300" y="388" font-family="Arial" font-size="14" font-weight="bold" fill="#5b21b6" text-anchor="middle">📱 Quét QR hoặc tương tác trên màn hình nhóm</text>
      </svg>`;

    case 'quiz':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#fff7ed" stroke="#fed7aa" stroke-width="2"/>
        <g transform="translate(60, 50)">
          <rect width="220" height="120" rx="14" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
          <circle cx="40" cy="60" r="20" fill="#ef4444"/>
          <text x="40" y="67" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>
          <text x="80" y="65" font-family="Arial" font-size="15" font-weight="bold" fill="#991b1b">Lựa chọn A</text>
        </g>
        <g transform="translate(320, 50)">
          <rect width="220" height="120" rx="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="40" cy="60" r="20" fill="#3b82f6"/>
          <text x="40" y="67" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text>
          <text x="80" y="65" font-family="Arial" font-size="15" font-weight="bold" fill="#1e40af">Lựa chọn B</text>
        </g>
        <g transform="translate(60, 200)">
          <rect width="220" height="120" rx="14" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
          <circle cx="40" cy="60" r="20" fill="#eab308"/>
          <text x="40" y="67" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">C</text>
          <text x="80" y="65" font-family="Arial" font-size="15" font-weight="bold" fill="#854d0e">Lựa chọn C</text>
        </g>
        <g transform="translate(320, 200)">
          <rect width="220" height="120" rx="14" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
          <circle cx="40" cy="60" r="20" fill="#22c55e"/>
          <text x="40" y="67" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
          <text x="80" y="65" font-family="Arial" font-size="15" font-weight="bold" fill="#166534">Lựa chọn D</text>
        </g>
        <rect x="130" y="350" width="340" height="50" rx="12" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
        <text x="300" y="382" font-family="Arial" font-size="15" font-weight="bold" fill="#c2410c" text-anchor="middle">🏆 TRÒ CHƠI CỦNG CỐ TRẮC NGHIỆM</text>
      </svg>`;

    case 'summary':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <rect width="600" height="450" rx="24" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="50" y="40" width="500" height="80" rx="16" fill="#0284c7"/>
        <text x="300" y="78" font-family="Arial" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">TỔNG KẾT & GIAO NHIỆM VỤ TỰ HỌC</text>
        <text x="300" y="102" font-family="Arial" font-size="13" fill="#e0f2fe" text-anchor="middle">Khắc sâu kiến thức - Vận dụng vào đời sống</text>
        <g transform="translate(70, 150)">
          <circle cx="20" cy="25" r="16" fill="#10b981"/>
          <text x="20" y="31" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">✓</text>
          <text x="50" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#0f172a">1. Ghi nhớ các khái niệm cốt lõi của bài học</text>
        </g>
        <g transform="translate(70, 210)">
          <circle cx="20" cy="25" r="16" fill="#10b981"/>
          <text x="20" y="31" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">✓</text>
          <text x="50" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#0f172a">2. Hoàn thành bài tập trong SGK và Phiếu học tập số</text>
        </g>
        <g transform="translate(70, 270)">
          <circle cx="20" cy="25" r="16" fill="#10b981"/>
          <text x="20" y="31" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle">✓</text>
          <text x="50" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#0f172a">3. Đọc trước bài mới và chuẩn bị học liệu theo hướng dẫn</text>
        </g>
        <rect x="150" y="345" width="300" height="50" rx="25" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
        <text x="300" y="376" font-family="Arial" font-size="15" font-weight="bold" fill="#1d4ed8" text-anchor="middle">CHÚC CÁC EM HỌC TẬP TỐT! 🎉</text>
      </svg>`;
  }
}

/**
 * Chuyển đổi SVG thành PNG Data URL (nếu có Canvas trên trình duyệt),
 * hoặc trả về SVG Data URL dự phòng
 */
async function svgToDataUrl(svgString: string, width: number = 800, height: number = 600): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'image/svg+xml;base64,' + Buffer.from(svgString).toString('base64');
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            const dataUrl = canvas.toDataURL('image/png');
            return resolve(dataUrl);
          }
        } catch (_) {}
        URL.revokeObjectURL(url);
        resolve('image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))));
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))));
      };

      img.src = url;
    } catch (_) {
      resolve('image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))));
    }
  });
}

/**
 * Nhúng hiệu ứng chuyển slide (Transitions) vào các tệp slide XML bên trong PPTX
 */
async function injectSlideTransitions(rawPptxBuffer: ArrayBuffer | Uint8Array): Promise<Blob> {
  const zip = await JSZip.loadAsync(rawPptxBuffer);

  // Danh mục các hiệu ứng chuyển slide chuyên nghiệp (Transitions)
  const transitions = [
    '<p:transition spd="med" advClick="1"><p:fade/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:push dir="r"/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:wipe dir="r"/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:fade/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:push dir="l"/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:wipe dir="l"/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:fade/></p:transition>',
    '<p:transition spd="med" advClick="1"><p:push dir="r"/></p:transition>'
  ];

  const slideFiles = Object.keys(zip.files).filter(
    f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml')
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });

  for (let i = 0; i < slideFiles.length; i++) {
    const filename = slideFiles[i];
    const file = zip.file(filename);
    if (!file) continue;

    let xml = await file.async('text');
    const trans = transitions[i % transitions.length];

    // Chỉ chèn nếu slide chưa có transition
    if (!xml.includes('<p:transition')) {
      if (xml.includes('</p:clrMapOvr>')) {
        xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + trans);
      } else if (xml.includes('</p:sld>')) {
        xml = xml.replace('</p:sld>', trans + '</p:sld>');
      }
      zip.file(filename, xml);
    }
  }

  const modifiedBuffer = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });

  return modifiedBuffer;
}

/**
 * Tạo và tải trực tiếp tệp PowerPoint (.pptx) chuẩn cho Giáo viên
 */
export async function generateAndDownloadPptx(params: {
  slides: LessonSlideItem[];
  lessonTitle: string;
  subject: string;
  className?: string;
  teacherName?: string;
  schoolName?: string;
}): Promise<void> {
  const {
    slides,
    lessonTitle,
    subject,
    className = 'Lớp học',
    teacherName = 'Giáo viên bộ môn',
    schoolName = 'Trường THPT'
  } = params;

  // Import động PptxGenJS để đảm bảo tương thích tuyệt đối môi trường Next.js SSR
  const pptxgenModule = await import('pptxgenjs');
  const PptxGenJS = pptxgenModule.default || pptxgenModule;
  const pptx = new PptxGenJS();

  // Định dạng màn hình rộng 16:9 hiện đại
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = teacherName;
  pptx.company = schoolName;
  pptx.subject = subject;
  pptx.title = `Bài giảng: ${lessonTitle}`;

  const illustrationTypes = ['cover', 'objectives', 'warmup', 'theory', 'procedure', 'discussion', 'quiz', 'summary'];

  // 1. DUYỆT TỪNG SLIDE ĐỂ THIẾT KẾ ĐỒ HỌA CHUYÊN NGHIỆP
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();
    const type = illustrationTypes[i % illustrationTypes.length];

    // Lời giảng của Giáo viên (Speaker Notes hiển thị trên chế độ Presenter)
    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }

    // --- SLIDE 1: SLIDE TIÊU ĐỀ (COVER SLIDE ĐẲNG CẤP) ---
    if (i === 0) {
      slide.background = { color: '0A192F' }; // Nền xanh bóng tối sang trọng

      // Dải màu trang trí phía trên
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.15,
        fill: { color: '0284C7' }
      });

      // Huy hiệu Chuyển đổi số GDPT 2018
      slide.addText('🌟 KẾ HOẠCH BÀI DẠY SỐ • CHUẨN GDPT 2018', {
        x: 0.8,
        y: 0.6,
        w: 8.4,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: '38BDF8',
        fontFace: 'Calibri'
      });

      // Tên bài giảng lớn nổi bật
      slide.addText(lessonTitle.toUpperCase(), {
        x: 0.8,
        y: 1.1,
        w: 5.5,
        h: 1.8,
        fontSize: 26,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
        valign: 'top',
        wrap: true
      });

      // Thẻ thông tin Môn học & Lớp
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.1,
        w: 5.4,
        h: 1.6,
        rectRadius: 0.15,
        fill: { color: '1E293B' },
        line: { color: '334155', width: 1 }
      });

      slide.addText([
        { text: '📚 Môn học: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${subject}\\n`, options: { color: 'E2E8F0', fontSize: 13 } },
        { text: '🏫 Đối tượng: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${className} • ${schoolName}\\n`, options: { color: 'E2E8F0', fontSize: 13 } },
        { text: '👨‍🏫 Người giảng dạy: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${teacherName}`, options: { color: '34D399', fontSize: 13, bold: true } }
      ], {
        x: 1.0,
        y: 3.2,
        w: 5.0,
        h: 1.4,
        fontFace: 'Calibri',
        valign: 'middle'
      });

      // Hình ảnh minh họa Cover bên phải
      const svg = createSlideIllustrationSvg('cover', lessonTitle, subject);
      const imgData = await svgToDataUrl(svg, 600, 450);
      slide.addImage({
        data: imgData,
        x: 6.5,
        y: 1.1,
        w: 3.0,
        h: 3.6
      });

      continue;
    }

    // --- CÁC SLIDE NỘI DUNG (SLIDE 2 ĐẾN N) ---
    slide.background = { color: 'F8FAFC' };

    // Thanh tiêu đề phía trên (Header Banner)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.95,
      fill: { color: '0284C7' }
    });

    // Huy hiệu số thứ tự Slide
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 0.2,
      w: 1.1,
      h: 0.55,
      rectRadius: 0.1,
      fill: { color: '0369A1' },
      line: { color: '38BDF8', width: 1 }
    });
    slide.addText(`SLIDE ${s.slideNumber}`, {
      x: 0.5,
      y: 0.2,
      w: 1.1,
      h: 0.55,
      fontSize: 11,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial'
    });

    // Tiêu đề Slide
    slide.addText(s.title.toUpperCase(), {
      x: 1.75,
      y: 0.15,
      w: 7.8,
      h: 0.65,
      fontSize: 17,
      bold: true,
      color: 'FFFFFF',
      valign: 'middle',
      fontFace: 'Arial'
    });

    // Khung nội dung chính bên trái
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 1.15,
      w: 5.5,
      h: 3.8,
      rectRadius: 0.15,
      fill: { color: 'FFFFFF' },
      line: { color: 'E2E8F0', width: 1.5 }
    });

    // Tiêu đề nội dung chiếu
    slide.addText('📌 NỘI DUNG TRÌNH CHIẾU TRỌNG TÂM:', {
      x: 0.7,
      y: 1.25,
      w: 5.1,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: '0369A1',
      fontFace: 'Calibri'
    });

    // Các gạch đầu dòng bài học
    const bulletItems = s.bulletPoints.map(bp => ({
      text: bp + '\\n',
      options: {
        fontSize: 12.5,
        color: '1E293B',
        fontFace: 'Calibri',
        bullet: { code: '2022' },
        spaceAfter: 8
      }
    }));

    slide.addText(bulletItems, {
      x: 0.8,
      y: 1.65,
      w: 5.0,
      h: 3.1,
      valign: 'top',
      wrap: true
    });

    // Khung hình ảnh minh họa bên phải
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.2,
      y: 1.15,
      w: 3.3,
      h: 3.8,
      rectRadius: 0.15,
      fill: { color: 'FFFFFF' },
      line: { color: '38BDF8', width: 1.5 }
    });

    // Ảnh minh họa trực quan
    const svg = createSlideIllustrationSvg(type, s.title, subject);
    const imgData = await svgToDataUrl(svg, 600, 450);
    slide.addImage({
      data: imgData,
      x: 6.3,
      y: 1.25,
      w: 3.1,
      h: 2.7
    });

    // Chú thích hình ảnh & Gợi ý sư phạm bên dưới ảnh
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.3,
      y: 4.05,
      w: 3.1,
      h: 0.8,
      rectRadius: 0.1,
      fill: { color: 'F0F9FF' },
      line: { color: 'BAE6FD', width: 1 }
    });
    slide.addText([
      { text: '💡 Minh họa trực quan: ', options: { bold: true, color: '0284C7', fontSize: 10 } },
      { text: s.visualSuggestion ? s.visualSuggestion.slice(0, 80) : 'Sơ đồ & dữ liệu hỗ trợ tư duy học sinh.', options: { color: '0369A1', fontSize: 9.5 } }
    ], {
      x: 6.4,
      y: 4.1,
      w: 2.9,
      h: 0.7,
      fontFace: 'Calibri',
      valign: 'middle',
      wrap: true
    });

    // Chân trang (Footer)
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 5.25,
      w: 10,
      h: 0.375,
      fill: { color: 'F1F5F9' },
      line: { color: 'E2E8F0', width: 1 }
    });
    slide.addText(`📖 ${subject} - ${lessonTitle} | ${className} | Hiệu ứng chuyển slide tự động kích hoạt`, {
      x: 0.5,
      y: 5.25,
      w: 8.0,
      h: 0.375,
      fontSize: 9.5,
      color: '64748B',
      valign: 'middle',
      fontFace: 'Calibri'
    });
    slide.addText(`Trang ${s.slideNumber}/${slides.length}`, {
      x: 8.5,
      y: 5.25,
      w: 1.0,
      h: 0.375,
      fontSize: 9.5,
      bold: true,
      color: '0284C7',
      align: 'right',
      valign: 'middle',
      fontFace: 'Calibri'
    });
  }

  // 2. XUẤT RA DỮ LIỆU THÔ VÀ BỔ SUNG HIỆU ỨNG TRANSITIONS BẰNG JSZIP
  const rawPptx = await pptx.write({ outputType: 'arraybuffer' });
  const finalBlob = await injectSlideTransitions(rawPptx as ArrayBuffer);

  // 3. KÍCH HOẠT TẢI XUỐNG TRÌNH DUYỆT
  const cleanFileName = `Slide_${lessonTitle.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.pptx`;
  const blobUrl = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = cleanFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}
