import { TrendingUp, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function HeaderNews() {
  const { posts, postsLoading } = useApp();

  if (postsLoading) {
    return (
      <div className="bg-neutral-950 text-white min-h-[500px] flex items-center justify-center">
        <p className="text-sm font-serif text-neutral-400">Loading daily updates...</p>
      </div>
    );
  }

  // Hot Story: highest views or fallback to first post
  const hotStory = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0] || posts[0];

  // Trending: next 3 posts
  const trendingItems = posts.slice(1, 4);

  // Breaking: next 5 posts
  const breakingItems = posts.slice(4, 9);

  if (!hotStory && trendingItems.length === 0 && breakingItems.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-neutral-950 text-white min-h-[500px] border-b border-neutral-900 overflow-hidden">
      
      {/* Background Image with Dark Overlay */}
      {hotStory && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70 animate-fade-in"
          style={{ backgroundImage: `url('${hotStory.image}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
 
      {/* Main Grid Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        
        {/* LEFT COLUMN: Main Feature & Trending */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-12">
          
          {/* Main Hot Story */}
          {hotStory && (
            <div className="space-y-4 max-w-2xl">
              <span className="inline-block bg-red-600 hover:bg-red-500 transition-colors text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 cursor-pointer">
                Featured Essay
              </span>
              <Link to={`/article/${hotStory.id}`} className="block group">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-tight leading-tight group-hover:text-neutral-200 transition-colors cursor-pointer select-text">
                  {hotStory.title}
                </h2>
              </Link>
              <p className="text-sm md:text-base text-neutral-400 font-sans leading-relaxed select-text">
                {hotStory.excerpt}
              </p>
            </div>
          )}

          {/* Trending Section */}
          {trendingItems.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-bold tracking-widest uppercase border-b border-neutral-900 pb-2">
                <TrendingUp size={16} className="text-neutral-400" />
                <span>Trending Essays</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {trendingItems.map((item) => (
                  <Link key={item.id} to={`/article/${item.id}`} className="group cursor-pointer block">
                    <div className="relative w-full aspect-video rounded-sm overflow-hidden mb-3 border border-neutral-900 bg-neutral-900">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors duration-150 leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Latest Articles Vertical List */}
        {breakingItems.length > 0 && (
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-900 pt-8 lg:pt-0 lg:pl-10 flex flex-col">
            
            <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-bold tracking-widest uppercase border-b border-neutral-900 pb-3 mb-6">
              <Megaphone size={16} className="text-neutral-400" />
              <span>Latest Articles</span>
            </div>

            <div className="space-y-5 flex-1">
              {breakingItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/article/${item.id}`}
                  className="flex gap-4 items-start group cursor-pointer border-b border-neutral-900/50 pb-4 last:border-b-0 last:pb-0 block"
                >
                  <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-neutral-900 bg-neutral-900">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors duration-150 leading-snug line-clamp-2 font-serif">
                      {item.title}
                    </h4>
                    <p className="text-[9px] font-bold text-neutral-500 tracking-wider mt-1.5 uppercase">
                      {item.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        )}

      </div>

    </section>
  );
}
