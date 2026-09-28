import React, { useState, useEffect } from 'react';
import { StudioAsset, ProjectMember, RightRecord } from '../../../types';
import { api } from '../../../services/api';
import { Layers, FileText, Music, Video, Image, File, Plus, Trash2, Maximize2, X, Download, ShieldCheck, Crown } from 'lucide-react';

interface ToolProps {
  projectId: string;
  members: ProjectMember[];
  userRole: 'owner' | 'member' | 'viewer';
  onEnterFocus: () => void;
  isFocusMode: boolean;
}

const ASSET_TYPES = ['ALL', 'script', 'audio', 'video', 'moodboard', 'reference', 'document'];

export const StudioTool: React.FC<ToolProps> = ({
  projectId, members, userRole, onEnterFocus, isFocusMode
}) => {
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [rights, setRights] = useState<RightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [uploadModal, setUploadModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<'script' | 'moodboard' | 'audio' | 'video' | 'reference' | 'document'>('document');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [notes, setNotes] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [rightsAssetId, setRightsAssetId] = useState('');
  const [isMaster, setIsMaster] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, rightsData] = await Promise.all([
        api.getStudioAssets(projectId),
        api.getRights(projectId).catch(() => ({ rights: [] }))
      ]);
      setAssets(assetsData.assets || []);
      setRights(rightsData.rights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fileUrl) return;

    try {
      const combinedNotes = [
        notes,
        contributorName ? `Contributor: ${contributorName}` : '',
        isMaster ? '[MASTER ASSET]' : '',
        rightsAssetId ? `[RIGHTS_ASSET:${rightsAssetId}]` : ''
      ].filter(Boolean).join(' · ');

      await api.createStudioAsset(projectId, {
        name: isMaster ? `★ ${name}` : name,
        asset_type: assetType,
        file_url: fileUrl,
        file_size: fileSize,
        notes: combinedNotes
      });
      setName('');
      setFileUrl('');
      setNotes('');
      setContributorName('');
      setRightsAssetId('');
      setIsMaster(false);
      setUploadModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this asset from studio?')) return;
    try {
      await api.deleteStudioAsset(projectId, id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="w-4 h-4 text-[#6A1A4C]" />;
      case 'video': return <Video className="w-4 h-4 text-[#C84B31]" />;
      case 'script': return <FileText className="w-4 h-4 text-black" />;
      case 'moodboard': return <Image className="w-4 h-4 text-[#2D7A4C]" />;
      default: return <File className="w-4 h-4 text-black/60" />;
    }
  };

  const filteredAssets = assets.filter(a => activeType === 'ALL' || a.asset_type === activeType);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[2px] border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#6A1A4C] font-bold">05 // STUDIO</span>
            <span className="font-mono text-[10px] text-black/60 font-bold uppercase">ASSETS, SCRIPTS &amp; MEDIA</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black mt-1">PRODUCTION MATERIALS</h2>
        </div>

        <div className="flex items-center gap-3">
          {userRole !== 'viewer' && (
            <button
              onClick={() => setUploadModal(true)}
              className="btn-editorial-pink text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ RECORD ASSET</span>
            </button>
          )}

          {!isFocusMode && (
            <button
              onClick={onEnterFocus}
              className="btn-editorial text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>ENTER FOCUS ⤢</span>
            </button>
          )}
        </div>
      </div>

      {/* Asset Type Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b-[2px] border-black pb-3">
        {ASSET_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`font-mono text-xs px-3 py-1 border-[2px] transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeType === t
                ? 'border-black bg-black text-white font-bold'
                : 'border-black/30 bg-[#fbf6f0] text-black hover:border-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="py-12 text-center font-mono text-xs text-black/60 animate-pulse">
          OPENING STUDIO MATERIALS...
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="border-[2.5px] border-dashed border-black/30 p-8 text-center space-y-3 bg-[#fbf6f0]">
          <Layers className="w-8 h-8 text-black/40 mx-auto" />
          <p className="font-fun text-sm text-black/70">
            No studio assets recorded under {activeType === 'ALL' ? 'this project' : activeType}.
          </p>
          {userRole !== 'viewer' && (
            <button
              onClick={() => setUploadModal(true)}
              className="btn-editorial-pink mt-2 text-xs px-4 py-2 cursor-pointer"
            >
              ADD MATERIAL ↗
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isMasterAsset = asset.name.startsWith('★') || asset.notes?.includes('[MASTER ASSET]');

            return (
              <div
                key={asset.id}
                className={`p-5 bg-[#FFFDF9] border-[2.5px] border-black transition-all flex flex-col justify-between group shadow-[3px_3px_0px_#000000] ${
                  isMasterAsset ? 'border-l-[6px] border-l-[#C84B31]' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2 bg-[#fbf6f0] border-[1.5px] border-black">
                      {getAssetIcon(asset.asset_type)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isMasterAsset && (
                        <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#C84B31] text-white font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          MASTER
                        </span>
                      )}
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-black/30 text-black font-bold">
                        {asset.asset_type}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-arthouse font-bold text-base text-black truncate">
                    {asset.name}
                  </h4>

                  {asset.notes && (
                    <p className="font-fun text-xs text-black/80 mt-2 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {asset.notes.replace('[MASTER ASSET]', '').replace(/\[RIGHTS_ASSET:[^\]]+\]/, '').trim()}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between font-mono text-[10px] text-black/60">
                  <span>{asset.file_size || '1.0 MB'}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#6A1A4C] flex items-center gap-1 text-[10px] uppercase font-bold text-black border border-black px-2 py-0.5 bg-[#fbf6f0]"
                    >
                      ACCESS ↗
                    </a>
                    {userRole !== 'viewer' && (
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="hover:text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Asset Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-editorial-fade">
          <div className="w-full max-w-lg bg-[#FFFDF9] border-[2.5px] border-black p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4">
              <div>
                <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase">05 // STUDIO</span>
                <h3 className="font-arthouse font-black text-xl text-black uppercase">RECORD PRODUCTION MATERIAL</h3>
              </div>
              <button onClick={() => setUploadModal(false)} className="text-black/60 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The_Dissolve_Treatment_Rev4.pdf"
                  className="w-full bg-white border-[2px] border-black p-2.5 font-fun text-sm text-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Asset Category</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="script">SCRIPT / TEXT</option>
                    <option value="audio">AUDIO / STEM / SOUND</option>
                    <option value="video">VIDEO / ROUGH CUT</option>
                    <option value="moodboard">MOODBOARD / STILLS</option>
                    <option value="document">PRODUCTION DOCUMENT</option>
                    <option value="reference">REFERENCE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">File Size Tag</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g. 18.4 MB"
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Attributed Contributor</label>
                  <select
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="">Select Crew Member...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name || m.email}>
                        {m.name || m.email} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Rights Ledger Link</label>
                  <select
                    value={rightsAssetId}
                    onChange={(e) => setRightsAssetId(e.target.value)}
                    className="w-full bg-white border-[2px] border-black p-2 font-mono text-xs text-black focus:outline-none"
                  >
                    <option value="">Link Rights Asset...</option>
                    {rights.map(rt => (
                      <option key={rt.id} value={rt.id}>
                        {rt.asset_name} ({rt.ownership_percentage}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#fbf6f0] border border-black/30 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="masterCheck"
                  checked={isMaster}
                  onChange={(e) => setIsMaster(e.target.checked)}
                  className="accent-[#C84B31]"
                />
                <label htmlFor="masterCheck" className="font-mono text-xs text-black font-bold cursor-pointer flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#C84B31]" />
                  <span>Designate as Master Asset / Final Exhibition Cut</span>
                </label>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Storage URL / File Link *</label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://archive.windervale.art/stems/tape_loop.wav"
                  className="w-full bg-white border-[2px] border-black p-2.5 font-mono text-xs text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase font-bold text-black mb-1">Production Notes &amp; Context</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Capture technical details, microphone model, or revision context..."
                  className="w-full bg-white border-[2px] border-black p-2.5 font-fun text-xs text-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="font-mono text-xs text-black/60 hover:text-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button type="submit" className="btn-editorial-pink text-xs px-5 py-2 cursor-pointer">
                  RECORD ASSET ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
