import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, Bounce } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('All fields are required', {
        transition: Bounce,
        position: 'top-right',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        transition: Bounce,
        position: 'top-right',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long', {
        transition: Bounce,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, password);
      setSubmitted(true);
      toast.success('Password reset successfully! Redirecting to login...', {
        transition: Bounce,
        position: 'top-right',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage, {
        transition: Bounce,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-3xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Password Reset</h1>
              <p className="text-gray-500 mt-2">Your password has been reset successfully</p>
            </div>

            <p className="text-center text-sm text-gray-600 mb-6">
              Redirecting to login page...
            </p>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Created with 💖 @ Xpec Innovation Pvt. Ltd.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-500 mt-2">Enter your email and new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="ri-refresh-line"></i>
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-teal-500 hover:text-teal-600 font-medium transition">
                Back to Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Created with 💖 @ Xpec Innovation Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
