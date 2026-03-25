/* ==========================================
   Synthesis Engine
   Cross-system correlation and insight
   ========================================== */

const SynthesisEngine = {
    // Element mapping across systems
    elementMap: {
        wood: { western: 'fire signs', babylonian: 'Marduk', saju: '목(木)', qimen: '동방', ziwei: '탐랑/천기', iching: '진/손', color: '#00b894' },
        fire: { western: 'fire signs', babylonian: 'Shamash/Nergal', saju: '화(火)', qimen: '남방', ziwei: '태양/천영', iching: '리', color: '#ff6b6b' },
        earth: { western: 'earth signs', babylonian: 'Ishtar/Ninurta', saju: '토(土)', qimen: '중앙', ziwei: '천부/천임', iching: '곤/간', color: '#ffeaa7' },
        metal: { western: 'air signs', babylonian: 'Nabu', saju: '금(金)', qimen: '서방', ziwei: '무곡/천심', iching: '건/태', color: '#dfe6e9' },
        water: { western: 'water signs', babylonian: 'Sin', saju: '수(水)', qimen: '북방', ziwei: '태음/천봉', iching: '감', color: '#4ecdc4' }
    },

    synthesize(results) {
        const { babylonian, horary, saju, qimen, ziwei, iching } = results;

        // Collect all elements from each system
        const elementProfile = this._buildElementProfile(results);

        // Find cross-system correlations
        const correlations = this._findCorrelations(results);

        // Generate unified insights
        const insights = this._generateInsights(results, elementProfile, correlations);

        // Build synthesis nodes
        const nodes = this._generateSynthesisNodes(insights, correlations, elementProfile);

        // Build connections between all system nodes
        const connections = this._buildConnections(results, correlations);

        return {
            elementProfile,
            correlations,
            insights,
            nodes,
            connections
        };
    },

    _buildElementProfile(results) {
        const profile = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

        // From Saju
        if (results.saju?.elementBalance) {
            const bal = results.saju.elementBalance.percentages;
            for (const [elem, pct] of Object.entries(bal)) {
                profile[elem] += pct * 0.3;
            }
        }

        // From Horary
        if (results.horary?.ascendant) {
            const elem = results.horary.ascendant.element;
            if (profile[elem] !== undefined) profile[elem] += 15;
        }

        // From Babylonian
        if (results.babylonian?.birthSign) {
            const elem = results.babylonian.birthSign.element;
            if (profile[elem] !== undefined) profile[elem] += 15;
        }

        // From I Ching
        if (results.iching?.upperTrigram) {
            const elem = results.iching.upperTrigram.element;
            if (profile[elem] !== undefined) profile[elem] += 10;
        }
        if (results.iching?.lowerTrigram) {
            const elem = results.iching.lowerTrigram.element;
            if (profile[elem] !== undefined) profile[elem] += 10;
        }

        // From Qi Men
        if (results.qimen?.dutyDoor) {
            const elem = results.qimen.dutyDoor.element;
            if (profile[elem] !== undefined) profile[elem] += 10;
        }

        // Normalize
        const total = Object.values(profile).reduce((a, b) => a + b, 0) || 1;
        const normalized = {};
        for (const [elem, val] of Object.entries(profile)) {
            normalized[elem] = Math.round((val / total) * 100);
        }

        // Find dominant and weak elements
        const sorted = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
        const dominant = sorted[0];
        const weak = sorted[sorted.length - 1];

        return {
            raw: profile,
            normalized,
            dominant: { element: dominant[0], percentage: dominant[1] },
            weak: { element: weak[0], percentage: weak[1] },
            balance: this._assessBalance(normalized)
        };
    },

    _assessBalance(normalized) {
        const values = Object.values(normalized);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const diff = max - min;

        if (diff < 10) return { level: '매우 균형', score: 95, description: '오행이 매우 균형적으로 분포되어 있습니다. 안정적인 에너지 흐름입니다.' };
        if (diff < 20) return { level: '균형', score: 75, description: '대체로 균형잡힌 오행 분포입니다. 소소한 조정만 필요합니다.' };
        if (diff < 35) return { level: '약간 편중', score: 55, description: '일부 오행이 강하고 일부가 약합니다. 보완이 필요합니다.' };
        return { level: '편중', score: 35, description: '오행이 크게 치우쳐 있습니다. 부족한 오행을 의식적으로 보완해야 합니다.' };
    },

    _findCorrelations(results) {
        const correlations = [];

        // Saju Day Master vs Horary Ascendant element
        if (results.saju?.dayMasterElement && results.horary?.ascendant) {
            const sajuElem = results.saju.dayMasterElement;
            const horaryElem = results.horary.ascendant.element;
            const generates = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };

            let relation, strength;
            if (sajuElem === horaryElem) {
                relation = '동질 공명';
                strength = 90;
            } else if (generates[sajuElem] === horaryElem) {
                relation = '상생 관계';
                strength = 80;
            } else if (generates[horaryElem] === sajuElem) {
                relation = '역생 관계';
                strength = 70;
            } else {
                relation = '상극 긴장';
                strength = 40;
            }

            correlations.push({
                systems: ['saju', 'horary'],
                systemNames: ['사주', '호라리'],
                type: relation,
                strength,
                detail: `사주 일간(${FiveElements[sajuElem].name})과 호라리 상승궁(${FiveElements[horaryElem].name})이 ${relation} 관계입니다.`,
                color1: '#ffe66d',
                color2: '#4ecdc4'
            });
        }

        // Babylonian ruling planet vs Saju element
        if (results.babylonian?.rulingPlanet && results.saju?.dayMasterElement) {
            const babElem = results.babylonian.rulingPlanet.element;
            const sajuElem = results.saju.dayMasterElement;
            const match = babElem === sajuElem;
            correlations.push({
                systems: ['babylonian', 'saju'],
                systemNames: ['바빌로니아', '사주'],
                type: match ? '원소 일치' : '원소 상이',
                strength: match ? 85 : 50,
                detail: `바빌로니아 수호성(${babElem})과 사주 일간(${sajuElem})의 ${match ? '원소가 일치하여 강한 공명이 있습니다' : '원소가 달라 다각적 관점을 제공합니다'}.`,
                color1: '#ff6b6b',
                color2: '#ffe66d'
            });
        }

        // I Ching fortune vs Horary judgment
        if (results.iching?.interpretation && results.horary?.judgment) {
            const ichingLevel = results.iching.interpretation.fortuneLevel;
            const horaryScore = results.horary.judgment.score;
            const agreement = Math.abs(ichingLevel * 20 - horaryScore) < 30;
            correlations.push({
                systems: ['iching', 'horary'],
                systemNames: ['주역', '호라리'],
                type: agreement ? '판단 일치' : '판단 상이',
                strength: agreement ? 85 : 45,
                detail: `주역(${results.iching.interpretation.fortune})과 호라리(${results.horary.judgment.answer})의 판단이 ${agreement ? '일치합니다. 신뢰도가 높습니다.' : '다릅니다. 다각도로 분석이 필요합니다.'}`,
                color1: '#00b894',
                color2: '#4ecdc4'
            });
        }

        // Qi Men direction vs Zi Wei palace
        if (results.qimen?.favorableDirections?.length > 0 && results.ziwei) {
            correlations.push({
                systems: ['qimen', 'ziwei'],
                systemNames: ['기문둔갑', '자미두수'],
                type: '방위-궁위 연결',
                strength: 70,
                detail: `기문둔갑의 길방(${results.qimen.favorableDirections[0].direction})과 자미두수의 명궁이 연결되어 방위적 통찰을 제공합니다.`,
                color1: '#a29bfe',
                color2: '#fd79a8'
            });
        }

        // Babylonian omen vs I Ching hexagram
        if (results.babylonian?.interpretation && results.iching?.hexagram) {
            const babFav = results.babylonian.interpretation.favIndex;
            const ichingFort = results.iching.interpretation.fortuneLevel;
            const agreement = Math.abs(babFav - (5 - ichingFort)) < 2;
            correlations.push({
                systems: ['babylonian', 'iching'],
                systemNames: ['바빌로니아', '주역'],
                type: agreement ? '동서양 합치' : '동서양 시각차',
                strength: agreement ? 80 : 55,
                detail: `바빌로니아 징조와 주역 괘가 ${agreement ? '같은 방향을 가리킵니다. 동서양 점술이 합치합니다.' : '다른 면을 보여줍니다. 복합적 해석이 필요합니다.'}`,
                color1: '#ff6b6b',
                color2: '#00b894'
            });
        }

        return correlations;
    },

    _generateInsights(results, elementProfile, correlations) {
        const insights = {};

        // Overall Fortune
        let fortuneScores = [];
        if (results.babylonian?.interpretation) fortuneScores.push({ system: '바빌로니아', score: (4 - results.babylonian.interpretation.favIndex) * 25 });
        if (results.horary?.judgment) fortuneScores.push({ system: '호라리', score: results.horary.judgment.score });
        if (results.iching?.interpretation) fortuneScores.push({ system: '주역', score: results.iching.interpretation.fortuneLevel * 20 });

        const avgFortune = fortuneScores.length > 0
            ? Math.round(fortuneScores.reduce((a, b) => a + b.score, 0) / fortuneScores.length)
            : 50;

        insights.overallFortune = {
            score: avgFortune,
            level: avgFortune >= 75 ? '대길(大吉)' : avgFortune >= 55 ? '길(吉)' : avgFortune >= 40 ? '보통(平)' : '주의(注意)',
            detail: `6개 점술 시스템의 종합 분석 결과, 현재 운세는 "${avgFortune >= 75 ? '매우 좋음' : avgFortune >= 55 ? '좋음' : avgFortune >= 40 ? '보통' : '주의 필요'}"입니다.`
        };

        // Personality Synthesis
        let personalityParts = [];
        if (results.saju?.interpretation?.personality) personalityParts.push(`[사주] ${results.saju.interpretation.personality}`);
        if (results.ziwei?.analysis?.personality) personalityParts.push(`[자미] ${results.ziwei.analysis.personality}`);
        if (results.babylonian?.interpretation?.message) personalityParts.push(`[바빌로니아] ${results.babylonian.interpretation.message}`);

        insights.personality = {
            parts: personalityParts,
            synthesis: personalityParts.length > 0 ? personalityParts.join('\n\n') : '성격 분석 데이터 부족'
        };

        // Action Advice
        let adviceParts = [];
        if (results.iching?.interpretation?.advice) adviceParts.push(`[주역] ${results.iching.interpretation.advice}`);
        if (results.qimen?.interpretation?.directionMessage) adviceParts.push(`[기문둔갑] ${results.qimen.interpretation.directionMessage}`);
        if (results.babylonian?.interpretation?.advice) adviceParts.push(`[바빌로니아] ${results.babylonian.interpretation.advice}`);
        if (results.horary?.judgment?.details) adviceParts.push(`[호라리] ${results.horary.judgment.details}`);

        insights.advice = {
            parts: adviceParts,
            synthesis: adviceParts.join('\n\n')
        };

        // Element Recommendation
        const dom = elementProfile.dominant.element;
        const weak = elementProfile.weak.element;
        insights.elementAdvice = {
            dominant: dom,
            weak: weak,
            recommendation: `${FiveElements[dom].name}이(가) 강하고 ${FiveElements[weak].name}이(가) 약합니다. ${FiveElements[weak].name}의 에너지를 보충하면 균형이 개선됩니다.`,
            practicalAdvice: this._getElementPracticalAdvice(weak)
        };

        // Timing advice
        insights.timing = this._getTimingAdvice(results);

        return insights;
    },

    _getElementPracticalAdvice(weakElement) {
        const advice = {
            wood: '초록색 계열 착용, 동쪽 방향 활동, 목재 인테리어, 식물 가꾸기를 추천합니다.',
            fire: '빨간색/보라색 착용, 남쪽 방향 활동, 양초나 조명 활용, 열정적 활동을 추천합니다.',
            earth: '노란색/갈색 착용, 중앙을 지키며, 도자기나 돌 인테리어, 안정적 루틴을 추천합니다.',
            metal: '흰색/은색 착용, 서쪽 방향 활동, 금속 액세서리, 체계적 활동을 추천합니다.',
            water: '검정색/파란색 착용, 북쪽 방향 활동, 물 관련 환경, 유연한 접근을 추천합니다.'
        };
        return advice[weakElement] || '';
    },

    _getTimingAdvice(results) {
        let timing = '현재 시점의 에너지를 분석합니다:\n\n';

        if (results.saju?.sewun) {
            timing += `올해의 세운: ${results.saju.sewun.stemName} ${results.saju.sewun.branchName} (${results.saju.sewun.animal}의 해)\n`;
        }

        if (results.qimen?.dutyDoor) {
            const door = results.qimen.dutyDoor;
            timing += `기문둔갑 당직문: ${door.name} - ${door.nature === 'auspicious' ? '행동에 유리한 시기' : '신중해야 할 시기'}\n`;
        }

        if (results.iching?.hexagram) {
            timing += `주역의 시사: ${results.iching.hexagram.keyword}의 시기\n`;
        }

        return timing;
    },

    _generateSynthesisNodes(insights, correlations, elementProfile) {
        const nodes = [];

        // Overall fortune node
        nodes.push({
            id: 'syn-fortune',
            label: '종합 운세',
            sublabel: insights.overallFortune.level,
            type: 'insight',
            system: 'synthesis',
            detail: `종합 운세: ${insights.overallFortune.level}\n점수: ${insights.overallFortune.score}/100\n\n${insights.overallFortune.detail}`,
            element: elementProfile.dominant.element
        });

        // Element balance node
        nodes.push({
            id: 'syn-elements',
            label: '오행 균형',
            sublabel: elementProfile.balance.level,
            type: 'insight',
            system: 'synthesis',
            detail: `오행 균형 분석:\n균형도: ${elementProfile.balance.level} (${elementProfile.balance.score}/100)\n\n강한 오행: ${FiveElements[elementProfile.dominant.element].name} (${elementProfile.dominant.percentage}%)\n약한 오행: ${FiveElements[elementProfile.weak.element].name} (${elementProfile.weak.percentage}%)\n\n${elementProfile.balance.description}\n\n보완 조언:\n${insights.elementAdvice.practicalAdvice}`,
            element: elementProfile.dominant.element
        });

        // Timing node
        nodes.push({
            id: 'syn-timing',
            label: '시기 분석',
            sublabel: '종합 타이밍',
            type: 'insight',
            system: 'synthesis',
            detail: insights.timing,
            element: 'earth'
        });

        return nodes;
    },

    _buildConnections(results, correlations) {
        const connections = [];

        // Add correlation-based connections
        for (const corr of correlations) {
            // Find representative nodes from each system
            const sys1Nodes = results[corr.systems[0]]?.nodes || [];
            const sys2Nodes = results[corr.systems[1]]?.nodes || [];
            if (sys1Nodes.length > 0 && sys2Nodes.length > 0) {
                connections.push({
                    from: sys1Nodes[0].id,
                    to: sys2Nodes[0].id,
                    strength: corr.strength / 100,
                    label: corr.type,
                    color1: corr.color1,
                    color2: corr.color2
                });
            }
        }

        // Connect elements across systems
        const elementNodes = {};
        for (const [key, result] of Object.entries(results)) {
            if (result?.nodes) {
                for (const node of result.nodes) {
                    if (node.element) {
                        if (!elementNodes[node.element]) elementNodes[node.element] = [];
                        elementNodes[node.element].push(node.id);
                    }
                }
            }
        }

        // Connect nodes sharing the same element (limit to avoid clutter)
        for (const [elem, nodeIds] of Object.entries(elementNodes)) {
            for (let i = 0; i < Math.min(nodeIds.length - 1, 3); i++) {
                // Only connect across different systems
                const id1 = nodeIds[i];
                const id2 = nodeIds[i + 1];
                if (id1.split('-')[0] !== id2.split('-')[0]) {
                    connections.push({
                        from: id1,
                        to: id2,
                        strength: 0.3,
                        label: FiveElements[elem]?.name || elem,
                        color1: FiveElements[elem]?.color || '#666',
                        color2: FiveElements[elem]?.color || '#666',
                        dashed: true
                    });
                }
            }
        }

        // Connect synthesis nodes to system insight nodes
        const insightNodes = [];
        for (const [key, result] of Object.entries(results)) {
            if (result?.nodes) {
                const insight = result.nodes.find(n => n.type === 'insight');
                if (insight) insightNodes.push(insight.id);
            }
        }
        for (const id of insightNodes) {
            connections.push({
                from: id,
                to: 'syn-fortune',
                strength: 0.5,
                label: '',
                color1: '#ffeaa7',
                color2: '#ffeaa7',
                dashed: true
            });
        }

        return connections;
    }
};
