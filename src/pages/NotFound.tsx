import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-gray-600">ページが見つかりませんでした</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        ホームに戻る
      </Link>
    </div>
  );
};
