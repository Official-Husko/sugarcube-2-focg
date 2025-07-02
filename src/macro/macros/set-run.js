/***********************************************************************************************************************

	macro/macros/set-run.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Macro, Scripting, getErrorMessage */

/*
	<<set>>
*/
Macro.add('set', {
	skipArgs : true,

	handler() {
		if (this.args.full.length === 0) {
			return this.error('no expression specified');
		}

		try {
			Scripting.evalJavaScript(this.args.full);
		}

		/*

		This patch is taken from the original SugarCube v2 fork used by darkofoc.
		Hopefully, this does the same thing as the original patch.
		https://gitgud.io/darkofocdarko/sugarcube-2/-/blob/cc11dbf238824b413c60ca407eccde33aa04605d/src/macros/macrolib.js

		*/

		catch (ex) {
			return this.error(
				`bad evaluation: ${typeof ex === 'object' ? `${ex.name}: ${ex.message}` : ex}`,
				null,
				ex.stack
			);
		}

		// Custom debug view setup.
		if (Config.debug) {
			this.debugView.modes({ hidden : true });
		}
	}
});

/*
	<<run>> — Alias of <<set>>
*/
Macro.add('run', 'set');
