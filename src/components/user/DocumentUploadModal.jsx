import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  File,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';
import { getDocumentPlaceholderThumbnail } from '../../services/docAgentService';
import { parseUploadedImage } from '../../services/imageParserService';
import { parseResumeFileOrPreset } from '../../services/resumeParserService';

export const DocumentUploadModal = () => {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    uploadModalPrefill,
    setUploadModalPrefill,
    uploadNewDocument,
    user,
    setUser,
    addToast,
  } = useApp();

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('National ID / Gov ID');
  const [issuer, setIssuer] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [parseMsg, setParseMsg] = useState(null);
  const [syncToProfile, setSyncToProfile] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();

  const documentTypes = [
    'National ID / Gov ID',
    'Utility Bill / Proof of Billing',
    'Resume / Curriculum Vitae (CV)',
    'Bio-Data / Personal Data Sheet',
    'Barangay Certificate',
    'PhilHealth MDR',
    'NBI Clearance',
    'Police Clearance',
    'Birth Certificate (PSA)',
    'Payslip / Proof of Income',
    'Medical Certificate / Clinical Abstract',
    'Certificate of Employment (COE)',
    'School Registration / Transcript',
  ];

  // Pre-fill the form when opened from a specific requirement
  useEffect(() => {
    if (uploadModalOpen && uploadModalPrefill) {
      setDocName(uploadModalPrefill.name || '');
      setDocType(uploadModalPrefill.type || 'National ID / Gov ID');
      setUploadModalPrefill(null);
    }
  }, [uploadModalOpen, uploadModalPrefill, setUploadModalPrefill]);

  // Reset modal state on close
  const handleClose = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setParseMsg(null);
    setIsScanning(false);
    setScanStep('');
    if (setUploadModalPrefill) setUploadModalPrefill(null);
  };

  // ── Unified Intelligent Image & Document Parser ────────────────────────────
  const handleProcessUploadedFile = async (file) => {
    if (!file) return;

    setIsScanning(true);
    setParseMsg(null);
    setScanStep('Reading image content & visual signatures...');

    // Generate local preview URL
    if (file.type?.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    try {
      const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|svg)$/i.test(file.name);
      const isTextDoc = /\.(docx?|txt)$/i.test(file.name);

      let parsed = null;

      if (isImage) {
        setScanStep('Analyzing visual text, layout & stamps...');
        parsed = await parseUploadedImage(file);
      } else if (isTextDoc) {
        setScanStep('Parsing document text & credential attributes...');
        const res = await parseResumeFileOrPreset(file);
        if (res.success && res.data) {
          parsed = {
            docName: `${res.data.fullName || 'Candidate'} Resume`,
            docType: 'Resume / Curriculum Vitae (CV)',
            issuer: res.data.headline || 'Verified Candidate Profile',
            docNumber: `RES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            expirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fullName: res.data.fullName,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
            phone: res.data.phone,
            address: res.data.address,
            gender: res.data.gender,
            dateOfBirth: res.data.dateOfBirth,
            civilStatus: res.data.civilStatus,
            skills: res.data.skills || [],
            confidenceScore: res.data.confidenceScore || 95,
          };
        }
      } else {
        // PDF or Other Document format
        setScanStep('Analyzing PDF structure & extracting metadata...');
        parsed = await parseUploadedImage(file);
      }

      if (parsed) {
        setExtractedData(parsed);

        // Autofill primary form inputs directly from the image content
        if (parsed.docName) setDocName(parsed.docName);
        if (parsed.docType) setDocType(parsed.docType);
        if (parsed.issuer) setIssuer(parsed.issuer);
        if (parsed.docNumber) setDocNumber(parsed.docNumber);
        if (parsed.expirationDate) setExpirationDate(parsed.expirationDate);

        setParseMsg({
          type: 'success',
          text: `✓ Image content recognized successfully. Form fields auto-filled.`,
        });

        addToast(
          'Image Parsed',
          `Recognized ${parsed.docName} (${parsed.confidenceScore}% confidence).`,
          'success'
        );
      } else {
        setParseMsg({
          type: 'warn',
          text: 'Document loaded. Please verify the form fields below.',
        });
      }
    } catch (err) {
      console.warn('Image Parse Error:', err);
      setParseMsg({
        type: 'warn',
        text: 'Document loaded. You can verify and fill in the form fields directly.',
      });
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleProcessUploadedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleProcessUploadedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setParseMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!docName) return;

    setIsUploading(true);
    setUploadProgress(30);

    setTimeout(() => setUploadProgress(70), 300);
    setTimeout(() => setUploadProgress(100), 600);

    setTimeout(() => {
      // 1. Prepare Document Vault Payload
      const attributes = {
        ...(extractedData || {}),
        skills: extractedData?.skills || [],
      };

      if (uploadNewDocument) {
        uploadNewDocument({
          name: docName,
          type: docType,
          issuer: issuer || 'Authorized Authority',
          documentNumber: docNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
          expirationDate: expirationDate || '2028-12-31',
          thumbnail: previewUrl || getDocumentPlaceholderThumbnail(docType),
          attributes,
        });
      }

      // 2. Auto-sync extracted attributes to Citizen Profile
      if (syncToProfile && user && setUser && extractedData) {
        const updatedUser = { ...user };

        if (extractedData.fullName) updatedUser.fullName = extractedData.fullName;
        if (extractedData.firstName) updatedUser.firstName = extractedData.firstName;
        if (extractedData.lastName) updatedUser.lastName = extractedData.lastName;
        if (extractedData.middleName) updatedUser.middleName = extractedData.middleName;
        if (extractedData.email) updatedUser.email = extractedData.email;
        if (extractedData.phone) updatedUser.phone = extractedData.phone;
        if (extractedData.address) updatedUser.address = extractedData.address;
        if (extractedData.gender) updatedUser.gender = extractedData.gender;
        if (extractedData.dateOfBirth) updatedUser.birthDate = extractedData.dateOfBirth;
        if (extractedData.civilStatus) updatedUser.civilStatus = extractedData.civilStatus;
        if (extractedData.skills && extractedData.skills.length > 0) {
          const existing = updatedUser.skills || [];
          updatedUser.skills = Array.from(new Set([...existing, ...extractedData.skills]));
        }

        setUser(updatedUser);
        localStorage.setItem('alalay_user', JSON.stringify(updatedUser));
        addToast('Profile Synchronized', 'Updated citizen profile with extracted document attributes.', 'info');
      }

      setIsUploading(false);
      handleClose();
    }, 850);
  };

  return (
    <IOSSheet
      isOpen={uploadModalOpen}
      onClose={handleClose}
      title="Upload & Parse Document Image"
      subtitle="Vision OCR, Autonomous Field Extraction & Form Auto-fill"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 select-none">
        {/* Upload Drop Zone & Live Image Scanning Canvas */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-3xl p-5 text-center transition-all relative overflow-hidden ${
            isScanning
              ? 'border-[#093a96] bg-blue-50/70 shadow-md shadow-blue-900/10'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-blue-200 hover:border-[#093a96] bg-blue-50/30 hover:bg-blue-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.doc,.txt"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          {/* Animated Laser Scanning Line during parsing */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent absolute animate-bounce opacity-80" />
            </div>
          )}

          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Visual Icon / Thumbnail */}
            {previewUrl ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-300 shadow-md flex-shrink-0 bg-white">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-[#093a96]/30 flex items-center justify-center backdrop-blur-xs">
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white border border-blue-200 text-[#093a96] flex items-center justify-center shadow-xs">
                {isScanning ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#093a96]" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
            )}

            {/* Status Messages */}
            {isScanning ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#093a96] flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Reading image content & extracting fields...</span>
                </p>
                <p className="text-[11px] text-slate-500 font-medium">{scanStep || 'Recognizing text directly from image'}</p>
              </div>
            ) : selectedFile ? (
              <div className="flex items-center justify-between gap-3 w-full max-w-sm px-3.5 py-2 bg-white rounded-xl border border-blue-200 mx-auto z-20">
                <div className="flex items-center gap-2 min-w-0 text-left">
                  <File className="w-4 h-4 text-[#093a96] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(0)} KB • Parsed from image
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedFile();
                  }}
                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Click to browse or drop document image here
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reads text directly from image (PNG, JPG, WebP, PDF) • Auto-fills form below
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Notification Banner */}
        {parseMsg && !isScanning && (
          <div
            className={`flex items-start gap-2.5 p-3 rounded-2xl text-xs border animate-in fade-in zoom-in-95 ${
              parseMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : parseMsg.type === 'warn'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {parseMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{parseMsg.text}</div>
          </div>
        )}

        {/* Once Parsed: Display ONLY Confidence Level, Document Name, and Document Type */}
        {extractedData && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200 shadow-xs space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#093a96]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Image OCR Analysis Complete</span>
              </div>
              {/* 1. Confidence Level Badge */}
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confidence Level: {extractedData.confidenceScore || 95}%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* 2. Document Name */}
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                  Document Name
                </span>
                <span className="text-xs font-extrabold text-slate-900 truncate block">
                  {extractedData.docName || docName}
                </span>
              </div>

              {/* 3. Document Type */}
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                  Document Type
                </span>
                <span className="text-xs font-extrabold text-[#093a96] truncate block">
                  {extractedData.docType || docType}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-100/80 text-[11px] text-slate-600">
              <span className="text-[10px] text-slate-500 font-medium">
                Fields below have been auto-filled from the image.
              </span>
              <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToProfile}
                  onChange={(e) => setSyncToProfile(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#093a96] rounded accent-[#093a96]"
                />
                <span>Sync to Citizen Profile</span>
              </label>
            </div>
          </div>
        )}

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Encrypting & saving to vault...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#093a96] transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary Form Fields (Auto-filled by Parser) */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Philippine National ID"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:border-[#093a96] focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document Category / Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:border-[#093a96] focus:bg-white outline-none transition-all cursor-pointer"
              >
                {documentTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issuing Agency / Office
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Philippine Statistics Authority (PSA)"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:border-[#093a96] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Document / Registry Number
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 1234-5678-9012-3456"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono font-medium focus:border-[#093a96] focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expiration / Validity Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:border-[#093a96] focus:bg-white outline-none transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security & Action Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256 Encrypted in Citizen Vault</span>
          </div>

          <div className="flex items-center gap-2">
            <IOSButton
              variant="secondary"
              size="md"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </IOSButton>

            <IOSButton
              variant="primary"
              size="md"
              type="submit"
              disabled={isUploading || !docName}
            >
              Save to Vault
            </IOSButton>
          </div>
        </div>
      </form>
    </IOSSheet>
  );
};
