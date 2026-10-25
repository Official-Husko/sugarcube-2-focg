/***********************************************************************************************************************

	lib/save-as.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Replaces the vendored FileSaver.js library, retaining its `saveAs(blob, filename)` signature.

	Prompts the user to save the given `Blob` as a file via a temporary `<a download>` link.
*/
(() => {
	// Time to wait, in milliseconds, before revoking the object URL, so slow downloads aren't cut short.
	const REVOKE_DELAY = 40000;

	function saveAs(blob, filename = 'download') {
		const url  = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href     = url;
		link.download = filename;
		link.rel      = 'noopener';
		link.hidden   = true;
		document.body.append(link);
		link.click();
		link.remove();

		setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY);
	}

	Object.defineProperty(window, 'saveAs', {
		configurable : true,
		writable     : true,
		value        : saveAs
	});
})();
