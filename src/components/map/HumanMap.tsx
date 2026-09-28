import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Profile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MonogramSeal } from '../common/MonogramSeal';
import { X, Send, Compass, UserPlus, Check, Clock } from 'lucide-react';

interface HumanMapProps {
  onOpenProfile: (userId: string) => void;
}

export const HumanMap: React.FC<HumanMapProps> = ({ onOpenProfile }) => {
  const { user, profile } = useAuth();
  const [creatives, setCreatives] = useState<Profile[]>([]);
  const [selectedCreative, setSelectedCreative] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Connection dispatch & status
  const [existingConnections, setExistingConnections] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({});
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
  const [dragDistance, setDragDistance] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasCentered, setHasCentered] = useState(false);

  // Geographic coordinates for the current approved user
  const myLat = profile?.latitude || 19.0760;
  const myLng = profile?.longitude || 72.8777;

  useEffect(() => {
    loadCreatives();
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await api.getConnections();
      const map: Record<string, 'pending' | 'accepted' | 'declined'> = {};
      (data.connections || []).forEach((c: any) => {
        const partnerId = c.requester_id === user?.id ? c.recipient_id : c.requester_id;
        map[partnerId] = c.status;
      });
      setExistingConnections(map);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCreatives = async () => {
    setLoading(true);
    try {
      const data = await api.getCreatives();
      // Server strictly returns verified craft matches (peer, complementary, inquiry)
      setCreatives(data.creatives || []);
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

  // Helper to compute projected position with radial dispersion for co-located nodes
  const getCreativePos = (c: Profile, index: number, width: number, height: number) => {
    if (!c.latitude || !c.longitude) return { x: -999, y: -999 };
    const base = projectGeo(c.latitude, c.longitude, width, height);
    const myPos = projectGeo(myLat, myLng, width, height);

    // If candidate shares coordinates with YOU (within 25px)
    const distToMe = Math.hypot(base.x - myPos.x, base.y - myPos.y);
    if (distToMe < 30) {
      // Disperse radially around YOU so candidate is not swallowed or obscured
      const angle = (index * (Math.PI * 2 / Math.max(1, creatives.length))) + 0.6;
      return {
        x: base.x + Math.cos(angle) * 55,
        y: base.y + Math.sin(angle) * 55
      };
    }

    // Check if co-located with an earlier creative in the list
    for (let i = 0; i < index; i++) {
      const other = creatives[i];
      if (other.latitude && other.longitude) {
        const otherBase = projectGeo(other.latitude, other.longitude, width, height);
        if (Math.hypot(base.x - otherBase.x, base.y - otherBase.y) < 25) {
          const angle = (index * 1.8);
          return {
            x: base.x + Math.cos(angle) * 35,
            y: base.y + Math.sin(angle) * 35
          };
        }
      }
    }

    return base;
  };

  // Dynamic canvas resizing to fill container & center map on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
        if (!hasCentered) {
          const centerPanX = (width / 2) - ((myLng + 180) * (width / 360)) * zoom;
          const centerPanY = (height / 2) - (((-1 * myLat) + 90) * (height / 180)) * zoom;
          setPan({ x: centerPanX, y: centerPanY });
          setHasCentered(true);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [hasCentered, myLng, myLat, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulse = 0;

    const render = () => {
      pulse = (pulse + 0.04) % (Math.PI * 2);
      // 90s Broadsheet Newsprint Parchment Map Background
      ctx.fillStyle = '#fcfaf7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Graticules / Grid Lines (Subtle ink lines)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
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
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 1;
      const eq1 = projectGeo(0, -180, canvas.width, canvas.height);
      const eq2 = projectGeo(0, 180, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(eq1.x, eq1.y);
      ctx.lineTo(eq2.x, eq2.y);
      ctx.stroke();

      // Continents Abstract Outlines (Crisp Ivory Landmass with Stark Black Ink Outlines)
      ctx.fillStyle = '#fbf6f0';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
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

      // 1. Render YOU Dead-Center
      const myPos = projectGeo(myLat, myLng, canvas.width, canvas.height);

      // Radar pulse waves around YOU
      const myWave = 12 + Math.sin(pulse) * 4;
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, myWave, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center disc for YOU
      ctx.beginPath();
      ctx.arc(myPos.x, myPos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6A1A4C';
      ctx.stroke();

      // YOU Badge
      const myBadgeText = `YOU · ${(profile?.location || 'BASE').toUpperCase()}`;
      ctx.font = 'bold 9px "Space Mono", monospace';
      const myTextWidth = ctx.measureText(myBadgeText).width;
      ctx.fillStyle = '#000000';
      ctx.fillRect(myPos.x - myTextWidth / 2 - 4, myPos.y - 22, myTextWidth + 8, 14);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(myPos.x - myTextWidth / 2 - 4, myPos.y - 22, myTextWidth + 8, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(myBadgeText, myPos.x - myTextWidth / 2, myPos.y - 11);

      // 2. Render Verified Craft Matches
      creatives.forEach((c, index) => {
        if (!c.latitude || !c.longitude) return;
        const pos = getCreativePos(c, index, canvas.width, canvas.height);

        const isSelected = selectedCreative?.user_id === c.user_id;

        // Draw connection beam between YOU and candidate
        ctx.beginPath();
        ctx.setLineDash([2, 4]);
        ctx.moveTo(myPos.x, myPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = isSelected ? '#000000' : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Candidate Pulse wave
        const waveSize = 8 + Math.sin(pulse + 1) * 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, waveSize, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#000000' : 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node center
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#000000' : '#6A1A4C';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Compatibility Tag Stamp directly on map
        ctx.fillStyle = isSelected ? '#6A1A4C' : '#000000';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;

        const craftRole = (c.disciplines?.[0] || 'CREATIVE').toUpperCase();
        const pct = (c as any).match_percentage || 0;
        const badgeText = `${pct}% · ${craftRole}`;
        ctx.font = 'bold 9px "Space Mono", monospace';
        const textWidth = ctx.measureText(badgeText).width;

        const bx = pos.x + 8;
        const by = pos.y - 8;

        ctx.fillRect(bx - 2, by - 10, textWidth + 6, 14);
        ctx.strokeRect(bx - 2, by - 10, textWidth + 6, 14);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, bx + 1, by + 1);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [creatives, selectedCreative, zoom, pan, myLat, myLng, profile]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragDistance(0);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setDragDistance(d => d + Math.hypot(e.movementX, e.movementY));
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragDistance > 8) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let clicked: Profile | null = null;
    let minDist = 40;

    creatives.forEach((c, index) => {
      if (!c.latitude || !c.longitude) return;
      const pos = getCreativePos(c, index, canvas.width, canvas.height);
      const dist = Math.hypot(pos.x - clickX, pos.y - clickY);

      // Check both node center and badge bounds
      const inBadge = (
        clickX >= pos.x + 4 &&
        clickX <= pos.x + 130 &&
        clickY >= pos.y - 20 &&
        clickY <= pos.y + 14
      );

      if (dist < minDist || inBadge) {
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

  // Render the candidate dossier content
  const renderDossierCard = (creative: Creative) => {
    const connStatus = existingConnections[creative.user_id] || (sentRequestIds.has(creative.user_id) ? 'pending' : null);

    return (
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 border-b-[2px] border-black pb-3">
          <div className="flex items-start gap-3">
            {creative.avatar_url && creative.avatar_public !== 0 ? (
              <div className="w-12 h-12 border-[2px] border-black bg-black shrink-0 overflow-hidden">
                <img
                  src={creative.avatar_url}
                  alt={creative.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <MonogramSeal
                name={creative.display_name}
                disciplines={creative.disciplines}
                size="md"
              />
            )}
            <div>
              <h3 className="font-fun font-bold text-xl text-black leading-tight">
                {creative.display_name}
              </h3>
              <p className="font-mono text-xs text-black/70">
                {creative.location || 'Nomadic'} &middot; {creative.disciplines?.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCreative(null)}
            aria-label="Close dossier"
            className="p-1 border-[1.5px] border-black hover:bg-black hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verified Craft & Need Compatibility Banner */}
        <div className="p-3.5 bg-black text-white border-[2px] border-black flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#d8a29e] font-bold block">
              CRAFT &amp; NEED COMPATIBILITY
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono font-black text-xl text-white">
                {(creative as any).match_percentage || 0}%
              </span>
              <span className="font-mono text-[10px] text-white/80 uppercase font-bold">
                &middot; {creative.match_badge || 'CRAFT ALLY'}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#fbf6f0] font-bold px-2.5 py-1 bg-[#6A1A4C] border border-black uppercase">
            {creative.synergy_label || 'Direct Alignment'}
          </span>
        </div>

        {/* DETERMINISTIC MATCHING CRITERIA */}
        <div className="border-[2px] border-black bg-white p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/20 pb-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black">
              COMPATIBILITY BREAKDOWN (NON-AI)
            </span>
            <span className="font-mono text-[10px] text-[#6A1A4C] font-bold">
              {(creative as any).match_percentage || 0}% TOTAL
            </span>
          </div>
          <div className="space-y-2">
            {((creative as any).match_reasons || []).map((reason: any, idx: number) => (
              <div key={idx} className="border-b border-black/10 pb-1.5 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold uppercase text-black">
                    ✓ {reason.category}
                  </span>
                  {reason.score && (
                    <span className="font-mono text-[9px] font-bold text-[#6A1A4C] bg-[#6A1A4C]/10 px-1.5 py-0.5 border border-[#6A1A4C]/30">
                      {reason.score}
                    </span>
                  )}
                </div>
                <p className="font-fun italic text-xs text-black/85 mt-0.5">
                  {reason.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <p className="font-fun italic text-xs text-black leading-relaxed">
          "{creative.bio || 'Independent practitioner operating on Windervale.'}"
        </p>

        {/* Offerings & Seeking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {creative.offerings && (
            <div className="p-2 border-[1.5px] border-black bg-[#6A1A4C]/10">
              <span className="font-bold text-[9px] uppercase text-black block mb-0.5">CAN OFFER:</span>
              <p className="font-fun italic text-xs text-black">{creative.offerings}</p>
            </div>
          )}
          {creative.collaboration_interests && (
            <div className="p-2 border-[1.5px] border-black bg-white">
              <span className="font-bold text-[9px] uppercase text-black block mb-0.5">SEEKING:</span>
              <p className="font-fun italic text-xs text-black">{creative.collaboration_interests}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t-[2px] border-black">
          <button
            onClick={() => onOpenProfile(creative.user_id)}
            className="py-2.5 px-3 border-[2px] border-black bg-white text-black font-mono text-xs font-bold uppercase hover:bg-[#6A1A4C] hover:text-white transition-colors text-center cursor-pointer"
          >
            Full Dossier &rarr;
          </button>
          {connStatus === 'accepted' ? (
            <button
              disabled
              className="py-2.5 px-3 bg-[#fbf6f0] text-black border-[2px] border-black font-mono text-xs font-bold uppercase text-center cursor-default flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>FRIENDS</span>
            </button>
          ) : connStatus === 'pending' ? (
            <button
              disabled
              className="py-2.5 px-3 bg-black text-white border-[2px] border-black font-mono text-xs font-bold uppercase text-center cursor-default flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 stroke-[2] text-[#6A1A4C]" />
              <span>REQUEST PENDING</span>
            </button>
          ) : (
            <button
              onClick={() => setConnectModalOpen(true)}
              className="py-2.5 px-3 bg-[#6A1A4C] hover:bg-black text-white border-[2px] border-black font-mono text-xs font-bold uppercase text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2]" />
              <span>REQUEST FRIEND</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col md:flex-row bg-white select-none overflow-hidden">
      {/* LEFT / MAIN CARTOGRAPHY CANVAS COLUMN */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Folio Header (Bold border, no shadow) */}
        <div className="p-3 sm:p-4 bg-white border-b-[2.5px] border-black z-20 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-black font-bold">
                CARTOGRAPHY &middot; ACTIVE DIRECTORY
              </span>
              <h1 className="font-fun font-bold text-xl sm:text-2xl text-black lowercase leading-none mt-0.5">
                the human map
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetToMe}
                className="px-2.5 py-1 bg-black text-white font-mono text-[10px] font-bold uppercase border-[1.5px] border-black hover:bg-[#6A1A4C] cursor-pointer transition-colors"
              >
                Center on You
              </button>
              <div className="font-mono text-[10px] text-black font-bold bg-[#fbf6f0] border-[1.5px] border-black px-2.5 py-1">
                {creatives.length} {creatives.length === 1 ? 'Craft Match' : 'Craft Matches'}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State when no matches */}
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
                You are at the center of the sector ({profile?.location || 'Base'}). No other approved practitioners currently match your craft disciplines or active inquiries.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Map Canvas (100% full height & width) */}
        <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing bg-[#fcfaf7] overflow-hidden">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleCanvasClick}
            className="w-full h-full block touch-none"
          />

          {/* Map Zoom Controls (Bold border, no shadow) */}
          <div className="absolute right-3 bottom-20 md:bottom-6 z-20 flex flex-col gap-1 font-mono text-xs">
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
              aria-label="Zoom in"
              className="w-8 h-8 bg-black text-white border-[2px] border-black flex items-center justify-center font-bold cursor-pointer hover:bg-[#6A1A4C] transition-colors"
            >
              +
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.7, z - 0.2))}
              aria-label="Zoom out"
              className="w-8 h-8 bg-black text-white border-[2px] border-black flex items-center justify-center font-bold cursor-pointer hover:bg-[#6A1A4C] transition-colors"
            >
              -
            </button>
          </div>
        </div>

        {/* Mobile-Only Matched Peers Quick Strip (when dossier is closed on mobile) */}
        {!selectedCreative && creatives.length > 0 && (
          <div className="md:hidden absolute left-3 right-3 bottom-3 z-20 flex gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
            {creatives.map((c, idx) => (
              <button
                key={c.user_id || idx}
                onClick={() => setSelectedCreative(c)}
                className="shrink-0 px-3 py-2 bg-[#fbf6f0] hover:bg-white text-black border-[2px] border-black flex items-center gap-2 cursor-pointer transition-colors shadow-none"
              >
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#6A1A4C] text-white border border-black">
                  {(c as any).match_percentage || 0}%
                </span>
                <span className="font-fun font-bold text-xs">
                  {c.display_name}
                </span>
                <span className="font-mono text-[9px] text-black/60 uppercase">
                  &middot; {c.disciplines?.[0] || 'Craft'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Mobile-Only Bottom Drawer (when dossier is open on mobile) */}
        {selectedCreative && (
          <div className="md:hidden absolute bottom-2 left-2 right-2 z-30 bg-[#fbf6f0] border-[2.5px] border-black p-5 max-h-[75vh] overflow-y-auto">
            {renderDossierCard(selectedCreative)}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR (Desktop Only): Persistent Dossier & Matched Peers Roster */}
      <div className="hidden md:flex flex-col w-80 lg:w-96 bg-[#fbf6f0] border-l-[2.5px] border-black overflow-y-auto h-full p-4 sm:p-5 shrink-0">
        {selectedCreative ? (
          <div>
            <div className="font-mono text-[10px] font-bold text-black uppercase tracking-widest pb-2 border-b-[2px] border-black mb-4 flex items-center justify-between">
              <span>SELECTED PRACTITIONER</span>
              <button
                onClick={() => setSelectedCreative(null)}
                className="text-xs hover:underline cursor-pointer"
              >
                &larr; View All Matches
              </button>
            </div>
            {renderDossierCard(selectedCreative)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b-[2px] border-black pb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-black font-black block">
                PRACTITIONER DIRECTORY
              </span>
              <h2 className="font-fun font-bold text-xl text-black lowercase leading-tight mt-0.5">
                matched craft peers
              </h2>
              <p className="font-fun italic text-xs text-black/75 mt-1">
                Approved practitioners matching your craft disciplines and studio production needs.
              </p>
            </div>

            {creatives.length === 0 ? (
              <div className="p-6 text-center border-[2px] border-black bg-white space-y-2">
                <p className="font-fun italic text-xs text-black/70">
                  No other approved practitioners match your craft disciplines or active inquiries at this coordinate.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {creatives.map((c) => (
                  <div
                    key={c.user_id}
                    onClick={() => setSelectedCreative(c)}
                    className="p-3 bg-white border-[2px] border-black hover:bg-[#6A1A4C]/10 cursor-pointer transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <MonogramSeal name={c.display_name} disciplines={c.disciplines} size="sm" />
                        <div>
                          <h4 className="font-fun font-bold text-sm text-black leading-tight">
                            {c.display_name}
                          </h4>
                          <span className="font-mono text-[10px] text-black/60">
                            {c.location || 'Nomadic'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#6A1A4C] text-white border border-black">
                          {(c as any).match_percentage || 0}%
                        </span>
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-black text-white border border-black uppercase tracking-wider">
                          {c.match_badge || 'CRAFT ALLY'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs">
                      <span className="font-mono text-[9px] uppercase text-black font-bold">
                        {c.disciplines?.[0] || 'Craft'}
                      </span>
                      <span className="font-mono text-[10px] text-[#6A1A4C] font-bold uppercase hover:underline">
                        Inspect Dossier &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Friend Request Dispatch Modal */}
      {connectModalOpen && selectedCreative && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#fbf6f0] border-[2.5px] border-black p-6 space-y-4">
            <div className="flex items-center justify-between border-b-[2px] border-black pb-2">
              <span className="font-mono text-[10px] uppercase text-black font-bold tracking-widest flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                REQUEST FRIEND
              </span>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="p-1 border border-black hover:bg-black hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-fun font-bold text-lg text-black lowercase leading-tight">
              connect with {selectedCreative.display_name}
            </h4>
            <p className="font-fun italic text-xs text-black/80 leading-relaxed">
              Send a craft-aligned friend request ({profile?.disciplines?.[0] || 'Creative'} &times; {selectedCreative.disciplines?.[0] || 'Creative'}).
            </p>

            {connectError && (
              <div className="p-2.5 bg-black text-white border border-black font-mono text-[10px]">
                {connectError}
              </div>
            )}

            {connectSuccess ? (
              <div className="py-6 text-center space-y-2">
                <span className="w-8 h-8 bg-[#6A1A4C] text-white border-[2px] border-black flex items-center justify-center mx-auto text-base font-bold">
                  ✓
                </span>
                <p className="font-fun font-bold text-base text-black">
                  Friend Request Sent
                </p>
                <p className="font-fun italic text-xs text-black/75">
                  Your invitation has been transmitted to {selectedCreative.display_name}.
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
                    setExistingConnections(prev => ({ ...prev, [selectedCreative.user_id]: 'pending' }));
                    setConnectSuccess(true);
                    setTimeout(() => {
                      setConnectSuccess(false);
                      setConnectModalOpen(false);
                      setConnectMessage('');
                    }, 1400);
                  } catch (err: any) {
                    setConnectError(err.message || 'Failed to send friend request');
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
                  placeholder={`e.g. I admire your work in ${selectedCreative.disciplines?.[0] || 'your craft'} and would love to connect as friends and collaborate.`}
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
                    className="py-2 px-4 bg-black hover:bg-[#6A1A4C] hover:text-white border-[2px] border-black text-white font-mono text-xs uppercase font-bold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    {sendingConnect ? 'Sending...' : 'SEND FRIEND REQUEST \u2192'}
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
