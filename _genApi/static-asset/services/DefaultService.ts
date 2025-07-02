/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetInfo } from '../models/AssetInfo';
import type { AssetType } from '../models/AssetType';
import type { GameInfo, GameInfoAndLikeStatus } from '../models/GameInfo';
import type { GameVersionDTO } from '../models/GameVersionDTO';
import type { RequestBrowseOwnAsset } from '../models/RequestBrowseOwnAsset';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { PublishNotification } from '../models/PublishNotification';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * @returns any ok
     * @throws ApiError
     */
    public static getApiGetGuestToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/get-guest-token',
        });
    }
    /**
     * upload new asset
     * @param formData
     * @returns any ok
     * @throws ApiError
     */
    public static postApiUploadNewAsset(
        formData: {
            name: string;
            assetType: AssetType;
            fileExtension: string;
            file: Blob;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upload-new-asset',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param requestBody
     * @returns any ok
     * @throws ApiError
     */
    public static postApiDeleteAsset(
        requestBody: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/delete-asset',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `bad id`,
            },
        });
    }
    /**
     * @param assetId
     * @returns AssetInfo ok
     * @throws ApiError
     */
    public static getApiAssetInfo(
        assetId: number,
    ): CancelablePromise<AssetInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/asset-info/{assetId}',
            path: {
                'assetId': assetId,
            },
            errors: {
                404: `not found id`,
            },
        });
    }
    /**
     * @param formData
     * @returns any ok
     * @throws ApiError
     */
    public static postApiUploadGame(
        formData: {
            file: Blob;
            changeLog: string;
            gameId: number;
            gameTitle: string;
            thumbFile: Blob;
            description: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/upload-game',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @returns any ok
     * @throws ApiError
     */
    public static postApiCreateNewGame(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/create-new-game',
        });
    }
    /**
     * @param requestBody
     * @returns AssetInfo ok
     * @throws ApiError
     */
    public static postApiBrowseMyAsset(
        requestBody: RequestBrowseOwnAsset,
    ): CancelablePromise<Array<AssetInfo>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/browse-my-asset',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns GameVersionDTO ok
     * @throws ApiError
     */
    public static postApiMyGameVersions(
        requestBody: {
            gameId: number;
            maxVersionId?: number;
            numTake: number;
        },
    ): CancelablePromise<Array<GameVersionDTO>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/my-game-versions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns GameVersionDTO ok
     * @throws ApiError
     */
    public static postAdminApiBrowseReview(
        requestBody: {
            minGameId: number;
            numTake: number;
        },
    ): CancelablePromise<Array<GameVersionDTO>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin-api/browse-review',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any ok
     * @throws ApiError
     */
    public static postAdminApiApproveGameVersion(
        requestBody: {
            gameId: number;
            versionId: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin-api/approve-game-version',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any ok
     * @throws ApiError
     */
    public static postAdminApiRejectGameVersion(
        requestBody: {
            gameId: number;
            versionId: number;
            rejectedReason: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin-api/reject-game-version',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns GameInfo ok
     * @throws ApiError
     */
    public static postApiListingGame(
        requestBody: {
            minId: number;
            numTake: number;
        },
    ): CancelablePromise<Array<GameInfoAndLikeStatus>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/listing-game',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param gameId
     * @returns GameInfo ok
     * @throws ApiError
     */
    public static getApiGameInfo(
        gameId: any,
    ): CancelablePromise<GameInfoAndLikeStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game-info/{gameId}',
            path: {
                'gameId': gameId,
            },
            errors: {
                400: `bad game id`,
                404: `not found game`,
            },
        });
    }

    // =========== API for game preset ===========

    /**
     * Create a new preset
     * @param formData 
     * @returns {NewPresetResponse | any}
     */
    public static postApiCreateNewPreset(
        body: {
            content: string;        // Template config, in JSON string
            name: string;           // Name of the preset
            thumb: File;          // Thumbnail of the preset, in binary format
        },
    ): CancelablePromise<NewPresetResponse | any> {
        const formData = {
            content: body.content,
            name: body.name,
            thumb: body.thumb
        }

        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/preset/new',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * Update a preset
     * @param requestBody 
     * @returns ok
     */
    public static postApiUpdatePreset(
        formData: {
            id: number;             // ID of the preset
            name: string;           // Name of the preset
            thumb?: File;          // Thumbnail of the preset, in binary format
            content: string;        // Template config, in JSON string
        },
    ): CancelablePromise<any> {

        console.log('postApiUpdatePreset', formData);

        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/preset/update',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * List presets
     * @param requestBody 
     * @returns ListPresetResponse | any
     */
    public static postApiListPreset(
        requestBody: {
            minId: number;          // Minimum ID of the preset
            numTake: number;        // Number of presets to take
            nameQuery?: string;      // Query to search for presets by name
        },
    ): CancelablePromise<ListPresetResponse | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/preset/listing',
            body: requestBody,
        });
    }

    public static getApiPresetContent(
        path: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/game-preset/${path}/content.json`,
        });
    }

    public static getApiPresetThumbnail(
        path: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/game-preset/${path}/thumb.png`,
        });
    }

    public static postApiListingPresetRecommended(
        requestBody: {
            minId: number;              // Minimum ID of the preset
            numTake: number;            // Number of presets to take
            nameQuery?: string;         // Query to search for presets by name
        },
    ): CancelablePromise<ListPresetResponse | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/preset/recommended',
            body: requestBody,
        });
    }

    public static getServerUrl(): string {
        return OpenAPI.BASE;
    }

    public static postApiGetNotifications(
        requestBody: {
            maxId: number;
            numTake: number;
        }
    ): CancelablePromise<PublishNotification[]> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/get-notifications',
            body: requestBody,
        });
    }

    public static postApiReadNotification(
        requestBody: {
            notificationId: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/read-notification',
            body: requestBody,
        });
    }
}

type NewPresetResponse = {
    presetId: number;       // ID of the preset
    path: string;           // Path to the preset
}

type ListPresetResponse = {
    id: number;
    name: string;
    ownerId: number;
    path: string;
    createTime: string;
    presetType: string;
    recommend: boolean;
}[]

