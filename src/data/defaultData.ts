import type { SiteSettings, TravelDispatch } from '../types';

export const GENERATED_IMAGES = {
  heroCoastal: '/src/assets/images/hero_coastal_terrace_1794820081893.jpg',
  kyotoCourtyard: '/src/assets/images/dispatch_kyoto_courtyard_1794820082563.jpg',
  nordicCliffs: '/src/assets/images/dispatch_nordic_cliffs_1794820083556.jpg',
  lisbonAlley: '/src/assets/images/dispatch_lisbon_alley_1794820082882.jpg',
  authorPortrait: '/src/assets/images/author_window_portrait_1794820083846.jpg',
} as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'Wayfarer',
  heroKicker: 'Volume 01 · Personal Travelogue & Portfolio',
  heroHeadline: '머무른 곳의 시선으로, 나만의 항해를 기록하다',
  heroDescription:
    '낯선 도시의 골목과 고요한 바다 앞에서 길어 올린 생각들을 여행 매거진처럼 엮은 개인 홈페이지입니다. 곧 정식 이력서와 함께 새로운 여정을 공개합니다.',
  authorName: 'Traveler & Creator',
  authorRole: 'Visual Storyteller · Product Builder',
  authorBio:
    '기록은 머무름의 또 다른 방식이라고 믿습니다. 35mm 필름 카메라와 한 권의 수첩을 들고 걸으며, 공간의 결이 살아 있는 디지털 경험과 에디토리얼 프로젝트를 만들어갑니다.',
  contactEmail: 'mee3955@gmail.com',
  citiesExplored: 18,
  dispatchesCount: 4,
  projectsCount: 12,
  resumeStatus: 'preparing',
};

export const DEFAULT_DISPATCHES: TravelDispatch[] = [
  {
    id: 'kyoto-dawn-courtyard',
    title: '새벽 안개가 머무는 교토 마치야의 안뜰',
    destination: '교토 나카교구',
    country: '일본',
    coordinates: '35.0116° N, 135.7681° E',
    dateLabel: '2026.10',
    category: '건축 & 공간',
    cameraNote: 'Leica M6 · 35mm Summicron · ISO 400',
    summary:
      '비 온 뒤 이끼 위로 스며드는 새벽빛과 100년 된 삼나무 처마가 만드는 고요한 비례감에 대한 기록.',
    story:
      '교토의 골목은 이른 여섯 시가 가장 솔직하다. 관광 인파가 깨어나기 전, 오래된 마치야의 미닫이문 너머로 물뿌리는 소리가 들려온다.\n\n돌길과 젖은 이끼, 그리고 얕은 처마 아래로 떨어지는 그림자의 경계는 언제나 불필요한 장식을 덜어낸 디자인을 떠올리게 한다. 공간이 사람에게 강요하지 않고 그저 호흡할 여백을 내어줄 때, 비로소 오래 머물고 싶은 경험이 완성된다.',
    imageUrl: GENERATED_IMAGES.kyotoCourtyard,
    featured: true,
    isPublished: true,
  },
  {
    id: 'aegean-morning-terrace',
    title: '에게해의 푸른 수평선과 석회암 테라스',
    destination: '키클라데스 제도',
    country: '그리스',
    coordinates: '36.3932° N, 25.4615° E',
    dateLabel: '2026.08',
    category: '자연 & 풍경',
    cameraNote: '35mm Film · Morning Light · f/5.6',
    summary:
      '햇살이 바다에 닿기 직전, 바람과 돌계단만 남은 절벽 테라스에서 마주한 완벽한 정적.',
    story:
      '섬의 아침은 빛의 온도로 시작된다. 거친 석회암 난간 너머로 잔잔한 만이 펼쳐지고, 하얀 지붕의 작은 마을은 아직 잠들어 있다.\n\n여행지에서 마주하는 압도적인 색감은 결코 과장되지 않는다. 깊은 코발트빛 바다와 담백한 사암의 대비처럼, 화면을 설계할 때도 단 하나의 확실한 시선만 남기는 절제가 필요하다.',
    imageUrl: GENERATED_IMAGES.heroCoastal,
    featured: false,
    isPublished: true,
  },
  {
    id: 'lisbon-limestone-afternoon',
    title: '리스본 알파마, 오후 세 시의 세라믹 골목',
    destination: '리스본 알파마',
    country: '포르투갈',
    coordinates: '38.7117° N, 9.1303° W',
    dateLabel: '2026.06',
    category: '도시 산책',
    cameraNote: 'Rangefinder · 50mm · Kodak Portra',
    summary:
      '기하학적인 아줄레주 타일 벽면과 대서양을 향해 내려가는 가파른 자갈길의 리듬.',
    story:
      '리스본의 길은 오르막과 내리막이 곧 이야기의 기승전결이다. 모퉁이를 돌 때마다 푸른 타일 벽면이 오후의 햇빛을 반사하고, 골목 끝에서는 어김없이 타구스 강 너머의 수평선이 모습을 드러낸다.\n\n오래된 것과 현대의 삶이 부딪히지 않고 겹쳐지는 도시의 풍경은, 내 작업의 영감이 가장 깊게 머무는 지점이다.',
    imageUrl: GENERATED_IMAGES.lisbonAlley,
    featured: false,
    isPublished: true,
  },
  {
    id: 'north-atlantic-basalt',
    title: '은빛 안개와 현무암 절벽의 노트',
    destination: '북대서양 연안',
    country: '아이슬란드',
    coordinates: '63.4186° N, 19.0060° W',
    dateLabel: '2026.04',
    category: '작업 노트',
    cameraNote: 'Medium Format · Overcast · f/8',
    summary:
      '색채가 지워진 회색 하늘과 검은 바위 사이에서 정리한 다음 프로젝트의 방향성.',
    story:
      '모든 색이 가라앉은 날, 풍경은 오히려 선명한 구조를 드러낸다. 젖은 자갈과 거친 절벽, 그리고 수평선으로 이어지는 안개의 층위는 한 편의 에디토리얼 레이아웃과 닮아 있다.\n\n이곳에서 써 내려간 수첩의 문장들은 곧 다가올 새로운 커리어와 이력서의 첫 장이 될 것이다.',
    imageUrl: GENERATED_IMAGES.nordicCliffs,
    featured: false,
    isPublished: true,
  },
];
