/**
 * MESSI: Modular Enterprise Surface & Structural Inspection Platform
 * Core Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const canvasElem = document.getElementById('aoiCanvas');
  let inspectionEngine = null;
  if (canvasElem) {
    inspectionEngine = new MessiInspectionEngine('aoiCanvas', { defaultPart: 'deeppcb' });
  }

  const qmsEngine = new MessiQMSEngine();
  qmsEngine.updateTableUI();
  qmsEngine.updateStatsCards();

  // 2. State & Datasets Management
  let activeTab = 'aoi-console';
  let filteredDatasets = [...INDUSTRIAL_DATASETS];
  let selectedDatasetModal = null;

  // Initialize Dataset Catalog
  renderDatasetMatrix(filteredDatasets);
  populateDatasetFilters();

  // 3. Telemetry Event Listener from Inspection Engine
  window.addEventListener('messi:telemetryUpdate', (e) => {
    const data = e.detail;
    updateTelemetryHUD(data);
  });

  // Initial trigger
  if (inspectionEngine) {
    inspectionEngine.triggerTelemetryUpdate();
  }

  // 4. UI Navigation Tabs
  const navButtons = document.querySelectorAll('[data-tab-target]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  function switchTab(targetId) {
    activeTab = targetId;
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.add('hidden');
    });
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab-target') === targetId) {
        btn.classList.add('text-blue-600', 'border-blue-600', 'bg-blue-50/50');
        btn.classList.remove('text-slate-600', 'border-transparent');
      } else {
        btn.classList.remove('text-blue-600', 'border-blue-600', 'bg-blue-50/50');
        btn.classList.add('text-slate-600', 'border-transparent');
      }
    });

    // Re-render charts if entering QMS tab
    if (targetId === 'qms-spc' && qmsEngine) {
      if (qmsEngine.spcChart) qmsEngine.spcChart.resize();
      if (qmsEngine.paretoChart) qmsEngine.paretoChart.resize();
    }
  }

  // 5. Live AOI Console Station Switcher
  const stationSelect = document.getElementById('stationSelect');
  if (stationSelect && inspectionEngine) {
    stationSelect.addEventListener('change', (e) => {
      const partKey = e.target.value;
      inspectionEngine.setPart(partKey);
      populateDefectSelector(partKey);
    });
    populateDefectSelector(stationSelect.value);
  }

  function populateDefectSelector(partKey) {
    const defectSelectorContainer = document.getElementById('defectSelectorContainer');
    if (!defectSelectorContainer || !inspectionEngine) return;

    const part = inspectionEngine.partLibrary[partKey];
    if (!part) return;

    defectSelectorContainer.innerHTML = '';
    const defects = Object.keys(part.defects);

    defects.forEach((dKey, idx) => {
      const def = part.defects[dKey];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `px-3 py-1.5 text-xs font-medium rounded border transition-all text-left flex items-center justify-between ${
        idx === 0 
          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      }`;
      btn.setAttribute('data-defect-key', dKey);

      let badgeColor = 'bg-emerald-100 text-emerald-800';
      if (def.severity === 'CRITICAL') badgeColor = 'bg-rose-100 text-rose-800';
      else if (def.severity === 'MAJOR') badgeColor = 'bg-amber-100 text-amber-800';
      else if (def.severity === 'MINOR') badgeColor = 'bg-blue-100 text-blue-800';

      btn.innerHTML = `
        <span class="truncate pr-2">${def.title}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}">${def.severity}</span>
      `;

      btn.addEventListener('click', () => {
        defectSelectorContainer.querySelectorAll('button').forEach(b => {
          b.className = 'px-3 py-1.5 text-xs font-medium rounded border transition-all text-left flex items-center justify-between bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
        });
        btn.className = 'px-3 py-1.5 text-xs font-medium rounded border transition-all text-left flex items-center justify-between bg-blue-50 border-blue-500 text-blue-700 shadow-sm';
        inspectionEngine.setDefect(dKey);
      });

      defectSelectorContainer.appendChild(btn);
    });
  }

  // 6. AOI Threshold Slider
  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdValueDisplay = document.getElementById('thresholdValueDisplay');
  if (thresholdSlider && inspectionEngine) {
    thresholdSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (thresholdValueDisplay) {
        thresholdValueDisplay.textContent = (val * 100).toFixed(0) + '%';
      }
      inspectionEngine.setThreshold(val);
    });
  }

  // 7. Overlay Mode & Golden Reference Toggles
  const overlayBtns = document.querySelectorAll('[data-overlay-mode]');
  overlayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-overlay-mode');
      if (inspectionEngine) {
        inspectionEngine.setOverlayMode(mode);
      }
      overlayBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-100', 'text-slate-700');
      });
      btn.classList.remove('bg-slate-100', 'text-slate-700');
      btn.classList.add('bg-blue-600', 'text-white');
    });
  });

  const goldenRefToggle = document.getElementById('goldenRefToggle');
  if (goldenRefToggle && inspectionEngine) {
    goldenRefToggle.addEventListener('change', (e) => {
      inspectionEngine.toggleGoldenReference(e.target.checked);
    });
  }

  // 8. Trigger Manual Inspection Button
  const triggerInspectBtn = document.getElementById('triggerInspectBtn');
  if (triggerInspectBtn && inspectionEngine && qmsEngine) {
    triggerInspectBtn.addEventListener('click', () => {
      triggerInspectBtn.classList.add('animate-pulse');
      setTimeout(() => triggerInspectBtn.classList.remove('animate-pulse'), 400);

      const metrics = inspectionEngine.calculateMetrics();
      const part = inspectionEngine.partLibrary[inspectionEngine.currentPartType];

      let recordStatus = 'PASS';
      if (metrics.detected && metrics.defectInfo.severity !== 'PASS') {
        recordStatus = metrics.defectInfo.severity === 'CRITICAL' ? 'REJECT' : 'REWORK';
      }

      qmsEngine.addInspectionRecord({
        station: part.name,
        status: recordStatus,
        defectCode: metrics.defectInfo.code || "PASS-00",
        defectName: metrics.defectInfo.title || "Conforming",
        severity: metrics.defectInfo.severity || "PASS",
        confidence: `${(metrics.score * 100).toFixed(1)}%`,
        operator: "OP-415 (S. Chen)",
        cycleTime: metrics.cycleTime
      });

      showNotification(`Inspection Recorded: ${metrics.verdict}`, recordStatus === 'PASS' ? 'success' : 'warning');
    });
  }

  // 9. Update Telemetry HUD in AOI Screen
  function updateTelemetryHUD(metrics) {
    const verdictBadge = document.getElementById('hudVerdict');
    const scoreVal = document.getElementById('hudScore');
    const fnrVal = document.getElementById('hudFnr');
    const fprVal = document.getElementById('hudFpr');
    const iouVal = document.getElementById('hudIou');
    const diceVal = document.getElementById('hudDice');
    const cycleTimeVal = document.getElementById('hudCycleTime');
    const actionVal = document.getElementById('hudAction');
    const rootCauseVal = document.getElementById('hudRootCause');

    if (verdictBadge) {
      verdictBadge.textContent = metrics.verdict;
      verdictBadge.style.backgroundColor = metrics.statusColor + '20';
      verdictBadge.style.color = metrics.statusColor;
      verdictBadge.style.borderColor = metrics.statusColor;
    }

    if (scoreVal) scoreVal.textContent = `${(metrics.score * 100).toFixed(1)}%`;
    if (fnrVal) fnrVal.textContent = metrics.fnr;
    if (fprVal) fprVal.textContent = metrics.fpr;
    if (iouVal) iouVal.textContent = metrics.iou;
    if (diceVal) diceVal.textContent = metrics.dice;
    if (cycleTimeVal) cycleTimeVal.textContent = metrics.cycleTime;
    if (actionVal && metrics.defectInfo) actionVal.textContent = metrics.defectInfo.action || 'Standard conveyor pass-through';
    if (rootCauseVal && metrics.defectInfo) rootCauseVal.textContent = metrics.defectInfo.rootCause || 'N/A';
  }

  // 10. Dataset Matrix Rendering and Filtering
  function renderDatasetMatrix(datasets) {
    const container = document.getElementById('datasetCardsContainer');
    const tableBody = document.getElementById('datasetTableBody');
    const countBadge = document.getElementById('datasetFilteredCount');

    if (countBadge) {
      countBadge.textContent = `${datasets.length} Datasets Loaded`;
    }

    // Grid View Cards
    if (container) {
      container.innerHTML = datasets.map(d => {
        let supColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (d.supervision === 'Strong Supervision') supColor = 'bg-blue-50 text-blue-700 border-blue-200';
        else if (d.supervision === 'Weak Supervision') supColor = 'bg-amber-50 text-amber-700 border-amber-200';

        return `
          <div class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">${d.category}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${supColor}">
                  ${d.supervision}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer" onclick="openDatasetModal('${d.id}')">
                ${d.name}
              </h3>
              <p class="text-xs text-slate-600 mb-3 line-clamp-2">${d.summary}</p>

              <div class="space-y-1.5 py-2 border-y border-slate-100 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span class="text-slate-400">Total Samples:</span>
                  <span class="font-mono font-semibold text-slate-800">${d.totalSamples.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span class="text-slate-400">Modality:</span>
                  <span class="font-medium text-slate-800">${d.modality}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span class="text-slate-400">Resolution:</span>
                  <span class="font-mono text-slate-700">${d.resolution}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span class="text-slate-400">Annotation:</span>
                  <span class="font-medium text-slate-800 truncate max-w-[140px]" title="${d.annotationType}">${d.annotationType}</span>
                </div>
              </div>

              <div class="mt-3">
                <div class="text-[11px] font-semibold text-slate-700 mb-1">Target Defect Anomalies:</div>
                <div class="flex flex-wrap gap-1">
                  ${d.defectTypes.slice(0, 3).map(def => `<span class="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">${def}</span>`).join('')}
                  ${d.defectTypes.length > 3 ? `<span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">+${d.defectTypes.length - 3} more</span>` : ''}
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] font-mono text-slate-500">${d.license}</span>
              <button type="button" onclick="openDatasetModal('${d.id}')" class="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Full Spec & Metrics →
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Comparison Table View
    if (tableBody) {
      tableBody.innerHTML = datasets.map(d => {
        return `
          <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
            <td class="py-3 px-3 font-semibold text-xs text-slate-900 cursor-pointer hover:text-blue-600" onclick="openDatasetModal('${d.id}')">
              ${d.name}
            </td>
            <td class="py-3 px-3 text-xs text-slate-600">${d.domain}</td>
            <td class="py-3 px-3 text-xs font-mono text-slate-700">${d.modality}</td>
            <td class="py-3 px-3 text-xs font-mono font-semibold text-slate-800">${d.totalSamples.toLocaleString()}</td>
            <td class="py-3 px-3 text-xs">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                ${d.supervision}
              </span>
            </td>
            <td class="py-3 px-3 text-xs text-slate-600 truncate max-w-xs" title="${d.annotationType}">${d.annotationType}</td>
            <td class="py-3 px-3 text-xs font-mono text-blue-600 font-semibold">${d.benchmarkAuroc}</td>
            <td class="py-3 px-3 text-right">
              <button onclick="openDatasetModal('${d.id}')" class="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                View
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  function populateDatasetFilters() {
    const searchInput = document.getElementById('datasetSearchInput');
    const categoryFilter = document.getElementById('datasetCategoryFilter');
    const supervisionFilter = document.getElementById('datasetSupervisionFilter');

    function applyFilters() {
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const cat = categoryFilter ? categoryFilter.value : 'all';
      const sup = supervisionFilter ? supervisionFilter.value : 'all';

      filteredDatasets = INDUSTRIAL_DATASETS.filter(d => {
        const matchesQuery = !query || 
          d.name.toLowerCase().includes(query) ||
          d.domain.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query) ||
          d.defectTypes.some(t => t.toLowerCase().includes(query));

        const matchesCat = cat === 'all' || d.category === cat;
        const matchesSup = sup === 'all' || d.supervision.toLowerCase().includes(sup.toLowerCase());

        return matchesQuery && matchesCat && matchesSup;
      });

      renderDatasetMatrix(filteredDatasets);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (supervisionFilter) supervisionFilter.addEventListener('change', applyFilters);
  }

  // 11. Dataset Detail Modal
  window.openDatasetModal = function(datasetId) {
    const dataset = INDUSTRIAL_DATASETS.find(d => d.id === datasetId);
    if (!dataset) return;

    const modal = document.getElementById('datasetModal');
    if (!modal) return;

    document.getElementById('modalDatasetName').textContent = dataset.name;
    document.getElementById('modalDatasetDomain').textContent = dataset.domain;
    document.getElementById('modalDatasetCategory').textContent = dataset.category;
    document.getElementById('modalDatasetSamples').textContent = dataset.totalSamples.toLocaleString();
    document.getElementById('modalDatasetTrainSplit').textContent = dataset.trainSplit;
    document.getElementById('modalDatasetTestSplit').textContent = dataset.testSplit;
    document.getElementById('modalDatasetModality').textContent = dataset.modality;
    document.getElementById('modalDatasetResolution').textContent = dataset.resolution;
    document.getElementById('modalDatasetSupervision').textContent = `${dataset.supervision} (${dataset.supervisionDetail})`;
    document.getElementById('modalDatasetAnnotation').textContent = dataset.annotationType;
    document.getElementById('modalDatasetBenchmark').textContent = dataset.benchmarkAuroc;
    document.getElementById('modalDatasetLicense').textContent = dataset.license;
    document.getElementById('modalDatasetHardware').textContent = dataset.hardwareFit;
    document.getElementById('modalDatasetSummary').textContent = dataset.summary;

    const urlBtn = document.getElementById('modalDatasetUrl');
    if (urlBtn) {
      urlBtn.href = dataset.repositoryUrl;
    }

    const defectListContainer = document.getElementById('modalDatasetDefects');
    if (defectListContainer) {
      defectListContainer.innerHTML = dataset.defectTypes.map(def => `
        <li class="flex items-center gap-2 text-xs text-slate-700">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>${def}</span>
        </li>
      `).join('');
    }

    modal.classList.remove('hidden');
  };

  window.closeDatasetModal = function() {
    const modal = document.getElementById('datasetModal');
    if (modal) modal.classList.add('hidden');
  };

  // 12. Sandbox Upload & Custom Inspection Simulator
  const sandboxDropzone = document.getElementById('sandboxDropzone');
  const sandboxFileInput = document.getElementById('sandboxFileInput');
  const sandboxCanvas = document.getElementById('sandboxCanvas');
  const runSandboxAnalysisBtn = document.getElementById('runSandboxAnalysisBtn');

  if (sandboxDropzone && sandboxFileInput) {
    sandboxDropzone.addEventListener('click', () => sandboxFileInput.click());

    sandboxDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      sandboxDropzone.classList.add('border-blue-500', 'bg-blue-50/40');
    });

    sandboxDropzone.addEventListener('dragleave', () => {
      sandboxDropzone.classList.remove('border-blue-500', 'bg-blue-50/40');
    });

    sandboxDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      sandboxDropzone.classList.remove('border-blue-500', 'bg-blue-50/40');
      if (e.dataTransfer.files.length > 0) {
        handleUserImageUpload(e.dataTransfer.files[0]);
      }
    });

    sandboxFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleUserImageUpload(e.target.files[0]);
      }
    });
  }

  function handleUserImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        renderSandboxImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderSandboxImage(img) {
    if (!sandboxCanvas) return;
    const ctx = sandboxCanvas.getContext('2d');
    ctx.clearRect(0, 0, sandboxCanvas.width, sandboxCanvas.height);
    ctx.drawImage(img, 0, 0, sandboxCanvas.width, sandboxCanvas.height);
    document.getElementById('sandboxEmptyPrompt').classList.add('hidden');
    document.getElementById('sandboxResultsPanel').classList.remove('hidden');
    
    // Simulate inference
    simulateSandboxInference(ctx);
  }

  function simulateSandboxInference(ctx) {
    // Generate simulated defect overlay on user image
    const rx = 180 + Math.random() * 200;
    const ry = 120 + Math.random() * 150;
    const rw = 70 + Math.random() * 60;
    const rh = 50 + Math.random() * 40;

    // Draw Heatmap
    const heatGrad = ctx.createRadialGradient(rx + rw/2, ry + rh/2, 5, rx + rw/2, ry + rh/2, Math.max(rw, rh));
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
    heatGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
    heatGrad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(rx + rw/2, ry + rh/2, Math.max(rw, rh), 0, Math.PI * 2);
    ctx.fill();

    // Draw BBox
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(rx, ry - 18, 110, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('ANOMALY: 94.2%', rx + 4, ry - 5);

    // Update Sandbox Results Text
    document.getElementById('sandboxScore').textContent = '94.2%';
    document.getElementById('sandboxVerdict').textContent = 'ANOMALY DETECTED (REWORK)';
    document.getElementById('sandboxArea').textContent = `${(rw * rh * 0.004).toFixed(2)} mm²`;
  }

  // 13. Preset sample buttons in Sandbox
  const sandboxPresetBtns = document.querySelectorAll('[data-preset-sample]');
  sandboxPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetType = btn.getAttribute('data-preset-sample');
      loadSandboxPreset(presetType);
    });
  });

  function loadSandboxPreset(presetType) {
    if (!sandboxCanvas) return;
    const ctx = sandboxCanvas.getContext('2d');
    const w = sandboxCanvas.width;
    const h = sandboxCanvas.height;

    // Create a temporary inspection engine instance to draw on sandbox
    const tempEngine = new MessiInspectionEngine('sandboxCanvas', { defaultPart: presetType });
    tempEngine.setDefect(Object.keys(tempEngine.partLibrary[presetType].defects)[0]);
    tempEngine.render();
    
    document.getElementById('sandboxEmptyPrompt').classList.add('hidden');
    document.getElementById('sandboxResultsPanel').classList.remove('hidden');

    const metrics = tempEngine.calculateMetrics();
    document.getElementById('sandboxScore').textContent = `${(metrics.score * 100).toFixed(1)}%`;
    document.getElementById('sandboxVerdict').textContent = metrics.verdict;
    document.getElementById('sandboxArea').textContent = `${metrics.defectInfo.areaMm2} mm²`;
  }

  // 14. ISO 9001 Certificate Modal Generator
  window.generateQMSCertificate = function() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;

    const certDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('certDate').textContent = certDate;
    document.getElementById('certLot').textContent = `LOT-2026-${qmsEngine.batchCounter}`;
    document.getElementById('certYield').textContent = `${((qmsEngine.totalConforming / qmsEngine.totalInspected) * 100).toFixed(2)}%`;
    modal.classList.remove('hidden');
  };

  window.closeCertificateModal = function() {
    const modal = document.getElementById('certificateModal');
    if (modal) modal.classList.add('hidden');
  };

  window.printCertificate = function() {
    window.print();
  };

  // 15. Notification Toast
  function showNotification(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border transition-all duration-300 transform translate-y-2 opacity-0 ${
      type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
      type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
      'bg-slate-900 text-white border-slate-800'
    }`;
    toast.innerHTML = `
      <span class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-400'}"></span>
      <span>${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
