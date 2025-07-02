import React, { useCallback, useEffect, useRef, useState } from 'react';
import './TagsInputFieldWrapper.css';
import { TagsList } from './TagsList';
import { TagsInputField } from './TagsInputField';
import { TagsInputFieldProp } from './tag-type-def';

export function TagsInputFieldWrapper<T>(props: TagsInputFieldProp) {
	const { tagPoolToSelectFrom, tags, setTags } = props;
	const [referenceElement, setReferenceElement] = useState(null)
	const [popperElement, setPopperElement] = useState<any>(null)
	const [showPopper, setShowPopper] = useState(false)
	const [activeTagId, setActiveTagId] = useState(null)
	const selectRef = useRef(null);
	const tagsRef = useRef([]);

	useEffect(() => {
		if (activeTagId === null) return;

		let foundActiveTagIndex = tags.findIndex(tag => tag.id === activeTagId);
		if (foundActiveTagIndex < 0) return;

		setReferenceElement(tagsRef.current[foundActiveTagIndex]);
		setShowPopper(true);

	}, [setShowPopper, tags, tagsRef, activeTagId])

	const outsideClickHandler = useCallback((event) => {
		if (!popperElement || popperElement.contains(event.target)) {
			return
		}
		if (popperElement && !popperElement.contains(event.target)) {
			setShowPopper(false)
			setActiveTagId(null)
		}
	}, [popperElement, setShowPopper, setActiveTagId])

	useEffect(() => {
		if (!popperElement) return;
		document.addEventListener("mousedown", outsideClickHandler)
		return () => {
			document.removeEventListener("mousedown", outsideClickHandler)
		}
	}, [popperElement, outsideClickHandler])

	return (
		<div className={"TagsInputFieldWrapper"} id={props.id}>
			<div className="Tags">
				<div className="TaskTags">
					<TagsList
						tags={tags}
						setTags={setTags}
					/>

					<TagsInputField
						ref={selectRef}
						allowDuplicate={props.allowDuplicate}
						equalFunc={props.equalFunc}

						tagPoolToSelectFrom={tagPoolToSelectFrom}
						tags={tags}
						setTags={setTags}
						setActiveTagId={setActiveTagId}
						setShowPopper={setShowPopper}
					/>
				</div>
			</div>
		</div>
	)
}


