import React, { useState } from 'react';
import {
  UserPlus,
  KeyRound,
  FileText,
  UploadCloud,
  Trash2,
  Plus,
  Shield,
  CheckCircle2,
  X,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';

export const AddUserModal = () => {
  const { addUserModalOpen, setAddUserModalOpen, addManagedUser } = useApp();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('System Admin');
  const [otpCode, setOtpCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  // Uploaded Documents List (Unlimited ID Cards & Paper-based documents)
  const [attachedDocs, setAttachedDocs] = useState([
    { id: 'doc_init_1', name: 'PhilSys National ID.pdf', type: 'ID Card', size: '1.4 MB' }
  ]);

  const documentTypeOptions = [
    'ID Card (National ID / OSCA / Driver)',
    'Paper Document (Birth Certificate / Clearance)',
    'Appointment Letter / Authorization',
    'Barangay Certificate of Residency',
    'Official Service Record',
    'Other Supporting Document',
  ];

  const handleGenerateOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(randomOtp);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file, idx) => ({
        id: `doc_${Date.now()}_${idx}`,
        name: file.name,
        type: file.name.toLowerCase().includes('id') ? 'ID Card (National ID / OSCA / Driver)' : 'Paper Document (Birth Certificate / Clearance)',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      }));
      setAttachedDocs((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveDoc = (id) => {
    setAttachedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDocTypeChange = (id, newType) => {
    setAttachedDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, type: newType } : d))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    addManagedUser({
      firstName,
      middleName,
      lastName,
      email,
      role,
      otpCode,
      documents: attachedDocs,
    });

    // Reset Form
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setEmail('');
    setAttachedDocs([]);
  };

  return (
    <IOSSheet
      isOpen={addUserModalOpen}
      onClose={() => setAddUserModalOpen(false)}
      title="Add New User Account"
      subtitle="Register user credentials, 6-char OTP passcode & upload verification documents"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 select-none">
        {/* 1. Name Fields */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            1. Personal Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Maria"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="e.g. Santos"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Aquino"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria.aquino@gov.ph"
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#f8fafc] text-slate-800 text-xs sm:text-sm font-medium rounded-xl px-3 py-2.5 outline-none border border-slate-200 focus:border-[#093a96] focus:bg-white"
              >
                <option>System Admin</option>
                <option>Content Moderator</option>
                <option>Analyst</option>
                <option>Agency Verifier</option>
                <option>Citizen User</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. 6-Character OTP Passcode Section */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#093a96]">
              <KeyRound className="w-4 h-4" />
              <span>2. 6-Character Temporary OTP Password</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateOtp}
              className="text-[11px] font-bold text-[#093a96] hover:underline cursor-pointer"
            >
              Generate New OTP
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
              placeholder="e.g. 891024"
              className="w-44 font-mono font-black text-center text-lg tracking-widest bg-white rounded-xl px-4 py-2 border border-blue-300 focus:border-[#093a96] outline-none text-[#093a96] shadow-xs"
            />
            <p className="text-[11px] text-slate-600 leading-snug">
              User will be required to provide this 6-char OTP code upon first login to verify identity.
            </p>
          </div>
        </div>

        {/* 3. Unlimited ID Card & Paper Document Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-[#093a96]" />
              <span>3. Attached ID Cards & Paper-Based Documents ({attachedDocs.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">Upload as many as needed</span>
          </div>

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#093a96] rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#093a96] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click or drag ID cards & paper documents here
              </p>
              <p className="text-[10px] text-slate-500">
                Supports multiple files: National ID, Passport, Birth Certificate, Barangay Clearance (PDF, JPG, PNG)
              </p>
            </div>
          </div>

          {/* List of Attached Documents */}
          {attachedDocs.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#093a96] flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{doc.name}</div>
                      <div className="text-[10px] text-slate-500">{doc.size || '1.2 MB'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={doc.type}
                      onChange={(e) => handleDocTypeChange(doc.id, e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
                    >
                      {documentTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <IOSButton
            variant="secondary"
            size="md"
            onClick={() => setAddUserModalOpen(false)}
          >
            Cancel
          </IOSButton>

          <IOSButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            icon={UserPlus}
            className="!bg-[#141870] hover:!bg-[#0c1055] font-bold shadow-md shadow-blue-950/20"
          >
            Create User Account & Save Documents
          </IOSButton>
        </div>
      </form>
    </IOSSheet>
  );
};
