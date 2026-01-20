import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Video = Database['public']['Tables']['videos']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface VideoWithProfile extends Video {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
}

export const useVideo = (id: string | undefined) => {
  const [video, setVideo] = useState<VideoWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select(
            `
            *,
            profiles (
              id,
              username,
              avatar_url
            )
          `
          )
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setVideo(data as VideoWithProfile);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('動画の取得に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const deleteVideo = async () => {
    if (!id) return;

    const { error } = await supabase.from('videos').delete().eq('id', id);

    if (error) {
      throw error;
    }
  };

  const updateVideo = async (data: {
    title: string;
    description: string | null;
    youtube_url: string;
  }) => {
    if (!id) return;

    const { error } = await supabase.from('videos').update(data).eq('id', id);

    if (error) {
      throw error;
    }
  };

  return { video, loading, error, deleteVideo, updateVideo };
};
