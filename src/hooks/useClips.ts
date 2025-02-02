import { useState, useEffect, useMemo, useCallback } from 'react';
import CookieVideoStorage from '../component/VideoEditor/CookieVideoStorage';
import { ClipsState } from '../types/clips';
import { VideoClip } from '../component/VideoEditor/CookieVideoStorage';
import { debounce } from 'lodash';

interface UseVideoClipsProps {
    videoId: string;
    duration: number;
}

export function useClips({ videoId, duration }: UseVideoClipsProps) {
    // State management from useClips
    const [state, setState] = useState<ClipsState>({
        data: [],
        isLoading: true,
        error: null
    });

    // Storage initialization from useCookieVideoStorage
    const storage = useMemo(() => new CookieVideoStorage(), []);

    // Debounced update from your existing hook
    const update = useMemo(
        () => debounce(
            (clipId: string, updates: Partial<VideoClip>) => {
                storage.updateClip(videoId, clipId, updates);
                // After update, refresh the clips list
                fetchClips();
            },
            1000
        ),
        [storage, videoId]
    );

    // Fetch clips implementation
    const fetchClips = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            storage.initVideo(videoId, { videoId: videoId, duration });
            const clips = storage.getClips(videoId);
            setState({ data: clips, isLoading: false, error: null });
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to fetch clips'),
                isLoading: false
            }));
        }
    }, [videoId, duration, storage]);


    // Add clip implementation
    const addClip = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const newClip: VideoClip = {
                start: 0,
                end: duration,
                id: String(Date.now()),
            };
            storage.addClip(videoId, newClip);
            await fetchClips();
            return newClip;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to add clip'),
                isLoading: false
            }));
            throw error;
        }
    }, [videoId, duration, storage, fetchClips]);

    // Delete clip implementation
    const deleteClip = useCallback(async (clipId: string) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            storage.removeClip(videoId, clipId);
            await fetchClips();
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to delete clip'),
                isLoading: false
            }));
            throw error;
        }
    }, [videoId, storage, fetchClips]);

    // Cleanup for debounced function
    useEffect(() => {
        return () => update.cancel();
    }, [update]);


    return {
        clips: state.data,
        isLoading: state.isLoading,
        error: state.error,
        fetchClips,
        addClip,
        deleteClip,
        updateClip: update,
    };
}