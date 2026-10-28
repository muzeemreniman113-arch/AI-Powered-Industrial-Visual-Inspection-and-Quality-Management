/**
 * MESSI: Modular Enterprise Surface & Structural Inspection Platform
 * Inspection & Computer Vision Simulation Engine
 * High-precision canvas visualizer for industrial Automated Optical Inspection (AOI)
 */

class MessiInspectionEngine {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Core inspection state
    this.currentPartType = options.defaultPart || 'deeppcb';
    this.currentDefectType = 'open_circuit';
    this.threshold = 0.82;
    this.overlayMode = 'all'; // 'all', 'bbox', 'heatmap', 'diff', 'none'
    this.zoomLevel = 1.0;
    this.showGoldenRef = false;
    this.showReticle = true;
    this.showCalipers = true;
    this.isInspecting = true;
    this.isFrozen = false;
    this.inspectionFps = 72;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.measuredFps = 70;
    
    // Mouse inspection tracking
    this.mouse = { x: -100, y: -100, isInside: false };
    this.loupeActive = false;
    this.loupeZoom = 2.5;
    
    // Defect definitions library for high-realism simulation
    this.partLibrary = {
      deeppcb: {
        name: "High-Density BGA PCB (Layer 4)",
        benchmark: "DeepPCB (Tang et al.)",
        modality: "2D Linear Scan CCD (48 px/mm)",
        nominalCycleTime: 14.2,
        defects: {
          open_circuit: {
            title: "Open Circuit (Broken Copper Trace)",
            severity: "CRITICAL",
            code: "PCB-ERR-01",
            box: { x: 265, y: 195, w: 95, h: 55 },
            score: 0.964,
            areaMm2: 0.48,
            toleranceMm: 0.05,
            rootCause: "Etching over-exposure / dust particulate on photomask",
            action: "Immediate automatic reject; signal feeder lock"
          },
          short_circuit: {
            title: "Short Circuit (Trace Bridging)",
            severity: "CRITICAL",
            code: "PCB-ERR-02",
            box: { x: 380, y: 285, w: 75, h: 60 },
            score: 0.982,
            areaMm2: 0.62,
            toleranceMm: 0.05,
            rootCause: "Solder paste bridging / improper squeegee pressure",
            action: "Immediate reject; flag SMT stencil cleaning cycle"
          },
          mousebite: {
            title: "Mousebite (Copper Edge Erosion)",
            severity: "MAJOR",
            code: "PCB-ERR-03",
            box: { x: 190, y: 310, w: 65, h: 45 },
            score: 0.891,
            areaMm2: 0.29,
            toleranceMm: 0.10,
            rootCause: "Substrate router bit wear during panel de-panelization",
            action: "Rework queue; inspect routing spindle #2"
          },
          spur: {
            title: "Spur (Trace Copper Protrusion)",
            severity: "MAJOR",
            code: "PCB-ERR-04",
            box: { x: 310, y: 120, w: 50, h: 50 },
            score: 0.915,
            areaMm2: 0.22,
            toleranceMm: 0.08,
            rootCause: "Micro-burr during chemical etching",
            action: "Rework queue; review etching bath pH balance"
          },
          pinhole: {
            title: "Pinhole (Solder Pad Void)",
            severity: "MINOR",
            code: "PCB-ERR-05",
            box: { x: 440, y: 155, w: 45, h: 45 },
            score: 0.842,
            areaMm2: 0.15,
            toleranceMm: 0.12,
            rootCause: "Flux outgassing during reflow soldering peak zone",
            action: "Conforming with warning; log to SPC trend"
          },
          none: {
            title: "Nominal Conforming Sample (Golden Reference)",
            severity: "PASS",
            code: "PCB-PASS-00",
            box: null,
            score: 0.041,
            areaMm2: 0.0,
            toleranceMm: 0.0,
            rootCause: "None. 100% IPC-A-610G Class 3 Compliant",
            action: "Route to downstream packaging conveyor"
          }
        }
      },
      neu_steel: {
        name: "Continuous Cast Hot-Rolled Strip",
        benchmark: "NEU Surface Defect (Song & Yan)",
        modality: "Dark-Field Specular CMOS Line-Scan",
        nominalCycleTime: 8.8,
        defects: {
          crazing: {
            title: "Crazing (Fine Network Micro-Cracks)",
            severity: "CRITICAL",
            code: "STL-CRZ-10",
            box: { x: 230, y: 160, w: 140, h: 120 },
            score: 0.948,
            areaMm2: 8.64,
            toleranceMm: 0.25,
            rootCause: "Excessive thermal gradient during continuous cooling spray",
            action: "Quarantine coil segment; adjust cooling header zone 4"
          },
          inclusion: {
            title: "Inclusion (Non-Metallic Slag Particle)",
            severity: "MAJOR",
            code: "STL-INC-12",
            box: { x: 340, y: 240, w: 80, h: 70 },
            score: 0.912,
            areaMm2: 4.15,
            toleranceMm: 0.50,
            rootCause: "Refractory ladle slag carry-over during tundish pouring",
            action: "Mark segment for surface milling / scrap down-rating"
          },
          rolled_in_scale: {
            title: "Rolled-in Scale (Iron Oxide Press-in)",
            severity: "MAJOR",
            code: "STL-SCL-14",
            box: { x: 180, y: 220, w: 160, h: 80 },
            score: 0.935,
            areaMm2: 12.3,
            toleranceMm: 0.40,
            rootCause: "High-pressure descaling header nozzle clogging",
            action: "Flag descaler nozzle inspection; crop 15m strip"
          },
          scratches: {
            title: "Scratches (Longitudinal Mechanical Abrasion)",
            severity: "MAJOR",
            code: "STL-SCR-16",
            box: { x: 140, y: 110, w: 290, h: 45 },
            score: 0.971,
            areaMm2: 6.80,
            toleranceMm: 0.20,
            rootCause: "Guide roller seizure or foreign metallic fragment in pinch roll",
            action: "Alert line operator; verify guide roll #6 bearing"
          },
          none: {
            title: "Nominal Hot-Rolled Surface (Defect-Free)",
            severity: "PASS",
            code: "STL-PASS-00",
            box: null,
            score: 0.032,
            areaMm2: 0.0,
            toleranceMm: 0.0,
            rootCause: "None. Surface roughness Ra within EN 10051 limits",
            action: "Continue continuous high-speed coiling"
          }
        }
      },
      kolektor_comm: {
        name: "Molded Commutator (EV Drive Motor)",
        benchmark: "KolektorSDD2 (Tabernik et al.)",
        modality: "Rotary Telecentric Telephoto Micro-Scan",
        nominalCycleTime: 21.4,
        defects: {
          crack: {
            title: "Embedding Fracture / Hairline Crack",
            severity: "CRITICAL",
            code: "KOM-FRC-01",
            box: { x: 275, y: 170, w: 90, h: 130 },
            score: 0.978,
            areaMm2: 1.85,
            toleranceMm: 0.02,
            rootCause: "Thermal stress during thermoplastic injection curing",
            action: "Pneumatic ejection into defect bin; lock injection mold #3"
          },
          dark_spot: {
            title: "Polymer Impurity / Carbonized Spot",
            severity: "MINOR",
            code: "KOM-SPT-04",
            box: { x: 350, y: 250, w: 50, h: 50 },
            score: 0.815,
            areaMm2: 0.45,
            toleranceMm: 0.15,
            rootCause: "Resin thermal degradation in barrel hot spot",
            action: "Accept with visual log; monitor resin barrel temperature"
          },
          none: {
            title: "Conforming Commutator Ring",
            severity: "PASS",
            code: "KOM-PASS-00",
            box: null,
            score: 0.028,
            areaMm2: 0.0,
            toleranceMm: 0.0,
            rootCause: "Structural dielectric integrity verified",
            action: "Pass to armature copper winding station"
          }
        }
      },
      solar_pv: {
        name: "TOPCon Bifacial Solar Cell (182mm)",
        benchmark: "elpv-dataset (Deitsch et al.)",
        modality: "Electroluminescence Chamber (8-bit NIR)",
        nominalCycleTime: 17.5,
        defects: {
          micro_crack: {
            title: "Silicon Subsurface Micro-Crack",
            severity: "CRITICAL",
            code: "SLR-MCK-01",
            box: { x: 220, y: 150, w: 140, h: 90 },
            score: 0.985,
            areaMm2: 5.40,
            toleranceMm: 0.01,
            rootCause: "Mechanical micro-stress from wafer slicing diamond wire",
            action: "Reject to prevent module field hot-spot degradation"
          },
          finger_interruption: {
            title: "Broken Metallization Finger Grid",
            severity: "MAJOR",
            code: "SLR-FNG-03",
            box: { x: 310, y: 230, w: 85, h: 70 },
            score: 0.908,
            areaMm2: 1.15,
            toleranceMm: 0.05,
            rootCause: "Screen printing paste clogging or screen mesh rupture",
            action: "Down-rate cell power class; inspect printing screen"
          },
          none: {
            title: "Pristine Photovoltaic Wafer",
            severity: "PASS",
            code: "SLR-PASS-00",
            box: null,
            score: 0.019,
            areaMm2: 0.0,
            toleranceMm: 0.0,
            rootCause: "Uniform luminescence; no resistive shunts",
            action: "Transfer to high-efficiency module stringing matrix"
          }
        }
      }
    };

    this.bindEvents();
    this.startRenderLoop();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
      this.mouse.isInside = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.isInside = false;
    });

    this.canvas.addEventListener('click', (e) => {
      this.loupeActive = !this.loupeActive;
      this.triggerEvent('loupeToggle', { active: this.loupeActive });
    });
  }

  setPart(partKey) {
    if (this.partLibrary[partKey]) {
      this.currentPartType = partKey;
      // Default to first defect
      const defectKeys = Object.keys(this.partLibrary[partKey].defects);
      this.currentDefectType = defectKeys[0];
      this.triggerTelemetryUpdate();
    }
  }

  setDefect(defectKey) {
    const part = this.partLibrary[this.currentPartType];
    if (part && part.defects[defectKey]) {
      this.currentDefectType = defectKey;
      this.triggerTelemetryUpdate();
    }
  }

  setThreshold(val) {
    this.threshold = parseFloat(val);
    this.triggerTelemetryUpdate();
  }

  setOverlayMode(mode) {
    this.overlayMode = mode;
  }

  toggleGoldenReference(show) {
    this.showGoldenRef = show !== undefined ? show : !this.showGoldenRef;
  }

  getCurrentDefectData() {
    const part = this.partLibrary[this.currentPartType];
    if (!part) return null;
    return part.defects[this.currentDefectType] || null;
  }

  calculateMetrics() {
    const defect = this.getCurrentDefectData();
    if (!defect) return {};

    const isDefectiveSample = this.currentDefectType !== 'none';
    const detected = defect.score >= this.threshold;

    // True Positive / False Negative / False Positive / True Negative logic
    let verdict = 'PASS';
    let statusColor = '#059669'; // Green

    if (isDefectiveSample) {
      if (detected) {
        verdict = defect.severity === 'CRITICAL' ? 'DEFECT (REJECT)' : 'DEFECT (REWORK)';
        statusColor = defect.severity === 'CRITICAL' ? '#dc2626' : '#d97706';
      } else {
        verdict = 'ESCAPE (FALSE PASS)'; // Missed defect! False Negative
        statusColor = '#9333ea';
      }
    } else {
      if (detected) {
        verdict = 'FALSE ALARM (OVER-REJECT)'; // False Positive
        statusColor = '#ea580c';
      } else {
        verdict = 'PASS (CONFORMING)';
        statusColor = '#059669';
      }
    }

    // Dynamic FNR & FPR calculation based on Gaussian decision threshold model
    // As threshold increases: FNR rises (more defects missed), FPR drops (fewer false alarms)
    const t = this.threshold;
    const simulatedFnr = Math.max(0.0008, Math.pow(t, 4) * 0.082).toFixed(4);
    const simulatedFpr = Math.max(0.0005, Math.pow(1 - t, 3) * 0.065).toFixed(4);
    const calculatedIoU = isDefectiveSample && detected ? (0.84 + (1 - t) * 0.12).toFixed(3) : "N/A";
    const calculatedDice = isDefectiveSample && detected ? (0.91 + (1 - t) * 0.07).toFixed(3) : "N/A";

    return {
      verdict,
      statusColor,
      detected,
      score: defect.score,
      threshold: this.threshold,
      fnr: (simulatedFnr * 100).toFixed(2) + '%',
      fpr: (simulatedFpr * 100).toFixed(2) + '%',
      iou: calculatedIoU,
      dice: calculatedDice,
      defectInfo: defect,
      cycleTime: (this.partLibrary[this.currentPartType].nominalCycleTime + (Math.random() * 0.4 - 0.2)).toFixed(1) + ' ms'
    };
  }

  triggerTelemetryUpdate() {
    const metrics = this.calculateMetrics();
    this.triggerEvent('telemetryUpdate', metrics);
  }

  triggerEvent(name, detail) {
    const event = new CustomEvent('messi:' + name, { detail });
    window.dispatchEvent(event);
  }

  startRenderLoop() {
    const loop = (timestamp) => {
      this.frameCount++;
      if (timestamp - this.lastFrameTime >= 1000) {
        this.measuredFps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = timestamp;
      }

      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Simulated Optical Component
    switch (this.currentPartType) {
      case 'deeppcb':
        this.renderPCB(ctx, w, h);
        break;
      case 'neu_steel':
        this.renderSteelStrip(ctx, w, h);
        break;
      case 'kolektor_comm':
        this.renderCommutator(ctx, w, h);
        break;
      case 'solar_pv':
        this.renderSolarPV(ctx, w, h);
        break;
      default:
        this.renderPCB(ctx, w, h);
    }

    // 2. Draw Inspection Overlays (Heatmaps, BBoxes, Diff, Calipers)
    const defect = this.getCurrentDefectData();
    const isDetected = defect && defect.score >= this.threshold;

    if (defect && defect.box && this.currentDefectType !== 'none') {
      if (this.overlayMode === 'all' || this.overlayMode === 'heatmap') {
        this.renderHeatmapMask(ctx, defect.box);
      }
      if (this.overlayMode === 'all' || this.overlayMode === 'bbox') {
        this.renderBoundingBox(ctx, defect, isDetected);
      }
      if (this.overlayMode === 'diff') {
        this.renderGoldenDiffOverlay(ctx, defect.box);
      }
    }

    // 3. Draw Optical Crosshair & Telemetry HUD
    if (this.showReticle) {
      this.renderOpticalReticle(ctx, w, h);
    }

    // 4. Draw Precision Magnifier Loupe if active or hovering
    if (this.loupeActive && this.mouse.isInside) {
      this.renderMagnifierLoupe(ctx, w, h);
    }

    // 5. Draw Watermark & Live Optical Calibration Badge
    this.renderCalibrationWatermark(ctx, w, h);
  }

  // --- COMPONENT RENDERERS ---

  renderPCB(ctx, w, h) {
    // SMT PCB Substrate: Industrial solder mask green
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#064e3b'); // Dark emerald
    bgGrad.addColorStop(0.5, '#047857'); // Solder mask green
    bgGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle fiberglass weave texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Copper traces (Gold/Bronze)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706'; // Copper gold
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Bus traces
    const traces = [
      [[40, 100], [180, 100], [220, 140], [420, 140], [460, 100], [560, 100]],
      [[40, 140], [150, 140], [200, 190], [300, 190], [350, 240], [560, 240]],
      [[40, 180], [120, 180], [170, 230], [270, 230], [320, 280], [560, 280]],
      [[40, 220], [100, 220], [160, 280], [280, 280], [330, 330], [560, 330]],
      [[40, 260], [140, 260], [180, 300], [250, 300], [300, 350], [560, 350]],
      [[40, 320], [200, 320], [240, 360], [400, 360], [440, 320], [560, 320]]
    ];

    traces.forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t[0][0], t[0][1]);
      for (let i = 1; i < t.length; i++) {
        ctx.lineTo(t[i][0], t[i][1]);
      }
      ctx.stroke();
    });

    // SMT IC Chip (Central Processor)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillRect(220, 180, 160, 110);
    ctx.strokeRect(220, 180, 160, 110);

    // IC Pins
    ctx.fillStyle = '#e2e8f0';
    for (let px = 230; px <= 370; px += 14) {
      // Top pins
      ctx.fillRect(px, 172, 8, 8);
      // Bottom pins
      ctx.fillRect(px, 290, 8, 8);
    }
    for (let py = 190; py <= 280; py += 12) {
      // Left pins
      ctx.fillRect(212, py, 8, 6);
      // Right pins
      ctx.fillRect(380, py, 8, 6);
    }

    // IC Chip Laser Mark
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('MESSI-AOI-v4', 245, 230);
    ctx.fillText('FPGA-ACCEL-9X', 245, 245);

    // Solder pads and via holes
    const vias = [
      [80, 80], [120, 80], [160, 80], [480, 80], [520, 80],
      [80, 360], [140, 380], [460, 370], [500, 370]
    ];
    vias.forEach(([vx, vy]) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Surface Mount Resistor/Capacitor Components (0603/0402 packages)
    const smtParts = [
      [110, 136, 18, 10, '#38bdf8'],
      [150, 216, 18, 10, '#38bdf8'],
      [430, 136, 18, 10, '#fb923c'],
      [470, 236, 18, 10, '#38bdf8'],
      [130, 296, 18, 10, '#fb923c']
    ];
    smtParts.forEach(([sx, sy, sw, sh, color]) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx - 3, sy, 3, sh);
      ctx.fillRect(sx + sw, sy, 3, sh);
      ctx.fillStyle = color;
      ctx.fillRect(sx, sy, sw, sh);
    });

    // INJECT SPECIFIC DEFECT FOR VISUALIZATION
    if (this.currentDefectType === 'open_circuit' && !this.showGoldenRef) {
      // Gouge out a physical gap in trace #2
      ctx.fillStyle = '#065f46';
      ctx.fillRect(310, 215, 22, 14);
      // Rough fractured copper edges
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(310, 222, 3, 0, Math.PI * 2);
      ctx.arc(332, 222, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentDefectType === 'short_circuit' && !this.showGoldenRef) {
      // Unwanted bridge between trace 3 and 4
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(410, 280);
      ctx.lineTo(425, 330);
      ctx.lineWidth = 5;
      ctx.stroke();
    } else if (this.currentDefectType === 'mousebite' && !this.showGoldenRef) {
      // Nibbled copper edge
      ctx.fillStyle = '#064e3b';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(220 + i * 5, 318, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.currentDefectType === 'spur' && !this.showGoldenRef) {
      // Conductive horn / spur
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(330, 140);
      ctx.lineTo(345, 125);
      ctx.stroke();
    } else if (this.currentDefectType === 'pinhole' && !this.showGoldenRef) {
      // Void in solder pad
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(460, 175, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderSteelStrip(ctx, w, h) {
    // Hot-Rolled Steel: Brushed metallurgical steel sheet with directional rolling texture
    const steelGrad = ctx.createLinearGradient(0, 0, w, 0);
    steelGrad.addColorStop(0, '#94a3b8');
    steelGrad.addColorStop(0.3, '#cbd5e1');
    steelGrad.addColorStop(0.7, '#64748b');
    steelGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = steelGrad;
    ctx.fillRect(0, 0, w, h);

    // Directional rolling streak lines (mill rollers)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 3) {
      const alpha = Math.sin(y * 0.1) * 0.08 + 0.06;
      ctx.strokeStyle = `rgba(30, 41, 59, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.sin(y) * 2));
      ctx.stroke();
    }

    // Steel grain noise
    ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
    for (let i = 0; i < 400; i++) {
      const gx = (i * 17) % w;
      const gy = (i * 31) % h;
      ctx.fillRect(gx, gy, 4, 1);
    }

    // INJECT NEU STEEL DEFECTS
    if (this.currentDefectType === 'crazing' && !this.showGoldenRef) {
      // Spiderweb network of cooling micro-fissures
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const cx = 300, cy = 220;
      ctx.moveTo(cx - 50, cy - 30);
      ctx.lineTo(cx - 20, cy - 10);
      ctx.lineTo(cx + 30, cy - 40);
      ctx.lineTo(cx + 60, cy);
      ctx.lineTo(cx + 20, cy + 35);
      ctx.lineTo(cx - 30, cy + 40);
      ctx.lineTo(cx - 50, cy - 30);
      // Internal cracks
      ctx.moveTo(cx - 20, cy - 10);
      ctx.lineTo(cx + 10, cy + 10);
      ctx.lineTo(cx + 60, cy);
      ctx.moveTo(cx + 10, cy + 10);
      ctx.lineTo(cx - 30, cy + 40);
      ctx.stroke();
    } else if (this.currentDefectType === 'inclusion' && !this.showGoldenRef) {
      // Dark non-metallic slag inclusions
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(380, 275, 25, 14, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(395, 260, 10, 6, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentDefectType === 'rolled_in_scale' && !this.showGoldenRef) {
      // Iron oxide scale pressed into metal
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(200, 240);
      ctx.bezierCurveTo(240, 230, 280, 270, 320, 250);
      ctx.bezierCurveTo(310, 280, 250, 290, 210, 270);
      ctx.closePath();
      ctx.fill();
    } else if (this.currentDefectType === 'scratches' && !this.showGoldenRef) {
      // Longitudinal abrasion scratch with specular gouge
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(410, 135);
      ctx.stroke();
      // Specular highlight edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(150, 132);
      ctx.lineTo(410, 137);
      ctx.stroke();
    }
  }

  renderCommutator(ctx, w, h) {
    // Kolektor Commutator: Dark circular plastic resin embedding with copper commutator bars
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Outer plastic casing
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Copper commutator bars array
    const bars = 24;
    for (let i = 0; i < bars; i++) {
      const angle = (i * 2 * Math.PI) / bars;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      // Copper bar
      ctx.fillStyle = i % 2 === 0 ? '#b45309' : '#d97706';
      ctx.fillRect(110, -8, 60, 16);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(110, -8, 60, 16);
      ctx.restore();
    }

    // Inner resin hub
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.fill();

    // Center spindle bore
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // DEFECT: Plastic molding fracture crack (KolektorSDD)
    if (this.currentDefectType === 'crack' && !this.showGoldenRef) {
      ctx.strokeStyle = '#f87171'; // Red fracture outline
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 40);
      ctx.lineTo(cx + 35, cy - 10);
      ctx.lineTo(cx + 60, cy + 30);
      ctx.lineTo(cx + 70, cy + 70);
      ctx.stroke();
    } else if (this.currentDefectType === 'dark_spot' && !this.showGoldenRef) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx + 65, cy + 45, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderSolarPV(ctx, w, h) {
    // Electroluminescence NIR image: Dark monocrystalline silicon wafer with glowing fingers
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, w, h);

    // Silicon wafer boundary
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(80, 40, w - 160, h - 80);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 40, w - 160, h - 80);

    // Busbars (wide conductive tracks)
    const busbars = [150, 250, 350, 450];
    ctx.fillStyle = '#94a3b8';
    busbars.forEach(bx => {
      ctx.fillRect(bx, 40, 6, h - 80);
    });

    // Fine grid fingers (luminescent lines)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 1;
    for (let fy = 48; fy < h - 40; fy += 8) {
      ctx.beginPath();
      ctx.moveTo(80, fy);
      ctx.lineTo(w - 80, fy);
      ctx.stroke();
    }

    // EL DEFECTS
    if (this.currentDefectType === 'micro_crack' && !this.showGoldenRef) {
      // Jagged dark line across busbars (micro-crack causing inactive shunts)
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(230, 160);
      ctx.lineTo(280, 190);
      ctx.lineTo(340, 210);
      ctx.stroke();

      // Stress glow halo around crack
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(230, 160);
      ctx.lineTo(280, 190);
      ctx.lineTo(340, 210);
      ctx.stroke();
    } else if (this.currentDefectType === 'finger_interruption' && !this.showGoldenRef) {
      // Dead fingers zone
      ctx.fillStyle = '#090d16';
      ctx.fillRect(320, 240, 65, 50);
    }
  }

  // --- OVERLAYS & HUD ---

  renderBoundingBox(ctx, defect, isDetected) {
    const box = defect.box;
    const color = isDetected ? (defect.severity === 'CRITICAL' ? '#dc2626' : '#d97706') : '#9333ea';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);

    // Box rectangle
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // Precision corner ticks
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    const tickLen = 8;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + tickLen);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + tickLen, box.y);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.w - tickLen, box.y);
    ctx.lineTo(box.x + box.w, box.y);
    ctx.lineTo(box.x + box.w, box.y + tickLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(box.x, box.y + box.h - tickLen);
    ctx.lineTo(box.x, box.y + box.h);
    ctx.lineTo(box.x + tickLen, box.y + box.h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(box.x + box.w - tickLen, box.y + box.h);
    ctx.lineTo(box.x + box.w, box.y + box.h);
    ctx.lineTo(box.x + box.w, box.y + box.h - tickLen);
    ctx.stroke();

    // Defect Classification Badge
    const label = `${defect.code} | ${(defect.score * 100).toFixed(1)}%`;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.fillRect(box.x, box.y - 20, textWidth + 12, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, box.x + 6, box.y - 6);

    // Dimension calipers tag
    if (this.showCalipers) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(box.x, box.y + box.h + 2, 90, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`${defect.areaMm2} mm² | ±${defect.toleranceMm}`, box.x + 4, box.y + box.h + 14);
    }

    ctx.restore();
  }

  renderHeatmapMask(ctx, box) {
    ctx.save();
    // Radial gradient heat map simulation (Jet/Turbo colormap style)
    const centerX = box.x + box.w / 2;
    const centerY = box.y + box.h / 2;
    const radius = Math.max(box.w, box.h) * 0.75;

    const heatGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, radius);
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)'); // Red core
    heatGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.55)'); // Amber mid
    heatGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.30)'); // Green fringe
    heatGrad.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Blue edge

    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderGoldenDiffOverlay(ctx, box) {
    ctx.save();
    ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
    ctx.fillRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x - 10, box.y - 10, box.w + 20, box.h + 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DIFF Δ: PIXEL DISCREPANCY', box.x - 5, box.y - 14);
    ctx.restore();
  }

  renderOpticalReticle(ctx, w, h) {
    ctx.save();
    // Subtle crosshairs in center
    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy + 20);
    ctx.stroke();

    // Circle reticle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.stroke();

    // If mouse is inside canvas, render live inspection crosshair
    if (this.mouse.isInside) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(this.mouse.x, 0);
      ctx.lineTo(this.mouse.x, h);
      ctx.moveTo(0, this.mouse.y);
      ctx.lineTo(w, this.mouse.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderMagnifierLoupe(ctx, w, h) {
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const radius = 65;
    const zoom = this.loupeZoom;

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.clip();

    // Magnify underlying content
    ctx.translate(mx, my);
    ctx.scale(zoom, zoom);
    ctx.translate(-mx, -my);

    // Re-render sample on magnified clip
    if (this.currentPartType === 'deeppcb') this.renderPCB(ctx, w, h);
    else if (this.currentPartType === 'neu_steel') this.renderSteelStrip(ctx, w, h);
    else if (this.currentPartType === 'kolektor_comm') this.renderCommutator(ctx, w, h);
    else if (this.currentPartType === 'solar_pv') this.renderSolarPV(ctx, w, h);

    ctx.restore();

    // Draw Loupe Outer Ring
    ctx.save();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mx, my, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Badge on loupe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(mx - 30, my + radius - 10, 60, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${zoom}x LOUPE`, mx, my + radius + 3);
    ctx.restore();
  }

  renderCalibrationWatermark(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(`AOI NODE: M-EDGE-01 | FPS: ${this.measuredFps} | EXP: 1200μs`, 12, h - 14);

    if (this.showGoldenRef) {
      ctx.fillStyle = '#059669';
      ctx.fillRect(w - 180, 12, 168, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('✓ GOLDEN REFERENCE MODE', w - 172, 27);
    }
    ctx.restore();
  }
}

window.MessiInspectionEngine = MessiInspectionEngine;
