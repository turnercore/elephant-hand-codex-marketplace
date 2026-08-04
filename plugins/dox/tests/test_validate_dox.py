from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = (
    Path(__file__).resolve().parents[1]
    / "skills"
    / "dox"
    / "scripts"
    / "validate_dox.py"
)
SPEC = importlib.util.spec_from_file_location("validate_dox", SCRIPT)
assert SPEC and SPEC.loader
VALIDATOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = VALIDATOR
SPEC.loader.exec_module(VALIDATOR)


ROOT_DOC = """# Repository instructions

## DOX contract

Read this file and the child chain for each target. Keep durable instructions
here and route explanatory material to normal documentation.

## Child DOX Index

- [Source](src/AGENTS.md)
"""

CHILD_DOC = """# Source instructions

## Verification

Run the focused source checks.

## Child DOX Index

None.
"""


class DoxValidatorTests(unittest.TestCase):
    def make_repo(self) -> Path:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name)
        (root / "src").mkdir()
        (root / "AGENTS.md").write_text(ROOT_DOC, encoding="utf-8")
        (root / "src" / "AGENTS.md").write_text(CHILD_DOC, encoding="utf-8")
        (root / ".dox.toml").write_text(
            """version = 1

[budgets]
root_max_bytes = 6000
child_max_bytes = 4000
chain_max_bytes = 16000

[lint]
duplicate_paragraphs = "error"
dynamic_root_facts = "warning"
""",
            encoding="utf-8",
        )
        return root

    def validate(self, root: Path):
        policy, warnings = VALIDATOR.load_policy(root, None)
        result = VALIDATOR.validate(root, policy)
        result["warnings"] = [*warnings, *result["warnings"]]
        return result

    def test_valid_hierarchy_reports_context_metrics(self) -> None:
        root = self.make_repo()

        result = self.validate(root)

        self.assertEqual([], result["errors"])
        self.assertEqual(2, result["metrics"]["documents"])
        self.assertEqual(
            ["AGENTS.md", "src/AGENTS.md"], result["metrics"]["largest_chain"]
        )

    def test_missing_nearest_parent_index_entry_fails(self) -> None:
        root = self.make_repo()
        (root / "AGENTS.md").write_text(
            ROOT_DOC.replace("- [Source](src/AGENTS.md)", "None."), encoding="utf-8"
        )

        result = self.validate(root)

        self.assertTrue(any("not indexed by nearest parent" in error for error in result["errors"]))

    def test_stale_index_entry_fails(self) -> None:
        root = self.make_repo()
        (root / "AGENTS.md").write_text(
            ROOT_DOC.replace("src/AGENTS.md", "missing/AGENTS.md"), encoding="utf-8"
        )

        result = self.validate(root)

        self.assertTrue(any("stale index path" in error for error in result["errors"]))

    def test_document_and_chain_budgets_fail(self) -> None:
        root = self.make_repo()
        (root / ".dox.toml").write_text(
            """version = 1
[budgets]
root_max_bytes = 100
child_max_bytes = 100
chain_max_bytes = 150
""",
            encoding="utf-8",
        )

        result = self.validate(root)

        self.assertTrue(any("context budget" in error for error in result["errors"]))
        self.assertTrue(any("chain budget" in error for error in result["errors"]))

    def test_duplicate_context_fails(self) -> None:
        root = self.make_repo()
        duplicate = (
            "This durable instruction is deliberately long enough to cross the duplicate "
            "paragraph threshold and must appear in only one context document at a time."
        )
        (root / "AGENTS.md").write_text(
            ROOT_DOC.replace("## Child DOX Index", f"{duplicate}\n\n## Child DOX Index"),
            encoding="utf-8",
        )
        (root / "src" / "AGENTS.md").write_text(
            CHILD_DOC.replace("## Verification", f"{duplicate}\n\n## Verification"),
            encoding="utf-8",
        )

        result = self.validate(root)

        self.assertTrue(any("duplicate context" in error for error in result["errors"]))

    def test_dynamic_root_facts_warn_without_failing(self) -> None:
        root = self.make_repo()
        (root / "AGENTS.md").write_text(
            ROOT_DOC.replace(
                "## Child DOX Index",
                "Release 2.4.1 was installed under /opt/parade on 2026-08-04.\n\n"
                "## Child DOX Index",
            ),
            encoding="utf-8",
        )

        result = self.validate(root)

        self.assertEqual([], result["errors"])
        self.assertGreaterEqual(len(result["warnings"]), 3)

    def test_policy_can_turn_lints_off(self) -> None:
        root = self.make_repo()
        duplicate = (
            "This durable instruction is deliberately long enough to cross the duplicate "
            "paragraph threshold and can be ignored by an explicit repository policy."
        )
        (root / "AGENTS.md").write_text(
            ROOT_DOC.replace("## Child DOX Index", f"{duplicate}\n\n## Child DOX Index"),
            encoding="utf-8",
        )
        (root / "src" / "AGENTS.md").write_text(
            CHILD_DOC.replace("## Verification", f"{duplicate}\n\n## Verification"),
            encoding="utf-8",
        )
        (root / ".dox.toml").write_text(
            """version = 1
[lint]
duplicate_paragraphs = "off"
dynamic_root_facts = "off"
""",
            encoding="utf-8",
        )

        result = self.validate(root)

        self.assertEqual([], result["errors"])
        self.assertEqual([], result["warnings"])

    def test_json_cli_includes_validator_version(self) -> None:
        root = self.make_repo()

        completed = subprocess.run(
            [sys.executable, str(SCRIPT), str(root), "--json"],
            check=False,
            capture_output=True,
            text=True,
        )

        self.assertEqual(0, completed.returncode, completed.stderr)
        output = json.loads(completed.stdout)
        self.assertEqual("0.4.0", output["validator_version"])
        self.assertEqual([], output["errors"])


if __name__ == "__main__":
    unittest.main()
