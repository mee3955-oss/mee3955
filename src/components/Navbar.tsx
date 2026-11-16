import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  siteTitle: string;
  activeView: 'home' | 'admin';
  isAdmin: boolean;
  onSelectView: (view: 'home' | 'admin') => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Navbar({
  siteTitle,
  activeView,
  isAdmin,
  onSelectView,
  onNavigateSection,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (activeView !== 'home') {
      onSelectView('home');
      setTimeout(() => onNavigateSection(sectionId), 60);
    } else {
      onNavigateSection(sectionId);
    }
  };

  const handleToggleAdmin = () => {
    setMobileOpen(false);
    onSelectView(activeView === 'admin' ? 'home' : 'admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF9]/95 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            onSelectView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-editorial text-2xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
        >
          {siteTitle || 'Wayfarer'}
        </button>

        {/* Zone 2: 4 Concise Single-Line Nav Links */}
        <nav
          aria-label="주요 탐색"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <button
            type="button"
            onClick={() => handleNavClick('archive')}
            className="hover:text-zinc-900 hover:underline underline-offset-4 decoration-zinc-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            여정 아카이브
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('resume')}
            className="hover:text-zinc-900 hover:underline underline-offset-4 decoration-zinc-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            이력서
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="hover:text-zinc-900 hover:underline underline-offset-4 decoration-zinc-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            소개
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="hover:text-zinc-900 hover:underline underline-offset-4 decoration-zinc-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            엽서 보내기
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleToggleAdmin}
            className={`hidden md:inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              activeView === 'admin'
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {activeView === 'admin'
              ? '홈페이지로 돌아가기'
              : isAdmin
                ? '관리자 콘솔'
                : '관리자'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-[#FAFAF9] px-6 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleNavClick('archive')}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            여정 아카이브
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('resume')}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            이력서
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            소개
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            엽서 보내기
          </button>
          <div className="pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={handleToggleAdmin}
              className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 whitespace-nowrap"
            >
              {activeView === 'admin' ? '홈페이지로 돌아가기' : '관리자 탭 열기'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
