# Modernization notes

State of the Fort of Chains: Galvanized fork of SugarCube 2 after syncing with upstream
(`tmedwards/sugarcube-2`, `develop`), what was changed, what was measured, and what is still open.

Conventions used below:

- **Measured** means it was run and the number is real. Everything else comes from reading the code and is cited as `file:line`.
- Line numbers refer to the tree at the time of writing and will drift.
- "Baseline browsers" means Chrome/Edge 100, Firefox 102, Safari/iOS 15.4 (all released in or before 2022).

---

## 1. Upstream sync

The fork was 7 commits ahead of and 66 commits behind `upstream/develop` (last common commit `65854a8`, June 2025).
All 66 were merged. Notable upstream changes now included:

- optional `disabled` attribute on macros;
- a setting to turn off delta coding (`Config.history.disableDeltas`);
- the cookie storage adapter was removed;
- `<String>.includesAll()/includesAny()` and the `Array` equivalents;
- new options on `<<numberbox>>`, `<<textbox>>`, `<<textarea>>`, `<<checkbox>>`, `<<button>>`/`<<link>>`;
- `sc-icons` updated to Font Awesome Free 7.1.0;
- several old polyfills removed.

Conflicts were limited to files this fork had deleted (`docs/`, `template/`):

- `docs/` stays deleted.
- `template/` was **restored from upstream**. `build.js` reads `template/intro.js`, `outro.js`, `twine1/*` and
  `twine2/*`, and the fork had no `template/` directory at all, so it could not be built from source (only the
  committed `dist/format.js` existed). If removing `template/` was intentional, the build needs another source for it.

The version is now `2.38.0-alpha.10`. To keep syncing:

```sh
git remote add upstream https://github.com/tmedwards/sugarcube-2.git
git fetch upstream
git merge upstream/develop
```

---

## 2. What was changed

| Area | Change | Result |
|---|---|---|
| Build targets | `.browserslistrc` now lists evergreen browsers only. Previously `last 3 versions` pulled in IE 9–11, BlackBerry and IE Mobile, so Babel emitted ES5 for browsers that cannot pass the runtime's own ES2019 gate. | Measured: -47 KB |
| Minifier | Terser `mangle` enabled. Safe because Terser keeps names visible to direct `eval()` (see §5). | Measured: -62 KB |
| Vendor libs | FileSaver, imagesLoaded and jquery-throttle-debounce replaced with first-party code in `src/extensions/jquery/` and `src/lib/save-as.js`. Public globals (`saveAs`, `jQuery.throttle`, `jQuery.debounce`, `jQuery.fn.imagesLoaded`) are unchanged. | Measured: -8 KB, 3 fewer third-party blobs |
| Icon font | New opt-in `--subset-icons` / `--keep-icons` build flags (see §3). | Measured: -147 KB |
| Feature tests | `lib/has.js` simplified; `Object.hasOwn` polyfill removed. The public `Has.*` keys are unchanged. | small |
| Tooling | `npm run build / build:small / lint / lint:css / smoke / test`; CI workflow; release workflow moved from Node 16 (EOL, below the declared engine) to 22 with `npm ci`; in-range dependency updates; `build.js` now exits non-zero on failure (it used to print the error and exit 0); `engine` → `engines` in `package.json`. | |
| Bug fixes | See §4. | |
| Tests | `scripts/smoke-test.js`: headless Chromium run of a generated story, 27 checks (see §5). | |

### Size results (Twine 2 `format.js`, measured)

| Build | Bytes | Gzipped |
|---|---|---|
| Before (merged tree, old config) | 685,892 | 244,464 |
| Now, default (`npm run build`) | 569,169 | 225,166 |
| Now, `--subset-icons` (`npm run build:small`) | 422,113 | 112,265 |

Build time is ~3.4 s. Babel is about 1.3 s of that and now changes the output by only ~3 KB at these targets
(`-n` skips it), so swapping the build toolchain for something faster would not buy anything worth the churn.

---

## 3. Build reference

```sh
npm ci
npm run build                 # both Twine targets -> build/
node build.js -b 2            # Twine 2 only
node build.js -b 2 -d -u -n   # debug code kept, unminified, untranspiled (readable output)
node build.js -i              # embed only the icon glyphs the UI uses  (= npm run build:small)
node build.js -i -k f001,f0e7 # ...plus extra codepoints your story text uses
npm run test                  # lint + build + smoke test
```

`--subset-icons` extracts every private-use codepoint referenced by the UI's own CSS/JS (26 glyphs) and subsets the
embedded WOFF2 with `subset-font`. It is **opt-in** because `[data-icon]`, `[data-icon-before]` and `[data-icon-after]`
(`src/css/core.css`) are author-facing: a story may reference any Font Awesome glyph. Search the game's passages and
CSS for `data-icon` and `\uf…` / `&#xf…;` before turning it on, and pass anything found through `--keep-icons`.

`dist/format.js` is a committed Twine 2 build **of version 2.37.3**, not of this tree, and no script regenerates it.
Either regenerate it from `build/twine2/sugarcube-2/` as part of a release or stop committing it.

---

## 4. Bugs found and fixed

Each has a regression check in the smoke test that fails on the pre-fix build.

| Bug | Where | Effect |
|---|---|---|
| `Serial.stringify` patches `toJSON` onto `Date/Function/Map/RegExp/Set` prototypes and restored them outside a `finally`. | `src/lib/serial.js` | A throw (for example a circular reference) left those prototypes patched for the rest of the session. |
| `Alert.fatal(null, ex.message, ex)` | `src/sugarcube.js` | The error was passed as a string, so startup failures never showed a stack trace. |
| `isExternalLink` used a global RegExp with `.test()`. | `src/util/isexternallink.js` | For links without `/ \ ?` (such as `mailto:`) the result alternated true/false on repeated calls (measured `[true,false,true,false]`). |
| `MacroContext#shadows` did `Array.from(null)`. | `src/macro/macrocontext.js` | `<<capture "x">>` with no `$`/`_` variable threw from its cleanup. |
| `SimpleAudio.lists.add` called `this.error(...)`. | `src/audio/simpleaudio.js` | Invalid list IDs gave `TypeError: this.error is not a function` instead of the real message. |
| Build errors were swallowed. | `build.js` | CI saw exit code 0 for a failed build. |
| Lint errors in fork-specific code. | `if.js`, `set-run.js`, `webstorage.js`, `appenderror.js` | Dead comments, unused globals; lint is clean now. |

---

## 5. Test strategy

`scripts/smoke-test.js` builds a story at run time, loads the real `format.js` in Chromium and checks (27 checks):

- variables, `<<if>> <<for>> <<switch>> <<widget>> <<timed>> <<button>> <<link>>`, navigation, history length;
- slot saves round-tripping `Map`, `Set`, `Date` and nested objects; base64 export; `Engine.backward()`;
- the Saves dialog; the fork's error view with scrubbed stack frames;
- behaviour of the replacement libs: throttle/debounce timing, `imagesLoaded` resolve/reject/empty, `saveAs` triggering a named download;
- **story JavaScript scope**: all 84 top-level engine identifiers must be visible *by name* to story JS, plus `Macro.add`,
  `Setting.addToggle`, `setup` and `l10nStrings`;
- the regressions listed in §4; no page or console errors.

Why the scope probe matters: story JavaScript, widgets and TwineScript run through a **direct `eval()`** inside the
engine's closure (`src/markup/scripting.js:652-668`). That is how `Config`, `State`, `Macro`, `l10nStrings`, helper
functions and the legacy globals are reachable from author code without being on `window`. Anything that renames those
identifiers breaks every story. Terser's default (`mangle.eval: false`) keeps names visible to `eval`, which was
**verified by building with `mangle: { eval: true }`: the smoke test then fails dozens of checks** (`State is not
defined`, missing macros, and so on). Do not set `mangle.eval`, `mangle.toplevel` or `keep_fnames` changes without
re-running the test.

Run it against any build: `node scripts/smoke-test.js path/to/format.js`. It needs `playwright` and a Chromium install.

---

## 6. Could the project move to TypeScript / TSX / Tailwind?

### Starting point (measured)

- 114 JS files, 26,425 lines in `src/`.
- No modules. `build.js` concatenates files in a hand-ordered list (`build.js:22-71`) inside one IIFE
  (`template/intro.js`). About 84 top-level identifiers are shared by name; some are used at load time, so order is a hard dependency.
- Type-checking the existing JS with `tsc --allowJs --checkJs` under lenient settings (no `strict`) reports **257 errors**.
  Most are missing declarations, not logic errors: `BUILD_DEBUG` ×57, jQuery plugin methods (`ariaClick`,
  `ariaDisabled`, `wikiWithOptions`) ≈50, `Math.clamp` ×14, `LZString` ×10, other prototype extensions
  (`splitOrEmpty`, `first`, …). One ambient `.d.ts` clears about half of them (134 of 257 in the categories above).

### TypeScript: feasible, incremental, worth doing in stages

1. **Type-check the JS you have** (low risk, no runtime change): add `tsconfig.json` with `allowJs`, `checkJs`,
   `noEmit`, and an ambient `types.d.ts` that declares the build globals, the `String/Array/Math` extensions, the jQuery
   plugins and the vendor globals. Add `tsc --noEmit` to CI. Triage what is left (≈120 errors; some are real, such as `Expected 0 arguments, but got 2`). A day or two.
2. **JSDoc-annotate** the core (`state.js`, `save.js`, `engine.js`, `config.js`) so the type checker understands the
   structures that matter (moments, save objects, passage descriptors). Still no build change.
3. **Rename files to `.ts` one by one** and keep the concatenated-script architecture: type-strip each file
   (esbuild `transform`, or `tsc` with `isolatedModules`) and concatenate exactly as today. No module system needed.
4. **ES modules** (high effort, high risk): the only step that changes architecture. It would remove the ordering
   hazards and enable unit tests and tree-shaking, but the direct-`eval` scope (§5) must be preserved: the evaluator
   would need a generated function whose parameter list injects every name story code can see. Possible, but it is a
   design change and a compatibility risk for every story. Do this only if there is a concrete need.

Steps 1–3 are cheap insurance. Several of the bugs in §4 are the kind a type checker reports
(wrong argument count, calling a method that does not exist).

### TSX / React: not a fit

There is no JSX-shaped UI to convert. The UI is four dialogs and a sidebar (`src/ui.js`, `uibar.js`, `dialog.js`,
about 900 lines) built imperatively and injected into a DOM that **story authors restyle through ID/class
selectors** (`#ui-bar`, `#ui-dialog-body.saves …`, `.passage`). A component framework would add a runtime (React ≈ 40 KB,
Preact ≈ 4 KB, Lit ≈ 6 KB) to a 570 KB format, still need hand-managed DOM for the Wikifier output, and risk
changing the markup those author selectors depend on. If the dialogs are ever rebuilt, use the native `<dialog>`
element and plain DOM instead (see §8).

### Tailwind: not a fit for the format; fine in the game

- The format's CSS is only ~1,500 lines / 35 KB of source (`src/css/` without the font). The size problem is the
  151 KB icon font, which Tailwind does not touch.
- Tailwind is utility-class-in-markup. The format generates its HTML in JavaScript and authors override with ID-qualified
  selectors (`#ui-dialog-body.saves #saves-list button.delete:not(:disabled):hover`). Utilities have very low
  specificity, so adopting them would change the cascade story authors rely on.
- Better fit: CSS custom properties for the ~38 colour literals (`#444` ×31, `#eee` ×19, `#222` ×13 …) so themes
  become a one-block override and a `prefers-color-scheme` variant becomes trivial; native nesting; `:is()`;
  `:focus-visible`.
- If the **game's own passages** want Tailwind, that is independent of the story format: compile it in the game's
  Tweego/Twine pipeline into story CSS.

---

## 7. Open findings, ranked

Evidence is `file:line`; "measured" is called out. None of these are fixed here unless §4 says so.

### Correctness and robustness

1. **Catastrophic regex backtracking in the macro parser** (`src/markup/parserlib.js:117`). With no closing `>>` and many quoted
   strings the lookahead is exponential (measured: 6 strings 0.5 ms, 12 → 21 ms, 14 → 131 ms, 16 → 849 ms; ≈×2.5 per extra
   string, ~44 s at 20, from a separate measurement). One forgotten `>>` can freeze the tab. Fix: make the alternatives mutually exclusive
   (`[^>"'`/\[]` instead of `[^>]`).
2. **`Engine.play` has no `try/finally`** (`src/engine.js:474-834`). Any throw (event handler, render, autosave quota)
   leaves the engine permanently non-idle (`Engine.isIdle()` false). Autosave runs inside it (`:811-813`) with no catch.
3. **Parsers added after the first render are ignored** (`src/markup/wikifier.js:49-51, 435-473, 503-521`); profiles
   compile once. `Parser.add/delete` should invalidate them (check for in-flight renders first).
4. **Unguarded storage reads**: `WebStorageAdapter.get` throws on corrupt or foreign values with no recovery
   (`src/storage/adapters/webstorage.js:102-115`), which would break `Setting.load`, `Save.findNewest`, `State.restore`.
5. **Imports are destructive**: `Save` import clears all saves before writing the new ones (`src/save.js:689-690, 838-839`); a
   quota failure midway loses saves. Write to temporary keys, then swap.
6. `Serial.parse` evaluates `(revive:)` entries with `eval` (`src/lib/serial.js:96`): importing an untrusted `.save`
   file executes code. This is the documented `reviveWrapper` contract, but worth a conscious decision.
7. `ui.js:23` interpolates dialog messages into HTML unescaped; callers pass exception messages that can contain
   imported data.
8. `uibar.js:212, 240`: cleanup branches call `.off()` on the wrong object (handlers are bound on `document`).
9. `L10n.get` renders the literal word `undefined` for unknown placeholders (`src/l10n/l10n.js:206-214`).
10. `Story.add` stringifies `descriptor.tags` via `setAttribute` (`src/story.js:354`): omitted tags become the tag `"undefined"`.
11. Dead deprecation guards: `this.name === 'silently'` / `'display'` can never be true because `MacroContext.name` is the
    alias target (`silent.js:19`, `include.js:16`); `MacroContext.error` reports the canonical name (comment says display name).
12. Locale hygiene: `saveErrorLoadTooEarly` missing from `locale/TEMPLATE.js` and all locales; stale `warningNoWebStorage` in all six.

### Runtime performance (per navigation unless stated)

13. **PRNG replay**: `State.create` sets the pull count and then `momentActivate` rebuilds the PRNG and replays every pull
    (`src/state.js:462-473, 311-316, 619-630`): O(total `random()` calls so far) per passage, growing over a playthrough.
    Skip the rebuild on the create path; rebuild only on `goTo/go/unmarshal`.
14. **Two deep clones of all variables per navigation** (`src/state.js:242` and `:287/299`). `clone()` is recursive with a
    closure per property (`src/util/clone.js:98`); one clone can be dropped.
15. **Autosave cost** (when `maxAutoSaves > 0`, every turn, synchronous): lists all storage keys, decompresses and parses every
    `save.auto.info:*` chunk to find the newest (`src/save.js:203-231`), clones the full history, delta-encodes, then two
    stringify + LZ compress writes. Remember the last index/date in memory; skip the history clone when no `onSave`
    handlers exist (`state.js:118`, `save.js:936`).
16. **Storage layer**: every value is JSON → LZ-UTF16 even when tiny (`webstorage.js:176-182`); `keys()` scans the whole
    origin with a regex per key (`:74-88`); metadata/settings rewrite the entire object per change (`state.js:719-787`);
    settings sliders persist on every `input` event (`ui.js:604-606`).
17. **`expired` is unbounded** (`state.js:468`) and is copied into every session write and save.
18. **Parser hot path** (`src/markup/`): zero sticky (`y`) regexes, 36 `lastIndex` assignments, so a failed probe scans
    the rest of the passage; `terminatorRegExp` is rebuilt per `subWikify` and searched every iteration
    (`wikifier.js:146-162`); `htmlTag` compiles a RegExp per tag (`parserlib.js:1726`); `Scripting.desugar` is
    re-run on every macro call with no memoisation (`parserlib.js:387-389`) and `eval` runs per quoted macro argument
    (`:662`) and per `$var` in text (`state.js:694`).
19. **jQuery churn**: `jQuery(document.createElement(x)).appendTo(...)` in nearly every parser handler, including one per
    newline (`parserlib.js:1428`); `ariaClick` allocates ~6 jQuery objects and two handlers per link
    (`src/extensions/jquery/aria-plugin.js:143-199`). Delegated handlers on `#passages` would help link-heavy passages.
20. `State.passages` allocates a new array per call and backs `hasVisited/lastVisited/previous/visited` (`state.js:209-211`).
21. Per-passage `jQuery('#story').find('a,link,button,input,select,textarea')…` tabindex sweep (`engine.js:804-808`).
22. Test mode only: debug bar re-serialises every watched variable every 200 ms with no depth or cycle guard
    (`debugbar.js:337, 594-676`).

### Legacy and dead code

23. **Overdue deprecation removal**: `src/globals.js:18` and `src/save.js:975` say to delete the legacy objects "on January
    2026". The six legacy task objects (`predisplay`, `postrender`, …) are still iterated five times per `Engine.play`.
    Removing them (and `Config`/`Save`/`Engine` deprecated shims, `deprecated-macros.js`) is a **breaking change for
    any story that still uses them**; confirm the game does not before deleting.
24. IE/legacy branches that cannot run on baseline browsers: `lib/browser.js` sniffing, `fullscreen.js` and `visibility.js`
    `moz`/`ms` rows, `stylewrapper.js` IE ≤10 branches, `util/parseurl.js` anchor-element parser and IE patch,
    `getactiveelement.js`, `hasblockcontext.js` `currentStyle` fallback, `core.css` `-ms-*` rules, `normalize.css` v3.0.3 (2015).
25. `storage.name !== 'cookie'` checks in `save.js:435, 549` are dead since the cookie adapter was removed.
26. `lib/outlines.js` rewrites a universal-selector `<style>` on every keyboard/mouse mode switch; `:focus-visible`
    (baseline) replaces it and about ten selector pairs in `core.css`.
27. The icon font ships all 1,408 glyphs for 26 used (see §3).

### Tooling

28. ESLint 8, Stylelint 14, Babel 7, Commander 9 are behind their latest majors (ESLint 10, Stylelint 17, Babel 8,
    Commander 15). ESLint 9+ needs a flat-config migration; deferred because it is a config rewrite with no user-visible gain.
29. `@babel/cli`, `cmark-gfm-js`, `update-browserslist-db` are unused by `build.js`.
30. `README.md` still says Node ≥16 and clones `Official-Husko/fork-of-chains`; `package.json` requires ≥18.3.

---

## 8. Further ideas, with honest trade-offs

| Idea | Gain | Cost / risk |
|---|---|---|
| Raise the baseline to Chrome 120 / Firefox 117 / Safari 17.2 and use native CSS nesting, dropping `postcss-mixins` | Smaller, more readable CSS; one fewer build dependency | Drops older devices; only one mixin (6 uses) actually exists, so the saving is mostly cosmetic |
| CSS custom properties for the palette | Themeable without selector wars; light mode in a few lines | Pure refactor; keep ID-qualified selectors so author overrides still win |
| Native `<dialog>` + `inert` instead of `dialog.js` layout code | Removes JS centring, a MutationObserver, `scrollbarWidth` measurement and the tabindex/aria sweep | Visual parity needs checking (JS rounds insets to whole pixels, 10 px minimum) |
| IndexedDB / OPFS save backend | Escapes the ~5 MB `localStorage` quota that large saves hit | The `storage` abstraction is synchronous; save code becomes async throughout |
| Move compression/serialisation of autosaves off the main thread (Worker) | Removes the per-turn stall on large states | Needs the async save path above |
| `navigator.storage.persist()` | Fewer silent evictions of saves on browsers that clear storage | One call; user-prompt behaviour varies |
| Replace `seedrandom` with sfc32/mulberry32 | Smaller | **Changes the random sequence for existing seeds; breaks save compatibility.** Keep it. |
| Replace `lz-string` with `CompressionStream` | Faster, native | **Breaks existing saves** and is async. Keep it. |
| jQuery 4 | Smaller, modern | Removes `$.trim`, `$.isArray` and similar; likely to break game code |
| Wikifier sticky regexes + memoised `desugar` | Biggest parse-time win for large passages | Needs the smoke test extended with a macro-heavy corpus first |

Suggested order for a next pass: the `Engine.play` `try/finally` and storage-read guards (§7 #2, #4), the macro regex fix
(#1), the PRNG replay and double clone (#13, #14), then autosave (#15). Each should come with a smoke-test case first.
