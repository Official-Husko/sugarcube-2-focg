/***********************************************************************************************************************

	locale/de-DU.js – Deutsch

	Localization by: webfischi.

	Copyright © 2019–2025 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

	For more information about the guidelines used to create this localization, see:
		http://www.motoslave.net/sugarcube/2/docs/#guide-localization

***********************************************************************************************************************/
/* global l10nStrings */
/* eslint-disable strict */

(() => {
	/*******************************************************************************
		General.
	*******************************************************************************/

	l10nStrings.textAbort = 'Verwerfen';

	l10nStrings.textAborting = 'Wird verworfen';

	l10nStrings.textCancel = 'Abbrechen';

	l10nStrings.textClear = 'Alle Löschen';

	l10nStrings.textClose = 'Schließen';

	l10nStrings.textDelete = 'Löschen';

	l10nStrings.textExport = 'Exportieren';

	// In lowercase, if possible.
	l10nStrings.textIdentity = 'spiel';

	l10nStrings.textImport = 'Importieren';

	l10nStrings.textLoad = 'Laden';

	l10nStrings.textOff = 'Aus';

	l10nStrings.textOk = 'OK';

	l10nStrings.textOn = 'An';

	l10nStrings.textSave = 'Speichern';

	// (noun) chance to act (in a game), moment, period
	l10nStrings.textTurn = 'Zug';


	/*******************************************************************************
		Errors.
	*******************************************************************************/

	// NOTE: `passage` is supplied locally.
	l10nStrings.errorNonexistentPassage = 'der Abschnitt "{passage}" existiert nicht';


	/*******************************************************************************
		Warnings.
	*******************************************************************************/

	l10nStrings.warningNoStorage = 'Es fehlen alle nutzbaren Storage APIs. Eine mögliche Ursach ist eine deaktivierte Cookie-Einstellungen Dritter, die unter anderem in Webspeichern und privaten Browserfenstern blockiert werden.';

	l10nStrings.warningNoWebStorage = 'Die Web Storage API fehlt, darum läuft {textIdentity} nur im eingeschränkten Modus. Du kannst zwar weiterspielen, aber ein paar ELemente funktionieren möglicherweise nicht richtig.';

	l10nStrings.warningDegraded = 'Einige Ressourcen, die für {textIdentity} benötigt werden, fehlen und köuft deshalb nur im eingeschränkten Modus. Du kannst zwar weiterspielen, aber ein paar ELemente funktionieren möglicherweise nicht richtig.';

	l10nStrings.warningNoSaves = 'Einige Ressourcen, die Speicherstände benötigt werden, fehlen. Deshalb kann in dieser Sitzung nicht gespeichert werden.';


	/*******************************************************************************
		API: Save.
	*******************************************************************************/

	l10nStrings.saveErrorDisallowed = 'Speichern ist derzeit nicht möglich.';

	l10nStrings.saveErrorDecodeFail = 'Speicherstand kann nicht geladen werden, da er möglicherweise beschädigt ist';

	l10nStrings.saveErrorDiskLoadFail = 'Speicherstand konnte nicht von Datenträger geladen werden';

	l10nStrings.saveErrorIdMismatch = 'Speicherstand ist von der falschen {textIdentity}';

	l10nStrings.saveErrorInvalidData = 'dem Speicherstand feheln Daten, da er möglicherweise beschädigt ist';

	l10nStrings.saveErrorNonexistent = 'Speicherstand existiert nicht';


	/*******************************************************************************
		Base UI.
	*******************************************************************************/

	l10nStrings.uiBarLabelToggle = 'UI Leiste ein/ausblenden';

	l10nStrings.uiBarLabelBackward = 'Einen Schritt im {textIdentity}-Ablauf zurück';

	l10nStrings.uiBarLabelForward = 'Einen Schritt im {textIdentity}-Ablauf nach vorne';

	// [DEPRECATED]
	l10nStrings.uiBarLabelJumpto = 'Springe zu einem bestimmten Punkt im {textIdentity}-Ablauf';


	/*******************************************************************************
		Dialog: Alert.
	*******************************************************************************/

	l10nStrings.alertTitle = 'Warnung';


	/*******************************************************************************
		Dialog: Restart.
	*******************************************************************************/

	l10nStrings.restartTitle = 'Neustart';

	l10nStrings.restartMesgPrompt = 'Der gesamte Spielfortschritt geht dabei verloren. Möchtest du wirklich von vorne beginnen?';


	/*******************************************************************************
		Dialog: Saves.
	*******************************************************************************/

	l10nStrings.continueTitle = 'Fortsetzen';

	l10nStrings.savesTitle = 'Speicherstände';

	l10nStrings.savesHeaderBrowser = 'Im Browser';

	l10nStrings.savesHeaderDisk = 'Auf Datenträger';

	l10nStrings.savesLabelBrowserClear = 'Alle Speicherstände im Browser löschen';

	l10nStrings.savesLabelBrowserExport = 'Browserspielstände als bundle exportieren';

	l10nStrings.savesLabelBrowserImport = 'Browserspielstände als bundle importieren';

	l10nStrings.savesLabelDiskLoad = 'Von Datenträger laden';

	l10nStrings.savesLabelDiskSave = 'Auf Datenträger speichern';

	l10nStrings.savesTextBrowserAuto = 'Auto';

	l10nStrings.savesTextBrowserSlot = 'Slot';

	l10nStrings.savesTextNoDate = 'unbekanntes Datum';


	/*******************************************************************************
		Dialog: Settings.
	*******************************************************************************/

	l10nStrings.settingsTitle = 'Einstellungen';

	l10nStrings.settingsTextReset = 'Auf Standard zurücksetzen';


	/*******************************************************************************
		Debugging: Error Views.
	*******************************************************************************/

	l10nStrings.errorViewTitle = 'Fehler';

	l10nStrings.errorViewLabelToggle = 'Fehleranzeige ein/ausblenden';


	/*******************************************************************************
		Debugging: Debug bar.
	*******************************************************************************/

	l10nStrings.debugBarLabelToggle = 'Debug-Leiste ein/ausblenden';

	l10nStrings.debugBarLabelViewsToggle = 'Debug-Anzeige ein/ausblenden';

	l10nStrings.debugBarLabelWatchAdd = 'Neue Überwachung hinzufügen';

	l10nStrings.debugBarLabelWatchAll = 'Alle überwachen';

	l10nStrings.debugBarLabelWatchClear = 'Alle Überwachungen entfernen';

	l10nStrings.debugBarLabelWatchDelete = 'Diese Überwachung entfernen';

	l10nStrings.debugBarLabelWatchPlaceholder = 'name einer variable';

	l10nStrings.debugBarLabelPassagePlaceholder = 'name eines abschnitts';

	l10nStrings.debugBarLabelPassagePlay = 'Abschnitt spielen';

	l10nStrings.debugBarLabelWatchToggle = 'Überwachung ein/ausblenden';

	l10nStrings.debugBarMesgNoWatches = 'Keine Überwachungen vorhanden';

	l10nStrings.debugBarTextAdd = 'Hinzufügen';

	l10nStrings.debugBarTextPassage = 'Abschnitt';

	l10nStrings.debugBarTextViews = 'Anzeigen';

	l10nStrings.debugBarTextWatch = 'Überwachung';


	/*******************************************************************************
		Macros.
	*******************************************************************************/

	// (verb) rewind, revert
	l10nStrings.macroBackText = 'Zurück';

	// (verb) go/send back
	l10nStrings.macroReturnText = 'Zurückkehren';


	/*******************************************************************************
		[DEPRECATED] Dialog: Autoload.
	*******************************************************************************/

	l10nStrings.autoloadTitle = 'Automatisches Laden';

	l10nStrings.autoloadMesgPrompt = 'Es existiert ein Autosave. Jetzt laden oder von vorne beginnen?';

	l10nStrings.autoloadTextCancel = 'Von vorne';

	l10nStrings.autoloadTextOk = 'Autosave laden';


	/*******************************************************************************
		[DEPRECATED] Dialog: Jump To.
	*******************************************************************************/

	l10nStrings.jumptoTitle = 'Zu Abschnitt springen';

	l10nStrings.jumptoMesgUnavailable = 'Im Moment sind keine Sprungmarken vorhanden\u2026';


	/*******************************************************************************
		[DEPRECATED] Dialog: Share.
	*******************************************************************************/

	l10nStrings.shareTitle = 'Teilen';
})();
