---
name: paperless
description: Work with a Paperless-ngx server for document operations. Use when Codex needs to upload local scans, PDFs, images, and other documents; search or look up Paperless documents; download or inspect files; triage unreviewed documents; classify content; choose, create after approval, verify, or update tags, correspondents, document types, storage paths, created dates, titles, archive serial numbers, or custom fields; poll ingestion tasks; or configure Paperless API access without storing secrets in the skill.
---

# Paperless

## Core Rules

Never store Paperless tokens, URLs, or personal document metadata in this skill folder. Read credentials from `PAPERLESS_URL` and `PAPERLESS_TOKEN`, or from a user-owned config outside the skill such as `~/.config/paperless-codex/config.json`.

Prefer existing Paperless taxonomy over creating new tags, correspondents, document types, storage paths, or custom fields. Ask before creating or renaming taxonomy objects.

Treat financial, medical, legal, tax, identity, and government documents as sensitive. Avoid pasting full document text into replies; summarize only the metadata decisions and operational result.

Do not upload if classification confidence is low and the user asked for automatic filing. Use an explicit review tag such as `Needs Review` only if it already exists or the user approved creating it.

If the Paperless taxonomy is empty, propose a starter taxonomy before uploading. Do not create it until the user approves the concrete list of tags and document types.

Use Paperless title metadata for "renaming" documents already in Paperless. Rename local files only when the user explicitly asks to change local filenames.

## Upload Workflow

1. Confirm credentials are available:
   - Run `scripts/paperless_api.py check`.
   - If credentials are missing, ask the user to provide the server URL and API token via environment variables or a local config file. Do not ask them to paste secrets unless needed for the immediate session.
2. Inventory the Paperless taxonomy:
   - Run `scripts/paperless_api.py list-metadata --out /tmp/paperless-metadata.json`.
   - Use existing names and IDs exactly. Read `references/api.md` if endpoint details matter.
   - If the inventory is empty, read `references/classification-rules.md` and propose a small starter set.
3. Inspect local files before upload:
   - Use filenames, parent folders, PDF text extraction, image OCR if available, and nearby context.
   - For scans where text is unavailable locally, classify conservatively from filename/folder and let Paperless OCR finish before final review.
4. Decide metadata:
   - Title: short human-readable title, usually `Correspondent - Purpose - YYYY-MM-DD` without redundant file extensions.
   - Created date: use the document date when visible; otherwise use filename/folder date; otherwise omit and let Paperless infer.
   - Correspondent: issuer/sender of the document, not every named entity in the document.
   - Document type: category such as invoice, receipt, statement, contract, letter, certificate, tax document.
   - Tags: durable retrieval facets, not one-off details. Prefer tags for status, account/domain, year, project, household member, and review needs.
   - Custom fields: structured values such as invoice number, account number, due date, total amount, tax year, policy number.
5. Upload with metadata:
   - Create a JSON metadata file.
   - Run `scripts/paperless_api.py upload <file> --metadata-json <metadata.json> --wait`.
6. Verify:
   - Poll the task until it succeeds or fails.
   - If a document ID is returned, fetch the document and verify assigned metadata.
   - Report uploaded files, task status, document IDs, and any items needing review.

## Search And Lookup Workflow

1. Run `scripts/paperless_api.py search --query "<terms>" --limit 10`.
2. Use returned IDs, titles, dates, correspondents, document types, and tags to narrow the result.
3. Run `scripts/paperless_api.py get <document_id>` for the selected document metadata.
4. Only when the answer requires OCR text, run `scripts/paperless_api.py get <document_id> --include-content`.
5. If the user needs the original file, run `scripts/paperless_api.py download <document_id> --out <path>`.
6. Quote only short relevant excerpts from document content. For sensitive documents, summarize the answer and cite the Paperless document ID/title.

## Triage Workflow

Use triage when the user asks to process unreviewed, inbox, uncategorized, recently uploaded, or messy Paperless documents.

1. Search for the triage set:
   - Prefer an existing status tag such as `Needs Review`, `Inbox`, or `Action Required`.
   - If no triage tag exists, search recent documents or documents with missing metadata.
2. For each candidate, fetch the document with `scripts/paperless_api.py get <id>`.
3. Decide the corrected title, created date, correspondent, document type, tags, and custom fields.
4. Apply updates with `scripts/paperless_api.py update <id> --metadata-json <metadata.json>`.
5. Remove triage/status tags only when the classification is high confidence or the user approved the change.
6. Report each processed document by ID/title and list any documents left for manual review.

## Metadata JSON

Use names or IDs. The helper resolves names against the live Paperless taxonomy.

```json
{
  "title": "Acme Bank - Checking Statement - 2026-04",
  "created": "2026-04-30",
  "correspondent": "Acme Bank",
  "document_type": "Statement",
  "storage_path": "Finance/Banking",
  "tags": ["Finance", "Banking", "2026"],
  "custom_fields": {
    "Account Number": "1234",
    "Statement Period": "2026-04"
  }
}
```

If a name does not resolve, stop and ask whether to create it, choose another existing object, or upload without that metadata.

## Commands

Run helper commands from the skill folder:

```bash
python3 scripts/paperless_api.py check
python3 scripts/paperless_api.py list-metadata --out /tmp/paperless-metadata.json
python3 scripts/paperless_api.py create-object tag "Needs Review"
python3 scripts/paperless_api.py create-object document-type "Statement"
python3 scripts/paperless_api.py search --query "insurance policy" --limit 10 --ordering=-created
python3 scripts/paperless_api.py get 123
python3 scripts/paperless_api.py get 123 --include-content
python3 scripts/paperless_api.py download 123 --out /tmp/paperless-123.pdf
python3 scripts/paperless_api.py update 123 --metadata-json /tmp/document.metadata.json
python3 scripts/paperless_api.py upload /path/to/scan.pdf --metadata-json /tmp/scan.metadata.json --wait
python3 scripts/paperless_api.py task <task_uuid>
```

Credential config file format:

```json
{
  "url": "https://paperless.example.com",
  "token": "paperless-api-token"
}
```

Store that at `~/.config/paperless-codex/config.json` with mode `600`, or set environment variables for the current shell.

## References

- Read `references/api.md` when changing API calls or debugging server behavior.
- Read `references/classification-rules.md` when designing or revising tagging rules.
