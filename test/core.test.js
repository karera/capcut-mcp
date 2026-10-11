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

test('audio track labelled "music" is used as the audio template', () => {
  // template draft shaped like CapCut library music: audio track, material type 'music'
  const tpl = { tracks: [{ id: 'T', type: 'audio', segments: [{ id: 'S', material_id: 'M', extra_material_refs: [], target_timerange: { start: 0, duration: 1e6 }, source_timerange: { start: 0, duration: 1e6 } }] }],
    materials: { audios: [{ id: 'M', type: 'music', path: 'x.mp3' }] }, duration: 1e6 };
  fs.mkdirSync(path.join(drafts, 'music'));
  fs.writeFileSync(path.join(drafts, 'music', 'draft_content.json'), JSON.stringify(tpl));
  const song = path.join(root, 'song.mp3');
  fs.writeFileSync(song, '');
  const d = new CapCutDraft('music');                  // its own music track is the template
  assert.equal(d.templates().audio.mat.type, 'music'); // harvested under 'audio'
  const { segmentId } = d.addAudio(song, { atUs: 0, durUs: 2e6 });
  const track = d.content.tracks.find(tr => tr.segments.some(s => s.id === segmentId));
  assert.equal(track.type, 'audio');
  assert.equal(d.content.materials.audios.at(-1).type, 'extract_music');
  assert.equal(d.content.materials.audios.at(-1).path, song.replace(/\\/g, '/'));
});

test('cloned draft gets its own name, id and folder in the meta file, and no lock', () => {
  const meta = { draft_name: 'd1', draft_id: 'OLD-ID', draft_fold_path: 'somewhere/d1', other: 1 };
  fs.writeFileSync(path.join(drafts, 'd1', 'draft_meta_info.json'), JSON.stringify(meta));
  fs.writeFileSync(path.join(drafts, 'd1', '.locked'), '');
  const { dir } = cloneDraft('d1', 'd1 copy');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'draft_meta_info.json'), 'utf8'));
  assert.equal(m.draft_name, 'd1 copy');
  assert.notEqual(m.draft_id, 'OLD-ID');
  assert.equal(m.draft_fold_path, dir.replace(/\\/g, '/'));
  assert.equal(m.other, 1);
  assert.equal(fs.existsSync(path.join(dir, '.locked')), false);
  fs.rmSync(path.join(drafts, 'd1', '.locked'));
});

// a draft shaped like CapCut saves it: video with a speed material, text with source_timerange null
function speedDraft(name) {
  const c = { duration: 10e6, materials: { videos: [{ id: 'V', type: 'video', path: '' }], speeds: [{ id: 'SP', speed: 1 }], texts: [{ id: 'T', content: '{"text":"hi"}' }] },
    tracks: [
      { id: 'TV', type: 'video', segments: [{ id: 'clip', material_id: 'V', speed: 1, extra_material_refs: ['SP'], target_timerange: { start: 0, duration: 10e6 }, source_timerange: { start: 0, duration: 10e6 } }] },
      { id: 'TT', type: 'text', segments: [{ id: 'cap', material_id: 'T', speed: 1, extra_material_refs: [], target_timerange: { start: 0, duration: 4e6 }, source_timerange: null }] },
    ] };
  fs.mkdirSync(path.join(drafts, name));
  fs.writeFileSync(path.join(drafts, name, 'draft_content.json'), JSON.stringify(c));
  return new CapCutDraft(name);
}
const seg = (d, id) => d.content.tracks.flatMap(t => t.segments).find(s => s.id === id);

test('speed: setting it changes timeline length, keeps the source footage', () => {
  const d = speedDraft('speed-set');
  d.setProps('clip', { speed: 2 });
  assert.equal(seg(d, 'clip').target_timerange.duration, 5e6);
  assert.equal(seg(d, 'clip').source_timerange.duration, 10e6);
  assert.equal(d.content.materials.speeds[0].speed, 2);
  assert.equal(d.content.duration, 5e6);
  assert.throws(() => d.setProps('clip', { speed: 0 }), /speed must be > 0/);
});

test('speed: trim and split of a sped-up clip use source = timeline x speed', () => {
  const d = speedDraft('speed-cut');
  d.setProps('clip', { speed: 2 });                     // 5s on the timeline, 10s of footage
  d.trimSegment('clip', { durUs: 3e6 });
  assert.deepEqual(seg(d, 'clip').source_timerange, { start: 0, duration: 6e6 });
  d.trimSegment('clip', { durUs: 5e6, srcStartUs: 1e6 });
  const { right } = d.splitSegment('clip', 2e6);
  assert.deepEqual(seg(d, 'clip').target_timerange, { start: 0, duration: 2e6 });
  assert.deepEqual(seg(d, 'clip').source_timerange, { start: 1e6, duration: 4e6 });
  assert.deepEqual(seg(d, right).target_timerange, { start: 2e6, duration: 3e6 });
  assert.deepEqual(seg(d, right).source_timerange, { start: 5e6, duration: 6e6 });
});

test('speed: add_video with a speed sizes the timeline from the footage', () => {
  const d = speedDraft('speed-add');
  const f = path.join(root, 'speed-add.mp4');
  fs.writeFileSync(f, '');
  const { segmentId } = d.addVideo(f, { atUs: 10e6, durUs: 4e6, speed: 2 });
  assert.equal(seg(d, segmentId).target_timerange.duration, 4e6);
  assert.equal(seg(d, segmentId).source_timerange.duration, 8e6);
  assert.equal(seg(d, segmentId).speed, 2);
});

test('text segments with no source range can be trimmed and split', () => {
  const d = speedDraft('text-null');
  d.trimSegment('cap', { durUs: 3e6 });
  const { right } = d.splitSegment('cap', 1e6);
  assert.equal(seg(d, 'cap').target_timerange.duration, 1e6);
  assert.equal(seg(d, right).target_timerange.duration, 2e6);
  assert.equal(seg(d, right).source_timerange, null);
});

test('validate reports missing audio files as well as video', () => {
  const d = speedDraft('missing-media');
  d.content.materials.videos[0].path = path.join(root, 'gone.mp4');
  d.content.materials.audios = [{ id: 'A', type: 'music', path: path.join(root, 'gone.mp3') }, { id: 'B', type: 'music', path: '' }];
  const { ok, issues } = d.validate();
  assert.equal(ok, false);
  assert.deepEqual(issues.filter(i => i.startsWith('missing media')).length, 2);
  assert.ok(issues.some(i => i.includes('gone.mp3')));
});

test('a draft saved by an untested CapCut version gets a warning', () => {
  const d = speedDraft('versions');
  const warned = () => d.validate().warnings.some(w => w.includes('tested with CapCut'));
  d.content.last_modified_platform = { app_version: '9.5.0' }; d.content.new_version = '187.0.0';
  assert.equal(warned(), false);
  assert.equal(d.timeline().versionWarning, undefined);
  d.content.last_modified_platform.app_version = '9.6.0';
  assert.equal(warned(), true);
  assert.match(d.timeline().versionWarning, /CapCut 9\.6\.0/);
  d.content.last_modified_platform.app_version = '9.5.0'; d.content.new_version = '190.0.0';
  assert.equal(warned(), true);
});

test('added media is registered in draft_meta_info.json and linked by local_material_id', () => {
  const d = speedDraft('register');
  const [a, b, song] = ['a.mp4', 'b.mp4', 'song.mp3'].map(n => { const f = path.join(root, 'reg-' + n); fs.writeFileSync(f, ''); return f; });
  d.content.materials.audios = [{ id: 'LIB', type: 'music', music_id: '7647', name: 'Library song', category_name: 'music', path: 'lib.mp3' }];
  d.content.tracks.push({ id: 'TA', type: 'audio', segments: [{ id: 'm', material_id: 'LIB', speed: 1, extra_material_refs: [], target_timerange: { start: 0, duration: 1e6 }, source_timerange: { start: 0, duration: 1e6 } }] });
  d._tpl = null;
  d.meta = { draft_materials: [{ type: 0, value: [{ id: 'existing-a', file_Path: a.replace(/\\/g, '/'), metetype: 'video' }] }, { type: 1, value: [] }] };

  const mat = segId => { const s = seg(d, segId); return [...d.content.materials.videos, ...d.content.materials.audios].find(m => m.id === s.material_id); };
  assert.equal(mat(d.addVideo(a, { durUs: 1e6 }).segmentId).local_material_id, 'existing-a');   // same file -> reuse

  const vb = mat(d.addVideo(b, { durUs: 1e6 }).segmentId);
  const eb = d.meta.draft_materials[0].value.find(e => e.id === vb.local_material_id);
  assert.equal(eb.file_Path, b.replace(/\\/g, '/'));
  assert.equal(eb.metetype, 'video');

  const au = mat(d.addAudio(song, { durUs: 1e6 }).segmentId);
  assert.equal(au.type, 'extract_music');
  assert.equal(au.music_id, '');                       // not the library track any more
  assert.equal(au.category_name, 'local');
  const es = d.meta.draft_materials[0].value.find(e => e.id === au.local_material_id);
  assert.equal(es.metetype, 'music');
  assert.equal(es.width, 0);
  assert.equal(d.meta.draft_materials[0].value.length, 3);

  d.save({ force: true });                             // meta is written with the draft
  const onDisk = JSON.parse(fs.readFileSync(path.join(drafts, 'register', 'draft_meta_info.json'), 'utf8'));
  assert.equal(onDisk.draft_materials[0].value.length, 3);
});

test('save writes every timeline mirror CapCut keeps, and nothing else', () => {
  const d = speedDraft('mirrors');
  const dir = path.join(drafts, 'mirrors');
  d.content.id = 'TL-1';
  const nested = path.join(dir, 'Timelines', 'TL-1'), other = path.join(dir, 'Timelines', 'TL-OTHER');
  fs.mkdirSync(nested, { recursive: true }); fs.mkdirSync(other, { recursive: true });
  for (const f of [path.join(dir, 'template-2.tmp'), path.join(nested, 'draft_content.json'), path.join(nested, 'template-2.tmp'), path.join(other, 'draft_content.json'), path.join(dir, 'template.tmp')]) fs.writeFileSync(f, 'old');

  d.trimSegment('clip', { durUs: 7e6 });
  const { written } = d.save({ force: true });
  assert.equal(written.length, 4);
  for (const f of [path.join(dir, 'draft_content.json'), path.join(dir, 'template-2.tmp'), path.join(nested, 'draft_content.json'), path.join(nested, 'template-2.tmp')]) {
    assert.equal(JSON.parse(fs.readFileSync(f, 'utf8')).duration, 7e6, f);
    assert.equal(fs.readFileSync(f + '.mcpbak', 'utf8') !== '', true);
  }
  assert.equal(fs.readFileSync(path.join(other, 'draft_content.json'), 'utf8'), 'old');  // other timelines untouched
  assert.equal(fs.readFileSync(path.join(dir, 'template.tmp'), 'utf8'), 'old');          // not a mirror
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
