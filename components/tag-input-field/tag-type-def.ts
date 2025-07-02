export type InputTagType = {
	id: string,
	displayName: string
}

export type TagsInputFieldProp = {
	id?: string,
	tagPoolToSelectFrom: InputTagType[],
	tags: InputTagType[],
	onchange?: Function,
	allowDuplicate?: boolean,
	equalFunc?: (tagA, tagB) => boolean,
	setTags: (tags: string[]) => void
}
