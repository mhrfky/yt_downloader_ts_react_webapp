import VideoTimePicker from "../VideoTimePicker/VideoTimePicker.tsx";
import * as Slider from "@radix-ui/react-slider";
import {useEffect, useState} from "react";
import './styles.css';
interface VideoEditorProps {
    id: string;
    duration :  number;
    onTimeChange: (current_frame: number, start: number, end: number) => void;
    handleDelete: () => void;
    handleDownload: () => void;
    start : number;
    end: number;
    isSelected: boolean;
}

const VideoEditor: React.FC<VideoEditorProps> = ({duration, onTimeChange,handleDelete,handleDownload,  start, end, isSelected}) => {
    const [values, setValues] = useState([start, end]); // Start and end values
    useEffect(() => {
        values[0] = start;
        values[1] = end;
    }, []);
    const onSliderValueChange = ([left, right]: number[]): void => {

        if (values[0] === left) {
            onTimeChange(right, left, right);
        } else {
            onTimeChange(left, left, right);
        }
        setValues([left, right]);
    };



    return (
        <div>
            <div>
            </div>
            <div className="video-controls">
                <Slider.Root
                    className="slider-root"
                    value={values}
                    onValueChange={onSliderValueChange}
                    min={0}
                    max={duration}
                    step={0.001}
                    aria-label="Video Slider"
                    disabled={!isSelected} // Disable slider interaction

                >
                    <Slider.Track className="slider-track">
                        <Slider.Range className="slider-range"
                                        color='black'/>
                    </Slider.Track>
                    {isSelected && <Slider.Thumb className="slider-thumb"/>}
                    {isSelected && <Slider.Thumb className="slider-thumb"/>}
                </Slider.Root>
            </div>
            <div>
                <VideoTimePicker
                    value={values[0]}
                    onChange={(e: number) => onSliderValueChange([e, values[1]])}
                    maxDuration={duration}
                ></VideoTimePicker>

                <VideoTimePicker
                    value={values[1]}
                    onChange={(e: number) => onSliderValueChange([values[0], e])}
                    maxDuration={duration}
                ></VideoTimePicker>
            </div>
            <div>
                {isSelected &&
                <button
                    onClick={handleDownload}
                   type="button"
                   className="play-button"
                >Download</button>
                }
                {isSelected &&
                <button
                    onClick={handleDelete}
                    type="button"
                    className="play-button"
                >Delete</button>
                }
            </div>
        </div>
    );


}

export {VideoEditor};