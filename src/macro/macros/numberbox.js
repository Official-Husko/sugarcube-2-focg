/***********************************************************************************************************************

	macro/macros/numberbox.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Macro, State, createSlug, enquote, getTypeOf */

(() => {
	/*
		Returns the count of significant decimal places in the number `n`.
	*/
	function countDecimals(n) {
		if (Math.trunc(n) === n) {
			return 0;
		}

		const nString = n.toString();
		return nString.length - nString.lastIndexOf('.') - 1;
	}

	/*
		Returns whether the given number `x` is a multiple of the number `n`.
	*/
	function isMultipleOf(n, x) {
		const decimals = countDecimals(n);

		if (decimals > 0) {
			const multi = Math.pow(10, decimals);
			/* eslint-disable no-param-reassign */
			n *= multi;
			x *= multi;
			/* eslint-enable no-param-reassign */
		}

		return x % n === 0;
	}

	/*
		<<numberbox>>
	*/
	Macro.add('numberbox', {
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

			const defaultError = received => this.error(`default value must be a decimal number (received: ${received})`);

			if (typeof this.args[1] === 'string') {
				if (this.args[1].trim() === '') {
					return defaultError(enquote(this.args[1]));
				}
			}

			const defaultValue = Number(this.args[1]);

			if (Number.isNaN(defaultValue) || !Number.isFinite(defaultValue)) {
				return defaultError(this.args[1]);
			}

			const optArgs = Object.assign(Object.create(null), {
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

					case 'max': {
						if (++i >= this.args.length) {
							return this.error('max option missing required value');
						}

						optArgs.max = Number(this.args[i]);

						if (Number.isNaN(optArgs.max) || !Number.isFinite(optArgs.max)) {
							return this.error(`max option value must be a decimal number (received: ${this.args[i]})`);
						}

						break;
					}

					case 'min': {
						if (++i >= this.args.length) {
							return this.error('min option missing required value');
						}

						optArgs.min = Number(this.args[i]);

						if (Number.isNaN(optArgs.min) || !Number.isFinite(optArgs.min)) {
							return this.error(`min option value must be a decimal number (received: ${this.args[i]})`);
						}

						break;
					}

					case 'step': {
						if (++i >= this.args.length) {
							return this.error('step option missing required value');
						}

						optArgs.step = Number(this.args[i]);

						if (Number.isNaN(optArgs.step) || !Number.isFinite(optArgs.step) || optArgs.step <= 0) {
							return this.error(`step option value must be a decimal number greater-than 0 (received: ${this.args[i]})`);
						}

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

			if (optArgs?.max != null && optArgs?.min != null && optArgs.max < optArgs.min) { // nullish test
				return this.error('max option value must be greater-than or equal-to the min option value');
			}

			if (optArgs?.min != null && defaultValue < optArgs.min) { // nullish test
				return this.error('default value must be greater-than or equal-to the min option value');
			}

			if (optArgs?.max != null && defaultValue > optArgs.max) { // nullish test
				return this.error('default value must be less-than or equal-to the max option value');
			}

			if (optArgs?.step != null && !isMultipleOf(optArgs.step, defaultValue)) { // nullish test
				return this.error('default value must be a multiple of the step option value');
			}

			const varId = createSlug(varName);
			const el    = document.createElement('input');

			// Set up and append the input element to the output buffer.
			const $numberbox = jQuery(el)
				.attr({
					id        : optArgs?.id ? optArgs.id : `${this.name}-${varId}`,
					name      : `${this.name}-${varId}`,
					type      : 'number',
					inputmode : 'decimal',
					tabindex  : 0, // for accessibility
					step      : optArgs?.step != null ? optArgs?.step : 'any' // nullish test
				})
				.addClass(optArgs.classes)
				.on('change.macros', this.shadowHandler(function () {
					State.setVar(varName, Number(this.value));
				}))
				.on('keydown.macros', this.shadowHandler(function (ev) {
					// If Enter/Return is pressed, set the variable and, optionally, forward to another passage.
					if (ev.key === 'Enter') {
						ev.preventDefault();
						State.setVar(varName, Number(this.value));

						if (optArgs.passage != null) { // nullish test
							Engine.play(optArgs.passage);
						}
					}
				}))
				.appendTo(this.output);

			if (optArgs.disabled) {
				$numberbox.ariaDisabled(true);
			}

			if (optArgs?.min != null) { // nullish test
				$numberbox.attr('min', optArgs.min);
			}

			if (optArgs?.max != null) { // nullish test
				$numberbox.attr('max', optArgs.max);
			}

			if (optArgs?.passage != null) { // nullish test
				$numberbox.attr('data-passage', optArgs.passage);
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
})();
