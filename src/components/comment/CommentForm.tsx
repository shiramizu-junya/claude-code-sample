import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<{ error: string | null }>;
  placeholder?: string;
  buttonText?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export const CommentForm = ({
  onSubmit,
  placeholder = 'コメントを入力...',
  buttonText = 'コメント',
  onCancel,
  autoFocus = false,
}: CommentFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-center">
        <p className="text-gray-600">
          コメントするには
          <Link to="/login" className="mx-1 text-blue-600 hover:underline">
            ログイン
          </Link>
          してください
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('コメントを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(content.trim());

    if (result.error) {
      setError(result.error);
    } else {
      setContent('');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '送信中...' : buttonText}
        </button>
      </div>
    </form>
  );
};
