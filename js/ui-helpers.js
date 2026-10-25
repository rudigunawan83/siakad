/**
 * SIAKAD — Shared UI Helpers
 */
import { AppState } from './state.js';

/** Render halaman "Segera Hadir" */
export function renderComingSoon(title, module, path) {
  const dash = AppState.currentRole?.dashboardRoute || '#/dashboard';
  return `<div class="page-container">
  <div class="not-found-page">
    <div style="font-size:3.5rem;color:var(--color-gold-500);margin-bottom:0.5rem"><i class="bi bi-tools"></i></div>
    <h1 class="not-found-title" style="font-size:1.5rem">${title}</h1>
    <p class="not-found-desc">Halaman ini sedang dalam pengembangan.<br>
      Modul: <strong>${module}</strong><br>
      <span style="font-size:0.8rem;color:var(--color-muted)">Path: <code>${path}</code></span>
    </p>
    <div class="info-box info-box-warning" style="max-width:400px;margin:1rem auto;text-align:left">
      <i class="bi bi-lightning-fill"></i> Prototype Demo &mdash; Fitur ini akan tersedia di iterasi berikutnya.
    </div>
    <a href="${dash}" class="btn btn-secondary mt-2"><i class="bi bi-house"></i> Kembali ke Dashboard</a>
  </div>
</div>`;
}
