#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const checker = path.join(repoRoot, 'scripts', 'check-metadata-consistency.js');
const fixture = fs.mkdtempSync(path.join(repoRoot, '.metadata-consistency-regression-'));

function copyRepository() {
  for (const entry of fs.readdirSync(repoRoot)) {
    if (entry.startsWith('.metadata-consistency-regression-')) continue;
    if (['.git', 'node_modules'].includes(entry)) continue;
    if (entry === 'docs') {
      fs.cpSync(path.join(repoRoot, entry), path.join(fixture, entry), {
        recursive: true,
        filter(source) {
          const relative = path.relative(path.join(repoRoot, entry), source);
          return !relative.startsWith('_site') && !relative.startsWith('.jekyll-cache');
        },
      });
      continue;
    }
    fs.cpSync(path.join(repoRoot, entry), path.join(fixture, entry), { recursive: true });
  }
}

function readFixture(relativePath) {
  return fs.readFileSync(path.join(fixture, relativePath), 'utf8');
}

function writeFixture(relativePath, content) {
  const target = path.join(fixture, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function updateJson(relativePath, update) {
  const value = JSON.parse(readFixture(relativePath));
  update(value);
  writeFixture(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runChecker() {
  return spawnSync(process.execPath, [checker, '--root', fixture], {
    encoding: 'utf8',
  });
}

function expectPass(label) {
  const result = runChecker();
  assert.strictEqual(result.status, 0, `${label} should pass:\n${result.stdout}\n${result.stderr}`);
}

function expectFail(label, marker) {
  const result = runChecker();
  assert.notStrictEqual(result.status, 0, `${label} should fail`);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, new RegExp(marker), `${label} should mention ${marker}:\n${output}`);
}

try {
  copyRepository();

  const originalConfig = readFixture('book-config.json');
  const originalNavigation = readFixture('docs/_data/navigation.yml');
  const originalIndex = readFixture('docs/index.md');
  const originalQuickStart = readFixture('docs/quick-start/index.md');

  // Negative case required by Issue #150: the developer-facing root document alone
  // must not satisfy the reader-facing quickStart contract.
  updateJson('book-config.json', (config) => {
    config.structure.introduction = config.structure.introduction
      .filter((entry) => entry.id !== 'quick-start');
    config.ux.modules.quickStart = false;
  });
  writeFixture(
    'docs/_data/navigation.yml',
    originalNavigation.replace(/  - title: クイックスタート\n    path: \/quick-start\/\n/, ''),
  );
  writeFixture(
    'docs/index.md',
    originalIndex
      .split('\n')
      .filter((line) => !line.includes('quick-start/'))
      .join('\n'),
  );
  fs.rmSync(path.join(fixture, 'docs', 'quick-start'), { recursive: true, force: true });
  expectPass('root QUICK-START.md without reader-facing artifacts');

  // Any public route without the flag is an incomplete integration and must fail.
  writeFixture('docs/quick-start/index.md', originalQuickStart);
  expectFail('reader route without quickStart flag', 'reader-facing /quick-start/ page');

  // The enabled flag must also fail closed if the published page disappears.
  writeFixture('book-config.json', originalConfig);
  writeFixture('docs/_data/navigation.yml', originalNavigation);
  writeFixture('docs/index.md', originalIndex);
  fs.rmSync(path.join(fixture, 'docs', 'quick-start'), { recursive: true, force: true });
  expectFail('quickStart flag without published page', 'has no published page');

  // A route-compatible flat file must not replace the canonical reader page.
  writeFixture('docs/quick-start.md', originalQuickStart);
  expectFail('quickStart route with non-canonical flat page', 'must resolve to docs/quick-start/index.md');
  fs.rmSync(path.join(fixture, 'docs', 'quick-start.md'));

  // Duplicate page-navigation includes are forbidden because the book layout
  // already renders the canonical navigation include.
  writeFixture('docs/quick-start/index.md', `${originalQuickStart}\n{% include page-navigation.html %}\n`);
  expectFail('quickStart page with duplicate navigation include', 'must rely on the book layout navigation');

  console.log('✅ Metadata consistency regression checks passed (quickStart bidirectional + root negative case).');
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
