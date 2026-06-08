import useDocumentMetadata from '../hooks/useDocumentMetadata';

export default function ContactPage() {
  useDocumentMetadata({
    title: 'Contact Us',
    description: 'Get in touch with Daily Pulse. Send us your feedback, inquiries, or news story tips directly.',
    keywords: 'contact, feedback, story tip, support, customer service, daily pulse'
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you shortly.');
  };

  return (
    <section className="bg-white text-black py-16 px-4 md:px-8 flex-grow">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left Column: Contact Details */}
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-black tracking-[0.2em] uppercase text-neutral-500">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-neutral-900 tracking-tight leading-tight">
              Contact Us
            </h1>
            <div className="w-12 h-1 bg-neutral-900 mt-4" />
          </div>

          <div className="font-serif text-neutral-700 leading-relaxed space-y-5 select-text">
            <p>
              Have a question, feedback, or a story tip? We would love to hear from you. Fill out the form or reach out to our team via the details below.
            </p>
            
            <div className="font-sans text-sm space-y-4 pt-4">
              <div>
                <h4 className="font-bold uppercase text-neutral-900 text-xs tracking-wider">
                  Editorial Office
                </h4>
                <p className="text-neutral-500 mt-1">123 Daily Pulse Plaza, Suite 400, New York, NY 10001</p>
              </div>
              <div>
                <h4 className="font-bold uppercase text-neutral-900 text-xs tracking-wider">
                  Email Us
                </h4>
                <p className="text-neutral-500 mt-1">contact@dailypulse.com</p>
              </div>
              <div>
                <h4 className="font-bold uppercase text-neutral-900 text-xs tracking-wider">
                  Call Us
                </h4>
                <p className="text-neutral-500 mt-1">+1 (555) 019-2834</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-neutral-50 p-6 md:p-8 border border-neutral-100 shadow-sm flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Full Name *
              </label>
              <input 
                id="name"
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-white border border-neutral-200 text-black px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 rounded-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Email Address *
              </label>
              <input 
                id="email"
                type="email" 
                placeholder="johndoe@example.com" 
                className="w-full bg-white border border-neutral-200 text-black px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 rounded-none transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Your Message *
              </label>
              <textarea 
                id="message"
                rows="5" 
                placeholder="Write your message here..." 
                className="w-full bg-white border border-neutral-200 text-black px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 rounded-none transition-colors resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 transition-colors duration-150 cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
