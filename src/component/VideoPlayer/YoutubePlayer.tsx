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
        const intervalRef = useRef<number | null>(null);

        // Cleanup interval on unmount
        useEffect(() => {
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }, []);

        const startDurationCheck = () => {
            // Clear existing interval if any
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Set up new interval
            intervalRef.current = window.setInterval(() => {
                const duration = playerRef.current?.getDuration();
                if (duration && duration > 0) {
                    onPlayerReady(duration);
                    clearInterval(intervalRef.current!);
                }
            }, 500);
        };

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
                        autoplay: 1,
                        controls: 1,
                    },
                    events: {
                        onReady: (event: { target: YTPlayer }) => {
                            if (ref) {
                                if (typeof ref === 'function') {
                                    ref(event.target);
                                } else {
                                    ref.current = event.target;
                                }
                            }
                            startDurationCheck();
                        },
                        onStateChange: (event: { data: number }) => {
                            if (event.data === PlayerState.UNSTARTED) {
                                onStateChange(false);
                                startDurationCheck();
                            } else if (event.data === PlayerState.PLAYING) {
                                onStateChange(true);
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
            console.log("videoId changed", videoId);
            if (playerRef.current) {
                playerRef.current.loadVideoById(videoId);
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