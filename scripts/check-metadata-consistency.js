#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findRepoRoot(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, 'book-config.json')) && fs.existsSync(path.join(current, 'package.json'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Repository root with book-config.json and package.json was not found.');
    }
    current = parent;
  }
}

const repoRoot = findRepoRoot(process.cwd());
const repoRootReal = fs.realpathSync(repoRoot);
const errors = [];

function addError(message) {
  errors.push(message);
}

function readText(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

function readJson(relPath) {
  return JSON.parse(readText(relPath));
}

function isInside(base, target) {
  const rel = path.relative(base, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function resolveRepoPath(relPath, label, options = {}) {
  const reportError = options.reportError || addError;
  if (typeof relPath !== 'string' || relPath.trim() === '') {
    reportError(`${label} must be a non-empty relative path.`);
    return null;
  }
  if (path.isAbsolute(relPath)) {
    reportError(`${label} must be relative, got absolute path: ${relPath}`);
    return null;
  }

  const absPath = path.resolve(repoRoot, relPath);
  if (!isInside(repoRoot, absPath)) {
    reportError(`${label} escapes repository root: ${relPath}`);
    return null;
  }

  if (options.mustExist) {
    try {
      fs.lstatSync(absPath);
    } catch (err) {
      reportError(`${label} target not found: ${relPath}`);
      return null;
    }

    let realPath;
    try {
      realPath = fs.realpathSync(absPath);
    } catch (err) {
      reportError(`${label} cannot be resolved: ${relPath} (${err.message})`);
      return null;
    }

    if (!isInside(repoRootReal, realPath)) {
      reportError(`${label} resolves outside repository root: ${relPath} -> ${realPath}`);
      return null;
    }

    if (options.file && !fs.statSync(absPath).isFile()) {
      reportError(`${label} must point to a file: ${relPath}`);
      return null;
    }
  }

  return absPath;
}

function parseScalar(rawValue) {
  const value = String(rawValue || '').trim();
  if (value === '') return '';
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  const commentIndex = value.search(/\s#/);
  return commentIndex >= 0 ? value.slice(0, commentIndex).trim() : value;
}

function parseTopLevelYaml(text) {
  const values = {};
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    if (/^\s/.test(line) || /^\s*(#|$)/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (rawValue.trim() === '') continue;
    values[key] = parseScalar(rawValue);
  }
  return values;
}

function parseFrontMatter(markdown, relPath) {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, body: normalized, hasFrontMatter: false, relPath };
  }
  return {
    data: parseTopLevelYaml(match[1]),
    body: normalized.slice(match[0].length),
    hasFrontMatter: true,
    relPath,
  };
}

function parseNavigationYaml(text) {
  const result = {};
  let currentSection = null;
  let currentItem = null;

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;

    const sectionMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      result[currentSection] = [];
      currentItem = null;
      continue;
    }

    if (!currentSection) continue;

    const titleMatch = line.match(/^\s*-\s+title:\s*(.+)$/);
    if (titleMatch) {
      currentItem = { title: parseScalar(titleMatch[1]) };
      result[currentSection].push(currentItem);
      continue;
    }

    const pathMatch = line.match(/^\s+path:\s*(.+)$/);
    if (pathMatch && currentItem) {
      currentItem.path = parseScalar(pathMatch[1]);
    }
  }

  return result;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    addError(`${label} mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertContains(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    addError(`${label} does not contain ${JSON.stringify(needle)}.`);
  }
}

function canonicalRepoSlug(repositoryUrl) {
  const match = String(repositoryUrl || '').match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/);
  return match ? match[1] : null;
}

function normalizeRepositoryUrl(repositoryUrl) {
  return String(repositoryUrl || '').replace(/^git\+/, '');
}

function normalizeHomepage(value) {
  const raw = String(value || '');
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function pagesCoordinates(homepage) {
  try {
    const parsed = new URL(homepage);
    const pathname = parsed.pathname.endsWith('/') ? parsed.pathname.slice(0, -1) : parsed.pathname;
    return {
      url: parsed.origin,
      baseurl: pathname === '/' ? '' : pathname,
    };
  } catch (err) {
    addError(`book-config.json homepage must be a valid URL: ${homepage}`);
    return null;
  }
}

function collectEntries(config) {
  const structure = config.structure || {};
  const entries = [];
  for (const section of ['introduction', 'chapters', 'appendices', 'afterword']) {
    const items = structure[section] || [];
    if (!Array.isArray(items)) {
      addError(`book-config.json structure.${section} must be an array.`);
      continue;
    }
    items.forEach((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        addError(`book-config.json structure.${section}[${index}] must be an object.`);
        return;
      }
      entries.push({ ...item, section });
    });
  }
  return entries;
}

function docsCandidatesForPath(routePath, label) {
  if (typeof routePath !== 'string' || routePath.trim() === '') {
    addError(`${label} must be a non-empty route path.`);
    return [];
  }
  if (!routePath.startsWith('/')) {
    addError(`${label} must start with '/': ${routePath}`);
    return [];
  }
  if (/^https?:\/\//.test(routePath) || routePath.includes('://')) {
    addError(`${label} must be an internal route path: ${routePath}`);
    return [];
  }

  const withoutQuery = routePath.split(/[?#]/, 1)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '..' || segment === '.')) {
    addError(`${label} must not contain relative path segments: ${routePath}`);
    return [];
  }

  if (!withoutQuery.endsWith('/')) {
    addError(`${label} should use a directory-style permalink ending with '/': ${routePath}`);
  }

  if (segments.length === 0) {
    return ['docs/index.md'];
  }

  return [
    path.join('docs', ...segments) + '.md',
    path.join('docs', ...segments, 'index.md'),
  ];
}

function resolveDocsPage(routePath, label) {
  const candidates = docsCandidatesForPath(routePath, label);
  const candidateErrors = [];
  const collectCandidateError = (message) => candidateErrors.push(message);
  for (const candidate of candidates) {
    const abs = resolveRepoPath(candidate, `${label} candidate`, { mustExist: false, reportError: collectCandidateError });
    if (!abs) continue;
    if (!fs.existsSync(abs)) continue;
    const resolved = resolveRepoPath(candidate, `${label} target`, { mustExist: true, file: true, reportError: collectCandidateError });
    if (resolved) return resolved;
  }
  for (const candidateError of candidateErrors) {
    addError(candidateError);
  }
  addError(`${label} target page not found for route ${routePath}; tried ${candidates.join(', ')}`);
  return null;
}

function firstHeading(markdownBody) {
  for (const line of markdownBody.split(/\r?\n/)) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  return '';
}

function validateMetadata(config, pkg, lock, docsConfig, indexFrontMatter, readme) {
  const repoSlug = canonicalRepoSlug(config.repository && config.repository.url);
  if (!repoSlug) {
    addError('book-config.json repository.url must be a GitHub repository URL.');
    return;
  }
  const repoName = repoSlug.split('/')[1];
  const pages = pagesCoordinates(config.homepage);

  assertEqual(pkg.name, repoName, 'package.json name');
  assertEqual(pkg.version, config.version, 'package.json version');
  assertEqual(pkg.description, config.description, 'package.json description');
  assertEqual(pkg.author, config.author, 'package.json author');
  assertEqual(pkg.license, config.license, 'package.json license');
  assertEqual(pkg.repository && pkg.repository.type, 'git', 'package.json repository.type');
  assertEqual(normalizeRepositoryUrl(pkg.repository && pkg.repository.url), config.repository.url, 'package.json repository.url');
  assertEqual(normalizeHomepage(pkg.homepage), config.homepage, 'package.json homepage');
  assertEqual(pkg.bugs && pkg.bugs.url, `https://github.com/${repoSlug}/issues`, 'package.json bugs.url');

  assertEqual(lock.name, pkg.name, 'package-lock.json name');
  assertEqual(lock.version, pkg.version, 'package-lock.json version');
  if (lock.packages && lock.packages['']) {
    assertEqual(lock.packages[''].name, pkg.name, 'package-lock.json packages[""] name');
    assertEqual(lock.packages[''].version, pkg.version, 'package-lock.json packages[""] version');
    assertEqual(lock.packages[''].license, pkg.license, 'package-lock.json packages[""] license');
  }

  assertEqual(docsConfig.title, config.title, 'docs/_config.yml title');
  assertEqual(docsConfig.description, config.description, 'docs/_config.yml description');
  assertEqual(docsConfig.author, config.author, 'docs/_config.yml author');
  assertEqual(docsConfig.version, config.version, 'docs/_config.yml version');
  assertEqual(docsConfig.lang, config.language, 'docs/_config.yml lang');
  assertEqual(docsConfig.repository, repoSlug, 'docs/_config.yml repository');
  assertEqual(docsConfig.repository_branch, config.repository.branch, 'docs/_config.yml repository_branch');
  assertEqual(docsConfig.repository_docs_path, 'docs', 'docs/_config.yml repository_docs_path');
  if (pages) {
    assertEqual(docsConfig.url, pages.url, 'docs/_config.yml url');
    assertEqual(docsConfig.baseurl, pages.baseurl, 'docs/_config.yml baseurl');
  }

  assertEqual(indexFrontMatter.layout, 'book', 'docs/index.md front matter layout');
  assertEqual(indexFrontMatter.title, config.title, 'docs/index.md front matter title');
  assertEqual(indexFrontMatter.description, config.description, 'docs/index.md front matter description');
  assertEqual(indexFrontMatter.author, config.author, 'docs/index.md front matter author');
  assertEqual(indexFrontMatter.version, config.version, 'docs/index.md front matter version');

  assertContains(readme, config.homepage, 'README.md online URL');
  assertContains(readme, 'npm run check:metadata', 'README.md quality gate');
  assertContains(readme, 'npm test', 'README.md test command');
}

function validateEntries(entries) {
  const seenIds = new Set();
  const seenPaths = new Set();

  for (const entry of entries) {
    const label = `book-config.json structure.${entry.section}.${entry.id || '<missing-id>'}`;
    if (!entry.id) {
      addError(`${label} is missing id.`);
    } else {
      if (seenIds.has(entry.id)) addError(`${label} id is duplicated: ${entry.id}`);
      seenIds.add(entry.id);
    }

    if (!entry.title) addError(`${label} is missing title.`);

    if (!entry.path) {
      addError(`${label}.path is missing.`);
      continue;
    }
    if (seenPaths.has(entry.path)) addError(`${label}.path is duplicated: ${entry.path}`);
    seenPaths.add(entry.path);

    const docsAbs = resolveDocsPage(entry.path, `${label}.path`);
    if (!docsAbs) continue;

    const relPath = path.relative(repoRoot, docsAbs);
    const parsed = parseFrontMatter(fs.readFileSync(docsAbs, 'utf8'), relPath);
    const heading = firstHeading(parsed.body);
    if (!heading) {
      addError(`${relPath} is missing a top-level H1 heading.`);
      continue;
    }
    if (entry.title && !heading.includes(entry.title) && !entry.title.includes(heading)) {
      addError(`${relPath} H1 mismatch: expected it to align with ${JSON.stringify(entry.title)}, got ${JSON.stringify(heading)}`);
    }
  }
}

function validateNavigation(config, nav) {
  const expected = {};
  for (const section of ['introduction', 'chapters', 'appendices', 'afterword']) {
    expected[section] = Array.isArray(config.structure && config.structure[section])
      ? config.structure[section]
      : [];
  }
  const expectedSections = new Set(Object.keys(expected));

  for (const section of Object.keys(nav)) {
    if (!expectedSections.has(section)) {
      addError(`docs/_data/navigation.yml has unexpected section: ${section}`);
    }
  }

  for (const section of Object.keys(expected)) {
    const actualItems = nav[section] || [];
    const expectedItems = expected[section].filter((item) => item && typeof item === 'object' && !Array.isArray(item));
    assertEqual(actualItems.length, expectedItems.length, `docs/_data/navigation.yml ${section} item count`);
    const max = Math.min(actualItems.length, expectedItems.length);
    for (let i = 0; i < max; i += 1) {
      assertEqual(actualItems[i].title, expectedItems[i].title, `docs/_data/navigation.yml ${section}[${i}].title`);
      assertEqual(actualItems[i].path, expectedItems[i].path, `docs/_data/navigation.yml ${section}[${i}].path`);
      resolveDocsPage(actualItems[i].path, `docs/_data/navigation.yml ${section}[${i}].path`);
    }
  }
}

function validateRequiredAssets() {
  const requiredAssets = [
    'docs/assets/css/main.css',
    'docs/assets/css/syntax-highlighting.css',
    'docs/assets/js/theme.js',
    'docs/assets/js/search.js',
    'docs/assets/js/code-copy-lightweight.js',
  ];
  for (const relPath of requiredAssets) {
    resolveRepoPath(relPath, `required asset ${relPath}`, { mustExist: true, file: true });
  }
}

function main() {
  const config = readJson('book-config.json');
  const pkg = readJson('package.json');
  const lock = readJson('package-lock.json');
  const docsConfig = parseTopLevelYaml(readText('docs/_config.yml'));
  const index = parseFrontMatter(readText('docs/index.md'), 'docs/index.md');
  const nav = parseNavigationYaml(readText('docs/_data/navigation.yml'));
  const readme = readText('README.md');
  const entries = collectEntries(config);

  validateMetadata(config, pkg, lock, docsConfig, index.data, readme);
  validateEntries(entries);
  validateNavigation(config, nav);
  validateRequiredAssets();

  if (errors.length > 0) {
    console.error('❌ Metadata consistency check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`✅ Metadata consistency check passed (${entries.length} configured pages).`);
}

main();
