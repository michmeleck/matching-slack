import { ValidationConfig } from "./config";

export interface ValidationResult {
  valid: boolean;
  rowCount: number;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCsv(csvText: string, config: ValidationConfig): ValidationResult {
  const errors: string[] = [];
  const expectedColumn = config.requiredColumns[0] ?? "email";

  const lines = csvText.split(/\r\n|\r|\n/);
  // A trailing newline produces one empty "line" at the end — that's not a blank row, drop it.
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  if (lines.length === 0) {
    return { valid: false, rowCount: 0, errors: ["File is empty."] };
  }

  const header = lines[0];
  const headerColumns = header.split(",").map((c) => c.trim().toLowerCase());

  if (headerColumns.length !== 1 || headerColumns[0] !== expectedColumn) {
    errors.push(
      `Header row must contain exactly one column named "${expectedColumn}" (found: "${header}").`
    );
    return { valid: false, rowCount: 0, errors };
  }

  const dataLines = lines.slice(1);
  const seen = new Set<string>();
  let rowCount = 0;

  dataLines.forEach((line, index) => {
    const rowNum = index + 2; // +1 for header row, +1 for 1-indexing

    if (line.trim() === "") {
      errors.push(`Row ${rowNum}: blank row — no blank rows are allowed between entries.`);
      return;
    }

    if (line.includes(",")) {
      errors.push(`Row ${rowNum}: "${line}" has more than one value — only one email per row is allowed.`);
      return;
    }

    if (line !== line.trim()) {
      errors.push(`Row ${rowNum}: "${line}" has leading or trailing whitespace.`);
      return;
    }

    if (/\s/.test(line)) {
      errors.push(`Row ${rowNum}: "${line}" contains whitespace inside the value.`);
      return;
    }

    if (!EMAIL_REGEX.test(line)) {
      errors.push(`Row ${rowNum}: "${line}" is not a valid email address.`);
      return;
    }

    const normalized = line.toLowerCase();
    if (seen.has(normalized)) {
      errors.push(`Row ${rowNum}: duplicate email "${line}".`);
      return;
    }
    seen.add(normalized);
    rowCount++;
  });

  if (rowCount === 0 && errors.length === 0) {
    errors.push("File has no data rows.");
  }

  if (rowCount > config.maxRows) {
    errors.push(`File has ${rowCount} rows, which exceeds the max of ${config.maxRows}.`);
  }

  return { valid: errors.length === 0, rowCount, errors };
}
