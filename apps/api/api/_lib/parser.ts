// File: /apps/api/api/_lib/parser.ts
import Papa from 'papaparse';
import { z } from 'zod';

export interface ParseResult {
  data: any[];
  filename: string;
  format: 'csv' | 'json';
}

/**
 * Parse CSV file buffer
 */
function parseCSV(buffer: Buffer): any[] {
  const text = buffer.toString('utf-8');
  const result = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  
  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }
  
  return result.data;
}

/**
 * Parse JSON file buffer
 */
function parseJSON(buffer: Buffer): any[] {
  const text = buffer.toString('utf-8');
  const parsed = JSON.parse(text);
  
  // If it's an array, return as is
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  // If it's an object with a data array, return the array
  if (parsed.data && Array.isArray(parsed.data)) {
    return parsed.data;
  }
  
  // Otherwise, wrap in array
  return [parsed];
}

/**
 * Validate that data is an array of objects
 */
function validateData(data: any[]): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  
  if (typeof data[0] !== 'object' || data[0] === null) {
    throw new Error('Data must be an array of objects');
  }
}

/**
 * Main parse function
 */
export function parseFile(file: Express.Multer.File): ParseResult {
  const { buffer, originalname, mimetype } = file;
  
  let data: any[];
  let format: 'csv' | 'json';
  
  // Determine format from mimetype or extension
  const isCSV = mimetype === 'text/csv' || 
                mimetype === 'application/vnd.ms-excel' ||
                originalname.toLowerCase().endsWith('.csv');
  
  const isJSON = mimetype === 'application/json' ||
                 originalname.toLowerCase().endsWith('.json');
  
  if (isCSV) {
    format = 'csv';
    data = parseCSV(buffer);
  } else if (isJSON) {
    format = 'json';
    data = parseJSON(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or JSON file.');
  }
  
  validateData(data);
  
  return {
    data,
    filename: originalname,
    format,
  };
}

/**
 * Convert JSON data back to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }
  
  const csv = Papa.unparse(data);
  return csv;
}

