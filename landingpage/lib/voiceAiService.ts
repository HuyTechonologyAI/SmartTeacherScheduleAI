// ============================================================================
// VOICE AI TUTOR & SPEECH RECOGNITION SERVICE - SMART TEACHER SCHEDULE
// Hỗ trợ giọng đọc tiếng Việt truyền cảm & Luyện phát âm tiếng Anh cho học sinh
// ============================================================================

export interface PronunciationResult {
  targetText: string;
  spokenText: string;
  score: number; // 0 - 100
  accuracy: 'EXCELLENT' | 'GOOD' | 'NEEDS_PRACTICE';
  feedback: string;
  stars: number;
}

export interface VoicePracticeLesson {
  id: string;
  topic: string;
  icon: string;
  items: {
    id: string;
    wordOrPhrase: string;
    phonetic: string;
    vietnameseMeaning: string;
    exampleSentence: string;
    exampleMeaning: string;
  }[];
}

export const PRIMARY_ENGLISH_TOPICS: VoicePracticeLesson[] = [
  {
    id: 'school_objects',
    topic: 'Đồ dùng học tập (School Objects)',
    icon: '🎒',
    items: [
      {
        id: 's1',
        wordOrPhrase: 'pencil',
        phonetic: '/ˈpen.səl/',
        vietnameseMeaning: 'bút chì',
        exampleSentence: 'This is my new pencil.',
        exampleMeaning: 'Đây là chiếc bút chì mới của em.'
      },
      {
        id: 's2',
        wordOrPhrase: 'notebook',
        phonetic: '/ˈnəʊt.bʊk/',
        vietnameseMeaning: 'quyển vở ghi bài',
        exampleSentence: 'I write lessons in my notebook.',
        exampleMeaning: 'Em ghi bài vào vở của mình.'
      },
      {
        id: 's3',
        wordOrPhrase: 'school bag',
        phonetic: '/ˈskuːl ˌbæɡ/',
        vietnameseMeaning: 'cặp sách đến trường',
        exampleSentence: 'My school bag is blue.',
        exampleMeaning: 'Cặp sách của em màu xanh dương.'
      },
      {
        id: 's4',
        wordOrPhrase: 'ruler',
        phonetic: '/ˈruː.lər/',
        vietnameseMeaning: 'thước kẻ',
        exampleSentence: 'I use a ruler to draw straight lines.',
        exampleMeaning: 'Em dùng thước kẻ để kẻ đường thẳng.'
      }
    ]
  },
  {
    id: 'greetings',
    topic: 'Chào hỏi thân thiện (Daily Greetings)',
    icon: '👋',
    items: [
      {
        id: 'g1',
        wordOrPhrase: 'Good morning',
        phonetic: '/ˌɡʊd ˈmɔː.nɪŋ/',
        vietnameseMeaning: 'Chào buổi sáng',
        exampleSentence: 'Good morning, teacher!',
        exampleMeaning: 'Em chào cô buổi sáng ạ!'
      },
      {
        id: 'g2',
        wordOrPhrase: 'How are you?',
        phonetic: '/haʊ ɑːr juː/',
        vietnameseMeaning: 'Bạn có khỏe không?',
        exampleSentence: 'How are you today? I am great!',
        exampleMeaning: 'Hôm nay bạn thế nào? Mình rất khỏe!'
      },
      {
        id: 'g3',
        wordOrPhrase: 'Thank you very much',
        phonetic: '/ˈθæŋk juː ˈver.i mʌtʃ/',
        vietnameseMeaning: 'Cảm ơn bạn rất nhiều',
        exampleSentence: 'Thank you very much for helping me.',
        exampleMeaning: 'Cảm ơn bạn rất nhiều vì đã giúp mình.'
      }
    ]
  },
  {
    id: 'animals',
    topic: 'Thế giới động vật (Lovely Animals)',
    icon: '🐾',
    items: [
      {
        id: 'a1',
        wordOrPhrase: 'elephant',
        phonetic: '/ˈel.ɪ.fənt/',
        vietnameseMeaning: 'con voi',
        exampleSentence: 'The elephant has a very long trunk.',
        exampleMeaning: 'Chú voi có một chiếc vòi rất dài.'
      },
      {
        id: 'a2',
        wordOrPhrase: 'butterfly',
        phonetic: '/ˈbʌt.ə.flaɪ/',
        vietnameseMeaning: 'con bướm xinh',
        exampleSentence: 'Look at the colorful butterfly in the garden.',
        exampleMeaning: 'Hãy nhìn chú bướm rực rỡ sắc màu trong vườn.'
      },
      {
        id: 'a3',
        wordOrPhrase: 'dolphin',
        phonetic: '/ˈdɒl.fɪn/',
        vietnameseMeaning: 'cá heo thông minh',
        exampleSentence: 'Dolphins are smart and friendly animals.',
        exampleMeaning: 'Cá heo là loài động vật thông minh và thân thiện.'
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// WEB SPEECH API HELPER FUNCTIONS
// ----------------------------------------------------------------------------

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export interface PedagogicalVoiceProfile {
  id: 'hoaimy' | 'namminh' | 'google' | 'auto';
  name: string;
  gender: 'female' | 'male';
  region: 'Bắc' | 'Nam';
  description: string;
}

export const PEDAGOGICAL_VOICES: PedagogicalVoiceProfile[] = [
  {
    id: 'hoaimy',
    name: 'Cô Hoài My (Chuẩn Sư Phạm - Nữ Bắc)',
    gender: 'female',
    region: 'Bắc',
    description: 'Giọng đọc nữ chuẩn truyền cảm, ấm áp, nhịp điệu sư phạm rõ ràng'
  },
  {
    id: 'namminh',
    name: 'Thầy Nam Minh (Chuẩn Sư Phạm - Nam Trầm)',
    gender: 'male',
    region: 'Bắc',
    description: 'Giọng đọc nam trầm ấm, chững chạc, thích hợp hướng dẫn kỹ thuật'
  },
  {
    id: 'google',
    name: 'Cô Mai Linh (Google Tiếng Việt Tự Nhiên)',
    gender: 'female',
    region: 'Nam',
    description: 'Giọng đọc tự nhiên, chuẩn âm tiết tiếng Việt, phát âm tròn vành rõ chữ'
  },
  {
    id: 'auto',
    name: 'Tự Động Chọn Giọng Chuẩn Sư Phạm Tốt Nhất',
    gender: 'female',
    region: 'Bắc',
    description: 'Ưu tiên Neural AI voice tiếng Việt chất lượng cao nhất của hệ thống'
  }
];

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Đợi và lấy danh sách giọng đọc tiếng Việt thực tế trong trình duyệt
 */
export async function getAvailableVietnameseVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];

  let voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    await new Promise<void>((resolve) => {
      let resolved = false;
      const onVoices = () => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          resolve();
        }
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          resolve();
        }
      }, 400);
    });
    voices = window.speechSynthesis.getVoices();
  }

  return voices.filter(v => 
    v.lang.toLowerCase().startsWith('vi') ||
    v.name.toLowerCase().includes('vietnam') ||
    v.name.toLowerCase().includes('tiếng việt') ||
    v.name.toLowerCase().includes('hoaimy') ||
    v.name.toLowerCase().includes('namminh')
  );
}

/**
 * Phát giọng đọc tiếng Việt chuẩn sư phạm:
 * - Đảm bảo chỉ dùng giọng tiếng Việt chuẩn (Hoài My, Nam Minh, Google tiếng Việt, Natural)
 * - Tự động phát qua HTML5 Audio trực tuyến nếu máy tính thiếu voice tiếng Việt
 * - Tốc độ chuẩn mực (0.95), cao độ tự nhiên (1.0), không bị thé giọng hay đọc sai âm
 */
export async function speakVietnamese(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceId?: 'hoaimy' | 'namminh' | 'google' | 'auto';
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  // Dừng âm thanh cũ nếu đang chạy
  stopSpeaking();

  const cleanText = text.replace(/[*_#`]/g, '').trim();
  if (!cleanText) return;

  const voices = await getAvailableVietnameseVoices();

  // 1. TÌM GIỌNG ĐỌC SƯ PHẠM PHÙ HỢP TRÊN TRÌNH DUYỆT
  const voicePref = options?.voiceId || 'auto';
  let matchedVoice: SpeechSynthesisVoice | undefined;

  if (voicePref === 'namminh') {
    matchedVoice = voices.find(v => v.name.toLowerCase().includes('namminh')) ||
                   voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('vi'));
  } else if (voicePref === 'google') {
    matchedVoice = voices.find(v => v.name.toLowerCase().includes('google') && (v.lang.startsWith('vi') || v.name.toLowerCase().includes('tiếng việt')));
  } else if (voicePref === 'hoaimy') {
    matchedVoice = voices.find(v => v.name.toLowerCase().includes('hoaimy')) ||
                   voices.find(v => v.name.toLowerCase().includes('natural') && v.lang.startsWith('vi'));
  }

  if (!matchedVoice) {
    // Ưu tiên Neural / Natural -> Google -> Hoài My -> Bất kỳ giọng vi-VN
    matchedVoice = 
      voices.find(v => v.name.toLowerCase().includes('hoaimy')) ||
      voices.find(v => v.name.toLowerCase().includes('natural') && v.lang.startsWith('vi')) ||
      voices.find(v => v.name.toLowerCase().includes('google') && v.lang.startsWith('vi')) ||
      voices.find(v => v.lang === 'vi-VN' || v.lang === 'vi_VN') ||
      voices[0];
  }

  // 2. NẾU CÓ GIỌNG TIẾNG VIỆT CHUẨN -> PHÁT QUA SPEECH SYNTHESIS
  if (matchedVoice && isSpeechSynthesisSupported()) {
    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = matchedVoice!;
        utterance.rate = options?.rate || 0.96; // Tốc độ sư phạm chuẩn mực
        utterance.pitch = options?.pitch || 1.0; // Cao độ tự nhiên người thật
        utterance.lang = matchedVoice!.lang || 'vi-VN';

        utterance.onstart = () => {
          options?.onStart?.();
        };

        utterance.onend = () => {
          options?.onEnd?.();
          resolve();
        };

        utterance.onerror = () => {
          options?.onEnd?.();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  // 3. NẾU MÁY TÍNH KHÔNG CÓ BỘ GIỌNG TIẾNG VIỆT -> DÙNG HTML5 AUDIO VIETTTS FALLBACK
  // Tuyệt đối không dùng voice tiếng Anh để đọc tiếng Việt!
  return new Promise((resolve) => {
    try {
      options?.onStart?.();
      // Cắt câu ngắn nếu đoạn văn quá dài để Google TTS xử lý mượt mà
      const textToPlay = cleanText.length > 180 ? cleanText.slice(0, 180) + '...' : cleanText;
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(textToPlay)}`;
      
      const audio = new Audio(audioUrl);
      activeAudioElement = audio;
      audio.playbackRate = options?.rate || 1.0;

      audio.onended = () => {
        activeAudioElement = null;
        options?.onEnd?.();
        resolve();
      };

      audio.onerror = () => {
        activeAudioElement = null;
        options?.onEnd?.();
        resolve();
      };

      audio.play().catch(() => {
        activeAudioElement = null;
        options?.onEnd?.();
        resolve();
      });
    } catch {
      options?.onEnd?.();
      resolve();
    }
  });
}

/**
 * Phát âm tiếng Anh chuẩn bản ngữ cho học sinh luyện nghe
 */
export function speakEnglish(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 0.85; // Tốc độ chuẩn bản ngữ chậm rãi cho bé bắt chước
      utterance.pitch = options?.pitch || 1.05;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => 
        (v.lang === 'en-US' || v.lang === 'en_US' || v.lang.startsWith('en')) &&
        (v.name.toLowerCase().includes('natural') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('zira') ||
         v.name.toLowerCase().includes('google'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        options?.onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

export function stopSpeaking(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {}
    activeAudioElement = null;
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Bắt đầu thu âm và nhận diện giọng nói học sinh qua Microphone
 */
export function startVoiceRecognition(options: {
  lang?: 'vi-VN' | 'en-US';
  onResult: (transcript: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}): { stop: () => void } {
  if (typeof window === 'undefined') return { stop: () => {} };

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    options.onError?.('Trình duyệt không hỗ trợ nhận diện giọng nói Web Speech Recognition.');
    return { stop: () => {} };
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      options.onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      options.onError?.(event.error);
    };

    recognition.onend = () => {
      options.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
      }
    };
  } catch (err) {
    options.onError?.(err);
    return { stop: () => {} };
  }
}

// ----------------------------------------------------------------------------
// PRONUNCIATION EVALUATION ALGORITHM (CHẤM ĐIỂM PHÁT ÂM SƯ PHẠM)
// ----------------------------------------------------------------------------

function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[.,!?;:"'()[]]/g, '').trim();
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // xóa
          dp[i][j - 1] + 1,    // thêm
          dp[i - 1][j - 1] + 1 // thay thế
        );
      }
    }
  }

  return dp[m][n];
}

export function evaluatePronunciation(targetText: string, spokenText: string): PronunciationResult {
  const cleanTarget = cleanWord(targetText);
  const cleanSpoken = cleanWord(spokenText);

  if (!cleanSpoken) {
    return {
      targetText,
      spokenText: '',
      score: 0,
      accuracy: 'NEEDS_PRACTICE',
      feedback: 'Cô chưa nghe rõ giọng của bé. Bé hãy bấm mic và đọc to, rõ ràng lại một lần nữa nhé! 🌟',
      stars: 0
    };
  }

  if (cleanTarget === cleanSpoken) {
    return {
      targetText,
      spokenText,
      score: 100,
      accuracy: 'EXCELLENT',
      feedback: '🎉 Xuất sắc! Bé phát âm chuẩn 100% như người bản xứ! Tặng bé 3 ngôi sao chăm chỉ!',
      stars: 3
    };
  }

  // So sánh khoảng cách Levenshtein
  const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
  const dist = levenshteinDistance(cleanTarget, cleanSpoken);
  const rawSimilarity = Math.max(0, 1 - dist / maxLen);

  // Tính điểm trên thang 100
  let score = Math.round(rawSimilarity * 100);

  // Nếu chứa từ khóa đích
  if (cleanSpoken.includes(cleanTarget)) {
    score = Math.max(score, 90);
  }

  let accuracy: 'EXCELLENT' | 'GOOD' | 'NEEDS_PRACTICE' = 'NEEDS_PRACTICE';
  let feedback = '';
  let stars = 1;

  if (score >= 85) {
    accuracy = 'EXCELLENT';
    stars = 3;
    feedback = `🌟 Giỏi lắm! Bé phát âm đạt ${score} điểm! Giọng đọc rất tự tin và tròn vành rõ chữ!`;
  } else if (score >= 65) {
    accuracy = 'GOOD';
    stars = 2;
    feedback = `👍 Rất tốt! Bé đạt ${score} điểm. Chú ý nhấn đúng trọng âm và các âm đuôi để phát âm hoàn hảo hơn nhé!`;
  } else {
    accuracy = 'NEEDS_PRACTICE';
    stars = 1;
    feedback = `🌱 Bé đạt ${score} điểm. Đừng nản lòng nhé, bé hãy bấm nút "Nghe mẫu" rồi thử đọc lại theo cô nào!`;
  }

  return {
    targetText,
    spokenText,
    score,
    accuracy,
    feedback,
    stars
  };
}
