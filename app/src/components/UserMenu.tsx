import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#374151] font-medium">
        {user.firstname} {user.lastname}
      </span>
      <button
        onClick={logout}
        className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#EF4444] transition cursor-pointer"
        title="Logout"
      >
        <LogOut size={14} />
        <span>Logout</span>
      </button>
    </div>
  );
}
