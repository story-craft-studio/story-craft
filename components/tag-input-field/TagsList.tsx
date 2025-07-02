import React from 'react';

import { TagItem } from './TagItem';

export const TagsList = ({
	tags,
	setTags
}) => {

	return (
		<div className={'TagsList'}>
			{
				tags.map((tag, i) =>
					<TagItem
						key={tag.id}
						tag={tag}
						setTags={setTags}
					/>
				)
			}
		</div>
	);
};
