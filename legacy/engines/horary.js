/* ==========================================
   Horary Astrology Engine
   Western chart for answering specific questions
   ========================================== */

const HoraryEngine = {
    signs: [
        { name: 'Aries (양자리)', symbol: '♈', ruler: 'Mars', element: 'fire', quality: 'cardinal' },
        { name: 'Taurus (황소자리)', symbol: '♉', ruler: 'Venus', element: 'earth', quality: 'fixed' },
        { name: 'Gemini (쌍둥이자리)', symbol: '♊', ruler: 'Mercury', element: 'metal', quality: 'mutable' },
        { name: 'Cancer (게자리)', symbol: '♋', ruler: 'Moon', element: 'water', quality: 'cardinal' },
        { name: 'Leo (사자자리)', symbol: '♌', ruler: 'Sun', element: 'fire', quality: 'fixed' },
        { name: 'Virgo (처녀자리)', symbol: '♍', ruler: 'Mercury', element: 'earth', quality: 'mutable' },
        { name: 'Libra (천칭자리)', symbol: '♎', ruler: 'Venus', element: 'metal', quality: 'cardinal' },
        { name: 'Scorpio (전갈자리)', symbol: '♏', ruler: 'Mars/Pluto', element: 'water', quality: 'fixed' },
        { name: 'Sagittarius (궁수자리)', symbol: '♐', ruler: 'Jupiter', element: 'fire', quality: 'mutable' },
        { name: 'Capricorn (염소자리)', symbol: '♑', ruler: 'Saturn', element: 'earth', quality: 'cardinal' },
        { name: 'Aquarius (물병자리)', symbol: '♒', ruler: 'Saturn/Uranus', element: 'metal', quality: 'fixed' },
        { name: 'Pisces (물고기자리)', symbol: '♓', ruler: 'Jupiter/Neptune', element: 'water', quality: 'mutable' }
    ],

    houses: [
        { num: 1, name: '1하우스 (자아)', domain: '자아, 외모, 첫인상', keyword: '나' },
        { num: 2, name: '2하우스 (재물)', domain: '재산, 가치관, 자원', keyword: '소유' },
        { num: 3, name: '3하우스 (소통)', domain: '소통, 학습, 형제', keyword: '소통' },
        { num: 4, name: '4하우스 (가정)', domain: '가정, 뿌리, 부동산', keyword: '근본' },
        { num: 5, name: '5하우스 (창조)', domain: '창작, 연애, 자녀', keyword: '기쁨' },
        { num: 6, name: '6하우스 (봉사)', domain: '건강, 직장, 일상', keyword: '봉사' },
        { num: 7, name: '7하우스 (파트너)', domain: '결혼, 파트너십, 계약', keyword: '관계' },
        { num: 8, name: '8하우스 (변환)', domain: '변환, 상속, 비밀', keyword: '변화' },
        { num: 9, name: '9하우스 (탐구)', domain: '철학, 여행, 고등교육', keyword: '지혜' },
        { num: 10, name: '10하우스 (명예)', domain: '경력, 사회적 지위', keyword: '성취' },
        { num: 11, name: '11하우스 (희망)', domain: '친구, 단체, 이상', keyword: '희망' },
        { num: 12, name: '12하우스 (잠재)', domain: '잠재의식, 비밀, 영성', keyword: '초월' }
    ],

    aspects: {
        conjunction: { name: '합 (Conjunction)', angle: 0, orb: 8, nature: 'strong', symbol: '☌' },
        sextile: { name: '육합 (Sextile)', angle: 60, orb: 6, nature: 'harmonious', symbol: '⚹' },
        square: { name: '직각 (Square)', angle: 90, orb: 7, nature: 'challenging', symbol: '□' },
        trine: { name: '삼합 (Trine)', angle: 120, orb: 8, nature: 'harmonious', symbol: '△' },
        opposition: { name: '충 (Opposition)', angle: 180, orb: 8, nature: 'challenging', symbol: '☍' }
    },

    calculate(currentDate, currentHour, question) {
        const now = currentDate;
        const hour = currentHour;
        const month = now.getMonth();
        const day = now.getDate();
        const minutes = now.getMinutes();

        // Calculate Ascendant (based on time and location approximation)
        const ascSign = Math.floor(((hour * 60 + minutes) / 120 + month) % 12);
        const ascendant = this.signs[ascSign];

        // Place planets in signs (simplified ephemeris)
        const planets = this._placePlanets(now, hour);

        // Determine house cusps (whole sign houses from ascendant)
        const houseCusps = this._calculateHouses(ascSign);

        // Find aspects between planets
        const aspects = this._findAspects(planets);

        // Moon's condition (critical for horary)
        const moonData = this._analyzeMoon(planets.moon, planets);

        // Question analysis
        const questionAnalysis = this._analyzeQuestion(question, ascendant, planets, houseCusps);

        // Overall judgment
        const judgment = this._judge(moonData, aspects, questionAnalysis, planets);

        return {
            system: 'horary',
            systemName: '호라리 점성술',
            color: '#4ecdc4',
            ascendant,
            ascSignIndex: ascSign,
            planets,
            houseCusps,
            aspects,
            moonData,
            questionAnalysis,
            judgment,
            chartTime: now.toLocaleString('ko-KR'),
            nodes: this._generateNodes(ascendant, planets, moonData, judgment, questionAnalysis)
        };
    },

    _placePlanets(date, hour) {
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const year = date.getFullYear();

        return {
            sun: { name: '태양 (Sun)', symbol: '☉', sign: Math.floor(dayOfYear / 30.4) % 12, degree: (dayOfYear % 30) + 1 },
            moon: { name: '달 (Moon)', symbol: '☽', sign: Math.floor((dayOfYear * 13.37 + hour) / 30) % 12, degree: Math.floor((dayOfYear * 13.37 + hour) % 30) + 1 },
            mercury: { name: '수성 (Mercury)', symbol: '☿', sign: Math.floor((dayOfYear + 15) / 30.4) % 12, degree: ((dayOfYear * 4.09) % 30) + 1 },
            venus: { name: '금성 (Venus)', symbol: '♀', sign: Math.floor((dayOfYear + 45) / 30.4) % 12, degree: ((dayOfYear * 1.6) % 30) + 1 },
            mars: { name: '화성 (Mars)', symbol: '♂', sign: Math.floor((dayOfYear / 1.88 + year * 6.3) % 12), degree: ((dayOfYear * 0.524) % 30) + 1 },
            jupiter: { name: '목성 (Jupiter)', symbol: '♃', sign: Math.floor((year - 2020) * 1 + dayOfYear / 365) % 12, degree: ((dayOfYear * 0.083) % 30) + 1 },
            saturn: { name: '토성 (Saturn)', symbol: '♄', sign: Math.floor((year - 2020) * 0.4 + dayOfYear / 365 + 11) % 12, degree: ((dayOfYear * 0.033) % 30) + 1 }
        };
    },

    _calculateHouses(ascSign) {
        return this.houses.map((house, i) => ({
            ...house,
            sign: this.signs[(ascSign + i) % 12],
            signIndex: (ascSign + i) % 12
        }));
    },

    _findAspects(planets) {
        const result = [];
        const planetKeys = Object.keys(planets);
        for (let i = 0; i < planetKeys.length; i++) {
            for (let j = i + 1; j < planetKeys.length; j++) {
                const p1 = planets[planetKeys[i]];
                const p2 = planets[planetKeys[j]];
                const angleDiff = Math.abs((p1.sign * 30 + p1.degree) - (p2.sign * 30 + p2.degree));
                const normalized = angleDiff > 180 ? 360 - angleDiff : angleDiff;

                for (const [key, aspect] of Object.entries(this.aspects)) {
                    if (Math.abs(normalized - aspect.angle) <= aspect.orb) {
                        result.push({
                            planet1: planetKeys[i],
                            planet2: planetKeys[j],
                            aspect: key,
                            ...aspect,
                            exactness: Math.abs(normalized - aspect.angle)
                        });
                    }
                }
            }
        }
        return result;
    },

    _analyzeMoon(moon, planets) {
        const moonSign = this.signs[moon.sign];
        const isVoidOfCourse = moon.degree > 27;
        const phase = this._getMoonPhase(moon.degree, planets.sun);

        return {
            sign: moonSign,
            degree: moon.degree,
            phase,
            isVoidOfCourse,
            interpretation: isVoidOfCourse
                ? '달이 공망 상태입니다 - 질문한 일이 성사되기 어려울 수 있습니다.'
                : `달이 ${moonSign.name}에 있어 ${moonSign.element === 'fire' ? '열정과 행동' : moonSign.element === 'water' ? '감정과 직관' : moonSign.element === 'earth' ? '실용과 안정' : '사고와 소통'}의 에너지가 강합니다.`
        };
    },

    _getMoonPhase(moonDeg, sun) {
        const diff = (moonDeg - sun.degree + 30) % 30;
        if (diff < 4) return '신월 (New Moon) 🌑';
        if (diff < 11) return '초승달 (Waxing Crescent) 🌒';
        if (diff < 15) return '상현달 (First Quarter) 🌓';
        if (diff < 19) return '보름 직전 (Waxing Gibbous) 🌔';
        if (diff < 22) return '보름달 (Full Moon) 🌕';
        if (diff < 26) return '보름 직후 (Waning Gibbous) 🌖';
        return '하현달 (Last Quarter) 🌗';
    },

    _analyzeQuestion(question, ascendant, planets, houses) {
        // Simple keyword-based question categorization
        const categories = {
            love: ['사랑', '연애', '결혼', 'love', '파트너', '관계'],
            career: ['직장', '취업', '사업', '승진', 'career', '일'],
            money: ['돈', '재물', '투자', 'money', '재산', '수입'],
            health: ['건강', '아프', '병원', 'health', '치료'],
            travel: ['여행', '이사', '이동', 'travel', '해외'],
            education: ['시험', '공부', '합격', '학교', 'study']
        };

        let matchedCategory = 'general';
        let relevantHouse = 1;
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(k => question.includes(k))) {
                matchedCategory = cat;
                break;
            }
        }

        const houseMap = { love: 7, career: 10, money: 2, health: 6, travel: 9, education: 9, general: 1 };
        relevantHouse = houseMap[matchedCategory];

        return {
            category: matchedCategory,
            relevantHouse,
            houseInfo: houses[relevantHouse - 1],
            significator: ascendant.ruler,
            interpretation: `질문은 ${this.houses[relevantHouse - 1].domain}과 관련됩니다. ${this.houses[relevantHouse - 1].name}가 핵심 하우스입니다.`
        };
    },

    _judge(moonData, aspects, questionAnalysis, planets) {
        let score = 50;
        if (moonData.isVoidOfCourse) score -= 20;
        const harmonious = aspects.filter(a => a.nature === 'harmonious').length;
        const challenging = aspects.filter(a => a.nature === 'challenging').length;
        score += harmonious * 5 - challenging * 3;
        score = Math.max(10, Math.min(90, score));

        let answer, details;
        if (score >= 70) {
            answer = '긍정적 (Positive)';
            details = '행성들의 배치가 유리합니다. 질문한 일이 좋은 결과를 낳을 가능성이 높습니다.';
        } else if (score >= 40) {
            answer = '조건부 긍정 (Conditional)';
            details = '일부 긍정적 징조가 있으나, 장애물도 존재합니다. 신중한 접근이 필요합니다.';
        } else {
            answer = '부정적 (Negative)';
            details = '현재 시점에서 어려움이 예상됩니다. 시기를 조절하거나 다른 접근이 필요합니다.';
        }

        return { score, answer, details, harmonious, challenging };
    },

    _generateNodes(ascendant, planets, moonData, judgment, questionAnalysis) {
        const nodes = [];
        nodes.push({
            id: 'hor-asc',
            label: 'Ascendant',
            sublabel: ascendant.symbol + ' ' + ascendant.name,
            type: 'primary',
            system: 'horary',
            detail: `상승궁: ${ascendant.name}\n원소: ${ascendant.element}\n품질: ${ascendant.quality}\n지배성: ${ascendant.ruler}`,
            element: ascendant.element
        });
        nodes.push({
            id: 'hor-moon',
            label: '달 상태',
            sublabel: moonData.phase,
            type: 'primary',
            system: 'horary',
            detail: `달 위치: ${moonData.sign.name} ${moonData.degree}°\n월상: ${moonData.phase}\n공망 여부: ${moonData.isVoidOfCourse ? '예' : '아니오'}\n\n${moonData.interpretation}`,
            element: moonData.sign.element
        });
        nodes.push({
            id: 'hor-question',
            label: '질문 분석',
            sublabel: questionAnalysis.houseInfo.name,
            type: 'secondary',
            system: 'horary',
            detail: `분류: ${questionAnalysis.category}\n관련 하우스: ${questionAnalysis.houseInfo.name}\n영역: ${questionAnalysis.houseInfo.domain}\n\n${questionAnalysis.interpretation}`,
            element: ascendant.element
        });
        nodes.push({
            id: 'hor-judgment',
            label: '판단',
            sublabel: judgment.answer,
            type: 'insight',
            system: 'horary',
            detail: `종합 판단: ${judgment.answer}\n점수: ${judgment.score}/100\n조화 양상: ${judgment.harmonious}개\n긴장 양상: ${judgment.challenging}개\n\n${judgment.details}`,
            element: judgment.score >= 50 ? 'wood' : 'fire'
        });
        return nodes;
    }
};
