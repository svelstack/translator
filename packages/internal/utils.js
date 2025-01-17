const numberOfPluralParts = {
	'af': 2,
	'bn': 2,
	'bg': 2,
	'ca': 2,
	'da': 2,
	'de': 2,
	'el': 2,
	'en': 2,
	'eo': 2,
	'es': 2,
	'et': 2,
	'eu': 2,
	'fa': 2,
	'fi': 2,
	'fo': 2,
	'fur': 2,
	'fy': 2,
	'gl': 2,
	'gu': 2,
	'ha': 2,
	'he': 2,
	'hu': 2,
	'is': 2,
	'it': 2,
	'ku': 2,
	'lb': 2,
	'ml': 2,
	'mn': 2,
	'mr': 2,
	'nah': 2,
	'nb': 2,
	'ne': 2,
	'nl': 2,
	'nn': 2,
	'no': 2,
	'oc': 2,
	'om': 2,
	'or': 2,
	'pa': 2,
	'pap': 2,
	'ps': 2,
	'pt': 2,
	'so': 2,
	'sq': 2,
	'sv': 2,
	'sw': 2,
	'ta': 2,
	'te': 2,
	'tk': 2,
	'ur': 2,
	'zu': 2,
	'am': 2,
	'bh': 2,
	'fil': 2,
	'fr': 2,
	'gun': 2,
	'hi': 2,
	'hy': 2,
	'ln': 2,
	'mg': 2,
	'nso': 2,
	'pt_BR': 2,
	'ti': 2,
	'wa': 2,
	'mk': 2,
	'be': 3,
	'bs': 3,
	'hr': 3,
	'ru': 3,
	'sh': 3,
	'sr': 3,
	'uk': 3,
	'cs': 3,
	'sk': 3,
	'ga': 3,
	'lt': 3,
	'lv': 3,
	'pl': 3,
	'ro': 3,
	'sl': 4,
	'mt': 4,
	'cy': 4,
	'ar': 6,
};

/**
 * @param {string} locale
 * @return {number}
 */
export function getNumberOfPluralParts(locale) {
	const normalizedLocale = (locale !== 'pt_BR' && locale.length > 3)
		? locale.substring(0, locale.lastIndexOf('_'))
		: locale;

	return numberOfPluralParts[normalizedLocale] ?? 0;
}

/**
 * @param {string} locale
 * @param {number} number
 * @return {number}
 */
export function getLocaleNumber(locale, number) {
	number = Math.abs(number);

	const normalizedLocale = (locale !== 'pt_BR' && locale.length > 3)
		? locale.substring(0, locale.lastIndexOf('_'))
		: locale;

	switch (normalizedLocale) {
		case 'af':
		case 'bn':
		case 'bg':
		case 'ca':
		case 'da':
		case 'de':
		case 'el':
		case 'en':
		case 'eo':
		case 'es':
		case 'et':
		case 'eu':
		case 'fa':
		case 'fi':
		case 'fo':
		case 'fur':
		case 'fy':
		case 'gl':
		case 'gu':
		case 'ha':
		case 'he':
		case 'hu':
		case 'is':
		case 'it':
		case 'ku':
		case 'lb':
		case 'ml':
		case 'mn':
		case 'mr':
		case 'nah':
		case 'nb':
		case 'ne':
		case 'nl':
		case 'nn':
		case 'no':
		case 'oc':
		case 'om':
		case 'or':
		case 'pa':
		case 'pap':
		case 'ps':
		case 'pt':
		case 'so':
		case 'sq':
		case 'sv':
		case 'sw':
		case 'ta':
		case 'te':
		case 'tk':
		case 'ur':
		case 'zu':
			return number === 1 ? 0 : 1;

		case 'am':
		case 'bh':
		case 'fil':
		case 'fr':
		case 'gun':
		case 'hi':
		case 'hy':
		case 'ln':
		case 'mg':
		case 'nso':
		case 'pt_BR':
		case 'ti':
		case 'wa':
			return number < 2 ? 0 : 1;

		case 'be':
		case 'bs':
		case 'hr':
		case 'ru':
		case 'sh':
		case 'sr':
		case 'uk':
			return (number % 10 === 1 && number % 100 !== 11)
				? 0
				: ((number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20))
					? 1
					: 2);

		case 'cs':
		case 'sk':
			return number === 1
				? 0
				: (number >= 2 && number <= 4)
					? 1
					: 2;

		case 'ga':
			return number === 1
				? 0
				: number === 2
					? 1
					: 2;

		case 'lt':
			return (number % 10 === 1 && number % 100 !== 11)
				? 0
				: ((number % 10 >= 2 && (number % 100 < 10 || number % 100 >= 20))
					? 1
					: 2);

		case 'sl':
			return number % 100 === 1
				? 0
				: number % 100 === 2
					? 1
					: (number % 100 === 3 || number % 100 === 4)
						? 2
						: 3;

		case 'mk':
			return number % 10 === 1 ? 0 : 1;

		case 'mt':
			return number === 1
				? 0
				: (number === 0 || (number % 100 > 1 && number % 100 < 11))
					? 1
					: ((number % 100 > 10 && number % 100 < 20) ? 2 : 3);

		case 'lv':
			return number === 0
				? 0
				: (number % 10 === 1 && number % 100 !== 11)
					? 1
					: 2;

		case 'pl':
			return number === 1
				? 0
				: (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 12 || number % 100 > 14))
					? 1
					: 2;

		case 'cy':
			return number === 1
				? 0
				: number === 2
					? 1
					: (number === 8 || number === 11)
						? 2
						: 3;

		case 'ro':
			return number === 1
				? 0
				: (number === 0 || (number % 100 > 0 && number % 100 < 20))
					? 1
					: 2;

		case 'ar':
			return number === 0
				? 0
				: number === 1
					? 1
					: number === 2
						? 2
						: (number % 100 >= 3 && number % 100 <= 10)
							? 3
							: (number % 100 >= 11 && number % 100 <= 99)
								? 4
								: 5;

		default:
			return 0;
	}
}
