import { forwardRef, useEffect, useRef, useState } from "react";
import { PlayerState, YTPlayer } from "../../types/youtube.ts";

interface YoutubePlayerProps {
    videoId: string;
    onStateChange: (isPlaying: boolean) => void;
    onPlayerReady: (duration: number) => void;
}

const YoutubePlayer = forwardRef<YTPlayer, YoutubePlayerProps>(
    ({ videoId, onStateChange, onPlayerReady }, ref) => {
        const playerRef = useRef<YTPlayer | null>(null);
        const [duration, setDuration] = useState<number>(0);

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
                                onStateChange(false);
                            } else if (event.data === PlayerState.PLAYING) {
                                onStateChange(true);

                                // Capture the duration when the video starts playing
                                const newDuration = playerRef.current?.getDuration();
                                if (newDuration && !isNaN(newDuration)) {
                                    setDuration(newDuration); // Update duration state
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
                playerRef.current.playVideo(); // Start playing to ensure duration is available
            }
        }, [videoId]);

        // Listen for changes in duration and stop the video when it updates
        useEffect(() => {
            if (duration > 0) {
                playerRef.current?.stopVideo(); // Stop the video
                onPlayerReady(duration); // Notify parent component of the new duration
            }
        }, [duration]);

        return (
            <div className="video-container">
                <div id="youtube-player"></div>
            </div>
        );
    }
);

YoutubePlayer.displayName = 'YoutubePlayer';

export { YoutubePlayer };