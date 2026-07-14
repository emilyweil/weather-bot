const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>Red Sky — Weather by Text</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
  <link rel="preload" as="image" href="/api/earth" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --white: #ffffff;
      --white-dim: rgba(255,255,255,0.65);
      --white-faint: rgba(255,255,255,0.25);
      --black: #0a0a0a;
      --overlay: rgba(8,12,20,0.1);
    }
    html { height: -webkit-fill-available; background: #ffffff; }
    body { min-height: 100vh; min-height: -webkit-fill-available; background: #ffffff; color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; visibility: hidden; }
    body.loaded { visibility: visible; }
    .bg-wrap { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; z-index: 0; overflow: hidden; }
    .bg-image { position: absolute; top: 0; left: 0; height: 100%; width: auto; min-width: 400%; object-fit: cover; animation: pan 600s linear infinite; filter: saturate(0.85) brightness(0.72); will-change: transform; -webkit-backface-visibility: hidden; backface-visibility: hidden; transform: translateZ(0); -webkit-transform: translateZ(0); }
    @keyframes pan { 0% { transform: translateX(0); } 50% { transform: translateX(-25%); } 100% { transform: translateX(0); } }
    .overlay { position: absolute; inset: 0; background: var(--overlay); }
    .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
    nav { padding: 2rem 3rem; border-bottom: 0.5px solid var(--white-faint); display: flex; align-items: center; }
    .nav-logo { font-family: 'DM Sans', sans-serif; font-weight: 200; font-size: 1.2rem; letter-spacing: 0.25em; text-transform: uppercase; color: #ffffff; }
    .nav-links { margin-left: auto; display: flex; gap: 2rem; }
    .nav-links a { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; letter-spacing: 0.12em; text-transform: uppercase; color: #ffffff; text-decoration: none; font-weight: 300; }
    .nav-links a:hover { color: #ffffff; }
    .hero { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 2.5rem 3rem 1rem 3rem; max-width: 900px; }
    .hero-eyebrow { font-size: 1.1rem; letter-spacing: 0.22em; text-transform: uppercase; color: #ffffff; margin-bottom: 2rem; font-weight: 300; }
    .hero h1 { font-weight: 200; font-size: clamp(2.8rem, 8vw, 7rem); line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 2rem; }
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
    .how-desc span, .how-desc a { color: #ffffff !important; -webkit-text-fill-color: #ffffff; text-decoration: none; }
    .policy-text span { color: #ffffff !important; -webkit-text-fill-color: #ffffff; }
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
    <img class="bg-image" src="/api/earth" alt="" aria-hidden="true" onload="document.body.classList.add('loaded')" />
    <div class="overlay"></div>
  </div>
  <div class="page">
    <nav>
      <span class="nav-logo">Red Sky</span>
    </nav>

    <section class="hero">
      <p class="hero-eyebrow">Instant weather &mdash; no app required</p>
      <h1>How's the weather?<br />Text to find out.</h1>
      <p class="hero-sub">Sign up below, then text any city or zip code to get a free weather forecast sent to your phone.</p>
    </section>

    <section class="signup-section">
      <p class="signup-title">Sign up</p>

      <div class="checkbox-row">
        <input type="checkbox" id="combined" onchange="toggleSubmit()" />
        <label class="checkbox-label" for="combined">
          I agree to the <a href="/api/terms">Terms of Service</a> and <a href="/api/privacy">Privacy Policy</a>, and would like to receive weather forecast text messages when I text any city or zip code to Red Sky. Message and data rates may apply.
        </label>
      </div>

      <div class="form-row">
        <span style="font-family:'DM Sans',sans-serif; font-size:1.15rem; font-weight:300; color:#ffffff; white-space:nowrap; display:flex; align-items:center;">Your phone number:</span>
        <input class="form-input" type="tel" id="phone" placeholder="Format: +12125551234 or (212) 555-1234" style="min-width:420px; width:100%;" />
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
              <p>Last updated: July 1, 2026</p>
              <p>Red Sky is a service of Studio Emily Weil LLC.</p>
              <h3>What We Collect</h3>
              <p>When you sign up or text this service, we collect only your phone number and the location queries you send, solely to provide you with weather forecasts.</p>
              <h3>How We Use Your Data</h3>
              <p>Your phone number and location queries are used only to return weather forecast responses. We do not store, sell, or share your data or mobile number with any third parties.</p>
              <h3>Message Frequency</h3>
              <p>You will receive one message per request you send. This service only sends messages in direct response to your texts.</p>
              <h3>Message and Data Rates</h3>
              <p>Message and data rates may apply.</p>
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
              <p>Last updated: July 1, 2026</p>
              <p>Red Sky is a service of Studio Emily Weil LLC.</p>
              <h3>Service Description</h3>
              <p>Red Sky provides free automated weather forecasts via SMS in response to user-initiated text messages. To use the service, text a city name or zip code to <a href="tel:+19893578490" style="color:#ffffff !important; -webkit-text-fill-color:#ffffff; text-decoration:none;">(989) 357-8490</a>.</p>
              <h3>Usage</h3>
              <p>This service is provided for personal, non-commercial use. By signing up you agree to receive automated weather forecast responses only if you have opted in to SMS messages.</p>
              <h3>Opt Out</h3>
              <p>Reply STOP at any time to stop receiving messages. Reply START to resume. Reply HELP for assistance. Message and data rates may apply.</p>
              <h3>SMS Consent</h3>
              <p>SMS consent is not a condition of service. You may create an account without opting in to receive text messages.</p>
              <h3>Disclaimer</h3>
              <p>Weather forecasts are provided for informational purposes only. We are not responsible for any decisions made based on the weather information provided.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="how-section" id="how">
      <div class="how-item" style="grid-column: 1 / -1; margin-bottom: 1rem;">
        <span style="font-size:1.2rem; letter-spacing:0.22em; text-transform:uppercase; color:#ffffff; font-weight:300; font-family:'DM Sans',sans-serif;">How it works</span>
      </div>
      <div class="how-item">
        <span class="how-num">01</span>
        <span class="how-title">Sign up</span>
        <p class="how-desc">Enter your phone number above and agree to the terms.</p>
      </div>
      <div class="how-item">
        <span class="how-num">02</span>
        <span class="how-title">Send a location</span>
        <p class="how-desc">Text any city name or zip code to <a href="tel:+19893578490" style="color:#ffffff !important; -webkit-text-fill-color:#ffffff; text-decoration:none;">(989) 357-8490</a> from your registered phone to get a forecast.</p>
      </div>
      <div class="how-item">
        <span class="how-num">03</span>
        <span class="how-title">Get your forecast</span>
        <p class="how-desc">Receive a real-time forecast within seconds. Reply STOP to cancel at any time. HELP for help.</p>
      </div>
    </section>

    <footer>
      <p>&copy; 2026 Red Sky, a service of Studio Emily Weil LLC</p>
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

    // Safety fallback: if image is already cached, onload may not fire
    (function() {
      const bgImg = document.querySelector('.bg-image');
      if (bgImg && bgImg.complete) {
        document.body.classList.add('loaded');
      }
      // Absolute fallback in case something goes wrong
      setTimeout(function() {
        document.body.classList.add('loaded');
      }, 2000);
    })();

    function toggleSubmit() {
      const combined = document.getElementById('combined');
      const btn = document.getElementById('submitBtn');
      btn.disabled = !combined.checked;
    }

    async function handleSignup() {
      const phone = document.getElementById('phone').value.trim();
      const consent = document.getElementById('combined').checked;
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
          msg.className = 'form-message success';
          msg.textContent = 'You are subscribed! Text any city name or zip code to (989) 357-8490 to get your forecast.';
          document.getElementById('phone').value = '';
          document.getElementById('combined').checked = false;
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
  </script>
</body>
</html>
`;

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
