export default function handler(req, res) {
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weatherline — Weather by Text</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      :root {
        --white: #ffffff;
        --white-dim: rgba(255, 255, 255, 0.65);
        --white-faint: rgba(255, 255, 255, 0.25);
        --black: #0a0a0a;
        --overlay: rgba(8, 12, 20, 0.48);
      }
      html, body { height: 100%; min-height: -webkit-fill-available; background: var(--black); color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }
      .bg-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; height: -webkit-fill-available; z-index: 0; overflow: hidden; }
.bg-image { position: absolute; top: 0; left: 0; height: 100%; width: auto; min-width: 200%; object-fit: cover; animation: pan 240s linear infinite; filter: saturate(0.85) brightness(0.72); will-change: transform; -webkit-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      @keyframes pan { 0% { transform: translateX(0); } 50% { transform: translateX(-33%); } 100% { transform: translateX(0); } }
      .overlay { position: absolute; inset: 0; background: var(--overlay); }
      .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
      nav { padding: 2rem 3rem; display: flex; justify-content: flex-end; align-items: center; border-bottom: 0.5px solid var(--white-faint); }
      .nav-links { display: flex; gap: 2.5rem; list-style: none; }
      .nav-links a { color: var(--white-dim); text-decoration: none; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 300; transition: color 0.3s ease; }
      .nav-links a:hover { color: var(--white); }
      .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 6rem 3rem; max-width: 900px; }
      .hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--white-dim); margin-bottom: 2rem; font-weight: 300; }
      .hero h1 { font-family: 'DM Sans', sans-serif; font-weight: 200; font-size: clamp(3.5rem, 8vw, 7rem); line-height: 1.0; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 2rem; }
      .hero-sub { font-size: 0.95rem; line-height: 1.8; color: var(--white-dim); max-width: 400px; margin-bottom: 3.5rem; letter-spacing: 0.01em; font-weight: 300; }
      .cta-group { display: flex; flex-direction: column; gap: 0.75rem; }
      .cta-label { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--white); font-weight: 400; }
      .cta-number { font-family: 'DM Sans', sans-serif; font-size: 2.2rem; font-weight: 200; letter-spacing: 0.04em; color: #ffffff; }
      .cta-instruction { font-size: 0.8rem; color: var(--white-dim); letter-spacing: 0.04em; margin-top: 0.25rem; font-weight: 300; }
      .how-section { border-top: 0.5px solid var(--white-faint); padding: 5rem 3rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
      .how-item { display: flex; flex-direction: column; gap: 1rem; }
      .how-num { font-family: 'DM Sans', sans-serif; font-size: 2rem; font-weight: 300; color: var(--white-dim); line-height: 1; }
      .how-title { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: #ffffff; font-weight: 400; }
      .how-desc { font-size: 0.85rem; line-height: 1.75; color: var(--white-dim); letter-spacing: 0.01em; font-weight: 300; }
      footer { border-top: 0.5px solid var(--white-faint); padding: 2rem 3rem; display: flex; justify-content: space-between; align-items: center; }
      footer p { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--white-faint); text-transform: uppercase; font-weight: 300; }
      footer a { color: var(--white-faint); text-decoration: none; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 300; transition: color 0.3s ease; }
      footer a:hover { color: var(--white-dim); }
      @media (max-width: 768px) {
        nav { padding: 1.5rem; }
        .nav-links { display: none; }
        .hero { padding: 4rem 1.5rem; }
        .how-section { grid-template-columns: 1fr; padding: 3rem 1.5rem; }
        footer { flex-direction: column; gap: 1rem; padding: 1.5rem; text-align: center; }
      }
    </style>
  </head>
  <body>
    <div class="bg-wrap">
      <img class="bg-image" src="/api/earth" alt="" aria-hidden="true" />
      <div class="overlay"></div>
    </div>
    <div class="page">
      <nav>
        <ul class="nav-links">
          <li><a href="#how">How it works</a></li>
          <li><a href="/api/privacy">Privacy</a></li>
          <li><a href="/api/terms">Terms</a></li>
        </ul>
      </nav>
      <section class="hero">
        <p class="hero-eyebrow">Instant weather &mdash; no app required</p>
        <h1>The weather,<br />by text</h1>
        <p class="hero-sub">Send any city or zip code to the number below. Get a real forecast back in seconds. Nothing to download. Nothing to sign up for.</p>
        <div class="cta-group">
          <span class="cta-label">Text any city to</span>
          <span class="cta-number">+1 989 357 8490</span>
          <span class="cta-instruction">Try sending &ldquo;New York&rdquo; or &ldquo;10001&rdquo;</span>
        </div>
      </section>
      <section class="how-section" id="how">
        <div class="how-item">
          <span class="how-num">01</span>
          <span class="how-title">Send a location</span>
          <p class="how-desc">Text any city name, zip code, or location to +1 989 357 8490 from any phone. No app. No account.</p>
        </div>
        <div class="how-item">
          <span class="how-num">02</span>
          <span class="how-title">Get your forecast</span>
          <p class="how-desc">Receive a 3-period forecast with temperature and conditions within seconds, powered by live weather data.</p>
        </div>
        <div class="how-item">
          <span class="how-num">03</span>
          <span class="how-title">That&rsquo;s it</span>
          <p class="how-desc">Text anytime you need it. No notifications. No subscription. Just the weather when you want it.</p>
        </div>
      </section>
      <footer>
        <div style="display:flex; gap: 2rem;">
          <a href="/api/privacy">Privacy</a>
          <a href="/api/terms">Terms</a>
        </div>
      </footer>
    </div>
  </body>
  </html>
    `);
  }