import { ClientInfo } from "./linear";

const FIELD_PATTERNS: Record<keyof ClientInfo, RegExp> = {
  clientName: /client(?:\s*name)?\s*:\s*(.+)/i,
  userId: /user\s*id\s*:\s*(.+)/i,
  companyId: /company\s*id\s*:\s*(.+)/i,
  email: /email\s*:\s*(.+)/i,
};

export interface ClientInfoParseResult {
  info: ClientInfo | null;
  missing: (keyof ClientInfo)[];
}

// Expects the Slack message accompanying the file upload to contain lines like:
//   Client: Global Citizen
//   User ID: 775278
//   Company ID: 138585
//   Email: shannon.lorraine@globalpovertyproject.com
export function parseClientInfo(commentText: string): ClientInfoParseResult {
  const values: Partial<Record<keyof ClientInfo, string>> = {};

  for (const line of commentText.split(/\r?\n/)) {
    for (const [field, pattern] of Object.entries(FIELD_PATTERNS) as [keyof ClientInfo, RegExp][]) {
      const match = line.match(pattern);
      if (match) {
        values[field] = match[1].trim();
      }
    }
  }

  const missing = (Object.keys(FIELD_PATTERNS) as (keyof ClientInfo)[]).filter((field) => !values[field]);

  if (missing.length > 0) {
    return { info: null, missing };
  }

  return { info: values as ClientInfo, missing: [] };
}
