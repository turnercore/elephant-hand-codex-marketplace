from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from normalize_codex_installation import (  # noqa: E402
    plan_actions,
    remove_legacy_hook_handlers,
    remove_plugin_tables,
)
from validate_marketplace import find_skill_collisions, validate  # noqa: E402


def _skill(path: Path, name: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"---\nname: {name}\ndescription: Test skill.\n---\n",
        encoding="utf-8",
    )
    return path


def test_marketplace_is_valid():
    assert validate(ROOT) == []


def test_duplicate_skill_names_are_rejected(tmp_path):
    first = _skill(tmp_path / "one" / "SKILL.md", "duplicate")
    second = _skill(tmp_path / "two" / "SKILL.md", "duplicate")

    assert find_skill_collisions([first, second]) == {
        "duplicate": [first, second],
    }


def test_normalizer_replaces_legacy_plugins():
    installed = {
        "html-artifacts@elephant-hand",
        "mattpocock-skills@elephant-hand",
    }
    available = {
        "pdf@openai-primary-runtime",
        "reporting@elephant-hand",
        "reviewing@elephant-hand",
        "coding@elephant-hand",
        "dox@elephant-hand",
        "forgejo@elephant-hand",
        "planning@elephant-hand",
        "teaching@elephant-hand",
    }

    removals, additions, unavailable = plan_actions(installed, available)

    assert removals == [
        "html-artifacts@elephant-hand",
        "mattpocock-skills@elephant-hand",
    ]
    assert "reporting@elephant-hand" in additions
    assert "reviewing@elephant-hand" in additions
    assert unavailable == []


def test_normalizer_reenables_disabled_baseline_plugin():
    removals, additions, unavailable = plan_actions(
        set(),
        {"reviewing@elephant-hand"},
        configured={"reviewing@elephant-hand"},
    )

    assert removals == []
    assert additions == ["reviewing@elephant-hand"]
    assert "reviewing@elephant-hand" not in unavailable


def test_normalizer_removes_only_legacy_ponytail_hooks():
    config = {
        "hooks": {
            "SessionStart": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": 'node "/Users/me/.codex/ponytail-hooks/ponytail-activate.js"',
                        },
                        {
                            "type": "command",
                            "command": "python3 /Users/me/.codex/hooks/notes.py",
                        },
                    ]
                }
            ]
        }
    }

    assert remove_legacy_hook_handlers(config) == 1
    assert config["hooks"]["SessionStart"][0]["hooks"] == [
        {
            "type": "command",
            "command": "python3 /Users/me/.codex/hooks/notes.py",
        }
    ]


def test_normalizer_fallback_removes_only_named_plugin_table():
    text = (
        '[plugins."ponytail@ponytail"]\n'
        "enabled = true\n\n"
        '[plugins."reporting@elephant-hand"]\n'
        "enabled = true\n\n"
        "[[hooks.SessionStart]]\n"
        'matcher = "*"\n\n'
        "[features]\n"
        "hooks = true\n"
    )

    assert remove_plugin_tables(text, {"ponytail@ponytail"}) == (
        '[plugins."reporting@elephant-hand"]\n'
        "enabled = true\n\n"
        "[[hooks.SessionStart]]\n"
        'matcher = "*"\n\n'
        "[features]\n"
        "hooks = true\n"
    )
