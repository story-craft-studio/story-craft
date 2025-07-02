export enum CommandType {
  newCommand = 'newCommand',

  characterDialog = 'characterDialog',
  characterShow = 'characterShow',
  changeBackground = 'changeBackground',
  customCommand = 'customCommand',
  chooseNextPassage = 'chooseNextPassage',
  jumpToPassageWithTag = 'jumpToPassageWithTag',
  playMusic = 'playMusic',
  delay = 'delay',
  tag = 'tag',
  clearScreen = 'clearScreen',
  script = 'script',

  backgroundEffect = 'backgroundEffect',
}

export enum CommandTier {
  BASIC = 'basic',
  ADVANCED = 'advanced'
}

// Configuration mapping command types to their tiers
export const COMMAND_TIER_CONFIG: Record<CommandType, CommandTier> = {
  // Basic Commands - frequently used, essential functionality
  [CommandType.newCommand]: CommandTier.BASIC,
  [CommandType.characterDialog]: CommandTier.BASIC,
  [CommandType.characterShow]: CommandTier.BASIC,
  [CommandType.chooseNextPassage]: CommandTier.BASIC,
  [CommandType.changeBackground]: CommandTier.BASIC,
  [CommandType.delay]: CommandTier.BASIC,
  [CommandType.jumpToPassageWithTag]: CommandTier.BASIC,
  [CommandType.playMusic]: CommandTier.BASIC,
  [CommandType.tag]: CommandTier.BASIC,
  [CommandType.clearScreen]: CommandTier.BASIC,
  [CommandType.backgroundEffect]: CommandTier.BASIC,

  // Advanced Commands - specialized functionality, less frequently used
  [CommandType.customCommand]: CommandTier.ADVANCED,
  [CommandType.script]: CommandTier.ADVANCED,
};

// Helper functions to work with command tiers
export const getCommandTier = (commandType: CommandType): CommandTier => {
  return COMMAND_TIER_CONFIG[commandType] || CommandTier.BASIC;
};

export const getCommandsByTier = (tier: CommandTier): CommandType[] => {
  return Object.entries(COMMAND_TIER_CONFIG)
    .filter(([_, cmdTier]) => cmdTier === tier)
    .map(([cmdType, _]) => cmdType as CommandType);
};

export const isAdvancedCommand = (commandType: CommandType): boolean => {
  return getCommandTier(commandType) === CommandTier.ADVANCED;
};

export const isBasicCommand = (commandType: CommandType): boolean => {
  return getCommandTier(commandType) === CommandTier.BASIC;
};

export interface PassageCommand {
  id: string;
  type: CommandType,
  content: any,
}
