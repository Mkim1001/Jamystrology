// ============================================================
// 호라리 차트 계산 - 행성 위치, ASC, 하우스 cusps
// 간이 천문 계산 (VSOP87 축약 + 근사 공식)
// ============================================================

import {
  Planet,
  PLANETS,
  SIGN_RULERS,
  HOUR_SEQUENCE,
  DAY_RULERS,
  type AspectType,
  type AspectInfo,
  ASPECT_ANGLES,
  PLANET_ORBS,
  PLANET_SPEED,
} from "./data";

// ── 날짜/시간 → Julian Day ──────────────────────────────

export function dateToJD(year: number, month: number, day: number, hour: number, minute: number): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + minute / 60) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;
}

// ── 항성시 (Sidereal Time) ──────────────────────────────

export function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

export function getLST(jd: number, longitude: number): number {
  return ((getGMST(jd) + longitude) % 360 + 360) % 360;
}

// ── 경사각 (Obliquity) ──────────────────────────────────

function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.4392911 - 0.0130042 * T;
}

// ── ASC 계산 ─────────────────────────────────────────────

export function calculateASC(jd: number, latitude: number, longitude: number): number {
  const lst = getLST(jd, longitude);
  const obliquity = getObliquity(jd);
  const lstRad = lst * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;

  const asc = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  ) * 180 / Math.PI;

  return ((asc % 360) + 360) % 360;
}

// ── MC (Midheaven) 계산 ─────────────────────────────────

export function calculateMC(jd: number, longitude: number): number {
  const lst = getLST(jd, longitude);
  const obliquity = getObliquity(jd);
  const lstRad = lst * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;

  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180 / Math.PI;
  mc = ((mc % 360) + 360) % 360;
  return mc;
}

// ── Equal House System ──────────────────────────────────

export function calculateHouseCusps(asc: number): number[] {
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push(((asc + i * 30) % 360 + 360) % 360);
  }
  return cusps;
}

// ── 행성 위치 계산 (간이 공식) ──────────────────────────
// Jean Meeus 기반 근사 계산

export interface PlanetPosition {
  planet: Planet;
  longitude: number;   // 황경 (0-360)
  sign: number;        // 사인 인덱스 (0-11)
  degree: number;      // 사인 내 도수 (0-30)
  minute: number;      // 분
  retrograde: boolean; // 역행 여부
}

export function calculatePlanetPositions(jd: number): PlanetPosition[] {
  const T = (jd - 2451545.0) / 36525;
  const positions: PlanetPosition[] = [];

  // 태양 (Sun)
  const sunL = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const sunM = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const sunMRad = sunM * Math.PI / 180;
  const sunC = (1.914602 - 0.004817 * T) * Math.sin(sunMRad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * sunMRad)
    + 0.000289 * Math.sin(3 * sunMRad);
  const sunLon = ((sunL + sunC) % 360 + 360) % 360;
  positions.push(makePlanetPos("sun", sunLon, false));

  // 달 (Moon)
  const moonL = 218.3165 + 481267.8813 * T;
  const moonD = 297.8502 + 445267.1115 * T;
  const moonM2 = 134.9634 + 477198.8676 * T; // Moon's mean anomaly
  const moonDRad = moonD * Math.PI / 180;
  const moonM2Rad = moonM2 * Math.PI / 180;
  const moonMRad = sunM * Math.PI / 180; // Sun's mean anomaly
  const moonF = 93.2720 + 483202.0175 * T;
  const moonFRad = moonF * Math.PI / 180;
  const moonCorr = 6.289 * Math.sin(moonM2Rad)
    + 1.274 * Math.sin(2 * moonDRad - moonM2Rad)
    + 0.658 * Math.sin(2 * moonDRad)
    + 0.214 * Math.sin(2 * moonM2Rad)
    - 0.186 * Math.sin(moonMRad)
    - 0.114 * Math.sin(2 * moonFRad);
  const moonLon = ((moonL + moonCorr) % 360 + 360) % 360;
  positions.push(makePlanetPos("moon", moonLon, false));

  // 수성 (Mercury)
  const mercL = 252.2509 + 149472.6746 * T;
  const mercM = 174.7948 + 149472.5153 * T;
  const mercMRad = mercM * Math.PI / 180;
  const mercC = 6.7385 * Math.sin(mercMRad) + 1.228 * Math.sin(2 * mercMRad) + 0.2135 * Math.sin(3 * mercMRad);
  const mercLon = ((mercL + mercC) % 360 + 360) % 360;
  // 내행성 역행: 태양과의 elongation 기반 근사
  const mercElongation = ((mercLon - sunLon + 360) % 360);
  const mercRetro = mercElongation > 180 && mercElongation < 360 && Math.abs(mercElongation - 360) < 28;
  positions.push(makePlanetPos("mercury", mercLon, mercRetro));

  // 금성 (Venus)
  const venL = 181.9798 + 58517.8157 * T;
  const venM = 50.4161 + 58517.8039 * T;
  const venMRad = venM * Math.PI / 180;
  const venC = 5.4292 * Math.sin(venMRad) + 0.3500 * Math.sin(2 * venMRad) + 0.0276 * Math.sin(3 * venMRad);
  const venLon = ((venL + venC) % 360 + 360) % 360;
  const venElongation = ((venLon - sunLon + 360) % 360);
  const venRetro = venElongation > 180 && venElongation < 360 && Math.abs(venElongation - 360) < 45;
  positions.push(makePlanetPos("venus", venLon, venRetro));

  // 화성 (Mars)
  const marsL = 355.4330 + 19140.2993 * T;
  const marsM = 19.3730 + 19139.8585 * T;
  const marsMRad = marsM * Math.PI / 180;
  const marsC = 10.6912 * Math.sin(marsMRad) + 0.6228 * Math.sin(2 * marsMRad) + 0.0503 * Math.sin(3 * marsMRad);
  const marsLon = ((marsL + marsC) % 360 + 360) % 360;
  // 외행성 역행: 태양 충 부근
  const marsOpp = Math.abs(((marsLon - sunLon + 180 + 360) % 360) - 180);
  const marsRetro = marsOpp < 20;
  positions.push(makePlanetPos("mars", marsLon, marsRetro));

  // 목성 (Jupiter)
  const jupL = 34.3515 + 3034.9057 * T;
  const jupM = 20.0202 + 3034.6872 * T;
  const jupMRad = jupM * Math.PI / 180;
  const jupC = 5.5549 * Math.sin(jupMRad) + 0.1683 * Math.sin(2 * jupMRad);
  const jupLon = ((jupL + jupC) % 360 + 360) % 360;
  const jupOpp = Math.abs(((jupLon - sunLon + 180 + 360) % 360) - 180);
  const jupRetro = jupOpp < 18;
  positions.push(makePlanetPos("jupiter", jupLon, jupRetro));

  // 토성 (Saturn)
  const satL = 50.0774 + 1222.1138 * T;
  const satM = 317.0207 + 1222.1116 * T;
  const satMRad = satM * Math.PI / 180;
  const satC = 6.3642 * Math.sin(satMRad) + 0.2075 * Math.sin(2 * satMRad);
  const satLon = ((satL + satC) % 360 + 360) % 360;
  const satOpp = Math.abs(((satLon - sunLon + 180 + 360) % 360) - 180);
  const satRetro = satOpp < 16;
  positions.push(makePlanetPos("saturn", satLon, satRetro));

  return positions;
}

function makePlanetPos(planet: Planet, longitude: number, retrograde: boolean): PlanetPosition {
  const lon = ((longitude % 360) + 360) % 360;
  const sign = Math.floor(lon / 30);
  const degreeInSign = lon - sign * 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.round((degreeInSign - degree) * 60);
  return { planet, longitude: lon, sign, degree, minute, retrograde };
}

// ── 행성이 속한 하우스 ──────────────────────────────────

export function getPlanetHouse(planetLon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const start = cusps[i];
    const end = cusps[next];
    if (start < end) {
      if (planetLon >= start && planetLon < end) return i;
    } else {
      // 360도 경계를 넘는 경우
      if (planetLon >= start || planetLon < end) return i;
    }
  }
  return 0;
}

// ── 어스펙트 계산 ────────────────────────────────────────

export function calculateAspects(positions: PlanetPosition[]): AspectInfo[] {
  const aspects: AspectInfo[] = [];
  const aspectTypes: AspectType[] = ["conjunction", "sextile", "square", "trine", "opposition"];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      // 허용 오브: 두 행성 오브의 평균
      const maxOrb = (PLANET_ORBS[p1.planet] + PLANET_ORBS[p2.planet]) / 2;

      for (const type of aspectTypes) {
        const exactAngle = ASPECT_ANGLES[type];
        const orb = Math.abs(diff - exactAngle);
        if (orb <= maxOrb) {
          // Applying vs Separating 판단
          // 간이: 더 빠른 행성이 정확각에 가까워지는지 판단
          const speed1 = PLANET_SPEED[p1.planet];
          const speed2 = PLANET_SPEED[p2.planet];
          const faster = speed1 > speed2 ? p1 : p2;
          const slower = speed1 > speed2 ? p2 : p1;

          let fasterToSlower = slower.longitude - faster.longitude;
          if (fasterToSlower < 0) fasterToSlower += 360;

          const applying = isApplying(faster, slower, exactAngle);

          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            type,
            orb: Math.round(orb * 100) / 100,
            applying,
            exact: orb <= 1,
          });
          break; // 한 쌍에 하나의 어스펙트만
        }
      }
    }
  }
  return aspects;
}

function isApplying(faster: PlanetPosition, slower: PlanetPosition, aspectAngle: number): boolean {
  // 역행이면 반대
  const fSpeed = faster.retrograde ? -PLANET_SPEED[faster.planet] : PLANET_SPEED[faster.planet];
  const sSpeed = slower.retrograde ? -PLANET_SPEED[slower.planet] : PLANET_SPEED[slower.planet];

  const currentDiff = ((slower.longitude - faster.longitude + 360) % 360);
  const futureFaster = faster.longitude + fSpeed;
  const futureSlower = slower.longitude + sSpeed;
  const futureDiff = ((futureSlower - futureFaster + 360) % 360);

  const currentOrb = Math.abs(currentDiff - aspectAngle);
  const futureOrb = Math.abs(futureDiff - aspectAngle);

  return futureOrb < currentOrb;
}

// ── Planetary Hour 계산 ─────────────────────────────────

export function getPlanetaryHour(jd: number): Planet {
  // 요일 계산 (0=Sunday, 1=Monday, ...)
  const dayOfWeek = Math.floor(jd + 1.5) % 7;
  const dayRuler = DAY_RULERS[dayOfWeek];

  // 일출을 6시로 근사
  const dayFraction = (jd % 1 + 0.5) % 1; // 0=자정, 0.5=정오
  const hoursSinceSunrise = (dayFraction - 0.25) * 24; // 6시=일출 근사
  let hourIndex = Math.floor(hoursSinceSunrise >= 0 ? hoursSinceSunrise : hoursSinceSunrise + 24);
  if (hourIndex < 0) hourIndex += 24;

  // 칼데안 순서에서 dayRuler의 위치 찾기
  const dayRulerIdx = HOUR_SEQUENCE.indexOf(dayRuler);
  const planetaryHourIdx = (dayRulerIdx + hourIndex) % 7;
  return HOUR_SEQUENCE[planetaryHourIdx];
}

// ── Moon Void of Course ─────────────────────────────────

export function isMoonVoidOfCourse(moonPos: PlanetPosition, aspects: AspectInfo[]): { voc: boolean; lastAspect: AspectInfo | null; nextAspect: AspectInfo | null } {
  const moonAspects = aspects.filter(a => a.planet1 === "moon" || a.planet2 === "moon");
  const applying = moonAspects.filter(a => a.applying);
  const separating = moonAspects.filter(a => !a.applying);

  // 달의 현재 사인 내에서 다른 행성과 적용 어스펙트가 없으면 VOC
  const voc = applying.length === 0;

  const lastAspect = separating.length > 0
    ? separating.reduce((a, b) => a.orb < b.orb ? a : b)
    : null;

  const nextAspect = applying.length > 0
    ? applying.reduce((a, b) => a.orb < b.orb ? a : b)
    : null;

  return { voc, lastAspect, nextAspect };
}

// ── 호라리 차트 구조 ────────────────────────────────────

export interface HoraryChart {
  jd: number;
  datetime: string;
  latitude: number;
  longitude: number;
  asc: number;
  mc: number;
  ascSign: number;
  cusps: number[];
  planets: PlanetPosition[];
  aspects: AspectInfo[];
  planetaryHour: Planet;
  isDaytime: boolean;
}

export function buildChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  latitude: number, longitude: number,
): HoraryChart {
  const jd = dateToJD(year, month, day, hour, minute);
  const asc = calculateASC(jd, latitude, longitude);
  const mc = calculateMC(jd, longitude);
  const cusps = calculateHouseCusps(asc);
  const planets = calculatePlanetPositions(jd);
  const aspects = calculateAspects(planets);
  const planetaryHour = getPlanetaryHour(jd);

  // 주간/야간 판단 (태양이 1~6 하우스 = 야간, 7~12 = 주간 근사)
  const sunPos = planets.find(p => p.planet === "sun")!;
  const sunHouse = getPlanetHouse(sunPos.longitude, cusps);
  const isDaytime = sunHouse >= 6; // 7~12 하우스 (지평선 위)

  return {
    jd,
    datetime: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    latitude,
    longitude,
    asc,
    mc,
    ascSign: Math.floor(asc / 30),
    cusps,
    planets,
    aspects,
    planetaryHour,
    isDaytime,
  };
}
