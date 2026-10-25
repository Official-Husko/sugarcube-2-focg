/***********************************************************************************************************************

	macro/macros/cycle-listbox.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Macro, Scripting, State, createSlug, getErrorMessage, getToStringTag, sameValueZero, triggerEvent */

/*
	<<cycle>>, <<listbox>>, <<option>>, & <<optionsfrom>>
*/
Macro.add(['cycle', 'listbox'], {
	isAsync   : true,
	receivers : [0], // NOTE: Only notional for now.
	skipArgs  : ['optionsfrom'],
	tags      : ['option', 'optionsfrom'],

	handler() {
		if (this.args.length === 0) {
			return this.error('no variable name specified');
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

		const len = this.payload.length;

		if (len === 1) {
			return this.error('no options specified');
		}

		const optArgs = Object.assign(Object.create(null), {
			autoselect : false,
			classes    : [`macro-${this.name}`],
			disabled   : false,
			once       : false
		});

		// Process optional arguments.
		for (let i = 1; i < this.args.length; ++i) {
			switch (this.args[i]) {
				case 'autoselect': {
					optArgs.autoselect = true;
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

				case 'once': {
					optArgs.once = true;
					break;
				}

				default: {
					return this.error(`unknown option: ${this.args[i]}`);
				}
			}
		}

		const options  = [];
		const tagCount = { option : 0, optionsfrom : 0 };
		let index = -1;

		// Get the options and selected index, if any.
		for (let i = 1; i < len; ++i) {
			const payload = this.payload[i];

			// <<option label value [selected]>>
			if (payload.name === 'option') {
				++tagCount.option;

				if (payload.args.length === 0) {
					return this.error(`no arguments specified for <<${payload.name}>> (#${tagCount.option})`);
				}

				const option = { label : String(payload.args[0]) };
				let isSelected = false;

				switch (payload.args.length) {
					case 1: {
						option.value = payload.args[0];
						break;
					}

					case 2: {
						if (payload.args[1] === 'selected') {
							option.value = payload.args[0];
							isSelected = true;
						}
						else {
							option.value = payload.args[1];
						}

						break;
					}

					default: {
						option.value = payload.args[1];

						if (payload.args[2] === 'selected') {
							isSelected = true;
						}

						break;
					}
				}

				options.push(option);

				if (isSelected) {
					if (optArgs.autoselect) {
						return this.error('cannot specify both the autoselect and selected keywords');
					}
					else if (index !== -1) {
						return this.error(`multiple selected keywords specified for <<${payload.name}>> (#${index + 1} & #${tagCount.option})`);
					}

					index = options.length - 1;
				}
			}

			// <<optionsfrom expression>>
			else {
				++tagCount.optionsfrom;

				if (payload.args.full.length === 0) {
					return this.error(`no expression specified for <<${payload.name}>> (#${tagCount.optionsfrom})`);
				}

				let result;

				try {
					// NOTE: If the first character is the left curly brace, then we
					// assume that it's part of an object literal and wrap it within
					// parenthesis to ensure that it is not mistaken for a block
					// during evaluation—which would cause an error.
					const exp = payload.args.full.trim();
					result = Scripting.evalJavaScript(exp[0] === '{' ? `(${exp})` : exp);
				}
				catch (ex) {
					return this.error(`bad evaluation: ${getErrorMessage(ex)}`);
				}

				if (typeof result !== 'object' || result === null) {
					return this.error(`expression must yield a supported collection or generic object (type: ${result === null ? 'null' : typeof result})`);
				}

				if (result instanceof Array || result instanceof Set) {
					result.forEach(val => options.push({ label : String(val), value : val }));
				}
				else if (result instanceof Map) {
					result.forEach((val, key) => options.push({ label : String(key), value : val }));
				}
				else {
					const oType = getToStringTag(result);

					if (oType !== 'Object') {
						return this.error(`expression must yield a supported collection or generic object (object type: ${oType})`);
					}

					Object.keys(result).forEach(key => options.push({ label : key, value : result[key] }));
				}
			}
		}

		// No options were selected by the user, so we must select one.
		if (index === -1) {
			// Attempt to automatically select an option by matching the variable's current value.
			if (optArgs.autoselect) {
				// NOTE: This will usually fail for objects due to a variety of reasons.
				const curValue      = State.getVar(varName);
				const curValueIndex = options.findIndex(opt => sameValueZero(opt.value, curValue));
				index = curValueIndex === -1 ? 0 : curValueIndex;
			}

			// Simply select the first option.
			else {
				index = 0;
			}
		}

		const varId = createSlug(varName);

		// Set up and append the appropriate element to the output buffer.
		if (this.name === 'cycle') {
			const lastIndex = options.length - 1;

			if (optArgs.once && index === lastIndex) {
				jQuery(this.output)
					.wikiWithOptions({ cleanup : false, profile : 'core' }, options[index].label);
			}
			else {
				let cycleIndex = index;
				const $anchor = jQuery(document.createElement('a'))
					.wikiWithOptions({ cleanup : false, profile : 'core' }, options[index].label)
					.attr('id', optArgs?.id ? optArgs.id : `${this.name}-${varId}`)
					.addClass(optArgs.classes)
					.ariaClick({
						namespace : '.macros',
						role      : 'button'
					}, this.shadowHandler(function () {
						const $this = $(this);
						cycleIndex = (cycleIndex + 1) % options.length;
						State.setVar(varName, options[cycleIndex].value);
						$this.empty().wikiWithOptions({ cleanup : false, profile : 'core' }, options[cycleIndex].label);

						if (optArgs.once && cycleIndex === lastIndex) {
							$this.off().contents().unwrap();
						}

						triggerEvent('change', this);
					}))
					.appendTo(this.output);

				if (optArgs.disabled) {
					$anchor.ariaDisabled(true);
				}
			}
		}
		else { // this.name === 'listbox'
			const $select = jQuery(document.createElement('select'));

			options.forEach((opt, i) => {
				jQuery(document.createElement('option'))
					.val(i)
					.text(opt.label)
					.appendTo($select);
			});

			$select
				.attr({
					id       : optArgs?.id ? optArgs.id : `${this.name}-${varId}`,
					name     : `${this.name}-${varId}`,
					tabindex : 0 // for accessibility
				})
				.addClass(optArgs.classes)
				.val(index)
				.on('change.macros', this.shadowHandler(function () {
					State.setVar(varName, options[Number(this.value)].value);
				}))
				.appendTo(this.output);

			if (optArgs.disabled) {
				$select.ariaDisabled(true);
			}
		}

		// Set the variable to the appropriate value, as requested.
		State.setVar(varName, options[index].value);
	}
});
