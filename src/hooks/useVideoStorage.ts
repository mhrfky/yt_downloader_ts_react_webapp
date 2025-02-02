import {useEffect, useMemo} from "react";
import CookieVideoStorage from "../component/VideoEditor/CookieVideoStorage.ts";
import { debounce } from 'lodash';
import VideoClip from "../component/VideoEditor/CookieVideoStorage.ts"

export function useCookieVideoStorage(videoId: string) {
    const storage = useMemo(() => new CookieVideoStorage(), []);

    const debouncedUpdateClip = useMemo(
        () => debounce(
            (clipId: string, updates: Partial<VideoClip>) => {
                storage.updateClip(videoId, clipId, updates);
            },
            1000
        ),
        [storage, videoId]
    );

    useEffect(() => {
        return () => debouncedUpdateClip.cancel();
    }, [debouncedUpdateClip]);

    return {
        ...storage,
        updateClip: debouncedUpdateClip
    };
}