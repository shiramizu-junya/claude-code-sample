import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home';
import { VideoDetail } from './pages/VideoDetail';
import { VideoNew } from './pages/VideoNew';
import { VideoEdit } from './pages/VideoEdit';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { UserDetail } from './pages/UserDetail';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/videos/:id" element={<VideoDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/videos/new" element={<VideoNew />} />
          <Route path="/videos/:id/edit" element={<VideoEdit />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
