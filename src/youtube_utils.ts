// utils/youtube.ts

// Regex patterns for different YouTube URL formats
const YOUTUBE_URL_PATTERNS = {
    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    standard: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([^&]+))(?:\S+)?$/,
    // Shortened URL: https://youtu.be/VIDEO_ID
    short: /^(?:https?:\/\/)?youtu\.be\/([^?]+)(?:\S+)?$/,
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    embed: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)(?:\S+)?$/,
    // Video ID only: 11 characters of alphanumeric and -_
    videoId: /^[A-Za-z0-9_-]{11}$/
};

/**
 * Extracts video ID from various YouTube URL formats or validates a video ID
 * @param input YouTube URL or video ID
 * @returns video ID if valid, null if invalid format
 */
export const extractVideoId = (input: string): string | null => {
    // Trim whitespace
    input = input.trim();

    // Check if it's already a valid video ID
    if (YOUTUBE_URL_PATTERNS.videoId.test(input)) {
        return input;
    }

    // Try each URL pattern
    for (const pattern of Object.values(YOUTUBE_URL_PATTERNS)) {
        const match = input.match(pattern);
        if (match && match[1]) {
            // Verify extracted ID is valid format
            if (YOUTUBE_URL_PATTERNS.videoId.test(match[1])) {
                return match[1];
            }
        }
    }

    return null;
};

/**
 * Checks if a video exists and is available
 * @param videoId YouTube video ID
 * @returns Promise resolving to boolean indicating if video exists and is available
 */
export const checkVideoAvailability = async (videoId: string): Promise<boolean> => {
    try {
        // Use YouTube's oEmbed endpoint which is lightweight and doesn't require API key
        const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        return response.status === 200;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * Validates YouTube URL or video ID and checks if video exists
 * @param input YouTube URL or video ID
 * @returns Promise resolving to { valid: boolean, videoId: string | null, error?: string }
 */
export const validateYouTubeVideo = async (input: string): Promise<{
    valid: boolean;
    videoId: string | null;
    error?: string;
}> => {
    // First extract/validate the video ID format
    const videoId = extractVideoId(input);

    if (!videoId) {
        return {
            valid: false,
            videoId: null,
            error: 'Invalid YouTube URL or video ID format'
        };
    }

    // Then check if video actually exists
    const exists = await checkVideoAvailability(videoId);

    if (!exists) {
        return {
            valid: false,
            videoId,
            error: 'Video does not exist or is not available'
        };
    }

    return {
        valid: true,
        videoId
    };
};

// Usage example:
/*
const validateVideo = async (input: string) => {
  const result = await validateYouTubeVideo(input);
  if (result.valid) {
    console.log(`Valid video ID: ${result.videoId}`);
  } else {
    console.log(`Error: ${result.error}`);
  }
};
*/