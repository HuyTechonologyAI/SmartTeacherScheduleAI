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

/**
 * Phát giọng đọc tiếng Việt truyền cảm, thân thiện với học sinh
 */
export function speakVietnamese(
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
      window.speechSynthesis.cancel(); // Hủy giọng đọc trước nếu đang chạy

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 0.92; // Đọc hơi chậm rãi, rõ ràng cho bé
      utterance.pitch = options?.pitch || 1.1; // Giọng hơi thanh nhẹ, ấm áp
      utterance.lang = 'vi-VN';

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => 
        v.lang === 'vi-VN' || 
        v.lang === 'vi_VN' || 
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('mai')
      );

      if (viVoice) {
        utterance.voice = viVoice;
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
