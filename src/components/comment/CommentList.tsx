import { useComments } from '../../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  videoId: string;
}

export const CommentList = ({ videoId }: CommentListProps) => {
  const { comments, loading, error, addComment, updateComment, deleteComment } =
    useComments(videoId);

  const handleAddComment = async (content: string) => {
    return await addComment(content);
  };

  const handleReply = async (content: string, parentId: string) => {
    return await addComment(content, parentId);
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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

  const commentCount =
    comments.length +
    comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-gray-800">
        コメント ({commentCount})
      </h2>

      <div className="mb-6">
        <CommentForm onSubmit={handleAddComment} />
      </div>

      {comments.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <p className="text-gray-600">まだコメントがありません</p>
          <p className="mt-1 text-sm text-gray-500">
            最初のコメントを投稿しましょう
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
