import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Video = Database['public']['Tables']['videos']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface VideoWithProfile extends Video {
  profiles: Pick<Profile, 'username' | 'avatar_url'>;
}

export const useUserVideos = (userId?: string) => {
  const [videos, setVideos] = useState<VideoWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select(
          `
          *,
          profiles (
            username,
            avatar_url
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos(data as VideoWithProfile[]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('動画の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch: fetchVideos };
};
