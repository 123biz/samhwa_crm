// ══════════════════════════════════════════════════
// 삼화메디칼 CRM Mock Data Layer
// ══════════════════════════════════════════════════

export const products = [
  { id: 'body_love', name: '소모코 바디러브', price: 2980000, annualSales: 6000, product_url: 'https://www.samhwamc.com/product/detail.html?product_no=22&cate_no=43&display_group=1',
    image: '🫶', description: '전신 진동 마사지기', category: '건강기기',
    features: ['전신 마사지', '다단계 진동', '리모컨 포함'],
    symptoms: [
      { code: 'CHARGE', name: '충전 안 됨', solution: '충전 어댑터를 확인하고 콘센트를 교체해 주세요. 충전 LED가 깜빡이면 본사 AS 접수가 필요합니다.', videoUrl: '#' },
      { code: 'OPERATION', name: '작동법 미숙지', solution: '전원 버튼을 3초간 누르면 켜집니다. 리모컨 모드 버튼으로 강도를 조절할 수 있습니다.', videoUrl: '#' },
      { code: 'NOISE', name: '소음/진동 이상', solution: '제품을 평평한 바닥에 놓고 사용해 주세요. 내부 볼트 풀림일 경우 AS 접수가 필요합니다.', videoUrl: '#' },
    ]
  },
  { id: 'ankle', name: '발목 펌핑 운동기', price: 2980000, annualSales: 10000,
    image: '🦶', description: '발목 관절 운동기', category: '건강기기',
    features: ['관절 유연성', '혈액순환', '간편 사용'],
    symptoms: [
      { code: 'OPERATION', name: '작동법 미숙지', solution: '발을 페달 위에 올려놓고 발목을 위아래로 움직여 주세요. 속도 조절은 측면 다이얼로 합니다.', videoUrl: '#' },
      { code: 'PARTS', name: '부품 파손/마모', solution: '페달 패드가 마모된 경우 교체용 패드를 구매할 수 있습니다. 고객센터(1551-1346)로 문의해 주세요.', videoUrl: '#' },
      { code: 'CHARGE', name: '충전 문제', solution: '충전 포트를 확인하고 정품 충전기를 사용해 주세요. 충전이 전혀 되지 않으면 AS 접수 바랍니다.', videoUrl: '#' },
    ]
  },
  { id: 'perfect_gun', name: '퍼펙트건', price: 1980000, annualSales: 2000,
    image: '🔫', description: '마사지건', category: '건강기기',
    features: ['근육 이완', '6단 강도', '휴대 간편'],
    symptoms: [
      { code: 'OPERATION', name: '작동법 미숙지', solution: '전원 버튼을 2초 누르면 켜지며, 버튼을 연속 누르면 강도가 변경됩니다.', videoUrl: '#' },
      { code: 'CHARGE', name: '충전 문제', solution: 'USB-C 케이블로 충전합니다. 충전 시 LED가 빨간색, 완충 시 초록색으로 변합니다.', videoUrl: '#' },
      { code: 'INTENSITY', name: '강도 조절 문의', solution: '총 6단계 강도가 있습니다. 전원 버튼을 한번씩 누를 때마다 강도가 1단계씩 올라갑니다.', videoUrl: '#' },
    ]
  },
];

// 고객 DB (50명 샘플)
const firstNames = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','홍'];
const lastNames = ['영희','철수','미영','준호','수진','태민','예진','성민','하은','민재','소연','동욱','지현','승우','은지','재훈','다은','현수','유진','정민'];
const sources = ['QR_EVENT','QR_PRODUCT','DIRECT','QR_EVENT','QR_EVENT'];
const segments = ['BUYER','LEAD','AGENT','BUYER','LEAD','BUYER','LEAD'];

export const customers = Array.from({ length: 50 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const seg = segments[i % segments.length];
  const src = sources[i % sources.length];
  const d = new Date(2026, 2, 1 + (i % 25));
  return {
    id: `C-${String(i + 1).padStart(4, '0')}`,
    name: fn + ln,
    phone: `010-${String(1000 + Math.floor(Math.random() * 9000)).slice(0, 4)}-${String(1000 + Math.floor(Math.random() * 9000)).slice(0, 4)}`,
    kakaoId: i < 35 ? `kakao_${1000 + i}` : null,
    segment: seg,
    source: src,
    productsOwned: i % 3 === 0 ? ['body_love'] : i % 3 === 1 ? ['ankle'] : ['perfect_gun'],
    marketingConsent: i < 42,
    createdAt: d.toISOString().split('T')[0],
  };
});

// AS 로그
export const asLogs = Array.from({ length: 120 }, (_, i) => {
  const prod = products[i % 3];
  const sym = prod.symptoms[i % prod.symptoms.length];
  const resolved = Math.random() > 0.3;
  const d = new Date(2026, 2, 1 + (i % 25), 9 + (i % 8));
  return {
    id: `AS-${String(i + 1).padStart(4, '0')}`,
    customerId: customers[i % customers.length].id,
    customerName: customers[i % customers.length].name,
    product: prod.name,
    productId: prod.id,
    symptom: sym.name,
    symptomCode: sym.code,
    resolved,
    escalated: !resolved && Math.random() > 0.5,
    createdAt: d.toISOString(),
  };
});

// QR 코드
export const qrCodes = [
  { id: 'QR-P-001', type: 'PRODUCT', target: '소모코 바디러브', url: 'https://www.samhwamc.com/product/detail.html?product_no=22&cate_no=43&display_group=1', scanCount: 823, createdAt: '2026-03-01' },
  { id: 'QR-P-002', type: 'PRODUCT', target: '발목 펌핑 운동기', url: '/product/ankle', scanCount: 1245, createdAt: '2026-03-01' },
  { id: 'QR-P-003', type: 'PRODUCT', target: '퍼펙트건', url: '/product/perfect_gun', scanCount: 456, createdAt: '2026-03-01' },
  { id: 'QR-E-001', type: 'EVENT', target: '2026 킨텍스 박람회', url: '/landing/kintex2026', scanCount: 2100, createdAt: '2026-03-10' },
  { id: 'QR-E-002', type: 'EVENT', target: '2026 부산 메디카 엑스포', url: '/landing/busan2026', scanCount: 1680, createdAt: '2026-03-15' },
  { id: 'QR-B-001', type: 'BANNER', target: '카탈로그 배너', url: '/channel', scanCount: 340, createdAt: '2026-03-05' },
];

// QR 스캔 일별 데이터
export const qrScanDaily = Array.from({ length: 25 }, (_, i) => ({
  date: `3/${i + 1}`,
  product: 30 + Math.floor(Math.random() * 60),
  event: 40 + Math.floor(Math.random() * 120),
  banner: 5 + Math.floor(Math.random() * 20),
}));

// 브로드캐스트 이력
export const broadcasts = [
  { id: 'B-001', title: '바디러브 신제품 출시 안내', content: '새로운 바디러브 프로가 출시되었습니다!', targetSegment: '전체', sentAt: '2026-03-05 10:00', openRate: 42.3, clickRate: 12.8, sentCount: 3200, status: '발신완료' },
  { id: 'B-002', title: '킨텍스 박람회 초대', content: '3월 킨텍스 건강박람회에 삼화메디칼이 참가합니다.', targetSegment: 'BUYER', sentAt: '2026-03-08 14:00', openRate: 38.5, clickRate: 18.2, sentCount: 2100, status: '발신완료' },
  { id: 'B-003', title: '봄맞이 건강 관리 팁', content: '봄철 무릎·발목 건강을 위한 5가지 습관', targetSegment: '전체', sentAt: '2026-03-12 09:00', openRate: 35.1, clickRate: 8.9, sentCount: 4500, status: '발신완료' },
  { id: 'B-004', title: '에이전트 교육 안내', content: '3월 에이전트 교육 일정 안내', targetSegment: 'AGENT', sentAt: '2026-03-18 11:00', openRate: 55.2, clickRate: 22.1, sentCount: 180, status: '발신완료' },
  { id: 'B-005', title: '부산 메디카 엑스포 안내', content: '부산 메디카 엑스포에서 만나요!', targetSegment: '전체', sentAt: null, openRate: 0, clickRate: 0, sentCount: 0, status: '예약중' },
];

// 대시보드 KPI 데이터
export const dashboardKPI = {
  totalFriends: 7842,
  friendsGrowth: 12.5,
  totalCustomers: 3256,
  customersGrowth: 8.3,
  chatbotAutoRate: 68.5,
  chatbotGrowth: 5.2,
  totalQRScans: 6644,
  qrGrowth: 22.1,
};

// 월별 친구 증가 트렌드
export const friendsTrend = [
  { month: '1월', friends: 2100, registrations: 850 },
  { month: '2월', friends: 3800, registrations: 1400 },
  { month: '3월', friends: 5200, registrations: 2100 },
  { month: '4월(예상)', friends: 7200, registrations: 2800 },
  { month: '5월(예상)', friends: 8800, registrations: 3200 },
  { month: '6월(예상)', friends: 10000, registrations: 3600 },
];

// 유입 경로별 분포
export const sourceDistribution = [
  { source: 'QR 이벤트', value: 45, color: '#2E75B6' },
  { source: 'QR 제품', value: 25, color: '#27AE60' },
  { source: 'QR 배너', value: 10, color: '#E67E22' },
  { source: '직접 추가', value: 20, color: '#8E44AD' },
];

// AS 제품별 통계
export const asProductStats = [
  { product: '소모코 바디러브', total: 42, resolved: 30, escalated: 12 },
  { product: '발목 운동기', total: 55, resolved: 38, escalated: 17 },
  { product: '퍼펙트건', total: 23, resolved: 18, escalated: 5 },
];

// AS 증상별 통계
export const asSymptomStats = [
  { symptom: '충전 문제', count: 45 },
  { symptom: '작동법 미숙지', count: 38 },
  { symptom: '부품 파손/마모', count: 18 },
  { symptom: '소음/진동 이상', count: 12 },
  { symptom: '강도 조절 문의', count: 7 },
];

// 챗봇 시나리오
export const chatbotScenarios = products.map(p => ({
  productId: p.id,
  productName: p.name,
  symptoms: p.symptoms.map((s, i) => ({
    ...s,
    order: i + 1,
    usageCount: Math.floor(Math.random() * 100) + 20,
    resolveRate: (60 + Math.random() * 30).toFixed(1),
  })),
}));
