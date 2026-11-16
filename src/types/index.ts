import type { Timestamp } from 'firebase/firestore';

export type DispatchCategory = '도시 산책' | '자연 & 풍경' | '건축 & 공간' | '작업 노트';

export const DISPATCH_CATEGORIES: DispatchCategory[] = [
  '도시 산책',
  '자연 & 풍경',
  '건축 & 공간',
  '작업 노트',
];

export const FIELD_LIMITS = {
  siteTitleMax: 80,
  heroKickerMax: 120,
  heroHeadlineMax: 160,
  heroDescriptionMax: 600,
  authorNameMax: 80,
  authorRoleMax: 120,
  authorBioMax: 1000,
  contactEmailMax: 120,
  dispatchTitleMax: 140,
  destinationMax: 100,
  countryMax: 80,
  coordinatesMax: 60,
  dateLabelMax: 40,
  cameraNoteMax: 100,
  summaryMax: 400,
  storyMax: 5000,
  imageUrlMax: 600,
  resumeVersionTitleMax: 120,
  resumeHeadlineMax: 160,
  resumeSummaryMax: 2500,
  resumeExperienceMax: 6000,
  resumeEducationMax: 2000,
  resumeSkillsMax: 1000,
  resumeLinksMax: 1000,
  fileNameMax: 200,
  fileDataUrlMax: 700000,
  privateMemoMax: 1500,
  inquirySubjectMax: 140,
  inquiryMessageMax: 2000,
} as const;

export interface SiteSettings {
  siteTitle: string;
  heroKicker: string;
  heroHeadline: string;
  heroDescription: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  contactEmail: string;
  citiesExplored: number;
  dispatchesCount: number;
  projectsCount: number;
  resumeStatus: 'preparing' | 'published';
  updatedAt?: Timestamp | Date | null;
}

export interface TravelDispatch {
  id: string;
  title: string;
  destination: string;
  country: string;
  coordinates: string;
  dateLabel: string;
  category: DispatchCategory;
  cameraNote: string;
  summary: string;
  story: string;
  imageUrl: string;
  featured: boolean;
  isPublished: boolean;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface PrivateResume {
  id: string;
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
  isActivePublic: boolean;
  ownerUid: string;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface PublicResume {
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
  isVisible: boolean;
  updatedAt?: Timestamp | Date | null;
}

export interface VisitorInquiry {
  id: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt?: Timestamp | Date | null;
}
