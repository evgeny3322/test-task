// File: /apps/api/api/_lib/aggregator.ts
import { ProcessedResult } from './kv.js';

/**
 * Check if a value is numeric
 */
function isNumeric(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Get numeric fields from data
 */
function getNumericFields(data: any[]): string[] {
  if (data.length === 0) return [];
  
  const firstRow = data[0];
  const numericFields: string[] = [];
  
  for (const key in firstRow) {
    if (isNumeric(firstRow[key])) {
      numericFields.push(key);
    }
  }
  
  return numericFields;
}

/**
 * Calculate statistics for numeric fields
 */
function calculateNumericStats(data: any[], fields: string[]) {
  const stats: Record<string, { avg: number; min: number; max: number; sum: number }> = {};
  
  for (const field of fields) {
    const values = data
      .map(row => row[field])
      .filter(val => isNumeric(val));
    
    if (values.length === 0) continue;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    stats[field] = { avg, min, max, sum };
  }
  
  return stats;
}

/**
 * Find the best categorical field for grouping
 */
function findCategoricalField(data: any[]): string | null {
  if (data.length === 0) return null;
  
  const firstRow = data[0];
  const fields = Object.keys(firstRow);
  
  // Look for common category field names
  const categoryNames = ['category', 'type', 'group', 'status', 'region', 'product'];
  for (const name of categoryNames) {
    const field = fields.find(f => f.toLowerCase().includes(name));
    if (field) return field;
  }
  
  // Find field with reasonable number of unique values
  for (const field of fields) {
    const uniqueValues = new Set(data.map(row => row[field]));
    if (uniqueValues.size > 1 && uniqueValues.size < data.length / 2) {
      return field;
    }
  }
  
  return fields[0]; // Fallback to first field
}

/**
 * Group data by a categorical field
 */
function groupByField(data: any[], field: string): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  for (const row of data) {
    const key = String(row[field] || 'Unknown');
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  }
  
  return grouped;
}

/**
 * Aggregate and process data
 */
export function aggregateData(data: any[]): ProcessedResult {
  // Calculate summary statistics
  const numericFields = getNumericFields(data);
  const numericStats = calculateNumericStats(data, numericFields);
  
  // Group data by categorical field
  const categoricalField = findCategoricalField(data);
  const groupedData = categoricalField ? groupByField(data, categoricalField) : {};
  
  return {
    summary: {
      totalRows: data.length,
      numericFields: numericStats,
    },
    groupedData,
    originalData: data,
  };
}

/**
 * Calculate aggregations per group
 */
export function calculateGroupAggregations(
  groupedData: Record<string, any[]>,
  numericField: string
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const [key, rows] of Object.entries(groupedData)) {
    const values = rows
      .map(row => row[numericField])
      .filter(val => isNumeric(val));
    
    if (values.length > 0) {
      result[key] = values.reduce((acc, val) => acc + val, 0);
    }
  }
  
  return result;
}

