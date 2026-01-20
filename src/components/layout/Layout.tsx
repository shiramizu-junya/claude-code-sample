import { Link, Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Video Course Platform
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-800">
                ログイン
              </Link>
              <Link
                to="/signup"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                新規登録
              </Link>
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
