import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user, isAuthenticated } = useAuth();

  // if (isAuthenticated) {
  //   if (user && user.role === 'SUPERADMIN') {
  //     navigate('/dashboard', { replace: true });
  //   } else {
  //     navigate('/chat', { replace: true });
  //   }
  //   return null;
  // }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await login(email, password);
      if (resp?.data?.user) {
        if (resp.data.user.role === 'SUPERADMIN') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/chat', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err.message || err);
      const msg = err?.response?.data?.errors || err?.errors || String(err);
      setError(msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo" className="h-20 w-20 mx-auto mb-4 object-contain" />
            <h1 className="text-3xl font-bold text-gray-900">User Login</h1>
            <p className="text-gray-500 mt-2">Access your ASSAM PROGRESS AI</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400 text-lg"></i>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="flex flex-col items-center justify-center gap-1 mt-6">
            <div className="text-center">
              <a href="/reset-password" className="text-sm text-teal-500 hover:text-teal-600 transition">
                Forgot your password?
              </a>
            </div>
            <div className="text-center">
              <a href="/register" className="text-sm text-teal-500 hover:text-teal-600 transition">
                Can't Sign-In? Register
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Created with 💖 @ Xpec Innovation Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
