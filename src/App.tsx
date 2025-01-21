
import {useState, useRef} from 'react'
import './App.css'
import {PlayerState, YT, YTPlayer} from "./types/youtube.ts";
import { YoutubePlayer } from  "./component/VideoPlayer/YoutubePlayer.tsx"
import  {VideoEditor} from "./component/VideoEditor/VideoEditor.tsx";

declare global {
    interface Window {
        YT: YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

function App(): JSX.Element {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(100);
    const playerRef = useRef<YTPlayer>(null);  // Now using YTPlayer type directly
    const [videoId, setVideoId] = useState<string>("dQw4w9WgXcQ")


    const handlePlayerReady = (newDuration: number): void => {
        console.log('Player is ready with duration:', newDuration);
        setDuration(newDuration);
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

    const onTimeChange = (currentFrame: number): void => {
        playerRef.current?.seekTo(currentFrame, true);
    }
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
            <VideoEditor
                duration={duration}
                onTimeChange={onTimeChange}
            />

        </>
    );
}

export default App;