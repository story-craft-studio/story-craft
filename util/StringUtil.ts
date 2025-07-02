import _ from 'lodash';
import React from "react";
import {
	adjectives,
	animals,
	colors,
	countries,
	languages,
	names,
	starWars,
	uniqueNamesGenerator
} from "unique-names-generator";

//ref https://regex101.com/r/UwspC9/1
const folderNameRegex = new RegExp(/^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/);
export default class StringUtil {
	static randomString(length: number = 8) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}

	static makeRandomString(prefix: string = "", length: number = 10) {
		return prefix + StringUtil.randomString(length);
	}

	/**
	 * trim off some folder/file name at end
	 * @param fileOrFolderPath {string}
	 * @param backtrackCount {number} how many to trim off
	 * @return {string}
	 */
	static backtrackFileOrFolderPath(fileOrFolderPath: string, backtrackCount: number = 1): string {
		if (!_.isString(fileOrFolderPath)) {
			console.error("FATAL in StringUtil.backtrackFileOrFolderPath: expected 'fileOrFolderPath' to be a string, got ", fileOrFolderPath);

			let error = new Error();
			console.error("errorStack: ", error);
			return "";
		}

		if (!_.isNumber(backtrackCount) || backtrackCount < 1) {
			console.error("FATAL in StringUtil.backtrackFileOrFolderPath: expected 'backtrackCount' to be a number >= 1, got ", backtrackCount);

			let error = new Error();
			console.error("errorStack: ", error);
			return "";
		}

		let pathSeparator = StringUtil.getPathSeparator(fileOrFolderPath);
		if (pathSeparator === "") {
			return "";
		}

		let splits = fileOrFolderPath.split(pathSeparator) as string[];
		if (!splits[splits.length - 1]?.length) {
			splits.splice(splits.length - 1, 1);
		}

		splits = splits.filter((part, i) => {
			let targetPartIdx = splits.length - 1 - backtrackCount;
			return i <= targetPartIdx;
		});
		return splits.join(pathSeparator);
	}

	static getFolderOrFileParts(pathString: string): string[] {
		if (!_.isString(pathString)) {
			console.error("FATAL in StringUtil.getFolderOrFileParts: expected 'pathString' to be a string, got ", pathString);

			let error = new Error();
			console.error("errorStack: ", error);
			return [];
		}


		let pathSeparator = StringUtil.getPathSeparator(pathString);
		if (pathSeparator === "") {
			return [pathString];
		}

		let splits = pathString.split(pathSeparator) as string[];
		return splits;
	}

	static getPathSeparator(dir: string): string {
		if (!dir) return '';
		let usingSingleForwardSlash = dir.includes('/');
		let usingDoubleForwardSlash = dir.includes('//');
		let usingSingleBackwardSlash = dir.includes('\\'); //remember that \\ is equivalent to character '\'
		let usingDoubleBackwardSlash = dir.includes('\\\\'); //.. and \\\\ is equivalent to character '\\'

		let slashchar = (usingSingleForwardSlash) ? '/'
			: (usingDoubleForwardSlash) ? '//'
				: (usingSingleBackwardSlash) ? '\\'
					: (usingDoubleBackwardSlash) ? '\\\\'
						: "";
		return slashchar;
	}

	static isStartWithPathSeparator(dir: string) {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return false;
		}
		return dir.startsWith(pathSeparator);
	}

	static isEndWithPathSeparator(dir: string) {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return false;
		}
		return dir.endsWith(pathSeparator);
	}

	static ensureEndWithPathSeparator(dir: string): string {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return dir;
		}

		let endWithPathSeparator = dir.endsWith(pathSeparator);
		if (endWithPathSeparator) {
			return dir;
		}
		return dir + pathSeparator;
	}

	/**
	 * @param dir
	 * return a valid folderPath that ends with a path separator
	 */
	static ensureValidFolderPath(dir: string): string {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return dir;
		}
		dir = dir.replaceAll('/', pathSeparator);
		dir = dir.replaceAll('\\', pathSeparator);
		dir = dir.replaceAll('//', pathSeparator);
		dir = dir.replaceAll('\\\\', pathSeparator);

		let endWithPathSeparator = dir.endsWith(pathSeparator);
		if (endWithPathSeparator) {
			return dir;
		}
		return dir + pathSeparator;
	}

	static ensureValidFilePath(dir: string): string {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return dir;
		}
		dir = dir.replaceAll('/', pathSeparator);
		dir = dir.replaceAll('\\', pathSeparator);
		dir = dir.replaceAll('//', pathSeparator);
		dir = dir.replaceAll('\\\\', pathSeparator);

		let endWithPathSeparator = dir.endsWith(pathSeparator);
		if (endWithPathSeparator) {
			let lastIndexOfPathSeparator = dir.lastIndexOf(pathSeparator);
			return dir.substring(0, lastIndexOfPathSeparator);
		}
		return dir;
	}

	static ensureNOTEndWithPathSeparator(dir: string): string {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return dir;
		}
		let endWithPathSeparator = dir.endsWith(pathSeparator);
		if (!endWithPathSeparator) {
			return dir;
		}

		let lastIndexOfNonPathSeparator = -1;
		for (let i = dir.length - 1; i >= 0; i--) {
			let curChar = dir.charAt(i);
			if (curChar === pathSeparator) continue;

			lastIndexOfNonPathSeparator = i;
			break;
		}
		if (lastIndexOfNonPathSeparator < 0) {
			console.error("FATAL in ensureNOTEndWithPathSeparator: searchKeyword lastIndexOfNonPathSeparator failure", dir,
				"errorStack: ", new Error());
		}
		return dir.substring(0, lastIndexOfNonPathSeparator + 1);
	}

	static splitDirectoryString(dir: string): string[] {
		let pathSeparator = StringUtil.getPathSeparator(dir);
		if (pathSeparator === "") {
			return [dir];
		}
		return dir.split(pathSeparator);
	}

	static isEndWithFileName(fileDir: string) {
		let endFileName = StringUtil.getEndFileOrFolderName(fileDir);
		return endFileName && endFileName.length;
	}

	static getEndFileOrFolderName(fileDir: string): string {
		if (!fileDir) return '';
		let pathSeparator = StringUtil.getPathSeparator(fileDir);
		if (pathSeparator === "") {
			return fileDir;
		}
		if (fileDir.endsWith(pathSeparator)) {
			fileDir = fileDir.substring(0, fileDir.length - pathSeparator.length);
		}
		let lastIndexOfPathSeparator = fileDir.lastIndexOf(pathSeparator);
		return fileDir.substring(lastIndexOfPathSeparator + 1);
	}


	static extractNumsFromString(colorStr: string): number[] {
		//ref: https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
		if (!colorStr) return [];
		let numsAsStr = colorStr.match(/\d+/);
		if (!numsAsStr) return [];
		return numsAsStr.flatMap(eachStr => {
			let eachStrAsNumber = Number(eachStr);
			if (isNaN(eachStrAsNumber)) {
				return [];
			}
			return eachStrAsNumber;
		});
	}

	static isValidFolderName(packName: string) {
		let valid = packName && folderNameRegex.test(packName);
		//console.log('isValidFolderName ? ', packName, valid);
		return valid;
	}

	/**
	 * WARN: BARELY TEST THIS FUNC, USE WITH CAUTION
	 * @param targetDir
	 * @param relativeTo
	 */
	static getDirRelativeTo(targetDir: string, relativeTo: string) {
		let substring = targetDir.replace(relativeTo, '');
		return substring;
	}

	/**
	 * example:
	 *  <br> ? 'a/b/c' === 'a/b/c/'  => true
	 *  <br> ? '/a/b/c' === 'a/b/c/'  => true
	 *  <br> ? 'a\\b\\c\\' === 'a/b/c/'  => true
	 *  <br> ? 'a/b/c\' === 'a/b/c/'  => false
	 *  <br> ? 'a/b/c' === 'a/b'  => false
	 */
	static isSamePath(pathA: string, pathB: string) {
		pathA = pathA.trim().toLowerCase();
		pathB = pathB.trim().toLowerCase();

		let pathSeparatorA = StringUtil.getPathSeparator(pathA);
		let pathSeparatorB = StringUtil.getPathSeparator(pathB);

		let foldersInA = pathA.split(pathSeparatorA).filter(anyString => anyString.trim().length > 0);
		let foldersInB = pathB.split(pathSeparatorB).filter(anyString => anyString.trim().length > 0);

		if (foldersInA.length !== foldersInB.length) {
			return false;
		}

		let same = true;
		foldersInA.every((folderInA, i) => {
			let folderInB = foldersInB[i];
			if (folderInA !== folderInB) {
				same = false;
				return false;
			}
			return true;
		});
		return same;
	}


	static getSortAlphabeticallyFunc(takeStringFunc: (item: any) => string) {
		return function (a, b) {
			let strA = takeStringFunc(a);
			let strB = takeStringFunc(b);
			if (strA < strB) {
				return -1;
			}
			if (strA > strB) {
				return 1;
			}
			return 0;
		}
	}

	static cutFileExtensionFromPath(filePath: string) {
		let pathSep = StringUtil.getPathSeparator(filePath) || '/';
		let partSplits = StringUtil.splitDirectoryString(filePath);

		let lastPart = partSplits[partSplits.length - 1];

		let indexesOfDot = StringUtil.indexesOf(lastPart, ".");
		if (!indexesOfDot.length) return filePath;

		let firstDotIndex = indexesOfDot[0];
		lastPart = lastPart.substring(0, firstDotIndex);

		partSplits[partSplits.length - 1] = lastPart;
		return partSplits.join(pathSep);
	}

	static indexesOf(targetString: string, substringToFind: string): number[] {
		let indicesOf: number[] = [];
		for (let i = 0; i < targetString.length; i++) {
			if (substringToFind.length === 1) {
				if (targetString[i] === ".") indicesOf.push(i);
				continue;
			}

			let curSubString = targetString.substring(i, i + substringToFind.length);
			if (curSubString === substringToFind) indicesOf.push(i);
		}
		return indicesOf;
	}

	static addFileToFolderPath(folderPath: string, shortFileName: string) {
		let pathSep = StringUtil.getPathSeparator(folderPath) || '/';
		if (StringUtil.isStartWithPathSeparator(shortFileName)) {
			shortFileName = StringUtil.removePathSep(shortFileName);
		}

		if (StringUtil.isEndWithPathSeparator(folderPath)) {
			return folderPath + shortFileName;
		}
		return folderPath + pathSep + shortFileName;
	}

	private static removePathSep(fileName: string) {
		let pathSep = StringUtil.getPathSeparator(fileName) || '/'
		return fileName.replaceAll(pathSep, '');
	}

	static getInfoOfLastNumberIn(anyString: string, maxIterationFromEnd = 3): {
		startIndex: number,
		endIndex: number,
		value: number,
	} | undefined {
		if (!anyString) return undefined;
		let lastCharIndex = anyString.length - 1;
		let startI = -1, endI = -1;
		for (let i = lastCharIndex; i >= lastCharIndex - maxIterationFromEnd; i--) {
			let char = anyString[i];
			if (char < '0' || char > '9') {
				if (startI !== -1) break;
				continue;
			}

			if (endI === -1) endI = i;
			startI = i;
		}

		if (startI !== -1) {
			let value = Number(anyString.substring(startI, endI + 1));
			return {
				startIndex: startI,
				endIndex: endI,
				value
			}
		}
		return undefined;
	}

	static findNextNonDuplicatedString(defaultNewString: string, stringCollection: string[]): string {
		let stringCollectionAsSet = new Set<string>(stringCollection);

		let lastNumberInfo: {
			startIndex: number,
			endIndex: number,
			value: number
		} | undefined;
		let newString = defaultNewString;
		while (stringCollectionAsSet.has(newString)) {
			if (!lastNumberInfo)
				lastNumberInfo = StringUtil.getInfoOfLastNumberIn(newString, 3);

			if (!lastNumberInfo) {
				newString = newString + ' (1)';
				continue;
			}

			lastNumberInfo.value++;
			newString = newString.substring(0, lastNumberInfo.startIndex)
				+ lastNumberInfo.value
				+ newString.substring(lastNumberInfo.endIndex + 1)
		}
		return newString;
	}

	private static findEndBracketIndex(s: string, endBracketChar = ')'): number {
		let startBracketChar = '(';
		if (endBracketChar === '}') {
			startBracketChar = '{'
		}
		if (endBracketChar === ']') {
			startBracketChar = '['
		}
		if (endBracketChar === '>') {
			startBracketChar = '<'
		}

		let ignoreCount = 0;
		for (let i = 0; i < s.length; i++) {
			let c = s[i];
			if (c === startBracketChar) {
				ignoreCount++;
				continue;
			}
			if (c === endBracketChar) {
				if (ignoreCount === 1) {
					return i;
				}
				ignoreCount--;
			}
		}
		return -1;
	}

	static replacePathSep(dir: string, newPathSep: string) {
		if (!dir) return dir;

		let prevPathSep = this.getPathSeparator(dir);
		let parts = dir.split(prevPathSep);
		return parts.join(newPathSep);
	}

	/**
	 *
	 * @param pathA
	 * @param pathB
	 * @return true if <pathA> starts with <pathB> in temp of directory, ignore path seperator concern
	 */
	static pathStartWith(pathA: string, pathB: string) {
		let pathAPathSep = this.getPathSeparator(pathA);
		let pathASplits = pathA.split(pathAPathSep).filter(anyPartInA => anyPartInA.length > 0);

		let pathBPathSep = this.getPathSeparator(pathB);
		let pathBSplits = pathB.split(pathBPathSep).filter(anyPartInB => anyPartInB.length > 0);

		let stillStartWith = true;
		pathBSplits.every((eachPartInPathB, i) => {
			if (eachPartInPathB !== pathASplits[i]) {
				stillStartWith = false;
				return false;
			}
			return true;
		})
		return stillStartWith;
	}

	static indexesOfFirstFound(str, target, searchStartFrom: number = 0): { start: number, end: number } {
		let targetIndex = 0;
		let inBound = false;
		let start = -1, end = -1;
		for (let i = searchStartFrom; i < str.length; i++) {
			if (!inBound) {
				if (str[i] === target[targetIndex]) {
					inBound = true;
					targetIndex++;
					start = i;
					if (targetIndex >= target.length) {
						end = i;
						break;
					}
				}
				continue;
			}

			if (str[i] === target[targetIndex]) {
				inBound = true;
				targetIndex++;
				if (targetIndex >= target.length) {
					end = i;
					break;
				}
				continue;
			}
			inBound = false;
			targetIndex = 0;
		}
		if (end === -1) start = -1;
		return {start, end};
	}

	private static _getCharInserted(strNew: string, strOriginal: string): { char: string, insertOrRemovedAt: number } {
		for (let i = 0; i < strOriginal.length; i++) {
			let curCharInStrNew = strNew[i];
			let curCharInStrOld = strOriginal[i];
			if (curCharInStrNew === curCharInStrOld) {
				continue;
			}

			let nextCharInStrNew = strNew[i + 1];
			if (nextCharInStrNew !== curCharInStrOld) {
				console.error('UNEXPECTED!! Inserted more than one character');
			}
			return {char: curCharInStrNew, insertOrRemovedAt: i}
		}
		if (strOriginal.length < strNew.length) {
			return {char: strNew[strNew.length - 1], insertOrRemovedAt: strNew.length - 1};
		}
		console.error('UNEXPECTED!! Inserted none');
		return {char: '', insertOrRemovedAt: -1};
	}

	private static _getCharRemoved(strNew: string, strOriginal: string): { char: string, insertOrRemovedAt: number } {
		for (let i = 0; i < strNew.length; i++) {
			let curCharInStrNew = strNew[i];
			let curCharInStrOld = strOriginal[i];

			if (curCharInStrNew === curCharInStrOld) {
				continue;
			}

			let nextCharInStrOld = strOriginal[i + 1];
			if (nextCharInStrOld !== curCharInStrNew) {
				console.error('UNEXPECTED!! Removed more than one character');
			}
			return {char: curCharInStrOld, insertOrRemovedAt: i}
		}
		if (!strNew.length) {
			return {char: strOriginal[0], insertOrRemovedAt: 0};
		}
		if (strOriginal.length > strNew.length) {
			return {char: strOriginal[strOriginal.length - 1], insertOrRemovedAt: strOriginal.length - 1};
		}
		console.error('UNEXPECTED!! Removed none');
		return {char: '', insertOrRemovedAt: -1};
	}

	static insert(substring: string, at: number, intoString: string) {
		if (isNaN(at)) {
			console.error('The Fu*k man ? the param "at" you just given me aint no number!');
			return intoString;
		}
		if (!substring) return intoString;
		let output = [intoString.slice(0, at), substring, intoString.slice(at)].join('');
		return output;
	}

	static removeAt(at: number, originalStr: string, length: number = 1) {
		if (!length) return originalStr;

		let output = [originalStr.substring(0, at), originalStr.substring(at + length)].join('');
		return output;
	}

	static replaceString(originalStr, fromInclusive, toExclusive, newString) {
		if (!newString.length) return originalStr;

		let output = [originalStr.substring(0, fromInclusive), newString, originalStr.substring(toExclusive)].join('');
		return output;
	}


	static getFilePathExtension(imgDir: string) {
		let pathSep = StringUtil.getPathSeparator(imgDir);
		for (let i = imgDir.length - 1; i >= 0; i--) {
			if (pathSep && imgDir[i] === pathSep) return '';
			if (imgDir[i] === '.') return imgDir.substring(i + 1);
		}
		return '';
	}

	static getPathWithoutExtension(filePath: string): string {
		let pathSep = this.getPathSeparator(filePath);
		let indexOfDot = -1;
		for (let i = filePath.length - 1; i >= 0; i--) {
			let c = filePath[i];
			if (c === '.') {
				indexOfDot = i;
			}
			if (pathSep && c === pathSep) {
				break;
			}
		}

		if (indexOfDot < 0)
			return filePath;

		return filePath.substring(0, indexOfDot);
	}

	static isImageFileName(fileName: string) {
		return /.(?:jpeg|jpg|png|gif|tiff|psd|pdf|eps|ai|indd|raw|svg)$/i.test(fileName);
	}

	static isAudio(fileName: string) {
		return /\.(?:wav|mp3|aac|aax|aa|act|aiff|alac|amr|au|flac|m4a|m4b|m4p|movpkg|mpc|msv|ogg|oga|mogg|ra|rm|raw|sln|wma|wv|webm)$/i.test(fileName);
	}

	static arrayInsert(arr: any[], element: any, to: number) {
		return [
			...arr.slice(0, to),
			element,
			...arr.slice(to)
		];
	}

	static urlTest(text?: string): { isUrl, reason } {
		if (!text) {
			return {
				isUrl: false,
				reason: 'Falsy string',
			}
		}

		if (text.includes(' '))
			return {
				isUrl: false,
				reason: 'Contains whitespace',
			}

		const isUrlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig
		let regexTest = isUrlRegex.test(text);

		return {
			isUrl: regexTest,
			reason: '',
		}
	}

	static fromCSSPropertiesObj(styleObj: React.CSSProperties) {
		let styleText = Object.keys(styleObj).reduce((accumulator, key) => {

			const cssKey = _.kebabCase(key)
			const cssValue = styleObj[key].replace("'", "")

			// you can break the line, add indent for it if you need
			return `${accumulator}${cssKey}:${cssValue};`
		}, '');
		return styleText;
	}


	static genRandomName(options?: {
		maxAttempt?: number, //default 5
		banWord?: string[],
		separator?: string,
		wordCount?: number, //default 3
	}): string {
		let maxAttempt = _.isNil(options?.maxAttempt) ? 5 : options?.maxAttempt as number;
		let banWord = options?.banWord || BAN_WORD;
		let separator = _.isNil(options?.separator) ? ' ' : options?.separator as string;
		let wordCount = _.isNil(options?.wordCount) ? 3 : options?.wordCount as number;

		let attempt = 0;
		let name = '';
		while (attempt < maxAttempt) {
			name = uniqueNamesGenerator({
				dictionaries: [adjectives, animals, colors, countries, languages, names, starWars],
				separator: separator,
				style: "capital",
				length: wordCount,
			})

			let BANTHISSHIT = banWord.some(some => name.includes(some));
			if (!BANTHISSHIT) {
				return name;
			}
			attempt++;
		}
		return name;
	}

	static trimWhiteSpaceAndTab(assetName: string) {
		return assetName.trim().replace(/\t/g, '').replace(/ /g, '');
	}
}

const BAN_WORD = ['handicap']
