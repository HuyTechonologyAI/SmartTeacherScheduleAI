// Module Tạo và Xuất Bản File Thuyết Trình PowerPoint (.pptx) Chuẩn 100% Văn Bản Chỉnh Sửa Được
// Đáp ứng tiêu chuẩn:
// 1. 100% nội dung chữ (tiêu đề, thẻ mục tiêu, quy trình, câu hỏi, đáp án, dặn dò) là Native PowerPoint Text có thể nhấp chuột chỉnh sửa trực tiếp.
// 2. Hình ảnh minh họa vector sắc nét (thuần đồ họa, không chứa text tĩnh bị khóa).
// 3. Đầy đủ hiệu ứng chuyển slide (Fade, Push, Wipe) chuẩn OpenXML.
// 4. Tích hợp Speaker Notes trong chế độ Presenter View.
import JSZip from 'jszip';
import { LessonSlideItem } from './lessonPlanAi';

/**
 * Tạo hình ảnh minh họa vector thuần đồ họa (Icons & Visual Art - KHÔNG chứa chữ tĩnh)
 * Đảm bảo mọi nội dung chữ trên slide đều là Text Box riêng biệt, giáo viên tùy ý chỉnh sửa.
 */
function createPureGraphicIllustrationSvg(type: string, subject: string): string {
  const cleanSub = (subject || '').toLowerCase();
  const isElectricOrTech = cleanSub.includes('điện') || cleanSub.includes('công nghệ') || cleanSub.includes('kỹ thuật') || cleanSub.includes('vật lí');

  switch (type) {
    case 'cover':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.1"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3"/>
          </linearGradient>
        </defs>
        <circle cx="250" cy="225" r="180" fill="url(#g2)"/>
        <circle cx="250" cy="225" r="130" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 6"/>
        <path d="M250 80 L350 135 L250 190 L150 135 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="4"/>
        <path d="M190 157 L190 230 C190 260 310 260 310 230 L310 157" fill="none" stroke="#38bdf8" stroke-width="4"/>
        <path d="M340 145 L360 220" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="360" cy="230" r="8" fill="#f59e0b"/>
        <circle cx="250" cy="320" r="45" fill="#ffffff" stroke="#0284c7" stroke-width="4"/>
        <path d="M250 295 C235 295 225 305 225 320 C225 330 235 340 242 345 L258 345 C265 340 275 330 275 320 C275 305 265 295 250 295 Z" fill="#fbbf24"/>
        <line x1="250" y1="280" x2="250" y2="290" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="220" y1="290" x2="230" y2="298" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <line x1="280" y1="290" x2="270" y2="298" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <circle cx="120" cy="180" r="15" fill="#0284c7" opacity="0.6"/>
        <circle cx="380" cy="290" r="18" fill="#10b981" opacity="0.6"/>
        <circle cx="150" cy="330" r="12" fill="#8b5cf6" opacity="0.6"/>
      </svg>`;

    case 'objectives':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="225" r="170" fill="#f0f9ff" stroke="#bae6fd" stroke-width="3"/>
        <circle cx="250" cy="225" r="130" fill="#e0f2fe" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="250" cy="225" r="85" fill="#bae6fd" stroke="#0284c7" stroke-width="4"/>
        <circle cx="250" cy="225" r="45" fill="#0284c7"/>
        <path d="M250 140 L250 310 M165 225 L335 225" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="250" cy="225" r="18" fill="#fbbf24"/>
        <path d="M290 90 L390 50 L350 150 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
        <line x1="250" y1="225" x2="370" y2="80" stroke="#ef4444" stroke-width="4" stroke-dasharray="6 4"/>
      </svg>`;

    case 'warmup':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="200" r="120" fill="#fef3c7" stroke="#f59e0b" stroke-width="4" stroke-dasharray="8 6"/>
        <path d="M250 110 C210 110 180 140 180 180 C180 215 205 240 225 255 L275 255 C295 240 320 215 320 180 C320 140 290 110 250 110 Z" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
        <rect x="230" y="255" width="40" height="25" rx="5" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
        <rect x="238" y="280" width="24" height="12" rx="4" fill="#64748b"/>
        <line x1="250" y1="70" x2="250" y2="95" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <line x1="160" y1="100" x2="180" y2="120" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <line x1="340" y1="100" x2="320" y2="120" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <line x1="120" y1="180" x2="150" y2="180" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <line x1="380" y1="180" x2="350" y2="180" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
        <circle cx="340" cy="290" r="55" fill="none" stroke="#0284c7" stroke-width="8"/>
        <line x1="380" y1="330" x2="430" y2="380" stroke="#0284c7" stroke-width="12" stroke-linecap="round"/>
      </svg>`;

    case 'theory':
      if (isElectricOrTech) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
          <rect x="50" y="80" width="400" height="280" rx="20" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/>
          <circle cx="130" cy="180" r="45" fill="#ffffff" stroke="#0284c7" stroke-width="4"/>
          <path d="M110 180 C110 160 130 160 130 180 C130 200 150 200 150 180" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
          <line x1="175" y1="180" x2="240" y2="180" stroke="#0f172a" stroke-width="4"/>
          <rect x="240" y="155" width="80" height="50" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="4"/>
          <path d="M260 180 L270 165 L280 195 L290 170 L300 180" fill="none" stroke="#f59e0b" stroke-width="3"/>
          <line x1="320" y1="180" x2="390" y2="180" stroke="#0f172a" stroke-width="4"/>
          <line x1="390" y1="180" x2="390" y2="280" stroke="#0f172a" stroke-width="4"/>
          <line x1="390" y1="280" x2="130" y2="280" stroke="#0f172a" stroke-width="4"/>
          <line x1="130" y1="280" x2="130" y2="225" stroke="#0f172a" stroke-width="4"/>
          <circle cx="280" cy="280" r="10" fill="#ef4444"/>
          <polygon points="210,175 225,180 210,185" fill="#0284c7"/>
          <polygon points="350,175 365,180 350,185" fill="#0284c7"/>
        </svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="225" r="160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="250" cy="225" r="60" fill="#0284c7"/>
        <circle cx="130" cy="140" r="40" fill="#38bdf8"/>
        <circle cx="370" cy="140" r="40" fill="#10b981"/>
        <circle cx="160" cy="330" r="40" fill="#f59e0b"/>
        <circle cx="340" cy="330" r="40" fill="#8b5cf6"/>
        <line x1="250" y1="225" x2="130" y2="140" stroke="#0284c7" stroke-width="3"/>
        <line x1="250" y1="225" x2="370" y2="140" stroke="#0284c7" stroke-width="3"/>
        <line x1="250" y1="225" x2="160" y2="330" stroke="#0284c7" stroke-width="3"/>
        <line x1="250" y1="225" x2="340" y2="330" stroke="#0284c7" stroke-width="3"/>
      </svg>`;

    case 'procedure':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <path d="M250 70 L380 120 L380 260 C380 330 250 380 250 380 C250 380 120 330 120 260 L120 120 Z" fill="#ecfdf5" stroke="#10b981" stroke-width="5"/>
        <path d="M200 220 L235 255 L305 185" fill="none" stroke="#16a34a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="150" cy="340" r="35" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
        <path d="M140 335 L160 335 M150 325 L150 355" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>
        <circle cx="350" cy="340" r="35" fill="#eff6ff" stroke="#3b82f6" stroke-width="4"/>
        <circle cx="350" cy="340" r="15" fill="#3b82f6"/>
      </svg>`;

    case 'discussion':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="225" r="140" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="8 6"/>
        <circle cx="250" cy="225" r="60" fill="#ffffff" stroke="#8b5cf6" stroke-width="4"/>
        <path d="M230 225 C230 210 270 210 270 225 L270 240 L230 240 Z" fill="#8b5cf6"/>
        <circle cx="250" cy="205" r="12" fill="#8b5cf6"/>
        <g transform="translate(140, 100)"><circle cx="25" cy="25" r="25" fill="#3b82f6"/></g>
        <g transform="translate(310, 100)"><circle cx="25" cy="25" r="25" fill="#10b981"/></g>
        <g transform="translate(140, 270)"><circle cx="25" cy="25" r="25" fill="#f59e0b"/></g>
        <g transform="translate(310, 270)"><circle cx="25" cy="25" r="25" fill="#ec4899"/></g>
        <path d="M190 135 L225 180 M275 180 L310 135 M190 290 L225 260 M275 260 L310 290" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>
      </svg>`;

    case 'quiz':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="225" r="150" fill="#fff7ed" stroke="#fed7aa" stroke-width="3"/>
        <path d="M180 140 L320 140 L300 240 C300 280 200 280 200 240 Z" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
        <path d="M180 160 C140 160 140 200 185 200" fill="none" stroke="#d97706" stroke-width="4"/>
        <path d="M320 160 C360 160 360 200 315 200" fill="none" stroke="#d97706" stroke-width="4"/>
        <rect x="235" y="270" width="30" height="40" fill="#d97706"/>
        <rect x="200" y="310" width="100" height="25" rx="6" fill="#78350f"/>
        <polygon points="250,165 257,185 277,185 261,197 267,217 250,205 233,217 239,197 223,185 243,185" fill="#ffffff"/>
      </svg>`;

    case 'summary':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 450" width="500" height="450">
        <circle cx="250" cy="225" r="150" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="3"/>
        <path d="M250 80 C270 120 290 180 280 230 L220 230 C210 180 230 120 250 80 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/>
        <circle cx="250" cy="150" r="16" fill="#ffffff" stroke="#0284c7" stroke-width="3"/>
        <path d="M220 200 L180 230 L220 235 Z" fill="#0284c7"/>
        <path d="M280 200 L320 230 L280 235 Z" fill="#0284c7"/>
        <polygon points="230,235 250,290 270,235" fill="#f59e0b"/>
        <polygon points="238,235 250,270 262,235" fill="#fef08a"/>
        <path d="M150 110 L155 125 L170 125 L158 135 L162 150 L150 140 L138 150 L142 135 L130 125 L145 125 Z" fill="#f59e0b"/>
        <path d="M350 110 L355 125 L370 125 L358 135 L362 150 L350 140 L338 150 L342 135 L330 125 L345 125 Z" fill="#f59e0b"/>
      </svg>`;
  }
}

/**
 * Chuyển SVG thành Data URL (PNG hoặc base64 SVG)
 */
async function svgToDataUrl(svgString: string, width: number = 600, height: number = 450): Promise<string> {
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
            return resolve(canvas.toDataURL('image/png'));
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
 * Nhúng hiệu ứng chuyển slide (Transitions) chuẩn OpenXML
 */
async function injectSlideTransitions(rawPptxBuffer: ArrayBuffer | Uint8Array): Promise<Blob> {
  const zip = await JSZip.loadAsync(rawPptxBuffer);

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
 * TẠO VÀ XUẤT BẢN FILE POWERPOINT (.PPTX) 100% VĂN BẢN CHỈNH SỬA ĐƯỢC
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

  const pptxgenModule = await import('pptxgenjs');
  const PptxGenJS = pptxgenModule.default || pptxgenModule;
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = teacherName;
  pptx.company = schoolName;
  pptx.subject = subject;
  pptx.title = `Bài giảng: ${lessonTitle}`;

  const illustrationTypes = ['cover', 'objectives', 'warmup', 'theory', 'procedure', 'discussion', 'quiz', 'summary'];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();
    const type = illustrationTypes[i % illustrationTypes.length];

    // Lời giảng giáo viên (Presenter Notes)
    if (s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }

    // =========================================================================
    // SLIDE 1: SLIDE TIÊU ĐỀ (BÌA BÀI GIẢNG SANG TRỌNG & 100% EDITABLE TEXT)
    // =========================================================================
    if (i === 0) {
      slide.background = { color: '0A192F' };

      // Dải trang trí
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: '0284C7' } });

      // Huy hiệu GDPT 2018 (Native text editable)
      slide.addText('🌟 KẾ HOẠCH BÀI DẠY SỐ • CHUẨN GDPT 2018', {
        x: 0.8, y: 0.55, w: 6.0, h: 0.35,
        fontSize: 12, bold: true, color: '38BDF8', fontFace: 'Calibri'
      });

      // Tên bài học (Native text editable lớn nổi bật)
      slide.addText(lessonTitle.toUpperCase(), {
        x: 0.8, y: 1.0, w: 5.6, h: 1.8,
        fontSize: 26, bold: true, color: 'FFFFFF', fontFace: 'Arial',
        valign: 'top', wrap: true
      });

      // Hộp thông tin giảng dạy (Native Shape & Native Text)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 3.0, w: 5.5, h: 1.8, rectRadius: 0.15,
        fill: { color: '1E293B' }, line: { color: '334155', width: 1.5 }
      });

      slide.addText([
        { text: '📚 Môn học: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${subject}\\n`, options: { color: 'F1F5F9', fontSize: 13 } },
        { text: '🏫 Lớp & Đơn vị: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${className} • ${schoolName}\\n`, options: { color: 'F1F5F9', fontSize: 13 } },
        { text: '👨‍🏫 Giáo viên phụ trách: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: `${teacherName}\\n`, options: { color: '34D399', fontSize: 13, bold: true } },
        { text: '⏱️ Thời lượng & Phân phối: ', options: { bold: true, color: '38BDF8', fontSize: 13 } },
        { text: 'Tiết học chính khóa kết hợp chuyển đổi số', options: { color: '94A3B8', fontSize: 12 } }
      ], {
        x: 1.0, y: 3.1, w: 5.1, h: 1.6, fontFace: 'Calibri', valign: 'middle'
      });

      // Ảnh minh họa đồ họa thuần túy (không chứa text tĩnh)
      const svg = createPureGraphicIllustrationSvg('cover', subject);
      const imgData = await svgToDataUrl(svg, 500, 450);
      slide.addImage({ data: imgData, x: 6.6, y: 1.1, w: 2.9, h: 3.6 });

      continue;
    }

    // =========================================================================
    // SLIDE 2: MỤC TIÊU BÀI HỌC CẦN ĐẠT (4 KHUNG NĂNG LỰC 100% EDITABLE TEXT)
    // =========================================================================
    if (i === 1) {
      slide.background = { color: 'F8FAFC' };

      // Header Banner
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: '0284C7' } });
      slide.addText('MỤC TIÊU BÀI HỌC CẦN ĐẠT (CHUẨN GDPT 2018)', {
        x: 0.8, y: 0.15, w: 8.4, h: 0.6, fontSize: 18, bold: true, color: 'FFFFFF', fontFace: 'Arial'
      });

      // 4 Thẻ mục tiêu có thể chỉnh sửa trực tiếp từng từ
      const objCards = [
        {
          x: 0.6, y: 1.1, w: 4.2, h: 1.95, color: 'EFF6FF', border: '3B82F6',
          title: '📖 1. KIẾN THỨC CỐT LÕI',
          body: s.bulletPoints[0] || 'Nắm vững bản chất, định nghĩa và quy luật khoa học trọng tâm của bài học.'
        },
        {
          x: 5.2, y: 1.1, w: 4.2, h: 1.95, color: 'ECFDF5', border: '10B981',
          title: '⚙️ 2. KỸ NĂNG THAO TÁC',
          body: s.bulletPoints[1] || 'Thao tác chính xác, phân tích sơ đồ và giải quyết các bài toán kỹ thuật thực tiễn.'
        },
        {
          x: 0.6, y: 3.2, w: 4.2, h: 1.95, color: 'FEFCE8', border: 'F59E0B',
          title: '⭐ 3. PHẨM CHẤT NGHỀ NGHIỆP',
          body: s.bulletPoints[3] || s.bulletPoints[2] || 'Rèn luyện tính cẩn thận, kỷ luật lao động và tuân thủ an toàn tuyệt đối.'
        },
        {
          x: 5.2, y: 3.2, w: 4.2, h: 1.95, color: 'F5F3FF', border: '8B5CF6',
          title: '💻 4. NĂNG LỰC SỐ HÓA',
          body: s.bulletPoints[2] || 'Khai thác tài nguyên số, sử dụng thiết bị tương tác và tra cứu thông tin trực tuyến.'
        }
      ];

      for (const c of objCards) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: c.x, y: c.y, w: c.w, h: c.h, rectRadius: 0.12,
          fill: { color: c.color }, line: { color: c.border, width: 1.5 }
        });
        slide.addText(c.title, {
          x: c.x + 0.2, y: c.y + 0.15, w: c.w - 0.4, h: 0.35,
          fontSize: 13, bold: true, color: '0F172A', fontFace: 'Arial'
        });
        slide.addText(c.body, {
          x: c.x + 0.2, y: c.y + 0.55, w: c.w - 0.4, h: c.h - 0.7,
          fontSize: 12, color: '334155', fontFace: 'Calibri', valign: 'top', wrap: true
        });
      }

      // Footer
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0', width: 1 } });
      slide.addText(`📖 ${subject} - ${lessonTitle} | ${className} | Văn bản chỉnh sửa được 100%`, {
        x: 0.5, y: 5.25, w: 8.0, h: 0.375, fontSize: 9.5, color: '64748B', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(`Trang ${s.slideNumber}/${slides.length}`, {
        x: 8.5, y: 5.25, w: 1.0, h: 0.375, fontSize: 9.5, bold: true, color: '0284C7', align: 'right', valign: 'middle', fontFace: 'Calibri'
      });

      continue;
    }

    // =========================================================================
    // SLIDE 5: QUY TRÌNH THỰC HÀNH / THAO TÁC (3 BƯỚC NATIVE EDITABLE TEXT)
    // =========================================================================
    if (i === 4) {
      slide.background = { color: 'F8FAFC' };

      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: '0284C7' } });
      slide.addText(s.title.toUpperCase(), {
        x: 0.8, y: 0.15, w: 8.4, h: 0.6, fontSize: 17, bold: true, color: 'FFFFFF', fontFace: 'Arial'
      });

      // 3 Bước thực hành dạng Native Cards
      const stepCards = [
        {
          num: '1', title: 'BƯỚC 1: CHUẨN BỊ & KHẢO SÁT',
          color: 'F0FDF4', border: '16A34A', tagColor: '16A34A',
          body: s.bulletPoints[0] || 'Kiểm tra dụng cụ đo kiểm, trang bị bảo hộ lao động đạt chuẩn.'
        },
        {
          num: '2', title: 'BƯỚC 2: TRIỂN KHAI THAO TÁC KỸ THUẬT',
          color: 'F0F9FF', border: '0284C7', tagColor: '0284C7',
          body: s.bulletPoints[1] || 'Triển khai đúng sơ đồ nguyên lý, quy chuẩn kỹ thuật và giám sát thông số.'
        },
        {
          num: '3', title: 'BƯỚC 3: KIỂM TRA, NGHIỆM THU & 5S',
          color: 'FFFBEB', border: 'D97706', tagColor: 'D97706',
          body: s.bulletPoints[2] || 'Đánh giá kết quả đạt được, thu dọn vệ sinh công nghiệp 5S an toàn.'
        }
      ];

      for (let idx = 0; idx < stepCards.length; idx++) {
        const sc = stepCards[idx];
        const yPos = 1.1 + idx * 1.05;

        // Thẻ nền
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6, y: yPos, w: 6.2, h: 0.95, rectRadius: 0.1,
          fill: { color: sc.color }, line: { color: sc.border, width: 1.5 }
        });

        // Vòng tròn số bước
        slide.addShape(pptx.ShapeType.ellipse, {
          x: 0.8, y: yPos + 0.18, w: 0.6, h: 0.6,
          fill: { color: sc.tagColor }
        });
        slide.addText(sc.num, {
          x: 0.8, y: yPos + 0.18, w: 0.6, h: 0.6,
          fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
        });

        // Tiêu đề & nội dung bước (Native Text)
        slide.addText(sc.title, {
          x: 1.55, y: yPos + 0.1, w: 5.1, h: 0.3,
          fontSize: 12.5, bold: true, color: '0F172A', fontFace: 'Arial'
        });
        slide.addText(sc.body, {
          x: 1.55, y: yPos + 0.42, w: 5.1, h: 0.45,
          fontSize: 11.5, color: '334155', fontFace: 'Calibri', wrap: true
        });
      }

      // Hộp cảnh báo an toàn ở dưới (Native Text)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: 4.35, w: 6.2, h: 0.75, rectRadius: 0.1,
        fill: { color: 'FEF2F2' }, line: { color: 'EF4444', width: 1.5 }
      });
      slide.addText('⚠️ NGUYÊN TẮC AN TOÀN BẮT BUỘC:', {
        x: 0.8, y: 4.4, w: 5.8, h: 0.28,
        fontSize: 11, bold: true, color: 'B91C1C', fontFace: 'Arial'
      });
      slide.addText(s.bulletPoints[3] || 'Tuyệt đối tuân thủ quy chuẩn an toàn lao động và đeo đầy đủ trang bị bảo hộ.', {
        x: 0.8, y: 4.68, w: 5.8, h: 0.38,
        fontSize: 10.5, color: '7F1D1D', fontFace: 'Calibri', wrap: true
      });

      // Ảnh minh họa đồ họa bên phải
      const svg = createPureGraphicIllustrationSvg('procedure', subject);
      const imgData = await svgToDataUrl(svg, 500, 450);
      slide.addImage({ data: imgData, x: 7.1, y: 1.2, w: 2.4, h: 3.8 });

      // Footer
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0', width: 1 } });
      slide.addText(`📖 ${subject} - ${lessonTitle} | ${className} | Văn bản chỉnh sửa được 100%`, {
        x: 0.5, y: 5.25, w: 8.0, h: 0.375, fontSize: 9.5, color: '64748B', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(`Trang ${s.slideNumber}/${slides.length}`, {
        x: 8.5, y: 5.25, w: 1.0, h: 0.375, fontSize: 9.5, bold: true, color: '0284C7', align: 'right', valign: 'middle', fontFace: 'Calibri'
      });

      continue;
    }

    // =========================================================================
    // SLIDE 7: CÂU HỎI TRẮC NGHIỆM CỦNG CỐ (4 Ô A, B, C, D 100% EDITABLE TEXT)
    // =========================================================================
    if (i === 6) {
      slide.background = { color: 'F8FAFC' };

      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: '0284C7' } });
      slide.addText('HOẠT ĐỘNG 4: CÂU HỎI TRẮC NGHIỆM CỦNG CỐ', {
        x: 0.8, y: 0.15, w: 8.4, h: 0.6, fontSize: 17, bold: true, color: 'FFFFFF', fontFace: 'Arial'
      });

      // Khung câu hỏi (Native Text)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: 1.1, w: 6.2, h: 1.2, rectRadius: 0.12,
        fill: { color: 'FFFFFF' }, line: { color: '0284C7', width: 1.5 }
      });
      slide.addText('❓ CÂU HỎI KIỂM TRA ĐỘ HIỂU BÀI:', {
        x: 0.8, y: 1.2, w: 5.8, h: 0.28,
        fontSize: 11, bold: true, color: '0369A1', fontFace: 'Arial'
      });
      slide.addText(s.bulletPoints[0] || `Khẳng định nào sau đây là đúng nhất khi nói về nội dung bài học '${lessonTitle}'?`, {
        x: 0.8, y: 1.5, w: 5.8, h: 0.7,
        fontSize: 12.5, bold: true, color: '0F172A', fontFace: 'Calibri', wrap: true
      });

      // 4 Lựa chọn A, B, C, D (Native Shapes & Native Text)
      const options = [
        { label: 'A', text: s.bulletPoints[1] || 'Phương án A: Khái niệm và đặc điểm kỹ thuật cơ bản', bg: 'FEE2E2', border: 'EF4444', textColor: '991B1B' },
        { label: 'B', text: s.bulletPoints[2] || 'Phương án B: Quy trình vận hành và tiêu chuẩn an toàn', bg: 'DBEAFE', border: '3B82F6', textColor: '1E40AF' },
        { label: 'C', text: s.bulletPoints[3] || 'Phương án C: Ứng dụng thực tiễn trong hệ thống công nghiệp', bg: 'FEF9C3', border: 'EAB308', textColor: '854D0E' },
        { label: 'D', text: s.bulletPoints[4] || 'Phương án D: Cả 3 phương án trên đều đúng', bg: 'DCFCE7', border: '22C55E', textColor: '166534' }
      ];

      for (let optIdx = 0; optIdx < options.length; optIdx++) {
        const opt = options[optIdx];
        const col = optIdx % 2;
        const row = Math.floor(optIdx / 2);
        const xPos = 0.6 + col * 3.15;
        const yPos = 2.45 + row * 1.35;

        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: yPos, w: 3.05, h: 1.25, rectRadius: 0.1,
          fill: { color: opt.bg }, line: { color: opt.border, width: 1.5 }
        });

        // Huy hiệu chữ cái A, B, C, D
        slide.addShape(pptx.ShapeType.ellipse, {
          x: xPos + 0.15, y: yPos + 0.15, w: 0.45, h: 0.45,
          fill: { color: opt.border }
        });
        slide.addText(opt.label, {
          x: xPos + 0.15, y: yPos + 0.15, w: 0.45, h: 0.45,
          fontSize: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
        });

        // Nội dung lựa chọn (Native Text)
        slide.addText(opt.text, {
          x: xPos + 0.7, y: yPos + 0.15, w: 2.2, h: 0.95,
          fontSize: 11.5, color: opt.textColor, fontFace: 'Calibri', valign: 'top', wrap: true
        });
      }

      // Ảnh minh họa cúp / quiz bên phải
      const svg = createPureGraphicIllustrationSvg('quiz', subject);
      const imgData = await svgToDataUrl(svg, 500, 450);
      slide.addImage({ data: imgData, x: 7.1, y: 1.2, w: 2.4, h: 3.8 });

      // Footer
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0', width: 1 } });
      slide.addText(`📖 ${subject} - ${lessonTitle} | ${className} | Văn bản chỉnh sửa được 100%`, {
        x: 0.5, y: 5.25, w: 8.0, h: 0.375, fontSize: 9.5, color: '64748B', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(`Trang ${s.slideNumber}/${slides.length}`, {
        x: 8.5, y: 5.25, w: 1.0, h: 0.375, fontSize: 9.5, bold: true, color: '0284C7', align: 'right', valign: 'middle', fontFace: 'Calibri'
      });

      continue;
    }

    // =========================================================================
    // CÁC SLIDE CÒN LẠI (SLIDE 3, 4, 6, 8): BỐ CỤC 2 CỘT CHUẨN NATIVE TEXT
    // =========================================================================
    slide.background = { color: 'F8FAFC' };

    // Thanh tiêu đề phía trên
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.95, fill: { color: '0284C7' } });

    // Huy hiệu số slide
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 0.2, w: 1.1, h: 0.55, rectRadius: 0.1,
      fill: { color: '0369A1' }, line: { color: '38BDF8', width: 1 }
    });
    slide.addText(`SLIDE ${s.slideNumber}`, {
      x: 0.5, y: 0.2, w: 1.1, h: 0.55,
      fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', fontFace: 'Arial'
    });

    // Tiêu đề Slide (Native Text)
    slide.addText(s.title.toUpperCase(), {
      x: 1.75, y: 0.15, w: 7.8, h: 0.65,
      fontSize: 17, bold: true, color: 'FFFFFF', valign: 'middle', fontFace: 'Arial'
    });

    // Khung nội dung chính bên trái (Native Shape)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y: 1.15, w: 5.8, h: 3.8, rectRadius: 0.15,
      fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1.5 }
    });

    // Nhãn hướng dẫn (Native Text)
    slide.addText('📌 NỘI DUNG TRÌNH CHIẾU TRỌNG TÂM:', {
      x: 0.7, y: 1.25, w: 5.4, h: 0.35,
      fontSize: 12, bold: true, color: '0369A1', fontFace: 'Calibri'
    });

    // Các gạch đầu dòng (100% Native Editable Text Items)
    const bulletItems = s.bulletPoints.map(bp => ({
      text: bp + '\\n',
      options: {
        fontSize: 13,
        color: '1E293B',
        fontFace: 'Calibri',
        bullet: { code: '2022' },
        spaceAfter: 10
      }
    }));

    slide.addText(bulletItems, {
      x: 0.8, y: 1.65, w: 5.3, h: 3.1,
      valign: 'top', wrap: true
    });

    // Khung hình ảnh minh họa bên phải (Native Shape)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.5, y: 1.15, w: 3.0, h: 3.8, rectRadius: 0.15,
      fill: { color: 'FFFFFF' }, line: { color: '38BDF8', width: 1.5 }
    });

    // Ảnh minh họa vector thuần túy (không chứa text tĩnh)
    const svg = createPureGraphicIllustrationSvg(type, subject);
    const imgData = await svgToDataUrl(svg, 500, 450);
    slide.addImage({
      data: imgData,
      x: 6.6, y: 1.25, w: 2.8, h: 2.4
    });

    // Hộp ghi chú sư phạm bên dưới ảnh (Native Text editable)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.6, y: 3.75, w: 2.8, h: 1.1, rectRadius: 0.1,
      fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 }
    });
    slide.addText([
      { text: '💡 Ghi chú sư phạm: ', options: { bold: true, color: '0284C7', fontSize: 10 } },
      { text: s.visualSuggestion || 'Hình ảnh trực quan hóa khái niệm, hỗ trợ học sinh tư duy.', options: { color: '0369A1', fontSize: 9.5 } }
    ], {
      x: 6.7, y: 3.8, w: 2.6, h: 1.0,
      fontFace: 'Calibri', valign: 'middle', wrap: true
    });

    // Chân trang (Footer)
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: 'F1F5F9' }, line: { color: 'E2E8F0', width: 1 } });
    slide.addText(`📖 ${subject} - ${lessonTitle} | ${className} | Văn bản chỉnh sửa được 100%`, {
      x: 0.5, y: 5.25, w: 8.0, h: 0.375, fontSize: 9.5, color: '64748B', valign: 'middle', fontFace: 'Calibri'
    });
    slide.addText(`Trang ${s.slideNumber}/${slides.length}`, {
      x: 8.5, y: 5.25, w: 1.0, h: 0.375, fontSize: 9.5, bold: true, color: '0284C7', align: 'right', valign: 'middle', fontFace: 'Calibri'
    });
  }

  // Xuất file và nhúng Transition
  const rawPptx = await pptx.write({ outputType: 'arraybuffer' });
  const finalBlob = await injectSlideTransitions(rawPptx as ArrayBuffer);

  // Kích hoạt tải về
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
