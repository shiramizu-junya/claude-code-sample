import { Link, useParams } from 'react-router-dom';
import { useVideo } from '../hooks/useVideo';
import { useAuth } from '../hooks/useAuth';
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '../utils/youtube';

export const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { video, loading, error } = useVideo(id);
  const { user } = useAuth();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          動画が見つかりません
        </h1>
        <p className="mt-4 text-gray-600">
          お探しの動画は存在しないか、削除された可能性があります。
        </p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  const videoId = extractYouTubeVideoId(video.youtube_url);
  const isOwner = user?.id === video.profiles.id;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        {videoId ? (
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            動画を読み込めません
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{video.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to={`/videos/${video.id}/edit`}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                編集
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Link
            to={`/users/${video.profiles.id}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            {video.profiles.avatar_url ? (
              <img
                src={video.profiles.avatar_url}
                alt={video.profiles.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                {video.profiles.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-gray-800">
              {video.profiles.username}
            </span>
          </Link>
          <span className="text-gray-500">•</span>
          <span className="text-gray-500">{formatDate(video.created_at)}</span>
        </div>

        {video.description && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
