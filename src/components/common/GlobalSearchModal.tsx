import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Search, X, User, FolderKanban, BookOpen, Banknote, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (type: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    creatives: any[];
    projects: any[];
    library: any[];
    fund: any[];
  }>({ creatives: [], projects: [], library: [], fund: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ creatives: [], projects: [], library: [], fund: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ creatives: [], projects: [], library: [], fund: [] });
        return;
      }
      setLoading(true);
      try {
        const data = await api.searchAll(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.creatives.length + results.projects.length + results.library.length + results.fund.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-wv-black/80 backdrop-blur-sm animate-editorial-fade">
      <div className="w-full max-w-3xl bg-wv-charcoal border-2 border-wv-paper  overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-wv-border bg-wv-slate">
          <Search className="w-5 h-5 text-wv-dustyrose" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creatives, projects, library essays, funding..."
            className="flex-1 bg-transparent text-wv-paper placeholder-wv-dust font-mono text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-wv-dust hover:text-wv-paper">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="font-mono text-[10px] bg-wv-surface px-2 py-1 border border-wv-border text-wv-dust">ESC</kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-8 text-center font-mono text-xs text-wv-dust animate-pulse">
              SEARCHING ARCHIVES...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-12 text-center">
              <p className="font-display text-xl text-wv-paper">NO MATCHES FOUND</p>
              <p className="font-mono text-xs text-wv-dust mt-1">Try searching by discipline (e.g. "Filmmaker"), medium, or city.</p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-wv-dust font-mono text-xs">
              TYPE TO SEARCH ACROSS WINDERVALE OPERATING NETWORK
            </div>
          )}

          {/* Creatives */}
          {results.creatives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-wv-border">
                <User className="w-3.5 h-3.5 text-wv-pink" />
                <span className="font-mono text-xs uppercase tracking-wider text-wv-dust">CREATIVE DOSSIERS [{results.creatives.length}]</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.creatives.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectResult('profile', c.id)}
                    className="flex items-center gap-3 p-2.5 bg-wv-surface border border-wv-border hover:border-wv-pink text-left transition-all group"
                  >
                    <img src={c.avatar_url} alt={c.name} className="w-10 h-10 object-cover grayscale group-hover:grayscale-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-wv-paper truncate">{c.name}</p>
                      <p className="font-mono text-[10px] text-wv-pink truncate">
                        {c.disciplines?.join(' • ') || 'Creative'}
                      </p>
                      <p className="font-mono text-[9px] text-wv-dust truncate">{c.location}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-wv-dust group-hover:text-wv-pink group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-wv-border">
                <FolderKanban className="w-3.5 h-3.5 text-wv-dustyrose" />
                <span className="font-mono text-xs uppercase tracking-wider text-wv-dust">PROJECT WORKSPACES [{results.projects.length}]</span>
              </div>
              <div className="space-y-2">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectResult('workspace', p.id)}
                    className="w-full flex items-center justify-between p-3 bg-wv-surface border border-wv-border hover:border-wv-dustyrose text-left transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-wv-black text-wv-dustyrose border border-wv-border">
                          {p.project_type}
                        </span>
                        <span className="font-display font-bold text-sm text-wv-paper">{p.title}</span>
                      </div>
                      <p className="font-serif text-xs text-wv-dust line-clamp-1 mt-1">{p.description}</p>
                    </div>
                    <span className="font-mono text-[10px] text-wv-dust group-hover:text-wv-paper">OPEN ↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Library */}
          {results.library.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-wv-border">
                <BookOpen className="w-3.5 h-3.5 text-wv-dirtywhite" />
                <span className="font-mono text-xs uppercase tracking-wider text-wv-dust">LIBRARY PUBLISHING [{results.library.length}]</span>
              </div>
              <div className="space-y-2">
                {results.library.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onSelectResult('library', l.id)}
                    className="w-full flex items-center justify-between p-3 bg-wv-surface border border-wv-border hover:border-wv-dirtywhite text-left transition-all group"
                  >
                    <div>
                      <span className="font-mono text-[9px] uppercase text-wv-dust">[{l.category}]</span>
                      <p className="font-serif font-bold text-sm text-wv-paper">{l.title}</p>
                      <p className="font-mono text-[10px] text-wv-dust">by {l.author_name} • {l.reading_time}</p>
                    </div>
                    <span className="font-mono text-[10px] text-wv-dust group-hover:text-wv-paper">READ ↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fund */}
          {results.fund.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-wv-border">
                <Banknote className="w-3.5 h-3.5 text-wv-dustyrose" />
                <span className="font-mono text-xs uppercase tracking-wider text-wv-dust">FUNDING OPPORTUNITIES [{results.fund.length}]</span>
              </div>
              <div className="space-y-2">
                {results.fund.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onSelectResult('fund', f.id)}
                    className="w-full flex items-center justify-between p-3 bg-wv-surface border border-wv-border hover:border-wv-dustyrose text-left transition-all group"
                  >
                    <div>
                      <p className="font-display font-bold text-sm text-wv-paper">{f.title}</p>
                      <p className="font-mono text-[10px] text-wv-dust">{f.funder_name} • ₹{f.grant_amount.toLocaleString()}</p>
                    </div>
                    <span className="font-mono text-[10px] text-wv-dustyrose">APPLY ↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
