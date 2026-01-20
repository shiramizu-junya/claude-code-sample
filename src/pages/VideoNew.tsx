import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  extractYouTubeVideoId,
  isValidYouTubeUrl,
  getYouTubeEmbedUrl,
} from '../utils/youtube';

interface FormData {
  youtubeUrl: string;
  title: string;
  description: string;
}

interface FormErrors {
  youtubeUrl?: string;
  title?: string;
}

export const VideoNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    youtubeUrl: '',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const videoId = extractYouTubeVideoId(formData.youtubeUrl);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.youtubeUrl) {
      newErrors.youtubeUrl = 'YouTube URLを入力してください';
    } else if (!isValidYouTubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = '有効なYouTube URLを入力してください';
    }

    if (!formData.title) {
      newErrors.title = 'タイトルを入力してください';
    } else if (formData.title.length > 200) {
      newErrors.title = 'タイトルは200文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setApiError('ログインが必要です');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          youtube_url: formData.youtubeUrl,
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      navigate(`/videos/${data.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('動画の投稿中にエラーが発生しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-gray-800">動画投稿</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

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
            name="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={handleChange}
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
        </div>

        {videoId && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              プレビュー
            </label>
            <div className="mt-1 aspect-video w-full overflow-hidden rounded-md bg-black">
              <iframe
                src={getYouTubeEmbedUrl(videoId)}
                title="YouTube video preview"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

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
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
              errors.title
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="動画のタイトルを入力"
          />
          <div className="mt-1 flex justify-between">
            {errors.title ? (
              <p className="text-sm text-red-600">{errors.title}</p>
            ) : (
              <span />
            )}
            <span className="text-sm text-gray-500">
              {formData.title.length}/200
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            説明文
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="動画の説明を入力（任意）"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
};
