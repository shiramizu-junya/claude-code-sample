import { useParams } from 'react-router-dom';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">ユーザー詳細</h1>
      <p className="mt-4 text-gray-600">ユーザーID: {id}</p>
    </div>
  );
};
