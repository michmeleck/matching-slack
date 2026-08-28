import { LinearClient } from "@linear/sdk";

// Squad Libra (LIB) — "Matching request" ticket template, mirrored from
// https://linear.app/upfluence/issue/LIB-1013/matching-request-global-citizen
export const MATCHING_REQUEST_TEAM_ID = "eb479047-bf1e-4160-bc0d-fd149af568ee";
export const MATCHING_REQUEST_LABEL_IDS = [
  "abd1636a-501f-47ec-aba5-3f7bef241415", // Creator Space
  "baea1f9b-9fc6-4440-97ad-99d517d461fb", // influencer-server
  "15ba6ce9-a77c-4b4f-ac74-c977030349af", // Matching request
  "52c7fb4a-374d-45c6-98bd-e2886498df14", // Data
  "d6f2cc93-59e4-4796-be3b-58936a44e251", // Service
];
const URGENT_PRIORITY = 1;
const COOKBOOK_URL =
  "https://github.com/upfluence/man/blob/master/cookbooks/support/influencer-import.md";

export interface ClientInfo {
  clientName: string;
  userId: string;
  companyId: string;
  email: string;
}

export interface CreateMatchingTicketParams {
  apiKey: string;
  client: ClientInfo;
  fileName: string;
  fileUrl: string;
  rowCount: number;
}

function buildDescription(params: CreateMatchingTicketParams): string {
  const { client, fileName, fileUrl, rowCount } = params;
  return [
    `### Before clicking on the "create issue" button`,
    ``,
    `* Double check if there isn't an existing issue for this import`,
    `* Make sure the CSV file is properly formatted and does not contain trailing lines`,
    `* All the needed information are here`,
    ``,
    `### Client info`,
    ``,
    `* User ID: ${client.userId}`,
    `* Company ID: ${client.companyId}`,
    `* Email: [${client.email}](mailto:${client.email})`,
    ``,
    `### Checklist`,
    ``,
    `- [x] File format is correct (${rowCount} rows, validated automatically)`,
    ``,
    `File: [${fileName}](${fileUrl})`,
    ``,
    `### Additional context (if relevant)`,
    ``,
    `* Matched creators go into List: _to be added once the list is created in Upfluence_`,
    ``,
    `## Cookbook`,
    ``,
    COOKBOOK_URL,
  ].join("\n");
}

export async function createMatchingRequestTicket(
  params: CreateMatchingTicketParams
): Promise<{ url: string; identifier: string }> {
  const client = new LinearClient({ apiKey: params.apiKey });

  const result = await client.createIssue({
    teamId: MATCHING_REQUEST_TEAM_ID,
    title: `Matching request - ${params.client.clientName}`,
    description: buildDescription(params),
    labelIds: MATCHING_REQUEST_LABEL_IDS,
    priority: URGENT_PRIORITY,
  });

  const issue = await result.issue;
  if (!issue) {
    throw new Error("Linear did not return the created issue.");
  }

  return { url: issue.url, identifier: issue.identifier };
}
