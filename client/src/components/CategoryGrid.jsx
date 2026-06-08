import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CategoryGrid() {
  const { posts, postsLoading } = useApp();

  if (postsLoading) {
    return (
      <div className="bg-white text-black py-16 text-center font-serif text-sm">
        Loading category layouts...
      </div>
    );
  }

  const categoryNames = ['SCIENCE', 'CULTURE', 'POLITICS'];

  const resolvedCategories = categoryNames.map(name => {
    const catPosts = posts.filter(p => p.category === name);
    return {
      name,
      spotlight: catPosts[0],
      articles: catPosts.slice(1, 4)
    };
  }).filter(cat => cat.spotlight !== undefined);

  if (resolvedCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        
        {resolvedCategories.map((cat, idx) => (
          <div key={idx} className="flex flex-col">
            
            {/* Category Header */}
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-neutral-800 border-b border-neutral-100 pb-3.5 mb-6 select-text">
              {cat.name}
            </h2>
            
            {/* Spotlight Card */}
            {cat.spotlight && (
              <Link to={`/article/${cat.spotlight.id}`} className="group flex flex-col mb-8 block">
                <div className="relative w-full aspect-[1.48] overflow-hidden bg-neutral-100 border border-neutral-100 mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={cat.spotlight.image} 
                    alt={cat.spotlight.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 left-3 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 z-10 shadow-sm">
                    {cat.name}
                  </span>
                </div>
                
                <h3 className="text-neutral-900 text-base md:text-lg font-extrabold font-serif leading-snug mb-2 cursor-pointer group-hover:text-neutral-700 transition-colors line-clamp-2 select-text">
                  {cat.spotlight.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-[13px] leading-relaxed line-clamp-2 select-text">
                  {cat.spotlight.excerpt || cat.spotlight.content?.replace(/<[^>]*>/g, '')?.substring(0, 150) + '...'}
                </p>
              </Link>
            )}
            
            {/* Sidebar Article List */}
            <div className="flex flex-col">
              {cat.articles.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/article/${article.id}`}
                  className="group flex gap-4 items-start py-4 border-t border-neutral-100 cursor-pointer block"
                >
                  <div className="w-16 h-12 bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1 select-text">
                      {article.date}
                    </p>
                    <h4 className="text-neutral-900 text-xs sm:text-sm font-extrabold font-serif leading-snug group-hover:text-neutral-700 transition-colors line-clamp-2 select-text">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        ))}

      </div>
    </section>
  );
}
