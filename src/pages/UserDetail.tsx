import { Link, useParams } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useUserVideos } from '../hooks/useUserVideos';
import { VideoCard } from '../components/video/VideoCard';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { profile, loading: profileLoading, error: profileError } = useProfile(id);
  const { videos, loading: videosLoading, error: videosError } = useUserVideos(id);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          ユーザーが見つかりません
        </h1>
        <p className="mt-4 text-gray-600">
          お探しのユーザーは存在しないか、削除された可能性があります。
        </p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Profile Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-300 text-3xl text-gray-600">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              {profile.username}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              登録日: {formatDate(profile.created_at)}
            </p>
            {profile.bio && (
              <p className="mt-4 whitespace-pre-wrap text-gray-700">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800">
          投稿動画 ({videos.length})
        </h2>

        {videosLoading ? (
          <div className="mt-6 flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : videosError ? (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{videosError}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-6 rounded-lg bg-gray-50 py-12 text-center">
            <p className="text-gray-600">まだ動画を投稿していません</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
