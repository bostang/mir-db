import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // Jika tidak ada token, tendang ke halaman login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Jika ada token, izinkan masuk ke rute yang diminta
    return <Outlet />;
};

export default ProtectedRoute;