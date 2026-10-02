'use strict';

// An offline adapter/API smoke test, not an FTP protocol interoperability test.
// Keep actual get-uri control flow and basic-ftp Client/list parsing; replace
// only Client I/O. Every socket connection is forbidden, including loopback.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const net = require('node:net');
const path = require('node:path');
const { getUri } = require('get-uri');
const ftpPath = require.resolve('basic-ftp', {
  paths: [path.dirname(require.resolve('get-uri'))],
});
const { Client, parseList } = require(ftpPath);
const ftpPackage = require(require.resolve('basic-ftp/package.json', {
  paths: [path.dirname(require.resolve('get-uri'))],
}));
const manifest = require('../package.json');
const modifiedAt = new Date('2020-01-01T00:00:00Z');
const methods = ['access', 'lastMod', 'list', 'downloadTo', 'close'];

async function probe(scenario) {
  const originalMethods = new Map(methods.map(name => [name, Client.prototype[name]]));
  const originalConnect = net.Socket.prototype.connect;
  const calls = [];
  const clients = new Set();
  let connections = 0;
  net.Socket.prototype.connect = function () {
    connections++;
    throw new Error('Socket connections are forbidden in this offline fixture');
  };

  function record(client, name) {
    assert.ok(client instanceof Client);
    clients.add(client);
    calls.push(name);
  }

  try {
    for (const [name, method] of originalMethods) {
      assert.equal(typeof method, 'function', `basic-ftp Client.${name} must exist`);
    }
    Client.prototype.access = async function (options) {
      record(this, 'access');
      assert.equal(options.host, 'fixture.invalid');
      assert.equal(options.port, 21);
      assert.equal(options.user, undefined);
      assert.equal(options.password, undefined);
    };
    Client.prototype.lastMod = async function (file) {
      record(this, 'lastMod');
      assert.equal(file, '/evidence.txt');
      if (scenario === 'list') throw Object.assign(new Error('MDTM unavailable'), { code: 500 });
      if (scenario === 'missing') throw Object.assign(new Error('Missing fixture'), { code: 550 });
      return modifiedAt;
    };
    Client.prototype.list = async function (directory) {
      record(this, 'list');
      assert.equal(directory, '/');
      const entries = parseList('type=file;size=7;modify=20200101000000; evidence.txt\r\n');
      assert.equal(entries.length, 1);
      assert.equal(entries[0].name, 'evidence.txt');
      assert.equal(entries[0].size, 7);
      assert.equal(+entries[0].modifiedAt, +modifiedAt);
      return entries;
    };
    Client.prototype.downloadTo = async function (destination, file) {
      record(this, 'downloadTo');
      assert.equal(file, '/evidence.txt');
      assert.equal(typeof destination.end, 'function');
      destination.end('fixture');
      return { code: 226, message: 'Offline fixture completed' };
    };
    Client.prototype.close = function () {
      record(this, 'close');
      return originalMethods.get('close').call(this);
    };

    const options = scenario === 'cached' ? { cache: { lastModified: modifiedAt } } : {};
    const result = getUri(new URL('ftp://fixture.invalid/evidence.txt'), options);
    if (scenario === 'missing' || scenario === 'cached') {
      await assert.rejects(result, { code: scenario === 'missing' ? 'ENOTFOUND' : 'ENOTMODIFIED' });
      assert.deepEqual(calls, ['access', 'lastMod', 'close']);
    } else {
      const stream = await result;
      let body = '';
      for await (const chunk of stream) body += chunk.toString('utf8');
      assert.equal(body, 'fixture');
      assert.equal(+stream.lastModified, +modifiedAt);
      assert.deepEqual(calls, scenario === 'list'
        ? ['access', 'lastMod', 'list', 'downloadTo', 'close']
        : ['access', 'lastMod', 'downloadTo', 'close']);
    }
    assert.equal(clients.size, 1);
    assert.equal(connections, 0, 'No network connection may be attempted');
    for (const client of clients) assert.equal(client.closed, true, 'Actual Client must be closed');
  } finally {
    for (const client of clients) originalMethods.get('close').call(client);
    for (const [name, method] of originalMethods) Client.prototype[name] = method;
    net.Socket.prototype.connect = originalConnect;
  }
}

test('get-uri / patched basic-ftp offline compatibility', async t => {
  await t.test('the scoped patched dependency is actually resolved', () => {
    assert.equal(manifest.overrides['get-uri']['basic-ftp'], '6.2.1');
    assert.equal(ftpPackage.version, '6.2.1');
  });
  for (const scenario of ['mdtm', 'list', 'missing', 'cached']) {
    await t.test(scenario, { timeout: 3000 }, () => probe(scenario));
  }
});
