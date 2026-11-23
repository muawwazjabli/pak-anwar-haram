import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { queueDocumentImportJob } from '@/lib/workers/import-worker';
import { SupplierDocument } from '@/types';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');

    let docs = db.documents;
    if (supplierId) docs = docs.filter(d => d.supplierId === supplierId);
    if (status) docs = docs.filter(d => d.status === status);

    return NextResponse.json({
      success: true,
      documents: docs.map(d => {
        const sup = db.suppliers.find(s => s.id === d.supplierId);
        return { ...d, supplierName: sup ? sup.name : 'Unknown' };
      })
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Support multipart form data or JSON fixture import
    const contentType = request.headers.get('content-type') || '';
    
    let supplierId = '';
    let docType = 'auto_detect';
    let fileName = '';
    let filePath = '';
    let fileSize = 0;
    let mimeType = 'application/pdf';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      supplierId = body.supplierId || 'sup-meezab';
      docType = body.docType || 'auto_detect';
      fileName = body.fileName;
      filePath = body.filePath || path.resolve('fixtures', 'supplier_docs', fileName);
      fileSize = body.fileSize || (fs.existsSync(filePath) ? fs.statSync(filePath).size : 1024);
      mimeType = body.mimeType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    } else {
      const formData = await request.formData();
      supplierId = (formData.get('supplierId') as string) || 'sup-meezab';
      docType = (formData.get('docType') as string) || 'auto_detect';
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      // Save to private uploads directory
      const uploadDir = path.resolve('private_storage', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    }

    const docId = `doc-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const newDoc: SupplierDocument = {
      id: docId,
      supplierId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      docType: docType as any,
      status: 'uploaded',
      totalPages: 1,
      processedPages: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.documents.push(newDoc);

    // Queue durable background worker
    const jobStatus = await queueDocumentImportJob(newDoc, 'usr-owner-1');

    return NextResponse.json({
      success: true,
      document: newDoc,
      job: jobStatus
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
