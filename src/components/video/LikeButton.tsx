import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoLike } from '../../hooks/useVideoLike';
import { useAuth } from '../../hooks/useAuth';

interface LikeButtonProps {
  videoId: string;
}

export const LikeButton = ({ videoId }: LikeButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLiked, likeCount, loading, toggleLike } = useVideoLike(videoId);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setError(null);
    const result = await toggleLike();
    if (result.error) {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
        <span className="text-gray-400">-</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
          isLiked
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span className="font-medium">{likeCount}</span>
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
