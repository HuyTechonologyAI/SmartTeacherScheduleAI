package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Thực thể lưu trữ Văn bản pháp quy, Sách giáo khoa, Đề cương và Giáo trình chuẩn
 * phục vụ làm kho dữ liệu đối chiếu (Grounding Knowledge Base) cho AI,
 * đảm bảo AI tuyệt đối không bịa đặt hoặc ảo tưởng thông tin.
 */
@Entity(
    tableName = "knowledge_documents",
    indices = [
        Index(value = ["code"], unique = true),
        Index(value = ["category"]),
        Index(value = ["subject"])
    ]
)
data class KnowledgeDocumentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val code: String, // Mã văn bản (VD: "CV_5512", "CV_2634", "TT_22", "CUSTOM_...")
    val title: String, // Tên văn bản / Giáo trình
    val category: String, // "PHAP_QUY", "GIAO_TRINH", "DE_CUONG", "QUY_CHUAN_XUONG"
    val subject: String = "ALL", // Môn học áp dụng hoặc "ALL"
    val targetLevel: String = "ALL", // "Phổ thông", "Nghề nghiệp", "ALL"
    val summary: String = "", // Tóm tắt ngắn gọn
    val content: String, // Toàn văn nội dung cốt lõi, chuẩn đầu ra, quy trình bắt buộc
    val isBuiltIn: Boolean = false, // true nếu là văn bản pháp quy gốc của Bộ/Tổng cục tích hợp sẵn
    val isActive: Boolean = true, // Bật/tắt sử dụng làm căn cứ đối chiếu khi AI sinh giáo án
    val fileName: String = "", // Tên file đính kèm gốc (nếu có, VD: "Giao_trinh_Tien_CNC.docx")
    val filePath: String = "", // Đường dẫn lưu trữ tệp nội bộ
    val fileSizeBytes: Long = 0L, // Dung lượng tệp
    val fileExtension: String = "", // Phần mở rộng: "docx", "pdf", "txt"...
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    companion object {
        const val CAT_PHAP_QUY = "PHAP_QUY"
        const val CAT_GIAO_TRINH = "GIAO_TRINH"
        const val CAT_DE_CUONG = "DE_CUONG"
        const val CAT_QUY_CHUAN_XUONG = "QUY_CHUAN_XUONG"
    }
}
