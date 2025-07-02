/**
 * Application-wide constants
 */

export const EXTERNAL_LINKS = {
    DISCORD: ''
} as const; 

// Asset URLs configuration - moved from hardcoded values for security
export const ASSET_URLS = {
    TEMPLATE_BACKGROUNDS: {
        MINA_WORLD_1: process.env.MINA_WORLD_BG_1 || '',
        MINA_WORLD_2: process.env.MINA_WORLD_BG_2 || '',
    },
    CHARACTER_IMAGES: {
        SLICE_OF_LIFE_1: process.env.SLICE_OF_LIFE_CHAR_1 || '',
        SLICE_OF_LIFE_2: process.env.SLICE_OF_LIFE_CHAR_2 || '',
        SLICE_OF_LIFE_3: process.env.SLICE_OF_LIFE_CHAR_3 || '',
        MEME_CAT_1: process.env.MEME_CAT_CHAR_1 || '',
        MEME_CAT_2: process.env.MEME_CAT_CHAR_2 || '',
    }
};

// Default placeholder URLs (safe for public exposure)
export const DEFAULT_ASSET_URLS = {
    TEMPLATE_BACKGROUNDS: {
        MINA_WORLD_1: '/assets/templates/mina-world-1.png',
        MINA_WORLD_2: '/assets/templates/mina-world-2.png',
    },
    CHARACTER_IMAGES: {
        SLICE_OF_LIFE_1: '/assets/characters/slice-of-life-1.gif',
        SLICE_OF_LIFE_2: '/assets/characters/slice-of-life-2.gif',
        SLICE_OF_LIFE_3: '/assets/characters/slice-of-life-3.gif',
        MEME_CAT_1: '/assets/characters/meme-cat-1.gif',
        MEME_CAT_2: '/assets/characters/meme-cat-2.gif',
    }
}; 