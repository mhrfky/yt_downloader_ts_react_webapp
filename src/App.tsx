import { useState, useEffect, useRef } from 'react'
import './App.css'
import * as Slider from '@radix-ui/react-slider';
import {YT, PlayerState, YTPlayer} from "./types/youtube.ts";

declare global {
    interface Window {
        YT: YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

function App(): JSX.Element {
    const [isActive, setIsActive] = useState<boolean>(false);
    const playerRef = useRef<YTPlayer | null>(null);
    const [values, setValues] = useState([0, 100]); // Start and end values
    const videoId = 'dQw4w9WgXcQ'; // Store video ID as a constant

    useEffect((): (() => void) => {
        const tag: HTMLScriptElement = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";

        const firstScriptTag: HTMLScriptElement | null = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = (): void => {
            playerRef.current = new window.YT.Player('youtube-player', {
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
                            setIsActive(false);
                        } else if (event.data === PlayerState.PLAYING) {
                            setIsActive(true);
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

    const toggleActive = (): void => {
        const player = playerRef.current;
        if (!player) return;

        if (!isActive) {
            const currentState = player.getPlayerState();
            if (currentState === PlayerState.UNSTARTED || currentState === PlayerState.ENDED) {
                player.loadVideoById(videoId);
            }
            player.playVideo();
        } else {
            player.stopVideo(); // This will properly stop the video and prevent further downloads
        }
        // State will be updated by onStateChange event handler
    };

    const onSliderValueChange = ([left, right]: number[]): void => {
        if (values[0] === left) {
            playerRef.current?.seekTo(right, true);
        } else {
            playerRef.current?.seekTo(left, true);
        }
        setValues([left, right]);
        console.log('Left:', left, 'Right:', right);
    };

    return (
        <>
            <div className="video-controls">
                <button
                    onClick={toggleActive}
                    className="play-button"
                    type="button"
                    aria-label={isActive ? 'Stop video' : 'Play video'}
                >
                    {isActive ? 'Stop' : 'Play'}
                </button>
            </div>
            <div className="video-controls">
                <Slider.Root
                    className="slider-root"
                    value={values}
                    onValueChange={onSliderValueChange}
                    min={0}
                    max={100}
                    step={1}
                    aria-label="Video Slider"
                >
                    <Slider.Track className="slider-track">
                        <Slider.Range className="slider-range"/>
                    </Slider.Track>
                    <Slider.Thumb className="slider-thumb"/>
                    <Slider.Thumb className="slider-thumb"/>
                </Slider.Root>
            </div>
            <div className="video-container">
                <div id="youtube-player"></div>
            </div>
        </>
    );
}

export default App;