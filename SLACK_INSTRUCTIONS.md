# Instructions for Claude when tagged in the creator-list Slack channel

Trigger: a teammate @-mentions Claude in a thread that has a `.csv` file
attached and asks for it to be checked / filed as a matching request.

The teammate's message must also include, as plain text:

```
Client: <client / company name>
User ID: <Upfluence user id>
Company ID: <Upfluence company id>
Email: <client email>
```

If any of these four fields is missing, reply asking for the missing ones —
do not create a ticket without them.

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

**If invalid:** reply stating (1) that the file has issues, and (2) exactly
which rows/values and what's wrong with each (e.g. "Row 4: blank row", "Row 7:
`jane doe@x.com` contains whitespace"). Do not create a Linear ticket. Do not
delete or modify the file.

**If valid:** reply confirming it passed (include the row count), then:

## 3. Create the Linear ticket

Team: **Squad Libra** (`LIB`).

- Title: `Matching request - <client name>`
- Priority: Urgent
- Labels: `Creator Space`, `influencer-server`, `Matching request`, `Data`, `Service`
- Description, following the existing template exactly (see
  [LIB-1013](https://linear.app/upfluence/issue/LIB-1013/matching-request-global-citizen)
  as the reference example):

  ```
  ### Before clicking on the "create issue" button

  * Double check if there isn't an existing issue for this import
  * Make sure the CSV file is properly formatted and does not contain trailing lines
  * All the needed information are here

  ### Client info

  * User ID: <User ID>
  * Company ID: <Company ID>
  * Email: [<email>](mailto:<email>)

  ### Checklist

  - [x] File format is correct (<row count> rows, validated automatically)

  File: [<file name>](<link to the Slack file>)

  ### Additional context (if relevant)

  * Matched creators go into List: _to be added once the list is created in Upfluence_

  ## Cookbook

  https://github.com/upfluence/man/blob/master/cookbooks/support/influencer-import.md
  ```

- Before creating, search Linear for an existing open ticket for the same
  client/file to avoid duplicates, per the template's own checklist.

Reply in the thread with the created ticket's link.

## Out of scope

Do not create anything in Upfluence — list creation there stays manual. Once
someone creates the list, they'll add its link to the ticket themselves.
