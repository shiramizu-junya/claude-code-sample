import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('プロフィールの取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: {
    username?: string;
    bio?: string | null;
    avatar_url?: string;
  }) => {
    if (!userId) {
      return { error: 'ユーザーIDが必要です' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    // Refresh profile after updating
    await fetchProfile();
    return { error: null };
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) {
      return { error: 'ユーザーIDが必要です', url: null };
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return { error: 'ファイルサイズは2MB以下にしてください', url: null };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        error: '許可されている形式は JPEG、PNG、WebP のみです',
        url: null,
      };
    }

    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/avatars/')[1];
      if (oldPath) {
        await supabase.storage.from('avatars').remove([oldPath]);
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) {
      return { error: uploadError.message, url: null };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Update profile with new avatar URL
    const updateResult = await updateProfile({ avatar_url: publicUrl });
    if (updateResult.error) {
      return { error: updateResult.error, url: null };
    }

    return { error: null, url: publicUrl };
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};
