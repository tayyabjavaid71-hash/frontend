import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { UsersTable } from '../../components/admin/UsersTable';
import { Loader2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">User Roster</h1>
        <p className="text-slate-500 font-medium">Manage and monitor registered platform members</p>
      </div>

      <UsersTable users={users} />
    </div>
  );
};
