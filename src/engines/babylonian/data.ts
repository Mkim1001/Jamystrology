// ============================================================
// 바빌로니아 점성술 정적 데이터
// MUL.APIN, 행성신, Enuma Anu Enlil, 시기론
// ============================================================

// ── 행성신 (Planetary Deities) ──────────────────────────

export type BabPlanet = "shamash" | "sin" | "marduk" | "ishtar" | "nergal" | "ninurta" | "nabu";

export const BAB_PLANETS: BabPlanet[] = ["shamash", "sin", "marduk", "ishtar", "nergal", "ninurta", "nabu"];

export interface PlanetaryDeity {
  name: string;
  sumerian: string;
  korean: string;
  celestialBody: string;
  element: "fire" | "earth" | "air" | "water" | "metal";
  domain: string;
  nature: "길" | "흉" | "중";
  description: string;
}

export const PLANETARY_DEITIES: Record<BabPlanet, PlanetaryDeity> = {
  shamash: {
    name: "Shamash", sumerian: "UTU", korean: "샤마시(태양신)",
    celestialBody: "태양(Sun)", element: "fire",
    domain: "정의, 법률, 진실, 신탁",
    nature: "길",
    description: "태양의 신이자 정의의 신. 모든 것을 비추어 진실을 드러내고, 법과 도덕의 수호자이다. 왕권의 정당성을 보증하며, 점술의 정확성을 관장한다.",
  },
  sin: {
    name: "Sin/Nanna", sumerian: "NANNA", korean: "신/난나(달의 신)",
    celestialBody: "달(Moon)", element: "water",
    domain: "시간, 주기, 비밀, 지혜",
    nature: "중",
    description: "달의 신으로 시간의 흐름과 주기를 관장한다. 초승달에서 보름달까지의 변화가 길흉을 결정하며, 바빌로니아 점성술에서 가장 중요한 천체이다.",
  },
  marduk: {
    name: "Marduk", sumerian: "AMAR.UTU", korean: "마르둑(목성신)",
    celestialBody: "목성(Jupiter)", element: "air",
    domain: "왕권, 번영, 승리, 창조",
    nature: "길",
    description: "바빌론의 주신이자 목성의 신. 에누마 엘리시에서 티아마트를 물리치고 세계를 창조한 최고신. 번영과 승리, 왕의 권위를 상징한다.",
  },
  ishtar: {
    name: "Ishtar/Inanna", sumerian: "INANNA", korean: "이슈타르(금성신)",
    celestialBody: "금성(Venus)", element: "earth",
    domain: "사랑, 전쟁, 풍요, 변환",
    nature: "중",
    description: "금성의 여신으로 사랑과 전쟁이라는 이중적 성격을 가진다. 새벽별(동방)일 때는 전쟁의 여신, 저녁별(서방)일 때는 사랑의 여신으로 작용한다.",
  },
  nergal: {
    name: "Nergal", sumerian: "ERRA", korean: "네르갈(화성신)",
    celestialBody: "화성(Mars)", element: "fire",
    domain: "전쟁, 역병, 죽음, 지하세계",
    nature: "흉",
    description: "화성의 신이자 지하세계의 통치자. 전쟁, 역병, 파괴를 관장하며, 붉은 빛이 강할수록 재앙의 징조로 해석된다. 군사 행동의 시기를 결정한다.",
  },
  ninurta: {
    name: "Ninurta", sumerian: "NINURTA", korean: "닌우르타(토성신)",
    celestialBody: "토성(Saturn)", element: "earth",
    domain: "농업, 경계, 법집행, 시련",
    nature: "흉",
    description: "토성의 신으로 농업과 법의 집행을 관장한다. 느린 움직임은 시련과 인내를 상징하며, 경계와 제한을 설정하는 신이다.",
  },
  nabu: {
    name: "Nabu", sumerian: "NABU", korean: "나부(수성신)",
    celestialBody: "수성(Mercury)", element: "air",
    domain: "서기, 지혜, 소통, 학문",
    nature: "중",
    description: "수성의 신이자 서기의 신. 마르둑의 아들로 기록, 학문, 소통을 관장한다. 빠른 움직임은 변화와 소식의 전달을 상징한다.",
  },
};

// ── MUL.APIN 별자리 체계 ────────────────────────────────
// 세 가지 경로: Enlil(북쪽), Anu(적도), Ea(남쪽)

export type PathType = "enlil" | "anu" | "ea";

export interface MulApinConstellation {
  name: string;
  babylonian: string;
  korean: string;
  path: PathType;
  modernEquiv: string;
  months: number[]; // 관측 가능한 바빌로니아 월 (1-12)
  deity: BabPlanet | null;
  meaning: string;
}

export const PATH_INFO: Record<PathType, { name: string; korean: string; direction: string; element: "fire" | "earth" | "air" | "water" | "metal"; meaning: string }> = {
  enlil: {
    name: "Path of Enlil", korean: "엔릴의 길",
    direction: "북쪽 (북위 17° 이상)",
    element: "air",
    meaning: "하늘의 왕 엔릴의 영역. 북쪽 별들의 경로로, 권위와 지배력, 사회적 지위와 관련된다. 왕권과 신의 뜻을 나타낸다.",
  },
  anu: {
    name: "Path of Anu", korean: "아누의 길",
    direction: "적도 (남북 17° 이내)",
    element: "earth",
    meaning: "하늘의 아버지 아누의 영역. 적도 부근 별들의 경로로, 균형과 조화, 세속적 일상과 관련된다. 일반적 운세와 시기를 나타낸다.",
  },
  ea: {
    name: "Path of Ea", korean: "에아의 길",
    direction: "남쪽 (남위 17° 이상)",
    element: "water",
    meaning: "지혜의 신 에아의 영역. 남쪽 별들의 경로로, 지하세계와 심연, 지혜와 마법, 비밀스러운 지식과 관련된다.",
  },
};

export const MUL_APIN_CONSTELLATIONS: MulApinConstellation[] = [
  // ── Enlil의 길 (북쪽 별자리) ──
  { name: "MUL.APIN", babylonian: "The Plough", korean: "쟁기자리",
    path: "enlil", modernEquiv: "삼각자리+안드로메다 일부", months: [1, 2, 3],
    deity: "marduk", meaning: "농경의 시작을 알리는 별자리. 새해의 번영과 풍요를 약속한다." },
  { name: "MUL.MAR.GID.DA", babylonian: "The Wagon", korean: "수레자리",
    path: "enlil", modernEquiv: "큰곰자리", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    deity: "ninurta", meaning: "하늘을 도는 수레. 영원한 순환과 시간의 흐름을 상징한다." },
  { name: "MUL.UR.BAR.RA", babylonian: "The Wolf", korean: "늑대자리",
    path: "enlil", modernEquiv: "삼각자리", months: [1, 2],
    deity: "nergal", meaning: "전쟁과 위험의 징조. 경계와 방어가 필요한 시기를 나타낸다." },
  { name: "MUL.SHU.GI", babylonian: "The Old Man", korean: "노인자리",
    path: "enlil", modernEquiv: "페르세우스자리", months: [2, 3],
    deity: "ninurta", meaning: "지혜와 경험의 상징. 연장자의 조언을 구해야 할 시기이다." },
  { name: "MUL.GAM", babylonian: "The Crook", korean: "갈고리자리",
    path: "enlil", modernEquiv: "마차부자리", months: [3, 4],
    deity: "shamash", meaning: "목동의 지팡이. 지도력과 보호의 상징이다." },
  { name: "MUL.MASH.TAB.BA", babylonian: "The Great Twins", korean: "쌍둥이자리",
    path: "enlil", modernEquiv: "쌍둥이자리", months: [4, 5],
    deity: "nabu", meaning: "루갈과 메슬람타에아. 이중성과 소통, 형제간 유대를 상징한다." },
  { name: "MUL.AL.LUL", babylonian: "The Crab", korean: "게자리",
    path: "enlil", modernEquiv: "게자리", months: [5, 6],
    deity: "sin", meaning: "달의 거처. 가정과 안식, 보호의 상징이다." },
  { name: "MUL.UR.GU.LA", babylonian: "The Lion", korean: "사자자리",
    path: "enlil", modernEquiv: "사자자리", months: [6, 7],
    deity: "shamash", meaning: "왕의 별자리. 권위, 용기, 지배력을 상징한다." },

  // ── Anu의 길 (적도 별자리) ──
  { name: "MUL.MUL", babylonian: "The Stars/Pleiades", korean: "플레이아데스(별들의 별)",
    path: "anu", modernEquiv: "황소자리 플레이아데스", months: [2, 3],
    deity: null, meaning: "하늘의 기준점. 새해와 풍요의 징조이며, 7자매 별로 불린다." },
  { name: "MUL.GU4.AN.NA", babylonian: "The Bull of Heaven", korean: "하늘의 황소",
    path: "anu", modernEquiv: "황소자리", months: [2, 3, 4],
    deity: "ishtar", meaning: "이슈타르의 황소. 풍요와 힘의 상징이자 신성한 분노를 나타낸다." },
  { name: "MUL.SIPA.ZI.AN.NA", babylonian: "The True Shepherd", korean: "참된 목자",
    path: "anu", modernEquiv: "오리온자리", months: [3, 4],
    deity: "marduk", meaning: "하늘의 목자. 정의로운 통치와 백성의 보호를 상징한다." },
  { name: "MUL.BAN", babylonian: "The Bow", korean: "활자리",
    path: "anu", modernEquiv: "큰개자리 시리우스", months: [4, 5],
    deity: "nergal", meaning: "이슈타르의 활. 전쟁의 시작이나 결단의 때를 알린다." },
  { name: "MUL.AB.SIN", babylonian: "The Furrow", korean: "밭고랑자리",
    path: "anu", modernEquiv: "처녀자리 스피카", months: [7, 8],
    deity: "ishtar", meaning: "샬라 여신의 곡물 이삭. 수확과 풍요, 대지의 축복을 상징한다." },
  { name: "MUL.ZI.BA.AN.NA", babylonian: "The Scales", korean: "저울자리",
    path: "anu", modernEquiv: "천칭자리", months: [8, 9],
    deity: "shamash", meaning: "샤마시의 저울. 정의와 공정한 판단, 균형을 상징한다." },
  { name: "MUL.GIR.TAB", babylonian: "The Scorpion", korean: "전갈자리",
    path: "anu", modernEquiv: "전갈자리", months: [9, 10],
    deity: "nergal", meaning: "이슈하라의 전갈. 죽음과 재생, 변환의 신비를 상징한다." },
  { name: "MUL.PA.BIL.SAG", babylonian: "The Archer", korean: "궁수자리",
    path: "anu", modernEquiv: "사수자리", months: [10, 11],
    deity: "marduk", meaning: "네르갈의 활 쏘는 자. 탐구와 모험, 먼 곳으로의 여행을 상징한다." },

  // ── Ea의 길 (남쪽 별자리) ──
  { name: "MUL.SUHUR.MASH", babylonian: "The Goat-Fish", korean: "염소물고기자리",
    path: "ea", modernEquiv: "염소자리", months: [11, 12],
    deity: "ninurta", meaning: "에아의 신성한 존재. 지혜와 인내, 깊은 성찰을 상징한다." },
  { name: "MUL.GU.LA", babylonian: "The Great One", korean: "큰 자리",
    path: "ea", modernEquiv: "물병자리", months: [12, 1],
    deity: "nabu", meaning: "에아의 물 붓는 자. 지식의 흐름과 인류에 대한 자비를 상징한다." },
  { name: "MUL.KUN.MESH", babylonian: "The Tails", korean: "꼬리자리",
    path: "ea", modernEquiv: "물고기자리", months: [1, 2],
    deity: "sin", meaning: "두 물고기. 영적 세계와 물질 세계의 연결을 상징한다." },
  { name: "MUL.SIM.MAH", babylonian: "The Swallow", korean: "제비자리",
    path: "ea", modernEquiv: "물고기자리 서쪽", months: [1],
    deity: "ishtar", meaning: "봄의 전령. 새로운 시작과 희망의 도래를 알린다." },
  { name: "MUL.NUN.KI", babylonian: "Eridu", korean: "에리두(물의 도시)",
    path: "ea", modernEquiv: "고물자리+나침반자리", months: [3, 4],
    deity: null, meaning: "가장 오래된 도시 에리두의 별. 기원과 뿌리, 조상의 지혜를 상징한다." },
  { name: "MUL.KUA", babylonian: "The Fish", korean: "물고기자리",
    path: "ea", modernEquiv: "남쪽물고기자리 포말하우트", months: [10, 11],
    deity: null, meaning: "에아의 물고기. 깊은 물속의 지혜와 숨겨진 진실을 상징한다." },
];

// ── 바빌로니아 월 체계 ──────────────────────────────────

export interface BabylonianMonth {
  number: number;
  name: string;
  sumerian: string;
  korean: string;
  modernApprox: string; // 근사 양력 대응
  patron: BabPlanet | null;
  nature: "길" | "흉" | "중";
  description: string;
}

export const BABYLONIAN_MONTHS: BabylonianMonth[] = [
  { number: 1, name: "Nisannu", sumerian: "BARA.ZAG.GAR", korean: "니산누",
    modernApprox: "3월~4월", patron: "marduk", nature: "길",
    description: "새해의 달. 아키투 축제가 열리며, 만물의 새로운 시작과 왕권의 갱신을 축하한다." },
  { number: 2, name: "Ayaru", sumerian: "GU4.SI.SA", korean: "아야루",
    modernApprox: "4월~5월", patron: "ishtar", nature: "길",
    description: "황소의 달. 파종의 시기로, 풍요와 생산력이 넘치는 때이다." },
  { number: 3, name: "Simanu", sumerian: "SIG4.A", korean: "시마누",
    modernApprox: "5월~6월", patron: "sin", nature: "중",
    description: "벽돌 만드는 달. 건설과 노동의 시기로, 실질적 성과를 올리는 때이다." },
  { number: 4, name: "Du'uzu", sumerian: "SHU.NUMUN", korean: "두우주",
    modernApprox: "6월~7월", patron: "nergal", nature: "흉",
    description: "탐무즈(두무지)의 달. 탐무즈 신의 죽음을 애도하는 시기로, 슬픔과 상실에 주의해야 한다." },
  { number: 5, name: "Abu", sumerian: "NE.NE.GAR", korean: "아부",
    modernApprox: "7월~8월", patron: "shamash", nature: "흉",
    description: "불의 달. 극심한 더위와 질병의 시기. 건강에 특히 주의해야 한다." },
  { number: 6, name: "Ululu", sumerian: "KIN.dINANNA", korean: "울룰루",
    modernApprox: "8월~9월", patron: "ishtar", nature: "중",
    description: "이슈타르의 작업의 달. 수확 준비의 시기로, 과거의 노력이 결실을 맺기 시작한다." },
  { number: 7, name: "Tashritu", sumerian: "DU6.KU", korean: "타슈리투",
    modernApprox: "9월~10월", patron: "shamash", nature: "길",
    description: "시작의 달. 가을 아키투 축제. 정의와 재판의 시기로, 공정한 판단이 이루어진다." },
  { number: 8, name: "Arahsamna", sumerian: "APIN.DU8.A", korean: "아라흐삼나",
    modernApprox: "10월~11월", patron: "marduk", nature: "길",
    description: "쟁기의 달. 파종의 시기로, 미래를 위한 투자와 계획이 유리한 때이다." },
  { number: 9, name: "Kislimu", sumerian: "GAN.GAN.E", korean: "키슬리무",
    modernApprox: "11월~12월", patron: "nergal", nature: "흉",
    description: "어둠의 달. 밤이 길어지는 시기로, 내면의 성찰과 경계가 필요하다." },
  { number: 10, name: "Tebetu", sumerian: "AB.BA.E", korean: "테베투",
    modernApprox: "12월~1월", patron: "sin", nature: "중",
    description: "잠긴 달. 겨울의 한가운데로, 인내와 내면의 힘을 기르는 시기이다." },
  { number: 11, name: "Shabatu", sumerian: "ZIZ.A", korean: "샤바투",
    modernApprox: "1월~2월", patron: "nabu", nature: "중",
    description: "타격의 달. 폭풍의 시기이나, 정화와 새로운 시작의 에너지도 있다." },
  { number: 12, name: "Addaru", sumerian: "SHE.KIN.TAR", korean: "아다루",
    modernApprox: "2월~3월", patron: "ninurta", nature: "길",
    description: "타작의 달. 한 해의 마무리와 수확의 정리. 감사와 완성의 시기이다." },
];

// ── Enuma Anu Enlil 징조 체계 ───────────────────────────

export interface LunarOmen {
  phase: string;
  korean: string;
  meaning: string;
  nature: "길" | "흉" | "중";
}

export const LUNAR_OMENS: LunarOmen[] = [
  { phase: "new_moon", korean: "신월(新月)",
    meaning: "달이 사라진 시기. 새로운 시작의 잠재력이 있으나, 아직 드러나지 않은 것들에 주의해야 한다. 은밀한 계획에 유리하다.",
    nature: "중" },
  { phase: "waxing_crescent", korean: "초승달(初生月)",
    meaning: "신(Sin)이 처음 모습을 드러내니, 길한 징조이다. 새로운 사업, 여행, 계약의 시작에 유리하며, 성장의 에너지가 시작된다.",
    nature: "길" },
  { phase: "first_quarter", korean: "상현달(上弦月)",
    meaning: "달이 반으로 나뉘니, 결정의 시기이다. 두 길 사이에서 선택해야 하며, 과감한 행동이 필요하다.",
    nature: "중" },
  { phase: "waxing_gibbous", korean: "철월(凸月, 차오름)",
    meaning: "달의 힘이 거의 차오르니, 일이 성사되기 직전의 단계이다. 노력이 곧 결실을 맺을 것이다.",
    nature: "길" },
  { phase: "full_moon", korean: "보름달(望月)",
    meaning: "신(Sin)이 완전한 광휘를 드러내니, 위대한 길조이다. 완성과 성취의 때이며, 왕에게는 번영을 의미한다. 그러나 지나침을 경계해야 한다.",
    nature: "길" },
  { phase: "waning_gibbous", korean: "철월(凸月, 기울어짐)",
    meaning: "달이 기울기 시작하니, 얻은 것을 지키는 데 힘써야 한다. 퇴각과 보존의 시기이다.",
    nature: "중" },
  { phase: "last_quarter", korean: "하현달(下弦月)",
    meaning: "달이 다시 반으로 나뉘니, 과거를 정리하고 불필요한 것을 버려야 한다. 정화와 해방의 시기이다.",
    nature: "중" },
  { phase: "waning_crescent", korean: "그믐달(晦月)",
    meaning: "신(Sin)이 사라지기 직전이니, 쇠퇴와 종결의 징조이다. 중요한 일을 시작하기에 부적합하며, 쉬고 성찰해야 한다.",
    nature: "흉" },
];

// ── 행성 조합 징조 ──────────────────────────────────────

export interface PlanetaryOmen {
  planets: [BabPlanet, BabPlanet];
  relationship: "conjunction" | "opposition" | "approach";
  korean: string;
  omen: string;
  nature: "길" | "흉" | "중";
}

export const PLANETARY_OMENS: PlanetaryOmen[] = [
  { planets: ["marduk", "ishtar"], relationship: "conjunction", korean: "마르둑-이슈타르 합",
    omen: "목성과 금성이 합하면 나라에 평화와 풍요가 온다. 사랑과 번영이 함께하는 대길한 징조이다.",
    nature: "길" },
  { planets: ["marduk", "nergal"], relationship: "conjunction", korean: "마르둑-네르갈 합",
    omen: "목성과 화성이 합하면 전쟁의 승리가 있으나, 폭력과 파괴도 수반한다. 용기와 절제가 필요하다.",
    nature: "중" },
  { planets: ["marduk", "ninurta"], relationship: "conjunction", korean: "마르둑-닌우르타 합",
    omen: "목성과 토성이 합하면 왕권의 대전환이 있다. 기존 질서가 무너지고 새로운 질서가 세워진다.",
    nature: "중" },
  { planets: ["ishtar", "nergal"], relationship: "conjunction", korean: "이슈타르-네르갈 합",
    omen: "금성과 화성이 합하면 격렬한 정열이 일어난다. 사랑과 전쟁이 뒤얽히니, 감정의 폭풍에 주의하라.",
    nature: "흉" },
  { planets: ["shamash", "sin"], relationship: "opposition", korean: "샤마시-신 충",
    omen: "보름달의 대조. 태양과 달이 마주보면 모든 것이 드러난다. 진실이 밝혀지고, 숨겨진 것이 표면으로 올라온다.",
    nature: "중" },
  { planets: ["marduk", "nergal"], relationship: "opposition", korean: "마르둑-네르갈 충",
    omen: "목성과 화성이 대립하면 왕과 장군의 갈등이 있다. 내부 분열에 주의하고 화해를 도모해야 한다.",
    nature: "흉" },
  { planets: ["ninurta", "marduk"], relationship: "opposition", korean: "닌우르타-마르둑 충",
    omen: "토성과 목성이 대립하면 제약과 확장이 충돌한다. 현실적 한계와 이상 사이에서 균형을 찾아야 한다.",
    nature: "흉" },
  { planets: ["nabu", "marduk"], relationship: "approach", korean: "나부-마르둑 접근",
    omen: "수성이 목성에 접근하면 좋은 소식이 온다. 학문과 상업에 유리하며, 현명한 조언을 얻는다.",
    nature: "길" },
  { planets: ["nabu", "ninurta"], relationship: "approach", korean: "나부-닌우르타 접근",
    omen: "수성이 토성에 접근하면 어려운 소식이 온다. 계약과 문서에 주의하고, 신중함이 필요하다.",
    nature: "흉" },
  { planets: ["ishtar", "sin"], relationship: "approach", korean: "이슈타르-신 접근",
    omen: "금성이 달에 접근하면 아름다운 만남이 있다. 연애와 예술에 길하며, 여성에게 특히 좋은 징조이다.",
    nature: "길" },
];

// ── 길일/흉일 ────────────────────────────────────────────

export interface DayOmen {
  dayOfMonth: number[];
  nature: "길" | "흉" | "중";
  description: string;
}

export const DAY_OMENS: DayOmen[] = [
  { dayOfMonth: [1], nature: "길", description: "월초 첫째 날. 신월과 함께 새로운 시작에 길하다. 신에게 기도하기 좋은 날." },
  { dayOfMonth: [7], nature: "흉", description: "7일째 날은 불안정한 날. 중요한 결정을 삼가고, 휴식과 성찰에 임해야 한다." },
  { dayOfMonth: [14], nature: "흉", description: "14일째 날은 달의 전환기. 변화가 급격하니 새로운 일을 시작하지 말라." },
  { dayOfMonth: [15], nature: "길", description: "보름. 달이 가장 밝은 날. 완성과 성취에 길하며, 축제와 의식에 좋은 날." },
  { dayOfMonth: [19], nature: "흉", description: "19일째 날. 이슈타르의 분노의 날. 모든 일에 조심하고, 여행을 삼가라." },
  { dayOfMonth: [21], nature: "흉", description: "21일째 날은 하현의 시작. 쇠퇴의 기운이 있으니 방어와 보존에 힘쓰라." },
  { dayOfMonth: [28], nature: "흉", description: "28일째 날. 달이 거의 사라지는 날. 새로운 계획은 신월 이후로 미루라." },
  { dayOfMonth: [3, 5, 10, 25], nature: "길", description: "신들이 호의적인 날. 기도와 의식, 사업 시작에 유리하다." },
  { dayOfMonth: [2, 4, 6, 8, 9, 11, 12, 13, 16, 17, 18, 20, 22, 23, 24, 26, 27, 29, 30], nature: "중",
    description: "평범한 날. 특별한 길흉이 없으니 일상을 평탄하게 보내라." },
];
