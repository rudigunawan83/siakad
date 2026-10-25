/**
 * SIAKAD Cakrawala — Application Entry Point
 */

import { initSeed, DB } from './data/seed.js';
import { AppState } from './state.js';
import { Router } from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { showToast } from './components/toast.js';

// Pages
import { renderDashboard } from './pages/dashboard-foundation.js';
import { renderStudents } from './pages/students.js';
import { renderAdmissions } from './pages/admissions.js';
import { renderFinance } from './pages/finance.js';
import {
  renderOrganization, renderAcademic, renderLecturers,
  renderLearning, renderThesis,
} from './pages/academic.js';
import {
  renderHR, renderBudget, renderAssets, renderPDDIKTI,
  renderReports, renderSettings, renderAuditLog,
} from './pages/modules.js';
import {
  renderStudentPortal, renderParentPortal,
} from './pages/portals.js';
import { renderLecturerPortal } from './pages/lecturer-portal.js';
import { renderPmbPublic } from './pages/pmb-public.js';

// ---- Boot ----
async function boot() {
  // 1. Initialize demo data
  initSeed();

  // 2. Init app state (role, sidebar, etc.)
  AppState.init();

  // 3. Render shell layout
  renderSidebar();
  renderTopbar();

  // 4. Register routes
  Router.register('/dashboard', renderDashboard);
  Router.register('/organization', renderOrganization);
  Router.register('/admissions', renderAdmissions);
  Router.register('/students', renderStudents);
  Router.register('/lecturers', renderLecturers);
  Router.register('/academic', renderAcademic);
  Router.register('/learning', renderLearning);
  Router.register('/thesis', renderThesis);
  Router.register('/finance', renderFinance);
  Router.register('/budget', renderBudget);
  Router.register('/hr', renderHR);
  Router.register('/assets', renderAssets);
  Router.register('/procurement', (path, container) => renderAssets('/assets/procurement', container));
  Router.register('/pddikti', renderPDDIKTI);
  Router.register('/reports', renderReports);
  Router.register('/settings', renderSettings);
  Router.register('/audit-logs', renderAuditLog);
  Router.register('/portal/student', renderStudentPortal);
  Router.register('/portal/lecturer', renderLecturerPortal);
  Router.register('/portal/parent', renderParentPortal);
  Router.register('/pmb', renderPmbPublic);

  // 5. Default route
  if (!location.hash || location.hash === '#') {
    location.hash = AppState.currentRole.dashboardRoute.replace('#', '');
  }

  // 6. Start router
  Router.init();

  // 7. Mobile sidebar overlay click
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').style.display = 'none';
  });

  // 8. Make helpers globally accessible for inline onclick handlers
  window.showToast = showToast;

  // 9. Log boot
  console.info('[SIAKAD Cakrawala] Aplikasi berhasil dimuat. Mode: Demo Prototype.');
}

// Boot when DOM is ready
document.addEventListener('DOMContentLoaded', boot);
