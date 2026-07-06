#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import quote

SHARE_DIR = Path("/tmp/share-static-html")
ROOT_DIR = SHARE_DIR / "root"
STATE_PATH = SHARE_DIR / "state.json"
MAX_LINK_AGE_SECONDS = 7 * 24 * 60 * 60


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve a static HTML artifact on the Tailscale network.")
    parser.add_argument("path", type=Path, help="HTML file or directory to serve.")
    parser.add_argument("--port", type=int, default=8765, help="Preferred port. Next free port is used if busy.")
    parser.add_argument("--host", help="Bind host. Defaults to `tailscale ip -4`.")
    parser.add_argument("--ttl-days", type=float, default=7, help="Remove share links older than this many days.")
    args = parser.parse_args()

    target = args.path.expanduser().resolve()
    if not target.exists():
        raise SystemExit(f"not found: {target}")

    SHARE_DIR.mkdir(parents=True, exist_ok=True)
    ROOT_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_links(max_age_seconds=max(0, int(args.ttl_days * 24 * 60 * 60)))

    source_dir = target if target.is_dir() else target.parent
    relative = Path("index.html") if target.is_dir() else target.relative_to(source_dir)
    tailscale_host = args.host or tailscale_ip()
    localhost = "127.0.0.1"
    state = load_state()
    local_server = ensure_server(state, "localhost", localhost, args.port)
    tailscale_server = ensure_server(state, "tailscale", tailscale_host, args.port)
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    slug = share_slug(target)
    link = ROOT_DIR / slug
    if link.exists() or link.is_symlink():
        link.unlink()
    link.symlink_to(source_dir, target_is_directory=True)
    os.utime(link, None, follow_symlinks=False)

    local_url = f"http://{localhost}:{local_server['port']}/{quote(slug)}/{quote(relative.as_posix())}"
    tailscale_url = f"http://{tailscale_host}:{tailscale_server['port']}/{quote(slug)}/{quote(relative.as_posix())}"
    print(f"Shared {target}")
    print(f"Local server PID {local_server['pid']}; log {local_server['log_path']}")
    print(f"Tailscale server PID {tailscale_server['pid']}; log {tailscale_server['log_path']}")
    print(f"Local URL: {local_url}")
    print(f"Tailscale URL: {tailscale_url}")
    print(tailscale_url)
    return 0


def tailscale_ip() -> str:
    try:
        result = subprocess.run(
            ["tailscale", "ip", "-4"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise SystemExit("could not get Tailscale IPv4 address with `tailscale ip -4`") from exc
    for line in result.stdout.splitlines():
        value = line.strip()
        if value:
            return value
    raise SystemExit("tailscale returned no IPv4 address")


def free_port(host: str, start: int) -> int:
    for port in range(start, start + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    raise SystemExit(f"no free port found from {start} to {start + 99} on {host}")


def load_state() -> dict:
    try:
        value = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return value if isinstance(value, dict) else {}


def ensure_server(state: dict, name: str, host: str, preferred_port: int) -> dict:
    servers = state.setdefault("servers", {})
    server = servers.get(name) if isinstance(servers.get(name), dict) else {}
    if server_alive(server, host):
        return server
    port = free_port(host, preferred_port)
    pid, log_path = start_server(host, port, name)
    server = {"host": host, "port": port, "pid": pid, "log_path": str(log_path), "root": str(ROOT_DIR)}
    servers[name] = server
    return server


def server_alive(server: dict, host: str) -> bool:
    try:
        pid = int(server.get("pid"))
        port = int(server.get("port"))
    except (TypeError, ValueError):
        return False
    if server.get("host") != host:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.25)
        return sock.connect_ex((host, port)) == 0


def start_server(host: str, port: int, name: str) -> tuple[int, Path]:
    log_path = SHARE_DIR / f"{name}-{port}.log"
    log_file = log_path.open("ab")
    process = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", host],
        cwd=str(ROOT_DIR),
        stdout=log_file,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    time.sleep(0.4)
    if process.poll() is not None:
        raise SystemExit(f"server exited immediately; see {log_path}")
    return process.pid, log_path


def share_slug(target: Path) -> str:
    stem = target.name if target.is_dir() else target.stem
    safe = "".join(ch.lower() if ch.isalnum() else "-" for ch in stem).strip("-") or "html"
    return f"{safe}-{int(time.time())}"


def cleanup_links(max_age_seconds: int) -> None:
    if max_age_seconds == 0:
        return
    cutoff = time.time() - max_age_seconds
    for child in ROOT_DIR.iterdir():
        try:
            stat = child.lstat()
        except OSError:
            continue
        if stat.st_mtime >= cutoff:
            continue
        if child.is_symlink() or child.is_file():
            child.unlink(missing_ok=True)
        elif child.is_dir():
            # The script normally creates symlinks only. Leave real directories alone.
            continue


if __name__ == "__main__":
    raise SystemExit(main())
