/***********************************************************************************************************************

	macro/macros/linkappend-linkprepend-linkreplace.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Engine, Macro, Wikifier */

/*
	<<linkappend>>, <<linkprepend>>, & <<linkreplace>>
*/
Macro.add(['linkappend', 'linkprepend', 'linkreplace'], {
	isAsync : true,
	tags    : null,

	handler() {
		if (this.args.length === 0) {
			return this.error('no link text specified');
		}

		const $link   = jQuery(document.createElement('a'));
		const $insert = jQuery(document.createElement('span'));
		const optArgs = Object.assign(Object.create(null), {
			classes    : [`macro-${this.name}`, 'link-internal'],
			disabled   : false,
			transition : false
		});

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

				case 't8n':
				case 'transition': {
					optArgs.transition = true;
					break;
				}

				default: {
					return this.error(`unknown option: ${this.args[i]}`);
				}
			}
		}

		const $frag = jQuery(document.createDocumentFragment())
			.wikiWithOptions({ cleanup : false, profile : 'core' }, this.args[0]);

		// Sanity check for interactive content shenanigans.
		const forbidden = $frag.getForbiddenInteractiveContentTagNames();

		if (forbidden.length > 0) {
			return this.error(`link option contains restricted elements: <${forbidden.join('>, <')}>`);
		}

		$link.append($frag);

		if (optArgs?.id != null) { // nullish test
			$link.attr('id', optArgs.id);
		}

		$link
			.addClass(optArgs.classes)
			.ariaClick({
				namespace : '.macros',
				one       : true
			}, this.shadowHandler(
				() => {
					if (this.name === 'linkreplace') {
						$link.remove();
					}
					else {
						const $replacement = jQuery(document.createElement('span'));
						const localClasses = Array.from(optArgs.classes);
						localClasses.deleteAll('link-internal');

						if (optArgs?.id != null) { // nullish test
							$replacement.attr('id', optArgs.id);
						}

						$replacement
							.addClass(localClasses)
							.append(() => $link.html())
							.replaceAll($link);
					}

					if (this.payload[0].contents !== '') {
						const frag = document.createDocumentFragment();
						new Wikifier(frag, this.payload[0].contents, { cleanup : false });
						$insert.append(frag);
					}

					if (optArgs.transition) {
						setTimeout(() => $insert.removeClass(`macro-${this.name}-in`), Engine.DOM_DELAY);
					}
				}
			))
			.appendTo(this.output);

		if (optArgs.disabled) {
			$link.ariaDisabled(true);
		}

		$insert.addClass(`macro-${this.name}-insert`);

		if (optArgs.transition) {
			$insert.addClass(`macro-${this.name}-in`);
		}

		if (this.name === 'linkprepend') {
			$insert.insertBefore($link);
		}
		else {
			$insert.insertAfter($link);
		}
	}
});
