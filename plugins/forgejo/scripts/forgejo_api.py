#!/usr/bin/env python3
"""Small Forgejo REST helper for plugin fallback and troubleshooting."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PLUGIN_ROOT / ".env"
DEFAULT_FORGEJO_URL = "https://forge.elephanthand.com"


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


def api_url(base_url: str, path: str, query: dict[str, Any] | None = None) -> str:
    root = base_url.rstrip("/")
    clean_path = path if path.startswith("/") else f"/{path}"
    url = f"{root}/api/v1{clean_path}"
    if query:
        filtered = {k: v for k, v in query.items() if v is not None}
        if filtered:
            url = f"{url}?{urlencode(filtered, doseq=True)}"
    return url


def request_json(
    method: str,
    base_url: str,
    token: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: dict[str, Any] | None = None,
) -> Any:
    data = None
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {token}",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = Request(api_url(base_url, path, query), data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=30) as response:
            raw = response.read()
    except HTTPError as exc:
        message = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Forgejo API error {exc.code}: {message}") from exc
    except URLError as exc:
        raise SystemExit(f"Forgejo API connection error: {exc.reason}") from exc
    if not raw:
        return None
    return json.loads(raw.decode("utf-8"))


def print_json(value: Any, *, compact: bool = False) -> None:
    if compact:
        print(json.dumps(value, separators=(",", ":")))
    else:
        print(json.dumps(value, indent=2, sort_keys=True))


def parse_json_arg(value: str) -> Any:
    if value == "-":
        return json.load(sys.stdin)
    if value.startswith("@"):
        with open(value[1:], "r", encoding="utf-8") as handle:
            return json.load(handle)
    return json.loads(value)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=None, help="Forgejo site root. Defaults to FORGEJO_URL or Elephant Hand Forgejo.")
    parser.add_argument("--token", default=None, help="Forgejo access token. Defaults to FORGEJO_TOKEN.")
    parser.add_argument("--env-file", default=str(DEFAULT_ENV_FILE), help="Dotenv file to load before environment variables.")
    parser.add_argument("--raw", action="store_true", help="Print compact JSON.")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("user", help="Show the authenticated user.")
    sub.add_parser("version", help="Show the Forgejo server version.")

    repos = sub.add_parser("repos", help="List repositories for the authenticated user.")
    repos.add_argument("--page", type=int, default=1)
    repos.add_argument("--limit", type=int, default=30)

    search = sub.add_parser("search-repos", help="Search repositories.")
    search.add_argument("query")
    search.add_argument("--page", type=int, default=1)
    search.add_argument("--limit", type=int, default=30)

    repo = sub.add_parser("repo", help="Get one repository.")
    repo.add_argument("owner")
    repo.add_argument("repo")

    issues = sub.add_parser("issues", help="List repository issues.")
    issues.add_argument("owner")
    issues.add_argument("repo")
    issues.add_argument("--state", default="open", choices=["open", "closed", "all"])
    issues.add_argument("--page", type=int, default=1)
    issues.add_argument("--limit", type=int, default=30)

    pulls = sub.add_parser("pulls", help="List repository pull requests.")
    pulls.add_argument("owner")
    pulls.add_argument("repo")
    pulls.add_argument("--state", default="open", choices=["open", "closed", "all"])
    pulls.add_argument("--page", type=int, default=1)
    pulls.add_argument("--limit", type=int, default=30)

    create_issue = sub.add_parser("create-issue", help="Create a repository issue.")
    create_issue.add_argument("owner")
    create_issue.add_argument("repo")
    create_issue.add_argument("title")
    create_issue.add_argument("--body", default="")
    create_issue.add_argument("--labels", nargs="*", type=int, default=None, help="Numeric label IDs.")

    comment = sub.add_parser("comment", help="Add a comment to an issue or pull request.")
    comment.add_argument("owner")
    comment.add_argument("repo")
    comment.add_argument("index", type=int)
    comment.add_argument("body")

    raw = sub.add_parser("raw", help="Call a raw /api/v1 path.")
    raw.add_argument("method", choices=["GET", "POST", "PATCH", "PUT", "DELETE"])
    raw.add_argument("path", help="Path under /api/v1, for example /repos/owner/repo")
    raw.add_argument("--body", help="JSON body, @file, or - for stdin.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    load_env_file(Path(args.env_file))
    base_url = args.base_url or os.environ.get("FORGEJO_URL") or DEFAULT_FORGEJO_URL
    token = args.token or os.environ.get("FORGEJO_TOKEN")
    if not token:
        raise SystemExit("Missing Forgejo token. Set FORGEJO_TOKEN or pass --token.")

    if args.command == "user":
        result = request_json("GET", base_url, token, "/user")
    elif args.command == "version":
        result = request_json("GET", base_url, token, "/version")
    elif args.command == "repos":
        result = request_json("GET", base_url, token, "/user/repos", query={"page": args.page, "limit": args.limit})
    elif args.command == "search-repos":
        result = request_json("GET", base_url, token, "/repos/search", query={"q": args.query, "page": args.page, "limit": args.limit})
    elif args.command == "repo":
        result = request_json("GET", base_url, token, f"/repos/{args.owner}/{args.repo}")
    elif args.command == "issues":
        result = request_json("GET", base_url, token, f"/repos/{args.owner}/{args.repo}/issues", query={"state": args.state, "page": args.page, "limit": args.limit})
    elif args.command == "pulls":
        result = request_json("GET", base_url, token, f"/repos/{args.owner}/{args.repo}/pulls", query={"state": args.state, "page": args.page, "limit": args.limit})
    elif args.command == "create-issue":
        body = {"title": args.title, "body": args.body}
        if args.labels is not None:
            body["labels"] = args.labels
        result = request_json("POST", base_url, token, f"/repos/{args.owner}/{args.repo}/issues", body=body)
    elif args.command == "comment":
        result = request_json("POST", base_url, token, f"/repos/{args.owner}/{args.repo}/issues/{args.index}/comments", body={"body": args.body})
    elif args.command == "raw":
        result = request_json(args.method, base_url, token, args.path, body=parse_json_arg(args.body) if args.body else None)
    else:
        parser.error(f"Unsupported command: {args.command}")

    print_json(result, compact=args.raw)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
