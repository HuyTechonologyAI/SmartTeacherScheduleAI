// ============================================================================
// SCHOOL MANAGEMENT DATA ENGINE - EDUVIET SMART TEACHER SCHEDULE
// Quản trị toàn diện: Giáo án, Nhân sự 4 nhóm, Lịch công tác, Văn bản pháp quy,
// Đồng bộ 4 cổng (Nhà trường - Giáo viên - Học sinh - Phụ huynh) & AI Phân tích
// ============================================================================

export type StaffCategory = 'TENURED_TEACHER' | 'CONTRACT_TEACHER' | 'STAFF' | 'WORKER';
export type AcademicYear = '2025 - 2026' | '2024 - 2025' | '2026 - 2027';
export type SemesterType = 'SEMESTER_1' | 'SEMESTER_2' | 'FULL_YEAR';
export type LessonPlanStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVISION';
export type DocumentSource = 'SCHOOL' | 'DOET' | 'MOET' | 'PARTY';
export type ScheduleEventType = 'BGH_MEETING' | 'PARTY_MEETING' | 'UNION_MEETING' | 'SUBJECT_MEETING' | 'SUBSTITUTE_TEACHING' | 'INSPECTION';

export interface TeacherStaffItem {
  id: string;
  staffCode: string;
  fullName: string;
  avatar: string;
  category: StaffCategory;
  department: string; // Khoa / Tổ chuyên môn (VD: Tổ Toán - Tin, Tổ Ngữ văn, Tổ Tự nhiên, Ban Giám Hiệu, Phòng Kế toán)
  roleTitle: string; // Chức vụ (Hiệu trưởng, Hiệu phó, Tổ trưởng chuyên môn, Giáo viên chủ nhiệm, Kế toán, Văn thư, Bảo vệ)
  degree: string; // Trình độ (Thạc sĩ Quản lý giáo dục, Cử nhân Sư phạm, Trung cấp...)
  teachingSubjects: string[];
  seniorityYears: number;
  weeklyTeachingHours: number; // Định mức tiết dạy / tuần
  assignedClasses: string[]; // Các lớp đang phụ trách
  phone: string;
  email: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RETIRED';
  isPartyMember?: boolean; // Đảng viên
}

export interface SchoolLessonPlanItem {
  id: string;
  planCode: string;
  lessonTitle: string;
  subject: string;
  gradeLevel: string; // Khối (Lớp 1..12 hoặc CĐ/ĐH)
  targetClass: string;
  teacherId: string;
  teacherName: string;
  department: string;
  academicYear: AcademicYear;
  semester: SemesterType;
  submittedAt: number;
  status: LessonPlanStatus;
  reviewedBy?: string; // Người duyệt (Hiệu phó CM hoặc Tổ trưởng)
  reviewedAt?: number;
  reviewNotes?: string;
  curriculumStandard: 'CV_5512' | 'CV_2634';
  durationPeriods: number;
  hasDigitalAssets: boolean; // Có slide hoặc học liệu số đi kèm
}

export interface SchoolWorkScheduleItem {
  id: string;
  title: string;
  type: ScheduleEventType;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  chairPerson: string; // Người chủ trì (Hiệu trưởng, Bí thư chi bộ...)
  participants: string; // Thành phần tham dự
  contentSummary: string;
  department: string;
  isImportant: boolean;
}

export interface LegalDocumentItem {
  id: string;
  documentNumber: string; // Số hiệu (VD: 5512/BGDĐT-GDTrH, 18/QĐ-THVN)
  title: string;
  source: DocumentSource; // SCHOOL | DOET | MOET | PARTY
  issueDate: string;
  signerName: string;
  signerTitle: string;
  summary: string;
  category: string; // Chỉ đạo chuyên môn, Kế hoạch năm học, Nghị quyết chi bộ, Công tác học sinh...
  fileAttachmentName?: string;
  isUrgent?: boolean;
}

export interface SchoolClassroomItem {
  id: string;
  name: string;
  grade: string;
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
  studentCount: number;
  roomLocation: string;
  academicYear: AcademicYear;
  attendanceRateToday?: number;
  kudosTotalPoints?: number;
}

export interface FacilityRoomItem {
  id: string;
  name: string; // Phòng Tin học 1, Phòng Lab Ngoại ngữ, Nhà thi đấu đa năng...
  roomType: 'COMPUTER_LAB' | 'LANGUAGE_LAB' | 'SCIENCE_LAB' | 'LIBRARY' | 'MULTIPURPOSE_HALL';
  capacity: number;
  status: 'READY' | 'IN_USE' | 'MAINTENANCE';
  currentClassUsing?: string;
  currentTeacherUsing?: string;
  equipmentSummary: string;
}

// ============================================================================
// DỮ LIỆU KHỞI TẠO MẪU CHUẨN SƯ PHẠM VIỆT NAM
// ============================================================================

export const INITIAL_STAFF_LIST: TeacherStaffItem[] = [
  {
    id: 'staff_1',
    staffCode: 'BGH-01',
    fullName: 'TS. Nguyễn Văn Thành',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PrincipalThanh',
    category: 'TENURED_TEACHER',
    department: 'Ban Giám Hiệu',
    roleTitle: 'Hiệu trưởng - Bí thư Chi bộ',
    degree: 'Tiến sĩ Quản lý Giáo dục',
    teachingSubjects: ['Giáo dục công dân'],
    seniorityYears: 24,
    weeklyTeachingHours: 4,
    assignedClasses: ['Khối 9'],
    phone: '0912345678',
    email: 'hieutruong.thanh@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: true
  },
  {
    id: 'staff_2',
    staffCode: 'BGH-02',
    fullName: 'ThS. Lê Hoàng Yến',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VicePrincipalYen',
    category: 'TENURED_TEACHER',
    department: 'Ban Giám Hiệu',
    roleTitle: 'Phó Hiệu trưởng phụ trách Chuyên môn',
    degree: 'Thạc sĩ Phương pháp Dạy học Toán',
    teachingSubjects: ['Toán học'],
    seniorityYears: 18,
    weeklyTeachingHours: 6,
    assignedClasses: ['Lớp 9A1'],
    phone: '0988765432',
    email: 'hieupho.yen@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: true
  },
  {
    id: 'staff_3',
    staffCode: 'GV-301',
    fullName: 'Cô Trần Thị Mai',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherMai',
    category: 'TENURED_TEACHER',
    department: 'Tổ Tiểu Học',
    roleTitle: 'Tổ trưởng chuyên môn - GVCN Lớp 3A1',
    degree: 'Cử nhân Giáo dục Tiểu học',
    teachingSubjects: ['Toán học', 'Tiếng Việt', 'Tự nhiên & Xã hội'],
    seniorityYears: 12,
    weeklyTeachingHours: 19,
    assignedClasses: ['Lớp 3A1'],
    phone: '0961364600',
    email: 'mai.tran@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: true
  },
  {
    id: 'staff_4',
    staffCode: 'GV-302',
    fullName: 'Thầy Lê Minh Đức',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherDuc',
    category: 'TENURED_TEACHER',
    department: 'Tổ Tự Nhiên & Khoa Học',
    roleTitle: 'Giáo viên bộ môn - GVCN Lớp 4A',
    degree: 'Cử nhân Sư phạm Vật lý',
    teachingSubjects: ['Khoa học tự nhiên', 'Vật lý'],
    seniorityYears: 8,
    weeklyTeachingHours: 18,
    assignedClasses: ['Lớp 4A', 'Lớp 5A'],
    phone: '0977112233',
    email: 'duc.le@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: false
  },
  {
    id: 'staff_5',
    staffCode: 'GV-ENG',
    fullName: 'Cô Sarah Nguyen',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherSarah',
    category: 'CONTRACT_TEACHER',
    department: 'Tổ Ngoại Ngữ',
    roleTitle: 'Giáo viên Tiếng Anh Bản ngữ',
    degree: 'TESOL & BA in Applied Linguistics',
    teachingSubjects: ['Tiếng Anh'],
    seniorityYears: 5,
    weeklyTeachingHours: 16,
    assignedClasses: ['Lớp 3A1', 'Lớp 4A', 'Lớp 5A'],
    phone: '0933556677',
    email: 'sarah.nguyen@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: false
  },
  {
    id: 'staff_6',
    staffCode: 'NV-KT',
    fullName: 'Phạm Thị Thùy Dung',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StaffDung',
    category: 'STAFF',
    department: 'Tổ Hành Chính - Kế Toán',
    roleTitle: 'Kế toán trưởng & Quản lý Thu - Chi',
    degree: 'Cử nhân Tài chính - Kế toán',
    teachingSubjects: [],
    seniorityYears: 9,
    weeklyTeachingHours: 0,
    assignedClasses: [],
    phone: '0944223344',
    email: 'ketoan.dung@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: true
  },
  {
    id: 'staff_7',
    staffCode: 'NV-YT',
    fullName: 'Bác sĩ Vũ Hoài Nam',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DoctorNam',
    category: 'STAFF',
    department: 'Y Tế Học Đường',
    roleTitle: 'Cán bộ Y tế & Chăm sóc Sức khỏe',
    degree: 'Bác sĩ Đa khoa',
    teachingSubjects: [],
    seniorityYears: 6,
    weeklyTeachingHours: 0,
    assignedClasses: [],
    phone: '0911889900',
    email: 'yte.nam@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: false
  },
  {
    id: 'staff_8',
    staffCode: 'LD-BV',
    fullName: 'Bác Trần Văn Hùng',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SecurityHung',
    category: 'WORKER',
    department: 'Tổ An Ninh - Bảo Vệ',
    roleTitle: 'Tổ trưởng Tổ Bảo vệ & An toàn trường học',
    degree: 'Chứng chỉ Nghiệp vụ An ninh',
    teachingSubjects: [],
    seniorityYears: 14,
    weeklyTeachingHours: 0,
    assignedClasses: [],
    phone: '0903123456',
    email: 'baove.hung@eduviet.edu.vn',
    status: 'ACTIVE',
    isPartyMember: false
  }
];

export const INITIAL_LESSON_PLANS: SchoolLessonPlanItem[] = [
  {
    id: 'lp_1',
    planCode: 'KHBD-TOAN3-T24',
    lessonTitle: 'Bảng nhân 7 và Luyện tập ứng dụng giải toán thực tế',
    subject: 'Toán học',
    gradeLevel: 'Khối 3',
    targetClass: 'Lớp 3A1',
    teacherId: 'staff_3',
    teacherName: 'Cô Trần Thị Mai',
    department: 'Tổ Tiểu Học',
    academicYear: '2025 - 2026',
    semester: 'SEMESTER_2',
    submittedAt: Date.now() - 3 * 86400000,
    status: 'APPROVED',
    reviewedBy: 'ThS. Lê Hoàng Yến (Hiệu phó CM)',
    reviewedAt: Date.now() - 2 * 86400000,
    reviewNotes: 'Giáo án thiết kế chuẩn 4 hoạt động CV 5512, tích hợp đồ dùng học tập trực quan và trò chơi toán học rất sinh động.',
    curriculumStandard: 'CV_5512',
    durationPeriods: 2,
    hasDigitalAssets: true
  },
  {
    id: 'lp_2',
    planCode: 'KHBD-VAN3-T24',
    lessonTitle: 'Tập làm văn: Luyện tập miêu tả cảnh đẹp quê hương',
    subject: 'Tiếng Việt',
    gradeLevel: 'Khối 3',
    targetClass: 'Lớp 3A1',
    teacherId: 'staff_3',
    teacherName: 'Cô Trần Thị Mai',
    department: 'Tổ Tiểu Học',
    academicYear: '2025 - 2026',
    semester: 'SEMESTER_2',
    submittedAt: Date.now() - 1 * 86400000,
    status: 'PENDING',
    curriculumStandard: 'CV_5512',
    durationPeriods: 1,
    hasDigitalAssets: true
  },
  {
    id: 'lp_3',
    planCode: 'KHBD-KHTN-T25',
    lessonTitle: 'Thực hành: Khảo sát vòng tuần hoàn của nước trong tự nhiên',
    subject: 'Khoa học tự nhiên',
    gradeLevel: 'Khối 4',
    targetClass: 'Lớp 4A',
    teacherId: 'staff_4',
    teacherName: 'Thầy Lê Minh Đức',
    department: 'Tổ Tự Nhiên & Khoa Học',
    academicYear: '2025 - 2026',
    semester: 'SEMESTER_2',
    submittedAt: Date.now() - 2 * 86400000,
    status: 'APPROVED',
    reviewedBy: 'ThS. Lê Hoàng Yến (Hiệu phó CM)',
    reviewedAt: Date.now() - 86400000,
    reviewNotes: 'Kế hoạch thí nghiệm an toàn, chuẩn bị hóa chất và bình đựng chu đáo.',
    curriculumStandard: 'CV_5512',
    durationPeriods: 2,
    hasDigitalAssets: true
  },
  {
    id: 'lp_4',
    planCode: 'KHBD-ENG-U08',
    lessonTitle: 'Unit 8: Our Busy School - Speaking & Role-play Project',
    subject: 'Tiếng Anh',
    gradeLevel: 'Khối 3',
    targetClass: 'Lớp 3A1',
    teacherId: 'staff_5',
    teacherName: 'Cô Sarah Nguyen',
    department: 'Tổ Ngoại Ngữ',
    academicYear: '2025 - 2026',
    semester: 'SEMESTER_2',
    submittedAt: Date.now() - 4 * 86400000,
    status: 'NEEDS_REVISION',
    reviewedBy: 'Cô Trần Thị Mai (Tổ trưởng)',
    reviewedAt: Date.now() - 2 * 86400000,
    reviewNotes: 'Cần bổ sung tiêu chí đánh giá năng lực giao tiếp và sản phẩm đầu ra của học sinh theo thang đo chuẩn GDPT 2018.',
    curriculumStandard: 'CV_5512',
    durationPeriods: 2,
    hasDigitalAssets: true
  }
];

export const INITIAL_WORK_SCHEDULES: SchoolWorkScheduleItem[] = [
  {
    id: 'ws_1',
    title: 'Họp Giao Ban Đầu Tuần - Ban Giám Hiệu & Tổ Trưởng Chuyên Môn',
    type: 'BGH_MEETING',
    date: '2026-09-15',
    startTime: '07:30',
    endTime: '08:45',
    location: 'Phòng Họp Hội Đồng Sư Phạm (Tầng 2)',
    chairPerson: 'TS. Nguyễn Văn Thành (Hiệu trưởng)',
    participants: 'BGH, Tổ trưởng chuyên môn, Trưởng các bộ phận',
    contentSummary: 'Đánh giá tiến độ nộp giáo án tuần 24, kiểm tra tỷ lệ chuyên cần học sinh và triển khai kế hoạch hội giảng chào mừng ngày Nhà giáo.',
    department: 'Ban Giám Hiệu',
    isImportant: true
  },
  {
    id: 'ws_2',
    title: 'Sinh Hoạt Chuyên Đề Chi Bộ: Đổi Mới Phương Pháp Dạy Học Số & AI',
    type: 'PARTY_MEETING',
    date: '2026-09-16',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Hội Trường Lớn',
    chairPerson: 'TS. Nguyễn Văn Thành (Bí thư Chi bộ)',
    participants: 'Toàn thể Đảng viên chi bộ trường',
    contentSummary: 'Học tập và thực hiện Nghị quyết chuyển đổi số ngành giáo dục, ứng dụng Trợ lý AI sư phạm theo QĐ 2422/BGDĐT.',
    department: 'Chi Bộ Đảng',
    isImportant: true
  },
  {
    id: 'ws_3',
    title: 'Hội Thảo Chuyên Môn Cụm Trường: Đổi Mới Kiểm Tra Đánh Giá Theo TT 22',
    type: 'SUBJECT_MEETING',
    date: '2026-09-18',
    startTime: '08:00',
    endTime: '11:30',
    location: 'Phòng Đa Năng Thông Minh',
    chairPerson: 'ThS. Lê Hoàng Yến (Hiệu phó CM)',
    participants: 'Giáo viên tổ Toán - Tin và KHTN các trường trong cụm',
    contentSummary: 'Xây dựng ma trận đề kiểm tra giữa kỳ, ngân hàng câu hỏi phân hóa năng lực học sinh.',
    department: 'Tổ Chuyên Môn',
    isImportant: false
  },
  {
    id: 'ws_4',
    title: 'Phân Công Dạy Thay: Cô Mai dự hội nghị tập huấn Sở GD&ĐT',
    type: 'SUBSTITUTE_TEACHING',
    date: '2026-09-19',
    startTime: '08:00',
    endTime: '11:15',
    location: 'Lớp 3A1',
    chairPerson: 'ThS. Lê Hoàng Yến (Phó Hiệu trưởng CM)',
    participants: 'Cô Phạm Thu Hà (Dạy thay tiết 1-2), Thầy Đức (Dạy thay tiết 3-4)',
    contentSummary: 'Đảm bảo tiến độ chương trình Lớp 3A1 khi GVCN đi công tác theo triệu tập của Sở GD&ĐT.',
    department: 'Tổ Tiểu Học',
    isImportant: false
  }
];

export const INITIAL_LEGAL_DOCUMENTS: LegalDocumentItem[] = [
  {
    id: 'doc_1',
    documentNumber: '5512/BGDĐT-GDTrH',
    title: 'Công văn về việc xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
    source: 'MOET',
    issueDate: '2020-12-18',
    signerName: 'Nguyễn Hữu Độ',
    signerTitle: 'Thứ trưởng Bộ Giáo dục và Đào tạo',
    summary: 'Quy định khung kế hoạch bài dạy chuẩn mực gồm 3 thành tố mục tiêu (Kiến thức, Năng lực, Phẩm chất) và 4 hoạt động dạy học bắt buộc.',
    category: 'Văn bản Quy phạm Chuyên môn',
    fileAttachmentName: 'CV_5512_BGDDT_Khung_Giao_An.pdf',
    isUrgent: false
  },
  {
    id: 'doc_2',
    documentNumber: '2422/QĐ-BGDĐT',
    title: 'Quyết định phê duyệt định hướng ứng dụng Trí tuệ Nhân tạo (AI) trong giáo dục phổ thông',
    source: 'MOET',
    issueDate: '2024-08-15',
    signerName: 'Nguyễn Kim Sơn',
    signerTitle: 'Bộ trưởng Bộ Giáo dục và Đào tạo',
    summary: 'Quy tắc liêm chính học thuật, đạo đức AI và tiêu chuẩn khai thác công cụ AI hỗ trợ giáo viên và học sinh đạt hiệu quả sư phạm tối ưu.',
    category: 'Chuyển Đổi Số & AI Sư Phạm',
    fileAttachmentName: 'QD_2422_Ung_Dung_AI_Giao_Duc.pdf',
    isUrgent: true
  },
  {
    id: 'doc_3',
    documentNumber: '115/HD-SGDĐT',
    title: 'Hướng dẫn thực hiện nhiệm vụ trọng tâm học kỳ 2 năm học 2025 - 2026',
    source: 'DOET',
    issueDate: '2026-01-05',
    signerName: 'Trần Thế Cương',
    signerTitle: 'Giám đốc Sở Giáo dục và Đào tạo',
    summary: 'Chỉ đạo công tác chuyên môn, kiểm định chất lượng, kỳ thi học sinh giỏi và ngày hội STEM/AI cấp thành phố.',
    category: 'Chỉ Đạo Địa Phương',
    fileAttachmentName: 'HD_115_Nhiem_Vu_HK2_SGDDT.pdf',
    isUrgent: false
  },
  {
    id: 'doc_4',
    documentNumber: '45/QĐ-THVN',
    title: 'Quyết định phân công nhiệm vụ cán bộ, giáo viên và nhân viên năm học 2025 - 2026',
    source: 'SCHOOL',
    issueDate: '2025-08-25',
    signerName: 'TS. Nguyễn Văn Thành',
    signerTitle: 'Hiệu trưởng Trường',
    summary: 'Phân công giáo viên chủ nhiệm các khối lớp 1-12, tổ trưởng chuyên môn và định mức giờ dạy chuẩn toàn trường.',
    category: 'Nội Bộ Nhà Trường',
    fileAttachmentName: 'QD_45_Phan_Cong_Nhiem_Vu_2025_2026.pdf',
    isUrgent: false
  },
  {
    id: 'doc_5',
    documentNumber: '12-NQ/CB',
    title: 'Nghị quyết Chi bộ trường học về tăng cường kỷ cương sư phạm và chuyển đổi số trường học',
    source: 'PARTY',
    issueDate: '2026-01-10',
    signerName: 'TS. Nguyễn Văn Thành',
    signerTitle: 'Bí thư Chi bộ',
    summary: 'Nâng cao vai trò tiền phong gương mẫu của Đảng viên giáo viên trong việc ứng dụng công nghệ giáo dục và học tập suốt đời.',
    category: 'Công Tác Chi Bộ & Đảng',
    fileAttachmentName: 'NQ_12_Chi_Bo_Truong_Hoc_2026.pdf',
    isUrgent: false
  }
];

export const INITIAL_SCHOOL_CLASSES: SchoolClassroomItem[] = [
  { id: 'c1', name: 'Lớp 1A', grade: 'Khối 1', homeroomTeacherName: 'Cô Lê Thị Lan', studentCount: 32, roomLocation: 'Phòng 101', academicYear: '2025 - 2026', attendanceRateToday: 98 },
  { id: 'c2', name: 'Lớp 2B', grade: 'Khối 2', homeroomTeacherName: 'Cô Đỗ Minh Châu', studentCount: 34, roomLocation: 'Phòng 102', academicYear: '2025 - 2026', attendanceRateToday: 97 },
  { id: 'c3', name: 'Lớp 3A1', grade: 'Khối 3', homeroomTeacherId: 'staff_3', homeroomTeacherName: 'Cô Trần Thị Mai', studentCount: 35, roomLocation: 'Phòng 204', academicYear: '2025 - 2026', attendanceRateToday: 99, kudosTotalPoints: 1250 },
  { id: 'c4', name: 'Lớp 4A', grade: 'Khối 4', homeroomTeacherId: 'staff_4', homeroomTeacherName: 'Thầy Lê Minh Đức', studentCount: 33, roomLocation: 'Phòng 205', academicYear: '2025 - 2026', attendanceRateToday: 96 },
  { id: 'c5', name: 'Lớp 5A', grade: 'Khối 5', homeroomTeacherName: 'Cô Hoàng Thu Thủy', studentCount: 36, roomLocation: 'Phòng 301', academicYear: '2025 - 2026', attendanceRateToday: 100 }
];

export const INITIAL_FACILITIES: FacilityRoomItem[] = [
  { id: 'f1', name: 'Phòng Tin Học 1 (Smart Lab)', roomType: 'COMPUTER_LAB', capacity: 40, status: 'READY', equipmentSummary: '40 máy tính Core i5, màn hình 24 inch, máy chiếu tương tác 4K, đường truyền quang 1Gbps.' },
  { id: 'f2', name: 'Phòng Ngoại Ngữ Chuyên Dụng (Language Lab)', roomType: 'LANGUAGE_LAB', capacity: 36, status: 'IN_USE', currentClassUsing: 'Lớp 3A1', currentTeacherUsing: 'Cô Sarah Nguyen', equipmentSummary: 'Tai nghe chụp tai chuyên dụng, micro khử ồn, phần mềm luyện phát âm AI.' },
  { id: 'f3', name: 'Thư Viện Số & Không Gian Đọc Mở', roomType: 'LIBRARY', capacity: 80, status: 'READY', equipmentSummary: '10.000 đầu sách giấy, 15 máy tính bảng tra cứu tài liệu số, hệ thống quét mã vạch mượn sách tự động.' },
  { id: 'f4', name: 'Nhà Đa Năng & Thi Đấu Thể Thao', roomType: 'MULTIPURPOSE_HALL', capacity: 300, status: 'READY', equipmentSummary: 'Sàn cao su đạt chuẩn thi đấu, sân bóng rổ, cầu lông, hệ thống âm thanh ánh sáng sự kiện.' }
];

// ============================================================================
// HỆ THỐNG STORAGE & ĐỒNG BỘ DỮ LIỆU
// ============================================================================

export const STORAGE_STAFF_KEY = 'smart_school_staff_list_v1';
export const STORAGE_LESSON_PLANS_KEY = 'smart_school_lesson_plans_v1';
export const STORAGE_WORK_SCHEDULES_KEY = 'smart_school_work_schedules_v1';
export const STORAGE_DOCUMENTS_KEY = 'smart_school_legal_documents_v1';
export const STORAGE_CLASSES_KEY = 'smart_school_classes_v1';
export const STORAGE_FACILITIES_KEY = 'smart_school_facilities_v1';

export function getStoredStaffList(): TeacherStaffItem[] {
  if (typeof window === 'undefined') return INITIAL_STAFF_LIST;
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_KEY);
    return raw ? JSON.parse(raw) : INITIAL_STAFF_LIST;
  } catch (_) {
    return INITIAL_STAFF_LIST;
  }
}

export function saveStoredStaffList(data: TeacherStaffItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function getStoredLessonPlans(): SchoolLessonPlanItem[] {
  if (typeof window === 'undefined') return INITIAL_LESSON_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_LESSON_PLANS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_LESSON_PLANS;
  } catch (_) {
    return INITIAL_LESSON_PLANS;
  }
}

export function saveStoredLessonPlans(data: SchoolLessonPlanItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LESSON_PLANS_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function getStoredWorkSchedules(): SchoolWorkScheduleItem[] {
  if (typeof window === 'undefined') return INITIAL_WORK_SCHEDULES;
  try {
    const raw = localStorage.getItem(STORAGE_WORK_SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_WORK_SCHEDULES;
  } catch (_) {
    return INITIAL_WORK_SCHEDULES;
  }
}

export function saveStoredWorkSchedules(data: SchoolWorkScheduleItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WORK_SCHEDULES_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function getStoredLegalDocuments(): LegalDocumentItem[] {
  if (typeof window === 'undefined') return INITIAL_LEGAL_DOCUMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_DOCUMENTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_LEGAL_DOCUMENTS;
  } catch (_) {
    return INITIAL_LEGAL_DOCUMENTS;
  }
}

export function saveStoredLegalDocuments(data: LegalDocumentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function getStoredSchoolClasses(): SchoolClassroomItem[] {
  if (typeof window === 'undefined') return INITIAL_SCHOOL_CLASSES;
  try {
    const raw = localStorage.getItem(STORAGE_CLASSES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SCHOOL_CLASSES;
  } catch (_) {
    return INITIAL_SCHOOL_CLASSES;
  }
}

export function saveStoredSchoolClasses(data: SchoolClassroomItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CLASSES_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function getStoredFacilities(): FacilityRoomItem[] {
  if (typeof window === 'undefined') return INITIAL_FACILITIES;
  try {
    const raw = localStorage.getItem(STORAGE_FACILITIES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_FACILITIES;
  } catch (_) {
    return INITIAL_FACILITIES;
  }
}
