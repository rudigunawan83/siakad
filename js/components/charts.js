/**
 * SIAKAD Cakrawala — Chart.js Wrappers
 */

const PALETTE = {
  navy:    '#213550', navyLight: '#3a5f8a',
  gold:    '#d1a84b', goldLight: '#e0be72',
  success: '#198754', danger: '#dc3545',
  warning: '#d97706', info: '#0d6efd',
  muted:   '#9ca3af',
};

const MULTI = ['#213550','#d1a84b','#0d6efd','#198754','#d97706','#6f42c1','#20c997','#fd7e14'];

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: "'Inter','Segoe UI',sans-serif", size: 11 }, color: '#6b7280', boxWidth: 10, padding: 12 } },
    tooltip: { bodyFont: { family: "'Inter','Segoe UI',sans-serif" }, titleFont: { family: "'Inter','Segoe UI',sans-serif" } },
  },
  scales: {
    x: { grid: { color: '#e3e8ef' }, ticks: { color: '#6b7280', font: { family: "'Inter','Segoe UI',sans-serif", size: 11 } } },
    y: { grid: { color: '#e3e8ef' }, ticks: { color: '#6b7280', font: { family: "'Inter','Segoe UI',sans-serif", size: 11 } } },
  },
};

function ensureCanvas(canvasId, height = 260) {
  const el = document.getElementById(canvasId);
  if (!el) return null;
  if (el.tagName !== 'CANVAS') {
    el.innerHTML = `<canvas id="${canvasId}-canvas" style="height:${height}px"></canvas>`;
    return el.querySelector('canvas');
  }
  el.style.height = height + 'px';
  if (el._chart) { el._chart.destroy(); el._chart = null; }
  return el;
}

export function createBarChart(canvasId, { labels, datasets, title, height = 260, stacked = false, horizontal = false, formatY = null }) {
  const canvas = ensureCanvas(canvasId, height);
  if (!canvas) return;
  const type = horizontal ? 'bar' : 'bar';
  const ds = datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    backgroundColor: d.color || MULTI[i % MULTI.length] + 'cc',
    borderColor: d.color || MULTI[i % MULTI.length],
    borderWidth: 1, borderRadius: 4,
  }));
  const ch = new Chart(canvas, {
    type, data: { labels, datasets: ds },
    options: {
      ...BASE_OPTIONS,
      indexAxis: horizontal ? 'y' : 'x',
      plugins: { ...BASE_OPTIONS.plugins, legend: { ...BASE_OPTIONS.plugins.legend, display: ds.length > 1 }, title: title ? { display: true, text: title, color: '#202938', font: { size: 13, weight: 600, family: "'Inter','Segoe UI',sans-serif" } } : { display: false } },
      scales: {
        x: { ...BASE_OPTIONS.scales.x, stacked },
        y: { ...BASE_OPTIONS.scales.y, stacked, ticks: { ...BASE_OPTIONS.scales.y.ticks, callback: formatY ? (v) => formatY(v) : undefined } },
      },
    },
  });
  canvas._chart = ch;
  return ch;
}

export function createLineChart(canvasId, { labels, datasets, height = 260, formatY = null, fill = false }) {
  const canvas = ensureCanvas(canvasId, height);
  if (!canvas) return;
  const ds = datasets.map((d, i) => ({
    label: d.label, data: d.data,
    borderColor: d.color || MULTI[i % MULTI.length],
    backgroundColor: fill ? (d.color || MULTI[i % MULTI.length]) + '22' : 'transparent',
    fill, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
    borderWidth: 2,
  }));
  const ch = new Chart(canvas, {
    type: 'line', data: { labels, datasets: ds },
    options: {
      ...BASE_OPTIONS,
      plugins: { ...BASE_OPTIONS.plugins, legend: { ...BASE_OPTIONS.plugins.legend, display: ds.length > 1 } },
      scales: {
        x: BASE_OPTIONS.scales.x,
        y: { ...BASE_OPTIONS.scales.y, ticks: { ...BASE_OPTIONS.scales.y.ticks, callback: formatY ? v => formatY(v) : undefined } },
      },
    },
  });
  canvas._chart = ch;
  return ch;
}

export function createDoughnutChart(canvasId, { labels, data, colors, height = 220, legend = 'bottom', cutout = '65%' }) {
  const canvas = ensureCanvas(canvasId, height);
  if (!canvas) return;
  const ch = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors || MULTI, borderWidth: 2, borderColor: '#fff', hoverBorderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout,
      plugins: {
        legend: { position: legend, labels: { ...BASE_OPTIONS.plugins.legend.labels, usePointStyle: true } },
        tooltip: BASE_OPTIONS.plugins.tooltip,
      },
    },
  });
  canvas._chart = ch;
  return ch;
}

export function createPieChart(canvasId, { labels, data, colors, height = 220 }) {
  return createDoughnutChart(canvasId, { labels, data, colors, height, cutout: '0%' });
}

export function formatRupiahShort(v) {
  if (v >= 1e9) return 'Rp ' + (v / 1e9).toFixed(1) + 'M';
  if (v >= 1e6) return 'Rp ' + (v / 1e6).toFixed(1) + 'Jt';
  if (v >= 1e3) return 'Rp ' + (v / 1e3).toFixed(0) + 'rb';
  return 'Rp ' + v;
}
