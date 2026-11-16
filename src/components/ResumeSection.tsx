import { Download, FileText, Lock } from 'lucide-react';
import type { PublicResume, SiteSettings } from '../types';

interface ResumeSectionProps {
  settings: SiteSettings;
  publicResume: PublicResume | null;
  isAdmin: boolean;
  onOpenAdminResume: () => void;
  onGoToContact: () => void;
}

export function ResumeSection({
  settings,
  publicResume,
  isAdmin,
  onOpenAdminResume,
  onGoToContact,
}: ResumeSectionProps) {
  const isPublished =
    settings.resumeStatus === 'published' && Boolean(publicResume && publicResume.isVisible);

  const handleDownloadFile = () => {
    if (!publicResume?.fileDataUrl) return;
    const link = document.createElement('a');
    link.href = publicResume.fileDataUrl;
    link.download = publicResume.fileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="resume" className="py-20 bg-[#FAFAF9] border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Sticky Column */}
          <div className="lg:col-span-4">
            <p className="text-xs font-medium text-zinc-500 mb-2">
              02. Curriculum Vitae
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 mb-4 text-balance">
              이력서 및 경력 기록
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 mb-6">
              걸어온 여정과 프로젝트 경험을 한눈에 볼 수 있도록 정리한 공간입니다.
            </p>

            {isPublished && publicResume?.fileDataUrl && (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                첨부 파일 다운로드 ({publicResume.fileName || '이력서'})
              </button>
            )}
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-8">
            {isPublished && publicResume ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 space-y-8">
                <div className="pb-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-zinc-900">
                      {publicResume.fullName}
                    </h3>
                    <p className="text-sm text-blue-700 font-medium mt-1">
                      {publicResume.headline}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>공식 게시본</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold tracking-wide text-zinc-500 mb-3">
                    소개 요약
                  </h4>
                  <p className="text-[15px] leading-[1.75] text-zinc-700 whitespace-pre-line">
                    {publicResume.summary}
                  </p>
                </div>

                {publicResume.experienceText && (
                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-semibold tracking-wide text-zinc-500 mb-3">
                      주요 경력 및 프로젝트
                    </h4>
                    <div className="text-[15px] leading-[1.75] text-zinc-700 whitespace-pre-line">
                      {publicResume.experienceText}
                    </div>
                  </div>
                )}

                {publicResume.educationText && (
                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-semibold tracking-wide text-zinc-500 mb-3">
                      학력 및 수료
                    </h4>
                    <div className="text-[15px] leading-[1.75] text-zinc-700 whitespace-pre-line">
                      {publicResume.educationText}
                    </div>
                  </div>
                )}

                {publicResume.skillsText && (
                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-semibold tracking-wide text-zinc-500 mb-3">
                      핵심 역량 및 도구
                    </h4>
                    <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-line">
                      {publicResume.skillsText}
                    </p>
                  </div>
                )}

                {publicResume.linksText && (
                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-semibold tracking-wide text-zinc-500 mb-3">
                      외부 링크
                    </h4>
                    <p className="text-sm leading-relaxed text-zinc-600 font-mono whitespace-pre-line break-all">
                      {publicResume.linksText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-4">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>이력서 게시 대기 중</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3 text-balance">
                  정식 이력서를 다듬고 있습니다
                </h3>
                <p className="text-[15px] leading-[1.7] text-zinc-600 max-w-xl mb-8">
                  현재 최근 여정과 작업 내용을 정리하여 이력서를 준비 중입니다. 협업이나 포지션 관련 문의가 있으시다면 아래 엽서 보내기를 통해 먼저 인사를 남겨주세요.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onGoToContact}
                    className="px-5 py-2.5 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    먼저 연락 남기기
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAdminResume}
                    className="px-5 py-2.5 text-xs font-medium rounded-lg border border-zinc-300 text-zinc-800 hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isAdmin ? '이력서 제출 및 게시하기' : '관리자 로그인 후 이력서 제출'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
