/* ============================================================
   Smart Friendship Network — vis.js Network Graph
   ============================================================ */

let network = null;
let networkData = null;

async function loadNetworkGraph() {
    try {
        const res = await fetch(`${API}/api/graph/network`);
        networkData = await res.json();
        renderGraph(networkData);
    } catch (err) {
        console.error('Failed to load network graph:', err);
    }
}

function renderGraph(data) {
    const container = document.getElementById('networkGraph');
    if (!container) return;

    // Prepare nodes with custom styling
    const nodes = new vis.DataSet(data.nodes.map(n => ({
        id: n.id,
        label: n.label,
        title: buildTooltip(n),
        color: {
            background: n.color || '#00d4ff',
            border: n.color || '#00d4ff',
            highlight: {
                background: lightenColor(n.color || '#00d4ff', 20),
                border: '#ffffff'
            },
            hover: {
                background: lightenColor(n.color || '#00d4ff', 10),
                border: lightenColor(n.color || '#00d4ff', 30)
            }
        },
        font: {
            color: '#f1f5f9',
            size: 14,
            face: 'Outfit, sans-serif',
            strokeWidth: 3,
            strokeColor: '#050810'
        },
        shape: 'dot',
        size: 22,
        borderWidth: 2,
        borderWidthSelected: 3,
        shadow: {
            enabled: true,
            color: (n.color || '#00d4ff') + '44',
            size: 12,
            x: 0,
            y: 0
        }
    })));

    // Prepare edges
    const edges = new vis.DataSet(data.edges.map((e, i) => ({
        id: i,
        from: e.from,
        to: e.to,
        color: {
            color: 'rgba(255, 255, 255, 0.12)',
            highlight: '#00d4ff',
            hover: 'rgba(0, 212, 255, 0.3)'
        },
        width: 1.5,
        smooth: {
            type: 'continuous',
            roundness: 0.3
        },
        hoverWidth: 2.5,
        selectionWidth: 3
    })));

    const options = {
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -80,
                centralGravity: 0.012,
                springLength: 160,
                springConstant: 0.06,
                damping: 0.4,
                avoidOverlap: 0.5
            },
            stabilization: {
                enabled: true,
                iterations: 200,
                updateInterval: 25
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
            navigationButtons: false,
            keyboard: true
        },
        nodes: {
            chosen: true
        },
        edges: {
            chosen: true
        },
        layout: {
            improvedLayout: true
        }
    };

    network = new vis.Network(container, { nodes, edges }, options);

    // Click event — highlight mutual friends
    network.on('click', function (params) {
        if (params.nodes.length === 1) {
            const nodeId = params.nodes[0];
            highlightConnections(nodeId, nodes, edges, data);
        } else {
            // Reset all
            resetHighlight(nodes, edges, data);
        }
    });

    // Double-click — view profile
    network.on('doubleClick', function (params) {
        if (params.nodes.length === 1) {
            viewUserProfile(params.nodes[0]);
        }
    });
}

function buildTooltip(node) {
    let html = `<div style="background: hsla(222, 47%, 10%, 0.9); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-width: 200px; font-family: Inter, sans-serif;">`;
    html += `<div style="font-family: Outfit, sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #f1f5f9; letter-spacing: -0.5px;">${node.label}</div>`;
    if (node.location) html += `<div style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;"><i class="bi bi-geo-alt"></i> ${node.location}</div>`;
    if (node.interests) {
        html += `<div style="font-size: 11px; color: #00d4ff; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Interests</div>`;
        html += `<div style="font-size: 12px; color: #f1f5f9; opacity: 0.8;">${node.interests}</div>`;
    }
    if (node.skills) {
        html += `<div style="font-size: 11px; color: #a78bfa; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Skills</div>`;
        html += `<div style="font-size: 12px; color: #f1f5f9; opacity: 0.8;">${node.skills}</div>`;
    }
    html += `</div>`;
    return html;
}

function highlightConnections(nodeId, nodesDS, edgesDS, data) {
    const connectedEdges = data.edges.filter(e => e.from === nodeId || e.to === nodeId);
    const connectedNodeIds = new Set();
    connectedNodeIds.add(nodeId);
    connectedEdges.forEach(e => {
        connectedNodeIds.add(e.from);
        connectedNodeIds.add(e.to);
    });

    // Dim non-connected nodes
    const nodeUpdates = data.nodes.map(n => {
        if (connectedNodeIds.has(n.id)) {
            return {
                id: n.id,
                opacity: 1,
                font: { color: '#f1f5f9', strokeWidth: 3, strokeColor: '#050810' },
                size: n.id === nodeId ? 28 : 22
            };
        } else {
            return {
                id: n.id,
                opacity: 0.15,
                font: { color: 'rgba(241, 245, 249, 0.15)', strokeWidth: 0 },
                size: 16
            };
        }
    });
    nodesDS.update(nodeUpdates);

    // Highlight connected edges
    const edgeUpdates = data.edges.map((e, i) => {
        if (e.from === nodeId || e.to === nodeId) {
            return {
                id: i,
                color: { color: '#00d4ff', opacity: 1 },
                width: 3
            };
        } else {
            return {
                id: i,
                color: { color: 'rgba(255, 255, 255, 0.03)', opacity: 0.1 },
                width: 0.5
            };
        }
    });
    edgesDS.update(edgeUpdates);
}

function resetHighlight(nodesDS, edgesDS, data) {
    const nodeUpdates = data.nodes.map(n => ({
        id: n.id,
        opacity: 1,
        font: { color: '#f1f5f9', size: 14, face: 'Outfit, sans-serif', strokeWidth: 3, strokeColor: '#050810' },
        size: 22
    }));
    nodesDS.update(nodeUpdates);

    const edgeUpdates = data.edges.map((e, i) => ({
        id: i,
        color: { color: 'rgba(255, 255, 255, 0.12)' },
        width: 1.5
    }));
    edgesDS.update(edgeUpdates);
}

function highlightPath(pathIds) {
    if (!network || !networkData) return;

    const nodesDS = network.body.data.nodes;
    const edgesDS = network.body.data.edges;
    const pathSet = new Set(pathIds);

    // Highlight path nodes
    const nodeUpdates = networkData.nodes.map(n => {
        if (pathSet.has(n.id)) {
            return {
                id: n.id,
                opacity: 1,
                size: 28,
                borderWidth: 4,
                color: {
                    border: '#10b981',
                    background: n.color || '#00d4ff'
                }
            };
        } else {
            return {
                id: n.id,
                opacity: 0.15,
                size: 16,
                borderWidth: 2
            };
        }
    });
    nodesDS.update(nodeUpdates);

    // Highlight path edges
    const edgeUpdates = networkData.edges.map((e, i) => {
        const fromIdx = pathIds.indexOf(e.from);
        const toIdx = pathIds.indexOf(e.to);
        const isPathEdge = fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1;

        if (isPathEdge) {
            return {
                id: i,
                color: { color: '#10b981' },
                width: 4,
                dashes: false
            };
        } else {
            return {
                id: i,
                color: { color: 'rgba(255, 255, 255, 0.03)' },
                width: 0.5
            };
        }
    });
    edgesDS.update(edgeUpdates);

    // Focus on path
    network.fit({
        nodes: pathIds,
        animation: { duration: 1000, easingFunction: 'easeInOutCubic' }
    });

    // Auto-reset after 5 seconds
    setTimeout(() => {
        resetHighlight(nodesDS, edgesDS, networkData);
    }, 5000);
}

// ──────────────── Color Utilities ────────────────
function lightenColor(hex, percent) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
