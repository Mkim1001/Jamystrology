/* ==========================================
   주역 (I Ching) Engine
   Book of Changes Divination
   ========================================== */

const IChingEngine = {
    trigrams: {
        '111': { name: '건(乾)', nature: '하늘', attribute: '강건', animal: '말', element: 'metal', symbol: '☰' },
        '000': { name: '곤(坤)', nature: '땅', attribute: '순종', animal: '소', element: 'earth', symbol: '☷' },
        '100': { name: '진(震)', nature: '우레', attribute: '진동', animal: '용', element: 'wood', symbol: '☳' },
        '010': { name: '감(坎)', nature: '물', attribute: '험난', animal: '돼지', element: 'water', symbol: '☵' },
        '001': { name: '간(艮)', nature: '산', attribute: '정지', animal: '개', element: 'earth', symbol: '☶' },
        '011': { name: '손(巽)', nature: '바람', attribute: '유순', animal: '닭', element: 'wood', symbol: '☴' },
        '101': { name: '리(離)', nature: '불', attribute: '밝음', animal: '꿩', element: 'fire', symbol: '☲' },
        '110': { name: '태(兌)', nature: '연못', attribute: '기쁨', animal: '양', element: 'metal', symbol: '☱' }
    },

    hexagrams: [
        { num: 1, name: '건위천(乾爲天)', upper: '111', lower: '111', meaning: '강건하고 쉬지 않음', fortune: '대통', keyword: '창조' },
        { num: 2, name: '곤위지(坤爲地)', upper: '000', lower: '000', meaning: '순종하며 포용함', fortune: '순조', keyword: '수용' },
        { num: 3, name: '수뢰둔(水雷屯)', upper: '010', lower: '100', meaning: '시작의 어려움', fortune: '인내', keyword: '시작' },
        { num: 4, name: '산수몽(山水蒙)', upper: '001', lower: '010', meaning: '어리석음과 배움', fortune: '학습', keyword: '교육' },
        { num: 5, name: '수천수(水天需)', upper: '010', lower: '111', meaning: '기다림의 지혜', fortune: '대기', keyword: '인내' },
        { num: 6, name: '천수송(天水訟)', upper: '111', lower: '010', meaning: '다툼과 소송', fortune: '주의', keyword: '갈등' },
        { num: 7, name: '지수사(地水師)', upper: '000', lower: '010', meaning: '군대와 규율', fortune: '조직', keyword: '통솔' },
        { num: 8, name: '수지비(水地比)', upper: '010', lower: '000', meaning: '친밀함과 연합', fortune: '길', keyword: '화합' },
        { num: 9, name: '풍천소축(風天小畜)', upper: '011', lower: '111', meaning: '작은 축적', fortune: '소성', keyword: '준비' },
        { num: 10, name: '천택리(天澤履)', upper: '111', lower: '110', meaning: '예의와 실천', fortune: '신중', keyword: '예의' },
        { num: 11, name: '지천태(地天泰)', upper: '000', lower: '111', meaning: '평화와 번영', fortune: '대길', keyword: '평화' },
        { num: 12, name: '천지비(天地否)', upper: '111', lower: '000', meaning: '막힘과 정체', fortune: '정체', keyword: '막힘' },
        { num: 13, name: '천화동인(天火同人)', upper: '111', lower: '101', meaning: '같은 뜻의 사람', fortune: '협력', keyword: '단결' },
        { num: 14, name: '화천대유(火天大有)', upper: '101', lower: '111', meaning: '크게 소유함', fortune: '대길', keyword: '풍요' },
        { num: 15, name: '지산겸(地山謙)', upper: '000', lower: '001', meaning: '겸손의 미덕', fortune: '길', keyword: '겸손' },
        { num: 16, name: '뢰지예(雷地豫)', upper: '100', lower: '000', meaning: '기쁨과 준비', fortune: '순조', keyword: '즐거움' },
        { num: 17, name: '택뢰수(澤雷隨)', upper: '110', lower: '100', meaning: '따름과 순응', fortune: '유연', keyword: '순응' },
        { num: 18, name: '산풍고(山風蠱)', upper: '001', lower: '011', meaning: '부패를 바로잡음', fortune: '개혁', keyword: '개선' },
        { num: 19, name: '지택림(地澤臨)', upper: '000', lower: '110', meaning: '다가감과 감독', fortune: '길', keyword: '임박' },
        { num: 20, name: '풍지관(風地觀)', upper: '011', lower: '000', meaning: '관찰과 성찰', fortune: '관조', keyword: '관찰' },
        { num: 21, name: '화뢰서합(火雷噬嗑)', upper: '101', lower: '100', meaning: '씹어서 합침', fortune: '결단', keyword: '정의' },
        { num: 22, name: '산화비(山火賁)', upper: '001', lower: '101', meaning: '꾸밈과 문화', fortune: '소길', keyword: '아름다움' },
        { num: 23, name: '산지박(山地剝)', upper: '001', lower: '000', meaning: '벗겨짐과 쇠퇴', fortune: '주의', keyword: '쇠퇴' },
        { num: 24, name: '지뢰복(地雷復)', upper: '000', lower: '100', meaning: '되돌아옴', fortune: '회복', keyword: '회복' },
        { num: 25, name: '천뢰무망(天雷無妄)', upper: '111', lower: '100', meaning: '허망하지 않음', fortune: '순수', keyword: '진실' },
        { num: 26, name: '산천대축(山天大畜)', upper: '001', lower: '111', meaning: '크게 축적함', fortune: '대길', keyword: '축적' },
        { num: 27, name: '산뢰이(山雷頤)', upper: '001', lower: '100', meaning: '기름과 양육', fortune: '절제', keyword: '양육' },
        { num: 28, name: '택풍대과(澤風大過)', upper: '110', lower: '011', meaning: '크게 넘침', fortune: '주의', keyword: '과도' },
        { num: 29, name: '감위수(坎爲水)', upper: '010', lower: '010', meaning: '겹겹이 험난함', fortune: '위험', keyword: '험난' },
        { num: 30, name: '리위화(離爲火)', upper: '101', lower: '101', meaning: '밝음이 빛남', fortune: '밝음', keyword: '밝음' },
        { num: 31, name: '택산함(澤山咸)', upper: '110', lower: '001', meaning: '감응과 교감', fortune: '길', keyword: '감응' },
        { num: 32, name: '뢰풍항(雷風恒)', upper: '100', lower: '011', meaning: '항구적 지속', fortune: '안정', keyword: '지속' },
        { num: 33, name: '천산둔(天山遯)', upper: '111', lower: '001', meaning: '물러남의 지혜', fortune: '후퇴', keyword: '은퇴' },
        { num: 34, name: '뢰천대장(雷天大壯)', upper: '100', lower: '111', meaning: '크게 강성함', fortune: '강성', keyword: '힘' },
        { num: 35, name: '화지진(火地晉)', upper: '101', lower: '000', meaning: '나아감과 진보', fortune: '진보', keyword: '발전' },
        { num: 36, name: '지화명이(地火明夷)', upper: '000', lower: '101', meaning: '밝음이 상함', fortune: '은인', keyword: '은둔' },
        { num: 37, name: '풍화가인(風火家人)', upper: '011', lower: '101', meaning: '가정과 화목', fortune: '가정', keyword: '가정' },
        { num: 38, name: '화택규(火澤睽)', upper: '101', lower: '110', meaning: '어긋남과 대립', fortune: '불화', keyword: '대립' },
        { num: 39, name: '수산건(水山蹇)', upper: '010', lower: '001', meaning: '절름발이 어려움', fortune: '곤난', keyword: '장애' },
        { num: 40, name: '뢰수해(雷水解)', upper: '100', lower: '010', meaning: '풀림과 해소', fortune: '해결', keyword: '해방' },
        { num: 41, name: '산택손(山澤損)', upper: '001', lower: '110', meaning: '줄임과 손해', fortune: '절제', keyword: '감소' },
        { num: 42, name: '풍뢰익(風雷益)', upper: '011', lower: '100', meaning: '더함과 이익', fortune: '대길', keyword: '이익' },
        { num: 43, name: '택천쾌(澤天夬)', upper: '110', lower: '111', meaning: '결단하여 끊음', fortune: '결단', keyword: '결단' },
        { num: 44, name: '천풍구(天風姤)', upper: '111', lower: '011', meaning: '만남과 조우', fortune: '주의', keyword: '만남' },
        { num: 45, name: '택지췌(澤地萃)', upper: '110', lower: '000', meaning: '모임과 집합', fortune: '집합', keyword: '모임' },
        { num: 46, name: '지풍승(地風升)', upper: '000', lower: '011', meaning: '위로 오름', fortune: '상승', keyword: '승진' },
        { num: 47, name: '택수곤(澤水困)', upper: '110', lower: '010', meaning: '곤궁함', fortune: '곤란', keyword: '궁핍' },
        { num: 48, name: '수풍정(水風井)', upper: '010', lower: '011', meaning: '우물의 지혜', fortune: '안정', keyword: '근본' },
        { num: 49, name: '택화혁(澤火革)', upper: '110', lower: '101', meaning: '혁명과 변화', fortune: '변화', keyword: '혁신' },
        { num: 50, name: '화풍정(火風鼎)', upper: '101', lower: '011', meaning: '솥과 새로움', fortune: '쇄신', keyword: '신생' },
        { num: 51, name: '진위뢰(震爲雷)', upper: '100', lower: '100', meaning: '거듭 진동함', fortune: '놀람', keyword: '충격' },
        { num: 52, name: '간위산(艮爲山)', upper: '001', lower: '001', meaning: '멈춤의 지혜', fortune: '정지', keyword: '정지' },
        { num: 53, name: '풍산점(風山漸)', upper: '011', lower: '001', meaning: '점진적 진보', fortune: '점진', keyword: '점진' },
        { num: 54, name: '뢰택귀매(雷澤歸妹)', upper: '100', lower: '110', meaning: '시집감', fortune: '주의', keyword: '결혼' },
        { num: 55, name: '뢰화풍(雷火豊)', upper: '100', lower: '101', meaning: '풍성함과 절정', fortune: '풍요', keyword: '번영' },
        { num: 56, name: '화산려(火山旅)', upper: '101', lower: '001', meaning: '나그네와 여행', fortune: '여행', keyword: '여행' },
        { num: 57, name: '손위풍(巽爲風)', upper: '011', lower: '011', meaning: '겹겹이 유순함', fortune: '유순', keyword: '순응' },
        { num: 58, name: '태위택(兌爲澤)', upper: '110', lower: '110', meaning: '겹겹이 기쁨', fortune: '기쁨', keyword: '기쁨' },
        { num: 59, name: '풍수환(風水渙)', upper: '011', lower: '010', meaning: '흩어짐', fortune: '분산', keyword: '분산' },
        { num: 60, name: '수택절(水澤節)', upper: '010', lower: '110', meaning: '절제와 절약', fortune: '절제', keyword: '절제' },
        { num: 61, name: '풍택중부(風澤中孚)', upper: '011', lower: '110', meaning: '안에 믿음이 있음', fortune: '신뢰', keyword: '진실' },
        { num: 62, name: '뢰산소과(雷山小過)', upper: '100', lower: '001', meaning: '작게 넘침', fortune: '주의', keyword: '소과' },
        { num: 63, name: '수화기제(水火旣濟)', upper: '010', lower: '101', meaning: '이미 이루어짐', fortune: '완성', keyword: '완성' },
        { num: 64, name: '화수미제(火水未濟)', upper: '101', lower: '010', meaning: '아직 이루지 못함', fortune: '미완', keyword: '미완성' }
    ],

    calculate(birthDate, birthHour, currentDate, question) {
        // Generate hexagram using time-based method (매화역수 방식)
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const hour = currentDate.getHours();
        const minute = currentDate.getMinutes();

        // Upper trigram from year + month + day
        const upperNum = (year + month + day) % 8;
        // Lower trigram from year + month + day + hour
        const lowerNum = (year + month + day + hour) % 8;
        // Changing line
        const changingLine = (year + month + day + hour + minute) % 6;

        const trigramKeys = ['111', '000', '100', '010', '001', '011', '101', '110'];
        const upperKey = trigramKeys[upperNum];
        const lowerKey = trigramKeys[lowerNum];

        // Find the hexagram
        const hexagram = this._findHexagram(upperKey, lowerKey);

        // Get changing hexagram
        const changingHexagram = this._getChangingHexagram(upperKey, lowerKey, changingLine);

        // Interpret
        const interpretation = this._interpret(hexagram, changingHexagram, changingLine, question);

        // Element analysis
        const upperTrigram = this.trigrams[upperKey];
        const lowerTrigram = this.trigrams[lowerKey];
        const elementRelation = this._analyzeElements(upperTrigram.element, lowerTrigram.element);

        return {
            system: 'iching',
            systemName: '주역',
            color: '#00b894',
            hexagram,
            changingHexagram,
            changingLine: changingLine + 1,
            upperTrigram,
            lowerTrigram,
            interpretation,
            elementRelation,
            nodes: this._generateNodes(hexagram, changingHexagram, upperTrigram, lowerTrigram, interpretation)
        };
    },

    _findHexagram(upper, lower) {
        const found = this.hexagrams.find(h => h.upper === upper && h.lower === lower);
        return found || this.hexagrams[0];
    },

    _getChangingHexagram(upper, lower, changingLine) {
        // Flip the changing line
        const fullHex = (lower + upper).split('');
        fullHex[changingLine] = fullHex[changingLine] === '1' ? '0' : '1';
        const newLower = fullHex.slice(0, 3).join('');
        const newUpper = fullHex.slice(3).join('');
        return this._findHexagram(newUpper, newLower);
    },

    _analyzeElements(upperElem, lowerElem) {
        const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
        const overcomes = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' };

        if (upperElem === lowerElem) return { relation: '비화(比和)', meaning: '상하가 같은 기운으로 조화롭습니다.', nature: 'harmonious' };
        if (generates[lowerElem] === upperElem) return { relation: '하생상(下生上)', meaning: '아래가 위를 생하니 에너지가 상승합니다.', nature: 'positive' };
        if (generates[upperElem] === lowerElem) return { relation: '상생하(上生下)', meaning: '위가 아래를 생하니 에너지가 분산됩니다.', nature: 'neutral' };
        if (overcomes[upperElem] === lowerElem) return { relation: '상극하(上剋下)', meaning: '위가 아래를 극하니 압박이 있습니다.', nature: 'challenging' };
        if (overcomes[lowerElem] === upperElem) return { relation: '하극상(下剋上)', meaning: '아래가 위를 극하니 반발이 있습니다.', nature: 'challenging' };
        return { relation: '중립', meaning: '특별한 관계가 없습니다.', nature: 'neutral' };
    },

    _interpret(hexagram, changing, changingLine, question) {
        const fortuneMap = {
            '대길': { level: 5, advice: '적극적으로 추진하십시오. 하늘이 돕는 시기입니다.' },
            '길': { level: 4, advice: '순조롭게 진행될 것입니다. 기회를 잡으세요.' },
            '순조': { level: 4, advice: '자연의 흐름에 따르면 좋은 결과를 얻습니다.' },
            '소길': { level: 3, advice: '작은 일에서 성과를 얻을 수 있습니다.' },
            '인내': { level: 3, advice: '인내가 필요합니다. 때를 기다리세요.' },
            '주의': { level: 2, advice: '신중하게 행동하고 무리하지 마세요.' },
            '정체': { level: 2, advice: '현재는 멈추고 내면을 살펴야 할 때입니다.' },
            '위험': { level: 1, advice: '위험한 시기입니다. 모든 일에 조심하세요.' },
            '곤란': { level: 1, advice: '어려운 시기이나 뜻을 굽히지 마세요.' }
        };

        const fortuneInfo = fortuneMap[hexagram.fortune] || { level: 3, advice: '상황을 잘 살펴서 행동하세요.' };

        const changingText = changing
            ? `변괘 ${changing.name}로 변하며, 이는 "${changing.meaning}"을 나타냅니다. ${changing.keyword}의 에너지로 전환됩니다.`
            : '';

        return {
            mainMessage: `${hexagram.name}: "${hexagram.meaning}"`,
            fortune: hexagram.fortune,
            fortuneLevel: fortuneInfo.level,
            keyword: hexagram.keyword,
            advice: fortuneInfo.advice,
            changingText,
            fullReading: `본괘: ${hexagram.name} (제${hexagram.num}괘)\n의미: ${hexagram.meaning}\n운세: ${hexagram.fortune}\n핵심: ${hexagram.keyword}\n\n${changingLine + 1}효 변동\n${changingText}\n\n조언: ${fortuneInfo.advice}`
        };
    },

    _generateNodes(hexagram, changing, upper, lower, interpretation) {
        const nodes = [];

        // Main hexagram
        nodes.push({
            id: 'ic-main',
            label: hexagram.name.split('(')[0],
            sublabel: `제${hexagram.num}괘 - ${hexagram.keyword}`,
            type: 'primary',
            system: 'iching',
            detail: `${hexagram.name}\n\n의미: ${hexagram.meaning}\n운세: ${hexagram.fortune}\n\n${interpretation.advice}`,
            element: upper.element
        });

        // Trigrams
        nodes.push({
            id: 'ic-upper',
            label: `상괘: ${upper.symbol}`,
            sublabel: `${upper.name} (${upper.nature})`,
            type: 'secondary',
            system: 'iching',
            detail: `상괘 (위): ${upper.name}\n자연: ${upper.nature}\n속성: ${upper.attribute}\n동물: ${upper.animal}\n오행: ${upper.element}`,
            element: upper.element
        });

        nodes.push({
            id: 'ic-lower',
            label: `하괘: ${lower.symbol}`,
            sublabel: `${lower.name} (${lower.nature})`,
            type: 'secondary',
            system: 'iching',
            detail: `하괘 (아래): ${lower.name}\n자연: ${lower.nature}\n속성: ${lower.attribute}\n동물: ${lower.animal}\n오행: ${lower.element}`,
            element: lower.element
        });

        // Changing hexagram
        if (changing) {
            nodes.push({
                id: 'ic-changing',
                label: '변괘',
                sublabel: changing.name.split('(')[0],
                type: 'insight',
                system: 'iching',
                detail: `변괘: ${changing.name}\n의미: ${changing.meaning}\n운세: ${changing.fortune}\n핵심: ${changing.keyword}\n\n상황이 이 방향으로 변화할 것입니다.`,
                element: this.trigrams[changing.upper]?.element || 'earth'
            });
        }

        return nodes;
    }
};
