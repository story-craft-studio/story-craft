import React from "react";
import { CommandType } from "../PassageCommandTypeDef";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import { CommandBlockBody, CommandBlockHolder, CommandBlockTitle } from "../command-blocks/base-ui";
import { getCommandTypeIcon } from "../command-blocks/command-type-icons";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import {useComponentTranslation} from "../../../util/translation-wrapper";

export default function ClearScreenCommandBlock() {
    const context = React.useContext(CommandListItemContext);
    if (!context) return null;

    const {t} = useComponentTranslation('clearScreenCommandBlock');

    return (
        <CommandBlockHolder commandType={CommandType.clearScreen}>
            <CommandBlockTitle commandType={CommandType.clearScreen}>
                {getCommandTypeIcon(CommandType.clearScreen)}
            </CommandBlockTitle>
            <CommandNavigators />
            <CommandBlockBody>
                <p style={{ paddingLeft: '15px' }}>{t('clearScreenDesc')}</p>
            </CommandBlockBody>
        </CommandBlockHolder>
    );
} 