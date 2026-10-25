/***********************************************************************************************************************

	locale/ru-RU.js – Ру́сский

	Localization by: MEAT-KVAS.

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

	l10nStrings.textAbort = 'Отменить';

	l10nStrings.textAborting = 'Операция отменена';

	l10nStrings.textCancel = 'Отмена';

	l10nStrings.textClear = 'Очистить';

	l10nStrings.textClose = 'Закрыть';

	l10nStrings.textDelete = 'Удалить';

	l10nStrings.textExport = 'Сохранить в файл';

	// In lowercase, if possible.
	l10nStrings.textIdentity = 'игры';

	l10nStrings.textImport = 'Загрузить из файла';

	l10nStrings.textLoad = 'Загрузить';

	l10nStrings.textOff = 'Выкл';

	l10nStrings.textOk = 'ОК';

	l10nStrings.textOn = 'Вкл';

	l10nStrings.textSave = 'Сохранить';

	// (noun) chance to act (in a game), moment, period
	l10nStrings.textTurn = 'Ход';


	/*******************************************************************************
		Errors.
	*******************************************************************************/

	// NOTE: `passage` is supplied locally.
	l10nStrings.errorNonexistentPassage = 'Параграфа "{passage}" не существует';


	/*******************************************************************************
		Warnings.
	*******************************************************************************/

	l10nStrings.warningNoStorage = 'Все доступные API хранилища отсутствуют. Возможно, в браузере отключены сторонние файлы cookie, что также затрагивает сетевое хранилище, либо включён режим инкогнито.';

	l10nStrings.warningNoWebStorage = 'Отсутствует API сетевого хранилища, запуск {textIdentity} в ограниченном режиме. Вероятно, вы сможете продолжить, но некоторые части могут не работать должным образом.';

	l10nStrings.warningDegraded = 'Некоторые функции, необходимые для поддержки {textIdentity}, отсутствуют, запуск в ограниченном режиме. Вероятно, вы сможете продолжить, но некоторые части могут не работать должным образом.';

	l10nStrings.warningNoSaves = 'Некоторые функции, необходимые для поддержки сохранений, отсутствуют. Сохранения в этом сеансе отключены.';


	/*******************************************************************************
		API: Save.
	*******************************************************************************/

	l10nStrings.saveErrorDisallowed = 'В данный момент сохраниться нельзя';

	l10nStrings.saveErrorDecodeFail = 'не удаётся прочитать сохранение, возможно, оно повреждено';

	l10nStrings.saveErrorDiskLoadFail = 'не удалось загрузить сохранение с диска';

	l10nStrings.saveErrorIdMismatch = 'сохранение из другой {textIdentity}';

	l10nStrings.saveErrorInvalidData = 'в сохранении отсутствуют необходимые данные, возможно, оно повреждено';

	l10nStrings.saveErrorNonexistent = 'сохранения не существует';


	/*******************************************************************************
		Base UI.
	*******************************************************************************/

	l10nStrings.uiBarLabelToggle = 'Показать/скрыть меню';

	l10nStrings.uiBarLabelBackward = 'Перейти назад по ходу {textIdentity}';

	l10nStrings.uiBarLabelForward = 'Перейти вперёд по ходу {textIdentity}';

	// [DEPRECATED]
	l10nStrings.uiBarLabelJumpto = 'Перейти к определённой точке {textIdentity}';


	/*******************************************************************************
		Dialog: Alert.
	*******************************************************************************/

	l10nStrings.alertTitle = 'Внимание';


	/*******************************************************************************
		Dialog: Restart.
	*******************************************************************************/

	l10nStrings.restartTitle = 'Заново';

	l10nStrings.restartMesgPrompt = 'Весь несохранённый прогресс будет утерян. Уверены, что хотите начать заново?';


	/*******************************************************************************
		Dialog: Saves.
	*******************************************************************************/

	l10nStrings.continueTitle = 'Продолжить';

	l10nStrings.savesTitle = 'Сохранения';

	l10nStrings.savesHeaderBrowser = 'В браузере';

	l10nStrings.savesHeaderDisk = 'На диске';

	l10nStrings.savesLabelBrowserClear = 'Удалить все сохранения браузера';

	l10nStrings.savesLabelBrowserExport = 'Сохранить данные браузера в файл';

	l10nStrings.savesLabelBrowserImport = 'Загрузить данные браузера из файла';

	l10nStrings.savesLabelDiskLoad = 'Загрузить с диска';

	l10nStrings.savesLabelDiskSave = 'Сохранить на диск';

	l10nStrings.savesTextBrowserAuto = 'Автосохранение';

	l10nStrings.savesTextBrowserSlot = 'Ячейка';

	l10nStrings.savesTextNoDate = 'неизвестная дата';


	/*******************************************************************************
		Dialog: Settings.
	*******************************************************************************/

	l10nStrings.settingsTitle = 'Настройки';

	l10nStrings.settingsTextReset = 'По умолчанию';


	/*******************************************************************************
		Debugging: Error Views.
	*******************************************************************************/

	l10nStrings.errorViewTitle = 'Ошибка';

	l10nStrings.errorViewLabelToggle = 'Показать/скрыть ошибки';


	/*******************************************************************************
		Debugging: Debug bar.
	*******************************************************************************/

	l10nStrings.debugBarLabelToggle = 'Панель отладки';

	l10nStrings.debugBarLabelViewsToggle = 'Переключение режима отладки';

	l10nStrings.debugBarLabelWatchAdd = 'Добавить к отслеживаемым';

	l10nStrings.debugBarLabelWatchAll = 'Отслеживать все';

	l10nStrings.debugBarLabelWatchClear = 'Очистить список отслеживаемых';

	l10nStrings.debugBarLabelWatchDelete = 'Больше не отслеживать';

	l10nStrings.debugBarLabelWatchPlaceholder = 'название переменной';

	l10nStrings.debugBarLabelPassagePlaceholder = 'название параграфа';

	l10nStrings.debugBarLabelPassagePlay = 'Воспроизвести параграф';

	l10nStrings.debugBarLabelWatchToggle = 'Показать/скрыть список отслеживаемого';

	l10nStrings.debugBarMesgNoWatches = 'Отслеживаемые не назначены';

	l10nStrings.debugBarTextAdd = 'Добавить';

	l10nStrings.debugBarTextPassage = 'Параграф';

	l10nStrings.debugBarTextViews = 'Вид';

	l10nStrings.debugBarTextWatch = 'Отслеживать';


	/*******************************************************************************
		Macros.
	*******************************************************************************/

	// (verb) rewind, revert
	l10nStrings.macroBackText = 'Назад';

	// (verb) go/send back
	l10nStrings.macroReturnText = 'Вернуться';


	/*******************************************************************************
		[DEPRECATED] Dialog: Autoload.
	*******************************************************************************/

	l10nStrings.autoloadTitle = 'Автосохранение';

	l10nStrings.autoloadMesgPrompt = 'Найдено автосохранение. Загрузить его или начать заново?';

	l10nStrings.autoloadTextCancel = 'Заново';

	l10nStrings.autoloadTextOk = 'Загрузить автосохранение';


	/*******************************************************************************
		[DEPRECATED] Dialog: Jump To.
	*******************************************************************************/

	l10nStrings.jumptoTitle = 'Перейти к';

	l10nStrings.jumptoMesgUnavailable = 'В данный момент нет доступных точек перехода\u2026';


	/*******************************************************************************
		[DEPRECATED] Dialog: Share.
	*******************************************************************************/

	l10nStrings.shareTitle = 'Поделиться';
})();
