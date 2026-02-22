import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Check your email for password reset instructions');
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset link');
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
              <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
              <p className="text-gray-500 mt-2">
                We've sent a password reset link to <br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <i className="ri-information-line mr-2"></i>
                The reset link will expire in 15 minutes. Please check your email and spam folder.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-teal-500 hover:text-teal-600 font-medium transition"
              >
                Back to Login
              </Link>
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-lock-password-line text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-gray-400 text-lg"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-teal-500 hover:text-teal-600 transition"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Created with 💖 @ Xpec Innovation Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
