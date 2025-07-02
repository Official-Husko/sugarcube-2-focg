/***********************************************************************************************************************

	macro/macrocontext.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, DebugView, Patterns, State, Wikifier, appendError, warnDeprecated */

/*******************************************************************************
	MacroContext Class.
*******************************************************************************/

class MacroContext { // eslint-disable-line no-unused-vars
	// Public fields.
	self;        // The instance of the macro.
	name;        // Our name (even if an alias).
	displayName; // Our display name (the name we were invoked as).
	args;        // Our arguments (from invocation).
	payload;     // Our contents (if we're a container).
	source;      // Our source code (from invocation, not our actual source code).
	parent;      // Our parent macro context.
	parser;      // The instance of the parser (Wikifier) that caused our invocation.

	// Private fields.
	#output;           // The output element from the parser.
	#shadows;          // Our list of variables to shadow.
	#debugView;        // Our debug view (if enabled).
	#debugViewEnabled; // Is the debug view enabled?


	constructor(contextData) {
		const context = Object.assign({
			parent      : null,
			macro       : null,
			name        : '',
			displayName : '',
			args        : null,
			payload     : null,
			parser      : null,
			source      : ''
		}, contextData);

		if (context.macro === null || context.name === '' || context.parser === null) {
			throw new TypeError('context object missing required properties');
		}

		Object.defineProperties(this, {
			self : {
				value : context.macro
			},

			name : {
				value : context.macro._ALIAS_OF ?? context.name
			},

			displayName : {
				value : context.name
			},

			args : {
				value : context.args
			},

			payload : {
				value : context.payload
			},

			source : {
				value : context.source
			},

			parent : {
				value : context.parent
			},

			parser : {
				value : context.parser
			}
		});

		this.#output           = context.parser.output;
		this.#shadows          = null;
		this.#debugView        = null;
		this.#debugViewEnabled = Config.debug;
	}


	// Public methods.

	get output() {
		return this.#debugViewEnabled ? this.debugView.output : this.#output;
	}

	get shadows() {
		return Array.from(this.#shadows);
	}

	get shadowView() {
		const view = new Set();

		for (let context = this; context !== null; context = context.parent) {
			if (context.#shadows) {
				context.#shadows.forEach(name => view.add(name));
			}
		}

		return Array.from(view);
	}

	get debugView() {
		if (this.#debugViewEnabled) {
			return this.#debugView !== null ? this.#debugView : this.createDebugView();
		}

		return null;
	}

	contextFilter(predicate, thisArg) {
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate parameter must be a function');
		}

		const result = [];

		for (let context = this.parent; context !== null; context = context.parent) {
			if (predicate.call(typeof thisArg === 'undefined' ? this : thisArg, context)) {
				result.push(context);
			}
		}

		return result;
	}

	contextFind(predicate, thisArg) {
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate parameter must be a function');
		}

		for (let context = this.parent; context !== null; context = context.parent) {
			if (predicate.call(typeof thisArg === 'undefined' ? this : thisArg, context)) {
				return context;
			}
		}
	}

	contextSome(predicate, thisArg) {
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate parameter must be a function');
		}

		for (let context = this.parent; context !== null; context = context.parent) {
			if (predicate.call(typeof thisArg === 'undefined' ? this : thisArg, context)) {
				return true;
			}
		}

		return false;
	}

	addShadow(...names) {
		if (!this.#shadows) {
			this.#shadows = new Set();
		}

		const varRe = new RegExp(`^${Patterns.variable}$`);

		names
			.flat(Infinity)
			.forEach(name => {
				if (typeof name !== 'string') {
					throw new TypeError(`variable name must be a string; type: ${typeof name}`);
				}

				if (!varRe.test(name)) {
					throw new Error(`invalid variable name "${name}"`);
				}

				this.#shadows.add(name);
			});
	}

	shadowHandler(callback, doneCallback, startCallback) {
		const shadowContext = this;
		let shadowStore;

		if (typeof callback === 'function') {
			shadowStore = Object.create(null);
			this.shadowView.forEach(varName => {
				const varKey = varName.slice(1);
				const store  = varName[0] === '$' ? State.variables : State.temporary;
				shadowStore[varName] = store[varKey];
			});
		}

		return function (...args) {
			if (typeof startCallback === 'function') {
				startCallback.apply(this, args);
			}

			if (typeof callback === 'function') {
				const shadowNames = Object.keys(shadowStore);
				const valueCache  = shadowNames.length > 0 ? {} : null;
				const macroParser = Wikifier.Parser.get('macro');
				let contextCache;

				// There's no catch clause because this try/finally is here simply to ensure that
				// proper cleanup is done in the event that an exception is thrown during the
				// callback.
				try {
					// Cache the existing values of the variables to be shadowed and assign the
					// shadow values.
					shadowNames.forEach(varName => {
						const varKey = varName.slice(1);
						const store  = varName[0] === '$' ? State.variables : State.temporary;

						if (Object.hasOwn(store, varKey)) {
							valueCache[varKey] = store[varKey];
						}

						store[varKey] = shadowStore[varName];
					});

					// Cache the existing macro execution context and assign the shadow context.
					contextCache = macroParser.context;
					macroParser.context = shadowContext;

					// Call the callback function.
					callback.apply(this, args);
				}
				finally {
					// Revert the macro execution context shadowing.
					if (contextCache !== undefined) {
						macroParser.context = contextCache;
					}

					// Revert the variable shadowing.
					shadowNames.forEach(varName => {
						const varKey = varName.slice(1);
						const store  = varName[0] === '$' ? State.variables : State.temporary;

						// Update the shadow store with the variable's current value, in case it
						// was modified during the callback.
						shadowStore[varName] = store[varKey];

						if (Object.hasOwn(valueCache, varKey)) {
							store[varKey] = valueCache[varKey];
						}
						else {
							delete store[varKey];
						}
					});
				}
			}

			if (typeof doneCallback === 'function') {
				doneCallback.apply(this, args);
			}
		};
	}

	createDebugView(name, title) {
		this.#debugView = new DebugView(
			this.#output,
			'macro',
			name ? name : this.displayName,
			title ? title : this.source
		);

		if (this.payload !== null && this.payload.length > 0) {
			this.#debugView.modes({ nonvoid : true });
		}

		this.#debugViewEnabled = true;
		return this.#debugView;
	}

	removeDebugView() {
		if (this.#debugView !== null) {
			this.#debugView.remove();
			this.#debugView = null;
		}

		this.#debugViewEnabled = false;
	}

	/*

	This patch is taken from the original SugarCube v2 fork used by darkofoc.
	It was rewritten to be more compatible with the current version of SugarCube and its codebase.
	https://gitgud.io/darkofocdarko/sugarcube-2/-/blob/cc11dbf238824b413c60ca407eccde33aa04605d/src/macros/macrocontext.js

	*/

	error(message, source, stack) {
		// Compatibility: prefer displayName, fallback to name if not present
		const macroName = this.name || this.displayName;
		return appendError(
			this.#output,
			`<<${macroName}>>: ${message}`,
			source ? source : this.source,
			stack // stack is optional
		);
	}

	wiki(...sources) {
		// Bail out if there are no content sources.
		if (sources.length === 0) {
			return;
		}

		// Wikify the content sources into a fragment.
		const frag = document.createDocumentFragment();
		sources.forEach(content => new Wikifier(frag, content));

		// Append the fragment to our output.
		this.output.appendChild(frag);
	}


	/* [DEPRECATED] */
	// Deprecated methods.

	contextHas(...args) {
		warnDeprecated(
			'<MacroContext>.contextHas()',
			'<MacroContext>.contextSome()'
		);
		return MacroContext.prototype.contextSome.apply(this, args);
	}

	contextSelect(...args) {
		warnDeprecated(
			'<MacroContext>.contextSelect()',
			'<MacroContext>.contextFind()'
		);
		return MacroContext.prototype.contextFind.apply(this, args);
	}

	contextSelectAll(...args) {
		warnDeprecated(
			'<MacroContext>.contextSelectAll()',
			'<MacroContext>.contextFilter()'
		);
		return MacroContext.prototype.contextFilter.apply(this, args);
	}

	createShadowWrapper(...args) {
		warnDeprecated(
			'<MacroContext>.createShadowWrapper()',
			'<MacroContext>.shadowHandler()'
		);
		return MacroContext.prototype.shadowHandler.apply(this, args);
	}
	/* [/DEPRECATED] */
}
