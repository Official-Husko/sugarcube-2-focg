/***********************************************************************************************************************

	macro/macros/numberbox-textbox.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Macro, State, createSlug, getTypeOf */

/*
	<<textbox>>
*/
Macro.add('textbox', {
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
			disabled  : false
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

				case 'size': {
					if (++i >= this.args.length) {
						return this.error('size option missing required value');
					}

					optArgs.size = Number(this.args[i]);

					if (!Number.isSafeInteger(optArgs.size) || optArgs.size < 1) {
						return this.error(`size option value must be an integer number greater-than or equal-to 1 (received: ${this.args[i]})`);
					}

					break;
				}

				case 'spellcheck': {
					optArgs.spellcheck = true;
					break;
				}

				default: {
					/* [DEPRECATED] */
					// Argument is an object.
					if (typeof this.args[i] === 'object') {
						// Argument was in wiki link syntax.
						if (this.args[i].isLink) {
							optArgs.passage = this.args[i].link;
						}
						// Argument was some other kind of object.
						else {
							return this.error(`passage option value was of an incompatible type: ${getTypeOf(this.args[i])}`);
						}
					}
					// Argument was simply the passage name.
					else {
						optArgs.passage = String(this.args[i]).trim();
					}

					if (optArgs.passage === '') {
						return this.error('passage option value cannot be an empty string');
					}
					/* [/DEPRECATED] */

					break;
				}
			}
		}

		if (optArgs?.maxlength && optArgs?.minlength && optArgs.maxlength < optArgs.minlength) {
			return this.error('maxlength option value must be greater-than or equal-to the minlength option value');
		}

		const varId = createSlug(varName);
		const el    = document.createElement('input');

		// Set up and append the input element to the output buffer.
		const $textbox = jQuery(el)
			.attr({
				id        : optArgs?.id ? optArgs.id : `${this.name}-${varId}`,
				name      : `${this.name}-${varId}`,
				type      : 'text',
				inputmode : 'text',
				tabindex  : 0 // for accessibility
			})
			.addClass(optArgs.classes)
			.on('change.macros', this.shadowHandler(function () {
				State.setVar(varName, this.value);
			}))
			.on('keydown.macros', this.shadowHandler(function (ev) {
				// If Enter/Return is pressed, set the variable and, optionally, forward to another passage.
				if (ev.key === 'Enter') {
					ev.preventDefault();
					State.setVar(varName, this.value);

					if (optArgs.passage != null) { // nullish test
						Engine.play(optArgs.passage);
					}
				}
			}))
			.appendTo(this.output);

		if (optArgs.disabled) {
			$textbox.ariaDisabled(true);
		}

		if (optArgs?.minlength) {
			$textbox.attr('minlength', optArgs.minlength);
		}

		if (optArgs?.maxlength) {
			$textbox.attr('maxlength', optArgs.maxlength);
		}

		if (optArgs?.placeholder) {
			$textbox.attr('placeholder', optArgs.placeholder);
		}

		if (optArgs?.size) {
			$textbox.attr('size', optArgs.size);
		}

		if (optArgs?.spellcheck) {
			$textbox.attr('spellcheck', optArgs.spellcheck);
		}

		if (optArgs?.passage != null) { // nullish test
			$textbox.attr('data-passage', optArgs.passage);
		}

		// Set the variable and input element to the default value.
		State.setVar(varName, defaultValue);
		el.value = defaultValue;

		// Autofocus the input element, if requested.
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
