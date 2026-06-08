import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function EditorChoiceGrid() {
  const { posts, postsLoading } = useApp();

  if (postsLoading) {
    return (
      <div className="bg-white text-black py-16 text-center font-serif text-sm">
        Loading editor choices...
      </div>
    );
  }

  const editorChoices = posts.slice(5, 11);
  const worthReadings = posts.slice(11, 14);
  const videoChoice = posts[14] || posts[0];

  if (editorChoices.length === 0 && worthReadings.length === 0 && !videoChoice) {
    return null;
  }

  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: Editor Choice */}
        <div className="lg:col-span-9 flex flex-col space-y-6">
          <h2 className="text-xl md:text-2xl font-black font-serif text-neutral-900 tracking-tight select-text">
            Editor Choice
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-12">
            {editorChoices.map((story) => (
              <Link key={story.id} to={`/article/${story.id}`} className="group flex flex-col cursor-pointer block">
                <div className="relative w-full aspect-[1.48] overflow-hidden bg-neutral-100 border border-neutral-100 mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={story.image} 
                    alt={story.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 left-3 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 z-10 shadow-sm">
                    {story.category}
                  </span>
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

        {/* RIGHT COLUMN: Worth Reading */}
        <div className="lg:col-span-3 flex flex-col space-y-6 lg:border-l lg:border-neutral-100 lg:pl-8">
          <h2 className="text-xl md:text-2xl font-black font-serif text-neutral-900 tracking-tight select-text">
            Worth Reading
          </h2>
          
          <div className="flex flex-col">
            {videoChoice && (
              <Link to={`/article/${videoChoice.id}`} className="group flex flex-col pb-6 border-b border-neutral-100 mb-6 block">
                <div className="relative w-full aspect-[1.48] overflow-hidden bg-neutral-100 border border-neutral-100 mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img 
                    src={videoChoice.image} 
                    alt="Spotlight Video Thumbnail" 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Play size={18} className="fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-neutral-900 text-[15px] sm:text-base font-extrabold font-serif leading-snug mb-2 cursor-pointer group-hover:text-neutral-700 transition-colors select-text">
                  {videoChoice.title}
                </h3>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider select-text">
                  {videoChoice.date} / {videoChoice.category}
                </p>
              </Link>
            )}
            
            <div className="flex flex-col space-y-6">
              {worthReadings.map((item) => (
                <Link key={item.id} to={`/article/${item.id}`} className="flex flex-col pb-5 border-b border-neutral-100 last:border-b-0 last:pb-0 block">
                  <h4 className="text-neutral-900 text-sm font-extrabold font-serif leading-snug mb-1.5 cursor-pointer hover:text-neutral-700 transition-colors line-clamp-2 select-text">
                    {item.title}
                  </h4>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider select-text">
                    {item.date} / {item.category}
                  </p>
                </Link>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
