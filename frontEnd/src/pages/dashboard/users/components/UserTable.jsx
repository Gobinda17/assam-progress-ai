import { useState } from 'react';

const ROLES = ['Super Admin', 'Admin', 'Editor', 'Viewer'];

export default function UserTable({ users, onRoleChange, onStatusToggle }) {
  const [editingRole, setEditingRole] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-teal-100 text-teal-700';
      case 'Admin':
        return 'bg-orange-100 text-orange-700';
      case 'Editor':
        return 'bg-sky-100 text-sky-700';
      case 'Viewer':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleStatusClick = (userId) => {
    if (confirmToggle === userId) {
      onStatusToggle(userId);
      setConfirmToggle(null);
    } else {
      setConfirmToggle(userId);
      setTimeout(() => setConfirmToggle(null), 3000);
    }
  };

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-search-line text-3xl text-gray-400"></i>
        </div>
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                {editingRole === user.id ? (
                  <select
                    value={user.role}
                    onChange={(e) => {
                      onRoleChange(user.id, e.target.value);
                      setEditingRole(null);
                    }}
                    onBlur={() => setEditingRole(null)}
                    autoFocus
                    className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none cursor-pointer"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(user.joinedDate)}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(user.lastLogin)}
              </td>

              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setEditingRole(editingRole === user.id ? null : user.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                    title="Change Role"
                  >
                    <i className="ri-shield-user-line text-lg"></i>
                  </button>
                  <button
                    onClick={() => handleStatusClick(user.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer ${
                      confirmToggle === user.id
                        ? 'text-white bg-orange-500 hover:bg-orange-600'
                        : user.status === 'active'
                          ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={confirmToggle === user.id ? 'Click again to confirm' : user.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`${user.status === 'active' ? 'ri-user-unfollow-line' : 'ri-user-follow-line'} text-lg`}></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
