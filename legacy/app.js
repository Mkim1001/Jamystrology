/* ==========================================
   Jamystrology - Main Application
   ========================================== */

(function() {
    let graph = null;
    let allResults = {};
    let synthesisResult = null;

    // ===== Form Submission =====
    document.getElementById('divination-form').addEventListener('submit', function(e) {
        e.preventDefault();
        startDivination();
    });

    function startDivination() {
        const name = document.getElementById('name').value;
        const birthDateStr = document.getElementById('birth-date').value;
        const birthTimeStr = document.getElementById('birth-time').value;
        const gender = document.getElementById('gender').value;
        const question = document.getElementById('question').value || '전반적인 운세를 알고 싶습니다.';

        if (!birthDateStr) return;

        const birthDate = new Date(birthDateStr);
        const [birthHourStr] = birthTimeStr.split(':');
        const birthHour = parseInt(birthHourStr);
        const currentDate = new Date();

        // Show loading
        showLoading();

        // Run all engines
        setTimeout(() => {
            try {
                allResults = {
                    babylonian: BabylonianEngine.calculate(birthDate, birthHour, currentDate),
                    horary: HoraryEngine.calculate(currentDate, currentDate.getHours(), question),
                    saju: SajuEngine.calculate(birthDate, birthHour, gender),
                    qimen: QiMenEngine.calculate(birthDate, birthHour, currentDate),
                    ziwei: ZiWeiEngine.calculate(birthDate, birthHour, gender),
                    iching: IChingEngine.calculate(birthDate, birthHour, currentDate, question)
                };

                synthesisResult = SynthesisEngine.synthesize(allResults);

                // Update UI
                document.getElementById('user-info').textContent = `${name} | ${birthDateStr} ${birthTimeStr}`;

                // Initialize graph
                initGraph();

                // Build dashboard
                buildDashboard();

                // Build synthesis view
                buildSynthesis();

                // Show app
                hideLoading();
                document.getElementById('input-overlay').classList.remove('active');
                document.getElementById('app').classList.remove('hidden');
            } catch (err) {
                console.error('Divination error:', err);
                hideLoading();
                alert('점술 계산 중 오류가 발생했습니다: ' + err.message);
            }
        }, 100);
    }

    // ===== Loading =====
    function showLoading() {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.id = 'loading';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">천체의 움직임을 계산하고 있습니다...</div>
        `;
        document.body.appendChild(loader);
    }

    function hideLoading() {
        const loader = document.getElementById('loading');
        if (loader) loader.remove();
    }

    // ===== Graph Initialization =====
    function initGraph() {
        const canvas = document.getElementById('graph-canvas');
        graph = new DivinationGraph(canvas);

        // Collect all nodes
        let allNodes = [];
        let allEdges = [];

        for (const [key, result] of Object.entries(allResults)) {
            if (result.nodes) {
                allNodes = allNodes.concat(result.nodes);
            }
        }

        // Add synthesis nodes
        if (synthesisResult.nodes) {
            allNodes = allNodes.concat(synthesisResult.nodes);
        }

        // Add edges from synthesis connections
        if (synthesisResult.connections) {
            allEdges = synthesisResult.connections;
        }

        // Add internal system edges
        for (const [key, result] of Object.entries(allResults)) {
            if (result.nodes && result.nodes.length > 1) {
                for (let i = 0; i < result.nodes.length - 1; i++) {
                    allEdges.push({
                        from: result.nodes[i].id,
                        to: result.nodes[i + 1].id,
                        strength: 0.6,
                        color1: result.color || '#555',
                        color2: result.color || '#555'
                    });
                }
            }
        }

        graph.setData(allNodes, allEdges);
        graph.onNodeClick = showNodeDetail;
    }

    // ===== Node Detail Panel =====
    function showNodeDetail(node) {
        const panel = document.getElementById('node-detail');
        const content = document.getElementById('detail-content');
        const color = graph.systemColors[node.system] || '#fff';

        // Find connected nodes
        const connected = [];
        for (const edge of graph.edges) {
            let other = null;
            if (edge.from === node.id) other = graph.nodes.find(n => n.id === edge.to);
            if (edge.to === node.id) other = graph.nodes.find(n => n.id === edge.from);
            if (other) {
                connected.push({
                    node: other,
                    edge,
                    color: graph.systemColors[other.system] || '#555'
                });
            }
        }

        const systemLabels = {
            babylonian: '바빌로니아 점성술',
            horary: '호라리 점성술',
            saju: '사주팔자',
            qimen: '기문둔갑',
            ziwei: '자미두수',
            iching: '주역',
            synthesis: '통합 분석'
        };

        content.innerHTML = `
            <div class="detail-header">
                <h2 style="color:${color}">${node.label}</h2>
                <div class="system-tag" style="background:rgba(${hexToRgb(color)},0.15);color:${color}">
                    ${systemLabels[node.system] || node.system}
                </div>
                ${node.sublabel ? `<p style="color:var(--text-secondary);margin-top:8px">${node.sublabel}</p>` : ''}
            </div>
            <div class="detail-section">
                <h3>상세 정보</h3>
                <p style="white-space:pre-line">${node.detail || '상세 정보 없음'}</p>
            </div>
            ${connected.length > 0 ? `
            <div class="detail-section">
                <h3>연결된 노드 (${connected.length})</h3>
                <div class="connection-list">
                    ${connected.map(c => `
                        <div class="connection-item" onclick="window._graphClickNode('${c.node.id}')">
                            <span class="connection-dot" style="background:${c.color}"></span>
                            <span class="connection-label">${c.node.label}</span>
                            <span class="connection-strength">${c.edge.label || ''} ${Math.round((c.edge.strength || 0.5) * 100)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        panel.classList.remove('hidden');
        panel.classList.add('visible');
    }

    // Global click handler for connection navigation
    window._graphClickNode = function(nodeId) {
        const node = graph.nodes.find(n => n.id === nodeId);
        if (node) showNodeDetail(node);
    };

    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('node-detail').classList.remove('visible');
        setTimeout(() => document.getElementById('node-detail').classList.add('hidden'), 300);
    });

    // ===== Dashboard =====
    function buildDashboard() {
        const grid = document.getElementById('dashboard-grid');
        grid.innerHTML = '';

        // Babylonian Card
        const bab = allResults.babylonian;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #ff6b6b">
            <h2><span class="card-icon">𒀭</span> 바빌로니아 점성술</h2>
            <p class="card-subtitle">Babylonian Omen Astrology</p>
            <div class="dash-item"><span class="dash-label">탄생 별자리</span><span class="dash-value">${bab.birthSign.name}</span></div>
            <div class="dash-item"><span class="dash-label">수호 행성</span><span class="dash-value">${bab.rulingPlanet.symbol} ${bab.rulingPlanet.name.split('(')[0]}</span></div>
            <div class="dash-item"><span class="dash-label">현재 운행</span><span class="dash-value">${bab.transitSign.babylonian}</span></div>
            <div class="dash-item"><span class="dash-label">징조 유형</span><span class="dash-value">${bab.specificOmen}</span></div>
            <div class="dash-item"><span class="dash-label">길흉</span><span class="dash-value">${bab.interpretation.favorability}</span></div>
            <p style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.6">${bab.interpretation.message}</p>
        </div>`;

        // Horary Card
        const hor = allResults.horary;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #4ecdc4">
            <h2><span class="card-icon">☿</span> 호라리 점성술</h2>
            <p class="card-subtitle">Horary Astrology</p>
            <div class="dash-item"><span class="dash-label">상승궁</span><span class="dash-value">${hor.ascendant.symbol} ${hor.ascendant.name}</span></div>
            <div class="dash-item"><span class="dash-label">달 상태</span><span class="dash-value">${hor.moonData.phase}</span></div>
            <div class="dash-item"><span class="dash-label">달 별자리</span><span class="dash-value">${hor.moonData.sign.name}</span></div>
            <div class="dash-item"><span class="dash-label">질문 분류</span><span class="dash-value">${hor.questionAnalysis.category}</span></div>
            <div class="dash-item"><span class="dash-label">판단</span><span class="dash-value">${hor.judgment.answer}</span></div>
            <div class="dash-item"><span class="dash-label">점수</span><span class="dash-value">${hor.judgment.score}/100</span></div>
            <p style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.6">${hor.judgment.details}</p>
        </div>`;

        // Saju Card
        const sj = allResults.saju;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #ffe66d">
            <h2><span class="card-icon">四</span> 사주팔자</h2>
            <p class="card-subtitle">Four Pillars of Destiny</p>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0;text-align:center">
                ${['year', 'month', 'day', 'hour'].map(k => {
                    const p = sj.pillars[k];
                    const label = {year:'년주',month:'월주',day:'일주',hour:'시주'}[k];
                    return `<div style="background:var(--bg-tertiary);padding:8px;border-radius:6px">
                        <div style="font-size:10px;color:var(--text-muted)">${label}</div>
                        <div style="font-size:16px;margin:4px 0;color:${HeavenlyStems.colors[p.stem]}">${HeavenlyStems.hanja[p.stem]}</div>
                        <div style="font-size:16px">${EarthlyBranches.hanja[p.branch]}</div>
                        <div style="font-size:9px;color:var(--text-muted)">${EarthlyBranches.animals[p.branch]}</div>
                    </div>`;
                }).join('')}
            </div>
            <div class="dash-item"><span class="dash-label">일간</span><span class="dash-value">${sj.dayMasterName} (${FiveElements[sj.dayMasterElement].name})</span></div>
            <div class="dash-item"><span class="dash-label">신강/신약</span><span class="dash-value">${sj.dayMasterStrength.level}</span></div>
            <div class="dash-item"><span class="dash-label">용신</span><span class="dash-value">${sj.favorableElements.favorable.map(e => FiveElements[e].name).join(', ')}</span></div>
            <p style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.6">${sj.interpretation.personality}</p>
        </div>`;

        // QiMen Card
        const qi = allResults.qimen;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #a29bfe">
            <h2><span class="card-icon">奇</span> 기문둔갑</h2>
            <p class="card-subtitle">Qi Men Dun Jia</p>
            <div class="qimen-grid">
                ${qi.grid.map((cell, idx) => `
                    <div class="qimen-cell ${idx === 4 ? 'center-cell' : ''}">
                        <div class="qimen-direction">${cell.palace.direction}</div>
                        <div class="qimen-door">${cell.door.name.split('(')[0]}</div>
                        <div class="qimen-star">${cell.star.name.split('(')[0]}</div>
                        <div class="qimen-deity">${cell.deity.name.split('(')[0]}</div>
                    </div>
                `).join('')}
            </div>
            <div class="dash-item" style="margin-top:12px"><span class="dash-label">당직문</span><span class="dash-value">${qi.dutyDoor.name}</span></div>
            <div class="dash-item"><span class="dash-label">당직성</span><span class="dash-value">${qi.dutyStar.name}</span></div>
            ${qi.favorableDirections.length > 0 ? `<div class="dash-item"><span class="dash-label">길방위</span><span class="dash-value">${qi.favorableDirections[0].direction}</span></div>` : ''}
        </div>`;

        // ZiWei Card
        const zw = allResults.ziwei;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #fd79a8">
            <h2><span class="card-icon">紫</span> 자미두수</h2>
            <p class="card-subtitle">Purple Star Astrology</p>
            <div class="palace-grid">
                ${zw.chart.map(cell => `
                    <div class="palace-cell ${cell.isMingGong ? 'highlight' : ''}">
                        <div class="palace-name">${cell.palace.name.split('(')[0]}${cell.isMingGong ? ' ★' : ''}</div>
                        <div class="palace-stars">${cell.majorStars.map(s => s.name.split('(')[0]).join(' ') || '-'}</div>
                        ${cell.luckyStars.length > 0 ? `<div style="color:#00b894;font-size:9px">${cell.luckyStars[0]}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="dash-item" style="margin-top:12px"><span class="dash-label">명궁 주성</span><span class="dash-value">${zw.analysis.mingStars}</span></div>
            <p style="margin-top:8px;font-size:13px;color:var(--text-secondary);line-height:1.6">${zw.analysis.personality}</p>
        </div>`;

        // IChing Card
        const ic = allResults.iching;
        grid.innerHTML += `
        <div class="dash-card" style="border-top:3px solid #00b894">
            <h2><span class="card-icon">☰</span> 주역</h2>
            <p class="card-subtitle">I Ching Divination</p>
            <div class="hexagram-display">
                <div>${ic.upperTrigram.symbol}</div>
                <div>${ic.lowerTrigram.symbol}</div>
            </div>
            <div class="hexagram-name">${ic.hexagram.name}</div>
            <div class="hexagram-meaning">${ic.hexagram.meaning}</div>
            <div class="dash-item" style="margin-top:12px"><span class="dash-label">운세</span><span class="dash-value">${ic.hexagram.fortune}</span></div>
            <div class="dash-item"><span class="dash-label">핵심</span><span class="dash-value">${ic.hexagram.keyword}</span></div>
            <div class="dash-item"><span class="dash-label">변효</span><span class="dash-value">${ic.changingLine}효</span></div>
            ${ic.changingHexagram ? `<div class="dash-item"><span class="dash-label">변괘</span><span class="dash-value">${ic.changingHexagram.name}</span></div>` : ''}
            <p style="margin-top:12px;font-size:13px;color:var(--text-secondary);line-height:1.6">${ic.interpretation.advice}</p>
        </div>`;
    }

    // ===== Synthesis View =====
    function buildSynthesis() {
        const content = document.getElementById('synthesis-content');
        const syn = synthesisResult;
        const ins = syn.insights;

        const elemBars = Object.entries(syn.elementProfile.normalized).map(([elem, pct]) => {
            const color = FiveElements[elem].color;
            return `<div class="correlation-bar">
                <span class="corr-label">${FiveElements[elem].name}</span>
                <div class="corr-track"><div class="corr-fill" style="width:${pct}%;background:${color}"></div></div>
                <span class="corr-value">${pct}%</span>
            </div>`;
        }).join('');

        const corrBars = syn.correlations.map(corr => {
            return `<div class="correlation-bar">
                <span class="corr-label">${corr.systemNames.join(' ↔ ')}</span>
                <div class="corr-track"><div class="corr-fill" style="width:${corr.strength}%;background:linear-gradient(90deg,${corr.color1},${corr.color2})"></div></div>
                <span class="corr-value">${corr.strength}%</span>
            </div>`;
        }).join('');

        content.innerHTML = `
        <div class="synthesis-header">
            <h1>✦ 통합 분석 리포트</h1>
            <p>6개 점술 시스템의 교차 분석 결과</p>
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">⟡</span> 종합 운세</h2>
            <div style="text-align:center;margin:20px 0">
                <div style="font-size:48px;color:${ins.overallFortune.score >= 55 ? 'var(--accent-gold)' : 'var(--accent-red)'}">${ins.overallFortune.score}</div>
                <div style="font-size:18px;color:var(--text-secondary);margin-top:4px">${ins.overallFortune.level}</div>
            </div>
            <p class="synthesis-text">${ins.overallFortune.detail}</p>
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">☯</span> 오행 프로필</h2>
            ${elemBars}
            <div style="margin-top:16px;padding:12px;background:var(--bg-tertiary);border-radius:8px">
                <p class="synthesis-text">
                    <strong>균형도:</strong> ${syn.elementProfile.balance.level} (${syn.elementProfile.balance.score}/100)<br>
                    <strong>강한 오행:</strong> ${FiveElements[syn.elementProfile.dominant.element].name} (${syn.elementProfile.dominant.percentage}%)<br>
                    <strong>약한 오행:</strong> ${FiveElements[syn.elementProfile.weak.element].name} (${syn.elementProfile.weak.percentage}%)<br><br>
                    ${syn.elementProfile.balance.description}
                </p>
            </div>
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">🔗</span> 시스템 간 상관관계</h2>
            ${corrBars}
            <div style="margin-top:16px">
                ${syn.correlations.map(c => `
                    <div style="padding:10px;margin-bottom:8px;background:var(--bg-tertiary);border-radius:8px;border-left:3px solid ${c.color1}">
                        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">${c.systemNames.join(' ↔ ')} | ${c.type}</div>
                        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">${c.detail}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">👤</span> 성격 종합 분석</h2>
            ${ins.personality.parts.map(p => `
                <div style="padding:10px;margin-bottom:8px;background:var(--bg-tertiary);border-radius:8px">
                    <p class="synthesis-text">${p}</p>
                </div>
            `).join('')}
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">💡</span> 종합 조언</h2>
            ${ins.advice.parts.map(p => `
                <div style="padding:10px;margin-bottom:8px;background:var(--bg-tertiary);border-radius:8px">
                    <p class="synthesis-text">${p}</p>
                </div>
            `).join('')}
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">🎯</span> 오행 보완 실천 조언</h2>
            <p class="synthesis-text">${ins.elementAdvice.recommendation}</p>
            <div style="margin-top:12px;padding:14px;background:var(--bg-tertiary);border-radius:8px;border-left:3px solid ${FiveElements[ins.elementAdvice.weak].color}">
                <p class="synthesis-text"><strong>${FiveElements[ins.elementAdvice.weak].name} 보충법:</strong><br>${ins.elementAdvice.practicalAdvice}</p>
            </div>
        </div>

        <div class="synthesis-section">
            <h2><span class="sec-icon">⏱</span> 시기 분석</h2>
            <p class="synthesis-text" style="white-space:pre-line">${ins.timing}</p>
        </div>
        `;
    }

    // ===== View Switching =====
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${view}`).classList.add('active');

            if (view === 'graph' && graph) {
                graph._resize();
            }
        });
    });

    // ===== New Divination =====
    document.getElementById('btn-new').addEventListener('click', () => {
        document.getElementById('app').classList.add('hidden');
        document.getElementById('input-overlay').classList.add('active');
        document.getElementById('node-detail').classList.remove('visible');
        document.getElementById('node-detail').classList.add('hidden');
    });

    // ===== Utility =====
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }
})();
