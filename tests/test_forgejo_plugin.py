from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]


def _load_script(name: str):
    path = ROOT / "plugins" / "forgejo" / "scripts" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(f"test_{name}", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _write_env(path: Path, token: str) -> None:
    path.write_text(
        "FORGEJO_URL=https://forge.example.test\n"
        f"FORGEJO_ACCESS_TOKEN={token}\n",
        encoding="utf-8",
    )
    path.chmod(0o600)


def test_rest_helper_uses_stable_user_credentials(monkeypatch, tmp_path, capsys):
    helper = _load_script("forgejo_api")
    user_env = tmp_path / "user.env"
    plugin_env = tmp_path / "plugin.env"
    _write_env(user_env, "stable-token")
    _write_env(plugin_env, "plugin-token")
    helper.USER_ENV_FILE = user_env
    helper.DEFAULT_ENV_FILE = plugin_env

    observed = {}

    def fake_request(method, base_url, token, path, **_kwargs):
        observed.update(method=method, base_url=base_url, token=token, path=path)
        return {"login": "tester"}

    monkeypatch.setattr(helper, "request_json", fake_request)
    monkeypatch.setattr(sys, "argv", ["forgejo_api.py", "user"])
    for name in ("FORGEJO_URL", "FORGEJO_ACCESS_TOKEN", "FORGEJO_TOKEN"):
        monkeypatch.delenv(name, raising=False)

    assert helper.main() == 0
    assert observed == {
        "method": "GET",
        "base_url": "https://forge.example.test",
        "token": "stable-token",
        "path": "/user",
    }
    assert '"login": "tester"' in capsys.readouterr().out


def test_launcher_prefers_environment_over_stable_file(monkeypatch, tmp_path):
    launcher = _load_script("run_forgejo_mcp")
    user_env = tmp_path / "user.env"
    _write_env(user_env, "stable-token")
    monkeypatch.setenv("FORGEJO_ACCESS_TOKEN", "process-token")

    launcher.load_env_file(user_env)

    assert os.environ["FORGEJO_ACCESS_TOKEN"] == "process-token"


def test_env_loader_rejects_readable_secret_file(tmp_path):
    helper = _load_script("forgejo_api")
    env_file = tmp_path / "unsafe.env"
    _write_env(env_file, "secret")
    env_file.chmod(0o644)

    try:
        helper.load_env_file(env_file)
    except SystemExit as exc:
        assert "expected permissions 0600" in str(exc)
    else:
        raise AssertionError("readable credential file was accepted")
