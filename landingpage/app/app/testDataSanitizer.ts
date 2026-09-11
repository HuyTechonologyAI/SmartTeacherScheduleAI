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
