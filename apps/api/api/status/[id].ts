// File: /apps/api/api/status/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getData, getResult, saveResult } from '../_lib/kv.js';
import { aggregateData } from '../_lib/aggregator.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    // Check if result is already cached
    let result = await getResult(id);
    
    if (result) {
      return res.status(200).json({
        success: true,
        cached: true,
        ...result,
      });
    }
    
    // Get original data
    const storedData = await getData(id);
    
    if (!storedData) {
      return res.status(404).json({
        success: false,
        error: 'Data not found. It may have expired or the ID is invalid.',
      });
    }
    
    // Process and aggregate data
    result = aggregateData(storedData.data);
    
    // Cache the result
    await saveResult(id, result);
    
    return res.status(200).json({
      success: true,
      cached: false,
      filename: storedData.filename,
      uploadedAt: storedData.uploadedAt,
      ...result,
    });
    
  } catch (error: any) {
    console.error('Status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process data',
    });
  }
}

