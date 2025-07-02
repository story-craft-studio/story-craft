import {useTranslation} from "react-i18next";


/**
 *
 * auto add 'components.<component's name>.' before passing to i18 translation function>
 * @param {string} componentName must matched component name defined as key of "components" in en-US.json
 */
const useComponentTranslation = (componentName: string) => {
	const {t, i18n, ready } = useTranslation();
	let tOverridden = (key: string, extraReplaceArgs?: any) => {
		return t('components.' + componentName + '.' + key, extraReplaceArgs)
	}
	return { t: tOverridden, tComp: tOverridden , i18n, ready}
}

const useErrorMessageTranslation = () => {
	const {t, i18n, ready } = useTranslation();


	/**
	 * @param {string} key must matched error message key defined as key of "errorMessage" in en-US.json
	 */
	let tOverridden = (key: string = '', extraReplaceArgs?: any) => {
		return t('errorMessage.' + key, extraReplaceArgs);
	}
	return { t: tOverridden, tError: tOverridden, i18n, ready}
}

const useDialogTranslation = (dialogName: string) => {
	const {t, i18n, ready } = useTranslation();
	let tOverridden = (key: string, extraReplaceArgs?: any) => {
		return t('dialogs.' + dialogName + '.' + key, extraReplaceArgs)
	}
	return { t: tOverridden, tDia: tOverridden , i18n, ready}
}


const useCommonTranslation = () => {
	const {t, i18n, ready } = useTranslation();
	let tOverridden = (key: string, extraReplaceArgs?: any) => {
		return t('common.' + key, extraReplaceArgs)
	}
	return { t: tOverridden, tCommon: tOverridden , i18n, ready}
}

export {useComponentTranslation, useErrorMessageTranslation, useDialogTranslation, useCommonTranslation};
