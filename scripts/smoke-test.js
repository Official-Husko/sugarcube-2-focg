#!/usr/bin/env node
/***********************************************************************************************************************

	scripts/smoke-test.js

	A headless-browser smoke test for a built Twine 2 story format.

	Usage:
		node scripts/smoke-test.js [path/to/format.js]

	The path defaults to build/twine2/sugarcube-2/format.js.  Requires the `playwright` package and a Chromium install
	(`npm i -D playwright && npx playwright install chromium`).

***********************************************************************************************************************/
/* eslint-env node, es2021 */
/* eslint-disable strict */
'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

const formatPath = path.resolve(process.argv[2] || 'build/twine2/sugarcube-2/format.js');

// Passages of the test story.  `{{`/`}}` are used for `<<`/`>>` to keep the source readable.
const passages = {
	Start : `
		{{set $x to 41}}{{set $x++}}X=$x;
		{{if $x is 42}}IF-OK{{else}}IF-BAD{{/if}};
		{{for _i to 0; _i lt 3; _i++}}[{{print _i}}]{{/for}};
		{{switch $x}}{{case 42}}SW-OK{{default}}SW-BAD{{/switch}};
		{{widget "w1"}}W:{{print _args[0]}}{{/widget}}{{w1 "a"}};
		{{set $map to new Map([[1, 'one']])}}{{set $set to new Set([7])}}{{set $date to new Date(86400000)}}
		{{set $obj to JSON.parse('{"a":[1,2,{"b":3}]}')}}
		{{timed 50ms}}TIMED-OK{{/timed}}
		{{link "L1" "Next"}}{{set $linked to true}}{{/link}}
		{{button "Btn"}}{{set $btn to 1}}{{/button}}`,
	Next : `At next; {{set $n to 1}}$x`,
	Err  : `{{run (void 0).boom()}}`
};

function escapeHtml(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildStoryHtml(source) {
	const data = [
		'<tw-storydata name="Smoke" startnode="1" creator="smoke" creator-version="1" ',
		'ifid="D674C58C-DEFA-4F70-B7A2-27742230C0FC" zoom="1" format="SugarCube" format-version="2.38.0" options="" hidden>',
		'<style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style>',
		'<script role="script" id="twine-user-script" type="text/twine-javascript"></script>',
		Object.entries(passages).map(([name, text], i) => {
			const body = escapeHtml(text.replace(/\{\{/g, '<<').replace(/\}\}/g, '>>'));
			return `<tw-passagedata pid="${i + 1}" name="${name}" tags="" position="0,0" size="100,100">${body}</tw-passagedata>`;
		}).join('\n'),
		'</tw-storydata>'
	].join('\n');

	let format;
	new Function('window', fs.readFileSync(formatPath, 'utf8'))({ storyFormat : f => { format = f; } });

	return format.source.replace('{{STORY_NAME}}', 'Smoke').replace('{{STORY_DATA}}', () => data);
}

let failures = 0;
function check(label, ok, extra) {
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && extra !== undefined ? `  (${JSON.stringify(extra)})` : ''}`);
	if (!ok) {
		failures++;
	}
}

(async () => {
	const { chromium } = require('playwright');
	const tmp     = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-smoke-'));
	const file    = path.join(tmp, 'story.html');
	fs.writeFileSync(file, buildStoryHtml());

	const browser = await chromium.launch();
	const page    = await browser.newPage();
	const errors  = [];
	page.on('pageerror', ex => errors.push(`pageerror: ${ex.message}`));
	page.on('console', msg => msg.type() === 'error' && errors.push(`console: ${msg.text()}`));

	try {
		await page.goto(`file://${file}`);
		await page.waitForSelector('#passages .passage', { timeout : 15000 });

		const text = (await page.textContent('#passages .passage')).replace(/\s+/g, ' ');
		check('variables & printing',   text.includes('X=42'), text);
		check('<<if>>',                 text.includes('IF-OK'));
		check('<<for>>',                text.includes('[0][1][2]'));
		check('<<switch>>',             text.includes('SW-OK'));
		check('<<widget>>',             text.includes('W:a'));

		await page.waitForFunction(() => document.querySelector('#passages .passage').textContent.includes('TIMED-OK'), null, { timeout : 5000 })
			.then(() => check('<<timed>>', true), () => check('<<timed>>', false));

		await page.click('#passages .passage button >> text=Btn');
		check('<<button>>', await page.evaluate(() => SugarCube.State.variables.btn === 1));

		// Compatibility surface that story code and plugins may rely on.
		const compat = await page.evaluate(() => ({
			saveAs      : typeof window.saveAs,
			throttle    : typeof jQuery.throttle,
			debounce    : typeof jQuery.debounce,
			imagesLoaded: typeof jQuery.fn.imagesLoaded,
			seedrandom  : typeof Math.seedrandom,
			lzstring    : typeof LZString
		}));
		check('compat globals present', Object.values(compat).every(v => v === 'function' || v === 'object'), compat);

		// Navigation, history, undo.
		await page.click('#passages .passage a.link-internal >> text=L1');
		await page.waitForFunction(() => document.querySelector('#passages .passage').textContent.includes('At next'));
		const nav = await page.evaluate(() => ({
			passage : SugarCube.State.passage,
			len     : SugarCube.State.length,
			linked  : SugarCube.State.variables.linked,
			n       : SugarCube.State.variables.n
		}));
		check('navigation + <<link>> body', nav.passage === 'Next' && nav.len === 2 && nav.linked === true && nav.n === 1, nav);

		// Saves: slot round trip must preserve special types.
		await page.evaluate(() => {
			const { Save, State } = SugarCube;
			Save.browser.slot.save(0, 'smoke');
			State.variables.x = 'changed';
			Save.browser.slot.load(0);
		});
		await page.waitForFunction(() => SugarCube.State.passage === 'Next' && SugarCube.State.variables.x === 42);
		const restored = await page.evaluate(() => {
			const v = SugarCube.State.variables;
			return {
				map  : v.map instanceof Map && v.map.get(1) === 'one',
				set  : v.set instanceof Set && v.set.has(7),
				date : v.date instanceof Date && v.date.getTime() === 86400000,
				obj  : JSON.stringify(v.obj) === '{"a":[1,2,{"b":3}]}'
			};
		});
		check('slot save/load restores Map/Set/Date/Object', Object.values(restored).every(Boolean), restored);

		// Base64 export/import is the path used by "save to disk" and "export".
		const b64 = await page.evaluate(() => {
			const { Save, State } = SugarCube;
			const code = Save.base64.export ? Save.base64.export() : null;
			return { has : typeof code === 'string' && code.length > 0, passage : State.passage };
		});
		check('Save.base64.export', b64.has, b64);

		// Undo.
		await page.evaluate(() => SugarCube.Engine.backward());
		await page.waitForFunction(() => SugarCube.State.passage === 'Start');
		check('Engine.backward()', true);

		// Dialogs.
		await page.evaluate(() => SugarCube.UI.saves());
		await page.waitForSelector('#ui-dialog-body', { state : 'visible' });
		check('UI.saves() dialog opens', (await page.locator('#ui-dialog-body').count()) === 1);
		await page.evaluate(() => SugarCube.Dialog.close());

		// Error views carry (path-scrubbed) stack traces.
		await page.evaluate(() => SugarCube.Engine.play('Err'));
		await page.waitForSelector('#passages .error-view');
		const err = await page.evaluate(() => {
			const view = document.querySelector('#passages .error-view');
			return {
				hasMesg   : !!view.querySelector('.error'),
				stackRows : view.querySelectorAll('.error-source div').length,
				fileLeak  : /file:\/\//.test(view.textContent)
			};
		});
		check('error view renders with stack trace', err.hasMesg && err.stackRows > 0 && !err.fileLeak, err);

		// Seeded PRNG (the vendored seedrandom); saves depend on its exact output.
		const prng = await page.evaluate(() => {
			const draw = () => { const r = new Math.seedrandom('seed'); return [r(), r(), r()]; };
			return { a : draw(), b : draw() };
		});
		check('seedrandom is deterministic', JSON.stringify(prng.a) === JSON.stringify(prng.b), prng);
		console.log(`INFO  seedrandom('seed') -> ${JSON.stringify(prng.a)}`);

		check('no page or console errors', errors.length === 0, errors);
	}
	catch (ex) {
		check(`unexpected exception: ${ex.message}`, false);
	}
	finally {
		await browser.close();
		fs.rmSync(tmp, { recursive : true, force : true });
	}

	console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed');
	process.exit(failures ? 1 : 0);
})();
