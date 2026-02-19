import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
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
          <Link to="/dashboard" className="flex items-center cursor-pointer">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <i className="ri-file-text-line text-xl text-white"></i>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              PDF RAG Admin
            </span>
          </Link>

          <div className="flex items-center gap-3">
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
                  Admin User
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
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      admin@pdfrag.com
                    </p>
                  </div>

                  {/* Profile Section */}
                  <div className="py-1">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Account
                    </p>
                    <Link
                      to="/dashboard/profile"
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
                  <div className="py-1 border-t border-gray-100">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Administration
                    </p>
                    <Link
                      to="/dashboard/users"
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
