import React, { useState } from 'react';
import { Building2, Globe, Shield, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IOSSheet } from '../common/IOSSheet';
import { IOSButton } from '../common/IOSButton';

export const AddSourceModal = () => {
  const { addSourceModalOpen, setAddSourceModalOpen, addKnowledgeSource } = useApp();

  const [agencyName, setAgencyName] = useState('');
  const [agencyType, setAgencyType] = useState('Executive Department');
  const [officialUrl, setOfficialUrl] = useState('https://');
  const [category, setCategory] = useState('Health');
  const [scrapingFrequency, setScrapingFrequency] = useState('Every 12 Hours');
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!officialUrl) return;

    setIsSubmitting(true);
    try {
      await addKnowledgeSource({
        agencyName,
        agencyType,
        officialUrl,
        category,
        scrapingFrequency,
        priority,
        notes,
      });

      setAgencyName('');
      setOfficialUrl('https://');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IOSSheet
      isOpen={addSourceModalOpen}
      onClose={() => setAddSourceModalOpen(false)}
      title="Add Government Knowledge Source"
      subtitle="Configure trusted official agency domain for AI scraping"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 select-none">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Government Agency Name
            </label>
            <input
              type="text"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="e.g. Department of Social Welfare and Development (DSWD)"
              className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Agency Classification
              </label>
              <select
                value={agencyType}
                onChange={(e) => setAgencyType(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              >
                <option>Executive Department</option>
                <option>Government Owned & Controlled Corp (GOCC)</option>
                <option>Constitutional Commission</option>
                <option>Local Government Unit (LGU)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              >
                <option>Health</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Employment</option>
                <option>Social Services</option>
                <option>Housing</option>
                <option>Business</option>
                <option>Discounts & Benefits</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Official Website URL (Must be .gov.ph or official portal)
            </label>
            <input
              type="url"
              required
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://www.dswd.gov.ph"
              className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Scraping Schedule Frequency
              </label>
              <select
                value={scrapingFrequency}
                onChange={(e) => setScrapingFrequency(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              >
                <option>Every 6 Hours</option>
                <option>Every 12 Hours</option>
                <option>Daily</option>
                <option>Every 2 Days</option>
                <option>Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                Source Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Admin Notes & Scraping Boundary Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Scrape /programs/aics and /circulars/2026 for emergency medical subsidies."
              className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#007AFF]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <IOSButton
            variant="secondary"
            size="md"
            onClick={() => setAddSourceModalOpen(false)}
          >
            Cancel
          </IOSButton>
          <IOSButton
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isSubmitting}
            icon={Plus}
          >
            {isSubmitting ? 'Scraping & Ingesting...' : 'Register & Start Ingestion'}
          </IOSButton>
        </div>
      </form>
    </IOSSheet>
  );
};
