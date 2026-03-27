/* ==========================================
   사주팔자 (Four Pillars of Destiny) Engine
   ========================================== */

const SajuEngine = {
    tenGods: {
        비견: { name: '비견(比肩)', role: '동료/경쟁', nature: 'neutral', desc: '나와 같은 오행, 같은 음양' },
        겁재: { name: '겁재(劫財)', role: '경쟁/손재', nature: 'negative', desc: '나와 같은 오행, 다른 음양' },
        식신: { name: '식신(食神)', role: '표현/재능', nature: 'positive', desc: '내가 생하는 오행, 같은 음양' },
        상관: { name: '상관(傷官)', role: '반항/창의', nature: 'mixed', desc: '내가 생하는 오행, 다른 음양' },
        편재: { name: '편재(偏財)', role: '투기/부친', nature: 'positive', desc: '내가 극하는 오행, 같은 음양' },
        정재: { name: '정재(正財)', role: '정당한재물', nature: 'positive', desc: '내가 극하는 오행, 다른 음양' },
        편관: { name: '편관(偏官)', role: '권력/압박', nature: 'mixed', desc: '나를 극하는 오행, 같은 음양' },
        정관: { name: '정관(正官)', role: '명예/질서', nature: 'positive', desc: '나를 극하는 오행, 다른 음양' },
        편인: { name: '편인(偏印)', role: '학문/고독', nature: 'mixed', desc: '나를 생하는 오행, 같은 음양' },
        정인: { name: '정인(正印)', role: '모성/학업', nature: 'positive', desc: '나를 생하는 오행, 다른 음양' }
    },

    calculate(birthDate, birthHour, gender) {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthHour;

        // Four Pillars
        const yearPillar = getYearPillar(year);
        const monthPillar = getMonthPillar(year, month);
        const dayPillar = getDayPillar(year, month, day);
        const hourPillar = getHourPillar(dayPillar.stem, hour);

        const pillars = {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar
        };

        // Day Master (일간)
        const dayMaster = dayPillar.stem;
        const dayMasterElement = HeavenlyStems.elementKeys[dayMaster];
        const dayMasterYinYang = HeavenlyStems.yinYang[dayMaster];

        // Analyze element balance
        const elementBalance = this._analyzeElements(pillars);

        // Determine Ten Gods for each pillar
        const tenGodAnalysis = this._analyzeTenGods(dayMaster, pillars);

        // Strength of Day Master
        const dayMasterStrength = this._analyzeDayMasterStrength(dayMaster, pillars, month);

        // Favorable/Unfavorable elements
        const favorableElements = this._getFavorableElements(dayMasterElement, dayMasterStrength);

        // Current luck period (대운)
        const daewun = this._calculateDaewun(yearPillar.stem, monthPillar, gender, year, birthDate);

        // Annual luck (세운)
        const sewun = this._calculateSewun(new Date());

        // Overall interpretation
        const interpretation = this._interpret(dayMaster, elementBalance, tenGodAnalysis, dayMasterStrength, favorableElements);

        return {
            system: 'saju',
            systemName: '사주팔자',
            color: '#ffe66d',
            pillars,
            dayMaster,
            dayMasterName: HeavenlyStems.names[dayMaster],
            dayMasterElement,
            dayMasterYinYang,
            elementBalance,
            tenGodAnalysis,
            dayMasterStrength,
            favorableElements,
            daewun,
            sewun,
            interpretation,
            nodes: this._generateNodes(pillars, dayMaster, elementBalance, dayMasterStrength, interpretation, favorableElements)
        };
    },

    _analyzeElements(pillars) {
        const count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
        for (const key of ['year', 'month', 'day', 'hour']) {
            const p = pillars[key];
            count[HeavenlyStems.elementKeys[p.stem]]++;
            count[EarthlyBranches.elementKeys[p.branch]]++;
        }
        const total = Object.values(count).reduce((a, b) => a + b, 0);
        const percentages = {};
        for (const [elem, c] of Object.entries(count)) {
            percentages[elem] = Math.round((c / total) * 100);
        }
        return { count, percentages, total };
    },

    _analyzeTenGods(dayMaster, pillars) {
        const dmElement = HeavenlyStems.elementKeys[dayMaster];
        const dmYY = HeavenlyStems.yinYang[dayMaster];
        const result = {};

        const elemOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
        const dmIdx = elemOrder.indexOf(dmElement);

        for (const key of ['year', 'month', 'hour']) {
            const stemElem = HeavenlyStems.elementKeys[pillars[key].stem];
            const stemYY = HeavenlyStems.yinYang[pillars[key].stem];
            const sameYY = stemYY === dmYY;
            result[key] = this._getTenGod(dmElement, stemElem, sameYY);
        }
        return result;
    },

    _getTenGod(dmElement, targetElement, sameYinYang) {
        const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
        const overcomes = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };

        if (targetElement === dmElement) return sameYinYang ? '비견' : '겁재';
        if (generates[dmElement] === targetElement) return sameYinYang ? '식신' : '상관';
        if (overcomes[dmElement] === targetElement) return sameYinYang ? '편재' : '정재';
        if (overcomes[targetElement] === dmElement) return sameYinYang ? '편관' : '정관';
        if (generates[targetElement] === dmElement) return sameYinYang ? '편인' : '정인';
        return '비견';
    },

    _analyzeDayMasterStrength(dayMaster, pillars, month) {
        const dmElement = HeavenlyStems.elementKeys[dayMaster];
        let strength = 0;

        // Count supporting elements
        for (const key of ['year', 'month', 'day', 'hour']) {
            const stemElem = HeavenlyStems.elementKeys[pillars[key].stem];
            const branchElem = EarthlyBranches.elementKeys[pillars[key].branch];

            if (stemElem === dmElement) strength += 2;
            if (branchElem === dmElement) strength += 2;

            const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
            // Element that generates day master
            for (const [gen, prod] of Object.entries(generates)) {
                if (prod === dmElement) {
                    if (stemElem === gen) strength += 1;
                    if (branchElem === gen) strength += 1;
                }
            }
        }

        // Season bonus
        const seasonBonus = {
            wood: [1, 2, 3], fire: [4, 5, 6], earth: [3, 6, 9, 12], metal: [7, 8, 9], water: [10, 11, 12]
        };
        if (seasonBonus[dmElement]?.includes(month)) strength += 2;

        const level = strength >= 8 ? '신강(身强)' : strength >= 5 ? '중화(中和)' : '신약(身弱)';
        return { score: strength, level, isStrong: strength >= 6 };
    },

    _getFavorableElements(dmElement, strength) {
        const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
        const generatedBy = { fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal', wood: 'water' };
        const overcomes = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };

        if (strength.isStrong) {
            return {
                favorable: [generates[dmElement], overcomes[dmElement]],
                unfavorable: [dmElement, generatedBy[dmElement]],
                explanation: '신강하므로 설기(泄氣)하고 극하는 오행이 유리합니다.'
            };
        } else {
            return {
                favorable: [dmElement, generatedBy[dmElement]],
                unfavorable: [overcomes[dmElement], generates[dmElement]],
                explanation: '신약하므로 같은 오행과 생해주는 오행이 유리합니다.'
            };
        }
    },

    _calculateDaewun(yearStem, monthPillar, gender, birthYear, birthDate) {
        const isYangMale = (HeavenlyStems.yinYang[yearStem] === '양' && gender === 'male');
        const isYinFemale = (HeavenlyStems.yinYang[yearStem] === '음' && gender === 'female');
        const forward = isYangMale || isYinFemale;

        const currentAge = new Date().getFullYear() - birthYear;
        const periods = [];
        for (let i = 0; i < 8; i++) {
            const age = 3 + i * 10;
            const stemIdx = forward
                ? (monthPillar.stem + i + 1) % 10
                : (monthPillar.stem - i - 1 + 100) % 10;
            const branchIdx = forward
                ? (monthPillar.branch + i + 1) % 12
                : (monthPillar.branch - i - 1 + 120) % 12;
            periods.push({
                age: `${age}-${age + 9}세`,
                stem: stemIdx,
                branch: branchIdx,
                stemName: HeavenlyStems.names[stemIdx],
                branchName: EarthlyBranches.names[branchIdx],
                element: HeavenlyStems.elementKeys[stemIdx],
                isCurrent: currentAge >= age && currentAge < age + 10
            });
        }
        return { forward, periods };
    },

    _calculateSewun(currentDate) {
        const year = currentDate.getFullYear();
        const { stemIdx, branchIdx } = getSexagenaryCycle(year);
        return {
            year,
            stem: stemIdx,
            branch: branchIdx,
            stemName: HeavenlyStems.names[stemIdx],
            branchName: EarthlyBranches.names[branchIdx],
            animal: EarthlyBranches.animals[branchIdx],
            element: HeavenlyStems.elementKeys[stemIdx]
        };
    },

    _interpret(dayMaster, elementBalance, tenGods, strength, favorable) {
        const dmName = HeavenlyStems.names[dayMaster];
        const dmElem = FiveElements[HeavenlyStems.elementKeys[dayMaster]];

        let personality = '';
        switch (HeavenlyStems.elementKeys[dayMaster]) {
            case 'wood': personality = '성장을 추구하며 인자하고 곧은 성격입니다. 시작하는 힘이 강합니다.'; break;
            case 'fire': personality = '열정적이고 예의를 중시합니다. 밝고 따뜻한 카리스마가 있습니다.'; break;
            case 'earth': personality = '신뢰할 수 있고 포용력이 있습니다. 안정과 중재를 추구합니다.'; break;
            case 'metal': personality = '결단력이 있고 의리를 중시합니다. 정의감이 강합니다.'; break;
            case 'water': personality = '지혜롭고 유연합니다. 소통 능력이 뛰어나며 적응력이 강합니다.'; break;
        }

        return {
            personality,
            summary: `일간 ${dmName} (${dmElem.name}) - ${strength.level}`,
            strength: strength.level,
            favorableText: `용신: ${favorable.favorable.map(e => FiveElements[e].name).join(', ')}`,
            unfavorableText: `기신: ${favorable.unfavorable.map(e => FiveElements[e].name).join(', ')}`
        };
    },

    _generateNodes(pillars, dayMaster, elementBalance, strength, interpretation, favorable) {
        const nodes = [];

        // Day Master node
        nodes.push({
            id: 'saju-dm',
            label: '일간 (Day Master)',
            sublabel: HeavenlyStems.names[dayMaster],
            type: 'primary',
            system: 'saju',
            detail: `일간: ${HeavenlyStems.names[dayMaster]}\n오행: ${FiveElements[HeavenlyStems.elementKeys[dayMaster]].name}\n음양: ${HeavenlyStems.yinYang[dayMaster]}\n\n${interpretation.personality}`,
            element: HeavenlyStems.elementKeys[dayMaster]
        });

        // Four Pillars node
        const pillarText = ['year', 'month', 'day', 'hour'].map(k => {
            const p = pillars[k];
            const label = { year: '년주', month: '월주', day: '일주', hour: '시주' }[k];
            return `${label}: ${HeavenlyStems.names[p.stem]} ${EarthlyBranches.names[p.branch]}`;
        }).join('\n');
        nodes.push({
            id: 'saju-pillars',
            label: '사주 명식',
            sublabel: `${HeavenlyStems.hanja[pillars.year.stem]}${EarthlyBranches.hanja[pillars.year.branch]} ${HeavenlyStems.hanja[pillars.month.stem]}${EarthlyBranches.hanja[pillars.month.branch]} ${HeavenlyStems.hanja[pillars.day.stem]}${EarthlyBranches.hanja[pillars.day.branch]} ${HeavenlyStems.hanja[pillars.hour.stem]}${EarthlyBranches.hanja[pillars.hour.branch]}`,
            type: 'primary',
            system: 'saju',
            detail: pillarText,
            element: HeavenlyStems.elementKeys[dayMaster]
        });

        // Strength node
        nodes.push({
            id: 'saju-strength',
            label: '일간 강약',
            sublabel: strength.level,
            type: 'secondary',
            system: 'saju',
            detail: `신강/신약 판단: ${strength.level}\n강도 점수: ${strength.score}\n\n${favorable.explanation}\n\n${interpretation.favorableText}\n${interpretation.unfavorableText}`,
            element: HeavenlyStems.elementKeys[dayMaster]
        });

        // Element balance node
        const balText = Object.entries(elementBalance.percentages).map(([e, p]) => `${FiveElements[e].name}: ${p}%`).join('\n');
        nodes.push({
            id: 'saju-elements',
            label: '오행 분석',
            sublabel: `${interpretation.favorableText}`,
            type: 'secondary',
            system: 'saju',
            detail: `오행 분포:\n${balText}\n\n${favorable.explanation}`,
            element: HeavenlyStems.elementKeys[dayMaster]
        });

        return nodes;
    }
};
