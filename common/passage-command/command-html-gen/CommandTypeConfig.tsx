import {CommandType} from "../PassageCommandTypeDef";

export const CommandTypeConfig = {
  changeBackground: {
    type: CommandType.changeBackground,
    editor: {
      contentInputStyle: {
        height: 'auto'
      },
      className: 'changeBackground'
    },
  },
  backgroundEffect: {
    type: CommandType.backgroundEffect,
    editor: {
      contentInputStyle: {
        height: 'auto'
      },
      className: 'backgroundEffect'
    },
  },
  delay: {
    type: CommandType.delay,
    editor: {
      contentInputStyle: {
        height: 'auto'
      },
      className: 'delay',
      // contentReactElement: DelayCommandInput
    },
  },

  chooseNextPassage: {
    type: CommandType.chooseNextPassage,
    editor: {
      contentInputStyle: {
        height: 'auto'
      },
      className: 'chooseNextPassage',
      // contentReactElement: ChooseNextPassageCommandInput
    },
  },

  clearScreen: {
    type: CommandType.clearScreen,
    editor: {
      contentInputStyle: {height: '80px'},
      className: 'command-clearScreen'
    }
  },

  script: {
    type: CommandType.script,
    editor: {
      contentInputStyle: {height: '80px'},
      className: 'command-script'
    }
  }
}