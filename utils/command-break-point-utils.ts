import { Passage, updatePassage, Story } from "../store/stories";
import { CommandBreakPoints } from "../../shared/typedef/command-break-points";
import { StoriesActionOrThunk } from "../store/undoable-stories";

export const addCommandBreakPoint = (
  passage: Passage,
  dispatch: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void,
  story: Story,
  insertAtIndex?: number,
  baseTagName: string = 'MyDefaultTag'
) => {
  console.log("addCommandBreakPoint", passage, dispatch, story, insertAtIndex, baseTagName)
  if (!passage || !dispatch || !story) {
    console.error("addCommandBreakPoint not work", passage, dispatch, story)
    return;
  }

  let curCommandBreakPoint = CommandBreakPoints.fromRaw(passage.commandBreakPoint);
  let existings = new Set(
    curCommandBreakPoint.getUniqueNames()
  );

  let newBreakPointBlueprint = {
    base: baseTagName,
    index: NaN,
    final: baseTagName,
  };

  while (existings.has(newBreakPointBlueprint.final)) {
    let nextIndex = (newBreakPointBlueprint.index || 0) + 1;
    newBreakPointBlueprint.final = newBreakPointBlueprint.base + '(' + nextIndex + ')';
    newBreakPointBlueprint.index = nextIndex;
  }

  let newBPName = newBreakPointBlueprint.final;
  let newCommandBreakPoint = curCommandBreakPoint.clone() || new CommandBreakPoints();

  // Use provided index if specified, otherwise use last slot
  let slotIndex = insertAtIndex !== undefined ? insertAtIndex : passage.commands?.length;
  newCommandBreakPoint.addToSlot(slotIndex, {
    name: newBPName
  });

  console.log("newCommandBreakPoint", newCommandBreakPoint)

  dispatch(
    updatePassage(
      story,
      passage,
      {
        commandBreakPoint: newCommandBreakPoint,
      }
    )
  );

  return newBPName;
};