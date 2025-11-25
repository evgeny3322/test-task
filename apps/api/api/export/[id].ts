// File: /apps/api/api/export/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getData } from '../_lib/kv.js';
import { convertToCSV } from '../_lib/parser.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { id, format } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    const exportFormat = (format as string)?.toLowerCase() || 'json';
    
    if (!['csv', 'json'].includes(exportFormat)) {
      return res.status(400).json({ error: 'Invalid format. Use csv or json.' });
    }
    
    // Get original data
    const storedData = await getData(id);
    
    if (!storedData) {
      return res.status(404).json({
        error: 'Data not found. It may have expired or the ID is invalid.',
      });
    }
    
    const baseFilename = storedData.filename.replace(/\.[^/.]+$/, '');
    
    if (exportFormat === 'csv') {
      const csv = convertToCSV(storedData.data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFilename}_export.csv"`);
      return res.status(200).send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFilename}_export.json"`);
      return res.status(200).json(storedData.data);
    }
    
  } catch (error: any) {
    console.error('Export error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to export data',
    });
  }
}

