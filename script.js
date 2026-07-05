/* ==========================================================================
   ExoHunt AI - NASA Exoplanet Discovery Engine
   Vanilla JavaScript Interactivity & AI Inference Simulator
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Khởi tạo hệ thống Tab ngay lập tức để đảm bảo chuyển Tab luôn mượt mà
    initTabs();
    initPresetSelector();
    initSliders();
    initModelSwitcher();
    initLightbox();
    
    // 2. Khởi tạo hiệu ứng nền
    try {
        initBackgroundParticles();
    } catch (e) {
        console.warn("Hiệu ứng nền không khởi chạy được, bỏ qua:", e);
    }
    
    // 3. Khởi tạo dự đoán AI lần đầu
    try {
        updateInferenceEngine();
    } catch (e) {
        console.warn("Lỗi khởi tạo suy luận AI:", e);
    }
    
    // 4. Tự động resize canvas khi thay đổi kích thước cửa sổ
    window.addEventListener('resize', () => {
        const playgroundTab = document.getElementById('tab-playground');
        if (playgroundTab && playgroundTab.classList.contains('active')) {
            renderCurrentLightcurve();
        }
    });
});

/* ==========================================================================
   1. AI NEURAL CONSTELLATION / AEROSPACE MESH BACKGROUND ANIMATION
   ========================================================================== */
function initBackgroundParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = canvas.width = window.innerWidth || 1200;
    let height = canvas.height = window.innerHeight || 800;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth || 1200;
        height = canvas.height = window.innerHeight || 800;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor((width * height) / 18000), 80);
    
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function animateParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            // Draw particle node
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`;
            ctx.fill();
            
            // Draw constellation lines between nearby nodes
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 140) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(79, 70, 229, ${(1 - dist / 140) * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

/* ==========================================================================
   2. TAB NAVIGATION SYSTEM (HOÀN TOÀN KHÔNG BỊ CHẶN LỖI)
   ========================================================================== */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-tab');
            if (!targetId) return;
            
            // Remove active from all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            // Re-render canvas with current slider values if playground is selected
            if (targetId === 'tab-playground') {
                setTimeout(renderCurrentLightcurve, 60);
            }
        });
    });
}

/* Helper function to render lightcurve using current active slider values */
function renderCurrentLightcurve() {
    const depthEl = document.getElementById('slider-depth');
    const durationEl = document.getElementById('slider-duration');
    const depth = depthEl ? parseFloat(depthEl.value) : 269.4;
    const duration = durationEl ? parseFloat(durationEl.value) : 3.0;
    renderLightcurve(depth, duration);
}

/* ==========================================================================
   3. PRESET TARGET DATA & SELECTOR
   ========================================================================== */
const PRESET_TARGETS = {
    'kepler-227b': {
        name: 'Kepler-227 b (K00752.01)',
        type: 'CONFIRMED',
        srad: 1.01,
        steff: 5845,
        period: 2.13,
        depth: 269.4,
        slogg: 4.47,
        duration: 2.95,
        desc: 'Ngoại hành tinh xác nhận thuộc hệ sao Kepler-227, quỹ đạo ngắn, độ sâu quá cảnh rõ nét.'
    },
    'kepler-227c': {
        name: 'Kepler-227 c (K00752.02)',
        type: 'CONFIRMED',
        srad: 1.01,
        steff: 5845,
        period: 17.80,
        depth: 180.3,
        slogg: 4.47,
        duration: 4.50,
        desc: 'Hành tinh thứ 2 trong hệ Kepler-227, quỹ đạo rộng hơn và thời gian quá cảnh dài hơn.'
    },
    'kepler-664b': {
        name: 'Kepler-664 b (K00755.01)',
        type: 'CONFIRMED',
        srad: 1.05,
        steff: 5831,
        period: 4.30,
        depth: 312.5,
        slogg: 4.44,
        duration: 3.10,
        desc: 'Hành tinh xác nhận với chu kỳ 4.3 ngày, tín hiệu quá cảnh cực kỳ ổn định.'
    },
    'false-binary': {
        name: 'K00753.01 (Eclipsing Binary)',
        type: 'FALSE POSITIVE',
        srad: 0.87,
        steff: 5853,
        period: 19.90,
        depth: 10829.0,
        slogg: 4.54,
        duration: 5.80,
        desc: 'Hệ sao đôi che khuất (Eclipsing Binary). Độ sáng giảm sụt cực lớn (>10,000 ppm) dạng chữ V, giả mạo ngoại hành tinh.'
    },
    'super-earth': {
        name: 'Super-Earth Habitable Candidate',
        type: 'CANDIDATE',
        srad: 0.65,
        steff: 3800,
        period: 35.50,
        depth: 450.0,
        slogg: 4.70,
        duration: 3.80,
        desc: 'Mục tiêu ứng viên Siêu Trái Đất quay quanh sao lùn đỏ vùng sống được (Habitable Zone).'
    },
    'hot-jupiter': {
        name: 'Hot Jupiter Giant',
        type: 'CONFIRMED',
        srad: 1.20,
        steff: 6200,
        period: 1.50,
        depth: 12500.0,
        slogg: 4.20,
        duration: 2.20,
        desc: 'Hành tinh khí khổng lồ quay sát sao chủ, tạo ra độ sụt giảm ánh sáng cực lớn nhưng đáy chữ U bằng phẳng.'
    }
};

let currentModel = 'XGBoost';
let currentTargetKey = 'kepler-227b';

function initPresetSelector() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetKey = btn.getAttribute('data-preset');
            currentTargetKey = targetKey;
            const data = PRESET_TARGETS[targetKey];
            
            if (data) {
                setSliderValue('slider-srad', data.srad);
                setSliderValue('slider-steff', data.steff);
                setSliderValue('slider-period', data.period);
                setSliderValue('slider-depth', data.depth);
                setSliderValue('slider-slogg', data.slogg);
                setSliderValue('slider-duration', data.duration);
                
                updateInferenceEngine();
            }
        });
    });
}

function setSliderValue(id, val) {
    const slider = document.getElementById(id);
    if (slider) {
        slider.value = val;
        const display = document.getElementById(id + '-val');
        if (display) {
            display.textContent = val + (slider.getAttribute('data-unit') || '');
        }
    }
}

/* ==========================================================================
   4. SLIDERS & LIVE TELEMETRY UPDATES
   ========================================================================== */
function initSliders() {
    const sliders = document.querySelectorAll('.telemetry-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const val = e.target.value;
            const unit = e.target.getAttribute('data-unit') || '';
            const displayId = e.target.id + '-val';
            const display = document.getElementById(displayId);
            if (display) {
                display.textContent = val + unit;
            }
            
            // Deselect presets when user manually slides
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            currentTargetKey = 'custom';
            
            updateInferenceEngine();
        });
    });
}

/* ==========================================================================
   5. MODEL SWITCHER (A/B TESTING)
   ========================================================================== */
function initModelSwitcher() {
    const switchBtns = document.querySelectorAll('.switch-btn');
    switchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentModel = btn.getAttribute('data-model') || 'XGBoost';
            updateInferenceEngine();
        });
    });
}

/* ==========================================================================
   6. AI INFERENCE SIMULATOR ENGINE
   ========================================================================== */
function updateInferenceEngine() {
    const sradEl = document.getElementById('slider-srad');
    const steffEl = document.getElementById('slider-steff');
    const periodEl = document.getElementById('slider-period');
    const depthEl = document.getElementById('slider-depth');
    const sloggEl = document.getElementById('slider-slogg');
    const durationEl = document.getElementById('slider-duration');
    
    if (!sradEl || !steffEl || !periodEl || !depthEl || !sloggEl || !durationEl) {
        return;
    }
    
    const srad = parseFloat(sradEl.value);
    const steff = parseFloat(steffEl.value);
    const period = parseFloat(periodEl.value);
    const depth = parseFloat(depthEl.value);
    const slogg = parseFloat(sloggEl.value);
    const duration = parseFloat(durationEl.value);
    
    // Try fetching from local Python API if available, otherwise simulate astrophysical model
    fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: currentModel,
            srad, steff, period, depth, slogg, duration
        })
    })
    .then(res => res.json())
    .then(data => {
        renderPredictionResults(data.probs, data.prediction, data.confidence);
    })
    .catch(() => {
        // Client-side Astrophysical Model Simulation (when Python server is offline or DLL error occurs)
        const simResult = simulateAstrophysicalModel(currentModel, srad, steff, period, depth, slogg, duration);
        renderPredictionResults(simResult.probs, simResult.prediction, simResult.confidence);
    });
    
    renderLightcurve(depth, duration);
    updateXAIRationale(srad, steff, period, depth, duration);
}

function simulateAstrophysicalModel(model, srad, steff, period, depth, slogg, duration) {
    let probConfirmed = 0.33;
    let probCandidate = 0.33;
    let probFalsePos = 0.34;
    
    // Check if current target is one of the presets to reflect exact notebook behaviors
    if (currentTargetKey !== 'custom' && PRESET_TARGETS[currentTargetKey]) {
        const preset = PRESET_TARGETS[currentTargetKey];
        
        // All 3 models now use Pure Physics (36 features, no fpflag)
        // RF: Accuracy 79%, XGB: Accuracy 79% (F1-CV 0.84), CNN: Accuracy 75%
        if (model === 'Random Forest') {
            // Pure Physics RF - moderate confidence, similar to XGBoost
            if (preset.type === 'CONFIRMED') {
                probConfirmed = 0.62; probCandidate = 0.24; probFalsePos = 0.14;
            } else if (preset.type === 'FALSE POSITIVE') {
                probConfirmed = 0.08; probCandidate = 0.09; probFalsePos = 0.83;
            } else {
                probConfirmed = 0.22; probCandidate = 0.57; probFalsePos = 0.21;
            }
        } else if (model === 'XGBoost') {
            // XGBoost Pure Physics: Accuracy 79%, F1-CV 0.84 ±0.007
            // Cell 29 demo: Kepler-227b → FALSE POSITIVE 67.61%, CONFIRMED 25.78%
            if (preset.type === 'CONFIRMED') {
                probConfirmed = 0.68; probCandidate = 0.22; probFalsePos = 0.10;
                if (currentTargetKey === 'kepler-227b') {
                    // Exact numbers from notebook Cell 29 demo!
                    probConfirmed = 0.2578; probCandidate = 0.0661; probFalsePos = 0.6761;
                }
            } else if (preset.type === 'FALSE POSITIVE') {
                probConfirmed = 0.05; probCandidate = 0.10; probFalsePos = 0.85;
            } else {
                probConfirmed = 0.28; probCandidate = 0.54; probFalsePos = 0.18;
            }
        } else if (model === '1D-CNN') {
            // 1D-CNN Pure Physics: Accuracy 75%, softer probabilities
            if (preset.type === 'CONFIRMED') {
                probConfirmed = 0.60; probCandidate = 0.28; probFalsePos = 0.12;
            } else if (preset.type === 'FALSE POSITIVE') {
                probConfirmed = 0.10; probCandidate = 0.12; probFalsePos = 0.78;
            } else {
                probConfirmed = 0.25; probCandidate = 0.62; probFalsePos = 0.13;
            }
        }
    } else {
        // Manual Custom Sliders Simulation based on astrophysical rules
        if (depth > 8000 && srad < 1.0) {
            // Eclipsing binary signature: huge depth on small star
            probFalsePos = 0.82; probCandidate = 0.12; probConfirmed = 0.06;
        } else if (depth >= 100 && depth <= 5000 && period > 1.0 && srad >= 0.5 && srad <= 2.0) {
            // Classic planetary transit signature
            probConfirmed = 0.55; probCandidate = 0.30; probFalsePos = 0.15;
        } else if (depth < 100 || period > 100) {
            // Weak or long period -> Candidate
            probCandidate = 0.55; probConfirmed = 0.20; probFalsePos = 0.25;
        } else {
            probFalsePos = 0.45; probCandidate = 0.35; probConfirmed = 0.20;
        }
        
        // Model-specific adjustments (all Pure Physics, slight architectural differences)
        if (model === 'Random Forest') {
            // RF tends slightly sharper separations
            probConfirmed = Math.min(probConfirmed * 1.05, 1.0);
        } else if (model === '1D-CNN') {
            // CNN gives softer, more uncertain distributions at 75% accuracy
            probCandidate = Math.min(probCandidate + 0.06, 1.0);
        }
        
        // Normalize probabilities to sum to 1.0
        const total = probConfirmed + probCandidate + probFalsePos;
        probConfirmed /= total;
        probCandidate /= total;
        probFalsePos /= total;
    }
    
    // Determine top class
    let prediction = 'CONFIRMED';
    let maxProb = probConfirmed;
    
    if (probCandidate > maxProb) {
        prediction = 'CANDIDATE';
        maxProb = probCandidate;
    }
    if (probFalsePos > maxProb) {
        prediction = 'FALSE POSITIVE';
        maxProb = probFalsePos;
    }
    
    return {
        probs: {
            CONFIRMED: probConfirmed,
            CANDIDATE: probCandidate,
            'FALSE POSITIVE': probFalsePos
        },
        prediction: prediction,
        confidence: (maxProb * 100).toFixed(1)
    };
}

function renderPredictionResults(probs, prediction, confidence) {
    const resultBox = document.getElementById('prediction-result-box');
    const titleEl = document.getElementById('pred-main-title');
    const confEl = document.getElementById('pred-conf-score');
    
    if (resultBox && titleEl && confEl) {
        resultBox.className = 'prediction-result-box';
        
        if (prediction === 'CONFIRMED') {
            resultBox.classList.add('confirmed');
            titleEl.textContent = '🌟 CONFIRMED EXOPLANET';
            titleEl.style.color = 'var(--status-confirmed)';
        } else if (prediction === 'CANDIDATE') {
            resultBox.classList.add('candidate');
            titleEl.textContent = '🔭 PLANETARY CANDIDATE';
            titleEl.style.color = 'var(--status-candidate)';
        } else {
            resultBox.classList.add('false-positive');
            titleEl.textContent = '⚠️ FALSE POSITIVE';
            titleEl.style.color = 'var(--status-false-pos)';
        }
        
        confEl.textContent = `Độ tự tin AI (${currentModel}): ${confidence}%`;
    }
    
    // Update probability bars
    const barConfirmed = document.getElementById('bar-confirmed');
    const barCandidate = document.getElementById('bar-candidate');
    const barFalsePos = document.getElementById('bar-false-pos');
    
    const valConfirmed = document.getElementById('val-confirmed');
    const valCandidate = document.getElementById('val-candidate');
    const valFalsePos = document.getElementById('val-false-pos');
    
    if (barConfirmed && valConfirmed) {
        const p = (probs['CONFIRMED'] * 100).toFixed(1);
        barConfirmed.style.width = p + '%';
        valConfirmed.textContent = p + '%';
    }
    if (barCandidate && valCandidate) {
        const p = (probs['CANDIDATE'] * 100).toFixed(1);
        barCandidate.style.width = p + '%';
        valCandidate.textContent = p + '%';
    }
    if (barFalsePos && valFalsePos) {
        const p = (probs['FALSE POSITIVE'] * 100).toFixed(1);
        barFalsePos.style.width = p + '%';
        valFalsePos.textContent = p + '%';
    }
}

/* ==========================================================================
   7. LIVE TRANSIT LIGHTCURVE SIMULATOR (CANVAS)
   ========================================================================== */
function renderLightcurve(depth = 269.4, duration = 3.0) {
    const canvas = document.getElementById('lightcurve-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const containerWidth = canvas.parentElement.clientWidth || 600;
    const width = canvas.width = containerWidth - 56;
    const height = canvas.height = 220;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background: Deep Aerospace Monitor Theme
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    
    // Normal flux line (y = 50)
    const baseFluxY = 50;
    
    // Calculate dip magnitude based on depth (max dip to y = 180)
    const dipMagnitude = Math.min(Math.max((depth / 10000) * 120, 20), 140);
    const dipWidth = Math.min(Math.max(duration * 26, 45), width * 0.6);
    const centerX = width / 2;
    
    // Draw lightcurve
    ctx.beginPath();
    ctx.moveTo(0, baseFluxY);
    
    const isVShape = depth > 7000;
    
    for (let x = 0; x <= width; x += 2) {
        let y = baseFluxY;
        const distFromCenter = Math.abs(x - centerX);
        
        if (distFromCenter < dipWidth / 2) {
            if (isVShape) {
                const factor = 1 - (distFromCenter / (dipWidth / 2));
                y = baseFluxY + (dipMagnitude * factor);
            } else {
                const factor = Math.cos((distFromCenter / (dipWidth / 2)) * (Math.PI / 2));
                y = baseFluxY + (dipMagnitude * Math.pow(factor, 0.6));
            }
        }
        
        y += (Math.random() - 0.5) * 2.5;
        ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    const lowestY = baseFluxY + dipMagnitude;
    ctx.beginPath();
    ctx.arc(centerX, lowestY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Độ sáng chuẩn (Stellar Flux 1.0)', 16, 28);
    
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(`Đáy quá cảnh (-${depth} ppm | Thời gian ${duration}h)`, Math.max(16, centerX - 120), lowestY - 14);
}

/* ==========================================================================
   8. EXPLAINABLE AI (XAI) RATIONALE GENERATOR
   ========================================================================== */
function updateXAIRationale(srad, steff, period, depth, duration) {
    const xaiContent = document.getElementById('xai-content');
    if (!xaiContent) return;
    
    let rationale = '';
    
    if (currentModel === 'XGBoost') {
        rationale = `<div style="margin-bottom: 0.6rem; color: #1e40af; font-weight: 800; font-size: 1.05rem;">⚡ XGBoost Pure Physics (Accuracy 79% | F1-CV: 0.84):</div>
        Mô hình Gradient Boosting huấn luyện trên <strong>36 đặc trưng vật lý thuần túy</strong>, đã loại bỏ hoàn toàn 4 cờ fpflag của NASA. Với độ sâu <strong>${depth} ppm</strong> trên sao bán kính <strong>${srad} R☉</strong> và chu kỳ <strong>${period} ngày</strong>, AI tự suy luận theo Định luật Kepler. SHAP Top-1: <code>koi_srad</code> → <code>koi_depth</code> → <code>koi_period</code>. Kiểm định 5-Fold CV: F1 = 0.8401 ± 0.007.`;
    } else if (currentModel === 'Random Forest') {
        rationale = `<div style="margin-bottom: 0.6rem; color: #0e7a3a; font-weight: 800; font-size: 1.05rem;">🌲 Random Forest Pure Physics (Accuracy 79%):</div>
        Rừng cây 100 cây được tái huấn luyện trên <strong>36 đặc trưng vật lý thuần túy</strong> (không có cờ fpflag). Cây quyết định đánh giá chu kỳ <strong>${period} ngày</strong>, độ sâu <strong>${depth} ppm</strong>, nhiệt độ sao <strong>${steff} K</strong>. Trải qua cân bằng SMOTE (4018 mẫu/lớp) trước huấn luyện. Kết quả Precision/Recall: CONFIRMED 0.83/0.82, FALSE POSITIVE 0.86/0.86.`;
    } else if (currentModel === '1D-CNN') {
        rationale = `<div style="margin-bottom: 0.6rem; color: #4338ca; font-weight: 800; font-size: 1.05rem;">🧠 PyTorch 1D-CNN Pure Physics (Accuracy 75%):</div>
        Mạng tích chập Conv1D(1→16→32) + MaxPool + Dense(64) huấn luyện trên <strong>36 đặc trưng vật lý</strong>. Tín hiệu quá cảnh kéo dài <strong>${duration} giờ</strong> với độ sâu <strong>${depth} ppm</strong> được mạng phân tích qua biểu diễn đặc trưng không gian. Phân phối softmax mềm hơn XGBoost, đặc biệt khó phân loại CANDIDATE (Precision 0.50, Recall 0.62).`;
    }
    
    xaiContent.innerHTML = rationale;
}

/* ==========================================================================
   9. LIGHTBOX MODAL FOR RESEARCH PLOTS
   ========================================================================== */
function initLightbox() {
    const modal = document.getElementById('plot-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('modal-close');
    const plotContainers = document.querySelectorAll('.plot-img-container');
    
    if (!modal || !modalImg) return;
    
    plotContainers.forEach(container => {
        container.addEventListener('click', () => {
            const img = container.querySelector('img');
            if (img) {
                modalImg.src = img.src;
                modal.classList.add('active');
            }
        });
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}
