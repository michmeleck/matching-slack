# Instructions for Claude when tagged in the creator-list Slack channel

Trigger: a teammate @-mentions Claude in a thread that has a `.csv` file attached
and asks for it to be checked / filed.

## 1. Validate the file

The file must be a single-column CSV:

- Header row is exactly `email` (case-insensitive), and nothing else.
- Every following row contains exactly one value, no more.
- No blank rows between entries.
- No leading, trailing, or internal whitespace in any value.
- Every value is a syntactically valid email address (e.g. `name@domain.tld`).
- No duplicate emails (case-insensitive).

Check every row — don't stop at the first problem. Collect every violation found.

## 2. Reply in the thread

**If invalid:** reply in the thread stating (1) that the file has issues, and
(2) exactly which rows/values and what's wrong with each (e.g. "Row 4: blank
row", "Row 7: `jane doe@x.com` contains whitespace"). Do not create a Linear
ticket. Do not delete or modify the file.

**If valid:** reply confirming it passed (row count is fine to include), then:

## 3. Create the Linear ticket

Create a Linear issue (team: <TEAM NAME/ID — fill in>) with:

- Title: `Process creator list: <file name>`
- Description: uploader's name, row count, and a link to the Slack file/thread.

Reply in the thread with the created ticket's link.

## Out of scope

Do not create anything in Upfluence — list creation there stays manual.
