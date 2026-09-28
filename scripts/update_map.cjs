const fs = require('fs');

const humanMapCode = `import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Profile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MonogramSeal } from '../common/MonogramSeal';
import { MapPin, X, ArrowUpRight, Compass, Sparkles, Send, ExternalLink, ShieldCheck } from 'lucide-react';

interface HumanMapProps {
  onOpenProfile: (userId: string) => void;
}

export const HumanMap: React.FC<HumanMapProps> = ({ onOpenProfile }) => {
  const { user, profile } = useAuth();
  const [creatives, setCreatives] = useState<Profile[]>([]);
  const [selectedCreative, setSelectedCreative] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Intentional Connection Dispatch state
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [sendingConnect, setSendingConnect] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  // Canvas map interaction state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1.2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);

  // Geographic coordinates for the current approved user
  const myLat = profile?.latitude || 19.0760;
  const myLng = profile?.longitude || 72.8777;

  useEffect(() => {
    loadCreatives();
  }, []);

  const loadCreatives = async () => {
    setLoading(true);
    try {
      const data = await api.getCreatives();
      // Only approved candidates with match_percentage > 35
      setCreatives((data.creatives || []).filter((c: any) => (c.match_percentage || 0) > 35));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const projectGeo = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) * (width / 360)) * zoom + pan.x;
    const y = (((-1 * lat) + 90) * (height / 180)) * zoom + pan.y;
    return { x, y };
  };

  // Center the map so YOU are dead-center
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasCenteredOnUser) return;

    const width = canvas.width;
    const height = canvas.height;

    // Mathematical dead-center pan calculation
    const initialPanX = (width / 2) - ((myLng + 180) * (width / 360)) * zoom;
    const initialPanY = (height / 2) - (((-1 * myLat) + 90) * (height / 180)) * zoom;

    setPan({ x: initialPanX, y: initialPanY });
    setHasCenteredOnUser(true);
  }, [myLat, myLng, zoom, hasCenteredOnUser]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulse = 0;

    const render = () => {
      pulse = (pulse + 0.04) % (Math.PI * 2);
      ctx.fillStyle = '#0a090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Graticules / Grid Lines
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 0.5;
      for (let lat = -80; lat <= 80; lat += 20) {
        const p1 = projectGeo(lat, -180, canvas.width, canvas.height);
        const p2 = projectGeo(lat, 180, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let lng = -180; lng <= 180; lng += 30) {
        const p1 = projectGeo(90, lng, canvas.width, canvas.height);
        const p2 = projectGeo(-90, lng, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Equator & Prime Meridian
      ctx.strokeStyle = '#2b2b2b';
      ctx.lineWidth = 1;
      const eq1 = projectGeo(0, -180, canvas.width, canvas.height);
      const eq2 = projectGeo(0, 180, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(eq1.x, eq1.y);
      ctx.lineTo(eq2.x, eq2.y);
      ctx.stroke();

      // Continents Abstract Outlines
      ctx.fillStyle = '#161616';
      ctx.strokeStyle = '#262626';
      ctx.lineWidth = 1;
      const continents = [
        [[-165, 70], [-135, 60], [-125, 48], [-120, 35], [-105, 20], [-80, 25], [-75, 40], [-60, 48], [-80, 60], [-95, 72]],
        [[-80, 10], [-50, -5], [-35, -5], [-40, -22], [-65, -55], [-75, -45], [-80, -20]],
        [[-10, 38], [30, 32], [40, 20], [70, 20], [80, 10], [105, 10], [120, 22], [140, 38], [140, 65], [70, 70], [25, 70], [5, 60], [-5, 48]],
        [[-15, 30], [30, 32], [50, 12], [42, -12], [30, -32], [18, -34], [10, -5], [-15, 15]],
        [[115, -22], [150, -20], [152, -38], [115, -35]]
      ];

      continents.forEach(poly => {
        ctx.beginPath();
        poly.forEach((pt, idx) => {
          const projected = projectGeo(pt[1], pt[0], canvas.width, canvas.height);
          if (idx === 0) ctx.moveTo(projected.x, projected.y);
          else ctx.lineTo(projected.x, projected.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // 1. Render YOU (The Approved User) Dead-Center on the map
      const myPos = projectGeo(myLat, myLng, canvas.width, canvas.height);

      // Radar pulse waves around YOU
      const myWave = 12 + Math.sin(pulse) * 4;
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, myWave, 0, Math.PI * 2);
      ctx.strokeStyle = '#dfa5a2';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center disc for YOU
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#dfa5a2';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // YOU Badge
      const myBadgeText = `YOU · ${(profile?.location || 'BASE').toUpperCase()}`;
      ctx.font = 'bold 9px "Space Mono", monospace';
      const myTextWidth = ctx.measureText(myBadgeText).width;
      ctx.fillStyle = '#000000';
      ctx.fillRect(myPos.x - myTextWidth / 2 - 4, myPos.y - 22, myTextWidth + 8, 14);
      ctx.strokeStyle = '#dfa5a2';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(myPos.x - myTextWidth / 2 - 4, myPos.y - 22, myTextWidth + 8, 14);
      ctx.fillStyle = '#dfa5a2';
      ctx.fillText(myBadgeText, myPos.x - myTextWidth / 2, myPos.y - 11);

      // 2. Render Approved Matching Candidates (>35%)
      creatives.forEach(c => {
        if (!c.latitude || !c.longitude) return;
        const pos = projectGeo(c.latitude, c.longitude, canvas.width, canvas.height);

        const isSelected = selectedCreative?.user_id === c.user_id;
        const matchPct = (c as any).match_percentage || 0;

        // Draw connection beam between YOU and candidate
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(myPos.x, myPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = isSelected ? '#dfa5a2' : 'rgba(223, 165, 162, 0.2)';
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Candidate Pulse wave
        const waveSize = 8 + Math.sin(pulse + 1) * 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, waveSize, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#dfa5a2' : 'rgba(223, 165, 162, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node center
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#fbf6f0' : '#dfa5a2';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Compatibility Tag Stamp directly on map
        ctx.fillStyle = isSelected ? '#dfa5a2' : '#000000';
        ctx.strokeStyle = isSelected ? '#000000' : '#dfa5a2';
        ctx.lineWidth = 1.5;

        const badgeText = `${matchPct}% · ${(c.disciplines?.[0] || 'CREATIVE').toUpperCase()}`;
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        const textWidth = ctx.measureText(badgeText).width;

        const bx = pos.x + 8;
        const by = pos.y - 8;

        ctx.fillRect(bx - 2, by - 10, textWidth + 6, 14);
        ctx.strokeRect(bx - 2, by - 10, textWidth + 6, 14);

        ctx.fillStyle = isSelected ? '#000000' : '#dfa5a2';
        ctx.fillText(badgeText, bx + 1, by + 1);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [creatives, selectedCreative, zoom, pan, myLat, myLng, profile]);

  // Touch/Pointer dragging for map exploration
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let clicked: Profile | null = null;
    let minDist = 32;

    creatives.forEach(c => {
      if (!c.latitude || !c.longitude) return;
      const pos = projectGeo(c.latitude, c.longitude, canvas.width, canvas.height);
      const dist = Math.hypot(pos.x - clickX, pos.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        clicked = c;
      }
    });

    if (clicked) {
      setSelectedCreative(clicked);
    }
  };

  const resetToMe = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const centerPanX = (width / 2) - ((myLng + 180) * (width / 360)) * zoom;
    const centerPanY = (height / 2) - (((-1 * myLat) + 90) * (height / 180)) * zoom;
    setPan({ x: centerPanX, y: centerPanY });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black select-none">
      {/* Top Folio Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3 bg-[#fbf6f0] px-4 py-3">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-black font-bold">
              CARTOGRAPHY &middot; ACTIVE DIRECTORY
            </span>
            <h1 className="font-fun font-bold text-xl text-black lowercase leading-none mt-0.5">
              the human map
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToMe}
              className="px-2.5 py-1 bg-black text-[#dfa5a2] font-mono text-[10px] font-bold uppercase border-[1.5px] border-black hover:bg-[#dfa5a2] hover:text-black cursor-pointer transition-colors"
            >
              Center on You
            </button>
            <div className="font-mono text-[10px] text-black font-bold bg-white border-[1.5px] border-black px-2.5 py-1">
              {creatives.length} {creatives.length === 1 ? 'Match (>35%)' : 'Matches (>35%)'}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State when no matches above 35% */}
      {creatives.length === 0 && !loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-[#fbf6f0] border-[2.5px] border-black p-6 max-w-xs text-center space-y-2 pointer-events-auto">
            <span className="font-mono text-[9px] text-black font-bold tracking-widest uppercase block">
              CARTOGRAPHY
            </span>
            <h2 className="font-fun font-bold text-2xl text-black lowercase">
              the map is quiet
            </h2>
            <p className="font-fun italic text-xs text-black/80 leading-relaxed">
              You are at the center of the sector ({profile?.location || 'Base'}). No other approved creatives currently exceed the 35% mutual compatibility threshold.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={420}
          height={650}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleCanvasClick}
          className="w-full h-full block touch-none"
        />

        {/* Map Zoom Controls */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-1 font-mono text-xs">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            aria-label="Zoom in"
            className="w-8 h-8 bg-black text-[#dfa5a2] border-[2px] border-black flex items-center justify-center font-bold cursor-pointer hover:bg-[#dfa5a2] hover:text-black transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.7, z - 0.2))}
            aria-label="Zoom out"
            className="w-8 h-8 bg-black text-[#dfa5a2] border-[2px] border-black flex items-center justify-center font-bold cursor-pointer hover:bg-[#dfa5a2] hover:text-black transition-colors"
          >
            -
          </button>
        </div>
      </div>

      {/* Bottom Creative Dossier Drawer: Arthouse Cinema Dossier with Match Explanation */}
      {selectedCreative && (
        <div className="absolute bottom-2 left-2 right-2 z-30 bg-[#fbf6f0] border-[2.5px] border-black p-5 max-h-[75vh] overflow-y-auto">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 border-b-[2px] border-black pb-3 mb-3">
            <div className="flex items-start gap-3">
              {selectedCreative.avatar_url && selectedCreative.avatar_public !== 0 ? (
                <div className="w-12 h-12 border-[2px] border-black bg-black shrink-0 overflow-hidden">
                  <img
                    src={selectedCreative.avatar_url}
                    alt={selectedCreative.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <MonogramSeal
                  name={selectedCreative.display_name}
                  disciplines={selectedCreative.disciplines}
                  size="md"
                />
              )}
              <div>
                <h3 className="font-fun font-bold text-xl text-black leading-tight">
                  {selectedCreative.display_name}
                </h3>
                <p className="font-mono text-xs text-black/70">
                  {selectedCreative.location || 'Nomadic'} &middot; {selectedCreative.disciplines?.join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCreative(null)}
              aria-label="Close dossier"
              className="p-1 border-[1.5px] border-black hover:bg-black hover:text-[#dfa5a2] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent Compatibility Banner */}
          <div className="mb-3 p-3 bg-black text-[#dfa5a2] border-[2px] border-black flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#dfa5a2]/70 block">
                COMPATIBILITY
              </span>
              <span className="font-arthouse font-bold text-lg text-[#dfa5a2]">
                {(selectedCreative as any).match_percentage || 0}% MUTUAL MATCH
              </span>
            </div>
            <span className="font-mono text-[10px] text-black font-bold px-2 py-0.5 bg-[#dfa5a2] border border-[#dfa5a2] uppercase">
              {(selectedCreative as any).synergy_label || 'Direct Alignment'}
            </span>
          </div>

          {/* RATIONALE: WHY THIS MATCH PERCENTAGE? */}
          <div className="mb-4 border-[2px] border-black bg-white p-3 space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black block border-b border-black/20 pb-1">
              WHY THIS PERCENTAGE?
            </span>
            <div className="space-y-2">
              {((selectedCreative as any).match_reasons || []).map((reason: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-2 border-b border-black/10 pb-1.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase text-black block">
                      {reason.category}
                    </span>
                    <p className="font-fun italic text-xs text-black/85">
                      {reason.detail}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[10px] bg-black text-[#dfa5a2] px-1.5 py-0.5 shrink-0">
                    {reason.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <p className="font-fun italic text-xs text-black leading-relaxed mb-3">
            "{selectedCreative.bio || 'Independent practitioner operating on Windervale.'}"
          </p>

          {/* Offerings & Seeking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-4">
            {selectedCreative.offerings && (
              <div className="p-2 border-[1.5px] border-black bg-[#dfa5a2]/20">
                <span className="font-bold text-[9px] uppercase text-black block mb-0.5">CAN OFFER:</span>
                <p className="font-fun italic text-xs text-black">{selectedCreative.offerings}</p>
              </div>
            )}
            {selectedCreative.collaboration_interests && (
              <div className="p-2 border-[1.5px] border-black bg-white">
                <span className="font-bold text-[9px] uppercase text-black block mb-0.5">SEEKING:</span>
                <p className="font-fun italic text-xs text-black">{selectedCreative.collaboration_interests}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t-[2px] border-black">
            <button
              onClick={() => onOpenProfile(selectedCreative.user_id)}
              className="py-2.5 px-3 border-[2px] border-black bg-white text-black font-mono text-xs font-bold uppercase hover:bg-black hover:text-[#dfa5a2] transition-colors text-center cursor-pointer"
            >
              Full Dossier &rarr;
            </button>
            {sentRequestIds.has(selectedCreative.user_id) ? (
              <button
                disabled
                className="py-2.5 px-3 bg-black text-[#dfa5a2] border-[2px] border-black font-mono text-xs font-bold uppercase text-center cursor-default"
              >
                Dispatched
              </button>
            ) : (
              <button
                onClick={() => setConnectModalOpen(true)}
                className="py-2.5 px-3 bg-black hover:bg-[#dfa5a2] hover:text-black border-[2px] border-black text-[#dfa5a2] font-mono text-xs font-bold uppercase text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Connect &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Intentional Connection Dispatch Modal */}
      {connectModalOpen && selectedCreative && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <span className="font-mono text-[10px] uppercase text-black font-bold tracking-widest">
                INTENTIONAL COLLABORATION
              </span>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="p-1 border border-black hover:bg-black hover:text-[#dfa5a2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-fun font-bold text-lg text-black lowercase leading-tight">
              collaborate with {selectedCreative.display_name}
            </h4>
            <p className="font-fun italic text-xs text-black/80 leading-relaxed">
              State your intention clearly. Why do you want to collaborate with this creative?
            </p>

            {connectError && (
              <div className="p-2.5 bg-black text-[#dfa5a2] border border-black font-mono text-[10px]">
                {connectError}
              </div>
            )}

            {connectSuccess ? (
              <div className="py-6 text-center space-y-2">
                <span className="w-8 h-8 bg-black text-[#dfa5a2] border-[2px] border-black flex items-center justify-center mx-auto text-base font-bold">
                  ?
                </span>
                <p className="font-fun font-bold text-base text-black">
                  Dispatch Recorded
                </p>
                <p className="font-fun italic text-xs text-black/75">
                  Connection intent transmitted to creative.
                </p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedCreative || !connectMessage.trim()) return;
                  setSendingConnect(true);
                  setConnectError(null);
                  try {
                    await api.sendConnection(selectedCreative.user_id, connectMessage.trim());
                    setSentRequestIds(prev => new Set(prev).add(selectedCreative.user_id));
                    setConnectSuccess(true);
                    setTimeout(() => {
                      setConnectSuccess(false);
                      setConnectModalOpen(false);
                      setConnectMessage('');
                    }, 1400);
                  } catch (err: any) {
                    setConnectError(err.message || 'Failed to dispatch connection request');
                  } finally {
                    setSendingConnect(false);
                  }
                }}
                className="space-y-4"
              >
                <textarea
                  required
                  rows={3}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="e.g. I am directing an experimental short and admire your tape loop field audio. Would love to collaborate on sound design."
                  className="w-full bg-white border-[2px] border-black p-3 font-fun italic text-xs text-black focus:outline-none transition-colors resize-none"
                />

                <div className="flex items-center justify-between pt-2 border-t-[2px] border-black">
                  <button
                    type="button"
                    onClick={() => setConnectModalOpen(false)}
                    className="font-mono text-xs text-black/60 hover:text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingConnect || !connectMessage.trim()}
                    className="py-2 px-4 bg-black hover:bg-[#dfa5a2] hover:text-black border-[2px] border-black text-[#dfa5a2] font-mono text-xs uppercase font-bold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    {sendingConnect ? 'Dispatching...' : 'Send Request \u2192'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('src/components/map/HumanMap.tsx', humanMapCode);
console.log('Successfully updated src/components/map/HumanMap.tsx');
