import { LinearClient } from "@linear/sdk";

export interface CreateTicketParams {
  apiKey: string;
  teamId: string;
  title: string;
  description: string;
}

export async function createLinearTicket(params: CreateTicketParams): Promise<{ url: string; identifier: string }> {
  const client = new LinearClient({ apiKey: params.apiKey });

  const result = await client.createIssue({
    teamId: params.teamId,
    title: params.title,
    description: params.description,
  });

  const issue = await result.issue;
  if (!issue) {
    throw new Error("Linear did not return the created issue.");
  }

  return { url: issue.url, identifier: issue.identifier };
}
