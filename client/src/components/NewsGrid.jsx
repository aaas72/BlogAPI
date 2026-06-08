import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function NewsGrid() {
  const { posts, postsLoading } = useApp();

  if (postsLoading) {
    return (
      <div className="bg-white text-black py-16 text-center font-serif text-sm">
        Loading breaking news...
      </div>
    );
  }

  const mainBreaking = posts[0];
  const popularStories = posts.slice(1, 5);

  if (!mainBreaking && popularStories.length === 0) {
    return (
      <div className="bg-white text-black py-20 text-center font-serif">
        No articles published yet.
      </div>
    );
  }

  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        
        {/* LEFT COLUMN: Featured Story */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-xl md:text-2xl font-black font-serif text-neutral-900 tracking-tight flex items-center gap-2 select-text">
            Featured Story
          </h2>
          
          {mainBreaking && (
            <Link to={`/article/${mainBreaking.id}`} className="group relative w-full aspect-square overflow-hidden bg-neutral-900 border border-neutral-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 block">
              <img 
                src={mainBreaking.image} 
                alt="Featured Article" 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              
              <span className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm">
                FEATURED
              </span>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start gap-3.5 z-10">
                <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                  {mainBreaking.category}
                </span>
                
                <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif leading-tight tracking-tight group-hover:text-neutral-200 transition-colors select-text">
                  {mainBreaking.title}
                </h3>
                
                <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                  {mainBreaking.date}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* RIGHT COLUMN: Popular Stories */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-xl md:text-2xl font-black font-serif text-neutral-900 tracking-tight flex items-center gap-2 select-text">
            Popular Stories
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
            {popularStories.map((story) => (
              <Link key={story.id} to={`/article/${story.id}`} className="group flex flex-col cursor-pointer block">
                <div className="relative w-full aspect-[1.58] overflow-hidden bg-neutral-100 border border-neutral-100 mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-sm">
                      {story.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-neutral-900 text-[15px] sm:text-base font-extrabold font-serif leading-snug mb-2 cursor-pointer group-hover:text-neutral-700 transition-colors line-clamp-2 select-text">
                  {story.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-[13px] leading-relaxed line-clamp-3 select-text">
                  {story.excerpt || story.content?.replace(/<[^>]*>/g, '')?.substring(0, 150) + '...'}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
