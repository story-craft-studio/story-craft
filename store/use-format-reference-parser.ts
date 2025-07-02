import {parseLinksFromCommands} from "../util/parse-links";
import {PassageCommand} from "../common/passage-command/PassageCommandTypeDef";

export function useFormatReferenceParser(
	formatName: string,
	formatVersion: string
): (commands: PassageCommand[]) => string[] {
	return parseLinksFromCommands;
}
