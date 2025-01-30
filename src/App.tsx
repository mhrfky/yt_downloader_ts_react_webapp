import {useState, useRef, useEffect} from 'react'
import './App.css'
import {PlayerState, YT, YTPlayer} from "./types/youtube.ts";
import { YoutubePlayer } from  "./component/VideoPlayer/YoutubePlayer.tsx"
import  {VideoEditor} from "./component/VideoEditor/VideoEditor.tsx";
import {validateYouTubeVideo} from "./youtube_utils.ts";
import CookieVideoStorage, {VideoClip} from "./component/VideoEditor/CookieVideoStorage.ts";    
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
    const [newUrl, setNewUrl]                   = useState<string>('')
    const [selectedClipId, setSelectedClipId]   = useState<string | null>(null);
    const [videoClips, setvideoClips]           = useState<VideoClip[]>([]);
    
    const playerRef                             = useRef<YTPlayer>(null);  // Now using YTPlayer type directly
    const storageRef                            = useRef(new CookieVideoStorage());
    const inputRef                              = useRef<HTMLInputElement>(null);




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
    };

    const handleAddNewClip = (): void => {
        const newClip: VideoClip = {
            start: 0,
            end: duration,
            id: Date.now(), // Unique ID for the clip
        };
        setvideoClips([...videoClips, newClip]);
        
        storageRef.current.addClip(videoId, newClip);
    };

    const handleDeleteClip = (index: string) => {
        if (videoId) {
            storageRef.current.removeClip(videoId, index);
        }
        setvideoClips(storageRef.current.getClips(videoId));
    };

    const handleDownloadClip = (clipId: string) => {
        console.log('Download attempted on video ID:', clipId);
    };

    const handleClipClick = (clipId: string) => {
        console.log("video clips:", videoClips)

        const prevClip = videoClips.find(clip => clip.id === selectedClipId);
        if(selectedClipId != null || selectedClipId != undefined || prevClip != null || prevClip != undefined) { 
            console.log("prevClip:", selectedClipId, "clipId:", clipId, "start:", prevClip?.start, "end:", prevClip?.end);
            if(selectedClipId != clipId) storageRef.current.updateClip(videoId, selectedClipId, {start: prevClip?.start, end: prevClip?.end});   
        }
        setSelectedClipId(clipId);
      };


    const onTimeChange = (clipId: string, currentFrame: number, start: number, end: number): void => {
        if(clipId == null || clipId == undefined || clipId != selectedClipId) return;
        playerRef.current?.seekTo(currentFrame, true); //TODO change here with more protected functions, remove forwardRef
        setvideoClips(prevClips => 
            prevClips.map(clip => 
                clip.id === clipId 
                    ? { ...clip, start, end }
                    : clip
            )
        );
    };


    useEffect(() => {
        storageRef.current.initVideo(videoId, {name: videoId, duration: duration});
        setvideoClips(storageRef.current.getClips(videoId));
        console.log("activated at the mount");
    }, [videoId, duration]);


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
                onClick={handleAddNewClip}
                type="button"
                className="play-button"
            >
                Add Clip
            </button>

            <div style={{height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px'}}>
                {videoClips.map((clip) => (
            <div
                key={clip.id}
                className={`mb-4 p-3 rounded cursor-pointer transition-colors duration-200 ${
                selectedClipId === clip.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleClipClick(clip.id)}
                >                        
                            <VideoEditor
                            id={clip.id}
                            duration={duration}
                            isSelected={selectedClipId === clip.id}
                            onTimeChange={(currentFrame, start, end) => onTimeChange(clip.id, currentFrame, start, end)}
                            handleDelete={() => handleDeleteClip(clip.id)}
                            handleDownload={() => handleDownloadClip(clip.id)}
                            start={clip.start}
                            end={clip.end}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}

export default App;