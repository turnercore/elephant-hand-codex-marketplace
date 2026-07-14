#!/usr/bin/env python3
"""Small Paperless-ngx API helper for Codex skills."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import time
import uuid
from pathlib import Path
from typing import Any
from urllib import error, parse, request


CONFIG_PATH = Path.home() / ".config" / "paperless-codex" / "config.json"
API_ACCEPT = "application/json; version=9"


def load_config() -> tuple[str, str]:
    url = os.environ.get("PAPERLESS_URL")
    token = os.environ.get("PAPERLESS_TOKEN")
    if (not url or not token) and CONFIG_PATH.exists():
        data = json.loads(CONFIG_PATH.read_text())
        url = url or data.get("url")
        token = token or data.get("token")
    if not url or not token:
        raise SystemExit(
            "Missing credentials. Set PAPERLESS_URL and PAPERLESS_TOKEN, "
            f"or create {CONFIG_PATH}."
        )
    return url.rstrip("/"), token


def api_request(
    method: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: bytes | None = None,
    headers: dict[str, str] | None = None,
) -> tuple[Any, dict[str, str]]:
    base_url, token = load_config()
    url = base_url + path
    if query:
        url += "?" + parse.urlencode(query, doseq=True)
    all_headers = {
        "Authorization": f"Token {token}",
        "Accept": API_ACCEPT,
    }
    if headers:
        all_headers.update(headers)
    req = request.Request(url, data=body, headers=all_headers, method=method)
    try:
        with request.urlopen(req, timeout=60) as resp:
            raw = resp.read()
            response_headers = dict(resp.headers.items())
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"HTTP {exc.code} {exc.reason}: {detail}") from exc
    except error.URLError as exc:
        raise SystemExit(f"Connection failed: {exc}") from exc

    if not raw:
        return None, response_headers
    text = raw.decode("utf-8", errors="replace")
    try:
        return json.loads(text), response_headers
    except json.JSONDecodeError:
        return text.strip(), response_headers


def api_json(method: str, path: str, payload: dict[str, Any]) -> Any:
    body = json.dumps(payload).encode()
    data, _ = api_request(
        method,
        path,
        body=body,
        headers={"Content-Type": "application/json"},
    )
    return data


def api_bytes(path: str) -> tuple[bytes, dict[str, str]]:
    base_url, token = load_config()
    req = request.Request(
        base_url + path,
        headers={
            "Authorization": f"Token {token}",
            "Accept": "*/*",
        },
        method="GET",
    )
    try:
        with request.urlopen(req, timeout=120) as resp:
            return resp.read(), dict(resp.headers.items())
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"HTTP {exc.code} {exc.reason}: {detail}") from exc
    except error.URLError as exc:
        raise SystemExit(f"Connection failed: {exc}") from exc


def collect_paginated(path: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    page = 1
    while True:
        data, _ = api_request("GET", path, query={"page": page, "page_size": 100})
        if isinstance(data, dict) and "results" in data:
            items.extend(data["results"])
            if not data.get("next"):
                return items
            page += 1
            continue
        if isinstance(data, list):
            return data
        raise SystemExit(f"Unexpected response from {path}: {data!r}")


def object_label(obj: dict[str, Any]) -> str:
    for key in ("name", "title", "slug"):
        value = obj.get(key)
        if value:
            return str(value)
    return str(obj.get("id"))


def metadata_inventory() -> dict[str, list[dict[str, Any]]]:
    endpoints = {
        "tags": "/api/tags/",
        "correspondents": "/api/correspondents/",
        "document_types": "/api/document_types/",
        "storage_paths": "/api/storage_paths/",
        "custom_fields": "/api/custom_fields/",
    }
    return {key: collect_paginated(path) for key, path in endpoints.items()}


def resolve_one(value: Any, objects: list[dict[str, Any]], field_name: str) -> int:
    if value is None or value == "":
        raise SystemExit(f"{field_name} cannot be empty")
    if isinstance(value, int) or (isinstance(value, str) and value.isdigit()):
        return int(value)
    wanted = str(value).strip().casefold()
    matches = [
        obj for obj in objects
        if object_label(obj).strip().casefold() == wanted
        or str(obj.get("slug", "")).strip().casefold() == wanted
    ]
    if len(matches) == 1:
        return int(matches[0]["id"])
    if not matches:
        known = ", ".join(sorted(object_label(obj) for obj in objects)[:30])
        raise SystemExit(f"Unknown {field_name} {value!r}. Known examples: {known}")
    raise SystemExit(f"Ambiguous {field_name} {value!r}: {matches!r}")


def normalize_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    inventory = metadata_inventory()
    normalized: dict[str, Any] = {}
    passthrough = ("title", "created", "archive_serial_number")
    for key in passthrough:
        if metadata.get(key) not in (None, ""):
            normalized[key] = metadata[key]

    mappings = {
        "correspondent": "correspondents",
        "document_type": "document_types",
        "storage_path": "storage_paths",
    }
    for key, inventory_key in mappings.items():
        if metadata.get(key) not in (None, ""):
            normalized[key] = resolve_one(metadata[key], inventory[inventory_key], key)

    tags = metadata.get("tags") or []
    if isinstance(tags, (str, int)):
        tags = [tags]
    if tags:
        normalized["tags"] = [
            resolve_one(tag, inventory["tags"], "tag") for tag in tags
        ]

    custom_fields = metadata.get("custom_fields") or {}
    if isinstance(custom_fields, list):
        normalized["custom_fields"] = [
            resolve_one(field, inventory["custom_fields"], "custom field")
            for field in custom_fields
        ]
    elif isinstance(custom_fields, dict) and custom_fields:
        resolved_fields: dict[str, Any] = {}
        for field, value in custom_fields.items():
            field_id = resolve_one(field, inventory["custom_fields"], "custom field")
            resolved_fields[str(field_id)] = value
        normalized["custom_fields"] = resolved_fields
    elif custom_fields:
        raise SystemExit("custom_fields must be an object or list")
    return normalized


def compact_document(doc: dict[str, Any], *, include_content: bool = False) -> dict[str, Any]:
    keys = (
        "id",
        "title",
        "created",
        "correspondent",
        "document_type",
        "storage_path",
        "tags",
        "archive_serial_number",
        "original_filename",
        "mime_type",
    )
    compact = {key: doc.get(key) for key in keys if key in doc}
    content = doc.get("content")
    if include_content and isinstance(content, str) and content:
        compact["content_excerpt"] = content[:1000]
        compact["content_length"] = len(content)
    if "__search_hit__" in doc:
        hit = doc["__search_hit__"]
        if include_content:
            compact["search_hit"] = hit
        elif isinstance(hit, dict):
            compact["search_hit"] = {
                key: hit.get(key) for key in ("rank", "score") if key in hit
            }
    return compact


def multipart_body(file_path: Path, metadata: dict[str, Any]) -> tuple[bytes, str]:
    boundary = "----paperless-codex-" + uuid.uuid4().hex
    chunks: list[bytes] = []

    def add_field(name: str, value: Any) -> None:
        chunks.append(f"--{boundary}\r\n".encode())
        chunks.append(
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        )
        if isinstance(value, (dict, list)):
            chunks.append(json.dumps(value).encode())
        else:
            chunks.append(str(value).encode())
        chunks.append(b"\r\n")

    for key, value in metadata.items():
        if key == "tags" and isinstance(value, list):
            for tag_id in value:
                add_field("tags", tag_id)
        else:
            add_field(key, value)

    mime = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    chunks.append(f"--{boundary}\r\n".encode())
    chunks.append(
        (
            f'Content-Disposition: form-data; name="document"; '
            f'filename="{file_path.name}"\r\n'
            f"Content-Type: {mime}\r\n\r\n"
        ).encode()
    )
    chunks.append(file_path.read_bytes())
    chunks.append(b"\r\n")
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), boundary


def cmd_check(_: argparse.Namespace) -> None:
    data, headers = api_request("GET", "/api/documents/", query={"page_size": 1})
    print(json.dumps({
        "ok": True,
        "server_version": headers.get("X-Version"),
        "api_version": headers.get("X-Api-Version"),
        "document_count": data.get("count") if isinstance(data, dict) else None,
    }, indent=2))


def cmd_list_metadata(args: argparse.Namespace) -> None:
    data = metadata_inventory()
    text = json.dumps(data, indent=2, sort_keys=True)
    if args.out:
        Path(args.out).write_text(text + "\n")
        print(args.out)
    else:
        print(text)


def cmd_create_object(args: argparse.Namespace) -> None:
    endpoints = {
        "tag": "/api/tags/",
        "correspondent": "/api/correspondents/",
        "document-type": "/api/document_types/",
        "storage-path": "/api/storage_paths/",
    }
    endpoint = endpoints[args.kind]
    payload: dict[str, Any] = {"name": args.name}
    if args.kind == "storage-path":
        payload["path"] = args.path or args.name
    data = api_json("POST", endpoint, payload)
    print(json.dumps(data, indent=2, sort_keys=True))


def cmd_search(args: argparse.Namespace) -> None:
    query: dict[str, Any] = {"page_size": args.limit}
    if args.query:
        query["query"] = args.query
    if args.ordering:
        query["ordering"] = args.ordering
    data, _ = api_request("GET", "/api/documents/", query=query)
    if not isinstance(data, dict):
        print(json.dumps(data, indent=2, sort_keys=True))
        return
    results = data.get("results", [])
    output = {
        "count": data.get("count"),
        "results": [
            compact_document(doc, include_content=args.include_content)
            if isinstance(doc, dict) else doc
            for doc in results
        ],
    }
    text = json.dumps(output, indent=2, sort_keys=True)
    if args.out:
        Path(args.out).write_text(text + "\n")
        print(args.out)
    else:
        print(text)


def cmd_get(args: argparse.Namespace) -> None:
    data, _ = api_request("GET", f"/api/documents/{args.document_id}/")
    output = data if args.full else compact_document(data, include_content=args.include_content)
    text = json.dumps(output, indent=2, sort_keys=True)
    if args.out:
        Path(args.out).write_text(text + "\n")
        print(args.out)
    else:
        print(text)


def cmd_update(args: argparse.Namespace) -> None:
    metadata = json.loads(Path(args.metadata_json).read_text())
    normalized = normalize_metadata(metadata)
    data = api_json("PATCH", f"/api/documents/{args.document_id}/", normalized)
    print(json.dumps(compact_document(data), indent=2, sort_keys=True))


def cmd_download(args: argparse.Namespace) -> None:
    data, headers = api_bytes(f"/api/documents/{args.document_id}/download/")
    out = Path(args.out).expanduser().resolve()
    if out.is_dir():
        disposition = headers.get("Content-Disposition", "")
        filename = f"paperless-{args.document_id}"
        marker = "filename="
        if marker in disposition:
            filename = disposition.split(marker, 1)[1].strip().strip('"')
        out = out / filename
    out.write_bytes(data)
    print(json.dumps({
        "document_id": args.document_id,
        "out": str(out),
        "bytes": len(data),
        "content_type": headers.get("Content-Type"),
    }, indent=2, sort_keys=True))


def cmd_upload(args: argparse.Namespace) -> None:
    file_path = Path(args.file).expanduser().resolve()
    if not file_path.exists() or not file_path.is_file():
        raise SystemExit(f"Not a file: {file_path}")
    metadata: dict[str, Any] = {}
    if args.metadata_json:
        metadata = json.loads(Path(args.metadata_json).read_text())
    normalized = normalize_metadata(metadata)
    body, boundary = multipart_body(file_path, normalized)
    task_id, _ = api_request(
        "POST",
        "/api/documents/post_document/",
        body=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    result = {"file": str(file_path), "task_id": task_id, "metadata": normalized}
    if args.wait:
        result["task"] = wait_for_task(str(task_id), args.timeout)
    print(json.dumps(result, indent=2, sort_keys=True))


def task_data(task_id: str) -> Any:
    data, _ = api_request("GET", "/api/tasks/", query={"task_id": task_id})
    if isinstance(data, dict) and "results" in data:
        if data["results"]:
            return data["results"][0]
        return {"task_id": task_id, "status": "not_found"}
    return data


def wait_for_task(task_id: str, timeout: int) -> Any:
    deadline = time.time() + timeout
    last: Any = None
    while time.time() < deadline:
        last = task_data(task_id)
        status = str(last.get("status", "") if isinstance(last, dict) else "").upper()
        if status in {"SUCCESS", "FAILURE", "REVOKED"}:
            return last
        time.sleep(3)
    return {"task_id": task_id, "status": "timeout", "last": last}


def cmd_task(args: argparse.Namespace) -> None:
    data = wait_for_task(args.task_id, args.timeout) if args.wait else task_data(args.task_id)
    print(json.dumps(data, indent=2, sort_keys=True))


def main() -> None:
    parser = argparse.ArgumentParser(description="Paperless-ngx API helper")
    sub = parser.add_subparsers(required=True)

    check = sub.add_parser("check", help="Verify credentials and server access")
    check.set_defaults(func=cmd_check)

    meta = sub.add_parser("list-metadata", help="Fetch tags, correspondents, types, paths, fields")
    meta.add_argument("--out", help="Write JSON inventory to this path")
    meta.set_defaults(func=cmd_list_metadata)

    create = sub.add_parser("create-object", help="Create an approved taxonomy object")
    create.add_argument("kind", choices=["tag", "correspondent", "document-type", "storage-path"])
    create.add_argument("name")
    create.add_argument("--path", help="Storage path pattern when kind is storage-path")
    create.set_defaults(func=cmd_create_object)

    search = sub.add_parser("search", help="Search Paperless documents")
    search.add_argument("--query", default="", help="Full text search query")
    search.add_argument("--limit", type=int, default=10)
    search.add_argument("--ordering", help="Paperless ordering parameter, e.g. -created")
    search.add_argument("--out", help="Write compact search results to this path")
    search.add_argument("--include-content", action="store_true", help="Include OCR excerpts")
    search.set_defaults(func=cmd_search)

    get = sub.add_parser("get", help="Fetch one Paperless document")
    get.add_argument("document_id", type=int)
    get.add_argument("--full", action="store_true", help="Print full API response")
    get.add_argument("--include-content", action="store_true", help="Include OCR excerpt")
    get.add_argument("--out", help="Write JSON to this path")
    get.set_defaults(func=cmd_get)

    update = sub.add_parser("update", help="Patch metadata for one Paperless document")
    update.add_argument("document_id", type=int)
    update.add_argument("--metadata-json", required=True)
    update.set_defaults(func=cmd_update)

    download = sub.add_parser("download", help="Download one Paperless document")
    download.add_argument("document_id", type=int)
    download.add_argument("--out", required=True, help="Output file or directory")
    download.set_defaults(func=cmd_download)

    upload = sub.add_parser("upload", help="Upload a document")
    upload.add_argument("file")
    upload.add_argument("--metadata-json", help="Metadata JSON with names or IDs")
    upload.add_argument("--wait", action="store_true", help="Poll task until completion")
    upload.add_argument("--timeout", type=int, default=300)
    upload.set_defaults(func=cmd_upload)

    task = sub.add_parser("task", help="Inspect a consume task")
    task.add_argument("task_id")
    task.add_argument("--wait", action="store_true")
    task.add_argument("--timeout", type=int, default=300)
    task.set_defaults(func=cmd_task)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
