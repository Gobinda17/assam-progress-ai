import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import logo from "../../../assets/logo.png";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
            <span className="font-semibold text-[15px] text-gray-900">Assam Progress AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-chat-3-line text-base"></i>
              </div>
              Chat
            </Link>
            {user?.role === "SUPERADMIN" ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-dashboard-line text-base"></i>
                </div>
                Dashboard
              </Link>
            ) : ''}
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-white text-sm"></i>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.name || "Admin User"}
                </span>
                <i
                  className={`ri-arrow-down-s-line text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                ></i>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email || "admin@pdfrag.com"}
                    </p>
                  </div>

                  {/* Profile Section */}
                  <div className="py-1">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Account
                    </p>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-user-settings-line text-base text-gray-500"></i>
                      </div>
                      <div>
                        <span className="font-medium">Profile</span>
                        <p className="text-[11px] text-gray-400">
                          View details & update password
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* User Management Section */}
                  {user.role === 'SUPERADMIN' ? (
                    <div className="py-1 border-t border-gray-100">
                      <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Administration
                      </p>
                      <Link
                        to="/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-team-line text-base text-gray-500"></i>
                        </div>
                        <div>
                          <span className="font-medium">User Management</span>
                          <p className="text-[11px] text-gray-400">
                            Manage users, roles & access
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : ''}

                  {/* Logout */}
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-logout-box-line text-base"></i>
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
