import * as React from "react";
import { useState } from "react";
import { DialogCard } from "../container/dialog-card";
import { DialogComponentProps } from "../../dialogs/dialogs.types";
import { AddNewBlock } from "../../common/passage-command/command-blocks/add-new-block";
import { DropdownComponent } from "../../common/passage-command/command-blocks/base-ui";
import TagBlock from "../../common/passage-command/command-blocks/tag-block";

export const TestUIModal: React.FC<DialogComponentProps> = (props) => {
	// Manage commands as an array of components
	const [Btns, setBtns] = useState<JSX.Element[]>([

	]);

	const handleAddBlock = () => {
		const newComponent = <></>;
		setBtns((prevBtns) => [...prevBtns, newComponent]);
		console.log("Added a new block...");
	};

	return (
		<DialogCard {...props} className="test-ui-modal" headerLabel="UI Test Panel">
			<div className="dialog-content">
				<h2>UI Testing Tools</h2>
				<p>Test controls and diagnostics will go here...</p>

				{/* Render all blocks */}
				{Btns.map((block) => block)}

				<TagBlock></TagBlock>
				<DropdownComponent
					options={['aaaa', 'aaaa','aaaa','aaaa','aaaa','aaaa']}
					onChange={()=>{}}
				></DropdownComponent>

				{/* Add New Block button */}
				<AddNewBlock onAddBlock={handleAddBlock} />
			</div>
		</DialogCard>
	);
};
