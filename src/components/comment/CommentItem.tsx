import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CommentForm } from './CommentForm';
import type { CommentWithProfile } from '../../hooks/useComments';

interface CommentItemProps {
  comment: CommentWithProfile;
  onReply: (content: string, parentId: string) => Promise<{ error: string | null }>;
  onUpdate: (commentId: string, content: string) => Promise<{ error: string | null }>;
  onDelete: (commentId: string) => Promise<{ error: string | null }>;
  depth?: number;
}

export const CommentItem = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
}: CommentItemProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = user?.id === comment.profiles.id;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editContent.trim()) {
      setEditError('コメントを入力してください');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    const result = await onUpdate(comment.id, editContent.trim());

    if (result.error) {
      setEditError(result.error);
    } else {
      setIsEditing(false);
    }

    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(comment.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const handleReply = async (content: string) => {
    const result = await onReply(content, comment.id);
    if (!result.error) {
      setIsReplying(false);
    }
    return result;
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <Link to={`/users/${comment.profiles.id}`}>
            {comment.profiles.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm text-gray-600">
                {comment.profiles.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/users/${comment.profiles.id}`}
                className="font-medium text-gray-800 hover:underline"
              >
                {comment.profiles.username}
              </Link>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(編集済み)</span>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {editError && (
                  <p className="mt-1 text-sm text-red-600">{editError}</p>
                )}
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                      setEditError(null);
                    }}
                    className="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUpdating ? '更新中...' : '更新'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-gray-700">
                {comment.content}
              </p>
            )}

            {!isEditing && (
              <div className="mt-2 flex items-center gap-4">
                {user && depth < 2 && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    返信
                  </button>
                )}
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            )}

            {isReplying && (
              <div className="mt-3">
                <CommentForm
                  onSubmit={handleReply}
                  placeholder={`@${comment.profiles.username} への返信...`}
                  buttonText="返信"
                  onCancel={() => setIsReplying(false)}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-bold text-gray-800">コメントを削除</h2>
            <p className="mt-2 text-gray-600">
              このコメントを削除してもよろしいですか？
              {comment.replies && comment.replies.length > 0 && (
                <span className="block mt-1 text-sm text-red-600">
                  このコメントの返信も一緒に削除されます。
                </span>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
