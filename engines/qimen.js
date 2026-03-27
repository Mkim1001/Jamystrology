/* ==========================================
   기문둔갑 (Qi Men Dun Jia) Engine
   ========================================== */

const QiMenEngine = {
    // Nine Palaces (구궁)
    palaces: [
        { num: 4, direction: '동남(巽)', element: 'wood', trigram: '巽' },
        { num: 9, direction: '남(離)', element: 'fire', trigram: '離' },
        { num: 2, direction: '서남(坤)', element: 'earth', trigram: '坤' },
        { num: 3, direction: '동(震)', element: 'wood', trigram: '震' },
        { num: 5, direction: '중앙', element: 'earth', trigram: '中' },
        { num: 7, direction: '서(兌)', element: 'metal', trigram: '兌' },
        { num: 8, direction: '동북(艮)', element: 'earth', trigram: '艮' },
        { num: 1, direction: '북(坎)', element: 'water', trigram: '坎' },
        { num: 6, direction: '서북(乾)', element: 'metal', trigram: '乾' }
    ],

    // Eight Doors (팔문)
    doors: [
        { name: '휴문(休門)', nature: 'auspicious', meaning: '휴식, 귀인의 도움', element: 'water' },
        { name: '생문(生門)', nature: 'auspicious', meaning: '생기, 재물, 부동산', element: 'earth' },
        { name: '상문(傷門)', nature: 'inauspicious', meaning: '상처, 다툼, 소송', element: 'wood' },
        { name: '두문(杜門)', nature: 'neutral', meaning: '은둔, 비밀, 도주', element: 'wood' },
        { name: '경문(景門)', nature: 'neutral', meaning: '문서, 시험, 화재', element: 'fire' },
        { name: '사문(死門)', nature: 'inauspicious', meaning: '질병, 사망, 매장', element: 'earth' },
        { name: '경문(驚門)', nature: 'inauspicious', meaning: '놀람, 관재, 구설', element: 'metal' },
        { name: '개문(開門)', nature: 'auspicious', meaning: '개방, 관직, 사업', element: 'metal' }
    ],

    // Nine Stars (구성)
    stars: [
        { name: '천봉(天蓬)', nature: 'inauspicious', meaning: '도적, 물, 음모', element: 'water' },
        { name: '천임(天任)', nature: 'auspicious', meaning: '토지, 건축, 안정', element: 'earth' },
        { name: '천충(天沖)', nature: 'neutral', meaning: '활동, 전쟁, 분쟁', element: 'wood' },
        { name: '천보(天輔)', nature: 'auspicious', meaning: '문학, 학문, 의술', element: 'wood' },
        { name: '천영(天英)', nature: 'neutral', meaning: '문화, 예술, 화재', element: 'fire' },
        { name: '천예(天芮)', nature: 'inauspicious', meaning: '질병, 재난, 소인', element: 'earth' },
        { name: '천주(天柱)', nature: 'inauspicious', meaning: '파괴, 도적, 분실', element: 'metal' },
        { name: '천심(天心)', nature: 'auspicious', meaning: '의술, 관직, 정직', element: 'metal' },
        { name: '천금(天禽)', nature: 'auspicious', meaning: '중앙, 조화, 만물', element: 'earth' }
    ],

    // Eight Deities (팔신)
    deities: [
        { name: '직부(值符)', meaning: '최고 길신, 보호', nature: 'auspicious' },
        { name: '등사(螣蛇)', meaning: '놀람, 꿈, 기이함', nature: 'inauspicious' },
        { name: '태음(太陰)', meaning: '음모, 비밀, 여성', nature: 'neutral' },
        { name: '육합(六合)', meaning: '혼인, 거래, 합작', nature: 'auspicious' },
        { name: '백호(白虎)', meaning: '흉사, 상해, 도로', nature: 'inauspicious' },
        { name: '현무(玄武)', meaning: '도적, 실물, 음란', nature: 'inauspicious' },
        { name: '구지(九地)', meaning: '안정, 수비, 은둔', nature: 'neutral' },
        { name: '구천(九天)', meaning: '활동, 공격, 비행', nature: 'auspicious' }
    ],

    // Three Wonders (삼기) and Six Yi (육의)
    threeWonders: ['을기(乙奇)', '병기(丙奇)', '정기(丁奇)'],
    sixYi: ['무(戊)', '기(己)', '경(庚)', '신(辛)', '임(壬)', '계(癸)'],

    calculate(birthDate, birthHour, currentDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const hour = birthHour;

        // Determine the Ju (局) number
        const juNum = this._determineJu(month, day, hour);

        // Arrange the nine palaces
        const arrangement = this._arrangePalaces(juNum, day, hour);

        // Find the Duty Door and Star
        const dutyDoor = this.doors[(day + hour) % 8];
        const dutyStar = this.stars[(day * 3 + hour) % 9];

        // Assign doors, stars, and deities to palaces
        const grid = this._buildGrid(arrangement, day, hour, month);

        // Determine favorable directions
        const favorableDirections = this._findFavorableDirections(grid);

        // Generate interpretation
        const interpretation = this._interpret(grid, dutyDoor, dutyStar, favorableDirections);

        // Pattern detection (기문 격국)
        const pattern = this._detectPattern(grid, arrangement);

        return {
            system: 'qimen',
            systemName: '기문둔갑',
            color: '#a29bfe',
            juNum,
            grid,
            dutyDoor,
            dutyStar,
            favorableDirections,
            interpretation,
            pattern,
            nodes: this._generateNodes(grid, dutyDoor, dutyStar, interpretation, pattern, favorableDirections)
        };
    },

    _determineJu(month, day, hour) {
        // Simplified Ju determination based on solar term
        const seed = (month * 31 + day) % 18;
        if (seed < 9) return (seed % 9) + 1; // Yang Dun
        return 9 - (seed % 9); // Yin Dun
    },

    _arrangePalaces(juNum, day, hour) {
        const base = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // Luoshu
        const shift = (juNum + day) % 9;
        return base.map((v, i) => {
            const newVal = ((v + shift - 1) % 9) + 1;
            return { ...this.palaces[i], currentNum: newVal };
        });
    },

    _buildGrid(arrangement, day, hour, month) {
        return arrangement.map((palace, idx) => {
            const doorIdx = (idx + day) % 8;
            const starIdx = (idx + hour) % 9;
            const deityIdx = (idx + month) % 8;
            const stemIdx = (idx + day + hour) % 10;

            const wonder = stemIdx < 3 ? this.threeWonders[stemIdx] : null;
            const yi = stemIdx >= 4 ? this.sixYi[stemIdx - 4] : null;

            return {
                palace: this.palaces[idx],
                door: this.doors[doorIdx],
                star: this.stars[starIdx],
                deity: this.deities[deityIdx],
                stem: HeavenlyStems.names[stemIdx],
                wonder,
                yi,
                stemElement: HeavenlyStems.elementKeys[stemIdx]
            };
        });
    },

    _findFavorableDirections(grid) {
        const favorable = [];
        grid.forEach(cell => {
            if (cell.door.nature === 'auspicious' && cell.star.nature === 'auspicious') {
                favorable.push({
                    direction: cell.palace.direction,
                    door: cell.door.name,
                    star: cell.star.name,
                    reason: `${cell.door.name}과 ${cell.star.name}이 함께하여 대길합니다.`
                });
            } else if (cell.door.nature === 'auspicious' || cell.wonder) {
                favorable.push({
                    direction: cell.palace.direction,
                    door: cell.door.name,
                    star: cell.star.name,
                    reason: cell.wonder
                        ? `${cell.wonder}가 있어 길합니다.`
                        : `${cell.door.name}이 길방을 나타냅니다.`
                });
            }
        });
        return favorable;
    },

    _detectPattern(grid, arrangement) {
        // Detect notable patterns
        const patterns = [];
        grid.forEach(cell => {
            if (cell.wonder && cell.door.nature === 'auspicious') {
                patterns.push(`${cell.palace.direction}: 기문(奇門) 상합 - ${cell.wonder} + ${cell.door.name}`);
            }
            if (cell.door.nature === 'inauspicious' && cell.star.nature === 'inauspicious') {
                patterns.push(`${cell.palace.direction}: 흉격(凶格) - ${cell.door.name} + ${cell.star.name}`);
            }
        });

        return {
            patterns,
            summary: patterns.length > 0 ? patterns.join('\n') : '특별한 격국이 발견되지 않았습니다.'
        };
    },

    _interpret(grid, dutyDoor, dutyStar, favorableDirections) {
        const doorMsg = dutyDoor.nature === 'auspicious'
            ? `당직문 ${dutyDoor.name}: ${dutyDoor.meaning}. 전체적으로 길한 기운입니다.`
            : dutyDoor.nature === 'inauspicious'
            ? `당직문 ${dutyDoor.name}: ${dutyDoor.meaning}. 주의가 필요합니다.`
            : `당직문 ${dutyDoor.name}: ${dutyDoor.meaning}. 상황에 따라 달라집니다.`;

        const starMsg = dutyStar.nature === 'auspicious'
            ? `당직성 ${dutyStar.name}: ${dutyStar.meaning}. 하늘의 기운이 돕습니다.`
            : `당직성 ${dutyStar.name}: ${dutyStar.meaning}. 신중해야 합니다.`;

        const dirMsg = favorableDirections.length > 0
            ? `길방위: ${favorableDirections.slice(0, 3).map(d => d.direction).join(', ')}`
            : '뚜렷한 길방이 없으니 현 위치를 지키는 것이 좋습니다.';

        return {
            doorMessage: doorMsg,
            starMessage: starMsg,
            directionMessage: dirMsg,
            overall: `${doorMsg}\n${starMsg}\n\n${dirMsg}`
        };
    },

    _generateNodes(grid, dutyDoor, dutyStar, interpretation, pattern, favorable) {
        const nodes = [];

        nodes.push({
            id: 'qi-dutydoor',
            label: '당직문',
            sublabel: dutyDoor.name,
            type: 'primary',
            system: 'qimen',
            detail: `${dutyDoor.name}\n성질: ${dutyDoor.nature === 'auspicious' ? '길(吉)' : dutyDoor.nature === 'inauspicious' ? '흉(凶)' : '중(中)'}\n의미: ${dutyDoor.meaning}\n원소: ${dutyDoor.element}\n\n${interpretation.doorMessage}`,
            element: dutyDoor.element
        });

        nodes.push({
            id: 'qi-dutystar',
            label: '당직성',
            sublabel: dutyStar.name,
            type: 'primary',
            system: 'qimen',
            detail: `${dutyStar.name}\n성질: ${dutyStar.nature === 'auspicious' ? '길(吉)' : dutyStar.nature === 'inauspicious' ? '흉(凶)' : '중(中)'}\n의미: ${dutyStar.meaning}\n\n${interpretation.starMessage}`,
            element: dutyStar.element
        });

        nodes.push({
            id: 'qi-direction',
            label: '길방위',
            sublabel: favorable.length > 0 ? favorable[0].direction : '관망',
            type: 'secondary',
            system: 'qimen',
            detail: `길한 방위:\n${favorable.map(f => `${f.direction}: ${f.reason}`).join('\n') || '없음'}\n\n${interpretation.directionMessage}`,
            element: 'metal'
        });

        nodes.push({
            id: 'qi-pattern',
            label: '격국',
            sublabel: pattern.patterns.length > 0 ? '격국 발견' : '일반',
            type: 'insight',
            system: 'qimen',
            detail: `기문둔갑 격국 분석:\n\n${pattern.summary}`,
            element: 'earth'
        });

        return nodes;
    }
};
