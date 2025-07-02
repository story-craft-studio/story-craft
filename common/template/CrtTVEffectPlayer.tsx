import './CrtTVEffectPlayer.css';
import React, {HTMLAttributes, useEffect, useRef, useState} from "react";
import StringUtil from "../../util/StringUtil";
import LifeTimeController from "../../util/life-time-controller";
import _ from "lodash";

type CrtTVEffectPlayerProps = HTMLAttributes<any> & {
	children: React.JSX.Element,
	useGlitch?: boolean, //default: true
	useBackground?: boolean, //default: true
}

const genUid = (idPrefix: string = '') => 'CrtTVEffectPlayer-' + idPrefix + '-' + StringUtil.randomString();

/**
 * ref: https://codepen.io/GLITCHXploitR/pen/OxGKrq
 */
export default function CrtTVEffectPlayer (props: CrtTVEffectPlayerProps) {
	const [uid] = useState(genUid(props.id));

	const [compLifeTime, setCompLifeTime] = useState(LifeTimeController.create());

	const {children} = props;
	const useGlitch = _.isNil(props.useGlitch) ? true : props.useGlitch;
	const useBackground = _.isNil(props.useBackground) ? true : props.useBackground;

	const contentContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		tryRegen();
		return () => {
			compLifeTime.deleteAllCbs();
		}
	}, [children, contentContainerRef]);



	let tryRegen = () => {
		const contentContainer = contentContainerRef.current;
		if (!contentContainer) return;

		// generate Glitches...
		if (useGlitch) {
			tryGenerateGlitches(contentContainer);
		}

		//other effects..
		//..
	};

	function tryGenerateGlitches(contentContainer: HTMLDivElement) {
		if (!contentContainer.firstElementChild) return;

		let cloned = contentContainer.querySelectorAll('.clone');
		cloned.forEach(each => {
			each.remove();
		})

		for (let i = 0; i < 4; i++) {
			let span = contentContainer.firstElementChild.cloneNode(true);
			if (!span) continue;

			(span as HTMLSpanElement).classList.add('clone');
			contentContainer.appendChild(span);
		}
	}

    return (
		<div className="CrtTVEffectPlayer scanlines" style={props.style}>
			<div className="screen">
				<div className={"overlay " + `${useBackground ? '.use-background' : ''}`}>
					<div ref={contentContainerRef} className="text">
						<span>
							{children}
						</span>
					</div>
				</div>
			</div>
		</div>
    )
}
