// File: /apps/api/api/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from './_lib/parser.js';
import { saveData } from './_lib/kv.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    const allowedExts = ['.csv', '.json'];
    const hasValidMime = allowedMimes.includes(file.mimetype);
    const hasValidExt = allowedExts.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidMime || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'));
    }
  },
});

// Helper to run multer middleware in serverless environment
function runMiddleware(req: any, res: any, fn: any): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));
    
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Parse the file
    const parseResult = parseFile(file);
    
    // Generate unique ID
    const id = uuidv4();
    
    // Save to KV store
    await saveData(id, {
      id,
      filename: parseResult.filename,
      data: parseResult.data,
      uploadedAt: new Date().toISOString(),
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      id,
      filename: parseResult.filename,
      rowCount: parseResult.data.length,
      message: 'File uploaded and processed successfully',
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to process file',
    });
  }
}

