import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Shield,
  FileText,
  KeyRound,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddUserModal } from './AddUserModal';
import { CreateTempAdminModal } from './CreateTempAdminModal';
import { IOSSheet } from '../common/IOSSheet';

export const UserManagementView = () => {
  const {
    managedUsers,
    deleteManagedUser,
    setAddUserModalOpen,
    setTempAdminModalOpen,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);
  const [selectedUserForDocs, setSelectedUserForDocs] = useState(null);

  const filteredUsers = managedUsers.filter((u) => {
    return (
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDeleteUser = async (id) => {
    await deleteManagedUser(id);
    setActiveMenuUserId(null);
  };

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Section matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Manage administrator access, temporary admin credentials, and platform permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTempAdminModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-950/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Clock className="w-4 h-4" />
            <span>Create Temp Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141870] hover:bg-[#0c1055] text-white text-xs font-bold shadow-md shadow-blue-950/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Main Table Container matching reference image */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
        {/* Search & Filter Top Bar */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between gap-4">
          <div className="relative flex items-center max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-[#f8fafc] text-xs font-medium rounded-xl pl-11 pr-4 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Column Headers matching image */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-600">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isMenuOpen = activeMenuUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name with Initials Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0 ${
                            user.avatarBg || 'bg-[#141870]'
                          }`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                            {user.name}
                          </span>
                          {user.documents && user.documents.length > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {user.documents.length} verified doc{user.documents.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6 text-slate-700 font-semibold">
                      {user.role}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      {user.isTemporary || user.status?.startsWith('Temp') ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>{user.status || 'Temp Admin'}</span>
                        </span>
                      ) : user.status === 'Active' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                          {user.status || 'Invited'}
                        </span>
                      )}
                    </td>

                    {/* Actions ⋮ */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuUserId(isMenuOpen ? null : user.id)
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-6 top-12 z-30 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 text-left animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForDocs(user);
                              setActiveMenuUserId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#093a96]" />
                            <span>View Attached Docs ({user.documents?.length || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              addToast('OTP Passcode', `Temporary 6-char OTP: ${user.otpCode || '891024'}`, 'info');
                              setActiveMenuUserId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span>Inspect 6-char OTP</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Deactivate Account</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Attached Documents Modal */}
      {selectedUserForDocs && (
        <IOSSheet
          isOpen={Boolean(selectedUserForDocs)}
          onClose={() => setSelectedUserForDocs(null)}
          title={`Documents: ${selectedUserForDocs.name}`}
          subtitle={`Verified Identity Cards & Paper-based files for ${selectedUserForDocs.email}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 select-none">
            {/* User Meta Card */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#093a96] block">{selectedUserForDocs.role}</span>
                <span className="text-slate-600">OTP Passcode: <strong className="font-mono">{selectedUserForDocs.otpCode || '891024'}</strong></span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 font-bold border border-blue-200">
                {selectedUserForDocs.documents?.length || 0} Attached Files
              </span>
            </div>

            {/* Document Items */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedUserForDocs.documents && selectedUserForDocs.documents.length > 0 ? (
                selectedUserForDocs.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#093a96] flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500">{doc.type}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Verified ✓
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No documents attached to this account.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDocs(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </IOSSheet>
      )}

      {/* Add User Modal & Create Temp Admin Modal */}
      <AddUserModal />
      <CreateTempAdminModal />
    </div>
  );
};
