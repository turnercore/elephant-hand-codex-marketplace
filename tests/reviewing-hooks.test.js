const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const pluginRoot = path.resolve(__dirname, '..', 'plugins', 'reviewing');
const hooksRoot = path.join(pluginRoot, 'hooks');

function runHook(script, pluginData, input = '') {
  return spawnSync(process.execPath, [path.join(hooksRoot, script)], {
    env: {
      ...process.env,
      PLUGIN_DATA: pluginData,
      PONYTAIL_DEFAULT_MODE: 'lite',
      XDG_CONFIG_HOME: path.join(pluginData, 'config'),
    },
    input,
    encoding: 'utf8',
  });
}

test('default hook manifest references packaged scripts', () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(hooksRoot, 'hooks.json'), 'utf8'),
  );
  for (const groups of Object.values(config.hooks)) {
    for (const group of groups) {
      for (const hook of group.hooks) {
        const match = hook.command.match(
          /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"\s]+)/,
        );
        assert.ok(match, hook.command);
        assert.ok(fs.existsSync(path.join(pluginRoot, match[1])), match[1]);
      }
    }
  }
});

test('SessionStart loads the packaged Ponytail skill in Codex mode', () => {
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-hook-'));
  const result = runHook('ponytail-activate.js', pluginData);

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.systemMessage, 'PONYTAIL:LITE');
  assert.match(
    output.hookSpecificOutput.additionalContext,
    /The ladder is a reflex, not a research project/,
  );
  assert.equal(
    fs.readFileSync(path.join(pluginData, '.ponytail-active'), 'utf8'),
    'lite',
  );
});

test('UserPromptSubmit changes the persisted mode', () => {
  const pluginData = fs.mkdtempSync(path.join(os.tmpdir(), 'ponytail-hook-'));
  const result = runHook(
    'ponytail-mode-tracker.js',
    pluginData,
    JSON.stringify({ prompt: '/ponytail ultra' }),
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    fs.readFileSync(path.join(pluginData, '.ponytail-active'), 'utf8'),
    'ultra',
  );
  assert.match(result.stdout, /PONYTAIL MODE CHANGED/);
});
