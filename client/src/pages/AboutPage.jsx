import useDocumentMetadata from '../hooks/useDocumentMetadata';

export default function AboutPage() {
  useDocumentMetadata({
    title: 'About Us',
    description: 'Learn about Daily Pulse - a premium digital news publication dedicated to sharing diverse voices, high-quality stories, and global insights.',
    keywords: 'about us, vision, journalism, daily pulse, mission'
  });
  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 flex-grow">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black tracking-[0.2em] uppercase text-neutral-500">
            Who We Are
          </span>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-neutral-900 tracking-tight leading-tight">
            About Daily Pulse
          </h1>
          <div className="w-12 h-1 bg-neutral-900 mx-auto mt-4" />
        </div>

        {/* Hero image or text */}
        <div className="relative w-full aspect-video overflow-hidden border border-neutral-100 bg-neutral-50 shadow-sm">
          <img 
            src="/cliff_girl.png" 
            alt="About Daily Pulse" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="font-serif text-base md:text-lg text-neutral-800 leading-relaxed space-y-6 select-text">
          <p>
            Welcome to <strong>Daily Pulse</strong>, a premium news and lifestyle publication dedicated to sharing voices, stories, and insights from across the globe. Founded in 2025, our mission is to deliver high-quality, impactful content that keeps our readers informed, inspired, and connected.
          </p>
          <p>
            We believe that journalism has the power to bridge divides, foster understanding, and spark progress. Our team of experienced editors and contributors cover a wide spectrum of subjects, ranging from cutting-edge developments in <strong>Science</strong> and <strong>Technology</strong>, to deep dives into <strong>Culture</strong>, global <strong>Politics</strong>, and scenic <strong>Travel</strong>.
          </p>
          
          <h2 className="text-xl md:text-2xl font-bold font-serif text-neutral-900 pt-4">
            Our Vision
          </h2>
          <p className="font-sans text-sm md:text-base text-neutral-600 leading-relaxed">
            In an era of rapid information flow, we prioritize depth and accuracy over speed. Our writers seek out the narratives behind the headlines, bringing context and clarity to the complex issues of our times. We believe that <em>all voices matter</em>, and we are committed to providing a platform that reflects the diversity of the world we live in.
          </p>
        </div>

      </div>
    </section>
  );
}
