import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useVideo } from '../hooks/useVideo';
import { useAuth } from '../hooks/useAuth';
import {
  isValidYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
} from '../utils/youtube';

export const VideoEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { video, loading, error, updateVideo, deleteVideo } = useVideo(id);
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setYoutubeUrl(video.youtube_url);
    }
  }, [video]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    } else if (title.length > 200) {
      newErrors.title = 'タイトルは200文字以内で入力してください';
    }

    if (!youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URLを入力してください';
    } else if (!isValidYouTubeUrl(youtubeUrl)) {
      newErrors.youtubeUrl = '有効なYouTube URLを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateVideo({
        title: title.trim(),
        description: description.trim() || null,
        youtube_url: youtubeUrl.trim(),
      });
      navigate(`/videos/${id}`);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('動画の更新に失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVideo();
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('動画の削除に失敗しました');
      }
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const previewVideoId = extractYouTubeVideoId(youtubeUrl);

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

  if (user?.id !== video.profiles.id) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">アクセス権限がありません</h1>
        <p className="mt-4 text-gray-600">
          この動画を編集する権限がありません。
        </p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          トップページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">動画を編集</h1>

      {submitError && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.title
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="動画のタイトルを入力"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="youtubeUrl"
            className="block text-sm font-medium text-gray-700"
          >
            YouTube URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.youtubeUrl
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.youtubeUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl}</p>
          )}
          {previewVideoId && !errors.youtubeUrl && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-600">プレビュー:</p>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(previewVideoId)}
                  title="YouTube video preview"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="動画の説明を入力（任意）"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            削除
          </button>
          <div className="flex gap-3">
            <Link
              to={`/videos/${id}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '更新中...' : '更新'}
            </button>
          </div>
        </div>
      </form>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-bold text-gray-800">動画を削除</h2>
            <p className="mt-2 text-gray-600">
              「{video.title}」を削除してもよろしいですか？
              この操作は取り消せません。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
