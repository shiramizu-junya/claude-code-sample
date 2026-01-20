import { Link } from 'react-router-dom';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '../../utils/youtube';
import type { VideoWithProfile } from '../../hooks/useVideos';

interface VideoCardProps {
  video: VideoWithProfile;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  const videoId = extractYouTubeVideoId(video.youtube_url);
  const thumbnailUrl = videoId
    ? getYouTubeThumbnailUrl(videoId, 'medium')
    : '/placeholder.jpg';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/videos/${video.id}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden bg-gray-200">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold text-gray-800 group-hover:text-blue-600">
            {video.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            {video.profiles.avatar_url ? (
              <img
                src={video.profiles.avatar_url}
                alt={video.profiles.username}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs text-gray-600">
                {video.profiles.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600">
              {video.profiles.username}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formatDate(video.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
};
