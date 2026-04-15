import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { UsersTable } from '../../components/admin/UsersTable';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.fetchUsers();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="animate-spin text-pink-600 size-12 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="size-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-bold mb-2">Error Loading Users</p>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Users size={32} /> User Roster</h1>
        <p className="text-slate-600 font-medium mt-2">Manage and monitor {users.length} registered platform members</p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <Users className="size-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No users found</p>
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </motion.div>
  );
};
