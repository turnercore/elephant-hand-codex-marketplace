# Classification Rules

Use these as defaults, then adapt to the user's existing Paperless taxonomy.

## Starter Taxonomy

For an empty Paperless instance, propose this starter set first:

Document types:

- `Invoice`
- `Receipt`
- `Statement`
- `Contract`
- `Policy`
- `Notice`
- `Certificate`
- `Tax Document`

Tags:

- `Needs Review`
- `Inbox`
- `Action Required`
- `Finance`
- `Insurance`
- `Medical`
- `Tax`
- `Housing`
- `Employment`
- `Government`
- `School`
- `Vehicle`
- `Personal`

Create correspondents lazily from actual documents after the issuer is clear. Avoid creating broad correspondents such as `Bank`, `Hospital`, or `Government`.

## Confidence

High confidence:

- Exact issuer appears in document title, logo text, filename, or extracted text.
- Existing correspondent or document type has a clear semantic match.
- Date and amount/account identifiers are visible or encoded in filename.

Medium confidence:

- Filename/folder strongly implies category, but document text is unavailable.
- Multiple possible tags apply but the durable category is clear.

Low confidence:

- Only image content is available and OCR is unavailable.
- More than one existing correspondent is plausible.
- The document appears to contain sensitive legal, medical, tax, identity, or government content and the metadata is not obvious.

For low confidence, upload only with safe minimal metadata when the user approves, and add or request a review tag.

## Triage Tags

Use `Needs Review` for files that require human confirmation after OCR or import. Use `Inbox` only if the user wants a broad intake queue. Use `Action Required` for documents that require payment, signature, response, renewal, cancellation, or another future task.

When triage is complete, remove `Needs Review` or `Inbox` only if:

- The issuer/correspondent is clear.
- The document type is clear.
- Any obvious date, amount, account, or policy fields have been captured.
- The title is specific enough to find later.

## Tagging

Prefer a small set of reusable tags:

- Domain: `Finance`, `Insurance`, `Medical`, `Tax`, `Housing`, `Employment`, `Government`, `School`, `Vehicle`.
- Status: `Needs Review`, `Paid`, `Unpaid`, `Action Required`, `Archived`.
- Time: year tags only when the user already uses them or they improve retrieval.
- Person/project/account tags only when they are durable retrieval facets.

Avoid tags for values better stored as custom fields:

- Invoice number.
- Total amount.
- Account number.
- Due date.
- Policy number.
- Tax year, if a custom field exists for it.

## Correspondent

Use the document issuer/sender. For bank statements, use the bank, not merchants listed in transaction rows. For medical bills, use the provider or insurer based on who issued the document. For forwarded email attachments, use the attachment issuer, not the email forwarder.

## Document Type

Use the most specific existing type that is stable:

- Invoice or Bill: payment request.
- Receipt: proof of payment.
- Statement: periodic account summary.
- Contract or Agreement: signed or governing terms.
- Policy: insurance or service policy document.
- Notice or Letter: general correspondence.
- Certificate: official proof or credential.
- Tax Document: tax filing or reporting artifact.

## Titles

Prefer concise titles that scan well:

```text
<Correspondent> - <Purpose> - <YYYY-MM-DD or YYYY-MM>
```

Examples:

- `Acme Bank - Checking Statement - 2026-04`
- `City Clinic - Visit Invoice - 2026-03-12`
- `Skatteverket - Tax Decision - 2025`
