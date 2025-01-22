
import {useState, useRef} from 'react'
import './App.css'
import {PlayerState, YT, YTPlayer} from "./types/youtube.ts";
import { YoutubePlayer } from  "./component/VideoPlayer/YoutubePlayer.tsx"
import  {VideoEditor} from "./component/VideoEditor/VideoEditor.tsx";
import {validateYouTubeVideo} from "./youtube_utils.ts";
import {VideoEditorStorage, VideoEditState} from "./component/VideoEditor/VideoEditorStorage.ts";
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
    const inputRef = useRef<HTMLInputElement>(null);
    const [newUrl, setNewUrl] = useState<string>('')

    const [storage] = useState(() => new VideoEditorStorage());
    const [videoStates, setVideoStates] = useState<VideoEditState[]>([]);


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
    const handleNewUrl  = async (): Promise<void> => {
        if (!newUrl) return;
        const result = await validateYouTubeVideo(newUrl);
        if (result.valid && result.videoId) {
            console.log(`Valid video ID: ${result.videoId}`);
            setVideoId(result.videoId);
            setNewUrl(result.videoId);

        } else {
            console.log(`Error: ${result.error}`);
        }
    }
    const onTimeChange = (currentFrame: number): void => {
        playerRef.current?.seekTo(currentFrame, true);
    }
    return (
        <>

            <div>
                <input
                    ref={inputRef}
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                />
                <button
                    onClick={handleNewUrl}
                    type="button"
                    className="play-button"
                >
                    Change

                </button>
            </div>
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