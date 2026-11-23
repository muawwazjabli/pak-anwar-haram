import { db } from '../db';
import { processSupplierDocument } from '../parsers/document-ingestion';
import { SupplierDocument } from '@/types';

export interface ImportJobStatus {
  jobId: string;
  documentId: string;
  fileName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalPages: number;
  processedPages: number;
  extractedItemsCount: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

const activeJobs = new Map<string, ImportJobStatus>();

export async function queueDocumentImportJob(
  doc: SupplierDocument,
  userId: string
): Promise<ImportJobStatus> {
  const jobId = `job-${doc.id}`;
  
  const jobStatus: ImportJobStatus = {
    jobId,
    documentId: doc.id,
    fileName: doc.fileName,
    status: 'queued',
    totalPages: doc.totalPages || 1,
    processedPages: 0,
    extractedItemsCount: 0,
    startedAt: new Date().toISOString()
  };

  activeJobs.set(jobId, jobStatus);

  // Run asynchronously without blocking HTTP response
  setTimeout(async () => {
    await runImportJob(jobId, doc, userId);
  }, 100);

  return jobStatus;
}

export async function runImportJob(jobId: string, doc: SupplierDocument, userId: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  doc.status = 'processing';

  try {
    // Idempotent clean-up if re-running
    db.reviewItems = db.reviewItems.filter(i => i.documentId !== doc.id);

    const result = await processSupplierDocument(
      doc.id,
      doc.filePath,
      doc.fileName,
      doc.mimeType,
      doc.docType
    );

    if (!result.success) {
      job.status = 'failed';
      job.error = result.error;
      doc.status = 'rejected';
      return;
    }

    doc.totalPages = result.totalPages;
    doc.processedPages = result.totalPages;
    doc.docType = result.docTypeDetected;
    doc.status = 'needs_review';
    doc.updatedAt = new Date().toISOString();

    // Store extracted review items
    db.reviewItems.push(...result.reviewItems);

    job.totalPages = result.totalPages;
    job.processedPages = result.totalPages;
    job.extractedItemsCount = result.reviewItems.length;
    job.status = 'completed';
    job.completedAt = new Date().toISOString();

    db.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId,
      action: 'IMPORT_DOCUMENT_COMPLETED',
      entityType: 'supplier_documents',
      entityId: doc.id,
      afterSnapshot: {
        docType: result.docTypeDetected,
        extractedCount: result.reviewItems.length,
        totalPages: result.totalPages
      },
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    job.status = 'failed';
    job.error = err.message;
    doc.status = 'rejected';
  }
}

export function getImportJobStatus(jobId: string): ImportJobStatus | undefined {
  return activeJobs.get(jobId);
}
