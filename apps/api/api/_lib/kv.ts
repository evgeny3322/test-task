// File: /apps/api/api/_lib/kv.ts
import { kv, createClient } from '@vercel/kv';

// Поддержка переменных от Upstash через Marketplace
// Если доступны переменные Upstash, используем их, иначе стандартные KV переменные
const kvClient = (() => {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (upstashUrl && upstashToken) {
    // Используем Upstash переменные через createClient
    return createClient({
      url: upstashUrl,
      token: upstashToken,
    });
  }
  
  // Используем стандартный kv клиент с KV_REST_API_URL и KV_REST_API_TOKEN
  return kv;
})();

export interface StoredData {
  id: string;
  filename: string;
  data: any[];
  uploadedAt: string;
}

export interface ProcessedResult {
  summary: {
    totalRows: number;
    numericFields: Record<string, {
      avg: number;
      min: number;
      max: number;
      sum: number;
    }>;
  };
  groupedData: Record<string, any[]>;
  originalData: any[];
}

/**
 * Save uploaded data to KV store
 */
export async function saveData(id: string, data: StoredData): Promise<void> {
  await kvClient.set(`data:${id}`, JSON.stringify(data), { ex: 3600 }); // 1 hour expiry
}

/**
 * Get uploaded data from KV store
 */
export async function getData(id: string): Promise<StoredData | null> {
  const data = await kvClient.get<string>(`data:${id}`);
  if (!data) return null;
  return JSON.parse(data);
}

/**
 * Save processed result to KV store
 */
export async function saveResult(id: string, result: ProcessedResult): Promise<void> {
  await kvClient.set(`result:${id}`, JSON.stringify(result), { ex: 3600 });
}

/**
 * Get processed result from KV store
 */
export async function getResult(id: string): Promise<ProcessedResult | null> {
  const result = await kvClient.get<string>(`result:${id}`);
  if (!result) return null;
  return JSON.parse(result);
}

