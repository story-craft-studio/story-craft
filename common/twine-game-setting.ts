import _ from "lodash";
import {OneOfInputType} from "./character-dialog-setting-mgr";


export type SettingPropertyCreateOption = {
	min?: number,
	max?: number,
	step?: number,
	_title: string,
	_tooltip?: string,
	inputType: OneOfInputType,
	initialValue: any,

	unitsToChooseFrom?: string[],
	initialUnit?: string,

	// Add new property for asset type when using 'link' input type
	assetType?: string,
}

type SettingPropertyEditOption = {
	_title?: string,
	_tooltip?: string,
	value: any,
	unit: string,
	inputType?: OneOfInputType,
}

export type SettingPropertyDesc = SettingPropertyCreateOption & SettingPropertyEditOption;


export class TwineGameSetting {
	private _obj = {};
	private _curGroupName: string = '';

	constructor() {
	}

	createGroup(gName: string) {
		if (!gName) throw new Error('group name can not be empty')
		if (this._obj.hasOwnProperty(gName)) {
			this._curGroupName = gName;
			return this;
		}
		this._obj[gName] = {
			_title: '',
			_desc: '',
		};
		this._curGroupName = gName;
		return this;
	}

	withGroup(gName: string) {
		if (!gName) throw new Error('group name can not be empty');

		this._curGroupName = gName;

		if (!this._obj[this._curGroupName]) {
			this.createGroup(this._curGroupName);
		}
		return this;
	}

	setGroupDisplayTitle(gTitle: string) {
		if (!gTitle) throw new Error('Group title cannot be empty')
		if (!_.isString(gTitle)) throw new Error('Group title must be a string, got ' + gTitle)
		if (!this._curGroupName) throw new Error('Must switch to a group name first by calling function "withGroup"');

		this._obj[this._curGroupName]._title = gTitle;
		return this;
	}

	getGroupDisplayTitle(gName: string) {
		if (!gName) throw new Error('Group name cannot be empty');

		let gTitle = this._obj[gName]._title || '';
		if (_.isObjectLike(gTitle) || !_.isString(gTitle)) {
			//EXTREMELY WEIRD CASE WHERE title GOT SPLIT INTO AN OBJECT WHOSE KEY IS CHARACTER INDEX AND VALUE IS CHARACTER
			gTitle = Object.entries(gTitle).flatMap(eachEntry => {
				if (Number.isNaN(eachEntry[0])) return [];
				if (!_.isString(eachEntry[1])) return [];
				return [eachEntry[1]];
			}).join('');
		}
		return gTitle;
	}

	setGroupDisplayDescription(gDesc: string) {
		if (!gDesc) throw new Error('Group description cannot be empty')
		if (!_.isString(gDesc)) throw new Error('Group description must be a string, got ' + gDesc)
		if (!this._curGroupName) throw new Error('Must switch to a group name first by calling function "withGroup"')

		this._obj[this._curGroupName]._desc = gDesc;
		return this;
	}

	getGroupDisplayDescription(gName: string) {
		if (!gName) throw new Error('Group name cannot be empty');

		let gDesc = this._obj[gName]._desc || '';
		if (_.isObjectLike(gDesc) || !_.isString(gDesc)) {
			//EXTREMELY WEIRD CASE WHERE group description GOT SPLIT INTO AN OBJECT WHOSE KEY IS CHARACTER INDEX AND VALUE IS CHARACTER
			gDesc = Object.entries(gDesc).flatMap(eachEntry => {
				if (Number.isNaN(eachEntry[0])) return [];
				if (!_.isString(eachEntry[1])) return [];
				return [eachEntry[1]];
			}).join('');
		}
		return gDesc;
	}


	addProperty(propName: string, option: SettingPropertyCreateOption) {
		let initialValue = _.isNil(option.initialValue) ? '' : option.initialValue;
		let min = option.min;
		let max = option.max;
		let step = option.step;
		let inputType = option.inputType || 'text';
		let unitsToChooseFrom = option.unitsToChooseFrom || [];
		let unit = option.initialUnit || unitsToChooseFrom?.[0];
		let assetType = option.assetType || '';

		if (!this._curGroupName) throw new Error('Must switch to a group name first by calling function "withGroup"')
		if (!propName) throw new Error('property name can not be empty')

		if (this._obj[this._curGroupName][propName]) {
			return this;
		}

		let newPropObj: any = {
			value: initialValue,
			inputType,

			_title: option._title || "",
			_tooltip: option._tooltip || "",
		};
		if (inputType === 'slider') {
			newPropObj.min = min;
			newPropObj.max = max;
			newPropObj.step = step;
		}
		if (inputType === 'number') {
			newPropObj.unit = unit;
			newPropObj.unitsToChooseFrom = unitsToChooseFrom;
		}
		if (inputType === 'link') {
			newPropObj.assetType = assetType;
		}
		this._obj[this._curGroupName][propName] = newPropObj;
		// console.log("Add props:" , this._obj)
		return this;
	}

	setProperty(propName: string, option: SettingPropertyEditOption) {
		if (!this._curGroupName) throw new Error('Must switch to a group name first by calling function "withGroup"')
		if (!propName) throw new Error('property name can not be empty')


		if (!this._obj[this._curGroupName].hasOwnProperty(propName)) {
			console.warn('No such property ' + propName + ' in group ' + this._curGroupName);
			return;
		}

		let prevPropDesc = this._obj[this._curGroupName][propName];
		let value = option.value;

		let newPropObj: any = {
			...prevPropDesc,
			value,
		};
		if (option.inputType) {
			newPropObj.inputType = option.inputType;
		}
		if (option.unit) {
			newPropObj.unit = option.unit;
		}
		if (option._title) {
			newPropObj._title = option._title;
		}
		if (option._tooltip) {
			newPropObj._tooltip = option._tooltip;
		}
		this._obj[this._curGroupName][propName] = newPropObj;
		return this;
	}

	getPropertyTooltip(gName: string, propName: string) {
		if (!gName) throw new Error('Group name can not be empty');
		if (!propName) throw new Error('property name can not be empty');

		if (!this._obj[gName][propName]) {
			console.warn('No such property ' + propName + ' in group ' + gName);
		}
		return this._obj[gName][propName]._tooltip;
	}

	getPropertyDesc(gName:string, propName: string): SettingPropertyDesc {
		if (!gName) throw new Error('Group name can not be empty');
		if (!propName) throw new Error('property name can not be empty');

		if (!this._obj[gName].hasOwnProperty(propName)) {
			throw new Error('No such property ' + propName + ' in group ' + gName);
		}
		return this._obj[gName][propName];
	}

	getPropertyValue(gName:string, propName: string): any {
		if (!gName) throw new Error('Group name can not be empty');
		if (!propName) throw new Error('property name can not be empty');
		if (!this._obj[gName][propName]) console.error('No such property ' + propName + ' in group ' + gName);

		return this._obj[gName][propName].value;
	}

	static fromRawObj(obj: any) {
		let s = new TwineGameSetting();
		s._obj = obj || {};
		return s;
	}

	toRaw() {
		return {...this._obj};
	}

	getGroupNames() {
		return Object.keys(this._obj);
	}

	getPropertyNames(gName: string) {
		if (!gName) throw new Error('Group name cannot be empty');

		let groupDesc = this._obj[gName];
		if (!groupDesc) throw new Error('No such group name ' + gName);

		return Object.keys(groupDesc);
	}

	beOverriddenBy (otherTwineGameSetting: TwineGameSetting, option?: {
		overrideGroupTitle?: boolean, //default: false,
		overrideGroupDesc?: boolean, //default: false,
	}) {

		let overrideGroupTitle = _.isBoolean(option?.overrideGroupTitle) ? false : option?.overrideGroupTitle;
		let overrideGroupDesc = _.isBoolean(option?.overrideGroupDesc) ? false : option?.overrideGroupDesc;

		otherTwineGameSetting.getGroupNames()
			.forEach(eachGName => {
				this.withGroup(eachGName);

				if (overrideGroupTitle) {
					let gTitle = otherTwineGameSetting.getGroupDisplayTitle(eachGName);
					this.setGroupDisplayTitle(gTitle);
				}

				if (overrideGroupDesc) {
					let gDesc = otherTwineGameSetting.getGroupDisplayDescription(eachGName);
					this.setGroupDisplayDescription(gDesc);
				}

				let propNames = otherTwineGameSetting.getPropertyNames(eachGName);
				if (!this.hasGroup(eachGName)) {
					propNames.forEach(eachPName => {
						let prop = otherTwineGameSetting.getPropertyDesc(eachGName, eachPName);
						this.addProperty(eachPName, {
							_title: prop._title,
							_tooltip: prop._tooltip,
							initialValue: prop.value,
							inputType: prop.inputType,
							unitsToChooseFrom: prop.unitsToChooseFrom,
							initialUnit: prop.unit,
							max: prop.max,
							min: prop.min,
							step: prop.step,
							assetType: prop.assetType,
						})
					})
				}

				propNames.forEach(eachPName => {
					let prop = otherTwineGameSetting.getPropertyDesc(eachGName, eachPName);
					this.setProperty(eachPName, {
						unit: prop.unit,
						_title: prop._title,
						_tooltip: prop._tooltip,
						value: prop.value,
						inputType: prop.inputType,
					})
				})
			});
		return this;
	}

	private hasGroup(eachGName: string) {
		return !!this._obj[eachGName];
	}
}
