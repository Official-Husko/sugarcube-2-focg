/***********************************************************************************************************************

	macro/macros/button-link.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Macro, State, Story, Wikifier, getTypeOf */

/*
	<<button>> & <<link>>
*/
Macro.add(['button', 'link'], {
	isAsync : true,
	tags    : null,

	handler() {
		if (this.args.length === 0) {
			return this.error(`no ${this.name === 'button' ? 'button' : 'link'} text specified`);
		}

		const isObject = typeof this.args[0] === 'object';
		const $link    = jQuery(document.createElement(this.name === 'button' ? 'button' : 'a'));
		const classes  = [`macro-${this.name}`];
		const optArgs  = Object.assign(Object.create(null), {
			classes  : [],
			disabled : false
		});

		// Argument is an object.
		if (isObject) {
			// Argument was in wiki image syntax.
			if (this.args[0].isImage) {
				const $image = jQuery(document.createElement('img'))
					.attr('src', this.args[0].source)
					.appendTo($link);

				classes.push('link-image');

				if (Object.hasOwn(this.args[0], 'passage')) {
					$image.attr('data-passage', this.args[0].passage);
				}

				if (Object.hasOwn(this.args[0], 'text')) {
					$image.attr('alt', this.args[0].text);
				}

				if (Object.hasOwn(this.args[0], 'align')) {
					$image.attr('align', this.args[0].align);
				}

				if (Object.hasOwn(this.args[0], 'link')) {
					optArgs.passage = this.args[0].link;
				}
			}
			// Argument was in wiki link syntax.
			else if (this.args[0].isLink) {
				$link.append(document.createTextNode(this.args[0].text));
				optArgs.passage = this.args[0].link;
			}
			// Argument was some other kind of object.
			else {
				return this.error(`link option was of an incompatible type: ${getTypeOf(this.args[0])}`);
			}
		}
		// Argument was simply the link text.
		else {
			const $frag = jQuery(document.createDocumentFragment())
				.wikiWithOptions({ cleanup : false, profile : 'core' }, this.args[0]);

			// Sanity check for interactive content shenanigans.
			const forbidden = $frag.getForbiddenInteractiveContentTagNames();

			if (forbidden.length > 0) {
				return this.error(`link option contains restricted elements: <${forbidden.join('>, <')}>`);
			}

			$link.append($frag);
		}

		// Process optional arguments.
		for (let i = 1; i < this.args.length; ++i) {
			switch (this.args[i]) {
				case 'class': {
					if (++i >= this.args.length) {
						return this.error('class option missing required value');
					}

					optArgs.classes.push(this.args[i]);
					break;
				}

				case 'disabled': {
					optArgs.disabled = true;
					break;
				}

				case 'id': {
					if (++i >= this.args.length) {
						return this.error('id option missing required value');
					}

					if (typeof this.args[i] !== 'string') {
						return this.error('id option value must be a string');
					}

					optArgs.id = this.args[i].trim();

					if (optArgs.id === '') {
						return this.error('id option value cannot be an empty string');
					}

					break;
				}

				default: {
					if (!isObject) {
						optArgs.passage = this.args[i];
					}

					break;
				}
			}
		}

		if (optArgs?.passage != null) { // nullish test
			$link.attr('data-passage', optArgs.passage);

			if (Story.has(optArgs.passage)) {
				classes.push('link-internal');

				if (Config.addVisitedLinkClass && State.hasPlayed(optArgs.passage)) {
					classes.push('link-visited');
				}
			}
			else {
				classes.push('link-broken');
			}
		}
		else {
			classes.push('link-internal');
		}

		if (optArgs.disabled) {
			$link.ariaDisabled(true);
		}

		if (optArgs?.id != null) { // nullish test
			$link.attr('id', optArgs.id);
		}

		$link
			.addClass(classes)
			.addClass(optArgs.classes)
			.ariaClick({
				namespace : '.macros',
				role      : optArgs?.passage != null ? 'link' : 'button', // nullish test
				one       : optArgs?.passage != null // nullish test
			}, this.shadowHandler(
				this.payload[0].contents !== ''
					? () => Wikifier.wikifyEval(this.payload[0].contents.trim())
					: null,
				optArgs?.passage != null // nullish test
					? () => Engine.play(optArgs.passage)
					: null
			))
			.appendTo(this.output);
	}
});
