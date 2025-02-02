import {useState, useRef} from 'react'
import './App.css'
import {PlayerState, YT, YTPlayer} from "./types/youtube.ts";
import { YoutubePlayer } from  "./component/VideoPlayer/YoutubePlayer.tsx"
import {validateYouTubeVideo} from "./youtube_utils.ts";
import {useClips} from "./hooks/useClips.ts";
import { ClipsContainer } from './component/VideoEditor/ClipsContainer.tsx';
declare global {
    interface Window {
        YT: YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

function App(): JSX.Element {
    const [isActive, setIsActive]               = useState<boolean>(false);
    const [duration, setDuration]               = useState<number>(100);
    const [videoId, setVideoId]                 = useState<string>("dQw4w9WgXcQ")
    const [newUrl, setNewUrl]                   = useState<string>('') //redundant to have url with videoId
    const [selectedClipId, setSelectedClipId]   = useState<string | null>(null);

    const playerRef                             = useRef<YTPlayer>(null);  // Now using YTPlayer type directly
    const inputRef                              = useRef<HTMLInputElement>(null);


    const {
        clips,
        isLoading,
        error,
        fetchClips,
        addClip,
        deleteClip,
        updateClip
    } = useClips({
        videoId,
        duration
        });

    const handlePlayerReady = (newDuration: number): void => {
        console.log('Player is ready with duration:', newDuration);
        setDuration(newDuration);
        fetchClips();
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
    };

    const handleDownloadClip = (clipId: string) => {
        console.log('Download attempted on video ID:', clipId);
    };



    const handleTimeChange = (clipId: string, currentFrame: number, start: number, end: number): void => {
        if(clipId == null || clipId == undefined || clipId != selectedClipId) return;
        playerRef.current?.seekTo(currentFrame, true); //TODO change here with more protected functions, remove forwardRef 
        updateClip(clipId, {start, end});
        console.log("frame has been changed to", start, end);
    };


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
            <button
                onClick={addClip}
                type="button"
                className="play-button"
            >
                Add Clip
            </button>

            <div>
                <ClipsContainer
                    clips={clips}
                    isLoading={isLoading}
                    error={error}
                    selectedClipId={selectedClipId}
                    onClipSelect={setSelectedClipId}
                    onTimeChange={handleTimeChange}
                    onDelete={deleteClip}
                    onDownload={handleDownloadClip}
                    duration={duration}
                />  
            </div>
        </>
    );
}

export default App;