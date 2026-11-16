import { useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { DEFAULT_DISPATCHES, DEFAULT_SITE_SETTINGS } from '../data/defaultData';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  FIELD_LIMITS,
  type PrivateResume,
  type PublicResume,
  type SiteSettings,
  type TravelDispatch,
  type VisitorInquiry,
} from '../types';

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export function usePortfolioData() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [hasRemoteSettings, setHasRemoteSettings] = useState(false);

  const [dispatches, setDispatches] = useState<TravelDispatch[]>(DEFAULT_DISPATCHES);
  const [hasRemoteDispatches, setHasRemoteDispatches] = useState(false);

  const [publicResume, setPublicResume] = useState<PublicResume | null>(null);
  const [privateResumes, setPrivateResumes] = useState<PrivateResume[]>([]);
  const [inquiries, setInquiries] = useState<VisitorInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    return Boolean(user && user.emailVerified && user.email === ADMIN_EMAIL);
  }, [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Public site settings listener
  useEffect(() => {
    const settingsPath = 'site_settings/main';
    const unsub = onSnapshot(
      doc(db, 'site_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings(snap.data() as SiteSettings);
          setHasRemoteSettings(true);
        } else {
          setSiteSettings(DEFAULT_SITE_SETTINGS);
          setHasRemoteSettings(false);
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      }
    );
    return () => unsub();
  }, []);

  // Dispatches listener (public published items for visitors; all items for admin)
  useEffect(() => {
    if (!authReady) return;
    const dispatchesPath = 'dispatches';
    const q = isAdmin
      ? query(collection(db, dispatchesPath), orderBy('createdAt', 'desc'))
      : query(collection(db, dispatchesPath), where('isPublished', '==', true));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && !isAdmin) {
          setDispatches(DEFAULT_DISPATCHES);
          setHasRemoteDispatches(false);
        } else if (snapshot.empty && isAdmin) {
          setDispatches([]);
          setHasRemoteDispatches(false);
        } else {
          const items = snapshot.docs
            .map((d) => ({
              id: d.id,
              ...(d.data() as Omit<TravelDispatch, 'id'>),
            }))
            .sort((a, b) => {
              const ta =
                a.createdAt && 'toMillis' in a.createdAt
                  ? a.createdAt.toMillis()
                  : 0;
              const tb =
                b.createdAt && 'toMillis' in b.createdAt
                  ? b.createdAt.toMillis()
                  : 0;
              return tb - ta;
            });
          setDispatches(items);
          setHasRemoteDispatches(true);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, dispatchesPath);
      }
    );

    return () => unsub();
  }, [authReady, isAdmin]);

  // Public resume listener (only attach if resumeStatus is published or user is admin)
  useEffect(() => {
    if (!authReady) return;
    if (!isAdmin && siteSettings.resumeStatus !== 'published') {
      setPublicResume(null);
      return;
    }

    const path = 'public_resume/current';
    const unsub = onSnapshot(
      doc(db, 'public_resume', 'current'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as PublicResume;
          if (data.isVisible || isAdmin) {
            setPublicResume(data);
          } else {
            setPublicResume(null);
          }
        } else {
          setPublicResume(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, [authReady, isAdmin, siteSettings.resumeStatus]);

  // Private admin collections (resumes & inquiries)
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setPrivateResumes([]);
      setInquiries([]);
      return;
    }

    const resumesPath = 'resumes';
    const unsubResumes = onSnapshot(
      query(collection(db, resumesPath), orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PrivateResume, 'id'>),
        }));
        setPrivateResumes(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, resumesPath);
      }
    );

    const inquiriesPath = 'inquiries';
    const unsubInquiries = onSnapshot(
      query(collection(db, inquiriesPath), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<VisitorInquiry, 'id'>),
        }));
        setInquiries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, inquiriesPath);
      }
    );

    return () => {
      unsubResumes();
      unsubInquiries();
    };
  }, [authReady, isAdmin]);

  const signInWithGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const saveSiteSettings = async (next: Omit<SiteSettings, 'updatedAt'>) => {
    const path = 'site_settings/main';
    const payload = {
      siteTitle: clip(next.siteTitle, FIELD_LIMITS.siteTitleMax) || 'Wayfarer',
      heroKicker: clip(next.heroKicker, FIELD_LIMITS.heroKickerMax) || 'Volume 01',
      heroHeadline: clip(next.heroHeadline, FIELD_LIMITS.heroHeadlineMax) || 'Travelogue',
      heroDescription: clip(next.heroDescription, FIELD_LIMITS.heroDescriptionMax) || '-',
      authorName: clip(next.authorName, FIELD_LIMITS.authorNameMax) || 'Owner',
      authorRole: clip(next.authorRole, FIELD_LIMITS.authorRoleMax) || 'Creator',
      authorBio: clip(next.authorBio, FIELD_LIMITS.authorBioMax) || '-',
      contactEmail: clip(next.contactEmail, FIELD_LIMITS.contactEmailMax) || ADMIN_EMAIL,
      citiesExplored: Math.max(0, Math.min(10000, Math.round(Number(next.citiesExplored) || 0))),
      dispatchesCount: Math.max(0, Math.min(10000, Math.round(Number(next.dispatchesCount) || 0))),
      projectsCount: Math.max(0, Math.min(10000, Math.round(Number(next.projectsCount) || 0))),
      resumeStatus: next.resumeStatus === 'published' ? 'published' : 'preparing',
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'site_settings', 'main'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const seedDefaultData = async () => {
    await saveSiteSettings({
      ...DEFAULT_SITE_SETTINGS,
      resumeStatus: siteSettings.resumeStatus,
    });
    for (const item of DEFAULT_DISPATCHES) {
      const path = `dispatches/${item.id}`;
      try {
        await setDoc(doc(db, 'dispatches', item.id), {
          title: clip(item.title, FIELD_LIMITS.dispatchTitleMax),
          destination: clip(item.destination, FIELD_LIMITS.destinationMax),
          country: clip(item.country, FIELD_LIMITS.countryMax),
          coordinates: clip(item.coordinates, FIELD_LIMITS.coordinatesMax),
          dateLabel: clip(item.dateLabel, FIELD_LIMITS.dateLabelMax),
          category: item.category,
          cameraNote: clip(item.cameraNote, FIELD_LIMITS.cameraNoteMax),
          summary: clip(item.summary, FIELD_LIMITS.summaryMax),
          story: clip(item.story, FIELD_LIMITS.storyMax),
          imageUrl: clip(item.imageUrl, FIELD_LIMITS.imageUrlMax),
          featured: Boolean(item.featured),
          isPublished: Boolean(item.isPublished),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  const saveDispatch = async (
    input: Omit<TravelDispatch, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const clean = {
      title: clip(input.title, FIELD_LIMITS.dispatchTitleMax),
      destination: clip(input.destination, FIELD_LIMITS.destinationMax),
      country: clip(input.country, FIELD_LIMITS.countryMax),
      coordinates: clip(input.coordinates, FIELD_LIMITS.coordinatesMax),
      dateLabel: clip(input.dateLabel, FIELD_LIMITS.dateLabelMax),
      category: input.category,
      cameraNote: clip(input.cameraNote, FIELD_LIMITS.cameraNoteMax),
      summary: clip(input.summary, FIELD_LIMITS.summaryMax),
      story: clip(input.story, FIELD_LIMITS.storyMax),
      imageUrl: clip(input.imageUrl, FIELD_LIMITS.imageUrlMax),
      featured: Boolean(input.featured),
      isPublished: Boolean(input.isPublished),
    };

    if (existingId) {
      const path = `dispatches/${existingId}`;
      try {
        await updateDoc(doc(db, 'dispatches', existingId), {
          ...clean,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const path = 'dispatches';
      try {
        await addDoc(collection(db, 'dispatches'), {
          ...clean,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  const deleteDispatch = async (dispatchId: string) => {
    const path = `dispatches/${dispatchId}`;
    try {
      await deleteDoc(doc(db, 'dispatches', dispatchId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const submitResumeVersion = async (
    input: {
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
  ) => {
    if (!user) throw new Error('인증이 필요합니다.');
    const clean = {
      versionTitle: clip(input.versionTitle, FIELD_LIMITS.resumeVersionTitleMax) || '이력서 초안',
      fullName: clip(input.fullName, FIELD_LIMITS.authorNameMax) || siteSettings.authorName,
      headline: clip(input.headline, FIELD_LIMITS.resumeHeadlineMax) || siteSettings.authorRole,
      summary: clip(input.summary, FIELD_LIMITS.resumeSummaryMax) || '-',
      experienceText: clip(input.experienceText, FIELD_LIMITS.resumeExperienceMax),
      educationText: clip(input.educationText, FIELD_LIMITS.resumeEducationMax),
      skillsText: clip(input.skillsText, FIELD_LIMITS.resumeSkillsMax),
      linksText: clip(input.linksText, FIELD_LIMITS.resumeLinksMax),
      fileName: clip(input.fileName, FIELD_LIMITS.fileNameMax),
      fileMimeType: clip(input.fileMimeType, 120),
      fileDataUrl: input.fileDataUrl.slice(0, FIELD_LIMITS.fileDataUrlMax),
      privateMemo: clip(input.privateMemo, FIELD_LIMITS.privateMemoMax),
      isActivePublic: publishImmediately,
      ownerUid: user.uid,
    };

    try {
      // Unmark previous active flags if publishing
      if (publishImmediately) {
        for (const prev of privateResumes) {
          if (prev.isActivePublic) {
            await updateDoc(doc(db, 'resumes', prev.id), {
              isActivePublic: false,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      await addDoc(collection(db, 'resumes'), {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (publishImmediately) {
        await setDoc(doc(db, 'public_resume', 'current'), {
          fullName: clean.fullName,
          headline: clean.headline,
          summary: clean.summary,
          experienceText: clean.experienceText,
          educationText: clean.educationText,
          skillsText: clean.skillsText,
          linksText: clean.linksText,
          fileName: clean.fileName,
          fileMimeType: clean.fileMimeType,
          fileDataUrl: clean.fileDataUrl,
          isVisible: true,
          updatedAt: serverTimestamp(),
        });
        await saveSiteSettings({
          ...siteSettings,
          resumeStatus: 'published',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'resumes');
    }
  };

  const publishExistingResume = async (resume: PrivateResume) => {
    try {
      for (const prev of privateResumes) {
        if (prev.id !== resume.id && prev.isActivePublic) {
          await updateDoc(doc(db, 'resumes', prev.id), {
            isActivePublic: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
      await updateDoc(doc(db, 'resumes', resume.id), {
        isActivePublic: true,
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'public_resume', 'current'), {
        fullName: resume.fullName,
        headline: resume.headline,
        summary: resume.summary,
        experienceText: resume.experienceText,
        educationText: resume.educationText,
        skillsText: resume.skillsText,
        linksText: resume.linksText,
        fileName: resume.fileName,
        fileMimeType: resume.fileMimeType,
        fileDataUrl: resume.fileDataUrl,
        isVisible: true,
        updatedAt: serverTimestamp(),
      });
      await saveSiteSettings({
        ...siteSettings,
        resumeStatus: 'published',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'public_resume/current');
    }
  };

  const unpublishPublicResume = async () => {
    try {
      for (const prev of privateResumes) {
        if (prev.isActivePublic) {
          await updateDoc(doc(db, 'resumes', prev.id), {
            isActivePublic: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
      if (publicResume) {
        await updateDoc(doc(db, 'public_resume', 'current'), {
          isVisible: false,
          updatedAt: serverTimestamp(),
        });
      }
      await saveSiteSettings({
        ...siteSettings,
        resumeStatus: 'preparing',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'public_resume/current');
    }
  };

  const deleteResumeVersion = async (resumeId: string) => {
    const path = `resumes/${resumeId}`;
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const submitInquiry = async (subject: string, message: string) => {
    if (!user || !user.emailVerified) {
      throw new Error('이메일 인증이 완료된 Google 계정이 필요합니다.');
    }
    const path = 'inquiries';
    try {
      await addDoc(collection(db, 'inquiries'), {
        senderUid: user.uid,
        senderName: clip(user.displayName || '방문자', FIELD_LIMITS.authorNameMax),
        senderEmail: clip(user.email || '', FIELD_LIMITS.contactEmailMax),
        subject: clip(subject, FIELD_LIMITS.inquirySubjectMax),
        message: clip(message, FIELD_LIMITS.inquiryMessageMax),
        status: 'unread',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const markInquiryStatus = async (inquiryId: string, status: 'unread' | 'read') => {
    const path = `inquiries/${inquiryId}`;
    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    const path = `inquiries/${inquiryId}`;
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return {
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
  };
}
