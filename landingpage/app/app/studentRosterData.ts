// Smart Teacher Schedule AI - Student Roster & Attendance Data Store
// Cleaned: No mock data, permanent deletion support, test data sanitizer

import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { isTestStudent, isTestClassroom, purgeTestRosterItems } from './testDataSanitizer';

export interface Student {
  id: string;
  classId: string;
  className: string;
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  parentPhone?: string;
  parentName?: string;
  kudosPoints?: number;
  notes?: string;
  avatarUrl?: string;
  updatedAt?: number;
}

export interface Classroom {
  id: string;
  name: string;
  grade?: string;
  academicYear?: string;
  homeroomTeacher?: string;
  totalStudents?: number;
  notes?: string;
  updatedAt?: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';

export interface AttendanceRecord {
  id: string;
  eventId?: string;
  className: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  date: string;
  status: AttendanceStatus;
  kudosDelta?: number;
  note?: string;
  updatedAt?: number;
}

export const STORAGE_STUDENTS_KEY = 'smart_teacher_students_v1';
export const STORAGE_CLASSROOMS_KEY = 'smart_teacher_classrooms_v1';
export const STORAGE_ATTENDANCE_KEY = 'smart_teacher_attendance_v1';
export const STORAGE_DELETED_STUDENTS_KEY = 'smart_teacher_deleted_student_ids_v1';
export const STORAGE_DELETED_CLASSROOMS_KEY = 'smart_teacher_deleted_classroom_ids_v1';

// Mặc định hoàn toàn trống - Không sử dụng dữ liệu mẫu test trong môi trường làm việc
export const DEFAULT_CLASSROOMS: Classroom[] = [];
export const DEFAULT_STUDENTS: Student[] = [];

// ================= DELETED ENTITY TRACKING (Chống hồi sinh từ Cloud) =================
export function getDeletedStudentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_STUDENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordDeletedStudentIds(ids: string[]): void {
  if (typeof window === 'undefined' || !Array.isArray(ids) || ids.length === 0) return;
  try {
    const current = new Set(getDeletedStudentIds());
    ids.forEach(id => {
      if (id && typeof id === 'string') current.add(id.trim());
    });
    localStorage.setItem(STORAGE_DELETED_STUDENTS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Error recording deleted student IDs:', e);
  }
}

export function recordDeletedStudentId(id: string): void {
  recordDeletedStudentIds([id]);
}

export function getDeletedClassroomIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_CLASSROOMS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordDeletedClassroomId(idOrName: string): void {
  if (typeof window === 'undefined' || !idOrName) return;
  try {
    const current = new Set(getDeletedClassroomIds());
    const val = String(idOrName).trim();
    if (val) {
      current.add(val);
      current.add(val.toLowerCase());
    }
    localStorage.setItem(STORAGE_DELETED_CLASSROOMS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Error recording deleted classroom ID:', e);
  }
}

// ================= PURGE TEST DATA =================
export function purgeTestRosterData(): { cleanedStudents: Student[]; cleanedClassrooms: Classroom[]; removedCount: number } {
  if (typeof window === 'undefined') return { cleanedStudents: [], cleanedClassrooms: [], removedCount: 0 };
  try {
    const rawStudents = localStorage.getItem(STORAGE_STUDENTS_KEY);
    const rawClassrooms = localStorage.getItem(STORAGE_CLASSROOMS_KEY);
    const students: Student[] = rawStudents ? JSON.parse(rawStudents) : [];
    const classrooms: Classroom[] = rawClassrooms ? JSON.parse(rawClassrooms) : [];

    const deletedIds: string[] = [];
    const testIds = [
      'std_01', 'std_02', 'std_03', 'std_04', 'std_05', 'std_06', 'std_07', 'std_08',
      'std_101', 'std_102', 'std_103', 'std_104'
    ];
    testIds.forEach(id => deletedIds.push(id));

    const cleanedStudents = (Array.isArray(students) ? students : []).filter(s => {
      if (!s) return false;
      if (isTestStudent(s)) {
        if (s.id) deletedIds.push(s.id);
        return false;
      }
      return true;
    });

    const deletedClassIds: string[] = ['cls_cg24tc34', 'cls_cdck02', 'cls_10a1', 'cg24tc34', 'cđck02', '10a1'];

    const cleanedClassrooms = (Array.isArray(classrooms) ? classrooms : []).filter(c => {
      if (!c) return false;
      if (isTestClassroom(c)) {
        if (c.id) deletedClassIds.push(c.id);
        if (c.name) deletedClassIds.push(c.name);
        return false;
      }
      return true;
    });

    recordDeletedStudentIds(deletedIds);
    deletedClassIds.forEach(cId => recordDeletedClassroomId(cId));

    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(cleanedStudents));
    localStorage.setItem(STORAGE_CLASSROOMS_KEY, JSON.stringify(cleanedClassrooms));

    const removedCount = (students.length - cleanedStudents.length) + (classrooms.length - cleanedClassrooms.length);
    return { cleanedStudents, cleanedClassrooms, removedCount };
  } catch (err) {
    console.error('Error in purgeTestRosterData:', err);
    return { cleanedStudents: [], cleanedClassrooms: [], removedCount: 0 };
  }
}

// ================= CLASSROOM ACCESSORS =================
export function getStoredClassrooms(): Classroom[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CLASSROOMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const deleted = new Set(getDeletedClassroomIds());
    return parsed.filter(c => c && !isTestClassroom(c) && !deleted.has(c.id) && !deleted.has((c.name || '').toLowerCase()));
  } catch {
    return [];
  }
}

export function saveClassroom(classroom: Classroom): Classroom[] {
  const current = getStoredClassrooms();
  const index = current.findIndex(c => c.id === classroom.id || (c.name && c.name.toLowerCase() === classroom.name.toLowerCase()));
  let updated: Classroom[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...classroom, updatedAt: Date.now() };
  } else {
    updated = [...current, { ...classroom, updatedAt: Date.now() }];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CLASSROOMS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteClassroom(id: string): Classroom[] {
  recordDeletedClassroomId(id);
  const current = getStoredClassrooms();
  const target = current.find(c => c.id === id || (c.name && c.name.toLowerCase() === id.toLowerCase()));
  if (target) {
    recordDeletedClassroomId(target.id);
    recordDeletedClassroomId(target.name);
    // Xóa luôn tất cả học sinh thuộc lớp này
    deleteStudentsByClass(target.name || target.id);
  }
  const updated = current.filter(c => c.id !== id && (c.name || '').toLowerCase() !== id.toLowerCase());
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CLASSROOMS_KEY, JSON.stringify(updated));
  }
  return updated;
}

// ================= STUDENT ACCESSORS =================
export function getStoredStudents(): Student[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STUDENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const deletedIds = new Set(getDeletedStudentIds());
    const deletedClasses = new Set(getDeletedClassroomIds());
    return parsed.filter(s => {
      if (!s || !s.id) return false;
      if (deletedIds.has(s.id)) return false;
      if (deletedClasses.has((s.className || '').toLowerCase()) || deletedClasses.has(s.classId)) return false;
      if (isTestStudent(s)) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function getStudentsByClass(classNameOrId: string): Student[] {
  if (!classNameOrId) return [];
  const all = getStoredStudents();
  const query = classNameOrId.toLowerCase().trim();
  return all.filter(s =>
    (s.className && s.className.toLowerCase().trim() === query) ||
    (s.classId && s.classId.toLowerCase().trim() === query)
  );
}

export function saveStudent(student: Student): Student[] {
  const current = getStoredStudents();
  const index = current.findIndex(s => s.id === student.id);
  let updated: Student[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...student, updatedAt: Date.now() };
  } else {
    updated = [...current, { ...student, updatedAt: Date.now() }];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteStudentsByClass(classNameOrId: string): Student[] {
  if (!classNameOrId) return getStoredStudents();
  const query = classNameOrId.toLowerCase().trim();
  const current = getStoredStudents();
  const toDelete = current.filter(s =>
    (s.className && s.className.toLowerCase().trim() === query) ||
    (s.classId && s.classId.toLowerCase().trim() === query)
  );
  recordDeletedStudentIds(toDelete.map(s => s.id));
  const updated = current.filter(s =>
    (s.className && s.className.toLowerCase().trim() !== query) &&
    (s.classId && s.classId.toLowerCase().trim() !== query)
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteStudent(id: string): Student[] {
  recordDeletedStudentId(id);
  const current = getStoredStudents();
  const updated = current.filter(s => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function addKudosToStudent(id: string, delta: number = 1, reason?: string): Student[] {
  const current = getStoredStudents();
  const updated = current.map(s => {
    if (s.id === id) {
      const pts = Math.max(0, (s.kudosPoints || 0) + delta);
      const notes = reason && !s.notes?.includes(reason) ? `${s.notes ? s.notes + '; ' : ''}${reason}` : s.notes;
      return { ...s, kudosPoints: pts, notes, updatedAt: Date.now() };
    }
    return s;
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function importStudentsFromText(classId: string, className: string, rawText: string): Student[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const current = getStoredStudents();
  const existingInClass = current.filter(s => s.className.toLowerCase() === className.toLowerCase());
  let autoNum = existingInClass.length + 1;

  const newStudents: Student[] = lines.map(line => {
    const parts = line.split(/[,\t;|]/).map(p => p.trim());
    let code = '';
    let name = '';
    let gender: 'Nam' | 'Nữ' = 'Nam';
    let phone = '';

    if (parts.length === 1) {
      name = parts[0];
      code = `${className}-${String(autoNum++).padStart(2, '0')}`;
    } else {
      if (/^[A-Za-z0-9_-]+$/.test(parts[0])) {
        code = parts[0];
        name = parts[1] || '';
        if (parts[2]?.toLowerCase().includes('nữ') || parts[2]?.toLowerCase() === 'f') gender = 'Nữ';
        if (parts[3]) phone = parts[3];
      } else {
        name = parts[0];
        code = `${className}-${String(autoNum++).padStart(2, '0')}`;
        if (parts[1]?.toLowerCase().includes('nữ') || parts[1]?.toLowerCase() === 'f') gender = 'Nữ';
        if (parts[2]) phone = parts[2];
      }
    }

    return {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      classId,
      className,
      studentCode: code,
      fullName: name,
      gender,
      parentPhone: phone,
      kudosPoints: 5,
      updatedAt: Date.now()
    };
  });

  const updated = [...current, ...newStudents];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

// ================= ATTENDANCE ACCESSORS =================
export function getStoredAttendance(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ATTENDANCE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAttendanceForSession(
  arg1: string,
  arg2: string,
  eventId?: string
): AttendanceRecord[] {
  const all = getStoredAttendance();
  const a1 = (arg1 || '').toLowerCase().trim();
  const a2 = (arg2 || '').toLowerCase().trim();

  return all.filter(a => {
    const matchEvent = !eventId || !a.eventId || a.eventId === eventId;
    const cName = (a.className || '').toLowerCase().trim();
    const aDate = (a.date || '').trim();

    const matchCase1 = (cName === a1 && aDate === a2);
    const matchCase2 = (aDate === a1 && cName === a2);

    return (matchCase1 || matchCase2) && matchEvent;
  });
}

export function saveAttendanceRecords(records: AttendanceRecord[]): AttendanceRecord[] {
  const current = getStoredAttendance();
  const keyMap = new Map<string, AttendanceRecord>();

  current.forEach(r => {
    const key = `${r.date}_${r.studentId}_${r.eventId || 'noev'}`;
    keyMap.set(key, r);
  });

  records.forEach(r => {
    const key = `${r.date}_${r.studentId}_${r.eventId || 'noev'}`;
    keyMap.set(key, { ...r, updatedAt: Date.now() });
  });

  const updated = Array.from(keyMap.values());
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ATTENDANCE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function exportAttendanceToCsv(
  subject: string,
  className: string,
  date: string,
  students: Student[],
  attendanceMap: Record<string, AttendanceRecord>
): void {
  const headers = ['STT', 'Mã HS', 'Họ và tên', 'Môn học', 'Lớp', 'Ngày', 'Trạng thái điểm danh', 'Ghi chú / Khen thưởng'];
  const rows = (students || []).map((st, idx) => {
    const rec = attendanceMap ? attendanceMap[st.id] : undefined;
    let statusVi = 'Có mặt';
    if (rec?.status === 'ABSENT_EXCUSED') statusVi = 'Nghỉ có phép';
    else if (rec?.status === 'ABSENT_UNEXCUSED') statusVi = 'Nghỉ KHÔNG phép';
    else if (rec?.status === 'LATE') statusVi = 'Đi trễ';

    const note = rec?.note || (rec?.kudosDelta ? `+${rec.kudosDelta}đ` : '');

    return [
      idx + 1,
      `"${st.studentCode || ''}"`,
      `"${st.fullName || ''}"`,
      `"${subject || ''}"`,
      `"${className || ''}"`,
      `"${date || ''}"`,
      `"${statusVi}"`,
      `"${note}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  if (typeof window !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DiemDanh_${className}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ================= SMART IMPORT FROM FILE (XLSX, XLS, CSV, DOCX) =================
export async function parseStudentFile(
  arg1: any,
  arg2: any,
  arg3?: any
): Promise<{ success: boolean; count: number; students: Student[]; message: string }> {
  try {
    let file: File;
    let className: string;
    let classId: string;

    if (arg1 instanceof File) {
      file = arg1;
      className = String(arg2 || '');
      classId = String(arg3 || arg2 || '');
    } else {
      className = String(arg1 || '');
      classId = String(arg2 || arg1 || '');
      file = arg3 as File;
    }
    const fileName = file.name.toLowerCase();
    const ext = fileName.split('.').pop() || '';

    const parsedItems: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ';
      parentPhone?: string;
      notes?: string;
    }> = [];

    if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      let headerRowIdx = -1;
      let nameCol = -1;
      let lastNameCol = -1;
      let firstNameCol = -1;
      let codeCol = -1;
      let genderCol = -1;
      let phoneCol = -1;
      let noteCol = -1;

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r];
        if (!row || !Array.isArray(row)) continue;
        const normalized = row.map(cell => String(cell || '').toLowerCase().trim());

        const hasName = normalized.some(c => c.includes('họ và tên') || c.includes('họ tên') || c === 'tên' || c === 'name');
        if (hasName) {
          headerRowIdx = r;
          normalized.forEach((c, idx) => {
            if (c.includes('họ và tên') || c.includes('họ tên') || c === 'họ và tên học sinh') {
              nameCol = idx;
            } else if (c === 'họ' || c.includes('họ đệm') || c.includes('họ lót')) {
              lastNameCol = idx;
            } else if (c === 'tên' || c === 'tên hs') {
              firstNameCol = idx;
            } else if (c.includes('mã') || c.includes('mssv') || c.includes('code')) {
              codeCol = idx;
            } else if (c.includes('giới') || c.includes('phái') || c.includes('nam/nữ') || c === 'gender') {
              genderCol = idx;
            } else if (c.includes('thoại') || c.includes('sđt') || c.includes('sdt') || c.includes('phụ huynh') || c.includes('phone')) {
              phoneCol = idx;
            } else if (c.includes('ghi chú') || c.includes('note')) {
              noteCol = idx;
            }
          });
          break;
        }
      }

      const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        let fullName = '';
        if (nameCol >= 0 && row[nameCol]) {
          fullName = String(row[nameCol]).trim();
        } else if (lastNameCol >= 0 && firstNameCol >= 0) {
          const lName = String(row[lastNameCol] || '').trim();
          const fName = String(row[firstNameCol] || '').trim();
          fullName = `${lName} ${fName}`.trim();
        } else {
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').trim();
            if (val.length >= 3 && !/^[0-9]+$/.test(val) && !val.includes('/') && !val.includes('@') && val.split(' ').length >= 2) {
              fullName = val;
              break;
            }
          }
        }

        fullName = fullName.replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
        if (!fullName || fullName.length < 2) continue;
        if (fullName.toLowerCase().includes('tổng cộng') || fullName.toLowerCase().includes('chữ ký') || fullName.toLowerCase().includes('ngày')) continue;

        let code = codeCol >= 0 && row[codeCol] ? String(row[codeCol]).trim() : '';
        let gender: 'Nam' | 'Nữ' = 'Nam';
        if (genderCol >= 0 && row[genderCol]) {
          const gStr = String(row[genderCol]).toLowerCase().trim();
          if (gStr.includes('nữ') || gStr === 'f' || gStr === 'female') gender = 'Nữ';
        }

        let phone = phoneCol >= 0 && row[phoneCol] ? String(row[phoneCol]).replace(/[^0-9]/g, '') : '';
        let note = noteCol >= 0 && row[noteCol] ? String(row[noteCol]).trim() : '';

        parsedItems.push({
          studentCode: code,
          fullName,
          gender,
          parentPhone: phone,
          notes: note
        });
      }
    } else if (ext === 'docx') {
      const zip = await JSZip.loadAsync(file);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (!docXml) {
        return { success: false, count: 0, students: [], message: 'Không thể đọc nội dung file Word (.docx).' };
      }

      const rowMatches = docXml.match(/<w:tr[\s>][\s\S]*?<\/w:tr>/g) || [];
      if (rowMatches.length > 0) {
        for (const rXml of rowMatches) {
          const cellTexts: string[] = [];
          const cellMatches = rXml.match(/<w:tc[\s>][\s\S]*?<\/w:tc>/g) || [];
          for (const cXml of cellMatches) {
            const clean = cXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            cellTexts.push(clean);
          }
          if (cellTexts.length >= 2) {
            const candidateName = cellTexts.find(t => t.length >= 3 && t.split(' ').length >= 2 && !/^[0-9]+$/.test(t));
            if (candidateName && !candidateName.toLowerCase().includes('họ và tên') && !candidateName.toLowerCase().includes('họ tên')) {
              const code = cellTexts.find(t => /^[A-Za-z0-9_-]+$/.test(t) && t !== candidateName) || '';
              const phone = cellTexts.find(t => /^[0-9]{8,11}$/.test(t.replace(/[^0-9]/g, ''))) || '';
              const isFemale = cellTexts.some(t => t.toLowerCase().includes('nữ') || t.toLowerCase() === 'f');
              parsedItems.push({
                studentCode: code,
                fullName: candidateName.replace(/^[0-9]+[\.\-\)\s]+/, '').trim(),
                gender: isFemale ? 'Nữ' : 'Nam',
                parentPhone: phone
              });
            }
          }
        }
      } else {
        const pMatches = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
        for (const pXml of pMatches) {
          const clean = pXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (clean.length >= 4 && clean.split(' ').length >= 2) {
            const fullName = clean.replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
            if (!fullName.toLowerCase().includes('danh sách') && !fullName.toLowerCase().includes('họ tên')) {
              parsedItems.push({
                studentCode: '',
                fullName,
                gender: 'Nam'
              });
            }
          }
        }
      }
    } else {
      const rawText = await file.text();
      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const parts = line.split(/[\t,;]/).map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) continue;
        let fullName = parts[0].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
        let code = '';
        let gender: 'Nam' | 'Nữ' = 'Nam';
        let phone = '';

        if (parts.length > 1) {
          if (/^[A-Za-z0-9_-]+$/.test(parts[0])) {
            code = parts[0];
            fullName = parts[1].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
            if (parts[2]?.toLowerCase().includes('nữ') || parts[2]?.toLowerCase() === 'f') gender = 'Nữ';
            if (parts[3]) phone = parts[3].replace(/[^0-9]/g, '');
          } else {
            fullName = parts[0].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
            if (parts[1]?.toLowerCase().includes('nữ') || parts[1]?.toLowerCase() === 'f') gender = 'Nữ';
            if (parts[2]) phone = parts[2].replace(/[^0-9]/g, '');
          }
        }

        if (fullName && fullName.length >= 2 && !fullName.toLowerCase().includes('họ và tên')) {
          parsedItems.push({
            studentCode: code,
            fullName,
            gender,
            parentPhone: phone
          });
        }
      }
    }

    if (parsedItems.length === 0) {
      return {
        success: false,
        count: 0,
        students: [],
        message: 'Không tìm thấy thông tin học sinh hợp lệ trong tệp. Thầy/Cô vui lòng kiểm tra lại định dạng tệp.'
      };
    }

    const existing = getStoredStudents();
    const existingInClass = existing.filter(s => s.className.toLowerCase() === className.toLowerCase());
    let autoNum = existingInClass.length + 1;

    const newStudents: Student[] = parsedItems.map(item => {
      const code = item.studentCode || `${className}-${String(autoNum++).padStart(2, '0')}`;
      return {
        id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        classId,
        className,
        studentCode: code,
        fullName: item.fullName,
        gender: item.gender,
        parentPhone: item.parentPhone || '',
        kudosPoints: 5,
        notes: item.notes || '',
        updatedAt: Date.now()
      };
    });

    const combined = [...existing, ...newStudents];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(combined));
    }

    return {
      success: true,
      count: newStudents.length,
      students: newStudents,
      message: `Đã trích xuất và thêm thành công ${newStudents.length} học sinh vào lớp ${className}!`
    };
  } catch (err: any) {
    console.error('Lỗi khi nạp tệp danh sách học sinh:', err);
    return {
      success: false,
      count: 0,
      students: [],
      message: 'Lỗi khi đọc tệp: ' + (err?.message || String(err))
    };
  }
}
