import { ArrowRight } from 'lucide-react';
import { GENERATED_IMAGES } from '../data/defaultData';
import type { SiteSettings } from '../types';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  settings: SiteSettings;
  publishedCount: number;
  onExploreArchive: () => void;
  onGoToResume: () => void;
}

export function HeroSection({
  settings,
  publishedCount,
  onExploreArchive,
  onGoToResume,
}: HeroSectionProps) {
  return (
    <section className="border-b border-zinc-200 bg-[#FAFAF9]">
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-14 lg:pt-16 lg:pb-16">
        {/* Split-Screen Editorial Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Typography & CTA */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-zinc-500 mb-5">
                {settings.heroKicker}
              </p>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.14] text-zinc-900 text-balance mb-6">
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-[17px] leading-[1.7] text-zinc-600 max-w-xl mb-8">
                {settings.heroDescription}
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={onExploreArchive}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  여정 기록 보기
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onGoToResume}
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  이력서 확인하기
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-zinc-200 flex items-center gap-3 text-xs text-zinc-500">
              <span className="font-medium text-zinc-800">{settings.authorName}</span>
              <span aria-hidden="true">·</span>
              <span>{settings.authorRole}</span>
            </div>
          </div>

          {/* Right Column: Full-height Editorial Travel Photograph */}
          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[380px] rounded-2xl overflow-hidden bg-zinc-200 border border-zinc-200">
              <ResilientImage
                src={GENERATED_IMAGES.heroCoastal}
                alt="지중해의 석회암 테라스에서 바라본 아침 바다 풍경"
                fallbackTitle="Coastal Monograph"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6 text-white">
                <p className="text-xs font-mono tracking-wide text-zinc-200">
                  36.3932° N · 25.4615° E
                </p>
                <p className="text-sm font-medium mt-1">
                  Cyclades Morning Terrace — Issue No. 01 Cover
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Metrics Row Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">방문한 도시</p>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tabular-nums font-mono">
              {settings.citiesExplored}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">발행된 여정 노트</p>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tabular-nums font-mono">
              {Math.max(settings.dispatchesCount, publishedCount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">큐레이션 프로젝트</p>
            <p className="text-2xl sm:text-3xl font-semibold text-zinc-900 tabular-nums font-mono">
              {settings.projectsCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">이력서 공개 상태</p>
            <p className="text-lg sm:text-xl font-semibold text-zinc-900 mt-1">
              {settings.resumeStatus === 'published' ? '공개 게시 완료' : '정식 제출 준비 중'}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle Editorial Marquee Divider */}
      <div className="border-t border-zinc-200 bg-zinc-100/70 py-3 overflow-hidden select-none">
        <div className="animate-marquee text-xs font-mono tracking-wider text-zinc-500 whitespace-nowrap">
          <span className="mx-6">selected dispatches · field photography · architectural studies · personal archive</span>
          <span className="mx-6">selected dispatches · field photography · architectural studies · personal archive</span>
          <span className="mx-6">selected dispatches · field photography · architectural studies · personal archive</span>
          <span className="mx-6">selected dispatches · field photography · architectural studies · personal archive</span>
        </div>
      </div>
    </section>
  );
}
