export type Language = 'vi' | 'en';

export const I18N_STORAGE_KEY = 'eduviet_teacher_app_language';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  } catch (e) {
    console.error('Failed to read language preference:', e);
  }
  return 'vi';
}

export function saveStoredLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to save language preference:', e);
  }
}

export const translations = {
  vi: {
    // Header & Slogan
    brand_slogan: "Cùng tri thức – Vững tương lai",
    search_placeholder: "Tìm kiếm bài giảng, lớp học, học sinh, tư liệu...",
    sync_code_title: "Mã đồng bộ đám mây",
    sync_button: "Đồng bộ",
    syncing: "Đang đồng bộ...",
    teaching_sessions: "ca dạy",
    share_zalo: "Gửi Zalo",
    notification_parent: "Đơn nghỉ học & yêu cầu từ phụ huynh",
    no_notifications: "Không có thông báo mới",
    theme_dark: "Chế độ tối",
    theme_light: "Chế độ sáng",
    lang_switch: "Chuyển sang Tiếng Anh (English)",
    lang_name: "Tiếng Việt",

    // Profile Dropdown
    teacher_role: "Giáo viên",
    edit_profile: "Chỉnh sửa thông tin hồ sơ",
    switch_account: "Đổi tài khoản / Đăng nhập",
    logout: "Đăng xuất tài khoản",
    logged_in_as: "Đang đăng nhập với",

    // Identity Card
    edit_badge: "Chỉnh sửa",
    teaching_at: "Trường",
    multiple_schools_badge: "+{count} trường",
    subject_label: "Môn",
    default_quote: "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!",

    // Quick Actions (8 Grid Cards)
    qa_lesson_plan_title: "Soạn bài 5512 / 2634",
    qa_lesson_plan_desc: "Trợ lý AI soạn giáo án chuẩn Bộ GD&ĐT",
    qa_teaching_log_title: "Sổ báo giảng",
    qa_teaching_log_desc: "Quản lý tiến độ giảng dạy, phòng học",
    qa_attendance_title: "Điểm danh & Sĩ số",
    qa_attendance_desc: "Báo cáo chuyên cần & đơn xin nghỉ từ phụ huynh",
    qa_gradebook_title: "Sổ điểm số",
    qa_gradebook_desc: "Nhập điểm thường xuyên, giữa kỳ và học kỳ",
    qa_ai_assistant_title: "Trợ lý AI Sư Phạm",
    qa_ai_assistant_desc: "Tạo đề thi, ma trận, câu hỏi trắc nghiệm tự động",
    qa_knowledge_title: "Kho tư liệu số",
    qa_knowledge_desc: "Thư viện bài giảng điện tử, video, tài liệu",
    qa_cloud_sync_title: "Đồng bộ đám mây",
    qa_cloud_sync_desc: "Đồng bộ dữ liệu hai chiều với điện thoại",
    qa_settings_title: "Cài đặt ứng dụng",
    qa_settings_desc: "Tùy chỉnh giao diện, chế độ tối và thông báo",

    // Bottom Navigation
    nav_home: "Trang chủ",
    nav_schedule: "Lịch dạy",
    nav_knowledge: "Kho tư liệu",
    nav_stats: "Báo cáo",
    nav_profile: "Hồ sơ",

    // Hero Banner & Timeline Today
    greeting_morning: "Chào buổi sáng Thầy/Cô",
    greeting_afternoon: "Chào buổi chiều Thầy/Cô",
    greeting_evening: "Chào buổi tối Thầy/Cô",
    today_teaching_schedule: "Lịch dạy hôm nay",
    no_classes_today: "Hôm nay không có tiết dạy nào. Chúc thầy/cô một ngày làm việc hiệu quả!",
    period_label: "Tiết",
    room_label: "Phòng",
    attendance_status: "Điểm danh",
    completed_status: "Đã hoàn thành",
    upcoming_status: "Sắp tới",
    in_progress_status: "Đang diễn ra",

    // Profile Modal
    profile_modal_title: "Hồ Sơ Cá Nhân Giáo Viên",
    profile_modal_subtitle: "Thông tin sư phạm cá nhân, số liên hệ, trường và môn đang đảm nhiệm",
    avatar_label: "Ảnh Đại Diện Giáo Viên (Avatar)",
    avatar_hint: "Chọn nhanh từ bộ sưu tập Avatar sư phạm thân thiện hoặc tải ảnh lên:",
    full_name: "Họ và tên giáo viên",
    phone_number: "Số điện thoại liên hệ",
    email_address: "Địa chỉ Email / Gmail",
    birth_date: "Ngày tháng năm sinh",
    gender: "Giới tính",
    gender_male: "Nam",
    gender_female: "Nữ",
    gender_other: "Khác",
    schools_title: "Trường đang giảng dạy",
    schools_subtitle: "(Có thể dạy tại nhiều trường)",
    schools_count: "trường",
    add_school_placeholder: "Nhập thêm tên trường (Ví dụ: THPT Chuyên Sư Phạm)...",
    add_school_button: "Thêm trường",
    main_school_badge: "Chính",
    subjects_title: "Môn đang giảng dạy",
    subjects_subtitle: "(Có thể đảm nhiệm nhiều môn)",
    subjects_count: "môn",
    popular_subjects_hint: "Gợi ý nhanh môn học theo chương trình GDPT 2018:",
    custom_subject_placeholder: "Hoặc nhập tên môn học khác...",
    add_subject_button: "Thêm",
    pedagogical_quote: "Châm ngôn sư phạm / Lời nhắn tâm huyết",
    auth_status: "Tài khoản đăng nhập",
    authenticated_badge: "Đã xác thực",
    cancel_button: "Hủy bỏ",
    save_profile_button: "Lưu Hồ Sơ Giáo Viên",
    save_success: "Đã lưu thành công!",

    // Auth Modal
    auth_modal_title: "Tài Khoản Giáo Viên",
    auth_modal_subtitle: "Đăng nhập hoặc đăng ký tài khoản đồng bộ giảng dạy",
    tab_login: "Đăng Nhập",
    tab_register: "Đăng Ký Mới",
    choose_method: "Chọn phương thức",
    method_phone: "Số điện thoại",
    method_email: "Gmail / Email",
    method_school_code: "Trường cấp",
    login_id_phone: "Số điện thoại giáo viên",
    login_id_email: "Địa chỉ Gmail / Email",
    login_id_school: "Mã tài khoản nhà trường cấp",
    password: "Mật khẩu",
    forgot_password: "Quên mật khẩu?",
    login_submit: "Đăng Nhập Vào Hệ Thống",
    saved_accounts_title: "Tài khoản giáo viên đã lưu trên máy:",
    select_account: "Chọn",
    register_school: "Trường đang giảng dạy",
    register_subject: "Môn học phụ trách",
    register_password: "Mật khẩu đăng nhập",
    register_submit: "Đăng Ký & Bắt Đầu Sử Dụng Ngay"
  },
  en: {
    // Header & Slogan
    brand_slogan: "With Knowledge – Shaping the Future",
    search_placeholder: "Search lesson plans, classes, students, teaching materials...",
    sync_code_title: "Cloud Sync Code",
    sync_button: "Sync",
    syncing: "Syncing...",
    teaching_sessions: "sessions",
    share_zalo: "Share Link",
    notification_parent: "Absence requests & parent inquiries",
    no_notifications: "No new notifications",
    theme_dark: "Dark Mode",
    theme_light: "Light Mode",
    lang_switch: "Switch to Vietnamese (Tiếng Việt)",
    lang_name: "English",

    // Profile Dropdown
    teacher_role: "Teacher",
    edit_profile: "Edit Profile Details",
    switch_account: "Switch Account / Sign In",
    logout: "Sign Out",
    logged_in_as: "Signed in as",

    // Identity Card
    edit_badge: "Edit",
    teaching_at: "School",
    multiple_schools_badge: "+{count} schools",
    subject_label: "Subject",
    default_quote: "Every teaching hour is a journey of inspiring young minds!",

    // Quick Actions (8 Grid Cards)
    qa_lesson_plan_title: "Lesson Planner (MOET Standards)",
    qa_lesson_plan_desc: "AI assistant for official curriculum lesson design",
    qa_teaching_log_title: "Teaching Logbook",
    qa_teaching_log_desc: "Track teaching syllabus progress & assigned rooms",
    qa_attendance_title: "Attendance & Roster",
    qa_attendance_desc: "Class attendance records & verified parent leaves",
    qa_gradebook_title: "Gradebook",
    qa_gradebook_desc: "Record continuous, midterm and semester evaluations",
    qa_ai_assistant_title: "AI Pedagogy Assistant",
    qa_ai_assistant_desc: "Generate exam matrices, quizzes, and teaching rubrics",
    qa_knowledge_title: "Digital Resource Hub",
    qa_knowledge_desc: "Digital curriculum library, slides, videos, worksheets",
    qa_cloud_sync_title: "Cloud Synchronization",
    qa_cloud_sync_desc: "Seamless two-way cloud sync with mobile devices",
    qa_settings_title: "Application Settings",
    qa_settings_desc: "Customize display theme, notifications & preferences",

    // Bottom Navigation
    nav_home: "Home",
    nav_schedule: "Schedule",
    nav_knowledge: "Resources",
    nav_stats: "Reports",
    nav_profile: "Profile",

    // Hero Banner & Timeline Today
    greeting_morning: "Good morning Teacher",
    greeting_afternoon: "Good afternoon Teacher",
    greeting_evening: "Good evening Teacher",
    today_teaching_schedule: "Today's Schedule",
    no_classes_today: "No teaching sessions scheduled for today. Have an inspiring day!",
    period_label: "Period",
    room_label: "Room",
    attendance_status: "Attendance",
    completed_status: "Completed",
    upcoming_status: "Upcoming",
    in_progress_status: "In Progress",

    // Profile Modal
    profile_modal_title: "Teacher Profile Information",
    profile_modal_subtitle: "Personal pedagogical info, contact details, schools & assigned subjects",
    avatar_label: "Teacher Avatar",
    avatar_hint: "Quick pick from friendly pedagogical avatars or upload your photo:",
    full_name: "Teacher Full Name",
    phone_number: "Contact Phone Number",
    email_address: "Email / Gmail Address",
    birth_date: "Date of Birth",
    gender: "Gender",
    gender_male: "Male",
    gender_female: "Female",
    gender_other: "Other",
    schools_title: "Assigned Schools",
    schools_subtitle: "(Supports teaching at multiple institutions)",
    schools_count: "schools",
    add_school_placeholder: "Enter school name (e.g., Vietnam International School)...",
    add_school_button: "Add School",
    main_school_badge: "Primary",
    subjects_title: "Assigned Subjects",
    subjects_subtitle: "(Supports handling multiple subjects)",
    subjects_count: "subjects",
    popular_subjects_hint: "Quick suggestions from General Education curriculum:",
    custom_subject_placeholder: "Or type a custom subject name...",
    add_subject_button: "Add",
    pedagogical_quote: "Pedagogical Motto / Bio Quote",
    auth_status: "Sign-in Account",
    authenticated_badge: "Verified",
    cancel_button: "Cancel",
    save_profile_button: "Save Teacher Profile",
    save_success: "Successfully Saved!",

    // Auth Modal
    auth_modal_title: "Teacher Account",
    auth_modal_subtitle: "Sign in or register your cloud-synced teaching account",
    tab_login: "Sign In",
    tab_register: "Register New",
    choose_method: "Choose method",
    method_phone: "Phone Number",
    method_email: "Gmail / Email",
    method_school_code: "School Code",
    login_id_phone: "Teacher Phone Number",
    login_id_email: "Gmail / Email Address",
    login_id_school: "School-Issued Teacher Code",
    password: "Password",
    forgot_password: "Forgot password?",
    login_submit: "Sign In to System",
    saved_accounts_title: "Accounts saved on this device:",
    select_account: "Select",
    register_school: "Assigned School",
    register_subject: "Assigned Subject",
    register_password: "Create Password",
    register_submit: "Register & Start Teaching Now"
  }
} as const;

export type TranslationKey = keyof typeof translations.vi;

export function t(key: TranslationKey, lang: Language = 'vi', params?: Record<string, string | number>): string {
  const currentDict = translations[lang] || translations.vi;
  let text: string = (currentDict as any)[key] || (translations.vi as any)[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  
  return text;
}
