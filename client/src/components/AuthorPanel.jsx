import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Edit3, Trash2, BookOpen, PenTool, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import uploadService from '../services/uploadService';

export default function AuthorPanel({ isOpen, onClose }) {
  const { user, posts, addPost, updatePost, deletePost } = useApp();
  
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'list' | 'write'
  const [editingPost, setEditingPost] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SCIENCE');
  const [image, setImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [readTime, setReadTime] = useState('5 MIN READ');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Categories list
  const categories = ['CULTURE', 'ECONOMY', 'POLITICS', 'SCIENCE', 'TECHNOLOGY', 'TRAVEL', 'WORLD'];

  // Default suggested cover images
  const suggestedImages = [
    { name: 'City & Life', url: '/city_woman.png' },
    { name: 'Nature & Glacier', url: '/ocean.png' },
    { name: 'Bitcoin & Cryptocurr.', url: '/bitcoin.png' },
    { name: 'Harbor Shipping', url: '/harbor.png' },
    { name: 'Space Cosmos', url: '/hero_bg.png' }
  ];

  // Load editing post data if in edit mode
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setCategory(editingPost.category || 'SCIENCE');
      setImage(editingPost.image || '');
      setExcerpt(editingPost.excerpt || '');
      setReadTime(editingPost.readTime || '5 MIN READ');
      setContent(editingPost.content || '');
      setActiveTab('write');
      setErrorMsg('');
    }
  }, [editingPost]);

  // Reset form when switching to create mode
  const handleNewPostClick = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('SCIENCE');
    setImage('/hero_bg.png'); // Default value
    setExcerpt('');
    setReadTime('5 MIN READ');
    setContent('');
    setActiveTab('write');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Filter posts by active user — must be before early return (Rules of Hooks)
  const authorPosts = posts.filter(
    (post) =>
      post.authorUsername === user?.username ||
      post.author?.toLowerCase() === user?.name?.toLowerCase()
  );

  // ── Statistics derived values (all before early return) ────
  const totalArticles = authorPosts.length;
  const totalAllArticles = posts.length;

  const categoryCount = authorPosts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  const avgReadMinutes = useMemo(() => {
    const nums = authorPosts.map(p => parseInt(p.readTime) || 0).filter(n => n > 0);
    if (!nums.length) return 0;
    return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
  }, [authorPosts]);

  const sharePercent = totalAllArticles
    ? Math.round((totalArticles / totalAllArticles) * 100)
    : 0;

  const catMax = topCategory ? topCategory[1] : 1;
  const categoryBars = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Close panel on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      setErrorMsg('Please fill in the required fields (Title, Excerpt, and Content).');
      return;
    }

    // Convert standard plain text line breaks to HTML paragraphs for the ArticlePage
    let formattedContent = content;
    if (!content.includes('<p>')) {
      formattedContent = content
        .split('\n\n')
        .filter(p => p.trim() !== '')
        .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('\n');
    }

    const postData = {
      title,
      category,
      image: image.trim() || '/hero_bg.png',
      excerpt,
      readTime,
      content: formattedContent
    };

    if (editingPost) {
      updatePost(editingPost.id, postData);
      setSuccessMsg('Article updated successfully!');
      setTimeout(() => {
        setEditingPost(null);
        setActiveTab('list');
        setSuccessMsg('');
      }, 1000);
    } else {
      addPost(postData);
      setSuccessMsg('Article published successfully!');
      setTimeout(() => {
        setActiveTab('list');
        setSuccessMsg('');
      }, 1000);
    }
  };

  const handleDeleteClick = (postId) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      deletePost(postId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Drawer Body Container */}
      <div className="relative w-full max-w-3xl bg-neutral-900 border-l border-neutral-850 text-white shadow-2xl h-full flex flex-col z-10 animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2.5">
              <PenTool size={20} className="text-neutral-300" />
              <span>Author Panel</span>
            </h2>
            <p className="text-[10px] text-neutral-400 font-sans tracking-wider uppercase font-bold">
              Logged in as: <span className="text-white">{user?.name} (@{user?.username})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-850 rounded-full transition-colors text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Tabs Row */}
        <div className="flex bg-neutral-950 border-b border-neutral-800 px-6 py-2 overflow-x-auto">
          {/* Stats Tab */}
          <button
            onClick={() => { setActiveTab('stats'); setEditingPost(null); }}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 size={14} />
            <span>Statistics</span>
          </button>

          {/* My Articles Tab */}
          <button
            onClick={() => { setActiveTab('list'); setEditingPost(null); }}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'list' && !editingPost
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>My Articles ({authorPosts.length})</span>
          </button>
          
          {/* Write Tab */}
          <button
            onClick={handleNewPostClick}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'write' && !editingPost
                ? 'border-white text-white'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus size={14} />
            <span>Write Article</span>
          </button>

          {editingPost && (
            <span className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-orange-400 border-b-2 border-orange-400 flex items-center gap-2 whitespace-nowrap">
              <Edit3 size={14} />
              <span>Editing Article</span>
            </span>
          )}
        </div>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-800/60 p-4 text-xs text-red-300">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-950/40 border border-green-800/60 p-4 text-xs text-green-300">
              {successMsg}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* VIEW: STATISTICS                                              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'stats' && (
            <div className="space-y-6">

              {/* Welcome banner */}
              <div className="bg-neutral-950 border border-neutral-800 p-5">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Author Overview</p>
                <h3 className="text-xl font-bold text-white font-serif">{user?.name}</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">@{user?.username} · {user?.email}</p>
              </div>

              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Articles', value: totalArticles, sub: 'published' },
                  { label: 'Blog Share', value: `${sharePercent}%`, sub: `of ${totalAllArticles} total` },
                  { label: 'Avg Read Time', value: avgReadMinutes ? `${avgReadMinutes} min` : '—', sub: 'per article' },
                  { label: 'Categories', value: Object.keys(categoryCount).length, sub: 'covered' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-neutral-950 border border-neutral-800 p-4 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">{kpi.label}</span>
                    <span className="text-2xl font-black text-white leading-none">{kpi.value}</span>
                    <span className="text-[9px] text-neutral-600">{kpi.sub}</span>
                  </div>
                ))}
              </div>

              {/* Category Breakdown Bar Chart */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Articles by Category</h4>

                {categoryBars.length === 0 ? (
                  <p className="text-neutral-600 text-xs font-serif">No articles published yet.</p>
                ) : (
                  <div className="space-y-3">
                    {categoryBars.map(([cat, count]) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold uppercase text-neutral-300 tracking-wider">{cat}</span>
                          <span className="text-neutral-500 font-semibold">{count} {count === 1 ? 'article' : 'articles'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-white transition-all duration-700"
                            style={{ width: `${Math.round((count / catMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Category highlight */}
              {topCategory && (
                <div className="bg-neutral-950 border border-neutral-800 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white flex items-center justify-center flex-shrink-0">
                    <BarChart2 size={18} className="text-black" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">Most Active Category</p>
                    <p className="text-base font-black text-white">{topCategory[0]}</p>
                    <p className="text-[10px] text-neutral-500">{topCategory[1]} {topCategory[1] === 1 ? 'article' : 'articles'} published</p>
                  </div>
                </div>
              )}

              {/* Recent Articles timeline */}
              {authorPosts.length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Recent Activity</h4>
                  <div className="space-y-3">
                    {authorPosts.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-neutral-900 last:border-0 last:pb-0">
                        <div className="w-10 h-8 bg-neutral-900 border border-neutral-800 flex-shrink-0 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-200 leading-snug line-clamp-1">{p.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 uppercase tracking-wider font-bold">{p.category}</span>
                            <span className="text-[9px] text-neutral-600">{p.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA to write first post */}
              {authorPosts.length === 0 && (
                <div className="text-center py-12 border border-dashed border-neutral-800 space-y-3">
                  <p className="text-neutral-500 text-sm font-serif">Start writing to see your statistics grow.</p>
                  <button
                    onClick={handleNewPostClick}
                    className="bg-white text-black text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-neutral-200 cursor-pointer"
                  >
                    Write Your First Post
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* VIEW: MY ARTICLES                                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'list' && !editingPost && (
            <div className="space-y-4">
              {authorPosts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800 p-8 space-y-4">
                  <p className="text-neutral-500 font-serif">You haven't written any articles yet.</p>
                  <button
                    onClick={handleNewPostClick}
                    className="bg-white text-black text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-neutral-200 cursor-pointer"
                  >
                    Write Your First Post
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800">
                  {authorPosts.map((post) => (
                    <div key={post.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start group">
                      {/* Image Thumbnail */}
                      <div className="w-20 h-14 bg-neutral-950 border border-neutral-800 flex-shrink-0 overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Description / Actions */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 font-extrabold uppercase px-1.5 py-0.5 tracking-wider">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-semibold">{post.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-200 leading-snug line-clamp-2 select-text">
                          {post.title}
                        </h4>
                      </div>

                      {/* Edit/Delete Actions */}
                      <div className="flex items-center gap-2 pl-4">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-orange-400 rounded transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(post.id)}
                          className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: WRITE/EDIT FORM */}
          {activeTab === 'write' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Post Title */}
              <div>
                <label htmlFor="post-title" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Article Title *
                </label>
                <input
                  id="post-title"
                  type="text"
                  placeholder="Enter a compelling headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                  required
                />
              </div>

              {/* Grid 2-cols: Category & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-category" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    id="post-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="post-readtime" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                    Read Time (Estimated)
                  </label>
                  <input
                    id="post-readtime"
                    type="text"
                    placeholder="E.g., 5 MIN READ"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                  />
                </div>
              </div>

              {/* Cover Image Input & Suggestions */}
              <div>
                <label htmlFor="post-image" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5 flex justify-between items-center">
                  <span>Cover Image</span>
                  <span className="text-[9px] text-neutral-500 font-bold lowercase">URL or Upload File</span>
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    id="post-image"
                    type="text"
                    placeholder="E.g., /hero_bg.png or external https image link"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                  />
                  <label className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 px-4 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-all flex items-center justify-center">
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const uploadedUrl = await uploadService.uploadPostImage(file);
                            setImage(uploadedUrl);
                            setSuccessMsg("Cover image uploaded successfully!");
                          } catch (err) {
                            console.error("Upload failed:", err);
                            setErrorMsg(err.message || "Failed to upload image");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                
                {/* Suggestions list */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-bold text-neutral-500 uppercase">Suggested Assets:</span>
                  <div className="flex flex-wrap gap-2">
                    {suggestedImages.map((sImg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(sImg.url)}
                        className={`text-[9px] px-2.5 py-1.5 border transition-all cursor-pointer ${
                          image === sImg.url 
                            ? 'bg-white text-black border-white' 
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
                        }`}
                      >
                        {sImg.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Excerpt */}
              <div>
                <label htmlFor="post-excerpt" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Excerpt / Summary *
                </label>
                <textarea
                  id="post-excerpt"
                  rows="2"
                  placeholder="Provide a brief summary of the article (appears on cards)"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Large Body Content */}
              <div>
                <label htmlFor="post-content" className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Article Body Content *
                </label>
                <textarea
                  id="post-content"
                  rows="10"
                  placeholder="Write your article content here. Use double line-breaks to separate paragraphs."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 px-4 py-3 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none font-serif leading-relaxed transition-colors"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest py-3.5 transition-colors duration-150 cursor-pointer text-center"
                >
                  {editingPost ? 'Save Changes' : 'Publish Story'}
                </button>
                
                {editingPost && (
                  <button
                    type="button"
                    onClick={() => { setEditingPost(null); setActiveTab('list'); }}
                    className="flex-1 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 text-xs font-bold uppercase tracking-widest py-3.5 transition-colors duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
