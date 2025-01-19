// YoutubePlayer.tsx
import { forwardRef, useEffect } from "react";
import { PlayerState, YTPlayer } from "../../types/youtube.ts";

interface YoutubePlayerProps {
    videoId: string;
    onStateChange: (isPlaying: boolean) => void;
    onPlayerReady: (duration : number) => void;
}

// We can forward the YTPlayer type directly instead of creating a wrapper interface
const YoutubePlayer = forwardRef<YTPlayer, YoutubePlayerProps>(
    ({ videoId, onStateChange, onPlayerReady }, ref) => {
        useEffect((): (() => void) => {
            const tag: HTMLScriptElement = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            const firstScriptTag: HTMLScriptElement | null = document.getElementsByTagName('script')[0];
            if (firstScriptTag?.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = (): void => {
                const player = new window.YT.Player('youtube-player', {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                    },
                    events: {
                        onReady: (event: { target: YTPlayer }): void => {
                            onPlayerReady(player.getDuration())
                            console.log('Player is ready');
                            if (ref) {
                                // Since we're using YTPlayer directly, we can assign to ref
                                if (typeof ref === 'function') {
                                    ref(event.target);
                                } else {
                                    ref.current = event.target;
                                }
                            }
                        },
                        onStateChange: (event: { data: number }): void => {
                            if (event.data === PlayerState.UNSTARTED || event.data === PlayerState.ENDED) {
                                onStateChange(false);
                            } else if (event.data === PlayerState.PLAYING) {
                                onStateChange(true);
                            }
                        }
                    }
                });
            };

            return (): void => {
                if (ref && typeof ref === 'object' && ref.current) {
                    ref.current.destroy();
                }
            };
        }, [videoId, onStateChange, ref]);

        return (
            <div className="video-container">
                <div id="youtube-player"></div>
            </div>
        );
    }
);

YoutubePlayer.displayName = 'YoutubePlayer';

export { YoutubePlayer };