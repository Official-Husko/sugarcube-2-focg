/***********************************************************************************************************************

	extensions/jquery/images-loaded-plugin.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/

/*
	Images-loaded method plugin.

	Replaces the vendored "imagesLoaded" library by David DeSandro, retaining the subset of its jQuery API that
	SugarCube uses.

	`<jQuery>.imagesLoaded([callback])`
	    Returns a jQuery promise that is resolved once every `<img>` within, or matching, the target element(s) has
	    loaded, or rejected, once all have settled, if any failed to load.  `progress` is notified as each image
	    settles.  The optional `callback` is invoked on completion, regardless of outcome.
*/
(() => {
	Object.defineProperty(jQuery.fn, 'imagesLoaded', {
		configurable : true,
		writable     : true,

		value(callback) {
			const deferred = jQuery.Deferred(); // eslint-disable-line new-cap
			const images   = this.find('img').addBack('img').get();
			let   pending  = images.length;
			let   failed   = 0;

			function settle(img, isLoaded) {
				if (!isLoaded) {
					++failed;
				}

				deferred.notify(img, isLoaded);

				if (--pending === 0) {
					deferred[failed > 0 ? 'reject' : 'resolve'](images);
				}
			}

			if (pending === 0) {
				// Always complete asynchronously, even when there's nothing to wait on.
				setTimeout(() => deferred.resolve(images), 0);
			}
			else {
				images.forEach(img => {
					if (img.complete) {
						// Already settled, so report asynchronously for consistency.
						setTimeout(() => settle(img, img.naturalWidth > 0), 0);
					}
					else {
						img.addEventListener('load', () => settle(img, true), { once : true });
						img.addEventListener('error', () => settle(img, false), { once : true });
					}
				});
			}

			if (typeof callback === 'function') {
				deferred.always(() => callback.call(this, images));
			}

			return deferred.promise();
		}
	});
})();
