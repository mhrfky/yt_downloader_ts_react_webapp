import { VideoClip } from "../component/VideoEditor/CookieVideoStorage";

export interface ClipsState {
    data: VideoClip[];
    isLoading: boolean;
    error: Error | null;
  }