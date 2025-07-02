import {CommandType} from "../../../../common/passage-command/PassageCommandTypeDef";
import {useComponentTranslation} from "../../../../util/translation-wrapper";
import React, {useEffect, useRef, useState} from "react";
import ReactDOM from 'react-dom';
import './command-type-selector.css';
import {
	mapDisplayNameByCommandType,
	CommandTypeGroupsDiv
} from "./section-content-groups";

export function CommandTypeSelector(props: {
	value: CommandType | undefined
	onChange: (ev, cmdType: CommandType) => void,
}) {

	const {t} = useComponentTranslation('commandTypeSelector');
	const wrapperRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownContentRef = useRef<HTMLDivElement>(null);
	const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				!wrapperRef.current?.contains(event.target) &&
				!dropdownContentRef.current?.contains(event.target)
			) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [wrapperRef, dropdownContentRef]);

	const [showDropdown, setShowDropdown] = useState(false);
	const toggleShow = () => {
		if (!showDropdown && buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPosition({
				left: rect.left - 280, // Your original offset
				top: rect.bottom + window.scrollY
			});
		}
		setShowDropdown(!showDropdown);
	}

	const sectionWidth = 200;
	const groupSideMargin = 16;

	const chooseCommandType = (ev, cmdType: CommandType) => {
		if (!cmdType) return;
		props.onChange(ev, cmdType);
		setShowDropdown(false);
	}

	return <div ref={wrapperRef} className={'command-type-selector'}>
		<button ref={buttonRef} onPointerDown={toggleShow} className={"dropbtn"}>
			{
				props.value
					// @ts-ignore
					? t(mapDisplayNameByCommandType.get(props.value))
					: t('dropdown')
			}
		</button>
		{showDropdown && ReactDOM.createPortal(
			<div 
				ref={dropdownContentRef}
				className={"dropdown-content show"} 
				style={{
					position: 'absolute',
					left: dropdownPosition.left,
					top: dropdownPosition.top,
					zIndex: 1500
				}}
			>
				<div className={'flex'}>
					<CommandTypeGroupsDiv
						groupWidth={sectionWidth}
						groupSideMargin={groupSideMargin}
						chooseCommandType={chooseCommandType}
					/>
				</div>
			</div>,
			document.body
		)}
	</div>;
}
