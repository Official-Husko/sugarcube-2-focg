/***********************************************************************************************************************

	globals.js

	Copyright © 2013–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

***********************************************************************************************************************/
/* eslint-disable prefer-const, no-unused-vars */

/*******************************************************************************
	Global variables.
*******************************************************************************/

/* [DEPRECATED] */
// Legacy objects (since v2.0.0, 2015-11-27).
//
// TODO: Delete these on January 2026.
let macros      = {};
let postdisplay = {};
let postrender  = {};
let predisplay  = {};
let prehistory  = {};
let prerender   = {};
/* [/DEPRECATED] */

// Temporary state object.
let TempState = {};

// Safety lock gating various APIs.
let apiSafetyLock = true;

// Session storage manager object.
let session = null;

// Settings object.
let settings = null;

// Setup object.
let setup = {};

// Persistent storage manager object.
let storage = null;


/*******************************************************************************
	Global functions.
*******************************************************************************/

/*
	Log to the console, and optionally throw, a deprecation warning.
*/
function warnDeprecated(what, mesg, doThrow) { // eslint-disable-line no-unused-vars
	const error = `[DEPRECATED] ${what} is deprecated${mesg ? `, see ${mesg} instead` : ''}`;

	console.warn(`${error}.`);

	if (doThrow) {
		throw new Error(error);
	}
}
