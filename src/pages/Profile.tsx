import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { AvatarUpload } from '../components/profile/AvatarUpload';

export const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, error, updateProfile, uploadAvatar } = useProfile(
    user?.id
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string)?.trim();
    const bio = (formData.get('bio') as string)?.trim() || null;

    if (!username) {
      setSubmitError('ユーザー名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    const result = await updateProfile({ username, bio });

    if (result.error) {
      setSubmitError(result.error);
    } else {
      setSuccessMessage('プロフィールを更新しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">エラー</h1>
        <p className="mt-4 text-gray-600">
          {error || 'プロフィールの読み込みに失敗しました'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">プロフィール編集</h1>

      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <div className="flex justify-center">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            username={profile.username}
            onUpload={uploadAvatar}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              ユーザー名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={profile.username}
              maxLength={50}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700"
            >
              自己紹介
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio || ''}
              rows={4}
              maxLength={500}
              placeholder="自己紹介を入力してください"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
