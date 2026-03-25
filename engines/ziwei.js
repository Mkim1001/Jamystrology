/* ==========================================
   자미두수 (Zi Wei Dou Shu) Engine
   Purple Star Astrology
   ========================================== */

const ZiWeiEngine = {
    // Major Stars (주성)
    majorStars: {
        ziwei: { name: '자미(紫微)', nature: 'emperor', meaning: '제왕의 별, 리더십, 존귀', brightness: 'bright' },
        tianji: { name: '천기(天機)', nature: 'wise', meaning: '지혜, 계획, 기술', brightness: 'bright' },
        taiyang: { name: '태양(太陽)', nature: 'brilliant', meaning: '빛, 명예, 남성성', brightness: 'bright' },
        wuqu: { name: '무곡(武曲)', nature: 'warrior', meaning: '재물, 결단, 무예', brightness: 'bright' },
        tianfu: { name: '천부(天府)', nature: 'treasury', meaning: '재고, 안정, 보수', brightness: 'bright' },
        tiantong: { name: '천동(天同)', nature: 'gentle', meaning: '복덕, 게으름, 안락', brightness: 'neutral' },
        lianzhen: { name: '염정(廉貞)', nature: 'fierce', meaning: '감정, 법률, 복잡', brightness: 'dark' },
        tianliang: { name: '천량(天梁)', nature: 'noble', meaning: '음덕, 수명, 보호', brightness: 'bright' },
        qisha: { name: '칠살(七殺)', nature: 'aggressive', meaning: '권위, 고독, 결단', brightness: 'dark' },
        pojun: { name: '파군(破軍)', nature: 'destroyer', meaning: '파괴, 혁신, 소비', brightness: 'dark' },
        taiyin: { name: '태음(太陰)', nature: 'lunar', meaning: '부동산, 여성성, 내면', brightness: 'bright' },
        tanglang: { name: '탐랑(貪狼)', nature: 'desire', meaning: '욕망, 재능, 도화', brightness: 'neutral' },
        jumen: { name: '거문(巨門)', nature: 'dark', meaning: '시비, 구설, 탐구', brightness: 'dark' },
        tianxiang: { name: '천상(天相)', nature: 'minister', meaning: '보좌, 인쇄, 의복', brightness: 'bright' }
    },

    // Twelve Palaces (십이궁)
    palaces: [
        { name: '명궁(命宮)', meaning: '성격, 외모, 인생방향', category: 'self' },
        { name: '형제궁(兄弟宮)', meaning: '형제자매, 동료관계', category: 'family' },
        { name: '부처궁(夫妻宮)', meaning: '배우자, 결혼생활', category: 'relationship' },
        { name: '자녀궁(子女宮)', meaning: '자녀, 성생활, 투자', category: 'family' },
        { name: '재백궁(財帛宮)', meaning: '재물 능력, 수입원', category: 'wealth' },
        { name: '질액궁(疾厄宮)', meaning: '건강, 질병, 재난', category: 'health' },
        { name: '천이궁(遷移宮)', meaning: '외출, 여행, 대외관계', category: 'travel' },
        { name: '노복궁(奴僕宮)', meaning: '부하, 친구, 교우', category: 'social' },
        { name: '관록궁(官祿宮)', meaning: '사업, 직업, 학업', category: 'career' },
        { name: '전택궁(田宅宮)', meaning: '부동산, 주거환경', category: 'property' },
        { name: '복덕궁(福德宮)', meaning: '정신생활, 취미, 복', category: 'spirit' },
        { name: '부모궁(父母宮)', meaning: '부모, 상사, 문서', category: 'authority' }
    ],

    // Lucky Stars (길성)
    luckyStars: ['좌보(左輔)', '우필(右弼)', '천괴(天魁)', '천월(天鉞)', '록존(祿存)', '천마(天馬)'],

    // Unlucky Stars (흉성)
    unluckyStars: ['화성(火星)', '영성(鈴星)', '양인(擎羊)', '타라(陀羅)', '지공(地空)', '지겁(地劫)'],

    calculate(birthDate, birthHour, gender) {
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        const hour = birthHour;
        const lunarMonth = ((month + 10) % 12) + 1;

        // Calculate Ming Palace position
        const mingGong = this._calcMingGong(lunarMonth, hour);

        // Place Zi Wei star
        const ziweiPos = this._placeZiWei(day);

        // Arrange all major stars
        const starArrangement = this._arrangeStars(ziweiPos, mingGong);

        // Assign stars to palaces
        const chart = this._buildChart(mingGong, starArrangement, year, month, day, hour);

        // Analyze the chart
        const analysis = this._analyzeChart(chart, mingGong);

        // Decade luck (大限)
        const decadeLuck = this._calcDecadeLuck(chart, year, gender);

        return {
            system: 'ziwei',
            systemName: '자미두수',
            color: '#fd79a8',
            mingGong,
            ziweiPos,
            chart,
            analysis,
            decadeLuck,
            nodes: this._generateNodes(chart, analysis, mingGong)
        };
    },

    _calcMingGong(lunarMonth, hour) {
        const hourBranch = Math.floor(((hour + 1) % 24) / 2);
        // Ming Gong = Yin(寅=2) + month - hour
        const pos = (2 + lunarMonth - 1 - hourBranch + 24) % 12;
        return pos;
    },

    _placeZiWei(day) {
        // Simplified: Zi Wei position based on birth day
        return (day - 1) % 12;
    },

    _arrangeStars(ziweiPos, mingGong) {
        const starKeys = Object.keys(this.majorStars);
        const arrangement = {};

        // Zi Wei series (자미계)
        const ziweiSeries = ['ziwei', 'tianji', 'taiyang', 'wuqu', 'tiantong', 'lianzhen'];
        const ziweiOffsets = [0, -1, -3, -4, -5, -8];
        ziweiSeries.forEach((star, i) => {
            arrangement[star] = ((ziweiPos + ziweiOffsets[i]) % 12 + 12) % 12;
        });

        // Tian Fu series (천부계)
        const tianfuSeries = ['tianfu', 'taiyin', 'tanglang', 'jumen', 'tianxiang', 'tianliang', 'qisha', 'pojun'];
        const tianfuPos = (12 - ziweiPos + 4) % 12;
        const tianfuOffsets = [0, 1, 2, 3, 4, 5, 6, 10];
        tianfuSeries.forEach((star, i) => {
            arrangement[star] = (tianfuPos + tianfuOffsets[i]) % 12;
        });

        return arrangement;
    },

    _buildChart(mingGong, starArrangement, year, month, day, hour) {
        const chart = [];
        for (let i = 0; i < 12; i++) {
            const palaceIdx = (i - mingGong + 12) % 12;
            const palace = this.palaces[palaceIdx];
            const branchIdx = i;

            // Find stars in this palace
            const starsHere = [];
            for (const [starKey, pos] of Object.entries(starArrangement)) {
                if (pos === i) {
                    starsHere.push(this.majorStars[starKey]);
                }
            }

            // Lucky/unlucky stars
            const seed = (day * 7 + month * 13 + i * 3) % 20;
            const luckyHere = seed < 4 ? [this.luckyStars[seed % this.luckyStars.length]] : [];
            const unluckyHere = seed >= 16 ? [this.unluckyStars[seed % this.unluckyStars.length]] : [];

            chart.push({
                position: i,
                palace,
                branch: EarthlyBranches.names[branchIdx],
                branchHanja: EarthlyBranches.hanja[branchIdx],
                majorStars: starsHere,
                luckyStars: luckyHere,
                unluckyStars: unluckyHere,
                isMingGong: palaceIdx === 0
            });
        }
        return chart;
    },

    _analyzeChart(chart, mingGong) {
        const mingPalace = chart.find(c => c.isMingGong);
        const stars = mingPalace.majorStars;

        let personality = '다양한 에너지가 혼합된 복합적 성격입니다.';
        let fortune = '인생에 기복이 있으나 균형을 찾아갈 것입니다.';
        let career = '다양한 분야에서 능력을 발휘할 수 있습니다.';

        if (stars.length > 0) {
            const mainStar = stars[0];
            switch (mainStar.nature) {
                case 'emperor': personality = '리더십이 뛰어나고 존귀한 기운이 있습니다. 높은 지위를 얻을 수 있습니다.'; break;
                case 'wise': personality = '두뇌가 명석하고 계획적입니다. 전략적 사고가 뛰어납니다.'; break;
                case 'brilliant': personality = '밝고 활발하며 사교적입니다. 공적인 영역에서 빛을 발합니다.'; break;
                case 'warrior': personality = '강인한 의지와 재물을 모으는 능력이 있습니다.'; break;
                case 'treasury': personality = '안정적이고 보수적이며 자산관리에 뛰어납니다.'; break;
                case 'gentle': personality = '온화하고 복이 많으나 적극성이 부족할 수 있습니다.'; break;
                case 'fierce': personality = '감정이 풍부하고 복잡한 내면을 가지고 있습니다.'; break;
                case 'noble': personality = '덕이 있고 남을 돕는 성품입니다. 어려움을 극복하는 힘이 있습니다.'; break;
                case 'aggressive': personality = '과감하고 독립적입니다. 큰 성취를 이루나 고독할 수 있습니다.'; break;
                case 'destroyer': personality = '혁신적이고 변화를 추구합니다. 기존 것을 깨고 새로 만듭니다.'; break;
                case 'lunar': personality = '섬세하고 내면이 풍부합니다. 부동산이나 예술에 인연이 있습니다.'; break;
                case 'desire': personality = '다재다능하고 매력적입니다. 도화(桃花)의 기운이 있습니다.'; break;
                case 'dark': personality = '탐구적이고 날카로운 관찰력이 있습니다. 구설에 주의해야 합니다.'; break;
                case 'minister': personality = '인품이 좋고 보좌하는 능력이 뛰어납니다.'; break;
            }
        }

        // Find wealth and career palaces
        const wealthPalace = chart.find(c => c.palace.category === 'wealth');
        const careerPalace = chart.find(c => c.palace.category === 'career');

        if (wealthPalace.majorStars.length > 0) {
            const ws = wealthPalace.majorStars[0];
            fortune = ws.brightness === 'bright'
                ? `재백궁에 ${ws.name}가 밝게 자리하여 재물운이 좋습니다.`
                : `재백궁의 ${ws.name}가 어두워 재물에 기복이 있을 수 있습니다.`;
        }

        if (careerPalace.majorStars.length > 0) {
            const cs = careerPalace.majorStars[0];
            career = cs.brightness === 'bright'
                ? `관록궁에 ${cs.name}가 있어 직업적 성취가 기대됩니다.`
                : `관록궁의 ${cs.name}는 직업적 도전이 있음을 의미합니다.`;
        }

        return {
            mingStars: stars.map(s => s.name).join(', ') || '주성 없음',
            personality,
            fortune,
            career,
            mingPalaceBranch: mingPalace.branch
        };
    },

    _calcDecadeLuck(chart, birthYear, gender) {
        const periods = [];
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;

        for (let i = 0; i < 12; i++) {
            const startAge = 2 + i * 10;
            const endAge = startAge + 9;
            const palace = chart[i];
            const stars = palace.majorStars.map(s => s.name).join(', ') || '-';
            periods.push({
                range: `${startAge}-${endAge}세`,
                palace: palace.palace.name,
                stars,
                isCurrent: age >= startAge && age <= endAge,
                position: i
            });
        }
        return periods;
    },

    _generateNodes(chart, analysis, mingGong) {
        const nodes = [];

        // Ming Gong star
        nodes.push({
            id: 'zw-ming',
            label: '명궁',
            sublabel: analysis.mingStars,
            type: 'primary',
            system: 'ziwei',
            detail: `명궁 위치: ${analysis.mingPalaceBranch}\n주성: ${analysis.mingStars}\n\n성격: ${analysis.personality}`,
            element: 'fire'
        });

        // Fortune
        nodes.push({
            id: 'zw-wealth',
            label: '재백궁',
            sublabel: '재물운',
            type: 'primary',
            system: 'ziwei',
            detail: `재물 분석:\n${analysis.fortune}`,
            element: 'metal'
        });

        // Career
        nodes.push({
            id: 'zw-career',
            label: '관록궁',
            sublabel: '직업운',
            type: 'secondary',
            system: 'ziwei',
            detail: `직업/사업 분석:\n${analysis.career}`,
            element: 'earth'
        });

        // Overall insight
        nodes.push({
            id: 'zw-insight',
            label: '자미 총평',
            sublabel: analysis.mingStars.split(',')[0] || '종합',
            type: 'insight',
            system: 'ziwei',
            detail: `자미두수 종합 분석:\n\n명궁: ${analysis.mingStars}\n성격: ${analysis.personality}\n\n재물: ${analysis.fortune}\n\n직업: ${analysis.career}`,
            element: 'fire'
        });

        return nodes;
    }
};
