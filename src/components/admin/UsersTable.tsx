import React from 'react';
import { User, Mail, Shield, Trash2, MoreHorizontal } from 'lucide-react';

interface UsersTableProps {
  users: any[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  return (
    <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Customer Info</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Account Role</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Join Date</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 font-bold text-xs uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{u.name || 'Anonymous User'}</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail size={12} />
                        <span>{u.email || 'No email provided'}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    <Shield size={10} />
                    {u.role || 'user'}
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-sm font-medium text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-6">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-bold text-slate-600">Active</span>
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                    <button className="p-3 text-slate-300 hover:text-primary hover:bg-slate-100 rounded-xl transition-all">
                      <MoreHorizontal size={18} />
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
};
