import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Comment = Database['public']['Tables']['comments']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CommentWithProfile extends Comment {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  replies?: CommentWithProfile[];
}

export const useComments = (videoId: string) => {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
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
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentsMap = new Map<string, CommentWithProfile>();
      const rootComments: CommentWithProfile[] = [];

      // First pass: add all comments to the map
      (data as CommentWithProfile[]).forEach((comment) => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      commentsMap.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('コメントの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'ログインが必要です' };
    }

    const { error } = await supabase.from('comments').insert({
      video_id: videoId,
      user_id: user.id,
      content,
      parent_id: parentId || null,
    });

    if (error) {
      return { error: error.message };
    }

    // Refresh comments after adding
    await fetchComments();
    return { error: null };
  };

  const updateComment = async (commentId: string, content: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (error) {
      return { error: error.message };
    }

    // Refresh comments after updating
    await fetchComments();
    return { error: null };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return { error: error.message };
    }

    // Refresh comments after deleting
    await fetchComments();
    return { error: null };
  };

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
};
