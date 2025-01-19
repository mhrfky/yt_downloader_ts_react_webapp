// Define YouTube Player types
export interface YT {
    Player: new (
        elementId: string,
        config: PlayerConfig
    ) => YTPlayer;
}

export interface PlayerConfig {
    videoId: string;
    playerVars?: {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
    };
    events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number }) => void;
    };
}

export enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
}

export interface YTPlayer {
    getPlayerState(): number;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    clearVideo(): void;
    destroy(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    loadVideoById(videoId: string): void;
    getDuration(): number;
    PlayerState: PlayerState;
}

