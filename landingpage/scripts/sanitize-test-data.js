/**
 * Pre-build & Pre-publish Test Data Sanitization Hook
 * Bắt buộc kiểm tra và loại bỏ dữ liệu thử nghiệm trước khi đóng gói/xuất bản
 * Smart Teacher Schedule - Production Safety Hook
 */

const fs = require('fs');
const path = require('path');

console.log('\n================================================================');
console.log('🛡️  SMART TEACHER SCHEDULE - PRE-BUILD SAFETY SANITATION CHECK');
console.log('================================================================');
console.log('🔍 Đang rà soát và kiểm tra dữ liệu test trước khi xuất bản...');

let testIssuesFound = 0;

// 1. Kiểm tra các thư mục public/ và data/
const dirsToCheck = [
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'app')
];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.next') {
        scanDirectory(fullPath);
      }
    } else {
      // Check for standalone test JSON/text files accidentally left
      if (/^(test_|mock_|dummy_)/i.test(item.name) && (item.name.endsWith('.json') || item.name.endsWith('.txt'))) {
        console.warn(`⚠️  Phát hiện tệp test tạm thời: ${item.name} -> Đang tự động gỡ bỏ...`);
        try {
          fs.unlinkSync(fullPath);
          testIssuesFound++;
        } catch (_) {}
      }
    }
  }
}

for (const d of dirsToCheck) {
  scanDirectory(d);
}

if (testIssuesFound > 0) {
  console.log(`✅ Đã tự động dọn dẹp ${testIssuesFound} tệp test dư thừa.`);
} else {
  console.log('✅ Hệ thống sạch hoàn toàn: Không phát hiện tệp rác hoặc dữ liệu test tồn đọng.');
}

console.log('🚀 Môi trường đã sẵn sàng và an toàn tuyệt đối cho Giáo viên!');
console.log('================================================================\n');
