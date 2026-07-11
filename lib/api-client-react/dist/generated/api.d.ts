import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { DownloadInput, DownloadStats, DownloadTask, HealthStatus, LibraryAsset, ListDownloadsParams, ListLibraryParams, ListPostsParams, MediaItem, MediaItemUpdate, Post, PostStats, ScanInput, ScanLogEntry, ScanResult, Settings, SettingsUpdate, Source } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPostsUrl: (params?: ListPostsParams) => string;
/**
 * @summary List all posts
 */
export declare const listPosts: (params?: ListPostsParams, options?: RequestInit) => Promise<Post[]>;
export declare const getListPostsQueryKey: (params?: ListPostsParams) => readonly ["/api/posts", ...ListPostsParams[]];
export declare const getListPostsQueryOptions: <TData = Awaited<ReturnType<typeof listPosts>>, TError = ErrorType<unknown>>(params?: ListPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listPosts>>>;
export type ListPostsQueryError = ErrorType<unknown>;
/**
 * @summary List all posts
 */
export declare function useListPosts<TData = Awaited<ReturnType<typeof listPosts>>, TError = ErrorType<unknown>>(params?: ListPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPostUrl: (id: number) => string;
/**
 * @summary Get a post by ID
 */
export declare const getPost: (id: number, options?: RequestInit) => Promise<Post>;
export declare const getGetPostQueryKey: (id: number) => readonly [`/api/posts/${number}`];
export declare const getGetPostQueryOptions: <TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostQueryResult = NonNullable<Awaited<ReturnType<typeof getPost>>>;
export type GetPostQueryError = ErrorType<void>;
/**
 * @summary Get a post by ID
 */
export declare function useGetPost<TData = Awaited<ReturnType<typeof getPost>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPostMediaUrl: (id: number) => string;
/**
 * @summary Get media items for a post
 */
export declare const getPostMedia: (id: number, options?: RequestInit) => Promise<MediaItem[]>;
export declare const getGetPostMediaQueryKey: (id: number) => readonly [`/api/posts/${number}/media`];
export declare const getGetPostMediaQueryOptions: <TData = Awaited<ReturnType<typeof getPostMedia>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPostMedia>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostMediaQueryResult = NonNullable<Awaited<ReturnType<typeof getPostMedia>>>;
export type GetPostMediaQueryError = ErrorType<unknown>;
/**
 * @summary Get media items for a post
 */
export declare function useGetPostMedia<TData = Awaited<ReturnType<typeof getPostMedia>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostMedia>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMediaStatusUrl: (id: number, mediaId: number) => string;
/**
 * @summary Update a media item's status or local path
 */
export declare const updateMediaStatus: (id: number, mediaId: number, mediaItemUpdate: MediaItemUpdate, options?: RequestInit) => Promise<MediaItem>;
export declare const getUpdateMediaStatusMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMediaStatus>>, TError, {
        id: number;
        mediaId: number;
        data: BodyType<MediaItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMediaStatus>>, TError, {
    id: number;
    mediaId: number;
    data: BodyType<MediaItemUpdate>;
}, TContext>;
export type UpdateMediaStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateMediaStatus>>>;
export type UpdateMediaStatusMutationBody = BodyType<MediaItemUpdate>;
export type UpdateMediaStatusMutationError = ErrorType<void>;
/**
* @summary Update a media item's status or local path
*/
export declare const useUpdateMediaStatus: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMediaStatus>>, TError, {
        id: number;
        mediaId: number;
        data: BodyType<MediaItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMediaStatus>>, TError, {
    id: number;
    mediaId: number;
    data: BodyType<MediaItemUpdate>;
}, TContext>;
export declare const getGetPostStatsUrl: () => string;
/**
 * @summary Get post statistics summary
 */
export declare const getPostStats: (options?: RequestInit) => Promise<PostStats>;
export declare const getGetPostStatsQueryKey: () => readonly ["/api/posts/stats"];
export declare const getGetPostStatsQueryOptions: <TData = Awaited<ReturnType<typeof getPostStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPostStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPostStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getPostStats>>>;
export type GetPostStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get post statistics summary
 */
export declare function useGetPostStats<TData = Awaited<ReturnType<typeof getPostStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPostStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListSourcesUrl: () => string;
/**
 * @summary List scanned sources
 */
export declare const listSources: (options?: RequestInit) => Promise<Source[]>;
export declare const getListSourcesQueryKey: () => readonly ["/api/scanner/sources"];
export declare const getListSourcesQueryOptions: <TData = Awaited<ReturnType<typeof listSources>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSources>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSourcesQueryResult = NonNullable<Awaited<ReturnType<typeof listSources>>>;
export type ListSourcesQueryError = ErrorType<unknown>;
/**
 * @summary List scanned sources
 */
export declare function useListSources<TData = Awaited<ReturnType<typeof listSources>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAcknowledgeSourceUrl: (id: number) => string;
/**
 * @summary Acknowledge new posts for a source (clears new_posts_count)
 */
export declare const acknowledgeSource: (id: number, options?: RequestInit) => Promise<Source>;
export declare const getAcknowledgeSourceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof acknowledgeSource>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof acknowledgeSource>>, TError, {
    id: number;
}, TContext>;
export type AcknowledgeSourceMutationResult = NonNullable<Awaited<ReturnType<typeof acknowledgeSource>>>;
export type AcknowledgeSourceMutationError = ErrorType<void>;
/**
* @summary Acknowledge new posts for a source (clears new_posts_count)
*/
export declare const useAcknowledgeSource: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof acknowledgeSource>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof acknowledgeSource>>, TError, {
    id: number;
}, TContext>;
export declare const getStartScanUrl: () => string;
/**
 * @summary Start scanning a source
 */
export declare const startScan: (scanInput: ScanInput, options?: RequestInit) => Promise<ScanResult>;
export declare const getStartScanMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startScan>>, TError, {
        data: BodyType<ScanInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startScan>>, TError, {
    data: BodyType<ScanInput>;
}, TContext>;
export type StartScanMutationResult = NonNullable<Awaited<ReturnType<typeof startScan>>>;
export type StartScanMutationBody = BodyType<ScanInput>;
export type StartScanMutationError = ErrorType<unknown>;
/**
* @summary Start scanning a source
*/
export declare const useStartScan: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startScan>>, TError, {
        data: BodyType<ScanInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startScan>>, TError, {
    data: BodyType<ScanInput>;
}, TContext>;
export declare const getGetScanLogUrl: () => string;
/**
 * @summary Get recent scanner log entries
 */
export declare const getScanLog: (options?: RequestInit) => Promise<ScanLogEntry[]>;
export declare const getGetScanLogQueryKey: () => readonly ["/api/scanner/log"];
export declare const getGetScanLogQueryOptions: <TData = Awaited<ReturnType<typeof getScanLog>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getScanLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getScanLog>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetScanLogQueryResult = NonNullable<Awaited<ReturnType<typeof getScanLog>>>;
export type GetScanLogQueryError = ErrorType<unknown>;
/**
 * @summary Get recent scanner log entries
 */
export declare function useGetScanLog<TData = Awaited<ReturnType<typeof getScanLog>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getScanLog>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListDownloadsUrl: (params?: ListDownloadsParams) => string;
/**
 * @summary List download tasks
 */
export declare const listDownloads: (params?: ListDownloadsParams, options?: RequestInit) => Promise<DownloadTask[]>;
export declare const getListDownloadsQueryKey: (params?: ListDownloadsParams) => readonly ["/api/downloads", ...ListDownloadsParams[]];
export declare const getListDownloadsQueryOptions: <TData = Awaited<ReturnType<typeof listDownloads>>, TError = ErrorType<unknown>>(params?: ListDownloadsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDownloads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDownloads>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDownloadsQueryResult = NonNullable<Awaited<ReturnType<typeof listDownloads>>>;
export type ListDownloadsQueryError = ErrorType<unknown>;
/**
 * @summary List download tasks
 */
export declare function useListDownloads<TData = Awaited<ReturnType<typeof listDownloads>>, TError = ErrorType<unknown>>(params?: ListDownloadsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDownloads>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getQueueDownloadUrl: () => string;
/**
 * @summary Queue a download task
 */
export declare const queueDownload: (downloadInput: DownloadInput, options?: RequestInit) => Promise<DownloadTask>;
export declare const getQueueDownloadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof queueDownload>>, TError, {
        data: BodyType<DownloadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof queueDownload>>, TError, {
    data: BodyType<DownloadInput>;
}, TContext>;
export type QueueDownloadMutationResult = NonNullable<Awaited<ReturnType<typeof queueDownload>>>;
export type QueueDownloadMutationBody = BodyType<DownloadInput>;
export type QueueDownloadMutationError = ErrorType<unknown>;
/**
* @summary Queue a download task
*/
export declare const useQueueDownload: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof queueDownload>>, TError, {
        data: BodyType<DownloadInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof queueDownload>>, TError, {
    data: BodyType<DownloadInput>;
}, TContext>;
export declare const getGetDownloadUrl: (id: number) => string;
/**
 * @summary Get a download task by ID
 */
export declare const getDownload: (id: number, options?: RequestInit) => Promise<DownloadTask>;
export declare const getGetDownloadQueryKey: (id: number) => readonly [`/api/downloads/${number}`];
export declare const getGetDownloadQueryOptions: <TData = Awaited<ReturnType<typeof getDownload>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDownload>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDownload>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDownloadQueryResult = NonNullable<Awaited<ReturnType<typeof getDownload>>>;
export type GetDownloadQueryError = ErrorType<unknown>;
/**
 * @summary Get a download task by ID
 */
export declare function useGetDownload<TData = Awaited<ReturnType<typeof getDownload>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDownload>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDownloadStatsUrl: () => string;
/**
 * @summary Get download statistics
 */
export declare const getDownloadStats: (options?: RequestInit) => Promise<DownloadStats>;
export declare const getGetDownloadStatsQueryKey: () => readonly ["/api/downloads/stats"];
export declare const getGetDownloadStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDownloadStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDownloadStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDownloadStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDownloadStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDownloadStats>>>;
export type GetDownloadStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get download statistics
 */
export declare function useGetDownloadStats<TData = Awaited<ReturnType<typeof getDownloadStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDownloadStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListLibraryUrl: (params?: ListLibraryParams) => string;
/**
 * @summary List library assets
 */
export declare const listLibrary: (params?: ListLibraryParams, options?: RequestInit) => Promise<LibraryAsset[]>;
export declare const getListLibraryQueryKey: (params?: ListLibraryParams) => readonly ["/api/library", ...ListLibraryParams[]];
export declare const getListLibraryQueryOptions: <TData = Awaited<ReturnType<typeof listLibrary>>, TError = ErrorType<unknown>>(params?: ListLibraryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLibrary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLibrary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLibraryQueryResult = NonNullable<Awaited<ReturnType<typeof listLibrary>>>;
export type ListLibraryQueryError = ErrorType<unknown>;
/**
 * @summary List library assets
 */
export declare function useListLibrary<TData = Awaited<ReturnType<typeof listLibrary>>, TError = ErrorType<unknown>>(params?: ListLibraryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLibrary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLibraryAssetUrl: (id: number) => string;
/**
 * @summary Get a library asset by ID
 */
export declare const getLibraryAsset: (id: number, options?: RequestInit) => Promise<LibraryAsset>;
export declare const getGetLibraryAssetQueryKey: (id: number) => readonly [`/api/library/${number}`];
export declare const getGetLibraryAssetQueryOptions: <TData = Awaited<ReturnType<typeof getLibraryAsset>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLibraryAsset>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLibraryAsset>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLibraryAssetQueryResult = NonNullable<Awaited<ReturnType<typeof getLibraryAsset>>>;
export type GetLibraryAssetQueryError = ErrorType<void>;
/**
 * @summary Get a library asset by ID
 */
export declare function useGetLibraryAsset<TData = Awaited<ReturnType<typeof getLibraryAsset>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLibraryAsset>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSettingsUrl: () => string;
/**
 * @summary Get app settings
 */
export declare const getSettings: (options?: RequestInit) => Promise<Settings>;
export declare const getGetSettingsQueryKey: () => readonly ["/api/settings"];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get app settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update app settings
 */
export declare const updateSettings: (settingsUpdate: SettingsUpdate, options?: RequestInit) => Promise<Settings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsUpdate>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SettingsUpdate>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update app settings
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsUpdate>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map