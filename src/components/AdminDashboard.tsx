import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  licenseKey: string;
  licenseType: string;
  expirationDate: string;
  isBlocked: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users from your API
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Implement API call to get users
    // const response = await fetch('/api/users');
    // const data = await response.json();
    // setUsers(data);
  };

  const handleBlockUser = async (userId: string) => {
    // Implement API call to block/unblock user
    // await fetch(`/api/users/${userId}/block`, { method: 'POST' });
    // fetchUsers(); // Refresh the list
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">License Key</th>
              <th className="p-3">License Type</th>
              <th className="p-3">Expiration Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.licenseKey}</td>
                <td className="p-3">{user.licenseType}</td>
                <td className="p-3">{user.expirationDate}</td>
                <td className="p-3">
                  {user.isBlocked ? (
                    <span className="text-red-500">Blocked</span>
                  ) : (
                    <span className="text-green-500">Active</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleBlockUser(user.id)}
                    className={`px-3 py-1 rounded ${
                      user.isBlocked
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 