import { components } from 'react-select';
import React, { forwardRef, useCallback, useEffect } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { InputTagType } from './tag-type-def';
import _ from 'lodash';

export const TagsInputField = forwardRef( function myRenderFunc(props: {
											  allowDuplicate,
											  equalFunc,

											  tagPoolToSelectFrom,
											  tags,
											  setTags,
											  setActiveTagId,
											  setShowPopper
										  }, ref) {

	const {
		allowDuplicate,
		equalFunc,

		tagPoolToSelectFrom,
		tags,
		setTags,
		setActiveTagId,
		setShowPopper
	} = props;

	const _equalFunc = (_.isFunction(equalFunc))
		? equalFunc
		: ((a, b) => a === b);

	const addTag = (newTag) => {
		let newTagList = tags;

		//if isNil, 'allowDuplicate' will be considered true so dont check falsy here
		if (allowDuplicate === false) {
			let existed = newTagList.find(anyTag => {
				return _equalFunc(anyTag, newTag);
			})

			if (!existed)
				newTagList = [...newTagList, newTag];
		}
		else {
			newTagList = [...newTagList, newTag];
		}
		setTags(newTagList);
	}

	const handleCreateOption = async (tagDisplayText) => {
		const additionalOption = findTagWithDisplayText(tagDisplayText, tagPoolToSelectFrom);

		addTag(additionalOption);

		setActiveTagId(additionalOption.id);
	};

	const listener = useCallback((e) => {
		setShowPopper(false);
		setActiveTagId(null);
	}, [ref, tags, setTags, setShowPopper, setActiveTagId]);

	useEffect(() => {
		// @ts-ignore
		if (ref.current) ref.current.focus();

		document.addEventListener('keydown', listener);

		return () => {
			document.removeEventListener('keydown', listener);
		};
	}, [ref, listener]);

	function isOptionUnique(prop) {
		const { option, options, valueKey, labelKey } = prop;
		return !options.find(opt => option[valueKey] === opt[valueKey])
	}
	return (
		<AsyncCreatableSelect
			defaultOptions
			isOptionUnique={isOptionUnique}
			// @ts-ignore
			ref={ref}
			name='tags'
			// @ts-ignore
			value={{}}
			// @ts-ignore
			loadOptions={(newTagDisplayText) => promiseOptions(newTagDisplayText, tags, tagPoolToSelectFrom)}
			menuPlacement={'auto'}
			// @ts-ignore
			components={{ LoadingIndicator: null, Option, SinleValue }}
			classNamePrefix='select'
			placeholder=''
			styles={tagsListStyles}
			cacheOptions
			onCreateOption={handleCreateOption}
			onChange={addTag}
		/>
	);
});


const promiseOptions = (newTagDisplayText, selectedTags: InputTagType[], tagPoolToSelectFrom: InputTagType[]) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (!newTagDisplayText) {
				resolve(tagPoolToSelectFrom);
				return;
			}

			//TODO: fetch from server
			let filteredAllReadySelectedTags = tagPoolToSelectFrom
				.filter(eachTagInPool => !selectedTags.includes(eachTagInPool))
				.filter(eachTag => {
					return eachTag.displayName.toLowerCase().includes(newTagDisplayText.toLowerCase())
				});
			resolve(filteredAllReadySelectedTags);
		}, 1000);
	});
};

export const COLORS = [
	'#e93a55', '#f94e45', '#ff8549', '#3e993c', '#1e8a78',
	'#238cd7', '#6d65a8', '#414a53', '#e36dab', '#4abeb7',
	'#ff8657', '#ffb855', '#84c15f', '#00bd9d', '#00b2d7',
	'#967cd7', '#a8b2bc', '#fb5779', '#ff7511', '#ffa800',
	'#ffd100', '#ace60f', '#19db7e', '#00d4c8', '#48dafd',
	'#008ce3', '#6457f9', '#9f46e4', '#ff78ff', '#ff4ba6'
];
export const TAGS = [
	{ id: 1, value: 'React', label: 'React', color: COLORS[1] },
	{ id: 2, value: 'Angular', label: 'Angular', color: COLORS[2] },
	{ id: 3, value: 'Vue', label: 'Vue', color: COLORS[3] },
	{ id: 4, value: 'Javascript', label: 'Javascript', color: COLORS[4] },
	{ id: 5, value: 'Typescript', label: 'Typescript', color: COLORS[5] }
];
const findTagWithDisplayText = (tagDisplayText, fromTagPool): InputTagType => {
	let found = fromTagPool.find(anyT => anyT.displayName === tagDisplayText);
	found.color = _.sample(COLORS);
	return found;


	// //if you want, create new as follow:
	// {
	// 	id: nanoid(),
	// 	value: tagDisplayText,
	// 	displayName: tagDisplayText,
	// 	color: COLORS[16]
	// }
}

// And let's add some custom styling to react-select component
const SinleValue = (props) => {

	const { data } = props;

	return (
		<components.SingleValue {...props}>
			<div className='Select-option'>
                <span className='SelectColorSingleValue' style={{
					backgroundColor: data.color
				}}>
                    {data.displayName}
                </span>
			</div>
		</components.SingleValue>
	);
};
const Option = (props: {data: InputTagType}) => {
	const { data } = props;

	return (
		// @ts-ignore
		<components.Option {...props}>
			<div className='Select-option'>
                <span>
                    {data.displayName}
                </span>
			</div>
		</components.Option>
	);
};
const tagsListStyles = ({
	container: (provided) => ({
		...provided,
		width: '100%'
	}),

	control: (provided, state) => ({
		...provided,
		height: 38,
		minHeight: 38,
		width: '100%',
		fontSize: 14,
		borderRadius: 6,
		padding: '0 0 0 8px',
		':hover': {
			cursor: 'pointer'
		},
		borderColor: 'transparent',
		border: state.isFocused ? '1px solid transparent' : '1px solid #transparent',
		boxShadow: state.isFocused ? 0 : 0,
		boxSizing: 'border-box',
		'&:hover': {
			borderColor: state.isFocused ? 'transparent' : 'transparent',
			boxShadow: state.isFocused ? 0 : 0,
			boxSizing: 'border-box'
		}
	}),

	menu: (provided) => ({
		...provided,
		boxShadow: '0 0 0 1px rgb(111 119 130 / 15%), 0 5px 20px 0 rgb(21 27 38 / 8%)',
		background: '#fff',
		width: '100%',
		boxSizing: 'border-box',
		margin: 0
	}),

	option: (provided, { isSelected }) => ({
		...provided,
		color: '#151b26',
		fontSize: 14,
		minHeight: '36px',
		backgroundColor: isSelected && '#fff',
		':hover': {
			cursor: 'pointer',
			backgroundColor: ' #f2f6f8'
		}
	})
});
