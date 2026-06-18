/* ============================================================
   Smart Friendship Network — Chart.js Dashboard Charts
   ============================================================ */

let interestsChartInstance = null;
let growthChartInstance = null;

function renderInterestsChart(interests) {
    const ctx = document.getElementById('interestsChart');
    if (!ctx || !interests || interests.length === 0) return;

    if (interestsChartInstance) interestsChartInstance.destroy();

    const colors = [
        '#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444',
        '#ec4899', '#06b6d4', '#8b5cf6', '#22c55e', '#f97316'
    ];

    interestsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: interests.map(i => i.name),
            datasets: [{
                data: interests.map(i => i.count),
                backgroundColor: colors.slice(0, interests.length),
                borderColor: 'rgba(10, 15, 30, 0.8)',
                borderWidth: 3,
                hoverBorderColor: '#ffffff',
                hoverBorderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Outfit, sans-serif',
                            size: 13,
                            weight: 500
                        },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    titleFont: { family: 'Outfit, sans-serif', weight: 600 },
                    bodyFont: { family: 'Inter, sans-serif' },
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${context.raw} users`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

function renderGrowthChart(growthData) {
    const ctx = document.getElementById('growthChart');
    if (!ctx || !growthData || growthData.length === 0) return;

    if (growthChartInstance) growthChartInstance.destroy();

    growthChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: growthData.map(d => d.month),
            datasets: [
                {
                    label: 'Users',
                    data: growthData.map(d => d.users),
                    backgroundColor: createGradient(ctx, '#00d4ff', 0.7),
                    borderColor: '#00d4ff',
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.5,
                    categoryPercentage: 0.6
                },
                {
                    label: 'Connections',
                    data: growthData.map(d => d.connections),
                    backgroundColor: createGradient(ctx, '#7c3aed', 0.7),
                    borderColor: '#7c3aed',
                    borderWidth: 0,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.5,
                    categoryPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Inter, sans-serif', size: 12 }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Inter, sans-serif', size: 12 },
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Inter, sans-serif', size: 12 },
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    titleFont: { family: 'Inter, sans-serif', weight: 600 },
                    bodyFont: { family: 'Inter, sans-serif' }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

function createGradient(ctx, color, opacity) {
    const canvas = ctx.getContext ? ctx : ctx.canvas;
    const context = canvas.getContext ? canvas.getContext('2d') : canvas;

    try {
        const gradient = context.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, hexToRgba(color, opacity));
        gradient.addColorStop(1, hexToRgba(color, 0.1));
        return gradient;
    } catch (e) {
        return hexToRgba(color, opacity);
    }
}

function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
