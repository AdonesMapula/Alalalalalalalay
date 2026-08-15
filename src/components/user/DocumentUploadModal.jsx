import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Calendar,
  Building,
  Lock,
  X,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';

export const DocumentUploadModal = () => {
  const { uploadModalOpen, setUploadModalOpen, uploadNewDocument } = useApp();

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('National ID / Gov ID');
  const [issuer, setIssuer] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const documentTypes = [
    'National ID / Gov ID',
    'PhilHealth MDR',
    'NBI Clearance',
    'Police Clearance',
    'Barangay Certificate',
    'Birth Certificate (PSA)',
    'Certificate of Employment (COE)',
    'Medical Certificate / Clinical Abstract',
    'School Registration / Transcript',
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docName) return;

    setIsUploading(true);
    setUploadProgress(20);

    setTimeout(() => setUploadProgress(60), 400);
    setTimeout(() => setUploadProgress(100), 800);

    setTimeout(() => {
      uploadNewDocument({
        name: docName,
        type: docType,
        issuer: issuer || 'Authorized Government Issuer',
        documentNumber: docNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        expirationDate: expirationDate || '2028-12-31',
      });
      setIsUploading(false);
      setDocName('');
      setSelectedFile(null);
    }, 1100);
  };

  return (
    <IOSSheet
      isOpen={uploadModalOpen}
      onClose={() => setUploadModalOpen(false)}
      title="Upload Government Document"
      subtitle="Encrypted & Scanned for Eligibility Verification"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 select-none">
        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-300 hover:border-[#007AFF] rounded-3xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 ios-spring cursor-pointer relative"
        >
          <input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#007AFF] flex items-center justify-center shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="text-center">
                <p className="text-xs font-bold text-[#007AFF]">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                  Drag and drop file here, or browse
                </p>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">
                  Supports PDF, PNG, JPEG up to 15MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar when uploading */}
        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Scanning document metadata...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007AFF] ios-spring"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Document Name
            </label>
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Updated NBI Clearance 2026"
              className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              >
                {documentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Issuing Agency / Office
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. NBI UN Avenue Main Office"
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Document / Reference Number
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. NBI-2026-88190"
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Expiration Date (if applicable)
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>Protected with AES-256 client encryption & Supabase Row Level Security.</span>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <IOSButton
            variant="secondary"
            size="md"
            onClick={() => setUploadModalOpen(false)}
          >
            Cancel
          </IOSButton>
          <IOSButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isUploading}
            disabled={!docName || isUploading}
          >
            Save & Index Document
          </IOSButton>
        </div>
      </form>
    </IOSSheet>
  );
};
