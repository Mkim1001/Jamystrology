/* ==========================================
   Heavenly Stems & Earthly Branches (천간지지)
   Shared foundation for Saju, QiMen, ZiWei
   ========================================== */

const HeavenlyStems = {
    names: ['갑(甲)', '을(乙)', '병(丙)', '정(丁)', '무(戊)', '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'],
    hanja: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    elements: ['목(木)', '목(木)', '화(火)', '화(火)', '토(土)', '토(土)', '금(金)', '금(金)', '수(水)', '수(水)'],
    yinYang: ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음'],
    colors: ['#00b894', '#00b894', '#ff6b6b', '#ff6b6b', '#ffeaa7', '#ffeaa7', '#dfe6e9', '#dfe6e9', '#4ecdc4', '#4ecdc4'],
    elementKeys: ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water']
};

const EarthlyBranches = {
    names: ['자(子)', '축(丑)', '인(寅)', '묘(卯)', '진(辰)', '사(巳)', '오(午)', '미(未)', '신(申)', '유(酉)', '술(戌)', '해(亥)'],
    hanja: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    animals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
    elements: ['수(水)', '토(土)', '목(木)', '목(木)', '토(土)', '화(火)', '화(火)', '토(土)', '금(金)', '금(金)', '토(土)', '수(水)'],
    elementKeys: ['water', 'earth', 'wood', 'wood', 'earth', 'fire', 'fire', 'earth', 'metal', 'metal', 'earth', 'water'],
    months: [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hours: [[23,1],[1,3],[3,5],[5,7],[7,9],[9,11],[11,13],[13,15],[15,17],[17,19],[19,21],[21,23]]
};

const FiveElements = {
    wood: { name: '목(木)', color: '#00b894', generates: 'fire', overcomes: 'earth', weakens: 'water', fears: 'metal' },
    fire: { name: '화(火)', color: '#ff6b6b', generates: 'earth', overcomes: 'metal', weakens: 'wood', fears: 'water' },
    earth: { name: '토(土)', color: '#ffeaa7', generates: 'metal', overcomes: 'water', weakens: 'fire', fears: 'wood' },
    metal: { name: '금(金)', color: '#dfe6e9', generates: 'water', overcomes: 'wood', weakens: 'earth', fears: 'fire' },
    water: { name: '수(水)', color: '#4ecdc4', generates: 'wood', overcomes: 'fire', weakens: 'metal', fears: 'earth' }
};

// Convert solar date to lunar approximation
function solarToLunarApprox(year, month, day) {
    // Simplified lunar calendar offset (approximate)
    const offset = Math.floor((year - 1900) * 12.3685);
    const lunarMonth = ((month + 10) % 12) + 1;
    return { year, month: lunarMonth, day };
}

// Get the Sexagenary cycle index (60甲子)
function getSexagenaryCycle(year) {
    const stemIdx = (year - 4) % 10;
    const branchIdx = (year - 4) % 12;
    return { stemIdx: (stemIdx + 10) % 10, branchIdx: (branchIdx + 12) % 12 };
}

// Get year pillar
function getYearPillar(year) {
    const { stemIdx, branchIdx } = getSexagenaryCycle(year);
    return { stem: stemIdx, branch: branchIdx };
}

// Get month pillar
function getMonthPillar(year, month) {
    const yearStem = (year - 4) % 10;
    const monthBranch = ((month + 1) % 12);
    const monthStemBase = (yearStem % 5) * 2;
    const monthStem = (monthStemBase + month - 1) % 10;
    return { stem: (monthStem + 10) % 10, branch: (monthBranch + 12) % 12 };
}

// Get day pillar (simplified calculation)
function getDayPillar(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year - a;
    const m = month + 12 * a - 3;
    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
    const stemIdx = (jdn - 1) % 10;
    const branchIdx = (jdn + 1) % 12;
    return { stem: (stemIdx + 10) % 10, branch: (branchIdx + 12) % 12 };
}

// Get hour pillar
function getHourPillar(dayStem, hour) {
    let branchIdx = Math.floor(((hour + 1) % 24) / 2);
    const hourStemBase = (dayStem % 5) * 2;
    const hourStem = (hourStemBase + branchIdx) % 10;
    return { stem: hourStem, branch: branchIdx };
}
