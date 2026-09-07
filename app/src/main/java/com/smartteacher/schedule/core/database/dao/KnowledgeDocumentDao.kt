package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface KnowledgeDocumentDao {

    @Query("SELECT * FROM knowledge_documents ORDER BY isBuiltIn DESC, createdAt ASC")
    fun getAllDocumentsFlow(): Flow<List<KnowledgeDocumentEntity>>

    @Query("SELECT * FROM knowledge_documents WHERE isActive = 1 ORDER BY isBuiltIn DESC, createdAt ASC")
    fun getAllActiveDocumentsFlow(): Flow<List<KnowledgeDocumentEntity>>

    @Query("SELECT * FROM knowledge_documents WHERE isActive = 1")
    suspend fun getAllActiveDocuments(): List<KnowledgeDocumentEntity>

    @Query("SELECT * FROM knowledge_documents WHERE isActive = 1 AND (category = :category OR category = 'PHAP_QUY') AND (subject = :subject OR subject = 'ALL')")
    suspend fun getRelevantDocuments(category: String, subject: String): List<KnowledgeDocumentEntity>

    @Query("SELECT * FROM knowledge_documents WHERE code = :code LIMIT 1")
    suspend fun getDocumentByCode(code: String): KnowledgeDocumentEntity?

    @Query("SELECT * FROM knowledge_documents WHERE id = :id LIMIT 1")
    suspend fun getDocumentById(id: Long): KnowledgeDocumentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(doc: KnowledgeDocumentEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocuments(docs: List<KnowledgeDocumentEntity>): List<Long>

    @Update
    suspend fun updateDocument(doc: KnowledgeDocumentEntity)

    @Delete
    suspend fun deleteDocument(doc: KnowledgeDocumentEntity)

    @Query("DELETE FROM knowledge_documents WHERE id = :id AND isBuiltIn = 0")
    suspend fun deleteCustomDocumentById(id: Long)

    @Query("UPDATE knowledge_documents SET isActive = :isActive WHERE id = :id")
    suspend fun setDocumentActive(id: Long, isActive: Boolean)

    @Query("SELECT COUNT(*) FROM knowledge_documents")
    suspend fun getDocumentCount(): Int
}
