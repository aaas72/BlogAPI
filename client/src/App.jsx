import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeaderNews from './components/HeaderNews';
import NewsGrid from './components/NewsGrid';
import EditorChoiceGrid from './components/EditorChoiceGrid';
import CategoryGrid from './components/CategoryGrid';
import Footer from './components/Footer';

// Components
import AuthModal from './components/AuthModal';
import AuthorPanel from './components/AuthorPanel';

// Pages
import CategoryPage from './pages/CategoryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ArticlePage from './pages/ArticlePage';

// Context
import { useApp } from './context/AppContext';

// Hooks
import useDocumentMetadata from './hooks/useDocumentMetadata';

function HomeLayout() {
  useDocumentMetadata({
    title: 'Home',
    description: 'Welcome to Daily Pulse - your premium source for daily stories and in-depth essays on Culture, Economy, Politics, Science, Technology, Travel, and World topics.',
    keywords: 'home, daily pulse, trending stories, essays, articles, culture, economy, politics, science, technology'
  });
  return (
    <>
      <HeaderNews />
      <NewsGrid />
      <EditorChoiceGrid />
      <CategoryGrid />
    </>
  );
}

function App() {
  const { user } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthorPanelOpen, setIsAuthorPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col font-sans relative">
      <Navbar 
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAuthorPanel={() => setIsAuthorPanelOpen(true)}
      />
      <Routes>
        <Route path="/" element={<HomeLayout />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/:category" element={<CategoryPage />} />
      </Routes>
      <Footer />

      {/* FAB (Floating Action Button) for Authenticated Users */}
      {user && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2 group/fab">
          {/* Tooltip label */}
          <span className="opacity-0 group-hover/fab:opacity-100 transition-opacity duration-200 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-lg pointer-events-none whitespace-nowrap">
            Write a Story
          </span>
          <button
            onClick={() => setIsAuthorPanelOpen(true)}
            className="bg-white text-black hover:bg-neutral-100 border border-neutral-200 rounded-full w-14 h-14 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            title="Open Author Workspace"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      )}

      {/* Authentication Popups */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <AuthorPanel
        isOpen={isAuthorPanelOpen}
        onClose={() => setIsAuthorPanelOpen(false)}
      />
    </div>
  );
}

export default App;
