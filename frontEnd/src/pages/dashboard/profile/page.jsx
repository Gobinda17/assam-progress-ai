import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileDetails from './components/ProfileDetails';
import ChangePassword from './components/ChangePassword';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function ProfilePage() {
  const navigate = useNavigate();

  const { user, updatePassword } = useAuth();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-teal-600 transition cursor-pointer">Dashboard</Link>
          <i className="ri-arrow-right-s-line text-gray-400"></i>
          <span className="text-gray-900 font-medium">Profile</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View your account details and update your password</p>
        </div>

        <div className="space-y-6">
          <ProfileDetails user={user} />
          <ChangePassword updatePassword={updatePassword} />
        </div>
      </div>
    </div>
  );
}
