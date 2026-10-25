/***********************************************************************************************************************

	macro/macros/audio-macros.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* global Config, Engine, Has, Macro, SimpleAudio, getTypeOf */

(() => {
	if (Has.audio) {
		const errorOnePlaybackAction = (cur, prev) => `only one playback option allowed per invocation, "${cur}" cannot be combined with "${prev}"`;

		/*
			<<audio ids option_list>>
		*/
		Macro.add('audio', {
			handler() {
				if (this.args.length < 2) {
					const errors = [];
					if (this.args.length < 1) { errors.push('track and/or group IDs'); }
					if (this.args.length < 2) { errors.push('options'); }
					return this.error(`no ${errors.join(' or ')} specified`);
				}

				let selected;

				// Process the track and/or group IDs.
				try {
					selected = SimpleAudio.select(this.args[0]);
				}
				catch (ex) {
					return this.error(ex.message);
				}

				const optArgs = Object.assign(Object.create(null), {
					fadeOver : 5
				});

				// Process optional arguments.
				for (let i = 1; i < this.args.length; ++i) {
					switch (this.args[i]) {
						case 'load':
						case 'pause':
						case 'play':
						case 'stop':
						case 'unload': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = this.args[i];
							break;
						}

						case 'fadein': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';
							optArgs.fadeTo = 1;
							break;
						}

						case 'fadeout': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';
							optArgs.fadeTo = 0;
							break;
						}

						case 'fadeto': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';

							if (++i >= this.args.length) {
								return this.error('fadeto option missing required level value');
							}

							optArgs.fadeTo = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeTo)
								|| !Number.isFinite(optArgs.fadeTo)
								|| optArgs.fadeTo < 0
							) {
								return this.error(`fadeto option value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'fadeoverto': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';

							if (++i >= this.args.length) {
								return this.error('fadeoverto option missing required seconds value');
							}

							optArgs.fadeOver = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeOver)
								|| !Number.isFinite(optArgs.fadeOver)
								|| optArgs.fadeOver < 0
							) {
								return this.error(`fadeoverto option seconds value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							if (++i >= this.args.length) {
								return this.error('fadeoverto option missing required level value');
							}

							optArgs.fadeTo = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeTo)
								|| !Number.isFinite(optArgs.fadeTo)
								|| optArgs.fadeTo < 0
							) {
								return this.error(`fadeoverto option level value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'volume': {
							if (++i >= this.args.length) {
								return this.error('volume option missing required level value');
							}

							optArgs.volume = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.volume)
								|| !Number.isFinite(optArgs.volume)
								|| optArgs.volume < 0
							) {
								return this.error(`volume option value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'mute':
						case 'unmute': {
							optArgs.mute = this.args[i] === 'mute';
							break;
						}

						case 'time': {
							if (++i >= this.args.length) {
								return this.error('time option missing required seconds value');
							}

							optArgs.time = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.time)
								|| !Number.isFinite(optArgs.time)
								|| optArgs.time < 0
							) {
								return this.error(`time option value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'loop':
						case 'unloop': {
							optArgs.loop = this.args[i] === 'loop';
							break;
						}

						case 'goto': {
							if (++i >= this.args.length) {
								return this.error('goto option missing required passage name');
							}

							if (typeof this.args[i] === 'object') {
								if (this.args[i].isLink) {
									optArgs.passage = this.args[i].link;
								}
								else {
									return this.error(`goto option value was of an incompatible type: ${getTypeOf(this.args[i])}`);
								}
							}
							else {
								optArgs.passage = String(this.args[i]).trim();
							}

							if (optArgs.passage === '') {
								return this.error('goto option value cannot be an empty string');
							}

							break;
						}

						default: {
							return this.error(`unknown option: ${this.args[i]}`);
						}
					}
				}

				try {
					if (optArgs?.volume != null) { // nullish test
						selected.volume(optArgs.volume);
					}

					if (optArgs?.time != null) { // nullish test
						selected.time(optArgs.time);
					}

					if (optArgs?.mute != null) { // nullish test
						selected.mute(optArgs.mute);
					}

					if (optArgs?.loop != null) { // nullish test
						selected.loop(optArgs.loop);
					}

					if (optArgs?.passage != null) { // nullish test
						const nsEnded = `ended.macros.macro-${this.name}_goto`;
						selected
							.off(nsEnded)
							.one(nsEnded, () => {
								selected.off(nsEnded);
								Engine.play(optArgs.passage);
							});
					}

					switch (optArgs?.action) {
						case 'fade': {
							selected.fade(optArgs.fadeOver, optArgs.fadeTo);
							break;
						}

						case 'load': {
							selected.load();
							break;
						}

						case 'pause': {
							selected.pause();
							break;
						}

						case 'play': {
							selected.playWhenAllowed();
							break;
						}

						case 'stop': {
							selected.stop();
							break;
						}

						case 'unload': {
							selected.unload();
							break;
						}
					}

					// Custom debug view setup.
					if (Config.debug) {
						this.debugView.modes({ hidden : true });
					}
				}
				catch (ex) {
					return this.error(`error executing option: ${ex.message}`);
				}
			}
		});

		/*
			<<cacheaudio track_id source_list>>
		*/
		Macro.add('cacheaudio', {
			handler() {
				if (this.args.length < 2) {
					const errors = [];
					if (this.args.length < 1) { errors.push('track ID'); }
					if (this.args.length < 2) { errors.push('sources'); }
					return this.error(`no ${errors.join(' or ')} specified`);
				}

				const id = String(this.args[0]).trim();

				try {
					SimpleAudio.tracks.add(id, this.args.slice(1));
				}
				catch (ex) {
					return this.error(ex.message);
				}

				// If in Test Mode and no supported sources were specified, return an error.
				if (Config.debug && !SimpleAudio.tracks.get(id).hasSource()) {
					return this.error(`track ID "${id}": no supported audio sources found`);
				}

				// Custom debug view setup.
				if (Config.debug) {
					this.debugView.modes({ hidden : true });
				}
			}
		});

		/*
			<<createaudiogroup group_id>>
				<<track track_id>>
				…
			<</createaudiogroup>>
		*/
		Macro.add('createaudiogroup', {
			tags : ['track'],

			handler() {
				if (this.args.length === 0) {
					return this.error('no group ID specified');
				}

				if (this.payload.length === 1) {
					return this.error('no tracks defined via <<track>>');
				}

				// Initial debug view setup for `<<createaudiogroup>>`.
				if (Config.debug) {
					this.debugView
						.modes({
							nonvoid : false,
							hidden  : true
						});
				}

				const groupId  = String(this.args[0]).trim();
				const trackIds = [];

				for (let i = 1; i < this.payload.length; ++i) {
					if (this.payload[i].args.length < 1) {
						return this.error('no track ID specified');
					}

					trackIds.push(String(this.payload[i].args[0]).trim());

					// Custom debug view setup for the current `<<track>>`.
					if (Config.debug) {
						this
							.createDebugView(this.payload[i].name, this.payload[i].source)
							.modes({
								nonvoid : false,
								hidden  : true
							});
					}
				}

				try {
					SimpleAudio.groups.add(groupId, trackIds);
				}
				catch (ex) {
					return this.error(ex.message);
				}

				// Custom fake debug view setup for `<</createaudiogroup>>`.
				if (Config.debug) {
					this
						.createDebugView(`/${this.name}`, `<</${this.name}>>`)
						.modes({
							nonvoid : false,
							hidden  : true
						});
				}
			}
		});

		/*
			<<createplaylist list_id>>
				<<track track_id option_list>>
				…
			<</createplaylist>>
		*/
		Macro.add('createplaylist', {
			tags : ['track'],

			handler() {
				if (this.args.length === 0) {
					return this.error('no list ID specified');
				}

				if (this.payload.length === 1) {
					return this.error('no tracks defined via <<track>>');
				}

				// Initial debug view setup for `<<createplaylist>>`.
				if (Config.debug) {
					this.debugView
						.modes({
							nonvoid : false,
							hidden  : true
						});
				}

				const listId    = String(this.args[0]).trim();
				const trackObjs = [];

				for (let pi = 1; pi < this.payload.length; ++pi) {
					const payload = this.payload[pi];

					if (payload.args.length === 0) {
						return this.error('no track ID specified');
					}

					const trackObj = {
						id : String(payload.args[0]).trim()
					};

					// Process optional arguments.
					for (let i = 1; i < payload.args.length; ++i) {
						switch (payload.args[i]) {
							case 'own': {
								trackObj.own = true;
								break;
							}

							/* eslint-disable max-len */
							// case 'rate': {
							// 	if (++i >= payload.args.length) {
							// 		return this.error('rate option missing required speed value');
							// 	}
							//
							// 	trackObj.rate = Number.parseFloat(payload.args[i]);
							//
							// 	if (Number.isNaN(trackObj.rate) || !Number.isFinite(trackObj.rate)) {
							// 		return this.error(`rate option value must be a decimal number (received: ${payload.args[i]})`);
							// 	}
							//
							// 	break;
							// }
							/* eslint-enable max-len */

							case 'volume': {
								if (++i >= payload.args.length) {
									return this.error('volume option missing required level value');
								}

								trackObj.volume = Number.parseFloat(payload.args[i]);

								if (
									Number.isNaN(trackObj.volume)
									|| !Number.isFinite(trackObj.volume)
									|| trackObj.volume < 0
								) {
									return this.error(`volume option value must be a decimal number greater-than or equal-to 0 (received: ${payload.args[i]})`);
								}

								break;
							}

							default: {
								return this.error(`unknown option: ${payload.args[i]}`);
							}
						}
					}

					trackObjs.push(trackObj);

					// Custom debug view setup for the current `<<track>>`.
					if (Config.debug) {
						this
							.createDebugView(payload.name, payload.source)
							.modes({
								nonvoid : false,
								hidden  : true
							});
					}
				}

				try {
					SimpleAudio.lists.add(listId, trackObjs);
				}
				catch (ex) {
					return this.error(ex.message);
				}

				// Custom fake debug view setup for `<</createplaylist>>`.
				if (Config.debug) {
					this
						.createDebugView(`/${this.name}`, `<</${this.name}>>`)
						.modes({
							nonvoid : false,
							hidden  : true
						});
				}
			}
		});

		/*
			<<masteraudio action_list>>
		*/
		Macro.add('masteraudio', {
			handler() {
				if (this.args.length === 0) {
					return this.error('no options specified');
				}

				const optArgs = Object.create(null);

				// Process optional arguments.
				for (let i = 0; i < this.args.length; ++i) {
					switch (this.args[i]) {
						case 'load':
						case 'stop':
						case 'unload': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = this.args[i];
							break;
						}

						case 'mute':
						case 'unmute': {
							optArgs.mute = this.args[i] === 'mute';
							break;
						}

						case 'muteonhide':
						case 'nomuteonhide': {
							optArgs.muteOnHide = this.args[i] === 'muteonhide';
							break;
						}

						case 'volume': {
							if (++i >= this.args.length) {
								return this.error('volume option missing required level value');
							}

							optArgs.volume = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.volume)
								|| !Number.isFinite(optArgs.volume)
								|| optArgs.volume < 0
							) {
								return this.error(`volume option value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						default: {
							return this.error(`unknown option: ${this.args[i]}`);
						}
					}
				}

				try {
					if (optArgs?.mute != null) { // nullish test
						SimpleAudio.mute(optArgs.mute);
					}

					if (optArgs?.muteOnHide != null) { // nullish test
						SimpleAudio.muteOnHidden(optArgs.muteOnHide);
					}

					if (optArgs?.volume != null) { // nullish test
						SimpleAudio.volume(optArgs.volume);
					}

					switch (optArgs?.action) {
						case 'load': {
							SimpleAudio.load();
							break;
						}

						case 'stop': {
							SimpleAudio.stop();
							break;
						}

						case 'unload': {
							SimpleAudio.unload();
							break;
						}
					}

					// Custom debug view setup.
					if (Config.debug) {
						this.debugView.modes({ hidden : true });
					}
				}
				catch (ex) {
					return this.error(`error executing option: ${ex.message}`);
				}
			}
		});

		/*
			<<playlist list_id option_list>>
		*/
		Macro.add('playlist', {
			handler() {
				if (this.args.length < 2) {
					const errors = [];
					if (this.args.length < 1) { errors.push('list ID'); }
					if (this.args.length < 2) { errors.push('options'); }
					return this.error(`no ${errors.join(' or ')} specified`);
				}

				const id = String(this.args[0]).trim();

				if (!SimpleAudio.lists.has(id)) {
					return this.error(`playlist "${id}" does not exist`);
				}

				const list    = SimpleAudio.lists.get(id);
				const optArgs = Object.assign(Object.create(null), {
					fadeOver : 5
				});

				// Process optional arguments.
				for (let i = 1; i < this.args.length; ++i) {
					switch (this.args[i]) {
						case 'load':
						case 'pause':
						case 'play':
						case 'skip':
						case 'stop':
						case 'unload': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = this.args[i];
							break;
						}

						case 'fadein': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';
							optArgs.fadeTo = 1;
							break;
						}

						case 'fadeout': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';
							optArgs.fadeTo = 0;
							break;
						}

						case 'fadeto': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';

							if (++i >= this.args.length) {
								return this.error('fadeto option missing required level value');
							}

							optArgs.fadeTo = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeTo)
								|| !Number.isFinite(optArgs.fadeTo)
								|| optArgs.fadeTo < 0
							) {
								return this.error(`fadeto option value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'fadeoverto': {
							if (optArgs?.action) {
								return this.error(errorOnePlaybackAction(this.args[i], optArgs.action));
							}

							optArgs.action = 'fade';

							if (++i >= this.args.length) {
								return this.error('fadeoverto option missing required seconds value');
							}

							optArgs.fadeOver = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeOver)
								|| !Number.isFinite(optArgs.fadeOver)
								|| optArgs.fadeOver < 0
							) {
								return this.error(`fadeoverto option seconds value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							if (++i >= this.args.length) {
								return this.error('fadeoverto option missing required level value');
							}

							optArgs.fadeTo = Number.parseFloat(this.args[i]);

							if (
								Number.isNaN(optArgs.fadeTo)
								|| !Number.isFinite(optArgs.fadeTo)
								|| optArgs.fadeTo < 0
							) {
								return this.error(`fadeoverto option level value must be a decimal number greater-than or equal-to 0 (received: ${this.args[i]})`);
							}

							break;
						}

						case 'volume': {
							if (++i >= this.args.length) {
								return this.error('volume option missing required level value');
							}

							optArgs.volume = Number.parseFloat(this.args[i]);

							if (Number.isNaN(optArgs.volume) || !Number.isFinite(optArgs.volume)) {
								return this.error(`cannot parse volume: ${this.args[i]}`);
							}

							break;
						}

						case 'mute':
						case 'unmute': {
							optArgs.mute = this.args[i] === 'mute';
							break;
						}

						case 'loop':
						case 'unloop': {
							optArgs.loop = this.args[i] === 'loop';
							break;
						}

						case 'shuffle':
						case 'unshuffle': {
							optArgs.shuffle = this.args[i] === 'shuffle';
							break;
						}

						default: {
							return this.error(`unknown option: ${this.args[i]}`);
						}
					}
				}

				try {
					if (optArgs?.volume != null) { // nullish test
						list.volume(optArgs.volume);
					}

					if (optArgs?.mute != null) { // nullish test
						list.mute(optArgs.mute);
					}

					if (optArgs?.loop != null) { // nullish test
						list.loop(optArgs.loop);
					}

					if (optArgs?.shuffle != null) { // nullish test
						list.shuffle(optArgs.shuffle);
					}

					switch (optArgs?.action) {
						case 'fade': {
							list.fade(optArgs.fadeOver, optArgs.fadeTo);
							break;
						}

						case 'load': {
							list.load();
							break;
						}

						case 'pause': {
							list.pause();
							break;
						}

						case 'play': {
							list.playWhenAllowed();
							break;
						}

						case 'skip': {
							list.skip();
							break;
						}

						case 'stop': {
							list.stop();
							break;
						}

						case 'unload': {
							list.unload();
							break;
						}
					}

					// Custom debug view setup.
					if (Config.debug) {
						this.debugView.modes({ hidden : true });
					}
				}
				catch (ex) {
					return this.error(`error executing option: ${ex.message}`);
				}
			}
		});

		/*
			<<removeaudiogroup group_id>>
		*/
		Macro.add('removeaudiogroup', {
			handler() {
				if (this.args.length === 0) {
					return this.error('no group ID specified');
				}

				const id = String(this.args[0]).trim();

				if (!SimpleAudio.groups.has(id)) {
					return this.error(`group "${id}" does not exist`);
				}

				SimpleAudio.groups.delete(id);

				// Custom debug view setup.
				if (Config.debug) {
					this.debugView.modes({ hidden : true });
				}
			}
		});

		/*
			<<removeplaylist list_id>>
		*/
		Macro.add('removeplaylist', {
			handler() {
				if (this.args.length === 0) {
					return this.error('no list ID specified');
				}

				const id = String(this.args[0]).trim();

				if (!SimpleAudio.lists.has(id)) {
					return this.error(`playlist "${id}" does not exist`);
				}

				SimpleAudio.lists.delete(id);

				// Custom debug view setup.
				if (Config.debug) {
					this.debugView.modes({ hidden : true });
				}
			}
		});

		/*
			<<waitforaudio>>
		*/
		Macro.add('waitforaudio', {
			skipArgs : true,

			handler() {
				SimpleAudio.loadWithScreen();
			}
		});
	}
	else {
		// The HTML5 <audio> API is unavailable, so add no-op versions.
		Macro.add([
			'audio',
			'cacheaudio',
			'createaudiogroup',
			'createplaylist',
			'masteraudio',
			'playlist',
			'removeaudiogroup',
			'removeplaylist',
			'waitforaudio'
		], {
			skipArgs : true,

			handler() {
				/* no-op */

				// Custom debug view setup.
				if (Config.debug) {
					this.debugView.modes({ hidden : true });
				}
			}
		});
	}
})();
