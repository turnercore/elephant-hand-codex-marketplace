# Paperless-ngx API Notes

Current docs: https://docs.paperless-ngx.com/api/

Use token auth:

```text
Authorization: Token <token>
Accept: application/json; version=9
```

Core endpoints:

- `GET /api/documents/`: list/search documents.
- `GET /api/documents/{id}/`: retrieve a document after ingestion.
- `PATCH /api/documents/{id}/`: update document metadata such as title, created date, correspondent, document type, tags, storage path, and custom fields.
- `GET /api/documents/{id}/download/`: download the original or archive file.
- `POST /api/documents/post_document/`: upload a file as multipart form field `document`.
- `GET /api/tasks/?task_id={uuid}`: inspect asynchronous consumption status.
- `GET /api/tags/`, `/api/correspondents/`, `/api/document_types/`, `/api/storage_paths/`, `/api/custom_fields/`: inventory taxonomy objects.

Upload fields accepted by `post_document` include `title`, `created`, `correspondent`, `document_type`, `storage_path`, repeated `tags`, `archive_serial_number`, and `custom_fields`.

`custom_fields` can be either a list of custom field IDs or an object mapping custom field ID to value. For select custom fields in current API versions, use the select option ID as the value.

The upload endpoint returns a task UUID when consumption starts. The final document ID is available only after the asynchronous task completes successfully.

For searching, use `/api/documents/?query=<terms>`. Returned documents may include content and search hit details depending on server configuration and API version. Treat full document content as sensitive and avoid echoing it unnecessarily.

API versioning is controlled through the `Accept` header. Current docs list version 9, where document `created` is a date value and `created_date` is deprecated.
