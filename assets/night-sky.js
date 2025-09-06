(() => {
      const canvas = document.getElementById('sky');
      const ctx = canvas.getContext('2d');

      const CFG = {
        baseCount: 270,          // star count for ~1600x900; scales with area
        connectDist: 110,        // px: proximity lines (faint web)
        constellateDist: 160,    // px: max distance for "locked" constellation links
        constellations: 18,      // how many locked constellation links
        gatherRadius: 120,       // px: radius of attraction
        gatherBlend: 0.18,       // how strongly position seeks the cursor when inside radius (higher = tighter gather)
        gatherStrength: 0.28,    // extra acceleration toward cursor (helps snappy pull without oscillation)
        maxSpeed: 1.6,           // px/frame: clamp star velocity
        damping: 0.92,           // velocity damping (higher = less jitter)
        returnSpring: 0.005,     // pull back to home (lower to reduce “shake”)
        starSize: [1.1, 2.2],    // base size range (will be scaled by DPR)
        twinkleSpeed: 0.012,     // phase speed
        bgTop: '#141824',        // night sky gradient
        bgBottom: '#0a0f1f'
      };

      const dpr = () => window.devicePixelRatio || 1;
      let W = 0, H = 0, stars = [], edges = [];
      const mouse = { x: null, y: null, active: false };

      function resize() {
        const ratio = dpr();
        const { innerWidth: iw, innerHeight: ih } = window;
        canvas.width = Math.floor(iw * ratio);
        canvas.height = Math.floor(ih * ratio);
        canvas.style.width = iw + 'px';
        canvas.style.height = ih + 'px';
        W = canvas.width;
        H = canvas.height;

        // Scale star count by area
        const baseArea = 1600 * 900;
        const area = iw * ih;
        const target = Math.round(CFG.baseCount * (area / baseArea));
        if (!stars.length) {
          stars = createStars(target);
        } else if (stars.length < target) {
          stars.push(...createStars(target - stars.length));
        } else if (stars.length > target) {
          stars.length = target;
        }

        buildConstellations();
      }

      function rand(a, b) { return a + Math.random() * (b - a); }
      function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

      function createStars(n) {
        const r = dpr();
        const arr = [];
        for (let i = 0; i < n; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          arr.push({
            x, y,
            ox: x, oy: y, // home
            vx: rand(-0.2, 0.2) * r,
            vy: rand(-0.2, 0.2) * r,
            r: rand(CFG.starSize[0], CFG.starSize[1]) * r,
            phase: Math.random() * Math.PI * 2
          });
        }
        return arr;
      }

      function buildConstellations() {
        // Build a sparse set of “locked” edges between near neighbors (no heavy triangulation).
        edges = [];
        const maxD2 = (CFG.constellateDist * dpr()) ** 2;
        // Simple KNN-ish: for each star, link to its single nearest within maxD2
        for (let i = 0; i < stars.length; i++) {
          let bestJ = -1, bestD2 = Infinity;
          const a = stars[i];
          for (let j = 0; j < stars.length; j++) {
            if (j === i) continue;
            const b = stars[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < bestD2 && d2 < maxD2) { bestD2 = d2; bestJ = j; }
          }
          if (bestJ !== -1) edges.push([i, bestJ, bestD2]);
        }
        // Randomly sample a subset to keep the scene airy
        edges.sort((e1, e2) => e1[2] - e2[2]); // prefer shorter edges
        edges = edges.slice(0, CFG.constellations);
      }

      function drawBackground() {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, CFG.bgTop);
        g.addColorStop(1, CFG.bgBottom);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      function seekGather(s) {
        if (!mouse.active) return;
        const r = dpr();
        const gx = mouse.x, gy = mouse.y;
        const dx = gx - s.x, dy = gy - s.y;
        const r2 = (CFG.gatherRadius * r) ** 2;
        const d2 = dx*dx + dy*dy;
        if (d2 > r2) return;

        // Blend the position slightly toward the cursor to kill oscillation
        const w = 1 - (d2 / r2);        // 0..1 weight (stronger when closer)
        s.x += dx * (CFG.gatherBlend * (0.5 + 0.5 * w));
        s.y += dy * (CFG.gatherBlend * (0.5 + 0.5 * w));

        // Add a small acceleration toward cursor for responsiveness
        const invD = 1 / (Math.sqrt(d2) + 1e-6);
        s.vx += dx * invD * (CFG.gatherStrength * 0.6);
        s.vy += dy * invD * (CFG.gatherStrength * 0.6);
      }

      function springHome(s) {
        const hx = s.ox - s.x;
        const hy = s.oy - s.y;
        s.vx += hx * CFG.returnSpring;
        s.vy += hy * CFG.returnSpring;
      }

      function capVelocity(s, maxV) {
        const v2 = s.vx*s.vx + s.vy*s.vy;
        const m2 = maxV*maxV;
        if (v2 > m2) {
          const f = maxV / Math.sqrt(v2);
          s.vx *= f; s.vy *= f;
        }
      }

      function drawFourProngedStar(x, y, baseR, alpha, phase) {
        // Twinkle scale (slight)
        const tw = 0.9 + 0.3 * (Math.sin(phase) * 0.5 + 0.5);
        const r = baseR * tw;
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        glow.addColorStop(0, `rgba(230,240,255, ${0.18 * alpha})`);
        glow.addColorStop(1, `rgba(230,240,255, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(245,250,255, ${0.95 * alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // 4 prongs (N, E, S, W) as soft lines
        ctx.save();
        ctx.translate(x, y);
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1, r * 0.3);

        const arm = r * 3.2;
        const fade = (t) => `rgba(200,220,255, ${alpha * t})`;

        // Vertical
        const gradV = ctx.createLinearGradient(0, -arm, 0, arm);
        gradV.addColorStop(0, fade(0));
        gradV.addColorStop(0.45, fade(0.8));
        gradV.addColorStop(0.55, fade(0.8));
        gradV.addColorStop(1, fade(0));
        ctx.strokeStyle = gradV;
        ctx.beginPath();
        ctx.moveTo(0, -arm);
        ctx.lineTo(0, arm);
        ctx.stroke();

        // Horizontal
        const gradH = ctx.createLinearGradient(-arm, 0, arm, 0);
        gradH.addColorStop(0, fade(0));
        gradH.addColorStop(0.45, fade(0.8));
        gradH.addColorStop(0.55, fade(0.8));
        gradH.addColorStop(1, fade(0));
        ctx.strokeStyle = gradH;
        ctx.beginPath();
        ctx.moveTo(-arm, 0);
        ctx.lineTo(arm, 0);
        ctx.stroke();

        ctx.restore();
      }

      function draw() {
        drawBackground();
		drawMoon();

        const r = dpr();
        const prox2 = (CFG.connectDist * r) ** 2;

        // Faint proximity web
        ctx.lineWidth = 1 * r;
        for (let i = 0; i < stars.length; i++) {
          const a = stars[i];
          for (let j = i + 1; j < stars.length; j++) {
            const b = stars[j];
            const dx = a.x - b.x, dy = a.y - b.y, d2 = dx*dx + dy*dy;
            if (d2 < prox2) {
              const alpha = 0.14 * (1 - d2 / prox2);
              ctx.strokeStyle = `rgba(170,190,255, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // Brighter “constellation” edges (locked)
        ctx.lineWidth = 1.6 * r;
        for (const [i, j, d2] of edges) {
          const a = stars[i], b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const alpha = 0.35 * clamp(1 - dist / Math.sqrt(d2 + 1e-6), 0, 1) + 0.15;
          ctx.strokeStyle = `rgba(200,215,255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // Stars on top
        for (const s of stars) {
          const nearMouse = mouse.active ? Math.hypot((mouse.x - s.x), (mouse.y - s.y)) < CFG.gatherRadius * r : false;
          const baseAlpha = nearMouse ? 1.0 : 0.85;
          drawFourProngedStar(s.x, s.y, s.r, baseAlpha, s.phase);
        }
      }
	  
          let moonEnabled = true;   // القمر ظاهر/مشتغل
          let moonNewPhase = false; // حالة المحاق
          let moonDarkness = 0.7;      // 1 = طبيعي، <1 = أفتح، >1 = أغمق

          const moon = {
            img: new Image(),
            newMoonImg: new Image(),   // صورة المحاق
            sizeFactor: 0.25,   // نسبة حجم القمر من الشاشة
            xFactor: 0.92,       // موقعه أفقياً (80% يمين)
            yFactor: 0.17,      // موقعه رأسياً (25% أعلى)
            repelRadius: 170,   // نصف قطر الهروب بالبيكسل
            repelStrength: 0.9  // قوة الهروب
          };

          const scriptSrc = document.currentScript ? document.currentScript.src : '';
          const assetBase = scriptSrc.slice(0, scriptSrc.lastIndexOf('/') + 1);
          moon.img.src = assetBase + 'moon.png';        // القمر الكامل
          moon.newMoonImg.src = assetBase + 'new-moon.png'; // صورة المحاق
		
	  function drawMoon() {
  if (!moonEnabled) return;

  const moonSize = Math.min(W, H) * moon.sizeFactor;
  const x = W * moon.xFactor;
  const y = H * moon.yFactor;

  if (moonNewPhase) {
    // محاق: نعرض صورة new-moon.png
    ctx.save();
    ctx.globalAlpha = moonDarkness; // درجة التظليم
    ctx.drawImage(moon.newMoonImg, x - moonSize/2, y - moonSize/2, moonSize, moonSize);
    ctx.restore();
  } else {
    // بدر: قمر مضيء مع توهج
    const glow = ctx.createRadialGradient(x, y, moonSize * 0.3, x, y, moonSize * 0.7);
    glow.addColorStop(0, "rgba(255,255,230,0.25)");
    glow.addColorStop(1, "rgba(255,255,230,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, moonSize * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = moonDarkness; // ينطبق التظليم حتى على البدر
    ctx.drawImage(moon.img, x - moonSize/2, y - moonSize/2, moonSize, moonSize);
    ctx.restore();
  }
}





      function step() {
        // Physics
        for (const s of stars) {
          // Cursor gather (no wobble approach)
          seekGather(s);

          // Gentle home spring & damping
          springHome(s);
          s.vx *= CFG.damping;
          s.vy *= CFG.damping;
		  
		  // Repel from moon
		  if (moonEnabled) {
           const moonSize = Math.min(W, H) * moon.sizeFactor;
           const mx = W * moon.xFactor;
           const my = H * moon.yFactor;
           const dx = s.x - mx;
           const dy = s.y - my;
           const dist2 = dx*dx + dy*dy;
           const repelR2 = (moon.repelRadius * dpr() + moonSize/2)**2;

		  if (dist2 < repelR2) {
		   const dist = Math.sqrt(dist2) + 0.001;
		   const force = moon.repelStrength * (1 - dist2 / repelR2);
		  s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
		  }
		}

          // Integrate & cap speed
          s.x += s.vx;
          s.y += s.vy;
          capVelocity(s, CFG.maxSpeed * dpr());

          // Soft wrap
          const margin = 60;
          if (s.x < -margin) s.x = W + margin;
          if (s.x > W + margin) s.x = -margin;
          if (s.y < -margin) s.y = H + margin;
          if (s.y > H + margin) s.y = -margin;

          // Twinkle
          s.phase += CFG.twinkleSpeed;
        }

        // Render
        ctx.clearRect(0, 0, W, H);
        draw();

        requestAnimationFrame(step);
      }

      // Input
      function toCanvas(e) {
        const rect = canvas.getBoundingClientRect();
        const ratio = dpr();
        return { x: (e.clientX - rect.left) * ratio, y: (e.clientY - rect.top) * ratio };
      }
      window.addEventListener('mousemove', (e) => {
        const p = toCanvas(e);
        mouse.x = p.x; mouse.y = p.y; mouse.active = true;
      }, { passive: true });
      window.addEventListener('mouseleave', () => { mouse.active = false; });
      window.addEventListener('touchmove', (e) => {
        const t = e.touches[0]; if (!t) return;
        const rect = canvas.getBoundingClientRect();
        const ratio = dpr();
        mouse.x = (t.clientX - rect.left) * ratio;
        mouse.y = (t.clientY - rect.top) * ratio;
        mouse.active = true;
      }, { passive: true });
      window.addEventListener('touchend', () => { mouse.active = false; });

      window.addEventListener('resize', resize);
      resize();
      step();
	  
      // Listen on window so clicks register even though the canvas ignores pointer events
      window.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;

        const mouseX = (e.clientX - rect.left) * ratio;
        const mouseY = (e.clientY - rect.top) * ratio;

        const moonSize = Math.min(W, H) * moon.sizeFactor;
        const mx = W * moon.xFactor;
        const my = H * moon.yFactor;

        const dx = mouseX - mx;
        const dy = mouseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < moonSize / 2) {
          moonNewPhase = !moonNewPhase;
        }
      });






    })();
	

