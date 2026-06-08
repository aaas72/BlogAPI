export default function Footer() {
  const categoriesLinks = [
    'Culture',
    'Economy',
    'Politics',
    'Science',
    'Technology',
    'Travel',
    'World'
  ];

  const infoLinks = [
    'Privacy Policy',
    'Terms & Conditions',
    'Site Map',
    'FAQ',
    'Locations',
    'Latest Articles',
    'User Area'
  ];

  const companyLinks = [
    'About',
    'Contact',
    'Our Staff',
    'Help Center',
    'Advertise',
    'Subscription',
    'Startups'
  ];

  return (
    <footer className="w-full bg-black text-white select-none">
      
      {/* TOP ROW: Subscription Bar */}
      <div className="border-b border-neutral-900/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <h3 className="text-white text-lg md:text-xl font-bold font-sans tracking-tight text-center md:text-left max-w-md select-text">
            Stay informed and not overwhelmed, subscribe now!
          </h3>
          
          {/* Subscription Input Box */}
          <div className="flex w-full md:w-[480px] bg-white p-1">
            <input 
              type="email" 
              placeholder="Your email *" 
              className="flex-grow bg-transparent text-black placeholder-neutral-400 text-sm px-4 py-2.5 focus:outline-none"
              required
            />
            <button className="bg-[#0f62fe] hover:bg-[#0043ce] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 transition-colors duration-150 cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Columns Section */}
      <div className="border-b border-neutral-900/80">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* Column 1: Business Hours & Socials */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-white text-xs font-black tracking-wider uppercase select-text">
              Business Hours
            </h4>
            <div className="text-neutral-400 text-[13px] font-medium leading-relaxed space-y-1.5 select-text">
              <p>Monday - Friday: 08:00 - 20:00</p>
              <p>Saturday - Sunday: 09:00 - 14:00</p>
            </div>
            
            {/* Social Media Row */}
            <div className="flex items-center gap-2 pt-2">
              <a 
                href="#" 
                className="w-9 h-9 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Youtube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.503a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.503a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-9 h-9 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 flex items-center justify-center transition-all cursor-pointer"
                aria-label="Telegram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36 0-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-white text-xs font-black tracking-wider uppercase select-text">
              Categories
            </h4>
            <ul className="flex flex-col gap-3 text-neutral-400 text-[13px] font-medium">
              {categoriesLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-white text-xs font-black tracking-wider uppercase select-text">
              Information
            </h4>
            <ul className="flex flex-col gap-3 text-neutral-400 text-[13px] font-medium">
              {infoLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col space-y-5">
            <h4 className="text-white text-xs font-black tracking-wider uppercase select-text">
              Company
            </h4>
            <ul className="flex flex-col gap-3 text-neutral-400 text-[13px] font-medium">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: Brand & Copyright Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col items-center gap-4">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-serif font-normal text-white select-text">
            Daily Pulse
          </h2>
          <p className="text-[9px] text-neutral-500 font-sans tracking-[0.25em] uppercase mt-1 select-text">
            All voices matter
          </p>
        </div>

        {/* Separator line inside brand row */}
        <div className="w-full border-b border-neutral-900/60 my-2" />

        {/* Copyright Text */}
        <p className="text-[11px] text-neutral-500 select-text">
          Copyright © {new Date().getFullYear()} · Daily Pulse · All rights reserved.
        </p>
      </div>

    </footer>
  );
}
