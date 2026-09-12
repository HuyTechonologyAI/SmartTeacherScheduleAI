"use client";

export interface TeacherProfile {
  id: string; // Mã giáo viên duy nhất (VD: GV-202688 hoặc mã trường cấp)
  avatar: string; // URL ảnh đại diện hoặc Base64
  fullName: string; // Họ và tên giáo viên
  phone: string; // Số điện thoại liên hệ
  birthDate: string; // Ngày tháng năm sinh (YYYY-MM-DD)
  gender: 'Nam' | 'Nữ' | 'Khác'; // Giới tính
  email: string; // Địa chỉ mail / Gmail
  schools: string[]; // Danh sách các trường đang dạy (hỗ trợ nhiều trường)
  subjects: string[]; // Danh sách các môn đang dạy (hỗ trợ nhiều môn)
  loginType: 'phone' | 'email' | 'school_code'; // Phương thức đăng nhập: sđt | gmail | trường cấp
  loginIdentifier: string; // Giá trị định danh tương ứng
  bioQuote?: string; // Châm ngôn sư phạm
  isLoggedIn: boolean; // Trạng thái đăng nhập
  lastLoginAt?: string; // Thời gian đăng nhập gần nhất
}

export const POPULAR_SUBJECTS = [
  "Toán học",
  "Ngữ văn",
  "Tiếng Anh",
  "Vật lý",
  "Hóa học",
  "Sinh học",
  "Lịch sử",
  "Địa lý",
  "Tin học",
  "Giáo dục kinh tế & pháp luật",
  "Công nghệ",
  "Âm nhạc",
  "Mỹ thuật",
  "Giáo dục thể chất",
  "Hoạt động trải nghiệm, hướng nghiệp",
  "Khoa học tự nhiên",
  "Lịch sử & Địa lý"
];

export const AVATAR_PRESETS = [
  { id: "teacher_1", label: "Cô giáo AI", url: "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher" },
  { id: "teacher_2", label: "Thầy giáo AI", url: "https://api.dicebear.com/7.x/bottts/svg?seed=VietnameseTeacher" },
  { id: "teacher_3", label: "Sư phạm Xanh", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherGreen" },
  { id: "teacher_4", label: "Sáng tạo Cam", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherOrange" },
  { id: "teacher_5", label: "Trí tuệ Tím", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherPurple" },
  { id: "teacher_6", label: "Nhiệt huyết Đỏ", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherRed" },
  { id: "teacher_7", label: "Khoa học Lam", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherBlue" },
  { id: "teacher_8", label: "Thân thiện Vàng", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TeacherYellow" }
];

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  id: "GV-202688",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher",
  fullName: "Nguyễn Minh Anh",
  phone: "0961364600",
  birthDate: "1990-05-15",
  gender: "Nữ",
  email: "nguyenminhanh.edu@gmail.com",
  schools: ["Trường THPT Việt Nam", "Trường THPT Chuyên Sư Phạm"],
  subjects: ["Toán học", "Tin học"],
  loginType: "phone",
  loginIdentifier: "0961364600",
  bioQuote: "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!",
  isLoggedIn: true,
  lastLoginAt: new Date().toISOString()
};

const STORAGE_KEY_CURRENT = "edu_viet_teacher_profile";
const STORAGE_KEY_SAVED_LIST = "edu_viet_saved_teacher_accounts";

export function getStoredTeacherProfile(): TeacherProfile {
  if (typeof window === "undefined") return DEFAULT_TEACHER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (!raw) {
      saveTeacherProfile(DEFAULT_TEACHER_PROFILE);
      return DEFAULT_TEACHER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TEACHER_PROFILE,
      ...parsed,
      schools: Array.isArray(parsed.schools) && parsed.schools.length > 0 ? parsed.schools : DEFAULT_TEACHER_PROFILE.schools,
      subjects: Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_TEACHER_PROFILE.subjects
    };
  } catch (e) {
    console.error("Error reading stored teacher profile:", e);
    return DEFAULT_TEACHER_PROFILE;
  }
}

export function saveTeacherProfile(profile: TeacherProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(profile));
    saveTeacherAccountToList(profile);
  } catch (e) {
    console.error("Error saving teacher profile:", e);
  }
}

export function getStoredTeacherAccounts(): TeacherProfile[] {
  if (typeof window === "undefined") return [DEFAULT_TEACHER_PROFILE];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LIST);
    if (!raw) return [DEFAULT_TEACHER_PROFILE];
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : [DEFAULT_TEACHER_PROFILE];
  } catch (e) {
    return [DEFAULT_TEACHER_PROFILE];
  }
}

export function saveTeacherAccountToList(profile: TeacherProfile): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredTeacherAccounts();
    const existingIndex = list.findIndex(p => p.id === profile.id || p.loginIdentifier === profile.loginIdentifier);
    if (existingIndex >= 0) {
      list[existingIndex] = profile;
    } else {
      list.push(profile);
    }
    localStorage.setItem(STORAGE_KEY_SAVED_LIST, JSON.stringify(list));
  } catch (e) {
    console.error("Error saving teacher account to list:", e);
  }
}