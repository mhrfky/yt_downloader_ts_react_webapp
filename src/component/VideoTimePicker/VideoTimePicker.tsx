import { useState, useRef, useEffect } from 'react';
import type { KeyboardEventHandler } from 'react';

// IMPROVEMENT: Added maxDuration to props to enforce video length constraints
interface TimePickerProps {
    value: number;
    onChange: (value: number) => void;
    maxDuration?: number;  // Maximum duration in seconds
}

// IMPROVEMENT: Enhanced Position interface to include validation function
interface Position {
    max: string;
    next: number;
    char?: string;
    validate?: (value: string, timeString: string) => string;
}

const VideoTimePicker: React.FC<TimePickerProps> = ({
                                                        value,
                                                        onChange,
                                                        maxDuration = 86400  // Default to 24 hours if not specified
                                                    }) => {
    const [selectionStart, setSelectionStart] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // IMPROVEMENT: Consolidated all position-based validation into the template
    const template = {
        positions: [
            {
                max: '2',
                next: 1,
                validate: (value: string) => parseInt(value) > 2 ? '2' : value
            },
            {
                max: '9',
                next: 2,
                validate: (value: string, timeString: string) =>
                    timeString[0] === '2' && parseInt(value) > 3 ? '3' : value
            },
            { char: ':', next: 3 },
            { max: '5', next: 4 },
            { max: '9', next: 5 },
            { char: ':', next: 6 },
            { max: '5', next: 7 },
            { max: '9', next: 8 },
            { char: '.', next: 9 },
            { max: '9', next: 10 },
            { max: '9', next: 11 },
            { max: '9', next: 12 }
        ] as Position[]
    };

    const formatTimeString = (timeInSeconds: number): string => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.round((timeInSeconds % 1) * 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    const parseTimeString = (timeStr: string): number => {
        const [time, ms] = timeStr.split('.');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) / 1000);
    };

    const timeString = formatTimeString(value);

    const getPositionMultiplier = (pos: number): number => {
        const multipliers = {
            0: 36000, // Tens of hours
            1: 3600,  // Hours
            3: 600,   // Tens of minutes
            4: 60,    // Minutes
            6: 10,    // Tens of seconds
            7: 1,     // Seconds
            9: 0.1,   // Tenths
            10: 0.01, // Hundredths
            11: 0.001 // Thousandths
        };
        return multipliers[pos as keyof typeof multipliers] || 0;
    };

    // IMPROVEMENT: Added validation function to enforce maxDuration
    const validateTimeValue = (newValue: number): number => {
        if (newValue < 0) return 0;
        if (newValue > maxDuration) return maxDuration;
        return newValue;
    };

    // IMPROVEMENT: Added function to handle position movement
    const moveToNextPosition = (currentPos: number): number => {
        let nextPos = currentPos;
        while (nextPos < timeString.length && template.positions[nextPos]?.char) {
            nextPos++;
        }
        return nextPos < timeString.length ? nextPos : currentPos;
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            let newPos = selectionStart - 1;
            while (newPos >= 0 && template.positions[newPos]?.char) {
                newPos--;
            }
            if (newPos >= 0) {
                setSelectionStart(newPos);
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSelectionStart(moveToNextPosition(selectionStart + 1));
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const multiplier = getPositionMultiplier(selectionStart);
            const direction = e.key === 'ArrowUp' ? 1 : -1;

            // IMPROVEMENT: Added validation for maxDuration
            const currentValue = parseTimeString(timeString);
            const newValue = validateTimeValue(currentValue + (direction * multiplier));

            if (newValue !== value) {
                onChange(newValue);
            }
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            const newTimeStr = timeString.split('');
            newTimeStr[selectionStart] = '0';

            // IMPROVEMENT: Added validation for the new value
            const newValue = validateTimeValue(parseTimeString(newTimeStr.join('')));
            onChange(newValue);

            let newPos = selectionStart - 1;
            while (newPos >= 0 && template.positions[newPos]?.char) {
                newPos--;
            }
            if (newPos >= 0) {
                setSelectionStart(newPos);
            }
        }
    };

    // IMPROVEMENT: Refactored to use template validation
    const handleNumberInput = (num: string) => {
        const currentPos = template.positions[selectionStart];
        if (!currentPos || currentPos.char) return;

        // Apply position-specific validation
        let validatedNum = num;
        if (currentPos.validate) {
            validatedNum = currentPos.validate(num, timeString);
        } else if (currentPos.max && parseInt(num) > parseInt(currentPos.max)) {
            validatedNum = currentPos.max;
        }

        // Update time string with validation
        const newTimeStr = timeString.split('');
        newTimeStr[selectionStart] = validatedNum;
        const newValue = validateTimeValue(parseTimeString(newTimeStr.join('')));

        if (newValue !== value) {
            onChange(newValue);
        }

        setSelectionStart(moveToNextPosition(selectionStart + 1));
    };

    useEffect(() => {
        const input = inputRef.current;
        if (input) {
            input.setSelectionRange(selectionStart, selectionStart + 1);
        }
    }, [selectionStart, timeString]);

    return (
        <input
            ref={inputRef}
            type="text"
            value={timeString}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
                const char = e.target.value.charAt(selectionStart);
                if (/^\d$/.test(char)) {
                    handleNumberInput(char);
                }
            }}
            onClick={() => {
                const input = inputRef.current;
                if (input && input.selectionStart !== null) {
                    setSelectionStart(moveToNextPosition(input.selectionStart));
                }
            }}
        />
    );
};

export default VideoTimePicker;