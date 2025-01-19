
import { useState, useRef } from 'react'
import './App.css'
import * as Slider from '@radix-ui/react-slider';
import {PlayerState, YT, YTPlayer} from "./types/youtube.ts";
import { YoutubePlayer } from  "./component/VideoPlayer/YoutubePlayer.tsx"
import VideoTimePicker from "./component/VideoTimePicker/VideoTimePicker.tsx"

declare global {
    interface Window {
        YT: YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

function App(): JSX.Element {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(100);
    const [values, setValues] = useState([0, 100]); // Start and end values
    const playerRef = useRef<YTPlayer>(null);  // Now using YTPlayer type directly
    const videoId = 'dQw4w9WgXcQ';

    const handlePlayerReady = (newDuration: number): void => {
        console.log('Player is ready with duration:', newDuration);
        setDuration(newDuration);
        setValues([0, newDuration]);
    };

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
            player.stopVideo();
        }
    };

    const onSliderValueChange = ([left, right]: number[]): void => {
        const player = playerRef.current;
        if (!player) return;

        if (values[0] === left) {
            player.seekTo(right, true);
        } else {
            player.seekTo(left, true);
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
            
            <YoutubePlayer
                ref={playerRef}
                videoId={videoId}
                onPlayerReady={handlePlayerReady}
                onStateChange={setIsActive}
            />

            <div className="video-controls">
                <Slider.Root
                    className="slider-root"
                    value={values}
                    onValueChange={onSliderValueChange}
                    min={0}
                    max={duration}
                    step={0.001}
                    aria-label="Video Slider"
                >
                    <Slider.Track className="slider-track">
                        <Slider.Range className="slider-range"/>
                    </Slider.Track>
                    <Slider.Thumb className="slider-thumb"/>
                    <Slider.Thumb className="slider-thumb"/>
                </Slider.Root>
            </div>

            <div>
                <VideoTimePicker
                    value={values[0]}
                    onChange={(e : number)=> onSliderValueChange([e, values[1]])}
                    maxDuration={duration}
                    ></VideoTimePicker>

                <VideoTimePicker
                    value={values[1]}
                    onChange={(e : number)=> onSliderValueChange([values[0], e])}
                    maxDuration={duration}
                ></VideoTimePicker>
            </div>
        </>
    );
}

export default App;