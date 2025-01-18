import {useEffect, useRef, useState} from "react";
import {PlayerState, YTPlayer} from "../../types/youtube.ts";
import { FC } from 'react';

interface YoutubePlayerProps {
    onStateChange: (isPlaying: boolean) => void;  // Callback to update parent state
}

const YoutubePlayer: FC<YoutubePlayerProps> = ({onStateChange}) => {
        const playerRef = useRef<YTPlayer | null>(null);
        const videoId = 'dQw4w9WgXcQ'; // Store video ID as a constant

        useEffect((): (() => void) => {
            const tag: HTMLScriptElement = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            const firstScriptTag: HTMLScriptElement | null = document.getElementsByTagName('script')[0];
            if (firstScriptTag?.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = (): void => {
                playerRef.current = new    window.YT.Player('youtube-player', {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                    },
                    events: {
                        onReady: (event: { target: YTPlayer }): void => {
                            console.log('Player is ready');
                        },
                        onStateChange: (event: { data: number }): void => {
                            if (event.data === PlayerState.UNSTARTED || event.data === PlayerState.ENDED) {
                                onStateChange?.(false);
                            } else if (event.data === PlayerState.PLAYING) {
                                onStateChange?.(true);
                            }
                        }
                    }
                });
            };

            return (): void => {
                if (playerRef.current) {
                    playerRef.current.destroy();
                }
            };
        }, []);
        return (
            <div className="video-container">
                <div id="youtube-player"></div>
            </div>
        );
    }


export {YoutubePlayer};