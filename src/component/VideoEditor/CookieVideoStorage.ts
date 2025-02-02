/**
 * Represents metadata for a video
 * @interface VideoMetadata
 * @property {number} duration - The total duration of the video in seconds
 * @property {string} videoId - Unique identifier for the video
 */
interface VideoMetadata {
    duration: number;
    videoId: string;
}

/**
 * Represents a clip segment from a video
 * @interface VideoClip
 * @property {number} start - Start time of the clip in seconds
 * @property {number} end - End time of the clip in seconds
 * @property {string} id - Unique identifier for the clip
 */
export interface VideoClip {
    start: number;
    end: number;
    id: string;
}

/**
 * Represents the storage structure for video data
 * @interface VideoStorage
 * @property {VideoMetadata} metadata - Metadata about the video
 * @property {VideoClip[]} clips - Array of clips associated with the video
 */
interface VideoStorage {
    metadata: VideoMetadata;
    clips: VideoClip[];
}
/**
 * Class for managing video clips storage in browser cookies
 * @class CookieVideoStorage
 */
class CookieVideoStorage {
    private readonly COOKIE_PREFIX = 'video_storage_';
    
    /**
     * Sets a cookie with the specified name, value, and expiration
     * @private
     * @param {string} name - The name of the cookie
     * @param {string} value - The value to store in the cookie
     * @param {number} [days=30] - Number of days until the cookie expires
     */
    private setCookie(name: string, value: string, days: number = 30): void {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    /**
     * Retrieves a cookie value by name
     * @private
     * @param {string} name - The name of the cookie to retrieve
     * @returns {string|null} The cookie value if found, null otherwise
     */
    private getCookie(name: string): string | null {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length);
            }
        }
        return null;
    }

    /**
     * Generates a storage key for a video ID
     * @private
     * @param {string} videoId - The video ID to generate a key for
     * @returns {string} The generated storage key
     */
    private getStorageKey(videoId: string): string {
        return `${this.COOKIE_PREFIX}${videoId}`;
    }

    /**
     * Initializes storage for a new video if it doesn't exist
     * @public
     * @param {string} videoId - The ID of the video to initialize
     * @param {VideoMetadata} metadata - The metadata for the video
     */
    initVideo(videoId: string, metadata: VideoMetadata): void {
        const storageKey = this.getStorageKey(videoId);
        const existingStorage = this.getCookie(storageKey);
        
        if (!existingStorage) {
            const newStorage: VideoStorage = {
                metadata: metadata,
                clips: []
            };
            this.setCookie(storageKey, JSON.stringify(newStorage));
        }
    }

    /**
     * Retrieves all clips for a specific video
     * @public
     * @param {string} videoId - The ID of the video to get clips for
     * @returns {VideoClip[]} Array of clips associated with the video
     */
    getClips(videoId: string): VideoClip[] {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            return videoStorage.clips;
        }
        return [];
    }

    /**
     * Adds a new clip to a video's storage
     * @public
     * @param {string} videoId - The ID of the video to add the clip to
     * @param {VideoClip} clip - The clip to add
     */
    addClip(videoId: string, clip: VideoClip): void {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            videoStorage.clips.push(clip);
            this.setCookie(storageKey, JSON.stringify(videoStorage), 30);
        }
    }

    /**
     * Updates an existing clip with new values
     * @public
     * @param {string} videoId - The ID of the video containing the clip
     * @param {string} clipId - The ID of the clip to update
     * @param {Partial<VideoClip>} updates - The properties to update in the clip
     */
    updateClip(videoId: string, clipId: string, updates: Partial<VideoClip>): void {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            const clipIndex = videoStorage.clips.findIndex(clip => clip.id === clipId);
            console.log("in updateClip :", clipId, "updates:", updates)
            if (clipIndex !== -1) {
                videoStorage.clips[clipIndex] = {
                    ...videoStorage.clips[clipIndex],
                    ...updates
                };
                this.setCookie(storageKey, JSON.stringify(videoStorage), 30);
            }
        }
    }

    /**
     * Removes a clip from a video's storage
     * @public
     * @param {string} videoId - The ID of the video to remove the clip from
     * @param {string} clipId - The ID of the clip to remove
     */
    removeClip(videoId: string, clipId: string): void {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            videoStorage.clips = videoStorage.clips.filter(clip => clip.id !== clipId);
            this.setCookie(storageKey, JSON.stringify(videoStorage), 30);
        }
    }

    /**
     * Removes all clips from a video's storage
     * @public
     * @param {string} videoId - The ID of the video to clear clips from
     */
    clearClips(videoId: string): void {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            videoStorage.clips = [];
            this.setCookie(storageKey, JSON.stringify(videoStorage), 30);
        }
    }

    /**
     * Deletes a video's storage if it has no clips
     * @public
     * @param {string} videoId - The ID of the video to delete
     * @note Only deletes if there are no clips associated with the video
     */
    deleteVideo(videoId: string): void {
        const storageKey = this.getStorageKey(videoId);
        const storage = this.getCookie(storageKey);
        
        if (storage) {
            const videoStorage: VideoStorage = JSON.parse(storage);
            if (videoStorage.clips.length === 0) {
                this.setCookie(storageKey, '', -1);
            }
        }
    }
}

export default CookieVideoStorage;