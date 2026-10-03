const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const filename = path.join(__dirname, '../src/components/reader/audio-timeline.ts');
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const timeline = {};
vm.runInNewContext(outputText, { exports: timeline }, { filename });

test('chapter seeking crosses segment boundaries and clamps to the chapter', () => {
  assert.deepEqual({ ...timeline.seekTarget([8, 12, 5], 10) }, { index: 1, offset: 2 });
  assert.deepEqual({ ...timeline.seekTarget([8, 12, 5], 999) }, { index: 2, offset: 5 });
  assert.equal(timeline.chapterPosition([8, 12, 5], 1, 2), 10);
});

test('invalid timeline input cannot reach the audio seek call', () => {
  assert.equal(timeline.timelineFraction(undefined, 300), null);
  assert.equal(timeline.timelineFraction(20, 0), null);
  assert.equal(timeline.seekTarget([8, 12], NaN), null);
  assert.equal(timeline.seekTarget([8, 12], Infinity), null);
  assert.equal(timeline.chapterPosition([8, 12], 1, NaN), 8);
  assert.equal(timeline.segmentDuration({ text: 'A short sentence', duration: Infinity }), 1.2);
});
