// ============================================================================
// CONFLICT RESOLUTION & SMART MERGE ENGINE - SMART TEACHER SCHEDULE
// Giải quyết triệt để xung đột dữ liệu ngoại tuyến (Offline Concurrency Conflict)
// ============================================================================

export type ResolutionChoice = 'KEEP_LOCAL' | 'KEEP_REMOTE' | 'SMART_MERGE';

export interface ConflictFieldDiff {
  fieldName: string;
  fieldLabel: string;
  localValue: any;
  remoteValue: any;
}

export interface ConflictItem<T = any> {
  id: string;
  entityType: 'EVENT' | 'LESSON_PLAN' | 'SCHEDULE' | 'ATTENDANCE';
  title: string;
  subtitle?: string;
  localItem: T;
  remoteItem: T;
  divergentFields: ConflictFieldDiff[];
  smartMergedItem: T;
  chosenResolution?: ResolutionChoice;
}

/**
 * Thuật toán Hợp nhất Thông minh cấp trường cho Sự kiện Lịch dạy (CalendarEventItem)
 */
export function smartMergeEvent(local: any, remote: any): any {
  const merged = { ...local };
  const localTs = Number(local.updatedAt) || 0;
  const remoteTs = Number(remote.updatedAt) || 0;

  // 1. Nếu một bên có đính kèm tệp giáo án mới hơn hoặc bên kia bị mất tệp -> Giữ tệp đính kèm
  if (!merged.attachmentUrl && remote.attachmentUrl) {
    merged.attachmentUrl = remote.attachmentUrl;
    merged.attachmentName = remote.attachmentName;
    merged.attachmentContent = remote.attachmentContent;
  } else if (remote.attachmentUrl && remoteTs > localTs && !local.attachmentUrl) {
    merged.attachmentUrl = remote.attachmentUrl;
    merged.attachmentName = remote.attachmentName;
    merged.attachmentContent = remote.attachmentContent;
  }

  // 2. Ghi chú (Notes): Nếu cả 2 bên đều có ghi chú khác nhau -> Ghép thông minh
  const localNotes = (local.notes || '').trim();
  const remoteNotes = (remote.notes || '').trim();
  if (localNotes && remoteNotes && localNotes !== remoteNotes) {
    if (!localNotes.includes(remoteNotes) && !remoteNotes.includes(localNotes)) {
      merged.notes = `${localNotes} | [Đồng bộ đám mây: ${remoteNotes}]`;
    } else {
      merged.notes = localNotes.length >= remoteNotes.length ? localNotes : remoteNotes;
    }
  } else if (!localNotes && remoteNotes) {
    merged.notes = remoteNotes;
  }

  // 3. Phòng học (Room): Lấy giá trị mới nhất
  if (remote.room && remote.room !== local.room && remoteTs > localTs) {
    merged.room = remote.room;
  }

  // 4. Thời gian (StartTime, EndTime): Lấy giá trị mới nhất nếu có cập nhật
  if (remoteTs > localTs && (remote.startTime !== local.startTime || remote.endTime !== local.endTime)) {
    merged.startTime = remote.startTime || local.startTime;
    merged.endTime = remote.endTime || local.endTime;
  }

  // Cập nhật timestamp hợp nhất
  merged.updatedAt = Math.max(localTs, remoteTs, Date.now());
  merged._smartMerged = true;
  return merged;
}

/**
 * Phát hiện danh sách các trường xung đột giữa 2 sự kiện
 */
export function compareEventFields(local: any, remote: any): ConflictFieldDiff[] {
  const diffs: ConflictFieldDiff[] = [];
  const fields: { key: string; label: string }[] = [
    { key: 'subject', label: 'Môn học' },
    { key: 'className', label: 'Lớp học' },
    { key: 'room', label: 'Phòng học' },
    { key: 'sessionType', label: 'Loại ca dạy' },
    { key: 'startTime', label: 'Giờ bắt đầu' },
    { key: 'endTime', label: 'Giờ kết thúc' },
    { key: 'notes', label: 'Ghi chú ca dạy' },
    { key: 'attachmentName', label: 'Tệp đính kèm' }
  ];

  for (const f of fields) {
    const lVal = (local[f.key] || '').toString().trim();
    const rVal = (remote[f.key] || '').toString().trim();
    if (lVal !== rVal) {
      diffs.push({
        fieldName: f.key,
        fieldLabel: f.label,
        localValue: local[f.key] || '(Trống)',
        remoteValue: remote[f.key] || '(Trống)'
      });
    }
  }

  return diffs;
}

/**
 * Quét phát hiện toàn bộ xung đột giữa tập sự kiện Cục bộ và Đám mây
 */
export function detectAndResolveEventConflicts(
  localEvents: any[],
  remoteEvents: any[],
  lastSyncTs: number = 0
): {
  autoMergedEvents: any[];
  conflicts: ConflictItem<any>[];
} {
  const localMap = new Map<string, any>();
  const getKey = (e: any) => {
    const numId = Number(e.id);
    if (!isNaN(numId) && numId > 0) return `id_${numId}`;
    if (e.teachingScheduleId) return `sch_${e.teachingScheduleId}_${e.date}`;
    return `${e.date}_${(e.className || '').toLowerCase().trim()}_${(e.startTime || '').trim()}_${(e.subject || '').toLowerCase().trim()}`;
  };

  localEvents.forEach(e => {
    if (e && e.id) localMap.set(getKey(e), e);
  });

  const conflicts: ConflictItem<any>[] = [];
  const autoMergedMap = new Map<string, any>(localMap);

  for (const remote of remoteEvents) {
    if (!remote || !remote.id) continue;
    const key = getKey(remote);
    const local = localMap.get(key);

    if (!local) {
      // Remote có mà local chưa có -> Nạp bình thường
      autoMergedMap.set(key, remote);
      continue;
    }

    const localTs = Number(local.updatedAt) || 0;
    const remoteTs = Number(remote.updatedAt) || 0;
    const diffs = compareEventFields(local, remote);

    // Nếu không có trường nào khác biệt -> Không xung đột
    if (diffs.length === 0) {
      continue;
    }

    // Nếu cả 2 bên cùng được sửa đổi kể từ lần đồng bộ trước (hoặc chênh lệch < 1 ngày) và có trường đối kháng
    const isBothModified = (localTs > lastSyncTs && remoteTs > lastSyncTs) || Math.abs(localTs - remoteTs) < 86400000;
    
    if (isBothModified && diffs.length > 0) {
      const smartMerged = smartMergeEvent(local, remote);
      
      // Nếu chỉ khác biệt nhỏ có thể auto-merge an toàn (như 1 bên chỉ thêm notes hoặc tệp đính kèm)
      const isAutoResolvable = diffs.every(d => d.fieldName === 'notes' || d.fieldName === 'attachmentName' || d.fieldName === 'attachmentUrl');
      
      if (isAutoResolvable) {
        autoMergedMap.set(key, smartMerged);
      } else {
        // Xung đột đối kháng lớn (như đổi phòng, đổi giờ, đổi môn) -> Đưa vào Modal cho người dùng chọn
        conflicts.push({
          id: String(local.id),
          entityType: 'EVENT',
          title: `${local.subject || 'Ca dạy'} - ${local.className || ''}`,
          subtitle: `Ngày ${local.date} (${local.startTime} - ${local.endTime})`,
          localItem: local,
          remoteItem: remote,
          divergentFields: diffs,
          smartMergedItem: smartMerged,
          chosenResolution: 'SMART_MERGE'
        });
        autoMergedMap.set(key, smartMerged); // Tạm lưu smart merge
      }
    } else {
      // Một bên mới hơn hoàn toàn -> Lấy bên mới hơn
      if (remoteTs > localTs) {
        autoMergedMap.set(key, remote);
      } else {
        autoMergedMap.set(key, local);
      }
    }
  }

  return {
    autoMergedEvents: Array.from(autoMergedMap.values()).sort((a, b) => {
      if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
      return (a.startTime || '').localeCompare(b.startTime || '');
    }),
    conflicts
  };
}

/**
 * Hợp nhất thông minh Giáo án Nhà trường: Bảo toàn nhận xét phê duyệt của BGH
 */
export function smartMergeLessonPlan(local: any, remote: any): any {
  const merged = { ...local };
  const localTs = Number(local.submittedAt || local.reviewedAt || 0);
  const remoteTs = Number(remote.submittedAt || remote.reviewedAt || 0);

  // Nếu một bên đã được DUYỆT (APPROVED) -> Luôn bảo toàn trạng thái duyệt và nhận xét của BGH
  if (remote.status === 'APPROVED' && local.status !== 'APPROVED') {
    merged.status = 'APPROVED';
    merged.reviewedBy = remote.reviewedBy;
    merged.reviewedAt = remote.reviewedAt;
    merged.reviewNotes = remote.reviewNotes;
  } else if (local.status === 'APPROVED' && remote.status !== 'APPROVED') {
    merged.status = 'APPROVED';
    merged.reviewedBy = local.reviewedBy;
    merged.reviewedAt = local.reviewedAt;
    merged.reviewNotes = local.reviewNotes;
  }

  // Tiêu đề & nội dung bài dạy: Lấy bản cập nhật mới nhất
  if (remoteTs > localTs && remote.lessonTitle) {
    merged.lessonTitle = remote.lessonTitle;
    merged.durationPeriods = remote.durationPeriods || local.durationPeriods;
    merged.hasDigitalAssets = remote.hasDigitalAssets ?? local.hasDigitalAssets;
  }

  return merged;
}
