import VideoTimePicker from "../VideoTimePicker/VideoTimePicker.tsx";
import * as Slider from "@radix-ui/react-slider";
import {useEffect, useState} from "react";

interface VideoEditorProps {
    // id: string;
    duration :  number;
    onTimeChange: (current_frame: number) => void;

}

const VideoEditor: React.FC<VideoEditorProps> = ({duration, onTimeChange}) => {
    const [values, setValues] = useState([0, duration]); // Start and end values
    const onSliderValueChange = ([left, right]: number[]): void => {

        if (values[0] === left) {
            onTimeChange(right);
        } else {
            onTimeChange(left);
        }
        setValues([left, right]);
        console.log('Left:', left, 'Right:', right);
    };
    useEffect(() => {
        setValues([values[0],duration])
    }, [duration]);



    return (
        <div>
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
                    onChange={(e: number) => onSliderValueChange([e, values[1]])}
                    maxDuration={duration}
                ></VideoTimePicker>

                <VideoTimePicker
                    value={values[1]}
                    onChange={(e: number) => onSliderValueChange([values[0], e])}
                    maxDuration={duration}
                ></VideoTimePicker>
            </div>
        </div>
    );


}

export {VideoEditor};