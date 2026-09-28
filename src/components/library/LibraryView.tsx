import React, { useState, useEffect } from 'react';
import { LibraryArticle } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Clock, Search, X, Tag, ArrowRight, User } from 'lucide-react';

interface LibraryViewProps {
  onOpenProfile: (userId: string) => void;
}

const CATEGORIES = ['ALL', 'essay', 'manifesto', 'research', 'interview', 'poetry', 'photography'];

export const LibraryView: React.FC<LibraryViewProps> = ({ onOpenProfile }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<LibraryArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<LibraryArticle | null>(null);
  const [submitModal, setSubmitModal] = useState(false);

  // Submit form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'essay' | 'interview' | 'poetry' | 'photography' | 'research' | 'manifesto'>('essay');
  const [content, setContent] = useState('');
  const [readingTime, setReadingTime] = useState('5 min read');
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [activeCategory, searchQuery]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const catParam = activeCategory === 'ALL' ? undefined : activeCategory;
      const data = await api.getArticles(catParam, searchQuery || undefined);
      setArticles(data.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.createArticle({
        title,
        subtitle,
        category,
        content,
        reading_time: readingTime,
        tags
      });
      setTitle('');
      setSubtitle('');
      setContent('');
      setTagInput('');
      setSubmitModal(false);
      loadArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to submit article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Editorial Masthead Header */}
      <div className="border-b-2 border-wv-paper pb-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-wv-pink">INDEPENDENT PUBLISHING SPACE</span>
            <h1 className="font-display font-black text-5xl sm:text-6xl text-wv-paper tracking-tight mt-1">
              THE LIBRARY
            </h1>
            <p className="font-serif italic text-base text-wv-dirtywhite mt-2 max-w-2xl leading-relaxed">
              Essays on analogue materiality, acoustic research, manifestos, poetry, and experimental cinema archives.
            </p>
          </div>

          <button
            onClick={() => setSubmitModal(true)}
            className="btn-editorial text-xs px-5 py-3 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>SUBMIT MANIFESTO / ESSAY ↗</span>
          </button>
        </div>
      </div>

      {/* Category & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-wv-border">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs px-3 py-1 border transition-all uppercase whitespace-nowrap ${
                activeCategory === cat
                  ? 'border-wv-paper bg-wv-paper text-wv-black font-bold'
                  : 'border-wv-border text-wv-dust hover:text-wv-paper'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications..."
            className="bg-wv-surface border border-wv-border pl-8 pr-3 py-1 font-mono text-xs text-wv-paper placeholder-wv-dust focus:outline-none focus:border-wv-paper w-48 sm:w-64"
          />
          <Search className="w-3.5 h-3.5 text-wv-dust absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Articles Grid: Broadsheet / Editorial Magazine Layout */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-wv-dust animate-pulse">
          READING LIBRARY ARCHIVE...
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-wv-border p-8">
          <p className="font-display font-bold text-xl text-wv-paper">NO ARTICLES FOUND IN THIS CATEGORY</p>
          <button
            onClick={() => setSubmitModal(true)}
            className="btn-editorial mt-4 text-xs px-5 py-2"
          >
            SUBMIT FIRST ESSAY ↗
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, index) => (
            <article
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className={`cursor-pointer group flex flex-col justify-between p-6 bg-wv-charcoal border border-wv-border hover:border-wv-paper transition-all ${
                index === 0 ? 'md:col-span-2 md:grid md:grid-cols-2 md:gap-8 items-stretch' : ''
              }`}
            >
              <div>
                {/* Optional Hero Image for first item */}
                {index === 0 && art.cover_image && (
                  <div className="h-64 md:h-full w-full bg-wv-slate overflow-hidden border border-wv-border mb-4 md:mb-0">
                    <img
                      src={art.cover_image}
                      alt={art.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="stamp bg-wv-surface border border-wv-border text-wv-dustyrose text-[9px] uppercase">
                    [{art.category}]
                  </span>
                  <span className="font-mono text-[10px] text-wv-dust flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.reading_time}
                  </span>
                </div>

                <h2 className="font-display font-black text-2xl group-hover:text-wv-pink transition-colors leading-tight">
                  {art.title}
                </h2>

                {art.subtitle && (
                  <p className="font-serif italic text-sm text-wv-dirtywhite/90 mt-2 leading-relaxed">
                    {art.subtitle}
                  </p>
                )}

                <p className="font-serif text-xs text-wv-dust line-clamp-3 mt-3 leading-relaxed">
                  {art.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-wv-border/60 flex items-center justify-between font-mono text-[10px] text-wv-dust">
                <span>BY {art.author_name.toUpperCase()}</span>
                <span className="group-hover:translate-x-1 transition-transform text-wv-paper">
                  READ ARTICLE ↗
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-wv-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-editorial-fade">
          <div className="w-full max-w-3xl bg-wv-charcoal border-2 border-wv-paper p-6 sm:p-12 max-h-[90vh] overflow-y-auto  relative film-grain">
            <div className="flex items-center justify-between border-b border-wv-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="stamp bg-wv-surface border border-wv-border text-wv-dustyrose text-[9px] uppercase">
                  [{selectedArticle.category}]
                </span>
                <span className="font-mono text-xs text-wv-dust">
                  {selectedArticle.reading_time} • {selectedArticle.published_at}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="font-mono text-xs text-wv-dust hover:text-wv-paper"
              >
                [ CLOSE ✕ ]
              </button>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-wv-paper tracking-tight leading-tight">
              {selectedArticle.title}
            </h1>

            {selectedArticle.subtitle && (
              <p className="font-serif italic text-lg text-wv-dirtywhite mt-3 leading-relaxed border-l-2 border-wv-pink pl-4 py-1">
                {selectedArticle.subtitle}
              </p>
            )}

            <div className="flex items-center gap-3 my-6 py-3 border-y border-wv-border font-mono text-xs text-wv-dust">
              <span>WRITTEN BY:</span>
              <strong className="text-wv-paper">{selectedArticle.author_name}</strong>
              {selectedArticle.author_id && (
                <button
                  onClick={() => {
                    const id = selectedArticle.author_id;
                    setSelectedArticle(null);
                    onOpenProfile(id!);
                  }}
                  className="text-wv-pink hover:underline text-[10px]"
                >
                  [ VIEW DOSSIER ↗ ]
                </button>
              )}
            </div>

            {selectedArticle.cover_image && (
              <div className="my-6 max-h-80 w-full overflow-hidden border border-wv-border">
                <img
                  src={selectedArticle.cover_image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
            )}

            <div className="prose prose-invert font-serif text-base text-wv-paper/90 whitespace-pre-line leading-relaxed space-y-4">
              {selectedArticle.content}
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-wv-border flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag: string) => (
                  <span key={tag} className="font-mono text-[10px] text-wv-dust bg-wv-black px-2 py-0.5 border border-wv-border">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-wv-border flex justify-between font-mono text-xs text-wv-dust">
              <span>WINDERVALE LIBRARY ARCHIVE</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="btn-editorial text-xs px-4 py-1.5"
              >
                RETURN TO INDEX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Article Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 bg-wv-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-wv-charcoal border-2 border-wv-paper p-6 sm:p-8  max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-wv-border pb-3 mb-4">
              <h3 className="font-display font-bold text-xl text-wv-paper">SUBMIT TO WINDERVALE LIBRARY</h3>
              <button onClick={() => setSubmitModal(false)} className="text-wv-dust hover:text-wv-paper">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Ethics of Grain: Why Celluloid Still Refuses to Die"
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-display font-bold text-base text-wv-paper focus:outline-none focus:border-wv-paper"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Subtitle / Abstract</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A reflection on physical medium permanence and tactile print processes."
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-serif italic text-xs text-wv-paper focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Format</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-wv-surface border border-wv-border px-2.5 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  >
                    <option value="essay">ESSAY</option>
                    <option value="manifesto">MANIFESTO</option>
                    <option value="research">CREATIVE RESEARCH</option>
                    <option value="interview">INTERVIEW</option>
                    <option value="poetry">POETRY / VERSE</option>
                    <option value="photography">PHOTO ESSAY</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Est. Reading Time</label>
                  <input
                    type="text"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Essay Content (Markdown supported)</label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your reflection, manifesto, or critical interview..."
                  className="w-full bg-wv-surface border border-wv-border p-3 font-serif text-sm text-wv-paper focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-wv-dust mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Celluloid, 16mm, Acoustics, Materiality"
                  className="w-full bg-wv-surface border border-wv-border px-3 py-2 font-mono text-xs text-wv-paper focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-wv-border">
                <button
                  type="button"
                  onClick={() => setSubmitModal(false)}
                  className="font-mono text-xs text-wv-dust hover:text-wv-paper"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-editorial text-xs px-6 py-2.5"
                >
                  {submitting ? 'PUBLISHING...' : 'PUBLISH TO LIBRARY ↗'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
