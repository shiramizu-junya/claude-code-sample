import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useVideoLike = (videoId: string) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLikeStatus = useCallback(async () => {
    try {
      // Get like count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId);

      if (countError) throw countError;
      setLikeCount(count || 0);

      // Check if current user has liked
      if (user) {
        const { data, error: likeError } = await supabase
          .from('likes')
          .select('id')
          .eq('video_id', videoId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (likeError) throw likeError;
        setIsLiked(!!data);
      } else {
        setIsLiked(false);
      }
    } catch (err) {
      console.error('Error fetching like status:', err);
    } finally {
      setLoading(false);
    }
  }, [videoId, user]);

  useEffect(() => {
    fetchLikeStatus();
  }, [fetchLikeStatus]);

  const toggleLike = async () => {
    if (!user) {
      return { error: 'ログインが必要です' };
    }

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase.from('likes').insert({
          video_id: videoId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      return { error: null };
    } catch (err) {
      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);

      if (err instanceof Error) {
        return { error: err.message };
      }
      return { error: 'いいねの処理に失敗しました' };
    }
  };

  return { isLiked, likeCount, loading, toggleLike };
};
