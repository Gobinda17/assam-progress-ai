import { mockCurrentUser } from '../../../../mocks/users';

export default function ProfileDetails() {
  const user = mockCurrentUser;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Profile Details</h2>
        <p className="text-sm text-gray-500 mt-1">Your account information</p>
      </div>

      <div className="p-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-user-line text-3xl text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
              <i className="ri-shield-star-line"></i>
              {user.role}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
              <i className="ri-user-line text-gray-400"></i>
              <span className="text-sm text-gray-900 font-medium">{user.name}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
              <i className="ri-mail-line text-gray-400"></i>
              <span className="text-sm text-gray-900 font-medium">{user.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
              <i className="ri-shield-user-line text-gray-400"></i>
              <span className="text-sm text-gray-900 font-medium">{user.role}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Since</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
              <i className="ri-calendar-line text-gray-400"></i>
              <span className="text-sm text-gray-900 font-medium">{formatDate(user.joinedDate)}</span>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg">
              <i className="ri-time-line text-gray-400"></i>
              <span className="text-sm text-gray-900 font-medium">{formatDate(user.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
