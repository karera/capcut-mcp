import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

// isolated drafts dir with one minimal draft, set before core.js reads the env
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'capcut-mcp-test-'));
const drafts = path.join(root, 'drafts');
fs.mkdirSync(path.join(drafts, 'd1'), { recursive: true });
fs.writeFileSync(path.join(drafts, 'd1', 'draft_content.json'), JSON.stringify({ tracks: [], materials: {}, duration: 0 }));
process.env.CAPCUT_DRAFTS_DIR = drafts;
delete process.env.CAPCUT_TEMPLATE_DRAFT;
const { draftPath, CapCutDraft, cloneDraft, probeDur, probeWH } = await import('../src/core.js');

test('draft names that escape the drafts folder are rejected', () => {
  // Windows drive-relative name on another drive resolves outside; on POSIX 'Z:test' is just a valid name
  const crossDrive = process.platform === 'win32' ? [(drafts[0].toUpperCase() === 'Z' ? 'Y' : 'Z') + ':test'] : [];
  for (const bad of ['../../test', '..', '.', 'a/b', 'a\\b', '', ...crossDrive]) {
    assert.throws(() => draftPath(bad), /invalid draft name/, bad);
  }
  assert.throws(() => new CapCutDraft('../../test'), /invalid draft name/);
  assert.throws(() => cloneDraft('d1', '../../test'), /invalid draft name/);
  assert.throws(() => cloneDraft('../../test', 'x'), /invalid draft name/);
  assert.equal(fs.existsSync(path.join(root, 'test')), false);
  assert.equal(draftPath('d1'), path.join(drafts, 'd1'));
});

test('file names with shell syntax are not executed', () => {
  // $(...) fires in POSIX sh; the quote + & breaks out of cmd.exe quoting on Windows
  const work = fs.mkdtempSync(path.join(root, 'work-'));
  const name = 'clip$(echo hacked > m1)" & echo hacked > m2 & ".mp4';
  const cwd = process.cwd();
  process.chdir(work);
  try {
    assert.equal(probeDur(name), 5e6);              // falls back to the default, no throw
    assert.deepEqual(probeWH(name), { w: 1920, h: 1080 });
  } finally { process.chdir(cwd); }
  assert.deepEqual(fs.readdirSync(work), []);       // no marker files written by an injected command
});

const hasFfmpeg = (() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
test('real clip with shell syntax in its name is probed correctly', { skip: !hasFfmpeg && 'ffmpeg not on PATH' }, () => {
  const work = fs.mkdtempSync(path.join(root, 'real-'));
  const clip = path.join(work, 'clip$(mkdir m1) & mkdir m2 & .mp4');   // legal on Windows and POSIX
  execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc=duration=2:size=640x360:rate=30', clip]);
  const cwd = process.cwd();
  process.chdir(work);
  try {
    assert.equal(probeDur(clip), 2e6);
    assert.deepEqual(probeWH(clip), { w: 640, h: 360 });
  } finally { process.chdir(cwd); }
  assert.deepEqual(fs.readdirSync(work), [path.basename(clip)]);
});

test('raw_patch with __proto__ / constructor / prototype does not pollute objects', () => {
  const d = new CapCutDraft('d1');
  const patch = JSON.parse('{"__proto__":{"polluted":1},"materials":{"__proto__":{"polluted":2},"constructor":{"prototype":{"polluted":3}}},"fine":1}');
  d.rawPatch(patch);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(d.content.fine, 1);                   // ordinary keys still merge
  assert.equal(d.content.materials.constructor, Object);
});
