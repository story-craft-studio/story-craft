/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VersionStatus } from './VersionStatus';
export type GameVersionDTO = {
    id: number;
    status: VersionStatus;
    gameId: number;
    authorId: number;
    changeLog: string;
    newGameTitle: string;
    rejectReason: string;
};

