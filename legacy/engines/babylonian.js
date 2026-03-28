/* ==========================================
   Babylonian Omen Astrology Engine
   Based on Enuma Anu Enlil traditions
   ========================================== */

const BabylonianEngine = {
    // Babylonian planetary deities
    planets: {
        shamash: { name: 'Shamash (샤마쉬)', domain: '태양/정의', symbol: '☉', element: 'fire' },
        sin: { name: 'Sin (신)', domain: '달/지혜', symbol: '☽', element: 'water' },
        ishtar: { name: 'Ishtar (이슈타르)', domain: '금성/사랑과전쟁', symbol: '♀', element: 'earth' },
        nergal: { name: 'Nergal (네르갈)', domain: '화성/파괴', symbol: '♂', element: 'fire' },
        marduk: { name: 'Marduk (마르둑)', domain: '목성/왕권', symbol: '♃', element: 'wood' },
        ninurta: { name: 'Ninurta (니누르타)', domain: '토성/농업', symbol: '♄', element: 'earth' },
        nabu: { name: 'Nabu (나부)', domain: '수성/서기', symbol: '☿', element: 'metal' }
    },

    // Babylonian zodiac (MUL.APIN catalog)
    zodiac: [
        { name: 'GU.AN.NA (위대한 황소)', babylonian: 'Taurus', season: '봄', element: 'earth', deity: 'ishtar' },
        { name: 'MAŠ.TAB.BA (위대한 쌍둥이)', babylonian: 'Gemini', season: '봄', element: 'metal', deity: 'nabu' },
        { name: 'AL.LUL (게)', babylonian: 'Cancer', season: '여름', element: 'water', deity: 'sin' },
        { name: 'UR.GU.LA (사자)', babylonian: 'Leo', season: '여름', element: 'fire', deity: 'shamash' },
        { name: 'AB.SIN (이삭)', babylonian: 'Virgo', season: '여름', element: 'earth', deity: 'ishtar' },
        { name: 'ZI.BA.AN.NA (저울)', babylonian: 'Libra', season: '가을', element: 'metal', deity: 'shamash' },
        { name: 'GIR.TAB (전갈)', babylonian: 'Scorpio', season: '가을', element: 'water', deity: 'nergal' },
        { name: 'PA.BIL.SAG (궁수)', babylonian: 'Sagittarius', season: '가을', element: 'fire', deity: 'marduk' },
        { name: 'SUḪUR.MAŠ (염소물고기)', babylonian: 'Capricorn', season: '겨울', element: 'earth', deity: 'ninurta' },
        { name: 'GU.LA (위대한 자)', babylonian: 'Aquarius', season: '겨울', element: 'metal', deity: 'nabu' },
        { name: 'KUN.MEŠ (물고기 꼬리)', babylonian: 'Pisces', season: '겨울', element: 'water', deity: 'sin' },
        { name: 'LU.ḪUN.GA (농부)', babylonian: 'Aries', season: '봄', element: 'fire', deity: 'nergal' }
    ],

    // Omen categories from Enuma Anu Enlil
    omenCategories: {
        celestial: ['일식 징조', '월식 징조', '행성 합 징조', '유성 징조'],
        atmospheric: ['천둥 징조', '바람 징조', '구름 징조', '무지개 징조'],
        temporal: ['새벽 징조', '정오 징조', '황혼 징조', '자정 징조']
    },

    calculate(birthDate, birthHour, currentDate) {
        const month = birthDate.getMonth();
        const day = birthDate.getDate();
        const hour = birthHour;
        const currentMonth = currentDate.getMonth();

        // Determine birth zodiac sign (Babylonian)
        const signIndex = month % 12;
        const birthSign = this.zodiac[signIndex];

        // Determine ruling planet based on day of week
        const dayOfWeek = birthDate.getDay();
        const rulingPlanets = ['shamash', 'sin', 'nergal', 'nabu', 'marduk', 'ishtar', 'ninurta'];
        const rulingPlanetKey = rulingPlanets[dayOfWeek];
        const rulingPlanet = this.planets[rulingPlanetKey];

        // Current transit sign
        const transitSign = this.zodiac[currentMonth % 12];

        // Generate omen based on birth data
        const omenSeed = (day * 7 + hour * 13 + month * 31) % 12;
        const omenType = omenSeed < 4 ? 'celestial' : omenSeed < 8 ? 'atmospheric' : 'temporal';
        const omenList = this.omenCategories[omenType];
        const specificOmen = omenList[omenSeed % omenList.length];

        // Calculate planetary strength
        const planetaryAlignment = this._calcPlanetaryStrength(birthDate, currentDate);

        // Determine omen interpretation
        const interpretation = this._interpretOmen(birthSign, rulingPlanetKey, transitSign, omenSeed);

        return {
            system: 'babylonian',
            systemName: '바빌로니아 점성술',
            color: '#ff6b6b',
            birthSign,
            rulingPlanet,
            rulingPlanetKey,
            transitSign,
            omenType,
            specificOmen,
            planetaryAlignment,
            interpretation,
            keywords: this._getKeywords(birthSign, rulingPlanetKey),
            nodes: this._generateNodes(birthSign, rulingPlanet, transitSign, interpretation, planetaryAlignment)
        };
    },

    _calcPlanetaryStrength(birthDate, currentDate) {
        const diff = Math.abs(currentDate - birthDate) / (1000 * 60 * 60 * 24);
        const cycle = diff % 365.25;
        return {
            shamash: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 365)),
            sin: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 29.5)),
            marduk: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 398)),
            ishtar: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 225)),
            nergal: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 687)),
            ninurta: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 378)),
            nabu: Math.round(50 + 50 * Math.sin(cycle * 2 * Math.PI / 88))
        };
    },

    _interpretOmen(sign, planet, transit, seed) {
        const favorability = ['매우 길함 (Great Fortune)', '길함 (Good Fortune)', '보통 (Neutral)', '주의 (Caution)', '경계 (Warning)'];
        const favIndex = (seed * 3 + sign.element.length) % 5;

        const messages = {
            fire: [
                '불의 신이 당신의 길을 밝히고 있습니다. 행동의 때입니다.',
                '태양신 샤마쉬가 정의로운 판단을 내리도록 돕습니다.',
                '전투의 기운이 강합니다. 과감한 결단이 필요합니다.'
            ],
            water: [
                '달의 신 신(Sin)이 직관을 강화합니다. 꿈에 주목하세요.',
                '물의 흐름이 변화를 예고합니다. 유연하게 대응하세요.',
                '감정의 조류가 밀려옵니다. 내면의 목소리에 귀를 기울이세요.'
            ],
            earth: [
                '대지의 힘이 안정을 가져옵니다. 기반을 다지세요.',
                '이슈타르 여신이 풍요를 약속합니다. 인내가 열매를 맺습니다.',
                '농업신 니누르타가 수확의 시기를 알립니다.'
            ],
            metal: [
                '나부 신이 지식의 문을 엽니다. 학습과 소통에 유리합니다.',
                '금속의 기운이 날카로운 판단력을 부여합니다.',
                '서기의 별이 기록과 계약에 길한 징조를 보입니다.'
            ],
            wood: [
                '마르둑의 왕권이 리더십을 강화합니다.',
                '성장의 기운이 넘칩니다. 새로운 시작에 적합합니다.',
                '목성의 축복이 확장과 번영을 예고합니다.'
            ]
        };

        const elemMsgs = messages[sign.element] || messages.fire;
        const msg = elemMsgs[seed % elemMsgs.length];

        return {
            favorability: favorability[favIndex],
            favIndex,
            message: msg,
            advice: this._getAdvice(favIndex, planet)
        };
    },

    _getAdvice(favIndex, planet) {
        if (favIndex <= 1) return `${this.planets[planet].domain}의 힘을 활용하여 적극적으로 나아가십시오.`;
        if (favIndex === 2) return '균형을 유지하며 관찰하는 자세가 필요합니다.';
        return '신중함이 필요한 시기입니다. 중요한 결정은 미루는 것이 좋습니다.';
    },

    _getKeywords(sign, planet) {
        return [sign.season, this.planets[planet].domain, sign.element, sign.name.split('(')[0].trim()];
    },

    _generateNodes(sign, planet, transit, interpretation, alignment) {
        const nodes = [];
        nodes.push({
            id: 'bab-sign',
            label: sign.name,
            sublabel: sign.babylonian,
            type: 'primary',
            system: 'babylonian',
            detail: `탄생 별자리: ${sign.name}\n계절: ${sign.season}\n원소: ${sign.element}\n수호신: ${sign.deity}`,
            element: sign.element
        });
        nodes.push({
            id: 'bab-planet',
            label: planet.name.split('(')[0].trim(),
            sublabel: planet.symbol + ' ' + planet.domain,
            type: 'primary',
            system: 'babylonian',
            detail: `수호 행성: ${planet.name}\n영역: ${planet.domain}\n원소: ${planet.element}`,
            element: planet.element
        });
        nodes.push({
            id: 'bab-transit',
            label: '현재 운행',
            sublabel: transit.name,
            type: 'secondary',
            system: 'babylonian',
            detail: `현재 태양 위치: ${transit.name}\n계절 에너지: ${transit.season}`,
            element: transit.element
        });
        nodes.push({
            id: 'bab-omen',
            label: '징조 해석',
            sublabel: interpretation.favorability,
            type: 'insight',
            system: 'babylonian',
            detail: `${interpretation.message}\n\n길흉: ${interpretation.favorability}\n\n조언: ${interpretation.advice}`,
            element: sign.element
        });
        return nodes;
    }
};
