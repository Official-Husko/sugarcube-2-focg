/***********************************************************************************************************************

	extensions/ecmascript-polyfills.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

(() => {
	/*******************************************************************************
		Polyfills.
	*******************************************************************************/

	/*
		[ES2022] Returns whether the given object has an own property by the given name.
	*/
	if (!Object.hasOwn) {
		// Cache the `<Object>.hasOwnProperty()` method.
		const hasOwnProperty = Object.prototype.hasOwnProperty;

		Object.defineProperty(Object, 'hasOwn', {
			configurable : true,
			writable     : true,

			value(O, P) {
				return hasOwnProperty.call(Object(O), P);
			}
		});
	}

	/*
		[? ES2025 ?] Returns a copy of the given string with all RegExp metacharacters escaped.

		WARNING: Does not replace lone surrogates with their escape sequences.
	*/
	if (!RegExp.escape) {
		(() => {
			const isAlphaNumCharRe    = /[0-9A-Za-z]/;
			const isRegExpMetaCharRe  = /[$*+./?()[\\\]^{|}]/;
			const isControlCharRe     = /[\t\n\v\f\r]/;
			const isEscapedCharRe     = /[\x20!"#%&',\-:;<=>@`~\xa0]/;
			const isUniSpaceCharRe    = /[\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/u;
			// const isHiSurrogateCharRe = /[\uD800-\uDBFF]/u;
			// const isLoSurrogateCharRe = /[\uDC00-\uDFFF]/u;

			const ControlCharTable = new Map([
				['\t', '\\t'],
				['\n', '\\n'],
				['\v', '\\v'],
				['\f', '\\f'],
				['\r', '\\r']
			]);

			Object.defineProperty(RegExp, 'escape', {
				configurable : true,
				writable     : true,

				value(str) {
					const val = String(str);

					if (!val) {
						return val;
					}

					let escaped = '';

					for (const ch of val) {
						if (escaped === '' && isAlphaNumCharRe.test(ch)) {
							escaped += `\\x${ch.charCodeAt(0).toString(16).padStart(2, '0')}`;
						}
						else if (isRegExpMetaCharRe.test(ch)) {
							escaped += `\\${ch}`;
						}
						else if (isControlCharRe.test(ch)) {
							escaped += ControlCharTable.get(ch);
						}
						else if (isEscapedCharRe.test(ch)) {
							escaped += `\\x${ch.charCodeAt(0).toString(16).padStart(2, '0')}`;
						}
						else if (isUniSpaceCharRe.test(ch)) {
							escaped += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
						}
						else {
							escaped += ch;
						}
					}

					return escaped;
				}
			});
		})();
	}
})();
