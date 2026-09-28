import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LegalDocument } from '../../types';
import { Shield, FileText, CheckCircle2, X, Cookie, ChevronRight, Lock } from 'lucide-react';

export const CookieConsentModal: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [activeDocType, setActiveDocType] = useState<string>('cookie_policy');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('windervale_cookie_consent');
    if (!consent) {
      // Show banner after brief delay
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getLegalDocuments();
      setLegalDocs(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem('windervale_cookie_consent', 'accepted');
    setShowBanner(false);
    setShowLegalModal(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('windervale_cookie_consent', 'essential');
    setShowBanner(false);
    setShowLegalModal(false);
  };

  const handleOpenLegalModal = (docType = 'cookie_policy') => {
    setActiveDocType(docType);
    setShowLegalModal(true);
    if (legalDocs.length === 0) {
      loadDocs();
    }
  };

  const currentDoc = legalDocs.find(d => d.doc_type === activeDocType) || {
    doc_type: activeDocType,
    title: activeDocType.replace('_', ' ').toUpperCase(),
    version: '2.0',
    last_updated: '2026-09-01',
    summary: 'Windervale operates under an autonomous creative covenant protecting intellectual property and data sovereignty.',
    content: 'Full legal covenant and studio protocols are maintained in the permanent Windervale autonomous repository.'
  };

  return (
    <>
      {/* FLOATING BOTTOM BANNER */}
      {showBanner && !showLegalModal && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50 max-w-4xl mx-auto animate-editorial-fade">
          <div className="border-[2.5px] border-black bg-[#FFFDF9] p-4 sm:p-5 shadow-[6px_6px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#6A1A4C] text-white">
                  <Cookie className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#6A1A4C]">
                  COOKIES, PRIVACY &middot; CREATIVE PROTOCOL
                </span>
              </div>
              <p className="font-fun text-xs text-black/85 leading-snug">
                Windervale uses strictly essential cookies and local storage tokens for active studio authentication and rights ratification. We never use third-party marketing trackers or monetize practitioner data.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[10px] text-black/60 font-bold uppercase">
                <button
                  onClick={() => handleOpenLegalModal('cookie_policy')}
                  className="hover:text-black underline cursor-pointer"
                >
                  Cookie Policy
                </button>
                <span>&middot;</span>
                <button
                  onClick={() => handleOpenLegalModal('privacy_policy')}
                  className="hover:text-black underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>&middot;</span>
                <button
                  onClick={() => handleOpenLegalModal('terms_of_service')}
                  className="hover:text-black underline cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleAcceptEssential}
                className="px-3 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black bg-[#fbf6f0] hover:bg-black/5 cursor-pointer transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs uppercase font-bold border-[2px] border-black cursor-pointer transition-colors shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept All Covenants</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL LEGAL COVENANT MODAL */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-editorial-fade">
          <div className="border-[2.5px] border-black bg-[#FFFDF9] max-w-2xl w-full p-6 space-y-4 shadow-[0_16px_36px_rgba(0,0,0,0.6)] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#6A1A4C] text-white">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-mono text-[9px] text-[#6A1A4C] font-bold uppercase tracking-wider block">
                    WINDERVALE AUTONOMOUS COVENANT
                  </span>
                  <h3 className="font-arthouse font-black text-lg sm:text-xl text-black uppercase">
                    LEGAL &amp; PRIVACY ARCHIVE
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowLegalModal(false)}
                className="p-1.5 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Selector Tabs */}
            <div className="flex border-[2px] border-black bg-[#fbf6f0] overflow-x-auto">
              {[
                { id: 'cookie_policy', label: 'Cookie Policy' },
                { id: 'privacy_policy', label: 'Privacy Policy' },
                { id: 'terms_of_service', label: 'Terms of Service' },
                { id: 'community_guidelines', label: 'Community Standards' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocType(tab.id)}
                  className={`py-2 px-3 sm:px-4 font-mono text-xs uppercase font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeDocType === tab.id
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-black/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Document Body */}
            {loading ? (
              <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
                RETRIEVING ARCHIVAL DOCUMENTS...
              </div>
            ) : (
              <div className="space-y-4 bg-white p-4 border-[2px] border-black/20">
                <div className="flex items-center justify-between border-b border-black/15 pb-2">
                  <h4 className="font-arthouse font-black text-base text-black uppercase">
                    {currentDoc.title}
                  </h4>
                  <span className="font-mono text-[10px] text-black/60 font-bold uppercase">
                    VERSION {currentDoc.version} &middot; {currentDoc.last_updated}
                  </span>
                </div>

                {currentDoc.summary && (
                  <div className="p-3 bg-[#fbf6f0] border-l-4 border-[#6A1A4C] font-fun text-xs text-black/90 leading-relaxed italic">
                    {currentDoc.summary}
                  </div>
                )}

                <div className="font-fun text-xs text-black/85 leading-relaxed whitespace-pre-line space-y-2 max-h-60 overflow-y-auto pr-2">
                  {currentDoc.content}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t-[2px] border-black flex items-center justify-between">
              <span className="font-mono text-[10px] text-black/60 uppercase">
                PERMANENT RECORD &middot; ZERO TRACKERS
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptEssential}
                  className="px-3.5 py-2 border-[2px] border-black font-mono text-xs uppercase font-bold text-black bg-[#fbf6f0] hover:bg-black/5 cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-5 py-2 bg-[#6A1A4C] hover:bg-black text-white font-mono text-xs uppercase font-bold border-[2px] border-black cursor-pointer transition-colors shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept All Covenants</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
