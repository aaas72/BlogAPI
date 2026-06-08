import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

export default function CategoryPage() {
  const { category } = useParams();
  const catName = category ? category.toUpperCase() : '';
  const { posts } = useApp();

  useDocumentMetadata({
    title: catName ? `${catName} Articles` : 'Articles Category',
    description: `Read the latest articles, deep-dive analysis, and in-depth essays on ${catName || 'category'} at Daily Pulse.`,
    keywords: `${category || 'category'}, essays, articles, daily pulse`
  });

  const articles = posts.filter(p => p.category.toUpperCase() === catName);

  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 flex-grow border-b border-neutral-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black tracking-[0.2em] uppercase text-neutral-500">
            Category
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-neutral-900 tracking-tight leading-tight uppercase">
            {catName || 'Category'}
          </h1>
          <div className="w-12 h-1 bg-neutral-900 mx-auto mt-4" />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 font-serif">
            No articles found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-6">
            
            {/* Spotlight Card (Left 7 Columns) */}
            {articles[0] && (
              <Link to={`/article/${articles[0].id}`} className="lg:col-span-7 group flex flex-col cursor-pointer block">
                <div className="relative w-full aspect-[1.58] overflow-hidden bg-neutral-100 border border-neutral-100 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={articles[0].image} 
                    alt={articles[0].title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-4 left-4 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 z-10 shadow-md">
                    FEATURED
                  </span>
                </div>
                <p className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase mb-2">
                  {articles[0].date}
                </p>
                <h2 className="text-neutral-900 text-2xl md:text-3xl font-extrabold font-serif leading-snug mb-3 group-hover:text-neutral-700 transition-colors select-text">
                  {articles[0].title}
                </h2>
                <p className="text-neutral-600 text-sm md:text-base leading-relaxed select-text">
                  {articles[0].excerpt || articles[0].description}
                </p>
              </Link>
            )}

            {/* List of remaining articles (Right 5 Columns) */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-neutral-100">
              {articles.slice(1).map((item) => (
                <Link key={item.id} to={`/article/${item.id}`} className="group flex gap-5 py-6 first:pt-0 last:pb-0 cursor-pointer block">
                  {/* Thumbnail */}
                  <div className="w-24 sm:w-28 h-18 sm:h-20 bg-neutral-50 border border-neutral-100 overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Metadata & Title */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider select-text">
                      {item.date}
                    </p>
                    <h3 className="text-neutral-900 text-sm sm:text-base font-extrabold font-serif leading-snug group-hover:text-neutral-700 transition-colors line-clamp-2 select-text">
                      {item.title}
                    </h3>
                    <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed select-text">
                      {item.excerpt || item.description}
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
