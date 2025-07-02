export class StoryNameExistsError extends Error {
    constructor(storyName: string) {
        super(`A story with the name '${storyName}' already exists`);
        this.name = 'StoryNameExistsError';
    }
}

export class StoryNotFoundError extends Error {
    constructor(storyId: string) {
        super(`Story with ID '${storyId}' not found`);
        this.name = 'StoryNotFoundError';
    }
} 