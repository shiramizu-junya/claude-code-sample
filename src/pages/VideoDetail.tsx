import { useParams } from 'react-router-dom';

export const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">動画詳細</h1>
      <p className="mt-4 text-gray-600">動画ID: {id}</p>
    </div>
  );
};
