import React, { forwardRef } from 'react';

export const TagItem = forwardRef((props: { tag, setTags }, ref) => {
	const { tag, setTags } = props;
	const removeTag = () => setTags(prevState => prevState.filter(i => i.id !== tag.id));
	return (
		<div
			// @ts-ignore
			ref={ref}
			className='TaskTagItem'
			style={{
				background: tag.color
			}}
		>
			<span className='TaskTag-displayName'>{tag.displayName}</span>
			<svg onClick={removeTag} className='TaskTag-deleteButton' xmlns='http://www.w3.org/2000/svg'
				 viewBox='0 0 24 24' width='24' height='24'>
				<path fill='#494949FF' d='M0 0h24v24H0z'/>
				<path
					fill='#ffffff'
					d='M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z' />
			</svg>
		</div>
	);
});
