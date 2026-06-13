const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Red Sky — Weather by Text</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --white: #ffffff;
      --white-dim: rgba(255,255,255,0.65);
      --white-faint: rgba(255,255,255,0.25);
      --black: #0a0a0a;
      --overlay: rgba(8,12,20,0.1);
    }
    html { height: -webkit-fill-available; background: var(--black); }
    body { min-height: 100vh; min-height: -webkit-fill-available; color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }
    .bg-wrap { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; z-index: 0; overflow: hidden; }
    .bg-image { position: absolute; top: 0; left: 0; height: 100%; width: auto; min-width: 300%; object-fit: cover; animation: pan 600s linear infinite; filter: saturate(0.85) brightness(0.72); will-change: transform; -webkit-backface-visibility: hidden; backface-visibility: hidden; transform: translateZ(0); -webkit-transform: translateZ(0); }
    @keyframes pan { 0% { transform: translateX(0); } 50% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
    .overlay { position: absolute; inset: 0; background: var(--overlay); }
    .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
    nav { padding: 2rem 3rem; border-bottom: 0.5px solid var(--white-faint); display: flex; align-items: center; }
    .nav-logo { font-family: 'DM Sans', sans-serif; font-weight: 200; font-size: 1.2rem; letter-spacing: 0.25em; text-transform: uppercase; color: #ffffff; }
    .nav-links { margin-left: auto; display: flex; gap: 2rem; }
    .nav-links a { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; letter-spacing: 0.12em; text-transform: uppercase; color: #ffffff; text-decoration: none; font-weight: 300; }
    .nav-links a:hover { color: #ffffff; }
    .hero { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 2.5rem 3rem 1rem 3rem; max-width: 900px; }
    .hero-eyebrow { font-size: 1.1rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ffffff; margin-bottom: 2rem; font-weight: 300; }
    .hero h1 { font-weight: 200; font-size: clamp(3.5rem, 8vw, 7rem); line-height: 1.0; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 2rem; }
    .hero-sub { font-size: 1.2rem; line-height: 1.8; color: #ffffff; max-width: 500px; letter-spacing: 0.01em; font-weight: 300; }
    .signup-section { border-top: 0.5px solid var(--white-faint); padding: 2.5rem 3rem; max-width: 800px; }
    .signup-title { font-size: 1.2rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ffffff; margin-bottom: 2rem; font-weight: 300; }
    .form-row { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .form-input { flex: 1; background: rgba(255,255,255,0.08); border: 0.5px solid var(--white-faint); color: #ffffff; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 300; padding: 0.85rem 1rem; outline: none; transition: border-color 0.3s ease; border-radius: 0; }
    .form-input::placeholder { color: rgba(255,255,255,0.7); }
    .form-input:focus { border-color: #ffffff; }
    .form-submit { background: rgba(255,255,255,0.75); color: #000000; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.85rem 2.5rem; border: none; cursor: pointer; transition: background 0.3s ease; white-space: nowrap; border-radius: 0; min-width: 120px; }
    .form-submit:hover { background: rgba(255,255,255,0.9); }
    .form-submit:disabled { background: rgba(255,255,255,0.25); color: rgba(0,0,0,0.4); cursor: not-allowed; }
    .checkbox-row { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1rem; }
    .checkbox-row input[type="checkbox"] { margin-top: 0.2rem; flex-shrink: 0; width: 18px; height: 18px; accent-color: #ffffff; cursor: pointer; }
    .checkbox-label { font-size: 1.15rem; line-height: 1.7; color: #ffffff; font-weight: 300; }
    .checkbox-label a { color: #ffffff; text-decoration: underline; }
    .policy-block { margin-top: 1.5rem; border-top: 0.5px solid var(--white-faint); padding-top: 1.5rem; }
    .accordion { margin-bottom: 1rem; }
    .accordion-btn { background: none !important; background-color: transparent !important; -webkit-appearance: none; -moz-appearance: none; appearance: none; border: none; padding: 0; margin: 0; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 1.15rem; letter-spacing: 0.12em; text-transform: uppercase; color: #ffffff; font-weight: 300; display: flex; align-items: center; gap: 0.6rem; -webkit-tap-highlight-color: transparent; outline: none; box-shadow: none; border-radius: 0; }
    .accordion-btn:focus { outline: none; background: none !important; box-shadow: none; }
    .accordion-btn:active { background: none !important; }
    .accordion-icon { font-size: 1rem; font-style: normal; line-height: 1; color: #ffffff; font-family: monospace; }
    .accordion-body { margin-top: 0.75rem; margin-bottom: 0.5rem; }
    .policy-text { font-size: 1rem; line-height: 1.8; color: #ffffff; font-weight: 300; }
    .policy-text h3 { font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; font-weight: 400; margin: 1.25rem 0 0.5rem; }
    .policy-text p { margin-bottom: 0.75rem; color: #ffffff; }
    .form-message { font-size: 1rem; font-weight: 300; padding: 0.75rem 1rem; display: none; border-radius: 2px; }
    .form-message.success { color: #ffffff; background: #7a9fcf; display: block; }
    .form-message.error { color: #ffffff; background: #fc8d9a; display: block; }
    .how-section { border-top: 0.5px solid var(--white-faint); padding: 5rem 3rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
    .how-item { display: flex; flex-direction: column; gap: 1rem; }
    .how-num { font-size: 2rem; font-weight: 300; color: #ffffff; line-height: 1; }
    .how-title { font-size: 1rem; letter-spacing: 0.18em; text-transform: uppercase; color: #ffffff; font-weight: 400; }
    .how-desc { font-size: 1.15rem; line-height: 1.75; color: #ffffff; letter-spacing: 0.01em; font-weight: 300; }
    footer { border-top: 0.5px solid var(--white-faint); padding: 2rem 3rem; }
    footer p { font-size: 0.65rem; letter-spacing: 0.08em; color: #ffffff; text-transform: uppercase; font-weight: 300; }
    footer p + p { margin-top: 0.5rem; }
    footer a { color: #ffffff; text-decoration: none; }
    @media (max-width: 768px) {
      nav { padding: 1.5rem; }
      .hero { padding: 3rem 1.5rem 1rem 1.5rem; }
      .signup-section { padding: 2.5rem 1.5rem; }
      .form-row { flex-direction: column; }
      .how-section { grid-template-columns: 1fr; padding: 3rem 1.5rem; }
      footer { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="bg-wrap">
    <img class="bg-image" src="/api/earth" alt="" aria-hidden="true" />
    <canvas id="murmuration" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;"></canvas>
    <div class="overlay"></div>
  </div>
  <div class="page">
    <nav>
      <span class="nav-logo">Red Sky</span>
      <div class="nav-links">
        <a href="/api/privacy">Privacy</a>
        <a href="/api/terms">Terms</a>
      </div>
    </nav>

    <section class="hero">
      <p class="hero-eyebrow">Instant weather &mdash; no app required</p>
      <h1>How's the weather?<br />Text to find out.</h1>
      <p class="hero-sub">Sign up below and get a real forecast sent to your phone in seconds. Just text any city or zip code to get started.</p>
    </section>

    <section class="signup-section">
      <p class="signup-title">Sign up</p>

      <div class="checkbox-row">
        <input type="checkbox" id="terms" onchange="toggleSubmit()" />
        <label class="checkbox-label" for="terms">
          <strong style="font-weight:300;">Required:</strong> I agree to the <a href="/api/terms">Terms of Service</a> and <a href="/api/privacy">Privacy Policy</a>.
        </label>
      </div>

      <div class="checkbox-row">
        <input type="checkbox" id="consent" />
        <label class="checkbox-label" for="consent">
          <strong style="font-weight:300;">Optional:</strong> I would like to receive weather forecast text messages from Red Sky, a service of Studio Emily Weil LLC. This is completely optional and is not required to create an account. If you do not check this box, you will not receive any text messages. Message and data rates may apply. Reply STOP to cancel at any time. Reply HELP for help.
        </label>
      </div>

      <div class="form-row">
        <span style="font-family:'DM Sans',sans-serif; font-size:1.15rem; font-weight:300; color:#ffffff; white-space:nowrap; display:flex; align-items:center;">Phone number</span>
        <input class="form-input" type="tel" id="phone" placeholder="Format: +12125551234 or (212)555-1234" style="min-width:420px; width:100%;" />
        <button class="form-submit" id="submitBtn" disabled onclick="handleSignup()">Submit</button>
      </div>

      <div class="form-message" id="formMessage"></div>

      <div class="policy-block">
        <div class="accordion">
          <button class="accordion-btn" onclick="toggleAccordion('privacy', this)">
            <em class="accordion-icon">+</em> Privacy Policy
          </button>
          <div class="accordion-body" id="body-privacy" style="display:none;">
            <div class="policy-text">
              <p>Last updated: May 2026</p>
              <p>Red Sky is a service of Studio Emily Weil LLC.</p>
              <h3>What We Collect</h3>
              <p>When you sign up or text this service, we collect only your phone number and the location queries you send, solely to provide you with weather forecasts.</p>
              <h3>How We Use Your Data</h3>
              <p>Your phone number and location queries are used only to return weather forecast responses. We do not store, sell, or share your data or mobile number with any third parties.</p>
              <h3>Message Frequency</h3>
              <p>You will receive one message per request you send. This service only sends messages in direct response to your inbound texts.</p>
              <h3>Message and Data Rates</h3>
              <p>Message and data rates may apply. Please check with your mobile carrier for details.</p>
              <h3>Opt Out</h3>
              <p>Reply STOP to any message to unsubscribe at any time. Reply START to resubscribe. Reply HELP for assistance.</p>
            </div>
          </div>
        </div>
        <div class="accordion">
          <button class="accordion-btn" onclick="toggleAccordion('terms', this)">
            <em class="accordion-icon">+</em> Terms and Conditions
          </button>
          <div class="accordion-body" id="body-terms" style="display:none;">
            <div class="policy-text">
              <p>Last updated: May 2026</p>
              <p>Red Sky is a service of Studio Emily Weil LLC.</p>
              <h3>Service Description</h3>
              <p>Red Sky provides automated weather forecasts via SMS in response to user-initiated text messages. To use the service, text a city name or zip code to +1 989 357 8490.</p>
              <h3>Usage</h3>
              <p>This service is provided for personal, non-commercial use. By signing up you agree to receive automated weather forecast responses only if you have opted in to SMS messages.</p>
              <h3>Opt Out</h3>
              <p>Reply STOP at any time to stop receiving messages. Reply START to resume. Reply HELP for assistance. Message and data rates may apply.</p>
              <h3>SMS Consent</h3>
              <p>SMS consent is not a condition of service. You may create an account without opting in to receive text messages.</p>
              <h3>Disclaimer</h3>
              <p>Weather forecasts are provided by OpenWeatherMap for informational purposes only. We are not responsible for any decisions made based on the weather information provided.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="how-section" id="how">
      <div class="how-item">
        <span class="how-num">01</span>
        <span class="how-title">Sign up</span>
        <p class="how-desc">Enter your phone number above and agree to the terms. Check the optional SMS box if you would like to receive forecasts by text.</p>
      </div>
      <div class="how-item">
        <span class="how-num">02</span>
        <span class="how-title">Send a location</span>
        <p class="how-desc">Text any city name or zip code to +1 989 357 8490 from your registered phone to get a forecast.</p>
      </div>
      <div class="how-item">
        <span class="how-num">03</span>
        <span class="how-title">Get your forecast</span>
        <p class="how-desc">Receive a real-time forecast within seconds. Reply STOP at any time to unsubscribe.</p>
      </div>
    </section>

    <footer>
      <p>&copy; 2026 Red Sky, a service of Studio Emily Weil LLC &mdash; Reply STOP to unsubscribe &mdash; Msg &amp; data rates may apply</p>
      <p>SMS consent is not a condition of service. <a href="/api/privacy">Privacy Policy</a> &mdash; <a href="/api/terms">Terms</a></p>
    </footer>
  </div>

  <script>
    function toggleAccordion(id, btn) {
      const body = document.getElementById('body-' + id);
      const icon = btn.querySelector('.accordion-icon');
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      icon.textContent = isOpen ? '+' : '-';
    }

    function toggleSubmit() {
      const terms = document.getElementById('terms');
      const btn = document.getElementById('submitBtn');
      btn.disabled = !terms.checked;
    }

    async function handleSignup() {
      const phone = document.getElementById('phone').value.trim();
      const consent = document.getElementById('consent').checked;
      const msg = document.getElementById('formMessage');
      const btn = document.getElementById('submitBtn');
      if (!phone) {
        msg.className = 'form-message error';
        msg.textContent = 'Please enter your phone number.';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Sending...';
      msg.className = 'form-message';
      msg.textContent = '';
      try {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, consent })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.message === 'subscribed') {
            msg.className = 'form-message success';
            msg.textContent = 'You are subscribed! Text any city name or zip code to +1 989 357 8490 to get your forecast.';
          } else {
            msg.className = 'form-message success';
            msg.textContent = 'You are registered. Check the SMS opt-in box and resubmit to receive weather forecasts by text.';
          }
          document.getElementById('phone').value = '';
          document.getElementById('consent').checked = false;
          document.getElementById('terms').checked = false;
          btn.disabled = true;
        } else {
          throw new Error(data.error || 'Something went wrong.');
        }
      } catch (err) {
        msg.className = 'form-message error';
        msg.textContent = err.message;
        btn.disabled = false;
      }
      btn.textContent = 'Submit';
    }
    // Murmuration simulation
    (function() {
      const canvas = document.getElementById('murmuration');
      const ctx = canvas.getContext('2d');
      const NUM_BIRDS = 300;
      const PERCEPTION = 80;
      const MAX_SPEED = 2.2;
      const MIN_SPEED = 1.2;
      const MAX_FORCE = 0.04;

      let W, H;
      function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      // Flock center wanders slowly
      let flockX = W * 0.5, flockY = H * 0.35;
      let flockVX = 0.3, flockVY = 0.15;

      function updateFlockCenter() {
        flockX += flockVX;
        flockY += flockVY;
        // Bounce within bounds with padding
        if (flockX < W * 0.2 || flockX > W * 0.8) flockVX *= -1;
        if (flockY < H * 0.1 || flockY > H * 0.7) flockVY *= -1;
        // Occasionally add slight drift
        if (Math.random() < 0.005) flockVX += (Math.random() - 0.5) * 0.2;
        if (Math.random() < 0.005) flockVY += (Math.random() - 0.5) * 0.1;
        flockVX = Math.max(-0.6, Math.min(0.6, flockVX));
        flockVY = Math.max(-0.4, Math.min(0.4, flockVY));
      }

      class Bird {
        constructor() {
          this.x = flockX + (Math.random() - 0.5) * 200;
          this.y = flockY + (Math.random() - 0.5) * 100;
          const angle = Math.random() * Math.PI * 2;
          const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.ax = 0;
          this.ay = 0;
        }

        edges() {
          const margin = 60;
          const turn = 0.08;
          if (this.x < margin) this.ax += turn;
          if (this.x > W - margin) this.ax -= turn;
          if (this.y < margin) this.ay += turn;
          if (this.y > H - margin) this.ay -= turn;
        }

        flock(birds) {
          let sepX = 0, sepY = 0, sepCount = 0;
          let aliVX = 0, aliVY = 0, aliCount = 0;
          let cohX = 0, cohY = 0, cohCount = 0;

          for (let other of birds) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < PERCEPTION) {
              // Separation
              if (d < 28) {
                sepX -= dx / (d + 0.01);
                sepY -= dy / (d + 0.01);
                sepCount++;
              }
              // Alignment
              aliVX += other.vx;
              aliVY += other.vy;
              aliCount++;
              // Cohesion
              cohX += other.x;
              cohY += other.y;
              cohCount++;
            }
          }

          if (sepCount > 0) {
            sepX /= sepCount; sepY /= sepCount;
            const sm = Math.sqrt(sepX*sepX+sepY*sepY)||1;
            sepX = (sepX/sm)*MAX_SPEED - this.vx;
            sepY = (sepY/sm)*MAX_SPEED - this.vy;
            const sf = Math.sqrt(sepX*sepX+sepY*sepY)||1;
            if (sf > MAX_FORCE) { sepX=sepX/sf*MAX_FORCE; sepY=sepY/sf*MAX_FORCE; }
            this.ax += sepX * 1.6;
            this.ay += sepY * 1.6;
          }
          if (aliCount > 0) {
            aliVX /= aliCount; aliVY /= aliCount;
            const am = Math.sqrt(aliVX*aliVX+aliVY*aliVY)||1;
            aliVX = (aliVX/am)*MAX_SPEED - this.vx;
            aliVY = (aliVY/am)*MAX_SPEED - this.vy;
            const af = Math.sqrt(aliVX*aliVX+aliVY*aliVY)||1;
            if (af > MAX_FORCE) { aliVX=aliVX/af*MAX_FORCE; aliVY=aliVY/af*MAX_FORCE; }
            this.ax += aliVX * 1.0;
            this.ay += aliVY * 1.0;
          }
          if (cohCount > 0) {
            cohX /= cohCount; cohY /= cohCount;
            let cx = cohX - this.x, cy = cohY - this.y;
            const cm = Math.sqrt(cx*cx+cy*cy)||1;
            cx = (cx/cm)*MAX_SPEED - this.vx;
            cy = (cy/cm)*MAX_SPEED - this.vy;
            const cf = Math.sqrt(cx*cx+cy*cy)||1;
            if (cf > MAX_FORCE) { cx=cx/cf*MAX_FORCE; cy=cy/cf*MAX_FORCE; }
            this.ax += cx * 0.9;
            this.ay += cy * 0.9;
          }
        }

        attract(tx, ty) {
          let dx = tx - this.x, dy = ty - this.y;
          const d = Math.sqrt(dx*dx+dy*dy)||1;
          dx = (dx/d)*MAX_SPEED - this.vx;
          dy = (dy/d)*MAX_SPEED - this.vy;
          const f = Math.sqrt(dx*dx+dy*dy)||1;
          if (f > MAX_FORCE*0.3) { dx=dx/f*MAX_FORCE*0.3; dy=dy/f*MAX_FORCE*0.3; }
          this.ax += dx;
          this.ay += dy;
        }

        update() {
          this.vx += this.ax;
          this.vy += this.ay;
          const speed = Math.sqrt(this.vx*this.vx+this.vy*this.vy)||1;
          if (speed > MAX_SPEED) { this.vx=this.vx/speed*MAX_SPEED; this.vy=this.vy/speed*MAX_SPEED; }
          if (speed < MIN_SPEED) { this.vx=this.vx/speed*MIN_SPEED; this.vy=this.vy/speed*MIN_SPEED; }
          this.x += this.vx;
          this.y += this.vy;
          this.ax = 0;
          this.ay = 0;
        }

        draw() {
          const angle = Math.atan2(this.vy, this.vx);
          const len = 4.5;
          const wing = 1.8;
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(len, 0);
          ctx.lineTo(-len * 0.5, -wing);
          ctx.lineTo(-len * 0.2, 0);
          ctx.lineTo(-len * 0.5, wing);
          ctx.closePath();
          ctx.fillStyle = 'rgba(15,10,8,0.82)';
          ctx.fill();
          ctx.restore();
        }
      }

      const birds = Array.from({length: NUM_BIRDS}, () => new Bird());

      function animate() {
        ctx.clearRect(0, 0, W, H);
        updateFlockCenter();
        for (let b of birds) {
          b.flock(birds);
          b.attract(flockX, flockY);
          b.edges();
          b.update();
          b.draw();
        }
        requestAnimationFrame(animate);
      }
  </script>
</body>
</html>
`;

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
