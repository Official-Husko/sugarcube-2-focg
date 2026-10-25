/***********************************************************************************************************************

	macro/macros/radiobutton.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Macro, State, TempState, createSlug */

/*
	<<radiobutton>>
*/
Macro.add('radiobutton', {
	isAsync   : true,
	receivers : [0], // NOTE: Only notional for now.

	handler() {
		if (this.args.length < 2) {
			const errors = [];
			if (this.args.length < 1) { errors.push('variable name'); }
			if (this.args.length < 2) { errors.push('checked value'); }
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

		const checkValue = this.args[1];
		const optArgs    = Object.assign(Object.create(null), {
			autocheck : false,
			checked   : false,
			classes   : [`macro-${this.name}`],
			disabled  : false
		});

		// Process optional arguments.
		for (let i = 2; i < this.args.length; ++i) {
			switch (this.args[i]) {
				case 'autocheck': {
					optArgs.autocheck = true;
					break;
				}

				case 'checked': {
					optArgs.checked = true;
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

				default: {
					return this.error(`unknown option: ${this.args[i]}`);
				}
			}
		}

		if (optArgs.autocheck && optArgs.checked) {
			return this.error('cannot specify both the autocheck and checked keywords');
		}

		const varId = createSlug(varName);
		const el    = document.createElement('input');

		// Set up and initialize the group counter.
		if (!Object.hasOwn(TempState, this.name)) {
			TempState[this.name] = {};
		}

		if (!Object.hasOwn(TempState[this.name], varId)) {
			TempState[this.name][varId] = 0;
		}

		// Set up and append the input element to the output buffer.
		const $radiobutton = jQuery(el)
			.attr({
				id       : optArgs?.id ? optArgs.id : `${this.name}-${varId}-${TempState[this.name][varId]++}`,
				name     : `${this.name}-${varId}`,
				type     : 'radio',
				tabindex : 0 // for accessibility
			})
			.addClass(optArgs.classes)
			.on('change.macros', this.shadowHandler(function () {
				if (this.checked) {
					State.setVar(varName, checkValue);
				}
			}))
			.appendTo(this.output);

		if (optArgs.disabled) {
			$radiobutton.ariaDisabled(true);
		}

		// Set the variable to the checked value and the input element to checked, if requested.
		if (optArgs.autocheck) {
			if (State.getVar(varName) === checkValue) {
				el.checked = true;
			}
		}
		else if (optArgs.checked) {
			el.checked = true;
			State.setVar(varName, checkValue);
		}
	}
});
