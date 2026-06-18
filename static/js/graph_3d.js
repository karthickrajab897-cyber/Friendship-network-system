/* ═══════════════════════════════════════════════════════════════
   Friendship Network — 3D Force Graph Visualization
   Enhanced with glowing nodes, tooltips, animated connections
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    init3DGraph();
});

async function init3DGraph() {
    const container = document.getElementById('dash-network-container');
    if (!container) return;

    // Color scheme
    const COLORS = {
        main: '#06b6d4',       // Cyan for the logged-in user
        direct: '#10b981',     // Green for direct friends
        indirect: '#8b5cf6',   // Purple for friends-of-friends
        link: '#3b82f6',
        highlight: '#f59e0b'
    };

    let gData = { nodes: [], links: [] };

    try {
        const res = await fetch('/api/network');
        gData = await res.json();

        // --- Antigravity Splash Pre-processing ---
        // Give nodes initial high Y positions so they "drop" in
        gData.nodes.forEach(node => {
            node.x = (Math.random() - 0.5) * 400;
            node.y = 600 + Math.random() * 200; // Start high above the viewport
            node.z = (Math.random() - 0.5) * 400;
        });
    } catch (err) {
        console.error('Failed to load network graph:', err);
    }

    // Initialize the 3D Force Graph
    const Graph = ForceGraph3D()(container)
        .graphData(gData)
        .backgroundColor('rgba(0,0,0,0)')
        .width(container.offsetWidth)
        .height(container.offsetHeight)
        .showNavInfo(false)

        // ─── Physics & Splash Entry ───
        .forceEngine('d3')
        .d3VelocityDecay(0.3) // Smoother fall
        .d3AlphaDecay(0.01)   // Slower stabilization for "bounce" effect

        // ─── Node Configuration ───
        .nodeRelSize(7)
        .nodeVal(node => {
            if (node.group === 'main') return 20;
            if (node.group === 'direct') return 10;
            return 6;
        })
        .nodeColor(node => {
            if (node.group === 'main') return COLORS.main;
            if (node.group === 'direct') return COLORS.direct;
            return COLORS.indirect;
        })
        .nodeOpacity(0.95)
        .nodeLabel(node => {
            const mutual = node.mutual_count || 0;
            const interests = node.interests || 'None';
            const skills = node.skills || 'None';
            const groupLabel = node.group === 'main' ? '⭐ You' : node.group === 'direct' ? '🟢 Friend' : '🟣 2nd Degree';

            return `
                <div style="
                    background: rgba(15, 23, 42, 0.92);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    border-radius: 14px;
                    padding: 14px 18px;
                    min-width: 220px;
                    font-family: 'Inter', sans-serif;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
                ">
                    <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 6px;">
                        ${node.label}
                    </div>
                    <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 8px;">${groupLabel}</div>
                    <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
                        <div style="font-size: 11px; color: #93c5fd; margin-bottom: 4px;">
                            <span style="color: #a1a1aa;">Interests:</span> ${interests}
                        </div>
                        <div style="font-size: 11px; color: #c4b5fd; margin-bottom: 4px;">
                            <span style="color: #a1a1aa;">Skills:</span> ${skills}
                        </div>
                        <div style="font-size: 11px; color: #6ee7b7;">
                            <span style="color: #a1a1aa;">Mutual Friends:</span> ${mutual}
                        </div>
                    </div>
                </div>
            `;
        })

        // ─── Link Configuration ───
        .linkColor(() => COLORS.link)
        .linkOpacity(0.25)
        .linkWidth(1.5)
        .linkDirectionalParticles(3)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleSpeed(0.004)
        .linkDirectionalParticleColor(() => COLORS.link)

        // ─── Interaction ───
        .onNodeClick(node => {
            const distance = 80;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node,
                1000
            );

            // When clicked, dynamically update the profile card using the global renderProfile!
            if (typeof renderProfile === 'function') {
                const clickData = {
                    name: node.label,
                    avatar_color: node.color || node.avatar_color,
                    interests: node.interests || 'Not Listed',
                    skills: node.skills || 'Not Listed',
                    bio: `Exploring the network interests of ${node.label}.`,
                    stats: {
                        total_friends: node.mutual_count + 1,
                        mutual_friends: node.mutual_count,
                        pending_requests: 0,
                        suggested_count: 0
                    }
                };
                renderProfile(clickData);
            }
        })

        .onNodeHover(node => {
            container.style.cursor = node ? 'pointer' : 'default';
        })

        // ─── Post-processing: Glow effect ───
        .onEngineStop(() => {
            // Hide loading indicator
            const loader = document.getElementById('graph-loading');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }
        });

    // Fallback: force hide loading spinner after 3s
    setTimeout(() => {
        const loader = document.getElementById('graph-loading');
        if (loader) loader.style.display = 'none';
    }, 3000);

    // Fallback: force hide loading spinner after 1.5s 
    // in case the physics engine doesn't fire an immediate stop event properly for static data.
    setTimeout(() => {
        const loader = document.getElementById('graph-loading');
        if (loader) loader.style.display = 'none';
    }, 1500);

    // ─── Custom Node Rendering with Three.js ───
    // Add a glowing ring around nodes
    Graph.nodeThreeObject(node => {
        const THREE = window.THREE || Graph.three();

        // Create a group to hold sphere + glow
        const group = new THREE.Group();

        // Main sphere
        const geometry = new THREE.SphereGeometry(
            node.group === 'main' ? 6 : node.group === 'direct' ? 4 : 3,
            32, 32
        );

        let color;
        if (node.group === 'main') color = COLORS.main;
        else if (node.group === 'direct') color = COLORS.direct;
        else color = COLORS.indirect;

        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            emissive: color,
            emissiveIntensity: 0.4
        });

        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);

        // Glow ring
        const ringGeometry = new THREE.RingGeometry(
            node.group === 'main' ? 8 : node.group === 'direct' ? 5.5 : 4,
            node.group === 'main' ? 9 : node.group === 'direct' ? 6 : 4.5,
            32
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        group.add(ring);

        // Text label (using sprite)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.label, 128, 42);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.85
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(24, 6, 1);
        sprite.position.y = node.group === 'main' ? 12 : 8;
        group.add(sprite);

        return group;
    });

    // ─── Controls ───

    // Fit to screen
    const fitBtn = document.getElementById('btn-fit');
    if (fitBtn) {
        fitBtn.addEventListener('click', () => {
            Graph.zoomToFit(1000, 50);
        });
    }

    // Toggle auto-rotation
    let rotation = true;
    const physicsBtn = document.getElementById('btn-physics');
    if (physicsBtn) {
        physicsBtn.addEventListener('click', () => {
            rotation = !rotation;
            if (rotation) {
                physicsBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            } else {
                physicsBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        });

        // Auto rotate
        let angle = 0;
        setInterval(() => {
            if (rotation && Graph.scene()) {
                angle += 0.002;
                Graph.cameraPosition({
                    x: 200 * Math.sin(angle),
                    z: 200 * Math.cos(angle)
                });
            }
        }, 30);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        Graph.width(container.offsetWidth);
        Graph.height(container.offsetHeight);
    });

    // Initial camera position
    setTimeout(() => {
        Graph.cameraPosition({ x: 0, y: 0, z: 250 });
    }, 500);
}
