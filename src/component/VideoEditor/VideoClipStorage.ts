export interface VideoMetadata {
    name: string;
    duration: number;
}

export interface VideoClip {
    id: string;
    start: number;
    end: number;
}

export interface VideoStorage {
    metadata: VideoMetadata;
    clips: VideoClip[];
}

export class VideoClipStorage {
    private storage: Map<string, VideoStorage>;

    constructor() {
        this.storage = new Map();
    }

    // Initialize a fresh video storage
    initVideo(videoId: string, metadata: VideoMetadata): void {
        if(this.storage.has(videoId)) {
            return;
        }
        this.storage.set(videoId, {
            metadata,
            clips: []
        });
    }

    // Add a new clip to a video
    addClip(videoId: string, clip: VideoClip, metadata?: VideoMetadata): void {
        let storage = this.storage.get(videoId);
        console.debug("storage", storage)
        // If video doesn't exist and metadata is provided, initialize it
        if (!storage && metadata) {
            storage = {
                metadata,
                clips: []
            };
            this.storage.set(videoId, storage);
        } else if (!storage) {
            throw new Error(`Video ${videoId} not found and no metadata provided`);
        }

        // Check for duplicate IDs
        if (storage.clips.some(c => c.id === clip.id)) {
            throw new Error(`Clip with ID ${clip.id} already exists for video ${videoId}`);
        }

        storage.clips.push(clip);
    }

    // Remove a clip from a video
    removeClip(videoId: string, clipId: string): void {
        const storage = this.getVideoStorage(videoId);
        const clipIndex = storage.clips.findIndex(c => c.id === clipId);

        if (clipIndex === -1) {
            throw new Error(`Clip ${clipId} not found in video ${videoId}`);
        }

        storage.clips.splice(clipIndex, 1);

        // If no clips left, remove the video storage entirely
        // if (storage.clips.length === 0) {
        //     this.storage.delete(videoId);
        // }
    }

    // Update an existing clip
    updateClip(videoId: string, clipId: string, updates: Partial<VideoClip>): void {
        const storage = this.getVideoStorage(videoId);
        const clipIndex = storage.clips.findIndex(c => c.id === clipId);

        if (clipIndex === -1) {
            throw new Error(`Clip ${clipId} not found in video ${videoId}`);
        }

        // Ensure we don't change the ID during update
        if (updates.id && updates.id !== clipId) {
            throw new Error('Cannot change clip ID during update');
        }

        storage.clips[clipIndex] = {
            ...storage.clips[clipIndex],
            ...updates
        };
    }

    // Update video metadata
    updateMetadata(videoId: string, metadata: VideoMetadata): void {
        const storage = this.getVideoStorage(videoId);
        storage.metadata = metadata;
    }

    // Get video metadata
    getMetadata(videoId: string): VideoMetadata | undefined {
        return this.storage.get(videoId)?.metadata;
    }

    // Get all clips for a video
    getClips(videoId: string): VideoClip[] {
        const storage = this.storage.get(videoId);
        if (!storage) {
            return [];
        }
        return [...storage.clips];
    }

    // Get a specific clip
    getClip(videoId: string, clipId: string): VideoClip | undefined {
        const storage = this.storage.get(videoId);
        if (!storage) {
            return undefined;
        }
        return storage.clips.find(c => c.id === clipId);
    }

    // Clear a video and all its clips
    clearVideo(videoId: string): void {
        this.storage.delete(videoId);
    }

    // Get clips that overlap with a specific time range
    getClipsInTimeRange(videoId: string, start: number, end: number): VideoClip[] {
        const storage = this.storage.get(videoId);
        if (!storage) {
            return [];
        }

        return storage.clips.filter(clip =>
            clip.start <= end && clip.end >= start
        );
    }

    // Sort clips by start time
    sortClipsByStartTime(videoId: string): void {
        const storage = this.storage.get(videoId);
        if (!storage) {
            return;
        }

        storage.clips.sort((a, b) => a.start - b.start);
    }

    private getVideoStorage(videoId: string): VideoStorage {
        const storage = this.storage.get(videoId);
        if (!storage) {
            throw new Error(`Video ${videoId} not found`);
        }
        return storage;
    }
}