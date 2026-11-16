import { useState } from 'react';
import { AboutAndPostcard } from './components/AboutAndPostcard';
import { AdminDashboard, type AdminSubTab } from './components/AdminDashboard';
import { DispatchArchive } from './components/DispatchArchive';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ResumeSection } from './components/ResumeSection';
import { usePortfolioData } from './hooks/usePortfolioData';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'admin'>('home');
  const [adminInitialTab, setAdminInitialTab] = useState<AdminSubTab>('resume');

  const {
    user,
    authReady,
    isAdmin,
    loading,
    siteSettings,
    hasRemoteSettings,
    dispatches,
    hasRemoteDispatches,
    publicResume,
    privateResumes,
    inquiries,
    signInWithGoogle,
    signOutUser,
    saveSiteSettings,
    seedDefaultData,
    saveDispatch,
    deleteDispatch,
    submitResumeVersion,
    publishExistingResume,
    unpublishPublicResume,
    deleteResumeVersion,
    submitInquiry,
    markInquiryStatus,
    deleteInquiry,
  } = usePortfolioData();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openAdminTab = (tab: AdminSubTab = 'resume') => {
    setAdminInitialTab(tab);
    setActiveView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-zinc-900">
      <Navbar
        siteTitle={siteSettings.siteTitle}
        activeView={activeView}
        isAdmin={isAdmin}
        onSelectView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        {loading && activeView === 'home' ? (
          <div className="max-w-[1200px] mx-auto px-6 py-24 text-center text-sm text-zinc-500">
            여정 아카이브를 불러오는 중입니다...
          </div>
        ) : activeView === 'admin' ? (
          <AdminDashboard
            user={user}
            authReady={authReady}
            isAdmin={isAdmin}
            initialTab={adminInitialTab}
            siteSettings={siteSettings}
            hasRemoteSettings={hasRemoteSettings}
            dispatches={dispatches}
            hasRemoteDispatches={hasRemoteDispatches}
            privateResumes={privateResumes}
            inquiries={inquiries}
            onSignIn={signInWithGoogle}
            onSignOut={signOutUser}
            onSeedDefaults={seedDefaultData}
            onSaveSettings={saveSiteSettings}
            onSaveDispatch={saveDispatch}
            onDeleteDispatch={deleteDispatch}
            onSubmitResume={submitResumeVersion}
            onPublishExistingResume={publishExistingResume}
            onUnpublishResume={unpublishPublicResume}
            onDeleteResume={deleteResumeVersion}
            onMarkInquiry={markInquiryStatus}
            onDeleteInquiry={deleteInquiry}
          />
        ) : (
          <>
            <HeroSection
              settings={siteSettings}
              publishedCount={dispatches.filter((d) => d.isPublished).length}
              onExploreArchive={() => scrollToSection('archive')}
              onGoToResume={() => scrollToSection('resume')}
            />

            <DispatchArchive dispatches={dispatches} />

            <ResumeSection
              settings={siteSettings}
              publicResume={publicResume}
              isAdmin={isAdmin}
              onOpenAdminResume={() => openAdminTab('resume')}
              onGoToContact={() => scrollToSection('contact')}
            />

            <AboutAndPostcard
              settings={siteSettings}
              user={user}
              onSignIn={signInWithGoogle}
              onSubmitInquiry={submitInquiry}
            />
          </>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-zinc-200 bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base font-semibold text-zinc-900">
              {siteSettings.siteTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span>© 2026 {siteSettings.authorName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setTimeout(() => scrollToSection('archive'), 40);
              }}
              className="hover:text-zinc-900 cursor-pointer"
            >
              여정 아카이브
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setTimeout(() => scrollToSection('resume'), 40);
              }}
              className="hover:text-zinc-900 cursor-pointer"
            >
              이력서
            </button>
            <a
              href="https://github.com/mee3955-oss"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={() => openAdminTab('resume')}
              className="hover:text-zinc-900 cursor-pointer"
            >
              관리자 전용
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
