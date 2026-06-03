#!/usr/bin/env python3
"""Launch the pinned goern/forgejo-mcp server with plugin dotenv support."""

from __future__ import annotations

import hashlib
import os
import platform
from pathlib import Path
import stat
import tarfile
import tempfile
from urllib.request import urlretrieve


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PLUGIN_ROOT / ".env"
PINNED_VERSION = "v2.28.0"
PINNED_RELEASE_VERSION = PINNED_VERSION.removeprefix("v")
DEFAULT_FORGEJO_URL = "https://forge.elephanthand.com"
DEFAULT_USER_AGENT = f"elephant-hand-codex-forgejo/{PINNED_VERSION}"
DOWNLOAD_ROOT = "https://codeberg.org/goern/forgejo-mcp/releases/download"
CACHE_ROOT = PLUGIN_ROOT / ".cache" / "goern-forgejo-mcp" / PINNED_VERSION


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


def require_env(name: str) -> None:
    if not os.environ.get(name, "").strip():
        raise SystemExit(f"Missing required environment variable: {name}")


def release_platform() -> tuple[str, str]:
    system = platform.system().lower()
    machine = platform.machine().lower()
    os_name = {"darwin": "darwin", "linux": "linux"}.get(system)
    arch = {"x86_64": "amd64", "amd64": "amd64", "arm64": "arm64", "aarch64": "arm64"}.get(machine)
    if not os_name or not arch:
        raise SystemExit(f"Unsupported platform for goern/forgejo-mcp release: {system}/{machine}")
    return os_name, arch


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        urlretrieve(url, tmp_path)
        tmp_path.replace(destination)
    finally:
        tmp_path.unlink(missing_ok=True)


def expected_sha256(checksums: Path, archive_name: str) -> str:
    for line in checksums.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) >= 2 and parts[-1] == archive_name:
            return parts[0]
    raise SystemExit(f"Checksum for {archive_name} not found in {checksums}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_extract_binary(archive: Path, destination: Path) -> None:
    with tarfile.open(archive, "r:gz") as tar:
        member = next((item for item in tar.getmembers() if item.name.endswith("/forgejo-mcp")), None)
        if member is None or not member.isfile():
            raise SystemExit(f"forgejo-mcp binary not found in {archive}")
        extracted = tar.extractfile(member)
        if extracted is None:
            raise SystemExit(f"Could not read forgejo-mcp binary from {archive}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as tmp:
            tmp.write(extracted.read())
            tmp_path = Path(tmp.name)
    try:
        tmp_path.chmod(0o755)
        tmp_path.replace(destination)
    finally:
        tmp_path.unlink(missing_ok=True)


def ensure_binary() -> Path:
    os_name, arch = release_platform()
    archive_name = f"forgejo-mcp_{PINNED_RELEASE_VERSION}_{os_name}_{arch}.tar.gz"
    binary_path = CACHE_ROOT / os_name / arch / "forgejo-mcp"
    if binary_path.exists():
        return binary_path

    base = f"{DOWNLOAD_ROOT}/{PINNED_VERSION}"
    archive_path = CACHE_ROOT / archive_name
    checksums_path = CACHE_ROOT / f"forgejo-mcp_{PINNED_RELEASE_VERSION}_checksums.txt"
    download(f"{base}/{archive_name}", archive_path)
    download(f"{base}/{checksums_path.name}", checksums_path)
    expected = expected_sha256(checksums_path, archive_name)
    actual = sha256(archive_path)
    if actual != expected:
        raise SystemExit(f"Checksum mismatch for {archive_name}: expected {expected}, got {actual}")
    safe_extract_binary(archive_path, binary_path)
    return binary_path


def main() -> int:
    load_env_file()
    os.environ.setdefault("FORGEJO_URL", DEFAULT_FORGEJO_URL)
    if not os.environ.get("FORGEJO_ACCESS_TOKEN"):
        os.environ["FORGEJO_ACCESS_TOKEN"] = os.environ.get("FORGEJO_TOKEN", "")
    os.environ.setdefault("FORGEJO_USER_AGENT", DEFAULT_USER_AGENT)
    require_env("FORGEJO_ACCESS_TOKEN")
    binary = ensure_binary()
    os.execv(str(binary), [str(binary), "--transport", "stdio", "--url", os.environ["FORGEJO_URL"]])
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
