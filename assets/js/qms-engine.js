/**
 * MESSI: Modular Enterprise Surface & Structural Inspection Platform
 * Quality Management System (QMS) & Statistical Process Control (SPC) Engine
 * Manages production telemetry, Shewhart control charts, Pareto defect distributions,
 * and ISO 9001:2015 / IATF 16949 audit records.
 */

class MessiQMSEngine {
  constructor() {
    this.inspectionHistory = [];
    this.batchCounter = 10428;
    this.totalInspected = 18450;
    this.totalConforming = 18342;
    this.totalDefects = 108;
    this.totalEscaped = 1;
    this.operators = ["OP-782 (M. Kowalski)", "OP-415 (S. Chen)", "OP-902 (A. Vance)", "AUTO-AOI-ROBOT"];
    
    // Seed historical inspections for rich initial data
    this.seedHistoricalData();
    this.initializeCharts();
  }

  seedHistoricalData() {
    const defectTypes = [
      { code: "PCB-ERR-01", type: "Open Circuit", severity: "CRITICAL", station: "Line A04 (SMT)" },
      { code: "PCB-ERR-02", type: "Short Circuit", severity: "CRITICAL", station: "Line A04 (SMT)" },
      { code: "PCB-ERR-03", type: "Mousebite", severity: "MAJOR", station: "Line A04 (SMT)" },
      { code: "PCB-ERR-04", type: "Spur", severity: "MAJOR", station: "Line A04 (SMT)" },
      { code: "PCB-ERR-05", type: "Pinhole", severity: "MINOR", station: "Line A04 (SMT)" },
      { code: "STL-CRZ-10", type: "Steel Crazing", severity: "CRITICAL", station: "Line S12 (Steel)" },
      { code: "STL-INC-12", type: "Inclusion", severity: "MAJOR", station: "Line S12 (Steel)" },
      { code: "STL-SCR-16", type: "Scratches", severity: "MAJOR", station: "Line S12 (Steel)" },
      { code: "KOM-FRC-01", type: "Commutator Crack", severity: "CRITICAL", station: "Line C08 (Commutator)" },
      { code: "SLR-MCK-01", type: "PV Micro-Crack", severity: "CRITICAL", station: "Line E01 (Solar)" }
    ];

    const now = Date.now();
    for (let i = 24; i >= 1; i--) {
      const isDefect = Math.random() < 0.22;
      const timeStr = new Date(now - i * 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const lotId = `LOT-2026-${(this.batchCounter - i)}`;

      if (isDefect) {
        const d = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        const confidence = (0.85 + Math.random() * 0.14).toFixed(3);
        this.inspectionHistory.unshift({
          lotId,
          timestamp: timeStr,
          station: d.station,
          status: d.severity === 'CRITICAL' ? 'REJECT' : 'REWORK',
          defectCode: d.code,
          defectName: d.type,
          severity: d.severity,
          confidence: `${(confidence * 100).toFixed(1)}%`,
          operator: this.operators[Math.floor(Math.random() * this.operators.length)],
          cycleTime: (12 + Math.random() * 5).toFixed(1) + ' ms'
        });
      } else {
        this.inspectionHistory.unshift({
          lotId,
          timestamp: timeStr,
          station: "Line A04 (SMT)",
          status: "PASS",
          defectCode: "PASS-00",
          defectName: "100% Conforming",
          severity: "PASS",
          confidence: "99.8%",
          operator: this.operators[Math.floor(Math.random() * this.operators.length)],
          cycleTime: (11 + Math.random() * 4).toFixed(1) + ' ms'
        });
      }
    }
  }

  addInspectionRecord(record) {
    this.batchCounter++;
    this.totalInspected++;
    if (record.status === 'PASS') {
      this.totalConforming++;
    } else {
      this.totalDefects++;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullRecord = {
      lotId: `LOT-2026-${this.batchCounter}`,
      timestamp: timeStr,
      ...record
    };

    this.inspectionHistory.unshift(fullRecord);
    if (this.inspectionHistory.length > 50) {
      this.inspectionHistory.pop();
    }

    this.updateTableUI();
    this.updateStatsCards();
  }

  initializeCharts() {
    // Shewhart Control Chart (X-bar Trend)
    const spcCanvas = document.getElementById('spcChart');
    if (spcCanvas && window.Chart) {
      const labels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      const nominalMean = 0.994;
      const ucl = 0.999;
      const lcl = 0.985;
      const dataPoints = [0.993, 0.995, 0.992, 0.996, 0.994, 0.991, 0.995, 0.996, 0.994, 0.995];

      this.spcChart = new Chart(spcCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Hourly First Pass Yield (FPY)',
              data: dataPoints,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              borderWidth: 2.5,
              tension: 0.2,
              fill: true,
              pointBackgroundColor: '#2563eb',
              pointRadius: 4
            },
            {
              label: 'Upper Control Limit (UCL = 99.9%)',
              data: Array(labels.length).fill(ucl),
              borderColor: '#dc2626',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'Lower Control Limit (LCL = 98.5%)',
              data: Array(labels.length).fill(lcl),
              borderColor: '#dc2626',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'Target Mean (99.4%)',
              data: Array(labels.length).fill(nominalMean),
              borderColor: '#059669',
              borderWidth: 1.5,
              borderDash: [3, 3],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 11, family: 'Inter, system-ui' }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(2)}%`
              }
            }
          },
          scales: {
            y: {
              min: 0.980,
              max: 1.000,
              ticks: {
                callback: (val) => (val * 100).toFixed(1) + '%'
              },
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { color: '#f1f5f9' }
            }
          }
        }
      });
    }

    // Pareto Defect Breakdown Chart
    const paretoCanvas = document.getElementById('paretoChart');
    if (paretoCanvas && window.Chart) {
      this.paretoChart = new Chart(paretoCanvas, {
        type: 'bar',
        data: {
          labels: ['Open Circuit', 'Scratches', 'Crazing', 'Short Circuit', 'Mousebite', 'Inclusion', 'Spur', 'Pinhole'],
          datasets: [
            {
              label: 'Defect Frequency (Count)',
              data: [34, 28, 19, 14, 11, 8, 5, 2],
              backgroundColor: '#3b82f6',
              borderRadius: 4,
              order: 2
            },
            {
              label: 'Cumulative Impact %',
              data: [28.1, 51.2, 66.9, 78.5, 87.6, 94.2, 98.3, 100.0],
              type: 'line',
              borderColor: '#f59e0b',
              borderWidth: 2,
              pointBackgroundColor: '#f59e0b',
              pointRadius: 4,
              yAxisID: 'y1',
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { boxWidth: 12, font: { size: 11, family: 'Inter, system-ui' } }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Defect Occurrences' },
              grid: { color: '#f1f5f9' }
            },
            y1: {
              beginAtZero: true,
              max: 100,
              position: 'right',
              title: { display: true, text: 'Cumulative %' },
              ticks: { callback: (val) => val + '%' },
              grid: { drawOnChartArea: false }
            },
            x: {
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  updateStatsCards() {
    const yieldElem = document.getElementById('statYield');
    const totalElem = document.getElementById('statTotal');
    const defectElem = document.getElementById('statDefects');
    const cpkElem = document.getElementById('statCpk');

    if (totalElem) totalElem.textContent = this.totalInspected.toLocaleString();
    if (defectElem) defectElem.textContent = this.totalDefects.toLocaleString();
    
    const yieldRate = ((this.totalConforming / this.totalInspected) * 100).toFixed(2);
    if (yieldElem) yieldElem.textContent = `${yieldRate}%`;
    if (cpkElem) cpkElem.textContent = "1.84 (Six Sigma)";
  }

  updateTableUI() {
    const tbody = document.getElementById('inspectionLogTbody');
    if (!tbody) return;

    tbody.innerHTML = this.inspectionHistory.map(row => {
      let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (row.severity === 'CRITICAL') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
      else if (row.severity === 'MAJOR') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      else if (row.severity === 'MINOR') badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="py-2.5 px-3 font-mono text-xs font-semibold text-slate-800">${row.lotId}</td>
          <td class="py-2.5 px-3 text-xs text-slate-500 font-mono">${row.timestamp}</td>
          <td class="py-2.5 px-3 text-xs text-slate-700 font-medium">${row.station}</td>
          <td class="py-2.5 px-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}">
              ${row.status}
            </span>
          </td>
          <td class="py-2.5 px-3 text-xs font-medium text-slate-800">
            ${row.defectName} <span class="text-[10px] text-slate-400 font-mono">(${row.defectCode})</span>
          </td>
          <td class="py-2.5 px-3 text-xs font-mono text-slate-600">${row.confidence}</td>
          <td class="py-2.5 px-3 text-xs font-mono text-slate-500">${row.cycleTime}</td>
          <td class="py-2.5 px-3 text-xs text-slate-600">${row.operator}</td>
        </tr>
      `;
    }).join('');
  }

  exportData(format = 'json') {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.inspectionHistory, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `MESSI_QMS_Inspection_Log_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else if (format === 'csv') {
      const headers = ["Lot ID", "Timestamp", "Station", "Status", "Defect Code", "Defect Name", "Severity", "Confidence", "Cycle Time", "Operator"];
      const rows = this.inspectionHistory.map(r => [
        r.lotId, r.timestamp, r.station, r.status, r.defectCode, `"${r.defectName}"`, r.severity, r.confidence, r.cycleTime, `"${r.operator}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `MESSI_QMS_Inspection_Log_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  }
}

window.MessiQMSEngine = MessiQMSEngine;
