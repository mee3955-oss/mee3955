import { useEffect, useMemo, useState } from 'react';
import { Camera, MapPin, X } from 'lucide-react';
import { DISPATCH_CATEGORIES, type DispatchCategory, type TravelDispatch } from '../types';
import { ResilientImage } from './ResilientImage';

interface DispatchArchiveProps {
  dispatches: TravelDispatch[];
}

export function DispatchArchive({ dispatches }: DispatchArchiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<'전체' | DispatchCategory>('전체');
  const [activeDispatch, setActiveDispatch] = useState<TravelDispatch | null>(null);

  const visibleDispatches = useMemo(() => {
    const published = dispatches.filter((d) => d.isPublished);
    if (selectedCategory === '전체') return published;
    return published.filter((d) => d.category === selectedCategory);
  }, [dispatches, selectedCategory]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDispatch(null);
    };
    if (activeDispatch) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeDispatch]);

  return (
    <section id="archive" className="py-20 bg-white border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header + Interactive Category Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">
              01. Curated Travelogue &amp; Works
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 text-balance">
              도시와 풍경에서 수집한 기록들
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="여정 카테고리 필터"
            className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-lg self-start md:self-auto"
          >
            {(['전체', ...DISPATCH_CATEGORIES] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Bento Grid */}
        {visibleDispatches.length === 0 ? (
          <div className="py-16 text-center border border-zinc-200 rounded-2xl bg-[#FAFAF9]">
            <p className="text-sm text-zinc-600">
              선택한 카테고리에 등록된 여정 기록이 아직 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
            {visibleDispatches.map((item, idx) => {
              const isLead = item.featured && idx === 0 && visibleDispatches.length >= 2;
              return (
                <article
                  key={item.id}
                  className={`group relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 flex flex-col justify-end ${
                    isLead ? 'md:col-span-2 lg:col-span-2 lg:row-span-2' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDispatch(item)}
                    className="absolute inset-0 w-full h-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                    aria-label={`${item.title} 자세히 보기`}
                  >
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackTitle={item.destination}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 text-white">
                      {/* Unboxed clean metadata with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200 mb-2">
                        <span>{item.destination}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.dateLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                      </div>

                      <h3
                        className={`font-editorial font-semibold tracking-tight text-white text-balance ${
                          isLead ? 'text-2xl sm:text-3xl mb-2' : 'text-xl sm:text-2xl mb-1.5'
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-sm text-zinc-200 line-clamp-2 max-w-xl leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Editorial Lightbox Modal */}
      {activeDispatch && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveDispatch(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveDispatch(null)}
              aria-label="창 닫기"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-zinc-900/90 text-white hover:bg-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="lg:col-span-7 bg-zinc-100 min-h-[260px] lg:min-h-[540px]">
              <ResilientImage
                src={activeDispatch.imageUrl}
                alt={activeDispatch.title}
                fallbackTitle={activeDispatch.destination}
                className="w-full h-full object-cover max-h-[52vh] lg:max-h-[90vh]"
              />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                  <span>{activeDispatch.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activeDispatch.dateLabel}</span>
                </div>

                <h3
                  id="lightbox-title"
                  className="font-editorial text-2xl sm:text-3xl font-semibold text-zinc-900 leading-snug mb-4 text-balance"
                >
                  {activeDispatch.title}
                </h3>

                <div className="space-y-2 pb-5 mb-5 border-b border-zinc-200 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>
                      {activeDispatch.destination}, {activeDispatch.country}
                    </span>
                    <span className="font-mono text-zinc-400 ml-auto tabular-nums">
                      {activeDispatch.coordinates}
                    </span>
                  </div>
                  {activeDispatch.cameraNote && (
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono">{activeDispatch.cameraNote}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-[15px] leading-[1.75] text-zinc-700 whitespace-pre-line">
                  {activeDispatch.story}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-400">
                <span>ESC 키를 눌러 닫기</span>
                <button
                  type="button"
                  onClick={() => setActiveDispatch(null)}
                  className="text-zinc-700 font-medium hover:text-zinc-900 cursor-pointer"
                >
                  아카이브로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
