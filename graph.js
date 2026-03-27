/* ==========================================
   Force-Directed Graph Engine
   Obsidian-like node visualization
   ========================================== */

class DivinationGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.dpr = window.devicePixelRatio || 1;

        // Interaction state
        this.dragNode = null;
        this.hoveredNode = null;
        this.panOffset = { x: 0, y: 0 };
        this.panStart = null;
        this.zoom = 1;
        this.isPanning = false;

        // Physics
        this.repulsionForce = 800;
        this.attractionForce = 0.005;
        this.damping = 0.85;
        this.centerGravity = 0.01;

        // Appearance
        this.systemColors = {
            babylonian: '#ff6b6b',
            horary: '#4ecdc4',
            saju: '#ffe66d',
            qimen: '#a29bfe',
            ziwei: '#fd79a8',
            iching: '#00b894',
            synthesis: '#ffeaa7'
        };

        this.nodeRadius = {
            primary: 28,
            secondary: 22,
            insight: 32
        };

        this.onNodeClick = null;
        this._resize();
        this._bindEvents();
        this._animate();
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.width = rect.width;
        this.height = rect.height;
    }

    _bindEvents() {
        window.addEventListener('resize', () => this._resize());

        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
        this.canvas.addEventListener('dblclick', (e) => this._onDblClick(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        });
        this.canvas.addEventListener('touchend', (e) => {
            this._onMouseUp({});
        });
    }

    _getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.panOffset.x) / this.zoom,
            y: (e.clientY - rect.top - this.panOffset.y) / this.zoom
        };
    }

    _findNodeAt(pos) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const r = this.nodeRadius[node.type] || 24;
            const dx = pos.x - node.x;
            const dy = pos.y - node.y;
            if (dx * dx + dy * dy < (r + 5) * (r + 5)) return node;
        }
        return null;
    }

    _onMouseDown(e) {
        const pos = this._getMousePos(e);
        const node = this._findNodeAt(pos);
        if (node) {
            this.dragNode = node;
            node.fixed = true;
        } else {
            this.isPanning = true;
            this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
        }
    }

    _onMouseMove(e) {
        const pos = this._getMousePos(e);
        this.hoveredNode = this._findNodeAt(pos);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : (this.isPanning ? 'grabbing' : 'grab');

        if (this.dragNode) {
            this.dragNode.x = pos.x;
            this.dragNode.y = pos.y;
            this.dragNode.vx = 0;
            this.dragNode.vy = 0;
        }
        if (this.isPanning && this.panStart) {
            this.panOffset.x = e.clientX - this.panStart.x;
            this.panOffset.y = e.clientY - this.panStart.y;
        }
    }

    _onMouseUp(e) {
        if (this.dragNode) {
            this.dragNode.fixed = false;
            // If barely moved, treat as click
            this.dragNode = null;
        }
        if (this.isPanning) {
            this.isPanning = false;
            this.panStart = null;
        }
    }

    _onDblClick(e) {
        const pos = this._getMousePos(e);
        const node = this._findNodeAt(pos);
        if (node && this.onNodeClick) {
            this.onNodeClick(node);
        }
    }

    _onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        this.zoom = Math.max(0.3, Math.min(3, this.zoom * delta));
    }

    setData(nodes, edges) {
        // Position nodes in system clusters
        const systems = {};
        nodes.forEach(n => {
            if (!systems[n.system]) systems[n.system] = [];
            systems[n.system].push(n);
        });

        const systemKeys = Object.keys(systems);
        const cx = this.width / 2;
        const cy = this.height / 2;
        const clusterRadius = Math.min(cx, cy) * 0.55;

        systemKeys.forEach((sys, sysIdx) => {
            const angle = (sysIdx / systemKeys.length) * Math.PI * 2 - Math.PI / 2;
            const clusterCx = cx + Math.cos(angle) * clusterRadius;
            const clusterCy = cy + Math.sin(angle) * clusterRadius;

            systems[sys].forEach((node, nodeIdx) => {
                const nodeAngle = (nodeIdx / systems[sys].length) * Math.PI * 2;
                const spread = 60 + Math.random() * 40;
                node.x = clusterCx + Math.cos(nodeAngle) * spread;
                node.y = clusterCy + Math.sin(nodeAngle) * spread;
                node.vx = 0;
                node.vy = 0;
                node.fixed = false;
            });
        });

        this.nodes = nodes;
        this.edges = edges;
    }

    _simulate() {
        const nodes = this.nodes;
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = this.repulsionForce / (dist * dist);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                if (!nodes[i].fixed) { nodes[i].vx -= fx; nodes[i].vy -= fy; }
                if (!nodes[j].fixed) { nodes[j].vx += fx; nodes[j].vy += fy; }
            }
        }

        // Attraction along edges
        for (const edge of this.edges) {
            const n1 = nodes.find(n => n.id === edge.from);
            const n2 = nodes.find(n => n.id === edge.to);
            if (!n1 || !n2) continue;
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = dist * this.attractionForce * (edge.strength || 0.5);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (!n1.fixed) { n1.vx += fx; n1.vy += fy; }
            if (!n2.fixed) { n2.vx -= fx; n2.vy -= fy; }
        }

        // Center gravity & system clustering
        for (const node of nodes) {
            if (node.fixed) continue;
            node.vx += (cx - node.x) * this.centerGravity;
            node.vy += (cy - node.y) * this.centerGravity;
            node.vx *= this.damping;
            node.vy *= this.damping;
            node.x += node.vx;
            node.y += node.vy;

            // Bounds
            node.x = Math.max(50, Math.min(this.width - 50, node.x));
            node.y = Math.max(50, Math.min(this.height - 50, node.y));
        }
    }

    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Background gradient
        const bgGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, this.width * 0.7);
        bgGrad.addColorStop(0, '#0f0f1a');
        bgGrad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Subtle grid
        ctx.strokeStyle = 'rgba(42, 42, 62, 0.3)';
        ctx.lineWidth = 0.5;
        const gridSize = 50 * this.zoom;
        const offX = this.panOffset.x % gridSize;
        const offY = this.panOffset.y % gridSize;
        for (let x = offX; x < this.width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
        }
        for (let y = offY; y < this.height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
        }

        ctx.save();
        ctx.translate(this.panOffset.x, this.panOffset.y);
        ctx.scale(this.zoom, this.zoom);

        // Draw edges
        for (const edge of this.edges) {
            const n1 = this.nodes.find(n => n.id === edge.from);
            const n2 = this.nodes.find(n => n.id === edge.to);
            if (!n1 || !n2) continue;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            if (edge.dashed) {
                ctx.setLineDash([4, 6]);
                ctx.strokeStyle = `rgba(${this._hexToRgb(edge.color1 || '#555')}, ${0.15 + edge.strength * 0.2})`;
                ctx.lineWidth = 1;
            } else {
                ctx.setLineDash([]);
                const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
                grad.addColorStop(0, `rgba(${this._hexToRgb(edge.color1 || '#fff')}, ${0.3 + edge.strength * 0.4})`);
                grad.addColorStop(1, `rgba(${this._hexToRgb(edge.color2 || '#fff')}, ${0.3 + edge.strength * 0.4})`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1 + edge.strength * 2;
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw nodes
        for (const node of this.nodes) {
            const r = this.nodeRadius[node.type] || 24;
            const color = this.systemColors[node.system] || '#fff';
            const isHovered = this.hoveredNode === node;
            const glow = isHovered ? 20 : (node.type === 'insight' ? 12 : 6);

            // Glow
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + glow, 0, Math.PI * 2);
            const glowGrad = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, r + glow);
            glowGrad.addColorStop(0, `rgba(${this._hexToRgb(color)}, ${isHovered ? 0.4 : 0.15})`);
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.fill();

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            const nodeGrad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
            nodeGrad.addColorStop(0, `rgba(${this._hexToRgb(color)}, 0.35)`);
            nodeGrad.addColorStop(1, `rgba(${this._hexToRgb(color)}, 0.12)`);
            ctx.fillStyle = nodeGrad;
            ctx.fill();

            ctx.strokeStyle = `rgba(${this._hexToRgb(color)}, ${isHovered ? 0.9 : 0.6})`;
            ctx.lineWidth = isHovered ? 2.5 : 1.5;
            ctx.stroke();

            // Insight nodes get a special ring
            if (node.type === 'insight') {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${this._hexToRgb(color)}, 0.3)`;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Label
            ctx.fillStyle = isHovered ? '#fff' : 'rgba(232, 232, 240, 0.9)';
            ctx.font = `${isHovered ? 'bold ' : ''}${node.type === 'insight' ? 11 : 10}px 'Segoe UI', system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Truncate label to fit
            const maxWidth = r * 1.6;
            let label = node.label;
            if (ctx.measureText(label).width > maxWidth) {
                while (ctx.measureText(label + '..').width > maxWidth && label.length > 2) {
                    label = label.slice(0, -1);
                }
                label += '..';
            }
            ctx.fillText(label, node.x, node.y - 4);

            // Sublabel
            if (node.sublabel) {
                ctx.fillStyle = `rgba(${this._hexToRgb(color)}, 0.7)`;
                ctx.font = `9px 'Segoe UI', system-ui, sans-serif`;
                let sub = node.sublabel;
                if (ctx.measureText(sub).width > maxWidth + 10) {
                    while (ctx.measureText(sub + '..').width > maxWidth + 10 && sub.length > 2) {
                        sub = sub.slice(0, -1);
                    }
                    sub += '..';
                }
                ctx.fillText(sub, node.x, node.y + 8);
            }
        }

        ctx.restore();

        // Hover tooltip
        if (this.hoveredNode) {
            const node = this.hoveredNode;
            const sx = node.x * this.zoom + this.panOffset.x;
            const sy = node.y * this.zoom + this.panOffset.y;
            const r = (this.nodeRadius[node.type] || 24) * this.zoom;

            ctx.fillStyle = 'rgba(18, 18, 26, 0.95)';
            ctx.strokeStyle = this.systemColors[node.system] || '#555';
            ctx.lineWidth = 1;

            const tipX = sx + r + 10;
            const tipY = sy - 20;
            const tipW = 200;
            const tipH = 50;

            this._roundRect(ctx, tipX, tipY, tipW, tipH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#e8e8f0';
            ctx.font = '12px Segoe UI, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(node.label, tipX + 10, tipY + 8);

            ctx.fillStyle = '#a0a0b8';
            ctx.font = '10px Segoe UI, sans-serif';
            ctx.fillText(node.sublabel || '', tipX + 10, tipY + 26);
            ctx.fillText('더블클릭하여 상세보기', tipX + 10, tipY + 38);
        }
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    _hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    }

    _animate() {
        this._simulate();
        this._draw();
        requestAnimationFrame(() => this._animate());
    }
}
