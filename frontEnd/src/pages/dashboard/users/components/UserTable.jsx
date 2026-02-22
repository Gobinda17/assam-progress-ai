import { useState } from 'react';
import { Bounce, ToastContainer, toast } from 'react-toastify';

const ROLES = ['SUPERADMIN', 'USER'];
const STATUSES = ['active', 'inactive'];

export default function UserTable({ users, onRoleChange, onStatusToggle, onDelete, fetchUsers }) {
  const [editingRole, setEditingRole] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-teal-100 text-teal-700';
      case 'USER':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleDeleteClick = (userId) => {
    if (deleteConfirm === userId) {
      onDelete(userId);
      setDeleteConfirm(null);
      fetchUsers(); // Refresh the user list after deletion
    } else {
      setDeleteConfirm(userId);
      toast.warning('Click delete again within 3 seconds to confirm');
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (users.length === 0) {
    return (
      <div>
        <ToastContainer position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce} />

        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-search-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-gray-500">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce} />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition">
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
                  {editingRole === user._id ? (
                    <select
                      value={user.role}
                      onChange={(e) => {
                        onRoleChange(user._id, e.target.value);
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
                  {editingStatus === user._id ? (
                    <select
                      value={user.status}
                      onChange={(e) => {
                        onStatusToggle(user._id, e.target.value);
                        setEditingStatus(null);
                      }}
                      onBlur={() => setEditingStatus(null)}
                      autoFocus
                      className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none cursor-pointer"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingRole(editingRole === user._id ? null : user._id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      title="Change Role"
                    >
                      <i className="ri-shield-user-line text-lg"></i>
                    </button>

                    <button
                      onClick={() => setEditingStatus(editingStatus === user._id ? null : user._id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Change Status"
                    >
                      <i className="ri-toggle-line text-lg"></i>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(user._id)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer ${deleteConfirm === user._id
                        ? 'text-white bg-red-600 hover:bg-red-700'
                        : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      title={deleteConfirm === user._id ? 'Click again to confirm deletion' : 'Delete User'}
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
