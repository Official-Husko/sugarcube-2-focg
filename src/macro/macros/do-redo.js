/***********************************************************************************************************************

	macro/macros/do-redo.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Macro, Wikifier, triggerEvent */

(() => {
	// Set up our event class name.
	const eventClass = 'redo-target';

	// Set up a global `:redo` event handler that sends non-bubbling
	// `:redo-internal` events to `<<do>>` macros matching the given
	// selector.
	jQuery(document).on(':redo', ev => {
		const redoTags = ev.detail && ev.detail.tags || [];
		const selector = redoTags.length === 0
			? `.${eventClass}`
			: redoTags.map(tag => `.${eventClass}[data-do-tags~="${tag}"]`).join(', ');

		triggerEvent(':redo-internal', jQuery(selector), {
			bubbles : false,
			detail  : ev.detail
		});
	});

	/*
		<<do [element tag] [tag tags]>>
	*/
	Macro.add('do', {
		tags : null,

		handler() {
			const optArgs = Object.assign(Object.create(null), {
				classes    : [`macro-${this.name}`, eventClass],
				elTag      : 'span',
				tags       : [],
				transition : false
			});

			// Process optional arguments.
			for (let i = 0; i < this.args.length; ++i) {
				switch (this.args[i]) {
					case 'element': {
						if (++i >= this.args.length) {
							return this.error('element option missing required value');
						}

						if (typeof this.args[i] !== 'string') {
							return this.error('element option value must be a string');
						}

						optArgs.elTag = this.args[i].trim();

						if (optArgs.elTag === '') {
							return this.error('element option value cannot be an empty string');
						}

						break;
					}

					case 'tag': {
						if (++i >= this.args.length) {
							return this.error('tag option missing required value');
						}

						if (typeof this.args[i] !== 'string') {
							return this.error('tag option value must be a string');
						}

						const raw = this.args[i].trim();

						if (raw === '') {
							return this.error('tag option value cannot be an empty string');
						}

						optArgs.tags = raw.splitOrEmpty(/\s+/);
						break;
					}

					default: {
						return this.error(`unknown option: ${this.args[i]}`);
					}
				}
			}

			const contents = this.payload[0].contents;

			// Do nothing if there's no content to render.
			if (contents.trim() === '') {
				return;
			}

			// Custom debug view setup.
			if (Config.debug) {
				// QUESTION: Should this `elTag` check be more robust?
				this.debugView.modes({ block : optArgs.elTag !== 'span' });
			}

			// Create an element to hold our contents and append it to the output.
			const $target = jQuery(document.createElement(optArgs.elTag))
				.addClass(optArgs.classes)
				.attr('data-do-tags', optArgs.tags.join(' '))
				.wiki(contents)
				.on(':redo-internal', jQuery.throttle(
					Engine.DOM_DELAY,
					this.shadowHandler(() => {
						const frag = document.createDocumentFragment();
						new Wikifier(frag, contents);
						$target.empty().append(frag);
					})
				))
				.appendTo(this.output);
		}
	});

	/*
		<<redo [tags]>>
	*/
	Macro.add('redo', {
		handler() {
			// Sanity check to prevent out-of-control redoes.
			//
			// NOTE: This may be too restrictive.
			const failRE  = /^(?:do|for)$/;
			const passRE  = /^(?:button|link(?:append|prepend|replace)?)$/;
			const closest = this.contextFind(ctx => failRE.test(ctx.name) || passRE.test(ctx.name));

			if (closest && failRE.test(closest.name)) {
				return this.error(`must not be used directly within macro <<${closest.name}>>`);
			}

			// Gather any given tags.
			const tags = this.args.length > 0
				? String(this.args[0]).trim().splitOrEmpty(/\s+/)
				: [];

			// Trigger a redo, sending any tags along.
			triggerEvent(':redo', document, { detail : { tags } });
		}
	});
})();
