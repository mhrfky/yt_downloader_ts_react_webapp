export interface VideoEditState {
    videoId: string;
    name?: string;
    timestamp: number;
    duration: number;
    markers?: {
        start: number;
        end: number;
    }[];
}

export class VideoEditorStorage {
    private videoStates: Map<string, VideoEditState>;

    constructor() {
        this.videoStates = new Map();
    }

    addVideo(videoId: string, duration: number): void {
        if (!this.videoStates.has(videoId)) {
            this.videoStates.set(videoId, {
                videoId,
                timestamp: 0,
                duration,
                markers: []
            });
        }
    }

    getVideoState(videoId: string): VideoEditState | undefined {
        return this.videoStates.get(videoId);
    }

    getAllVideos(): VideoEditState[] {
        return Array.from(this.videoStates.values());
    }

    updateVideoState(videoId: string, updates: Partial<VideoEditState>): void {
        const currentState = this.videoStates.get(videoId);
        if (currentState) {
            this.videoStates.set(videoId, {
                ...currentState,
                ...updates
            });
        }
    }

    removeVideo(videoId: string): boolean {
        return this.videoStates.delete(videoId);
    }

    addMarker(videoId: string, start: number, end: number): void {
        const state = this.videoStates.get(videoId);
        if (state) {
            const markers = state.markers || [];
            markers.push({ start, end });
            this.updateVideoState(videoId, { markers });
        }
    }

    removeMarker(videoId: string, index: number): void {
        const state = this.videoStates.get(videoId);
        if (state && state.markers) {
            state.markers.splice(index, 1);
            this.updateVideoState(videoId, { markers: state.markers });
        }
    }
}