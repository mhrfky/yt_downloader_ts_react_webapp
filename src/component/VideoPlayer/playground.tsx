import { forwardRef, useEffect, useRef } from "react";
import { PlayerState, YTPlayer } from "../../types/youtube.ts";

interface YoutubePlayerProps {
    videoId: string;
    onStateChange: (isPlaying: boolean) => void;
    onPlayerReady: (duration: number) => void;
}

const YoutubePlayer = forwardRef<YTPlayer, YoutubePlayerProps>(
    ({ videoId, onStateChange, onPlayerReady }, ref) => {
        const playerRef = useRef<YTPlayer | null>(null);

        // Load the YouTube API script once when the component mounts
        useEffect(() => {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            const firstScriptTag = document.getElementsByTagName('script')[0];
            if (firstScriptTag?.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = () => {
                playerRef.current = new window.YT.Player('youtube-player', {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                    },
                    events: {
                        onReady: (event: { target: YTPlayer }) => {
                            onPlayerReady(event.target.getDuration());
                            console.log('Player is ready');
                            if (ref) {
                                if (typeof ref === 'function') {
                                    ref(event.target);
                                } else {
                                    ref.current = event.target;
                                }
                            }
                        },
                        onStateChange: (event: { data: number }) => {
                            if (event.data === PlayerState.UNSTARTED || event.data === PlayerState.ENDED) {
                                const duration = playerRef.current?.getDuration();
                                if (duration && !isNaN(duration)) {
                                    onPlayerReady(duration);
                                }
                            } else if (event.data === PlayerState.PLAYING) {
                                onStateChange(true);
                            }

                            // Check if the video is buffering or playing, then get the duration
                            if (event.data === PlayerState.BUFFERING || event.data === PlayerState.PLAYING) {
                                const duration = playerRef.current?.getDuration();
                                if (duration && !isNaN(duration)) {
                                    onPlayerReady(duration);
                                }
                            }
                        }
                    }
                });
            };

            return () => {
                if (playerRef.current) {
                    playerRef.current.destroy();
                }
            };
        }, []);

        // Reinitialize the player when the videoId changes
        useEffect(() => {
            if (playerRef.current) {
                playerRef.current.loadVideoById(videoId);

                // playerRef.current.stopVideo(); // Optional: Pause the new video
                onPlayerReady(playerRef.current.getDuration());

            }
        }, [videoId]);

        return (
            <div className="video-container">
                <div id="youtube-player"></div>
            </div>
        );
    }
);

YoutubePlayer.displayName = 'YoutubePlayer';

export { YoutubePlayer };