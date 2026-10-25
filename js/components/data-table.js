/**
 * SIAKAD Cakrawala — Reusable Data Table Component
 * Renders table with sort, filter, search, pagination, and actions
 */

import { searchFilter, applyFilters, sortItems, paginate, buildPaginationHTML, formatNumber } from '../utils.js';

export class DataTable {
  constructor(config) {
    this.containerId = config.containerId;
    this.columns = config.columns || [];
    this.data = config.data || [];
    this.filteredData = [...this.data];
    this.sortKey = config.defaultSort || null;
    this.sortDir = 'asc';
    this.page = 1;
    this.perPage = config.perPage || 10;
    this.searchFields = config.searchFields || [];
    this.filters = {};
    this.onRowAction = config.onRowAction || null;
    this.emptyMessage = config.emptyMessage || 'Tidak ada data ditemukan.';
    this.toolbar = config.toolbar; // HTML string for toolbar area

    this._render();
    this._bindEvents();
  }

  setData(data) {
    this.data = data;
    this.page = 1;
    this._applyAll();
  }

  _applyAll() {
    let d = [...this.data];
    d = searchFilter(d, this._searchQuery, this.searchFields);
    d = applyFilters(d, this.filters);
    d = sortItems(d, this.sortKey, this.sortDir);
    this.filteredData = d;
    this._renderTable();
  }

  _render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="table-wrapper">
        ${this.toolbar ? `<div class="table-toolbar">${this.toolbar}</div>` : ''}
        <div class="table-overflow">
          <table class="data-table" id="${this.containerId}-table">
            <thead>
              <tr>${this.columns.map(c => `
                <th class="${c.sortable !== false ? 'sortable' : ''}" data-key="${c.key || ''}">
                  ${c.label} ${c.sortable !== false ? '<i class="bi bi-chevron-expand sort-icon"></i>' : ''}
                </th>`).join('')}
              </tr>
            </thead>
            <tbody id="${this.containerId}-body"></tbody>
          </table>
        </div>
        <div class="pagination-wrapper" id="${this.containerId}-pag"></div>
      </div>
    `;

    this._applyAll();
  }

  _renderTable() {
    const body = document.getElementById(`${this.containerId}-body`);
    const pagDiv = document.getElementById(`${this.containerId}-pag`);
    if (!body || !pagDiv) return;

    const pag = paginate(this.filteredData, this.page, this.perPage);
    this.page = pag.page;

    if (!pag.items.length) {
      body.innerHTML = `
        <tr><td colspan="${this.columns.length}" style="text-align:center;padding:3rem;color:var(--color-muted)">
          <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem"></i>
          ${this.emptyMessage}
        </td></tr>`;
    } else {
      body.innerHTML = pag.items.map(row => `
        <tr data-id="${row.id || ''}">
          ${this.columns.map(c => {
            let val = c.render ? c.render(row) : (this._getVal(row, c.key) ?? '-');
            return `<td>${val}</td>`;
          }).join('')}
        </tr>`).join('');
    }

    pagDiv.innerHTML = buildPaginationHTML(pag);

    // Bind pagination
    pagDiv.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (p && !btn.disabled && p !== this.page) {
          this.page = p;
          this._renderTable();
        }
      });
    });

    // Bind sort
    const table = document.getElementById(`${this.containerId}-table`);
    if (table) {
      table.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.key === this.sortKey) {
          th.classList.add(this.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }
      });
    }

    // Bind row actions
    if (this.onRowAction) {
      body.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id || btn.closest('tr')?.dataset.id;
          const item = this.data.find(x => x.id === id);
          if (item) this.onRowAction(action, item, btn);
        });
      });
    }
  }

  _bindEvents() {
    const table = document.getElementById(`${this.containerId}-table`);
    if (table) {
      table.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.key;
          if (!key) return;
          if (this.sortKey === key) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortKey = key;
            this.sortDir = 'asc';
          }
          this.page = 1;
          this._applyAll();
        });
      });
    }
  }

  search(query) {
    this._searchQuery = query;
    this.page = 1;
    this._applyAll();
  }

  filter(key, value) {
    this.filters[key] = value;
    this.page = 1;
    this._applyAll();
  }

  clearFilters() {
    this.filters = {};
    this._searchQuery = '';
    this.page = 1;
    this._applyAll();
  }

  _getVal(obj, path) {
    if (!path) return null;
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }
}
