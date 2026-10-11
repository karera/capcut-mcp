// drives the real MCP server over stdio, the way Claude does
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const drafts = fs.mkdtempSync(path.join(os.tmpdir(), 'capcut-mcp-server-'));
fs.mkdirSync(path.join(drafts, 'd1'));
fs.writeFileSync(path.join(drafts, 'd1', 'draft_content.json'),
  JSON.stringify({ duration: 0, materials: {}, tracks: [{ id: 'TV', type: 'video', segments: [] }] }));

const env = { ...process.env, CAPCUT_DRAFTS_DIR: drafts };
delete env.CAPCUT_TEMPLATE_DRAFT;
const client = new Client({ name: 'test', version: '0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.resolve('src/server.js')], env, stderr: 'ignore' }));
after(() => client.close());

const call = async (name, args) => {
  const r = await client.callTool({ name, arguments: args });
  const text = r.content[0].text;
  return r.isError ? { error: text } : JSON.parse(text);
};

test('read_timeline shows unsaved session edits, fromDisk shows the saved file', async () => {
  assert.equal((await call('capcut_read_timeline', { draft: 'd1' })).fromSession, false);
  await call('capcut_add_track', { draft: 'd1', type: 'video', name: 'b-roll' });

  const live = await call('capcut_read_timeline', { draft: 'd1' });
  assert.equal(live.fromSession, true);
  assert.deepEqual(live.tracks.map(t => t.name), [undefined, 'b-roll']);

  const disk = await call('capcut_read_timeline', { draft: 'd1', fromDisk: true });
  assert.equal(disk.fromSession, false);
  assert.equal(disk.tracks.length, 1);

  await call('capcut_discard', { draft: 'd1' });
  const after = await call('capcut_read_timeline', { draft: 'd1' });
  assert.equal(after.fromSession, false);
  assert.equal(after.tracks.length, 1);
});

test('tools reject draft names outside the drafts folder', async () => {
  for (const tool of ['capcut_read_timeline', 'capcut_validate', 'capcut_discard']) {
    assert.match((await call(tool, { draft: '../../test' })).error, /invalid draft name/, tool);
  }
});
