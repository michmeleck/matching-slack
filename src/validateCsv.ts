import Papa from "papaparse";
import { ValidationConfig } from "./config";

export interface ValidationResult {
  valid: boolean;
  rowCount: number;
  errors: string[];
}

export function validateCsv(csvText: string, config: ValidationConfig): ValidationResult {
  const errors: string[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      errors.push(`Row ${err.row ?? "?"}: ${err.message}`);
    }
  }

  const rows = parsed.data;
  const columns = parsed.meta.fields ?? [];

  for (const col of config.requiredColumns) {
    if (!columns.includes(col)) {
      errors.push(`Missing required column: "${col}"`);
    }
  }

  // Stop early if columns are already broken — row-level checks would be noise.
  if (errors.length > 0) {
    return { valid: false, rowCount: rows.length, errors };
  }

  if (rows.length === 0) {
    errors.push("File has no data rows.");
  }

  if (rows.length > config.maxRows) {
    errors.push(`File has ${rows.length} rows, which exceeds the max of ${config.maxRows}.`);
  }

  const seen: Record<string, Set<string>> = {};
  for (const col of config.uniqueColumns) {
    seen[col] = new Set();
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +1 for header, +1 for 1-indexing

    for (const col of config.requiredColumns) {
      const value = (row[col] ?? "").trim();
      if (!value) {
        errors.push(`Row ${rowNum}: missing value for required column "${col}"`);
      }
    }

    const platform = (row["platform"] ?? "").trim().toLowerCase();
    if (platform && !config.allowedPlatforms.includes(platform)) {
      errors.push(
        `Row ${rowNum}: unrecognized platform "${row["platform"]}" (allowed: ${config.allowedPlatforms.join(", ")})`
      );
    }

    for (const col of config.uniqueColumns) {
      const value = (row[col] ?? "").trim().toLowerCase();
      if (!value) continue;
      if (seen[col].has(value)) {
        errors.push(`Row ${rowNum}: duplicate value "${row[col]}" in column "${col}"`);
      } else {
        seen[col].add(value);
      }
    }
  });

  return { valid: errors.length === 0, rowCount: rows.length, errors };
}
