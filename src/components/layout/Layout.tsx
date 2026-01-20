import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Layout = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Video Course Platform
            </Link>
            <nav className="flex items-center gap-4">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              ) : user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    プロフィール
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
