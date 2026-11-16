import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileUp,
  Inbox,
  Lock,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { GENERATED_IMAGES } from '../data/defaultData';
import { ADMIN_EMAIL } from '../lib/firebase';
import {
  DISPATCH_CATEGORIES,
  FIELD_LIMITS,
  type DispatchCategory,
  type PrivateResume,
  type SiteSettings,
  type TravelDispatch,
  type VisitorInquiry,
} from '../types';

export type AdminSubTab = 'resume' | 'dispatches' | 'inquiries' | 'settings';

interface AdminDashboardProps {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  initialTab?: AdminSubTab;
  siteSettings: SiteSettings;
  hasRemoteSettings: boolean;
  dispatches: TravelDispatch[];
  hasRemoteDispatches: boolean;
  privateResumes: PrivateResume[];
  inquiries: VisitorInquiry[];
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSeedDefaults: () => Promise<void>;
  onSaveSettings: (next: Omit<SiteSettings, 'updatedAt'>) => Promise<void>;
  onSaveDispatch: (
    data: Omit<TravelDispatch, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  onDeleteDispatch: (id: string) => Promise<void>;
  onSubmitResume: (
    payload: {
      versionTitle: string;
      fullName: string;
      headline: string;
      summary: string;
      experienceText: string;
      educationText: string;
      skillsText: string;
      linksText: string;
      fileName: string;
      fileMimeType: string;
      fileDataUrl: string;
      privateMemo: string;
    },
    publishImmediately: boolean
  ) => Promise<void>;
  onPublishExistingResume: (resume: PrivateResume) => Promise<void>;
  onUnpublishResume: () => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
  onMarkInquiry: (id: string, status: 'unread' | 'read') => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
}

const MAX_UPLOAD_BYTES = 450 * 1024; // 450KB limit so base64 stays safely under Firestore 1MB doc limit

export function AdminDashboard({
  user,
  authReady,
  isAdmin,
  initialTab = 'resume',
  siteSettings,
  hasRemoteSettings,
  dispatches,
  hasRemoteDispatches,
  privateResumes,
  inquiries,
  onSignIn,
  onSignOut,
  onSeedDefaults,
  onSaveSettings,
  onSaveDispatch,
  onDeleteDispatch,
  onSubmitResume,
  onPublishExistingResume,
  onUnpublishResume,
  onDeleteResume,
  onMarkInquiry,
  onDeleteInquiry,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminSubTab>(initialTab);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Resume Submission Form State
  const [versionTitle, setVersionTitle] = useState('2026년 11월 정식 이력서');
  const [fullName, setFullName] = useState(siteSettings.authorName);
  const [headline, setHeadline] = useState(siteSettings.authorRole);
  const [summary, setSummary] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [educationText, setEducationText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [linksText, setLinksText] = useState('');
  const [privateMemo, setPrivateMemo] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');

  // Dispatch Editor State
  const [editingDispatchId, setEditingDispatchId] = useState<string | null>(null);
  const [dTitle, setDTitle] = useState('');
  const [dDestination, setDDestination] = useState('');
  const [dCountry, setDCountry] = useState('');
  const [dCoordinates, setDCoordinates] = useState('');
  const [dDateLabel, setDDateLabel] = useState('2026.11');
  const [dCategory, setDCategory] = useState<DispatchCategory>('도시 산책');
  const [dCameraNote, setDCameraNote] = useState('');
  const [dSummary, setDSummary] = useState('');
  const [dStory, setDStory] = useState('');
  const [dImageUrl, setDImageUrl] = useState<string>(GENERATED_IMAGES.kyotoCourtyard);
  const [dFeatured, setDFeatured] = useState(false);
  const [dPublished, setDPublished] = useState(true);

  // Settings Editor State
  const [sForm, setSForm] = useState<Omit<SiteSettings, 'updatedAt'>>(siteSettings);

  // Inline Delete Confirmations (never use window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setSForm(siteSettings);
    setFullName((prev) => prev || siteSettings.authorName);
    setHeadline((prev) => prev || siteSettings.authorRole);
  }, [siteSettings]);

  const showToast = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(
        'err',
        `파일 크기가 너무 큽니다(${Math.round(file.size / 1024)}KB). 450KB 이하의 PDF/문서 파일을 업로드하거나 아래 본문과 링크로 작성해 주세요.`
      );
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileName(file.name.slice(0, FIELD_LIMITS.fileNameMax));
        setFileMimeType(file.type || 'application/pdf');
        setFileDataUrl(reader.result);
        showToast('ok', `${file.name} 파일이 첨부되었습니다.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResumeSubmit = async (publishImmediately: boolean) => {
    if (!summary.trim()) {
      showToast('err', '이력서 소개 요약을 최소 1줄 이상 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      await onSubmitResume(
        {
          versionTitle,
          fullName,
          headline,
          summary,
          experienceText,
          educationText,
          skillsText,
          linksText,
          fileName,
          fileMimeType,
          fileDataUrl,
          privateMemo,
        },
        publishImmediately
      );
      showToast(
        'ok',
        publishImmediately
          ? '이력서가 제출되어 홈페이지에 공개 게시되었습니다.'
          : '이력서가 비공개 초안으로 안전하게 저장되었습니다.'
      );
    } catch {
      showToast('err', '이력서 저장 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const resetDispatchForm = () => {
    setEditingDispatchId(null);
    setDTitle('');
    setDDestination('');
    setDCountry('');
    setDCoordinates('');
    setDDateLabel('2026.11');
    setDCategory('도시 산책');
    setDCameraNote('');
    setDSummary('');
    setDStory('');
    setDImageUrl(GENERATED_IMAGES.kyotoCourtyard);
    setDFeatured(false);
    setDPublished(true);
  };

  const startEditDispatch = (item: TravelDispatch) => {
    setEditingDispatchId(item.id);
    setDTitle(item.title);
    setDDestination(item.destination);
    setDCountry(item.country);
    setDCoordinates(item.coordinates);
    setDDateLabel(item.dateLabel);
    setDCategory(item.category);
    setDCameraNote(item.cameraNote);
    setDSummary(item.summary);
    setDStory(item.story);
    setDImageUrl(item.imageUrl);
    setDFeatured(item.featured);
    setDPublished(item.isPublished);
  };

  const handleDispatchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dTitle.trim() || !dDestination.trim() || !dSummary.trim() || !dStory.trim()) {
      showToast('err', '제목, 도시, 요약, 본문을 모두 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      await onSaveDispatch(
        {
          title: dTitle,
          destination: dDestination,
          country: dCountry || '대한민국',
          coordinates: dCoordinates || '37.5665° N, 126.9780° E',
          dateLabel: dDateLabel || '2026.11',
          category: dCategory,
          cameraNote: dCameraNote,
          summary: dSummary,
          story: dStory,
          imageUrl: dImageUrl || GENERATED_IMAGES.heroCoastal,
          featured: dFeatured,
          isPublished: dPublished,
        },
        editingDispatchId || undefined
      );
      resetDispatchForm();
      showToast('ok', editingDispatchId ? '여정 기록이 수정되었습니다.' : '새 여정 기록이 추가되었습니다.');
    } catch {
      showToast('err', '여정 기록 저장 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSaveSettings(sForm);
      showToast('ok', '홈페이지 기본 설정이 업데이트되었습니다.');
    } catch {
      showToast('err', '설정 저장 중 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  // Auth Gate for Non-Admin or Unauthenticated Users
  if (!authReady) {
    return (
      <div className="max-w-[960px] mx-auto px-6 py-24 text-center text-sm text-zinc-500">
        인증 상태를 확인하고 있습니다...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <section className="py-20 bg-[#FAFAF9] min-h-[75vh] flex items-center">
        <div className="max-w-lg mx-auto px-6 w-full">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-5 h-5 text-zinc-700" />
            </div>

            <h1 className="font-editorial text-3xl font-semibold text-zinc-900 mb-3">
              소유자 전용 관리자 공간
            </h1>
            <p className="text-sm leading-relaxed text-zinc-600 mb-6">
              이 탭은 홈페이지 소유자(<span className="font-mono text-zinc-800">{ADMIN_EMAIL}</span>)만 확인할 수 있는 비공개 관리자 콘솔입니다. 이력서 제출, 여정 편집, 수신된 엽서를 관리할 수 있습니다.
            </p>

            {user && user.email !== ADMIN_EMAIL ? (
              <div className="space-y-4">
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  현재 로그인된 계정(<span className="font-mono">{user.email}</span>)에는 관리자 권한이 없습니다. 소유자 계정으로 다시 로그인해 주세요.
                </p>
                <button
                  type="button"
                  onClick={() => onSignOut()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-lg border border-zinc-300 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃 후 계정 전환
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSignIn()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Google 계정으로 관리자 로그인
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const unreadCount = inquiries.filter((i) => i.status === 'unread').length;

  return (
    <section className="py-12 bg-[#FAFAF9] min-h-[80vh]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-zinc-200">
          <div>
            <p className="text-xs font-medium text-blue-700 mb-1">
              Owner-Only Private Workspace · {user?.email}
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-zinc-900">
              관리자 콘솔
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(!hasRemoteSettings || !hasRemoteDispatches) && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onSeedDefaults();
                    showToast('ok', '기본 여행 매거진 데이터와 설정을 Firestore에 저장했습니다.');
                  } catch {
                    showToast('err', '초기 데이터 저장 중 오류가 발생했습니다.');
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                기본 여행 데이터 DB에 초기화
              </button>
            )}
            <button
              type="button"
              onClick={() => onSignOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          </div>
        </div>

        {/* Sub-Tab Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-1 p-1 bg-zinc-200/70 rounded-lg w-fit">
          {(
            [
              { id: 'resume', label: '이력서 제출 · 관리' },
              { id: 'dispatches', label: `여정 기록 (${dispatches.length})` },
              {
                id: 'inquiries',
                label: unreadCount > 0 ? `수신 엽서 (${unreadCount} 새 글)` : `수신 엽서 (${inquiries.length})`,
              },
              { id: 'settings', label: '홈페이지 설정' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`mt-6 px-4 py-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* TAB 1: RESUME SUBMISSION & MANAGEMENT */}
        {activeTab === 'resume' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div>
                  <h2 className="font-editorial text-2xl font-semibold text-zinc-900">
                    새 이력서 제출하기
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    이력서가 준비되면 파일 첨부 또는 내용 작성으로 제출하고, 원할 때 홈페이지에 공개할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    버전 이름 (관리자용)
                  </label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.resumeVersionTitleMax}
                    value={versionTitle}
                    onChange={(e) => setVersionTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    성명
                  </label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.authorNameMax}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  직무 / 헤드라인
                </label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.resumeHeadlineMax}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="예: Product Designer · Frontend Engineer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              {/* PDF / Document Upload */}
              <div className="border border-dashed border-zinc-300 rounded-xl p-4 bg-zinc-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-800">
                      이력서 파일 첨부 (선택 · PDF/문서 450KB 이하)
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {fileName ? `첨부됨: ${fileName}` : '파일 없이 아래 텍스트 양식만으로도 제출할 수 있습니다.'}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 cursor-pointer whitespace-nowrap shrink-0">
                    <FileUp className="w-3.5 h-3.5" />
                    파일 선택
                    <input
                      type="file"
                      accept=".pdf,.txt,.md,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {fileDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFileName('');
                      setFileMimeType('');
                      setFileDataUrl('');
                    }}
                    className="mt-2 text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    첨부 파일 제거
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  자기소개 요약 (필수)
                </label>
                <textarea
                  rows={3}
                  maxLength={FIELD_LIMITS.resumeSummaryMax}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="핵심 경력과 지향점을 간결하게 작성해 주세요."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  주요 경력 및 프로젝트
                </label>
                <textarea
                  rows={4}
                  maxLength={FIELD_LIMITS.resumeExperienceMax}
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  placeholder="회사명 / 역할 / 기간 / 주요 성과를 자유롭게 작성하세요."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    학력 및 수료
                  </label>
                  <textarea
                    rows={3}
                    maxLength={FIELD_LIMITS.resumeEducationMax}
                    value={educationText}
                    onChange={(e) => setEducationText(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                    보유 기술 및 도구
                  </label>
                  <textarea
                    rows={3}
                    maxLength={FIELD_LIMITS.resumeSkillsMax}
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  포트폴리오 / GitHub / 링크 (원본 PDF 외부 URL 포함 가능)
                </label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.resumeLinksMax}
                  value={linksText}
                  onChange={(e) => setLinksText(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  나만 보는 비공개 메모 (홈페이지에 표시되지 않음)
                </label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.privateMemoMax}
                  value={privateMemo}
                  onChange={(e) => setPrivateMemo(e.target.value)}
                  placeholder="지원 기업, 수정할 포인트 등 개인 메모"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleResumeSubmit(false)}
                  className="px-5 py-2.5 text-xs font-medium rounded-lg border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  비공개 초안으로 저장
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleResumeSubmit(true)}
                  className="px-5 py-2.5 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  제출 및 홈페이지에 공개 게시
                </button>
              </div>
            </div>

            {/* Right Column: Submitted Resume History */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-editorial text-xl font-semibold text-zinc-900">
                    제출된 이력서 보관함
                  </h3>
                  {siteSettings.resumeStatus === 'published' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await onUnpublishResume();
                          showToast('ok', '홈페이지 이력서를 비공개(준비 중) 상태로 전환했습니다.');
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      공개 내리기
                    </button>
                  )}
                </div>

                {privateResumes.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-8 text-center">
                    아직 제출된 이력서가 없습니다. 왼쪽 양식에서 첫 이력서를 제출해 보세요.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {privateResumes.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-zinc-200 bg-[#FAFAF9] space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {r.versionTitle}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {r.fullName} · {r.headline}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium whitespace-nowrap ${
                              r.isActivePublic ? 'text-blue-700' : 'text-zinc-500'
                            }`}
                          >
                            {r.isActivePublic ? '현재 공개 중' : '비공개 보관'}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {r.summary}
                        </p>

                        {r.privateMemo && (
                          <p className="text-xs text-zinc-500 bg-white border border-zinc-200 rounded px-2.5 py-1.5">
                            메모: {r.privateMemo}
                          </p>
                        )}

                        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                          {!r.isActivePublic && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={async () => {
                                setBusy(true);
                                try {
                                  await onPublishExistingResume(r);
                                  showToast('ok', `'${r.versionTitle}' 버전을 홈페이지에 공개했습니다.`);
                                } finally {
                                  setBusy(false);
                                }
                              }}
                              className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              이 버전 공개하기
                            </button>
                          )}

                          {r.fileDataUrl && (
                            <a
                              href={r.fileDataUrl}
                              download={r.fileName || 'resume.pdf'}
                              className="inline-flex items-center gap-1 text-zinc-700 hover:underline"
                            >
                              <Download className="w-3.5 h-3.5" />
                              파일 받기
                            </a>
                          )}

                          {confirmDeleteId === r.id ? (
                            <span className="inline-flex items-center gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteResume(r.id);
                                  setConfirmDeleteId(null);
                                  showToast('ok', '이력서 기록을 삭제했습니다.');
                                }}
                                className="text-red-600 font-semibold hover:underline cursor-pointer"
                              >
                                삭제 확인
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-zinc-500 hover:underline cursor-pointer"
                              >
                                취소
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(r.id)}
                              className="inline-flex items-center gap-1 text-zinc-500 hover:text-red-600 ml-auto cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVEL DISPATCHES MANAGER */}
        {activeTab === 'dispatches' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleDispatchSubmit}
              className="lg:col-span-6 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h2 className="font-editorial text-2xl font-semibold text-zinc-900">
                  {editingDispatchId ? '여정 기록 수정' : '새 여정 기록 작성'}
                </h2>
                {editingDispatchId && (
                  <button
                    type="button"
                    onClick={resetDispatchForm}
                    className="text-xs text-zinc-600 hover:underline cursor-pointer"
                  >
                    새 글 작성으로 전환
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">제목</label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.dispatchTitleMax}
                  value={dTitle}
                  onChange={(e) => setDTitle(e.target.value)}
                  placeholder="예: 바르셀로나 고딕 지구의 오후 빛"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">도시/장소</label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.destinationMax}
                    value={dDestination}
                    onChange={(e) => setDDestination(e.target.value)}
                    placeholder="바르셀로나"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">국가</label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.countryMax}
                    value={dCountry}
                    onChange={(e) => setDCountry(e.target.value)}
                    placeholder="스페인"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">카테고리</label>
                  <select
                    value={dCategory}
                    onChange={(e) => setDCategory(e.target.value as DispatchCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
                  >
                    {DISPATCH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">날짜</label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.dateLabelMax}
                    value={dDateLabel}
                    onChange={(e) => setDDateLabel(e.target.value)}
                    placeholder="2026.11"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">좌표</label>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.coordinatesMax}
                    value={dCoordinates}
                    onChange={(e) => setDCoordinates(e.target.value)}
                    placeholder="41.3851° N, 2.1734° E"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  대표 이미지 선택 또는 URL 입력
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: '교토 안뜰', url: GENERATED_IMAGES.kyotoCourtyard },
                    { label: '지중해 테라스', url: GENERATED_IMAGES.heroCoastal },
                    { label: '리스본 골목', url: GENERATED_IMAGES.lisbonAlley },
                    { label: '북유럽 절벽', url: GENERATED_IMAGES.nordicCliffs },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setDImageUrl(preset.url)}
                      className={`px-2.5 py-1 text-xs rounded border cursor-pointer ${
                        dImageUrl === preset.url
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.imageUrlMax}
                  value={dImageUrl}
                  onChange={(e) => setDImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">카메라 / 작업 메모</label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.cameraNoteMax}
                  value={dCameraNote}
                  onChange={(e) => setDCameraNote(e.target.value)}
                  placeholder="Leica M6 · 35mm"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">카드 한 줄 요약</label>
                <textarea
                  rows={2}
                  maxLength={FIELD_LIMITS.summaryMax}
                  value={dSummary}
                  onChange={(e) => setDSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">에디토리얼 본문</label>
                <textarea
                  rows={5}
                  maxLength={FIELD_LIMITS.storyMax}
                  value={dStory}
                  onChange={(e) => setDStory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-700">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dPublished}
                    onChange={(e) => setDPublished(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  홈페이지에 공개
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dFeatured}
                    onChange={(e) => setDFeatured(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  대표 2x2 Bento 카드로 강조
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editingDispatchId ? '수정 저장하기' : '여정 기록 등록하기'}
              </button>
            </form>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                <h3 className="font-editorial text-xl font-semibold text-zinc-900 mb-4">
                  등록된 여정 목록
                </h3>
                {dispatches.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-8 text-center">
                    DB에 저장된 여정이 없습니다. 상단의 &apos;기본 여행 데이터 DB에 초기화&apos;를 누르거나 새 글을 작성하세요.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dispatches.map((d) => (
                      <div
                        key={d.id}
                        className="p-4 rounded-xl border border-zinc-200 bg-[#FAFAF9] flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{d.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {d.destination} · {d.dateLabel} · {d.category}
                            </p>
                          </div>
                          <span className="text-xs text-zinc-500 whitespace-nowrap">
                            {d.isPublished ? '공개' : '비공개'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <button
                            type="button"
                            onClick={() => startEditDispatch(d)}
                            className="text-blue-700 font-medium hover:underline cursor-pointer"
                          >
                            편집
                          </button>
                          {confirmDeleteId === d.id ? (
                            <span className="inline-flex items-center gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onDeleteDispatch(d.id);
                                  setConfirmDeleteId(null);
                                  showToast('ok', '여정 기록을 삭제했습니다.');
                                }}
                                className="text-red-600 font-semibold hover:underline cursor-pointer"
                              >
                                삭제 확인
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-zinc-500 hover:underline cursor-pointer"
                              >
                                취소
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(d.id)}
                              className="text-zinc-500 hover:text-red-600 ml-auto cursor-pointer"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRIVATE VISITOR INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="mt-8 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 mb-6">
              <Inbox className="w-5 h-5 text-zinc-700" />
              <h2 className="font-editorial text-2xl font-semibold text-zinc-900">
                수신된 엽서함 (관리자 전용)
              </h2>
            </div>

            {inquiries.length === 0 ? (
              <p className="text-sm text-zinc-500 py-10 text-center">
                아직 도착한 엽서가 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`p-5 rounded-xl border ${
                      inq.status === 'unread'
                        ? 'border-blue-200 bg-blue-50/40'
                        : 'border-zinc-200 bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{inq.subject}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {inq.senderName} ({inq.senderEmail})
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          inq.status === 'unread' ? 'text-blue-700' : 'text-zinc-500'
                        }`}
                      >
                        {inq.status === 'unread' ? '새 엽서' : '확인 완료'}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line my-3">
                      {inq.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-zinc-200/70">
                      <button
                        type="button"
                        onClick={() =>
                          onMarkInquiry(inq.id, inq.status === 'unread' ? 'read' : 'unread')
                        }
                        className="text-blue-700 font-medium hover:underline cursor-pointer"
                      >
                        {inq.status === 'unread' ? '읽음으로 표시' : '안읽음으로 표시'}
                      </button>

                      {confirmDeleteId === inq.id ? (
                        <span className="inline-flex items-center gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteInquiry(inq.id);
                              setConfirmDeleteId(null);
                              showToast('ok', '엽서를 삭제했습니다.');
                            }}
                            className="text-red-600 font-semibold hover:underline cursor-pointer"
                          >
                            삭제 확인
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-zinc-500 hover:underline cursor-pointer"
                          >
                            취소
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(inq.id)}
                          className="text-zinc-500 hover:text-red-600 ml-auto cursor-pointer"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSettingsSubmit}
            className="mt-8 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 max-w-3xl space-y-5"
          >
            <h2 className="font-editorial text-2xl font-semibold text-zinc-900 border-b border-zinc-200 pb-4">
              홈페이지 프로필 및 에디토리얼 설정
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  브랜드 타이틀 (상단 바)
                </label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.siteTitleMax}
                  value={sForm.siteTitle}
                  onChange={(e) => setSForm({ ...sForm, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  공개 이메일
                </label>
                <input
                  type="email"
                  maxLength={FIELD_LIMITS.contactEmailMax}
                  value={sForm.contactEmail}
                  onChange={(e) => setSForm({ ...sForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                히어로 소제목 (Kicker)
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.heroKickerMax}
                value={sForm.heroKicker}
                onChange={(e) => setSForm({ ...sForm, heroKicker: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                히어로 메인 타이틀
              </label>
              <input
                type="text"
                maxLength={FIELD_LIMITS.heroHeadlineMax}
                value={sForm.heroHeadline}
                onChange={(e) => setSForm({ ...sForm, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                히어로 소개 문구
              </label>
              <textarea
                rows={3}
                maxLength={FIELD_LIMITS.heroDescriptionMax}
                value={sForm.heroDescription}
                onChange={(e) => setSForm({ ...sForm, heroDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">작성자 이름</label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.authorNameMax}
                  value={sForm.authorName}
                  onChange={(e) => setSForm({ ...sForm, authorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">역할 / 직무</label>
                <input
                  type="text"
                  maxLength={FIELD_LIMITS.authorRoleMax}
                  value={sForm.authorRole}
                  onChange={(e) => setSForm({ ...sForm, authorRole: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">소개 본문</label>
              <textarea
                rows={4}
                maxLength={FIELD_LIMITS.authorBioMax}
                value={sForm.authorBio}
                onChange={(e) => setSForm({ ...sForm, authorBio: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">방문 도시 수</label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={sForm.citiesExplored}
                  onChange={(e) =>
                    setSForm({ ...sForm, citiesExplored: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">발행 노트 수</label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={sForm.dispatchesCount}
                  onChange={(e) =>
                    setSForm({ ...sForm, dispatchesCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">프로젝트 수</label>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={sForm.projectsCount}
                  onChange={(e) =>
                    setSForm({ ...sForm, projectsCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2.5 text-xs font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
            >
              설정 저장하기
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
