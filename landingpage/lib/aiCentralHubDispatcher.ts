// ============================================================================
// HUY TECHNOLOGY AI - AI CENTRAL HUB DISPATCHER (huycncdsai.io.vn)
// Bộ Điều Phối Thông Minh 14 Công Cụ AI Đa Nền Tảng Theo Hạng Mục Sư Phạm
// Bản quyền & Vận hành: Huy Technology AI - SĐT Kỹ thuật: 0961364600
// ============================================================================

export type AiHubCluster = 'SLIDES' | 'IMAGE' | 'VIDEO' | 'TTS';

export type AiHubToolId =
  | 'presenton'
  | 'pptagent'
  | 'slidev'
  | 'marp'
  | 'comfyui'
  | 'invokeai'
  | 'moneyprinterturbo'
  | 'sadtalker'
  | 'wan21'
  | 'opensora'
  | 'viettts'
  | 'piper'
  | 'f5tts'
  | 'openvoice';

export interface AiHubToolMetadata {
  id: AiHubToolId;
  name: string;
  cluster: AiHubCluster;
  clusterName: string;
  license: string;
  badgeColor: string;
  headline: string;
  keyStrengths: string[];
  bestFor: string;
  supportedEngines: string[];
  hubUrl: string;
}

export const AI_CENTRAL_HUB_TOOLS: Record<AiHubToolId, AiHubToolMetadata> = {
  presenton: {
    id: 'presenton',
    name: 'Presenton',
    cluster: 'SLIDES',
    clusterName: 'I. Slide & Trình chiếu',
    license: 'Apache 2.0',
    badgeColor: 'sky',
    headline: 'Chủ lực số 1: Áp template PowerPoint mẫu của trường, xuất .pptx 100% chỉnh sửa',
    keyStrengths: [
      'Nhận giáo án / PDF / Word, tự động bóc tách thành slide bài giảng',
      'Áp dụng template chuẩn nhận diện thương hiệu của từng trường/khoa',
      'Xuất file PowerPoint .pptx bản gốc, cho phép chỉnh sửa 100% hình ảnh & font chữ',
      'Tương thích mượt mà với cả Ollama cục bộ và Gemini Cloud API'
    ],
    bestFor: 'Soạn bài giảng trình chiếu chính khóa theo mẫu chuẩn của nhà trường',
    supportedEngines: ['Ollama', 'Gemini 2.0 Flash', 'PptxGenJS Native'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=presenton'
  },
  pptagent: {
    id: 'pptagent',
    name: 'PPTAgent',
    cluster: 'SLIDES',
    clusterName: 'I. Slide & Trình chiếu',
    license: 'Open Source',
    badgeColor: 'blue',
    headline: 'Học bố cục & thiết kế từ slide mẫu, thẩm định độ mạch lạc bằng PPTEval',
    keyStrengths: [
      'Phân tích sâu cấu trúc bài thuyết trình mẫu của chuyên gia/nhà trường',
      'Tự động áp dụng nguyên lý thiết kế đồ họa sư phạm chuẩn quốc tế',
      'Tích hợp module PPTEval chấm điểm độ mạch lạc và tính trực quan'
    ],
    bestFor: 'Thiết kế slide thi giáo viên dạy giỏi, báo cáo chuyên đề và bài giảng mẫu mực',
    supportedEngines: ['Ollama LLM', 'PPTEval Metric'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=pptagent'
  },
  slidev: {
    id: 'slidev',
    name: 'Slidev',
    cluster: 'SLIDES',
    clusterName: 'I. Slide & Trình chiếu',
    license: 'MIT',
    badgeColor: 'indigo',
    headline: 'Slide tương tác chuyên sâu cho khối Công nghệ, Cơ khí, Điện tử, CNC, Lập trình',
    keyStrengths: [
      'Hỗ trợ sơ đồ tư duy Mermaid.js Live trực quan không cần phần mềm vẽ ngoài',
      'Biểu diễn công thức toán lý hóa bằng KaTeX / LaTeX cực kỳ chuẩn xác',
      'Trình chiếu code tương tác thời gian thực với syntax highlighting',
      'Tùy biến phong cách Developer / Kỹ thuật chuyên nghiệp'
    ],
    bestFor: 'Giáo viên dạy môn Công nghệ, Tin học, Vật lý, Cơ khí, Điện tử, Tự động hóa',
    supportedEngines: ['Vite', 'Mermaid.js', 'KaTeX', 'Vue 3'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=slidev'
  },
  marp: {
    id: 'marp',
    name: 'Marp',
    cluster: 'SLIDES',
    clusterName: 'I. Slide & Trình chiếu',
    license: 'MIT',
    badgeColor: 'cyan',
    headline: 'Chuyển đổi Markdown sang PowerPoint .pptx, PDF, HTML siêu tốc hoàn toàn offline',
    keyStrengths: [
      'Tốc độ kết xuất tính bằng mili-giây từ ghi chú văn bản thuần túy',
      'Chạy offline 100% không tốn băng thông Internet',
      'Xuất đa định dạng: .pptx, PDF chất lượng in ấn, Web presentation HTML5'
    ],
    bestFor: 'Giáo viên cần xuất slide cấp tốc từ đề cương bài dạy có sẵn',
    supportedEngines: ['Node.js CLI', 'Marpit Framework'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=marp'
  },
  comfyui: {
    id: 'comfyui',
    name: 'ComfyUI',
    cluster: 'IMAGE',
    clusterName: 'II. Hình ảnh AI',
    license: 'GPL-3.0',
    badgeColor: 'emerald',
    headline: 'Nền tảng Node-based mạnh nhất: Tự sinh bộ 4 ảnh kỹ thuật theo chu trình bài học',
    keyStrengths: [
      'Sinh bộ ảnh liên hoàn (VD: Chu trình 4 kỳ Nạp - Nén - Nổ - Xả của Động cơ đốt trong)',
      'Tự động áp style kỹ thuật sư phạm (Isometric, Technical Blueprint, Schematic)',
      'Kiểm soát cấu trúc chính xác bằng ControlNet, IP-Adapter, LoRA sư phạm'
    ],
    bestFor: 'Tạo hình minh họa sơ đồ kỹ thuật, nguyên lý hoạt động máy móc xưởng thực hành',
    supportedEngines: ['Stable Diffusion XL', 'Flux.1 Schnell', 'ControlNet'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=comfyui'
  },
  invokeai: {
    id: 'invokeai',
    name: 'InvokeAI',
    cluster: 'IMAGE',
    clusterName: 'II. Hình ảnh AI',
    license: 'Apache 2.0',
    badgeColor: 'teal',
    headline: 'Giao diện WebUI dễ dùng cho giáo viên tự inpainting, outpainting và vẽ minh họa',
    keyStrengths: [
      'Bảng vẽ trực quan (Canvas), kéo thả chi tiết dễ thao tác cho giáo viên',
      'Tính năng Inpainting: Thay thế hoặc bổ sung chi tiết (mũ bảo hộ, linh kiện) trên ảnh',
      'Không đòi hỏi kiến thức lập trình đồ họa phức tạp'
    ],
    bestFor: 'Chỉnh sửa, gán nhãn phụ chú và hoàn thiện hình ảnh minh họa bài dạy',
    supportedEngines: ['SDXL Turbo', 'Unified Canvas Engine'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=invokeai'
  },
  moneyprinterturbo: {
    id: 'moneyprinterturbo',
    name: 'MoneyPrinterTurbo',
    cluster: 'VIDEO',
    clusterName: 'III. Video AI',
    license: 'MIT',
    badgeColor: 'amber',
    headline: 'Cỗ máy sản xuất video tự động: Kịch bản -> Giọng đọc -> Cào footage -> Phụ đề -> MP4',
    keyStrengths: [
      'Tự động nhận kịch bản phân cảnh vi mô (Microlearning 3-5 phút)',
      'Tự động cào kho footage bản quyền chất lượng cao từ Pexels & Pixabay',
      'Tự động khớp phụ đề tiếng Việt chạy chữ theo từng giây và lồng nhạc nền êm dịu',
      'Xuất video chuẩn Full HD 1080p sẵn sàng trình chiếu hoặc đưa lên LMS'
    ],
    bestFor: 'Sản xuất video bài giảng ngắn tóm tắt bài học và lớp học đảo ngược (Flipped Classroom)',
    supportedEngines: ['Pexels API', 'Edge-TTS / VietTTS', 'FFmpeg Pipeline'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=moneyprinterturbo'
  },
  sadtalker: {
    id: 'sadtalker',
    name: 'SadTalker',
    cluster: 'VIDEO',
    clusterName: 'III. Video AI',
    license: 'CC BY-NC',
    badgeColor: 'purple',
    headline: 'Ghép 1 ảnh chân dung + 1 file audio -> Sinh video Giảng viên ảo cử động môi tự nhiên',
    keyStrengths: [
      'Tạo Giảng viên ảo từ ảnh chân dung của chính Thầy/Cô hoặc linh vật trường',
      'Đồng bộ chuyển động môi (Lip-sync), chớp mắt và cử động đầu theo giọng nói tiếng Việt',
      'Đặt ở góc màn hình bài giảng điện tử để tăng tính tương tác và thu hút học sinh'
    ],
    bestFor: 'Tạo Avatar Giáo viên ảo giảng bài cho các khóa học trực tuyến',
    supportedEngines: ['PyTorch', 'Audio-driven Facial Animation'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=sadtalker'
  },
  wan21: {
    id: 'wan21',
    name: 'Wan2.1',
    cluster: 'VIDEO',
    clusterName: 'III. Video AI',
    license: 'Apache 2.0',
    badgeColor: 'orange',
    headline: 'Model video mở 1.3B: Tạo chuyển động 5 giây từ ảnh tĩnh mô phỏng cơ cấu máy',
    keyStrengths: [
      'Chạy mượt mà trên VRAM máy cá nhân (~8GB), không cần siêu máy tính',
      'Chuyển sơ đồ tĩnh thành video động (chuyển động piston, dòng chảy chất lỏng, bánh răng ăn khớp)',
      'Giúp học sinh hình dung trực quan quy luật vật lý và kỹ thuật công nghiệp'
    ],
    bestFor: 'Mô phỏng chuyển động cơ cấu máy móc, thí nghiệm vật lý, phản ứng hóa học',
    supportedEngines: ['Wan2.1 1.3B Diffusion', 'ComfyUI Video Node'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=wan21'
  },
  opensora: {
    id: 'opensora',
    name: 'Open-Sora',
    cluster: 'VIDEO',
    clusterName: 'III. Video AI',
    license: 'Apache 2.0',
    badgeColor: 'rose',
    headline: 'Mô hình video generative 11B cấp cao phục vụ cụm Server GPU nghiên cứu sư phạm',
    keyStrengths: [
      'Chất lượng điện ảnh với độ phân giải cao và tính chân thực vượt trội',
      'Tái hiện các hiện tượng không gian 3D phức tạp (vũ trụ học, địa chất, sinh học tiến hóa)',
      'Phục vụ các đề tài nghiên cứu chuyển đổi số cấp trường và viện'
    ],
    bestFor: 'Nghiên cứu mô phỏng khoa học đỉnh cao và bài giảng video chuyên sâu cấp cao',
    supportedEngines: ['Open-Sora 11B', 'Huy Tech Enterprise GPU Cluster'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=opensora'
  },
  viettts: {
    id: 'viettts',
    name: 'VietTTS',
    cluster: 'TTS',
    clusterName: 'IV. Giọng nói (TTS)',
    license: 'Apache 2.0',
    badgeColor: 'emerald',
    headline: 'Ưu tiên số 1 cho tiếng Việt: Chuẩn ngữ điệu 3 miền, tương thích chuẩn OpenAI TTS',
    keyStrengths: [
      'Phát âm ngữ điệu tiếng Việt tự nhiên, ấm áp, đậm chất sư phạm Việt Nam',
      'Đầy đủ giọng Bắc chuẩn Hà Nội, Trung và Nam, phù hợp mọi vùng miền',
      'Cung cấp API tiêu chuẩn tương thích chuẩn OpenAI TTS để nhúng tức thì vào web/app'
    ],
    bestFor: 'Thuyết minh slide, đọc lời bình video vi mô và đọc câu hỏi mini game tiếng Việt',
    supportedEngines: ['VITS Architecture', 'FastSpeech2 Vietnamese Model'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=viettts'
  },
  piper: {
    id: 'piper',
    name: 'Piper',
    cluster: 'TTS',
    clusterName: 'IV. Giọng nói (TTS)',
    license: 'GPL-3.0',
    badgeColor: 'blue',
    headline: 'Bộ TTS siêu nhẹ chạy hoàn toàn Offline không cần GPU, phản hồi mili-giây',
    keyStrengths: [
      'Chạy mượt trên mọi laptop giáo viên và điện thoại Android (kích thước model chỉ ~20MB)',
      'Hoạt động 100% offline trong lớp học không có Internet hoặc vùng sâu vùng xa',
      'Tốc độ sinh âm thanh nhanh gấp 5-10 lần thời gian thực'
    ],
    bestFor: 'Đọc âm thanh trợ lý tại chỗ, phát âm từ vựng bài giảng ngoại ngữ và kiểm tra',
    supportedEngines: ['ONNX Runtime', 'C++ Lightweight Engine'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=piper'
  },
  f5tts: {
    id: 'f5tts',
    name: 'F5-TTS',
    cluster: 'TTS',
    clusterName: 'IV. Giọng nói (TTS)',
    license: 'MIT',
    badgeColor: 'violet',
    headline: 'Fast & Fluid Voice Cloning: Clone giọng giáo viên chỉ từ đoạn mẫu vài giây',
    keyStrengths: [
      'Giáo viên chỉ cần ghi âm một đoạn mẫu 5-10 giây',
      'Tự động tái tạo âm sắc giọng giảng quen thuộc của chính Thầy/Cô cho học sinh',
      'Xử lý mượt mà ngữ điệu ngắt nghỉ, tạo cảm giác thân mật, gần gũi'
    ],
    bestFor: 'Cá nhân hóa bài giảng trực tuyến bằng chính giọng nói thân thuộc của giáo viên',
    supportedEngines: ['Flow Matching', 'Diffusion Transformer (DiT)'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=f5tts'
  },
  openvoice: {
    id: 'openvoice',
    name: 'OpenVoice',
    cluster: 'TTS',
    clusterName: 'IV. Giọng nói (TTS)',
    license: 'MIT',
    badgeColor: 'pink',
    headline: 'Kiểm soát cảm xúc, nhịp điệu và hỗ trợ chuyển đổi giọng đọc đa ngôn ngữ song ngữ',
    keyStrengths: [
      'Điều chỉnh linh hoạt cảm xúc: Hào hứng, truyền cảm hứng, trang trọng, giải thích',
      'Chuyển đổi ngôn ngữ mượt mà (Anh - Việt song ngữ) mà không làm mất chất giọng',
      'Kiểm soát chính xác nhịp điệu từng câu giảng'
    ],
    bestFor: 'Giảng dạy môn Tiếng Anh, song ngữ quốc tế và các bài học kích hoạt động lực',
    supportedEngines: ['Tone Color Converter', 'Multi-style Acoustic Model'],
    hubUrl: 'https://www.huycncdsai.io.vn/ai-hub?tool=openvoice'
  }
};

export interface AiCentralHubDispatchRecommendation {
  category: 'SLIDES' | 'MINDMAP' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LESSON' | 'EXAM';
  categoryTitle: string;
  primaryTool: AiHubToolMetadata;
  secondaryTool?: AiHubToolMetadata;
  voiceToolCompanion?: AiHubToolMetadata;
  selectionReason: string;
  pedagogicalRole: string;
  optimizedPrompt: string;
  executionSteps: string[];
  directHubLaunchUrl: string;
}

export function dispatchAiCentralHubTool(params: {
  category: 'SLIDES' | 'MINDMAP' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LESSON' | 'EXAM';
  lessonTitle: string;
  subject?: string;
  grade?: string;
  userPrompt?: string;
  specificRequirement?: string;
}): AiCentralHubDispatchRecommendation {
  const { category, lessonTitle, subject = 'Công nghệ', grade = '12', userPrompt = '' } = params;
  const lowerSubj = (subject || '').toLowerCase();
  const lowerPrompt = (userPrompt || '').toLowerCase();
  const isTechSubject =
    lowerSubj.includes('công nghệ') ||
    lowerSubj.includes('tin học') ||
    lowerSubj.includes('cơ khí') ||
    lowerSubj.includes('điện') ||
    lowerSubj.includes('cnc') ||
    lowerSubj.includes('lập trình') ||
    lowerSubj.includes('vật lý') ||
    lowerPrompt.includes('code') ||
    lowerPrompt.includes('máy');

  // 1. SLIDE TRÌNH CHIẾU
  if (category === 'SLIDES') {
    if (isTechSubject || lowerPrompt.includes('mermaid') || lowerPrompt.includes('công thức')) {
      const tool = AI_CENTRAL_HUB_TOOLS.slidev;
      const sec = AI_CENTRAL_HUB_TOOLS.presenton;
      return {
        category: 'SLIDES',
        categoryTitle: 'Slide Trình Chiếu Kỹ Thuật & Tương Tác (Slidev)',
        primaryTool: tool,
        secondaryTool: sec,
        selectionReason: 'Môn ' + subject + ' đòi hỏi trình diễn sơ đồ kỹ thuật Mermaid và công thức khoa học. Slidev là công cụ số 1 cho khối Công nghệ & Lập trình.',
        pedagogicalRole: 'Hiển thị mã code, cấu trúc máy, sơ đồ tư duy tương tác và công thức KaTeX sắc nét.',
        optimizedPrompt: [
          '---',
          'theme: seriph',
          'class: text-center',
          'highlighter: shiki',
          '---',
          '',
          '# ' + lessonTitle.toUpperCase(),
          'Môn: ' + subject + ' - Khối lớp: ' + grade,
          '*Thiết kế bằng Slidev trên AI Central Hub (huycncdsai.io.vn)*',
          '',
          '---',
          '',
          '## 🎯 1. Mục Tiêu Trọng Tâm (CV 5512)',
          '- Nắm vững nguyên lý cốt lõi và cấu tạo kỹ thuật của ' + lessonTitle + '.',
          '- Ứng dụng tư duy giải quyết vấn đề và năng lực số theo CV 3456.',
          '',
          '```mermaid',
          'graph TD',
          '  A[' + lessonTitle + '] --> B[Khái Niệm Cốt Lõi]',
          '  A --> C[Quy Trình Kỹ Thuật]',
          '  A --> D[Ứng Dụng Thực Tiễn]',
          '```'
        ].join('\n'),
        executionSteps: [
          '1. Bấm nút "Mở trên AI Central Hub" để chuyển dữ liệu sang Slidev WebUI.',
          '2. Hoặc xuất nhanh file .pptx bằng công cụ Presenton bổ trợ bên cạnh.',
          '3. Tích hợp trực tiếp sơ đồ tư duy và công thức vào bài trình chiếu.'
        ],
        directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&subj=' + encodeURIComponent(subject)
      };
    }

    const tool = AI_CENTRAL_HUB_TOOLS.presenton;
    const sec = AI_CENTRAL_HUB_TOOLS.pptagent;
    return {
      category: 'SLIDES',
      categoryTitle: 'Bài Giảng PowerPoint Chuẩn Mẫu Trường (Presenton)',
      primaryTool: tool,
      secondaryTool: sec,
      selectionReason: 'Presenton là chủ lực số 1 giúp tự động bóc tách giáo án, áp template nhận diện của trường và xuất file .pptx chỉnh sửa 100%.',
      pedagogicalRole: 'Tạo 10-12 slide PowerPoint 16:9 hoàn chỉnh với bảng màu sư phạm, chia đủ 4 hoạt động CV 5512 và có lời giảng viên.',
      optimizedPrompt: [
        'Tạo bộ slide bài giảng PowerPoint chuyên nghiệp cho bài học: "' + lessonTitle + '".',
        'Môn học: ' + subject + ' | Lớp: ' + grade + '.',
        'Cấu trúc chuẩn 4 hoạt động Công văn 5512/BGDĐT-GDTrH:',
        '- Slide 1: Bìa bài giảng, tên bài, tên giáo viên, đơn vị trường học.',
        '- Slide 2: Mục tiêu bài học (Kiến thức, Năng lực, Phẩm chất).',
        '- Slide 3-4: Hoạt động 1: Khởi động (Tình huống mâu thuẫn nhận thức thực tiễn).',
        '- Slide 5-8: Hoạt động 2: Hình thành kiến thức mới (Phân tích bản chất, quy tắc, định luật).',
        '- Slide 9-10: Hoạt động 3: Luyện tập & Thao tác củng cố.',
        '- Slide 11-12: Hoạt động 4: Vận dụng thực tiễn & Hướng dẫn học sinh tự học tại nhà.',
        'Xuất chuẩn định dạng .pptx tương thích Microsoft PowerPoint 2021/365.'
      ].join('\n'),
      executionSteps: [
        '1. Bấm "Mở trên AI Central Hub" để kết nối Presenton API.',
        '2. Tải template PowerPoint mẫu của trường Thầy/Cô lên hệ thống.',
        '3. Bấm Tạo slide và tải file .pptx về máy tính giảng dạy ngay.'
      ],
      directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&subj=' + encodeURIComponent(subject)
    };
  }

  // 2. SƠ ĐỒ TƯ DUY (MINDMAP)
  if (category === 'MINDMAP') {
    const tool = AI_CENTRAL_HUB_TOOLS.slidev;
    const sec = AI_CENTRAL_HUB_TOOLS.comfyui;
    return {
      category: 'MINDMAP',
      categoryTitle: 'Sơ Đồ Tư Duy & Cây Khái Niệm Trực Quan (Slidev & Mermaid)',
      primaryTool: tool,
      secondaryTool: sec,
      selectionReason: 'Slidev tích hợp engine Mermaid.js Live chuẩn nhất, tạo sơ đồ tư duy động có thể zoom, pan và tương tác khi giảng bài.',
      pedagogicalRole: 'Hệ thống hóa toàn bộ kiến thức bài học thành cây phân nhánh 4 cấp: Khái niệm -> Quy luật -> Kỹ năng -> Ứng dụng.',
      optimizedPrompt: [
        'mindmap',
        '  root((🌿 ' + lessonTitle + '))',
        '    Khái Niệm Nền Tảng',
        '      Định nghĩa bản chất',
        '      Ký hiệu và quy ước',
        '      Ý nghĩa khoa học',
        '    Quy Luật Trọng Tâm',
        '      Nguyên lý hoạt động',
        '      Mối quan hệ bản chất',
        '      Điều kiện áp dụng',
        '    Phương Pháp Thực Hành',
        '      Quy trình 4 bước',
        '      Lưu ý an toàn 5S',
        '      Nhận diện lỗi sai',
        '    Ứng Dụng Thực Tiễn',
        '      Thực tế đời sống',
        '      Năng lực số CV 3456',
        '      Dự án học tập'
      ].join('\n'),
      executionSteps: [
        '1. Sao chép mã Mermaid Mindmap tối ưu bên dưới.',
        '2. Bấm "Mở trên AI Central Hub" để trình diễn tương tác toàn màn hình trên lớp.',
        '3. Có thể xuất ảnh vector SVG chất lượng cao in tài liệu cho học sinh.'
      ],
      directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&mode=mindmap'
    };
  }

  // 3. HÌNH ẢNH MINH HỌA
  if (category === 'IMAGE') {
    const isEditing = lowerPrompt.includes('sửa') || lowerPrompt.includes('vẽ thêm') || lowerPrompt.includes('chỉnh');
    const tool = isEditing ? AI_CENTRAL_HUB_TOOLS.invokeai : AI_CENTRAL_HUB_TOOLS.comfyui;
    const sec = isEditing ? AI_CENTRAL_HUB_TOOLS.comfyui : AI_CENTRAL_HUB_TOOLS.invokeai;

    return {
      category: 'IMAGE',
      categoryTitle: isEditing ? 'Chỉnh Sửa Minh Họa Bài Dạy (InvokeAI)' : 'Bộ 4 Ảnh Kỹ Thuật Chu Trình Bài Học (ComfyUI)',
      primaryTool: tool,
      secondaryTool: sec,
      selectionReason: isEditing
        ? 'InvokeAI cung cấp WebUI Canvas trực quan giúp giáo viên dễ dàng inpainting, sửa ảnh và gán nhãn phụ chú.'
        : 'ComfyUI với quy trình Node-based tự động sinh trọn bộ 4 ảnh kỹ thuật mô tả chính xác từng công đoạn bài dạy.',
      pedagogicalRole: 'Trực quan hóa các khái niệm trừu tượng, cấu tạo máy móc và quy trình an toàn lao động trong lớp học số.',
      optimizedPrompt: [
        'Scientific educational diagram for Vietnamese textbook, showing: "' + lessonTitle + '".',
        'Subject: ' + subject + ' grade ' + grade + '.',
        'Style: High clarity technical illustration, isometric vector, educational diagram, labeled parts in clean lines, studio lighting, highly detailed mechanical components, 8k resolution, pedagogical aesthetic, safe educational environment, no blur.',
        'Negative prompt: low quality, distorted text, ugly, violence, watermark, dangerous work without protective equipment.'
      ].join('\n'),
      executionSteps: [
        '1. Bấm "Mở trên AI Central Hub" để khởi chạy ComfyUI / InvokeAI node.',
        '2. Chọn Preset "Sư Phạm Kỹ Thuật GDPT 2018".',
        '3. Nhấn Generate để nhận ngay bộ 4 ảnh phân cảnh độ nét 4K.'
      ],
      directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&subj=' + encodeURIComponent(subject)
    };
  }

  // 4. VIDEO BÀI GIẢNG & GIẢNG VIÊN ẢO
  if (category === 'VIDEO') {
    const isAvatarRequest = lowerPrompt.includes('avatar') || lowerPrompt.includes('thầy giáo') || lowerPrompt.includes('cô giáo') || lowerPrompt.includes('người giảng');
    const tool = isAvatarRequest ? AI_CENTRAL_HUB_TOOLS.sadtalker : AI_CENTRAL_HUB_TOOLS.moneyprinterturbo;
    const sec = isAvatarRequest ? AI_CENTRAL_HUB_TOOLS.wan21 : AI_CENTRAL_HUB_TOOLS.sadtalker;
    const voiceTool = AI_CENTRAL_HUB_TOOLS.viettts;

    return {
      category: 'VIDEO',
      categoryTitle: isAvatarRequest ? 'Giảng Viên Ảo AI Đọc Lời Bình (SadTalker)' : 'Video Bài Giảng Vi Mô Tự Động (MoneyPrinterTurbo)',
      primaryTool: tool,
      secondaryTool: sec,
      voiceToolCompanion: voiceTool,
      selectionReason: isAvatarRequest
        ? 'SadTalker tự động tạo video Avatar Thầy/Cô AI chuyển động môi và biểu cảm tự nhiên khớp với giọng đọc bài giảng.'
        : 'MoneyPrinterTurbo tự động hóa 100% quy trình: Ghép kịch bản, đọc giọng tiếng Việt, cào video footage Pexels, thêm phụ đề và xuất MP4 Full HD.',
      pedagogicalRole: 'Tạo video Microlearning 3-5 phút cho học sinh xem trước bài học ở nhà hoặc ôn tập sau tiết học.',
      optimizedPrompt: JSON.stringify({
        title: lessonTitle,
        subject: subject,
        target_duration_seconds: 180,
        scenes: [
          {
            scene: 1,
            name: 'Mở đầu tình huống',
            visual_keywords: subject + ', ' + lessonTitle + ', problem solving, technology',
            voiceover_vi: 'Chào mừng các em học sinh đến với bài giảng hôm nay về ' + lessonTitle + '. Hãy cùng quan sát một hiện tượng thú vị trong thực tế...',
            subtitle: 'Khám phá bản chất của ' + lessonTitle
          },
          {
            scene: 2,
            name: 'Khám phá nguyên lý',
            visual_keywords: 'scientific principle, diagram, machine motion',
            voiceover_vi: 'Bản chất của vấn đề nằm ở các quy luật then chốt mà chúng ta sẽ cùng phân tích ngay sau đây...',
            subtitle: 'Nguyên lý khoa học cốt lõi'
          },
          {
            scene: 3,
            name: 'Thực hành và vận dụng',
            visual_keywords: 'practical application, engineering, modern lab',
            voiceover_vi: 'Vận dụng kiến thức này, chúng ta có thể giải quyết các bài toán kỹ thuật và đời sống hàng ngày một cách sáng tạo.',
            subtitle: 'Ứng dụng vào thực tiễn'
          }
        ]
      }, null, 2),
      executionSteps: [
        '1. Sử dụng VietTTS để tổng hợp file audio giọng đọc tiếng Việt truyền cảm.',
        '2. Kết nối MoneyPrinterTurbo để tự động ghép footage và nhạc nền.',
        '3. Đưa Avatar SadTalker vào góc màn hình để tăng tính thân thiện của tiết dạy.'
      ],
      directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&subj=' + encodeURIComponent(subject)
    };
  }

  // 5. GIỌNG NÓI (TTS)
  if (category === 'VOICE') {
    const isClone = lowerPrompt.includes('clone') || lowerPrompt.includes('giọng tôi') || lowerPrompt.includes('giọng thật');
    const tool = isClone ? AI_CENTRAL_HUB_TOOLS.f5tts : AI_CENTRAL_HUB_TOOLS.viettts;
    const sec = AI_CENTRAL_HUB_TOOLS.piper;

    return {
      category: 'VOICE',
      categoryTitle: isClone ? 'Tái Tạo Giọng Thầy/Cô Bằng F5-TTS' : 'Giọng Đọc Chuẩn Tiếng Việt VietTTS',
      primaryTool: tool,
      secondaryTool: sec,
      selectionReason: isClone
        ? 'F5-TTS là công cụ Fast & Fluid Voice Cloning tối tân, tái tạo giọng giáo viên chỉ từ 5-10 giây file mẫu.'
        : 'VietTTS là ưu tiên số 1 cho tiếng Việt, phát âm chuẩn ngữ điệu ba miền Bắc - Trung - Nam, không bị lai tạp.',
      pedagogicalRole: 'Lồng tiếng cho toàn bộ kịch bản bài giảng, đọc câu hỏi tương tác và tạo trợ lý ảo sư phạm.',
      optimizedPrompt: [
        'Văn bản đọc mẫu sư phạm bài: "' + lessonTitle + '"',
        'Giọng đọc: Nữ/Nam miền Bắc chuẩn sư phạm.',
        'Tốc độ: 1.0x (Trầm ấm, rõ chữ, ngắt nghỉ đúng dấu câu ngữ pháp tiếng Việt).',
        'Nội dung: "Kính chào Thầy Cô và các em học sinh. Hôm nay chúng ta sẽ cùng tìm hiểu bài học: ' + lessonTitle + '. Bài học sẽ trang bị cho các em kiến thức nền tảng và kỹ năng giải quyết vấn đề trong thực tế."'
      ].join('\n'),
      executionSteps: [
        '1. Bấm "Mở trên AI Central Hub" để chọn giọng đọc VietTTS hoặc tải file ghi âm mẫu vào F5-TTS.',
        '2. Tải file âm thanh .mp3 hoặc .wav với tần số lấy mẫu 44.1kHz chất lượng cao.',
        '3. Chèn vào bài giảng PowerPoint hoặc ghép vào video bài giảng vi mô.'
      ],
      directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle) + '&voice=viettts'
    };
  }

  // Mặc định (LESSON / EXAM)
  const tool = AI_CENTRAL_HUB_TOOLS.presenton;
  const sec = AI_CENTRAL_HUB_TOOLS.pptagent;
  return {
    category: 'LESSON',
    categoryTitle: 'Soạn Kế Hoạch Bài Dạy Chuẩn 5512 & TT 22',
    primaryTool: tool,
    secondaryTool: sec,
    selectionReason: 'Đồng bộ trực tiếp với Deep-RAG Sư Phạm và xuất khung bài giảng liên thông sang Presenton tạo slide ngay lập tức.',
    pedagogicalRole: 'Hoàn thành trọn bộ 6 sản phẩm giáo án chuẩn bị lên lớp của Giáo viên.',
    optimizedPrompt: 'Soạn kế hoạch bài dạy chuẩn CV 5512 bài: "' + lessonTitle + '" - Môn: ' + subject + ' Khối ' + grade + '.',
    executionSteps: [
      '1. Khai thác dữ liệu từ Kho Tư Liệu Chuẩn trên EduViet.',
      '2. Chuyển giao sang AI Central Hub để sinh trọn vẹn slide và video đi kèm.'
    ],
    directHubLaunchUrl: tool.hubUrl + '&lesson=' + encodeURIComponent(lessonTitle)
  };
}
