import React, { useEffect, useState } from 'react';

const EmployeeRequests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingState, setProcessingState] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://kt-backend-1.onrender.com/api/users/all');

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        const userList = Array.isArray(data) ? data : data?.users || data?.data || [];
        setUsers(userList);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserIdentifier = (user, fallbackIndex) => {
    return user?._id || user?.id || user?.userId || user?.email || `user-${fallbackIndex}`;
  };

  const handleAction = async (user, action) => {
    const userId = getUserIdentifier(user, 0);
    const endpoint = action === 'approve'
      ? 'https://kt-backend-1.onrender.com/api/users/approve'
      : 'https://kt-backend-1.onrender.com/api/users/reject';

    setProcessingState({ userId, action });
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          userId,
          _id: user?._id,
          email: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`${action === 'approve' ? 'Approval' : 'Rejection'} failed`);
      }

      setUsers((prevUsers) =>
        prevUsers.map((item, index) => {
          const itemId = getUserIdentifier(item, index);
          if (itemId !== userId) return item;

          return {
            ...item,
            isApproved: action === 'approve',
            approved: action === 'approve',
            status: action === 'approve' ? 'approved' : 'rejected',
          };
        })
      );
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setProcessingState(null);
    }
  };

  const renderDetailRow = (label, value, icon = '•') => (
    <div className="flex items-start gap-3 pb-3">
      <span className="text-blue-500 font-bold mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 font-medium mt-1">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-indigo-500'];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Employee Requests</h1>
          </div>
          <div className="rounded-none bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {users.filter(user => (user?.role || 'No Role').toLowerCase() !== 'admin').length} Users
          </div>
        </div>

        {loading && (
          <div className="rounded-none border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
            Loading users...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="rounded-none border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
            No users found.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users
            .filter((user) => {
              const role = user?.role || 'No Role';
              return role.toLowerCase() !== 'admin';
            })
            .map((user, index) => {
            const userId = getUserIdentifier(user, index);
            const name = user?.name || user?.fullName || 'No Name';
            const email = user?.email || 'No Email';
            const role = user?.role || 'No Role';
            const phone = user?.phone || user?.phoneNumber || 'No Phone';
            const isApproved = user?.isApproved === true || user?.approved === true || user?.status === 'approved';
            const isProcessingApprove = processingState?.userId === userId && processingState?.action === 'approve';
            const isProcessingReject = processingState?.userId === userId && processingState?.action === 'reject';

            return (
              <div 
                key={userId} 
                onClick={() => setSelectedUser(user)}
                className="rounded-none border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{email}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">Role</span>
                    <span className="rounded-none bg-gray-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-500">Phone</span>
                    <span>{phone}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(user, 'approve');
                    }}
                    disabled={isApproved || isProcessingApprove}
                    className={`flex-1 rounded-none px-4 py-2 text-sm font-medium text-white transition ${
                      isApproved || isProcessingApprove
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isApproved ? 'Approved' : isProcessingApprove ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(user, 'reject');
                    }}
                    disabled={isProcessingReject}
                    className="flex-1 rounded-none bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                  >
                    {isProcessingReject ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-none shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-none p-2 transition"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`${getAvatarColor(selectedUser?.name)} w-20 h-20 rounded-none flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg`}>
                  {getInitials(selectedUser?.name || selectedUser?.fullName)}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedUser?.name || selectedUser?.fullName}</h2>
                <p className="text-blue-100 text-sm mt-1">{selectedUser?.email}</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h3>
                <div className="space-y-3">
                  {renderDetailRow('Phone Number', selectedUser?.phoneNumber || selectedUser?.phone, '📞')}
                  {renderDetailRow('Date of Birth', selectedUser?.dob, '🎂')}
                  {renderDetailRow('Blood Group', selectedUser?.bloodGroup, '🩸')}
                </div>
              </div>

              {/* Professional Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Professional Details</h3>
                <div className="space-y-3">
                  {renderDetailRow('Department', selectedUser?.department, '🏢')}
                  {renderDetailRow('Role', selectedUser?.role, '👤')}
                  {renderDetailRow('Unique ID', selectedUser?.uniqueID, '🔑')}
                </div>
              </div>

              {/* Location Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Address</h3>
                <div className="bg-gray-50 rounded-none p-3 border border-gray-200">
                  <p className="text-sm text-gray-700">📍 {selectedUser?.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRequests;