import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Mail, Send } from 'lucide-react';
import type { User } from 'firebase/auth';
import { GENERATED_IMAGES } from '../data/defaultData';
import { FIELD_LIMITS, type SiteSettings } from '../types';
import { ResilientImage } from './ResilientImage';

interface AboutAndPostcardProps {
  settings: SiteSettings;
  user: User | null;
  onSignIn: () => Promise<void>;
  onSubmitInquiry: (subject: string, message: string) => Promise<void>;
}

export function AboutAndPostcard({
  settings,
  user,
  onSignIn,
  onSubmitInquiry,
}: AboutAndPostcardProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user || !user.emailVerified) {
      try {
        await onSignIn();
      } catch {
        setErrorMsg('Google 계정 인증이 취소되었거나 실패했습니다.');
      }
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setErrorMsg('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitInquiry(subject, message);
      setSubject('');
      setMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 6000);
    } catch {
      setErrorMsg('메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* About Section */}
      <section id="about" className="py-20 bg-white border-b border-zinc-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                <ResilientImage
                  src={GENERATED_IMAGES.authorPortrait}
                  alt={`${settings.authorName} 프로필 사진`}
                  fallbackTitle={settings.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-zinc-500 mb-2">
                03. About the Author
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 mb-3 text-balance">
                {settings.authorName}
              </h2>
              <p className="text-sm font-medium text-blue-700 mb-6">
                {settings.authorRole}
              </p>

              <p className="text-[16px] leading-[1.8] text-zinc-700 max-w-2xl whitespace-pre-line mb-8">
                {settings.authorBio}
              </p>

              <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center gap-6 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="font-mono text-xs">{settings.contactEmail}</span>
                </div>
                <a
                  href="https://github.com/mee3955-oss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-zinc-700 hover:text-blue-700 transition-colors"
                >
                  <span>GitHub · @mee3955-oss</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/mee3955-oss/yeongmi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-zinc-700 hover:text-blue-700 transition-colors"
                >
                  <span>Repository · yeongmi</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Postcard Section */}
      <section id="contact" className="py-20 bg-[#FAFAF9]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium text-zinc-500 mb-2">
                04. Send a Postcard
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 mb-4 text-balance">
                여정 중 엽서 보내기
              </h2>
              <p className="text-[15px] leading-[1.7] text-zinc-600 mb-6">
                프로젝트 협업, 커피챗, 혹은 여행 기록에 대한 감상을 편하게 남겨주세요. 남겨주신 메시지는 관리자 본인만 확인할 수 있는 개인 수신함에 안전하게 보관됩니다.
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                스팸 방지를 위해 Google 계정 인증 후 엽서를 발송할 수 있습니다.
              </p>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-5"
              >
                {user && user.emailVerified ? (
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-200 text-xs text-zinc-600">
                    <span>
                      발신자 확인: <strong className="text-zinc-900">{user.displayName || user.email}</strong> ({user.email})
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
                    <p className="text-xs text-zinc-600">
                      엽서를 보내려면 Google 계정 확인이 필요합니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => onSignIn()}
                      className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 text-zinc-800 hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Google 계정으로 확인
                    </button>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="postcard-subject"
                    className="block text-xs font-medium text-zinc-700 mb-1.5"
                  >
                    제목
                  </label>
                  <input
                    id="postcard-subject"
                    type="text"
                    maxLength={FIELD_LIMITS.inquirySubjectMax}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="예: 리스본 글 잘 읽었습니다 / 프로젝트 협업 문의"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postcard-message"
                    className="block text-xs font-medium text-zinc-700 mb-1.5"
                  >
                    메시지
                  </label>
                  <textarea
                    id="postcard-message"
                    rows={5}
                    maxLength={FIELD_LIMITS.inquiryMessageMax}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="전하고 싶은 이야기를 작성해 주세요."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent resize-y"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-red-600" role="alert">
                    {errorMsg}
                  </p>
                )}

                {sent && (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>엽서가 성공적으로 전달되었습니다.</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {!user
                      ? 'Google 확인 후 보내기'
                      : submitting
                        ? '전송 중...'
                        : '엽서 보내기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
