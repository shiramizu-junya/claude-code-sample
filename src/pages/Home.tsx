import { Link } from 'react-router-dom';
import { useVideos } from '../hooks/useVideos';
import { VideoCard } from '../components/video/VideoCard';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { videos, loading, error } = useVideos();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">動画一覧</h1>
        {user && (
          <Link
            to="/videos/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            動画を投稿
          </Link>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-gray-600">まだ動画が投稿されていません</p>
          {user && (
            <Link
              to="/videos/new"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              最初の動画を投稿する
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
