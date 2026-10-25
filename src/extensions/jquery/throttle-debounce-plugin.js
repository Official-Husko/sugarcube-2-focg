/***********************************************************************************************************************

	extensions/jquery/throttle-debounce-plugin.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Throttle & debounce methods plugin.

	Replaces the vendored "jQuery throttle / debounce" plugin by "Cowboy" Ben Alman, retaining its API and semantics.

	`jQuery.throttle(delay [, noTrailing], callback [, debounceMode])`
	    Returns a throttled version of `callback`, which will execute at most once per `delay` milliseconds.

	`jQuery.debounce(delay [, atBegin], callback)`
	    Returns a debounced version of `callback`, which will execute only once `delay` milliseconds have elapsed
	    since the last call.  If `atBegin` is `true`, it executes on the leading edge instead of the trailing edge.
*/
(() => {
	function throttle(delay, ...rest) {
		// Shift the arguments if the optional `noTrailing` was omitted.
		const hasNoTrailing = typeof rest[0] === 'boolean';
		const noTrailing    = hasNoTrailing ? rest[0] : undefined;
		const callback      = hasNoTrailing ? rest[1] : rest[0];
		const debounceMode  = hasNoTrailing ? rest[2] : rest[1];
		let timeoutId;
		let lastExec = 0;

		function wrapper(...args) {
			const elapsed = Date.now() - lastExec;

			const exec = () => {
				lastExec = Date.now();
				callback.apply(this, args);
			};
			const clear = () => {
				timeoutId = undefined;
			};

			if (debounceMode && !timeoutId) {
				exec();
			}

			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			if (debounceMode === undefined && elapsed > delay) {
				exec();
			}
			else if (noTrailing !== true) {
				const wait = debounceMode === undefined ? delay - elapsed : delay;
				timeoutId = setTimeout(debounceMode ? clear : exec, wait);
			}
		}

		// Give the wrapper the same GUID as the callback, so that either may be used to unbind it.
		if (jQuery.guid) {
			wrapper.guid = callback.guid ||= jQuery.guid++; // eslint-disable-line no-param-reassign
		}

		return wrapper;
	}

	function debounce(delay, atBegin, callback) {
		return callback === undefined
			? throttle(delay, atBegin, false)
			: throttle(delay, callback, atBegin !== false);
	}

	Object.defineProperties(jQuery, {
		throttle : {
			configurable : true,
			writable     : true,
			value        : throttle
		},

		debounce : {
			configurable : true,
			writable     : true,
			value        : debounce
		}
	});
})();
