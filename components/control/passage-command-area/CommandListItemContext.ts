import {CommandListItemContextType} from "../../../common/passage-command/command-inputs/CommandInputTypeDefs";
import React from "react";

const CommandListItemContext = React.createContext<CommandListItemContextType | undefined>(undefined);
export { CommandListItemContext };
