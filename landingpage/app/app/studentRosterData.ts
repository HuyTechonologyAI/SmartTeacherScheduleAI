import * as XLSX from 'xlsx';
import JSZip from 'jszip';
/**
 * Quản lý Danh sách Lớp, Học sinh, Điểm danh 1-chạm & Điểm nề nếp (Kudos)
 * Smart Teacher Schedule - Phase 1: Teacher Cockpit Ecosystem
 */

export type AttendanceStatus = 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  academicYear: string;
  notes?: string;
  updatedAt: number;
}

export interface Student {
  id: string;
  classId: string;
  className: string;
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  parentPhone?: string;
  parentName?: string;
  kudosPoints: number;
  notes?: string;
  updatedAt: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  eventId?: string;
  scheduleId?: string;
  studentId: string;
  className: string;
  status: AttendanceStatus;
  kudosDelta: number;
  note?: string;
  updatedAt: number;
}

const STORAGE_KEY_CLASSES = 'smart_teacher_classrooms_v1';
const STORAGE_KEY_STUDENTS = 'smart_teacher_students_v1';
const STORAGE_KEY_ATTENDANCE = 'smart_teacher_attendance_v1';

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'cls_cg24tc34',
    name: 'CG24TC34',
    grade: 'Trung cấp K24',
    totalStudents: 32,
    academicYear: '2024-2025',
    notes: 'Lớp Chế tạo máy & Cơ điện tử - Tiết thực hành xưởng X1',
    updatedAt: 1725667200000
  },
  {
    id: 'cls_cdck02',
    name: 'CĐCK02',
    grade: 'Cao đẳng K02',
    totalStudents: 28,
    academicYear: '2024-2025',
    notes: 'Lớp Cơ khí Chế tạo - Phòng lý thuyết P204',
    updatedAt: 1725667200000
  },
  {
    id: 'cls_10a1',
    name: '10A1',
    grade: 'Khối 10',
    totalStudents: 40,
    academicYear: '2024-2025',
    notes: 'Môn Công nghệ 10 (Công nghiệp & Năng lực số)',
    updatedAt: 1725667200000
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std_01', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-01', fullName: 'Nguyễn Văn An', gender: 'Nam', parentPhone: '0981234567', parentName: 'Nguyễn Văn Bình', kudosPoints: 12, notes: 'Lớp trưởng, gương mẫu 5S', updatedAt: 1725667200000 },
  { id: 'std_02', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-02', fullName: 'Trần Thị Bích', gender: 'Nữ', parentPhone: '0912345678', parentName: 'Trần Văn Cường', kudosPoints: 8, notes: 'Tổ trưởng tổ 1', updatedAt: 1725667200000 },
  { id: 'std_03', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-03', fullName: 'Lê Hoàng Dũng', gender: 'Nam', parentPhone: '0978901234', parentName: 'Lê Văn Đạt', kudosPoints: 15, notes: 'Thao tác máy tiện rất chuẩn xác', updatedAt: 1725667200000 },
  { id: 'std_04', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-04', fullName: 'Phạm Minh Đức', gender: 'Nam', parentPhone: '0903456789', parentName: 'Phạm Văn Giang', kudosPoints: 6, notes: 'Cần nhắc nhở mang kính BHLĐ', updatedAt: 1725667200000 },
  { id: 'std_05', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-05', fullName: 'Vũ Quốc Huy', gender: 'Nam', parentPhone: '0934567890', parentName: 'Vũ Đình Hải', kudosPoints: 10, notes: 'Hăng hái phát biểu', updatedAt: 1725667200000 },
  { id: 'std_06', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-06', fullName: 'Hoàng Kim Loan', gender: 'Nữ', parentPhone: '0965432109', parentName: 'Hoàng Văn Khanh', kudosPoints: 9, notes: 'Ghi chép sổ tay công nghệ cẩn thận', updatedAt: 1725667200000 },
  { id: 'std_07', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-07', fullName: 'Đặng Tuấn Kiệt', gender: 'Nam', parentPhone: '0943219876', parentName: 'Đặng Quốc Lâm', kudosPoints: 7, notes: 'Tích cực vệ sinh máy sau giờ học', updatedAt: 1725667200000 },
  { id: 'std_08', classId: 'cls_cg24tc34', className: 'CG24TC34', studentCode: 'CG24-08', fullName: 'Bùi Thị Mai', gender: 'Nữ', parentPhone: '0922334455', parentName: 'Bùi Văn Nam', kudosPoints: 11, notes: 'Khéo tay trong việc lắp ráp', updatedAt: 1725667200000 },
  { id: 'std_101', classId: 'cls_10a1', className: '10A1', studentCode: '10A1-01', fullName: 'Đỗ Hải Phong', gender: 'Nam', parentPhone: '0988776655', parentName: 'Đỗ Văn Phát', kudosPoints: 14, notes: 'Học tốt Năng lực số & AI', updatedAt: 1725667200000 },
  { id: 'std_102', classId: 'cls_10a1', className: '10A1', studentCode: '10A1-02', fullName: 'Ngô Thùy Trang', gender: 'Nữ', parentPhone: '0977665544', parentName: 'Ngô Quang Tuyến', kudosPoints: 16, notes: 'Thuyết trình slide công nghệ xuất sắc', updatedAt: 1725667200000 },
  { id: 'std_103', classId: 'cls_10a1', className: '10A1', studentCode: '10A1-03', fullName: 'Phan Tuấn Tú', gender: 'Nam', parentPhone: '0911223344', parentName: 'Phan Văn Tùng', kudosPoints: 8, notes: 'Sáng tạo trong sơ đồ tư duy', updatedAt: 1725667200000 },
  { id: 'std_104', classId: 'cls_10a1', className: '10A1', studentCode: '10A1-04', fullName: 'Lý Diệu Linh', gender: 'Nữ', parentPhone: '0900112233', parentName: 'Lý Thành Long', kudosPoints: 10, notes: 'Làm mini game đạt điểm tuyệt đối', updatedAt: 1725667200000 }
];

export function getStoredClassrooms(): Classroom[] {
  if (typeof window === 'undefined') return DEFAULT_CLASSROOMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(DEFAULT_CLASSROOMS));
      return DEFAULT_CLASSROOMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CLASSROOMS;
  } catch (e) {
    return DEFAULT_CLASSROOMS;
  }
}

export function saveClassroom(classroom: Classroom): Classroom[] {
  const list = getStoredClassrooms();
  const idx = list.findIndex(c => c.id === classroom.id || c.name.toLowerCase() === classroom.name.toLowerCase());
  let updatedList: Classroom[];
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = { ...classroom, updatedAt: Date.now() };
  } else {
    updatedList = [...list, { ...classroom, updatedAt: Date.now() }];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updatedList));
  }
  return updatedList;
}

export function deleteClassroom(id: string): Classroom[] {
  const list = getStoredClassrooms().filter(c => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(list));
  }
  return list;
}

export function getStoredStudents(): Student[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENTS;
  } catch (e) {
    return DEFAULT_STUDENTS;
  }
}

export function getStudentsByClass(classNameOrId: string): Student[] {
  const students = getStoredStudents();
  const target = (classNameOrId || '').toLowerCase().trim();
  return students.filter(s => s.classId.toLowerCase() === target || s.className.toLowerCase() === target);
}

export function saveStudent(student: Student): Student[] {
  const list = getStoredStudents();
  const idx = list.findIndex(s => s.id === student.id);
  let updatedList: Student[];
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = { ...student, updatedAt: Date.now() };
  } else {
    updatedList = [...list, { ...student, updatedAt: Date.now() }];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedList));
  }
  return updatedList;
}

export function deleteStudent(id: string): Student[] {
  const list = getStoredStudents().filter(s => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
  }
  return list;
}

export function addKudosToStudent(studentId: string, points: number, reason?: string): Student[] {
  const list = getStoredStudents();
  const updatedList = list.map(s => {
    if (s.id === studentId) {
      const newPoints = Math.max(0, (s.kudosPoints || 0) + points);
      const prefix = s.notes ? s.notes + ' • ' : '';
      const sign = points > 0 ? '+' : '';
      const noteText = reason ? prefix + reason + ' (' + sign + points + 'đ)' : s.notes;
      return {
        ...s,
        kudosPoints: newPoints,
        notes: noteText,
        updatedAt: Date.now()
      };
    }
    return s;
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedList));
  }
  return updatedList;
}

export function importStudentsFromText(classId: string, className: string, rawText: string): Student[] {
  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const newStudents: Student[] = [];
  const existing = getStoredStudents();
  let autoNum = existing.filter(s => s.className.toLowerCase() === className.toLowerCase()).length + 1;

  for (const line of rawLines) {
    const parts = line.split(/[\t,;]/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) continue;

    let fullName = '';
    let studentCode = '';
    let gender: 'Nam' | 'Nữ' = 'Nam';
    let parentPhone = '';

    if (parts.length === 1) {
      fullName = parts[0].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
      studentCode = className + '-' + String(autoNum).padStart(2, '0');
    } else {
      if (/^[A-Za-z0-9_-]+$/.test(parts[0]) && parts.length > 1) {
        studentCode = parts[0];
        fullName = parts[1];
        if (parts[2]?.toLowerCase().includes('nữ') || parts[2]?.toLowerCase() === 'f') gender = 'Nữ';
        if (parts[3]) parentPhone = parts[3].replace(/[^0-9]/g, '');
      } else {
        fullName = parts[0].replace(/^[0-9]+[\.\-\)\s]+/, '').trim();
        studentCode = className + '-' + String(autoNum).padStart(2, '0');
        if (parts[1]?.toLowerCase().includes('nữ') || parts[1]?.toLowerCase() === 'f') gender = 'Nữ';
        if (parts[2]) parentPhone = parts[2].replace(/[^0-9]/g, '');
      }
    }

    if (fullName) {
      newStudents.push({
        id: 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        classId,
        className,
        studentCode,
        fullName,
        gender,
        parentPhone,
        kudosPoints: 5,
        updatedAt: Date.now()
      });
      autoNum++;
    }
  }

  const combined = [...existing, ...newStudents];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(combined));
  }
  return combined;
}

export function getStoredAttendance(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAttendanceForSession(date: string, className: string, eventId?: string): AttendanceRecord[] {
  const records = getStoredAttendance();
  const cTarget = (className || '').toLowerCase().trim();
  return records.filter(r => {
    const matchClass = r.className.toLowerCase().trim() === cTarget;
    const matchDate = r.date === date;
    if (eventId && r.eventId) {
      return r.eventId === eventId && matchDate;
    }
    return matchDate && matchClass;
  });
}

export function saveAttendanceRecords(records: AttendanceRecord[]): AttendanceRecord[] {
  const existing = getStoredAttendance();
  const map = new Map<string, AttendanceRecord>();

  for (const r of existing) {
    map.set(r.date + '_' + r.studentId + '_' + (r.eventId || 'noev'), r);
  }

  for (const r of records) {
    map.set(r.date + '_' + r.studentId + '_' + (r.eventId || 'noev'), {
      ...r,
      updatedAt: Date.now()
    });
  }

  const result = Array.from(map.values());
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(result));
  }
  return result;
}

export function exportAttendanceToCsv(
  sessionTitle: string,
  className: string,
  date: string,
  students: Student[],
  attendanceMap: Record<string, AttendanceRecord>
): void {
  let csv = 'BÁO CÁO ĐIỂM DANH & NỀ NẾP TIẾT DẠY\n';
  csv += 'Tiết học: "' + sessionTitle + '"\n';
  csv += 'Lớp: "' + className + '"\n';
  csv += 'Ngày: "' + date + '"\n';
  csv += 'Tổng sĩ số: ' + students.length + '\n\n';
  csv += 'STT,Mã HS,Họ và Tên,Giới Tính,Trạng Thái,Điểm Thưởng Nề Nếp,SĐT Phụ Huynh,Ghi Chú\n';

  students.forEach((st, idx) => {
    const rec = attendanceMap[st.id];
    let statusText = 'Có mặt';
    if (rec) {
      if (rec.status === 'ABSENT_EXCUSED') statusText = 'Vắng (Có phép)';
      else if (rec.status === 'ABSENT_UNEXCUSED') statusText = 'Vắng (Không phép)';
      else if (rec.status === 'LATE') statusText = 'Đi trễ';
    }
    const kudosBonus = rec?.kudosDelta ? '+' + rec.kudosDelta : '0';
    const pPhone = st.parentPhone || '';
    const pNote = rec?.note || st.notes || '';
    csv += (idx + 1) + ',"' + st.studentCode + '","' + st.fullName + '","' + st.gender + '","' + statusText + '","' + kudosBonus + '","' + pPhone + '","' + pNote + '"\n';
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DiemDanh_' + className + '_' + date + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


export interface ParsedStudentItem {
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  parentPhone?: string;
  notes?: string;
}

export async function parseStudentFile(
  classId: string,
  className: string,
  file: File
): Promise<{ success: boolean; count: number; students: Student[]; message: string }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const parsedItems: ParsedStudentItem[] = [];

    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) {
        return { success: false, count: 0, students: [], message: 'Tệp Excel không có trang tính dữ liệu.' };
      }
      const sheet = wb.Sheets[firstSheet];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (!rows || rows.length === 0) {
        return { success: false, count: 0, students: [], message: 'Tệp Excel trống không có dữ liệu.' };
      }

      // 1. Scan for header row
      let headerRowIdx = -1;
      let nameCol = -1;
      let lastNameCol = -1;
      let firstNameCol = -1;
      let codeCol = -1;
      let genderCol = -1;
      let phoneCol = -1;
      let noteCol = -1;

      for (let r = 0; r < Math.min(rows.length, 15); r++) {
        const row = rows[r].map(c => String(c).toLowerCase().trim());
        const hasName = row.some(c => c.includes('họ và tên') || c.includes('họ tên') || c === 'tên' || c === 'họ' || c.includes('học sinh'));
        if (hasName) {
          headerRowIdx = r;
          row.forEach((c, idx) => {
            if (c.includes('họ và tên') || c.includes('họ tên') || c.includes('họ và chữ lót') || c === 'fullname') {
              nameCol = idx;
            } else if (c === 'họ' || c.includes('họ lót') || c.includes('họ đệm')) {
              lastNameCol = idx;
            } else if (c === 'tên' || c.includes('tên hs')) {
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
          // Fallback: pick longest text column that looks like a person's name
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').trim();
            if (val.length >= 3 && !/^[0-9]+$/.test(val) && !val.includes('/') && !val.includes('@') && val.split(' ').length >= 2) {
              fullName = val;
              break;
            }
          }
        }

        // Clean name (remove leading numbers like "1. Nguyen Van A")
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

      // Extract tables or text lines
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
        // Parse raw paragraphs
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
      // Raw text or CSV
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

    // Convert to Student entities and store
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
      localStorage.setItem('smart_teacher_students_v1', JSON.stringify(combined));
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
