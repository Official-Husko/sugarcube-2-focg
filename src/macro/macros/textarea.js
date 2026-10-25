/***********************************************************************************************************************

	macro/macros/textarea.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Macro, State, createSlug */

/*
	<<textarea>>
*/
Macro.add('textarea', {
	isAsync   : true,
	receivers : [0], // NOTE: Only notional for now.

	handler() {
		if (this.args.length < 2) {
			const errors = [];
			if (this.args.length < 1) { errors.push('variable name'); }
			if (this.args.length < 2) { errors.push('default value'); }
			return this.error(`no ${errors.join(' or ')} specified`);
		}

		// Ensure that the variable name argument is a string.
		if (typeof this.args[0] !== 'string') {
			return this.error('variable name argument is not a string');
		}

		const varName = this.args[0].trim();

		// Try to ensure that we receive the variable's name (incl. sigil), not its value.
		if (varName[0] !== '$' && varName[0] !== '_') {
			return this.error(`variable name "${this.args[0]}" is missing its sigil ($ or _)`);
		}

		// Custom debug view setup.
		if (Config.debug) {
			this.debugView.modes({ block : true });
		}

		const defaultValue = this.args[1];
		const optArgs      = Object.assign(Object.create(null), {
			autofocus : false,
			classes   : [`macro-${this.name}`],
			cols      : 64,
			disabled  : false,
			rows      : 4
		});

		// Process optional arguments.
		for (let i = 2; i < this.args.length; ++i) {
			switch (this.args[i]) {
				case 'autofocus': {
					optArgs.autofocus = true;
					break;
				}

				case 'class': {
					if (++i >= this.args.length) {
						return this.error('class option missing required value');
					}

					optArgs.classes.push(this.args[i]);
					break;
				}

				case 'cols': {
					if (++i >= this.args.length) {
						return this.error('cols option missing required value');
					}

					optArgs.cols = Number(this.args[i]);

					if (!Number.isSafeInteger(optArgs.cols) || optArgs.cols < 1) {
						return this.error(`cols option value must be an integer number greater-than or equal-to 1 (received: ${this.args[i]})`);
					}

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

				case 'maxlength': {
					if (++i >= this.args.length) {
						return this.error('maxlength option missing required value');
					}

					optArgs.maxlength = Number(this.args[i]);

					if (!Number.isSafeInteger(optArgs.maxlength) || optArgs.maxlength < 1) {
						return this.error(`maxlength option value must be an integer number greater-than or equal-to 1 (received: ${this.args[i]})`);
					}

					break;
				}

				case 'minlength': {
					if (++i >= this.args.length) {
						return this.error('minlength option missing required value');
					}

					optArgs.minlength = Number(this.args[i]);

					if (!Number.isSafeInteger(optArgs.minlength) || optArgs.minlength < 1) {
						return this.error(`minlength option value must be an integer number greater-than or equal-to 1 (received: ${this.args[i]})`);
					}

					break;
				}

				case 'placeholder': {
					if (++i >= this.args.length) {
						return this.error('placeholder option missing required value');
					}

					if (typeof this.args[i] !== 'string') {
						return this.error('placeholder option value must be a string');
					}

					optArgs.placeholder = this.args[i].trim();
					break;
				}

				case 'rows': {
					if (++i >= this.args.length) {
						return this.error('rows option missing required value');
					}

					optArgs.rows = Number(this.args[i]);

					if (!Number.isSafeInteger(optArgs.rows) || optArgs.rows < 1) {
						return this.error(`rows option value must be an integer number greater-than or equal-to 1 (received: ${this.args[i]})`);
					}

					break;
				}

				case 'spellcheck': {
					optArgs.spellcheck = true;
					break;
				}

				default: {
					return this.error(`unknown option: ${this.args[i]}`);
				}
			}
		}

		if (optArgs?.maxlength && optArgs?.minlength && optArgs.maxlength < optArgs.minlength) {
			return this.error('maxlength option value must be greater-than or equal-to the minlength option value');
		}

		const varId = createSlug(varName);
		const el    = document.createElement('textarea');

		// Set up and append the textarea element to the output buffer.
		const $textarea = jQuery(el)
			.attr({
				id       : optArgs?.id ? optArgs.id : `${this.name}-${varId}`,
				name     : `${this.name}-${varId}`,
				cols     : optArgs.cols,
				rows     : optArgs.rows,
				tabindex : 0 // for accessibility
			})
			.addClass(optArgs.classes)
			.on('change.macros', this.shadowHandler(function () {
				State.setVar(varName, this.value);
			}))
			.appendTo(this.output);

		if (optArgs.disabled) {
			$textarea.ariaDisabled(true);
		}

		if (optArgs?.minlength) {
			$textarea.attr('minlength', optArgs.minlength);
		}

		if (optArgs?.maxlength) {
			$textarea.attr('maxlength', optArgs.maxlength);
		}

		if (optArgs?.placeholder) {
			$textarea.attr('placeholder', optArgs.placeholder);
		}

		if (optArgs?.spellcheck) {
			$textarea.attr('spellcheck', optArgs.spellcheck);
		}

		// Set the variable and textarea element to the default value.
		State.setVar(varName, defaultValue);
		// NOTE: Ideally, we should be using `.defaultValue` here unfortunately
		// IE doesn't support it, so we have to use `.textContent`, which is
		// completely equivalent.
		el.textContent = defaultValue;

		// Autofocus the textarea element, if requested.
		if (optArgs.autofocus) {
			// Set the element's "autofocus" attribute.
			el.setAttribute('autofocus', 'autofocus');

			// Set up a single-use task to autofocus the element.
			if (Engine.isPlaying()) {
				jQuery(document).one(':passageend', () => {
					setTimeout(() => el.focus(), Engine.DOM_DELAY);
				});
			}
			else {
				setTimeout(() => el.focus(), Engine.DOM_DELAY);
			}
		}
	}
});
