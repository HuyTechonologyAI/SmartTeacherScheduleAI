/**
 * Test Data Sanitizer & Safety Filter Engine
 * Bảo vệ dữ liệu thực của giáo viên: Nhận diện, lọc bỏ và xoá sạch dữ liệu test/mock
 * Smart Teacher Schedule - Production Safety Standards
 */

export function isTestString(str?: string | null): boolean {
  if (!str) return false;
  const s = String(str).trim().toLowerCase();
  const testPatterns = [
    /\[test\]/i,
    /\(test\)/i,
    /\[thử\s*nghiệm\]/i,
    /\[mock\]/i,
    /\[demo\]/i,
    /\[sample\]/i,
    /\bdữ liệu test\b/i,
    /\bca dạy thử\b/i,
    /\bbài test\b/i,
    /\btest chức năng\b/i,
    /\bmock data\b/i,
    /\bsample data\b/i,
    /\bkiểm thử\b/i,
    /\bchạy thử\b/i,
    /\bca test\b/i,
    /\btiết test\b/i
  ];
  return testPatterns.some((pattern) => pattern.test(s));
}

export function isTestData(item: any): boolean {
  if (!item) return false;
  if (typeof item === 'string') {
    return isTestString(item);
  }
  if (typeof item !== 'object') return false;

  // 1. Kiểm tra ID có tiền tố test/mock
  const id = String(item.id || item.code || '');
  if (/^(test_|mock_|dummy_|sample_|demo_|temp_)/i.test(id)) return true;
  if (/_test_|_mock_|_dummy_/i.test(id)) return true;

  // 2. Kiểm tra các trường nội dung
  const fieldsToCheck = [
    item.title,
    item.subject,
    item.className,
    item.room,
    item.notes,
    item.fileName,
    item.name,
    item.fullName,
    item.studentCode,
    item.content,
    item.lessonTitle,
    item.topic,
    item.academicYear
  ];

  return fieldsToCheck.some((val) => val && isTestString(String(val)));
}

export interface CleanReport {
  eventsRemoved: number;
  schedulesRemoved: number;
  tasksRemoved: number;
  studentsRemoved: number;
  classroomsRemoved: number;
  attendanceRemoved: number;
  docsRemoved: number;
  localStorageKeysRemoved: number;
  totalRemoved: number;
}

export function countTestData(): {
  events: number;
  schedules: number;
  tasks: number;
  students: number;
  total: number;
} {
  let events = 0;
  let schedules = 0;
  let tasks = 0;
  let students = 0;

  if (typeof window === 'undefined') {
    return { events: 0, schedules: 0, tasks: 0, students: 0, total: 0 };
  }

  try {
    const rawEv = localStorage.getItem('smart_teacher_events');
    if (rawEv) {
      const list = JSON.parse(rawEv);
      if (Array.isArray(list)) events = list.filter((e) => isTestData(e)).length;
    }
  } catch (_) {}

  try {
    const rawSch = localStorage.getItem('smart_teacher_schedules');
    if (rawSch) {
      const list = JSON.parse(rawSch);
      if (Array.isArray(list)) schedules = list.filter((s) => isTestData(s)).length;
    }
  } catch (_) {}

  try {
    const rawTasks = localStorage.getItem('smart_teacher_tasks');
    if (rawTasks) {
      const list = JSON.parse(rawTasks);
      if (Array.isArray(list)) tasks = list.filter((t) => isTestData(t)).length;
    }
  } catch (_) {}

  try {
    const rawStudents = localStorage.getItem('smart_teacher_students_v1');
    if (rawStudents) {
      const list = JSON.parse(rawStudents);
      if (Array.isArray(list)) students = list.filter((s) => isTestData(s)).length;
    }
  } catch (_) {}

  return {
    events,
    schedules,
    tasks,
    students,
    total: events + schedules + tasks + students
  };
}

export function cleanAllTestData(): CleanReport {
  const report: CleanReport = {
    eventsRemoved: 0,
    schedulesRemoved: 0,
    tasksRemoved: 0,
    studentsRemoved: 0,
    classroomsRemoved: 0,
    attendanceRemoved: 0,
    docsRemoved: 0,
    localStorageKeysRemoved: 0,
    totalRemoved: 0
  };

  if (typeof window === 'undefined') return report;

  // 1. Dọn dẹp ca dạy (Events)
  try {
    const rawEv = localStorage.getItem('smart_teacher_events');
    if (rawEv) {
      const list = JSON.parse(rawEv);
      if (Array.isArray(list)) {
        const cleanList = list.filter((e) => !isTestData(e));
        report.eventsRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_events', JSON.stringify(cleanList));
      }
    }
  } catch (_) {}

  // 2. Dọn dẹp thời khóa biểu định kỳ (Schedules)
  try {
    const rawSch = localStorage.getItem('smart_teacher_schedules');
    if (rawSch) {
      const list = JSON.parse(rawSch);
      if (Array.isArray(list)) {
        const cleanList = list.filter((s) => !isTestData(s));
        report.schedulesRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_schedules', JSON.stringify(cleanList));
      }
    }
  } catch (_) {}

  // 3. Dọn dẹp nhắc việc (Tasks)
  try {
    const rawTasks = localStorage.getItem('smart_teacher_tasks');
    if (rawTasks) {
      const list = JSON.parse(rawTasks);
      if (Array.isArray(list)) {
        const cleanList = list.filter((t) => !isTestData(t));
        report.tasksRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_tasks', JSON.stringify(cleanList));
      }
    }
  } catch (_) {}

  // 4. Dọn dẹp học sinh, lớp học & điểm danh
  try {
    const rawStudents = localStorage.getItem('smart_teacher_students_v1');
    if (rawStudents) {
      const list = JSON.parse(rawStudents);
      if (Array.isArray(list)) {
        const cleanList = list.filter((s) => !isTestData(s));
        report.studentsRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_students_v1', JSON.stringify(cleanList));
      }
    }
    const rawClasses = localStorage.getItem('smart_teacher_classrooms_v1');
    if (rawClasses) {
      const list = JSON.parse(rawClasses);
      if (Array.isArray(list)) {
        const cleanList = list.filter((c) => !isTestData(c));
        report.classroomsRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_classrooms_v1', JSON.stringify(cleanList));
      }
    }
    const rawAtt = localStorage.getItem('smart_teacher_attendance_v1');
    if (rawAtt) {
      const list = JSON.parse(rawAtt);
      if (Array.isArray(list)) {
        const cleanList = list.filter((a) => !isTestData(a));
        report.attendanceRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_attendance_v1', JSON.stringify(cleanList));
      }
    }
  } catch (_) {}

  // 5. Dọn dẹp kho tư liệu tuỳ biến (Custom Knowledge Docs)
  try {
    const rawDocs = localStorage.getItem('smart_teacher_custom_knowledge_docs_v1');
    if (rawDocs) {
      const list = JSON.parse(rawDocs);
      if (Array.isArray(list)) {
        const cleanList = list.filter((d) => !isTestData(d));
        report.docsRemoved = list.length - cleanList.length;
        localStorage.setItem('smart_teacher_custom_knowledge_docs_v1', JSON.stringify(cleanList));
      }
    }
  } catch (_) {}

  // 6. Xoá các khoá bộ nhớ đệm AI test trong localStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith('smart_teacher_ai_pack_test') ||
          k.startsWith('smart_teacher_ai_plan_test') ||
          k.includes('_test_') ||
          k.includes('[test]'))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    report.localStorageKeysRemoved = keysToRemove.length;
  } catch (_) {}

  report.totalRemoved =
    report.eventsRemoved +
    report.schedulesRemoved +
    report.tasksRemoved +
    report.studentsRemoved +
    report.classroomsRemoved +
    report.attendanceRemoved +
    report.docsRemoved +
    report.localStorageKeysRemoved;

  return report;
}


// ================= ROSTER SPECIFIC TEST DATA FILTERS =================
export const KNOWN_TEST_STUDENT_IDS = new Set([
  'std_01', 'std_02', 'std_03', 'std_04', 'std_05', 'std_06', 'std_07', 'std_08',
  'std_101', 'std_102', 'std_103', 'std_104'
]);

export const KNOWN_TEST_CLASS_IDS = new Set([
  'cls_cg24tc34', 'cls_cdck02', 'cls_10a1'
]);

export const KNOWN_TEST_CLASS_NAMES = new Set([
  'cg24tc34', 'cđck02', 'cdck02', '10a1'
]);

export const KNOWN_TEST_STUDENT_NAMES = new Set([
  'trần thị bích',
  'lê hoàng dũng',
  'phạm minh đức',
  'vũ quốc huy',
  'hoàng kim loan',
  'đặng tuấn kiệt',
  'bùi thị mai',
  'nguyễn văn an',
  'đỗ hải phong',
  'ngô thùy trang',
  'phan tuấn tú',
  'lý diệu linh'
]);

export function isTestStudent(st: any): boolean {
  if (!st) return false;
  const id = String(st.id || '').toLowerCase().trim();
  if (KNOWN_TEST_STUDENT_IDS.has(id)) return true;
  if (/^(std_0|std_10[1-4]$)/i.test(id)) return true;

  const code = String(st.studentCode || '').toLowerCase().trim();
  if (/^cg24-0[1-8]$/i.test(code) || /^10a1-0[1-4]$/i.test(code)) return true;

  const name = String(st.fullName || '').toLowerCase().trim();
  if (KNOWN_TEST_STUDENT_NAMES.has(name)) return true;

  const cName = String(st.className || '').toLowerCase().trim();
  const cId = String(st.classId || '').toLowerCase().trim();
  if (KNOWN_TEST_CLASS_NAMES.has(cName) || KNOWN_TEST_CLASS_IDS.has(cId)) return true;

  return isTestData(st);
}

export function isTestClassroom(cl: any): boolean {
  if (!cl) return false;
  const id = String(cl.id || '').toLowerCase().trim();
  if (KNOWN_TEST_CLASS_IDS.has(id)) return true;

  const name = String(cl.name || '').toLowerCase().trim();
  if (KNOWN_TEST_CLASS_NAMES.has(name)) return true;

  return isTestData(cl);
}

export function isTestSyncData(item: any): boolean {
  if (!item) return false;
  return isTestData(item) || isTestStudent(item) || isTestClassroom(item);
}

export function purgeTestRosterItems(students: any[], classrooms: any[]): {
  cleanStudents: any[];
  cleanClassrooms: any[];
  removedStudentsCount: number;
  removedClassroomsCount: number;
} {
  const cleanStudents = (Array.isArray(students) ? students : []).filter(s => !isTestStudent(s));
  const cleanClassrooms = (Array.isArray(classrooms) ? classrooms : []).filter(c => !isTestClassroom(c));
  return {
    cleanStudents,
    cleanClassrooms,
    removedStudentsCount: (students?.length || 0) - cleanStudents.length,
    removedClassroomsCount: (classrooms?.length || 0) - cleanClassrooms.length
  };
}

export function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  if (!payload || typeof payload !== 'object') return payload;
  const result: any = { ...payload };
  if (Array.isArray(result.events)) result.events = result.events.filter((e: any) => !isTestSyncData(e));
  if (Array.isArray(result.schedules)) result.schedules = result.schedules.filter((s: any) => !isTestSyncData(s));
  if (Array.isArray(result.knowledgeDocs)) result.knowledgeDocs = result.knowledgeDocs.filter((d: any) => !isTestSyncData(d));
  if (Array.isArray(result.classrooms)) result.classrooms = result.classrooms.filter((c: any) => !isTestClassroom(c));
  if (Array.isArray(result.students)) result.students = result.students.filter((s: any) => !isTestStudent(s));
  if (Array.isArray(result.attendanceRecords)) result.attendanceRecords = result.attendanceRecords.filter((a: any) => !isTestSyncData(a));
  return result;
}
