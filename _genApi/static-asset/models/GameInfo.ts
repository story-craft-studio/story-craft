/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GameInfo = {
    id: number;
    name: string;
    description: string;
    ownerId: number;
};

export type GameInfoAndLikeStatus = {
    gameInfo: GameInfo;
    mySelfLike: boolean;
}