/***********************************************************************************************************************

	lib/has.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
var Has = (() => { // eslint-disable-line no-unused-vars, no-var
	/*
		NOTE: The aggressive try/catch feature tests are necessitated by
		implementation bugs in various browsers.
	*/

	// Is the `HTMLAudioElement` API available?
	const hasAudioElement = (() => {
		try {
			return typeof document.createElement('audio').canPlayType === 'function';
		}
		catch (ex) { /* no-op */ }

		return false;
	})();

	// Is the `File` API available?
	const hasFile = typeof window.Blob === 'function'
		&& typeof window.File === 'function'
		&& typeof window.FileList === 'function'
		&& typeof window.FileReader === 'function';

	// Is the `geolocation` API available?
	const hasGeolocation = (() => {
		try {
			return 'geolocation' in navigator
				&& typeof navigator.geolocation.getCurrentPosition === 'function'
				&& typeof navigator.geolocation.watchPosition === 'function';
		}
		catch (ex) { /* no-op */ }

		return false;
	})();

	// Is the `performance` API available?
	const hasPerformance = typeof window.performance?.now === 'function';

	// Is the platform a touch device?
	const hasTouch = (() => {
		try {
			return 'ontouchstart' in window
				|| !!navigator.maxTouchPoints;
		}
		catch (ex) { /* no-op */ }

		return false;
	})();

	// Is the transition end event available and by what name?  (Unprefixed everywhere we support.)
	const hasTransitionEndEvent = 'ontransitionend' in window ? 'transitionend' : false;


	/*******************************************************************************
		Object Exports.
	*******************************************************************************/

	return Object.freeze(Object.assign(Object.create(null), {
		audio              : hasAudioElement,
		fileAPI            : hasFile,
		geolocation        : hasGeolocation,
		performance        : hasPerformance,
		touch              : hasTouch,
		transitionEndEvent : hasTransitionEndEvent
	}));
})();
