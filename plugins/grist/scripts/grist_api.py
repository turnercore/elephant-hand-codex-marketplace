#!/usr/bin/env python3
"""Small Grist REST API helper for Codex plugin workflows."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any, Union
import urllib.error
import urllib.parse
import urllib.request


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PLUGIN_ROOT / ".env"
JSONValue = Union[dict[str, Any], list[Any], str, int, float, bool, None]


def load_env_file(path: Path = DEFAULT_ENV_FILE) -> None:
    if not path.exists():
        return
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & (stat.S_IRWXG | stat.S_IRWXO):
        raise SystemExit(f"Refusing to load {path}; expected permissions 0600")
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def quote_path(value: str | int) -> str:
    return urllib.parse.quote(str(value), safe="")


def load_payload(value: str | None) -> JSONValue:
    if value is None:
        return None
    if value == "-":
        return json.load(sys.stdin)
    if value.startswith("@"):
        with open(value[1:], "r", encoding="utf-8") as fh:
            return json.load(fh)
    return json.loads(value)


def encode_query(params: dict[str, Any]) -> str:
    clean = {key: value for key, value in params.items() if value is not None}
    if not clean:
        return ""
    return "?" + urllib.parse.urlencode(clean)


def records_payload(value: JSONValue, *, update: bool = False) -> dict[str, Any]:
    if isinstance(value, dict) and isinstance(value.get("records"), list):
        return value
    if not isinstance(value, list):
        raise SystemExit("Record payload must be a list or an object with a records array")
    if update:
        return {"records": value}
    return {"records": [{"fields": fields} for fields in value]}


def delete_payload(ids: list[int] | None, value: JSONValue) -> dict[str, Any]:
    if ids:
        return {"records": [{"id": row_id} for row_id in ids]}
    if isinstance(value, dict) and isinstance(value.get("records"), list):
        return value
    if isinstance(value, list):
        return {"records": [{"id": row_id} if isinstance(row_id, int) else row_id for row_id in value]}
    raise SystemExit("Delete payload must be --ids, a JSON id list, or an object with a records array")


def request(method: str, path: str, body: JSONValue = None, *, timeout: int = 30) -> JSONValue:
    base_url = env("GRIST_BASE_URL").rstrip("/")
    api_key = env("GRIST_API_KEY")
    url = f"{base_url}/api/{path.lstrip('/')}"
    data = None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "X-Grist-Client": "codex-local-grist-plugin",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = resp.read().decode("utf-8")
            content_type = resp.headers.get("Content-Type", "")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"HTTP {exc.code} for {method} {url}\n{detail}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Connection failed for {method} {url}: {exc.reason}") from exc
    if not payload:
        return {}
    if "json" not in content_type.lower():
        return {"text": payload}
    return json.loads(payload)


def print_json(value: JSONValue, raw: bool) -> None:
    if raw:
        print(json.dumps(value, separators=(",", ":")))
    else:
        print(json.dumps(value, indent=2, sort_keys=True))


def maybe_dry_run(method: str, path: str, body: JSONValue, dry_run: bool) -> JSONValue | None:
    if not dry_run:
        return None
    return {"dry_run": True, "method": method, "path": path, "body": body}


def inspect_doc(doc_id: str, sample_size: int, timeout: int) -> dict[str, Any]:
    tables = request("GET", f"docs/{quote_path(doc_id)}/tables", timeout=timeout)
    table_items = tables.get("tables", []) if isinstance(tables, dict) else []
    inspected: list[dict[str, Any]] = []
    for table in table_items:
        table_id = table.get("id") if isinstance(table, dict) else None
        if not table_id:
            continue
        records = request(
            "GET",
            f"docs/{quote_path(doc_id)}/tables/{quote_path(table_id)}/records"
            + encode_query({"limit": sample_size}),
            timeout=timeout,
        )
        inspected.append({"table": table, "sample": records})
    return {"doc_id": doc_id, "tables": inspected}


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--raw", action="store_true", help="Print compact JSON.")
    parser.add_argument("--timeout", type=int, default=30, help="HTTP timeout in seconds.")
    parser.add_argument(
        "--env-file",
        type=Path,
        default=DEFAULT_ENV_FILE,
        help="Dotenv file to load before reading GRIST_* environment variables.",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Call the Grist REST API.")
    add_common_args(parser)
    sub = parser.add_subparsers(dest="cmd", required=True)
    common_options = argparse.ArgumentParser(add_help=False)
    add_common_args(common_options)

    def command(name: str, **kwargs: Any) -> argparse.ArgumentParser:
        return sub.add_parser(name, parents=[common_options], **kwargs)

    command("orgs", help="List accessible orgs.")

    workspaces = command("workspaces", help="List org workspaces.")
    workspaces.add_argument("org_id")

    docs = command("docs", help="List workspace docs.")
    docs.add_argument("workspace_id")

    tables = command("tables", help="List document tables.")
    tables.add_argument("doc_id")

    records = command("records", help="List table records.")
    records.add_argument("doc_id")
    records.add_argument("table_id")
    records.add_argument("--limit", type=int)
    records.add_argument("--sort", help="Grist sort expression.")
    records.add_argument("--filter-json", help="Grist filter JSON object.")

    sql = command("sql", help="Run SQL against a document.")
    sql.add_argument("doc_id")
    sql.add_argument("sql")

    inspect = command("inspect", help="List tables and sample records from each table.")
    inspect.add_argument("doc_id")
    inspect.add_argument("--sample-size", type=int, default=3)

    add_records = command("add-records", help="Add records from JSON fields list or records payload.")
    add_records.add_argument("doc_id")
    add_records.add_argument("table_id")
    add_records.add_argument("json_payload", help="JSON string, @file, or - for stdin.")
    add_records.add_argument("--dry-run", action="store_true")

    update_records = command("update-records", help="Update records from JSON records payload.")
    update_records.add_argument("doc_id")
    update_records.add_argument("table_id")
    update_records.add_argument("json_payload", help="JSON string, @file, or - for stdin.")
    update_records.add_argument("--dry-run", action="store_true")

    delete_records = command("delete-records", help="Delete records by ids or JSON records payload.")
    delete_records.add_argument("doc_id")
    delete_records.add_argument("table_id")
    delete_records.add_argument("json_payload", nargs="?", help="JSON string, @file, or - for stdin.")
    delete_records.add_argument("--ids", nargs="+", type=int)
    delete_records.add_argument("--dry-run", action="store_true")

    create_doc = command("create-doc", help="Create a document in a workspace.")
    create_doc.add_argument("workspace_id")
    create_doc.add_argument("name")
    create_doc.add_argument("--dry-run", action="store_true")

    api = command("api", help="Call an arbitrary API path.")
    api.add_argument("method", choices=["GET", "POST", "PUT", "PATCH", "DELETE"])
    api.add_argument("path")
    api.add_argument("--json", dest="json_payload", help="JSON string, @file, or - for stdin.")
    api.add_argument("--dry-run", action="store_true")

    args = parser.parse_args()
    load_env_file(args.env_file)

    if args.cmd == "orgs":
        result = request("GET", "orgs", timeout=args.timeout)
    elif args.cmd == "workspaces":
        result = request("GET", f"orgs/{quote_path(args.org_id)}/workspaces", timeout=args.timeout)
    elif args.cmd == "docs":
        result = request("GET", f"workspaces/{quote_path(args.workspace_id)}/docs", timeout=args.timeout)
    elif args.cmd == "tables":
        result = request("GET", f"docs/{quote_path(args.doc_id)}/tables", timeout=args.timeout)
    elif args.cmd == "records":
        query = encode_query(
            {"limit": args.limit, "sort": args.sort, "filter": args.filter_json}
        )
        path = f"docs/{quote_path(args.doc_id)}/tables/{quote_path(args.table_id)}/records{query}"
        result = request("GET", path, timeout=args.timeout)
    elif args.cmd == "sql":
        result = request("POST", f"docs/{quote_path(args.doc_id)}/sql", {"sql": args.sql}, timeout=args.timeout)
    elif args.cmd == "inspect":
        result = inspect_doc(args.doc_id, args.sample_size, args.timeout)
    elif args.cmd == "add-records":
        body = records_payload(load_payload(args.json_payload))
        path = f"docs/{quote_path(args.doc_id)}/tables/{quote_path(args.table_id)}/records"
        result = maybe_dry_run("POST", path, body, args.dry_run) or request("POST", path, body, timeout=args.timeout)
    elif args.cmd == "update-records":
        body = records_payload(load_payload(args.json_payload), update=True)
        path = f"docs/{quote_path(args.doc_id)}/tables/{quote_path(args.table_id)}/records"
        result = maybe_dry_run("PATCH", path, body, args.dry_run) or request("PATCH", path, body, timeout=args.timeout)
    elif args.cmd == "delete-records":
        body = delete_payload(args.ids, load_payload(args.json_payload))
        path = f"docs/{quote_path(args.doc_id)}/tables/{quote_path(args.table_id)}/records"
        result = maybe_dry_run("DELETE", path, body, args.dry_run) or request("DELETE", path, body, timeout=args.timeout)
    elif args.cmd == "create-doc":
        body = {"name": args.name}
        path = f"workspaces/{quote_path(args.workspace_id)}/docs"
        result = maybe_dry_run("POST", path, body, args.dry_run) or request("POST", path, body, timeout=args.timeout)
    elif args.cmd == "api":
        body = load_payload(args.json_payload)
        result = maybe_dry_run(args.method, args.path, body, args.dry_run) or request(
            args.method, args.path, body, timeout=args.timeout
        )
    else:
        parser.error(f"unknown command {args.cmd}")

    print_json(result, args.raw)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
