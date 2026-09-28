import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Connection } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MonogramSeal } from '../common/MonogramSeal';
import { Check, X, MessageSquare, Send, Users } from 'lucide-react';

interface ConnectionsViewProps {
  onOpenProfile: (userId: string) => void;
  onOpenProjects: () => void;
  onOpenMap?: () => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  onOpenProfile,
  onOpenProjects,
  onOpenMap,
}) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  // Conversation state
  const [activeConversation, setActiveConversation] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await api.getConnections();
      setConnections(data.connections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.acceptConnection(id);
      loadConnections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api.declineConnection(id);
      loadConnections();
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (conn: Connection) => {
    setActiveConversation(conn);
    try {
      const data = await api.getConnectionMessages(conn.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const data = await api.sendConnectionMessage(activeConversation.id, newMessage.trim());
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  const pendingReceived = connections.filter(c => c.status === 'pending' && c.recipient_id === user?.id);
  const pendingSent = connections.filter(c => c.status === 'pending' && c.requester_id === user?.id);
  const accepted = connections.filter(c => c.status === 'accepted');
  // Reusable conversation thread component
  const renderConversationThread = (conn: Connection, isInline: boolean = false) => {
    return (
      <div className={`w-full bg-[#fbf6f0] border-[2.5px] border-black p-4 flex flex-col ${isInline ? 'h-full min-h-[600px]' : 'h-[75vh]'}`}>
        <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <MonogramSeal name={conn.partner_name || 'Creative'} size="sm" />
            <div>
              <h3 className="font-fun font-bold text-base text-black">{conn.partner_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[9px] text-[#3b0764] bg-[#f3e8ff] border border-[#581c87] px-1.5 py-0.2 font-bold uppercase">
                  ACTIVE ALLY THREAD
                </span>
                <span className="font-mono text-[10px] text-black/60">
                  {conn.partner_disciplines?.join(', ')}
                </span>
              </div>
            </div>
          </div>
          {!isInline && (
            <button
              onClick={() => setActiveConversation(null)}
              className="text-black hover:bg-black hover:text-white p-1 border border-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-3 bg-white border-[2px] border-black mb-3 text-xs">
          <div className="p-3 bg-[#6A1A4C]/10 border-l-[3px] border-black text-black/85 text-xs mb-3">
            <span className="font-bold text-black block font-mono text-[9px] uppercase mb-0.5">ORIGINAL INTENT &middot; {new Date(conn.created_at).toLocaleDateString()}</span>
            "{conn.message}"
          </div>

          {messages.length === 0 ? (
            <p className="font-fun italic text-xs text-black/60 text-center py-8">
              No additional notes dispatched yet. Begin your collaborative exchange below.
            </p>
          ) : (
            messages.map(m => {
              const isMe = m.sender_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="font-mono text-[8px] text-black/60 font-bold mb-0.5">{m.sender_name}</span>
                  <div className={`p-2.5 max-w-[80%] font-fun leading-relaxed ${
                    isMe ? 'bg-black text-white border-[2px] border-black' : 'bg-[#fbf6f0] text-black border-[2px] border-black'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            required
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write collaboration note or project inquiry..."
            className="flex-1 bg-white border-[2px] border-black px-3 py-2 text-xs text-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={sendingMsg || !newMessage.trim()}
            className="px-4 py-2 bg-[#3b0764] hover:bg-[#581c87] text-[#f3e8ff] border-[2px] border-black font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SEND NOTE</span>
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white min-h-full text-black">
      {/* Broadsheet Top Header */}
      <div className="border-b-[2.5px] border-black pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-black font-black block">
              COLLABORATIVE NETWORK &middot; ACTIVE ALLIES
            </span>
            <h1 className="font-fun font-bold text-2xl sm:text-3xl text-black tracking-tight mt-0.5 lowercase">
              network &amp; allies
            </h1>
            <p className="font-fun italic text-xs sm:text-sm text-black/75 mt-1">
              Intentional relationships between verified independent practitioners.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#fbf6f0] border-[1.5px] border-black">
              {accepted.length} {accepted.length === 1 ? 'Connected Ally' : 'Connected Allies'}
            </span>
            {pendingReceived.length > 0 && (
              <span className="font-mono text-[10px] font-bold px-2.5 py-1 bg-[#3b0764] text-[#f3e8ff] border-[1.5px] border-black">
                {pendingReceived.length} Action Required
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-black/60 animate-pulse font-bold">
          Retrieving active connections...
        </div>
      ) : connections.length === 0 ? (
        /* Literary Empty State */
        <div className="py-16 px-6 text-center border-[2.5px] border-black bg-[#fbf6f0] space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 border-[2px] border-black bg-black flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-[#6A1A4C] stroke-[2]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-fun font-bold text-2xl text-black lowercase">
              no connections yet
            </h3>
            <p className="font-fun text-sm text-black/80 italic max-w-sm mx-auto leading-relaxed">
              Discover compatible practitioners on the Human Map and establish direct creative alliances.
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={onOpenMap}
              className="py-3 px-6 bg-black hover:bg-[#6A1A4C] hover:text-white text-white font-mono text-xs tracking-wider uppercase font-bold border-[2px] border-black cursor-pointer transition-colors"
            >
              Discover on the Map &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* 2-Column Responsive Broadsheet Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Roster (Pending & Connected) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6">
            {/* SECTION: PENDING */}
            {(pendingReceived.length > 0 || pendingSent.length > 0) && (
              <div className="space-y-3">
                <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider block border-b-[2px] border-black pb-1">
                  PENDING REQUESTS [{pendingReceived.length + pendingSent.length}]
                </span>

                {/* Pending Received */}
                {pendingReceived.map(c => (
                  <div key={c.id} className="p-4 bg-[#fbf6f0] border-[2.5px] border-black space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <MonogramSeal name={c.partner_name || 'Creative'} disciplines={c.partner_disciplines} size="sm" />
                        <div>
                          <h4 className="font-fun font-bold text-base text-black">{c.partner_name}</h4>
                          <p className="font-fun italic text-xs text-black/70">{c.partner_disciplines?.join(', ')}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-[#6A1A4C] text-[#f3e8ff] font-bold border border-black">
                        Review Required
                      </span>
                    </div>
                    <div className="p-3 bg-white border-l-[3px] border-black text-xs font-fun text-black/90 italic leading-relaxed">
                      "{c.message}"
                    </div>
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        onClick={() => handleDecline(c.id)}
                        className="px-3 py-1.5 border-[1.5px] border-black text-black/70 hover:text-black text-xs font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => handleAccept(c.id)}
                        className="px-4 py-1.5 bg-black text-white font-black text-xs font-mono tracking-wider uppercase border-[2px] border-black hover:bg-[#6A1A4C] cursor-pointer transition-colors"
                      >
                        Accept &rarr;
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pending Sent */}
                {pendingSent.map(c => (
                  <div key={c.id} className="p-4 bg-[#fbf6f0] border-[2px] border-black space-y-2.5 opacity-90">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <MonogramSeal name={c.partner_name || 'Creative'} disciplines={c.partner_disciplines} size="sm" />
                        <div>
                          <h4 className="font-fun font-bold text-sm text-black">{c.partner_name}</h4>
                          <p className="font-fun italic text-xs text-black/70">{c.partner_disciplines?.join(', ')}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-black text-black/70 font-bold">
                        Awaiting Response
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION: ALLIES & ACTIVE COLLABORATORS */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-black font-black uppercase tracking-wider block border-b-[2px] border-black pb-1">
                ACTIVE ALLIES [{connected.length}]
              </span>

              {connected.length === 0 ? (
                <div className="p-4 bg-[#fbf6f0] border-[2px] border-black font-fun italic text-xs text-black/70 text-center">
                  No active allies yet. Accept incoming requests or dispatch invitations from the Human Map.
                </div>
              ) : (
                connected.map(c => {
                  const isSelected = activeConversation?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 border-[2.5px] border-black transition-colors space-y-3 ${
                        isSelected ? 'bg-black text-white' : 'bg-[#fbf6f0] text-black hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <MonogramSeal name={c.partner_name || 'Creative'} disciplines={c.partner_disciplines} size="sm" />
                          <div>
                            <h4 className={`font-fun font-bold text-base ${isSelected ? 'text-white' : 'text-black'}`}>{c.partner_name}</h4>
                            <p className={`font-fun italic text-xs ${isSelected ? 'text-white/70' : 'text-black/70'}`}>{c.partner_disciplines?.join(', ')}</p>
                          </div>
                        </div>
                        <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 border font-bold ${
                          isSelected ? 'border-white text-white' : 'border-black text-black'
                        }`}>
                          ALLY
                        </span>
                      </div>

                      {c.partner_location && (
                        <p className={`font-mono text-[10px] ${isSelected ? 'text-white/60' : 'text-black/60'}`}>
                          Base: {c.partner_location}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-black/15">
                        <span className={`font-mono text-[9px] ${isSelected ? 'text-white/60' : 'text-black/60'}`}>
                          Connected {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenProfile(c.partner_id || c.recipient_id)}
                            className={`px-2.5 py-1 font-mono font-bold text-xs uppercase tracking-wider hover:underline cursor-pointer ${
                              isSelected ? 'text-white' : 'text-black'
                            }`}
                          >
                            Dossier &rarr;
                          </button>
                          <button
                            onClick={() => openChat(c)}
                            className={`px-3 py-1 border-[2px] border-black text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#6A1A4C] text-white hover:bg-white hover:text-black'
                                : 'bg-black text-white hover:bg-[#6A1A4C]'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop): Inline Persistent Conversation Thread */}
          <div className="hidden md:block md:col-span-6 lg:col-span-7 sticky top-24">
            {activeConversation ? (
              renderConversationThread(activeConversation, true)
            ) : (
              <div className="h-full min-h-[500px] border-[2.5px] border-black bg-[#fbf6f0] p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 border-[2px] border-black bg-white flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-fun font-bold text-xl text-black lowercase">
                  collaboration exchange
                </h3>
                <p className="font-fun italic text-xs text-black/75 max-w-xs leading-relaxed">
                  Select any connected ally on the left to open their collaboration thread, view original intent, and dispatch archival notes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE ONLY: Conversation Modal */}
      {activeConversation && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3">
          {renderConversationThread(activeConversation, false)}
        </div>
      )}
    </div>
  );
};
