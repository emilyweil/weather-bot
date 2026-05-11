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
    html { height: -webkit-fill-available; background: var(--black); }
    body { min-height: 100vh; min-height: -webkit-fill-available; color: var(--white); font-family: 'DM Sans', sans-serif; font-weight: 300; overflow-x: hidden; }
    .bg-wrap { position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; z-index: 0; overflow: hidden; }
    .bg-image { position: absolute; top: 0; left: 0; height: 100%; width: auto; min-width: 200%; object-fit: cover; animation: pan 240s linear infinite; filter: saturate(0.85) brightness(0.72); will-change: transform; -webkit-transform: translateZ(0); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    @keyframes pan { 0% { transform: translateX(0); } 50% { transform: translateX(-33%); } 100% { transform: translateX(0); } }
    .overlay { position: absolute; inset: 0; background: var(--overlay); }
    .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
    nav { padding: 2rem 3rem; display: flex; justify-content: flex-end; align-items: center; border-bottom: 0.5px solid var(--white-faint); }
    .hero { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 6rem 3rem; max-width: 900px; }
    .hero-eyebrow { font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--white-dim); margin-bottom: 2rem; font-weight: 300; }
    .hero h1 { font-family: 'DM Sans', sans-serif; font-weight: 200; font-size: clamp(3.5rem, 8vw, 7rem); line-height: 1.0; letter-spacing: -0.02em; color: #ffffff; margin-bottom: 2rem; }
    .hero-sub { font-size: 0.95rem; line-height: 1.8; color: var(--white-dim); max-width: 400px; margin-bottom: 3.5rem; letter-spacing: 0.01em; font-weight: 300; }

    /* Sign up form */
    .signup-section { border-top: 0.5px solid var(--white-faint); padding: 4rem 3rem; max-width: 600px; }
    .signup-title { font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--white-dim); margin-bottom: 2rem; font-weight: 300; }
    .form-row { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .form-input { flex: 1; background: rgba(255,255,255,0.08); border: 0.5px solid var(--white-faint); color: #ffffff; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 300; padding: 0.85rem 1rem; outline: none; transition: border-color 0.3s ease; -webkit-appearance: none; border-radius: 0; }
    .form-input::placeholder { color: var(--white-faint); }
    .form-input:focus { border-color: var(--white-dim); }
    .form-submit { background: #ffffff; color: #0a0a0a; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.85rem 1.75rem; border: none; cursor: pointer; transition: opacity 0.3s ease; white-space: nowrap; border-radius: 0; }
    .form-submit:hover { opacity: 0.85; }
    .form-submit:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Checkbox */
    .checkbox-row { display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1.5rem; }
    .checkbox-row input[type="checkbox"] { margin-top: 0.2rem; flex-shrink: 0; width: 16px; height: 16px; accent-color: #ffffff; cursor: pointer; }
    .checkbox-label { font-size: 0.78rem; line-height: 1.65; color: var(--white-dim); font-weight: 300; }
    .checkbox-label a { color: var(--white-dim); }

    /* Inline policy text */
    .policy-block { margin-top: 1.5rem; border-top: 0.5px solid var(--white-faint); padding-top: 1.5rem; }
    .policy-block details { margin-bottom: 1rem; }
    .policy-block summary { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--white-faint); cursor: pointer; font-weight: 300; margin-bottom: 0.75rem; }
    .policy-block summary:hover { color: var(--white-dim); }
    .policy-text { font-size: 0.75rem; line-height: 1.7; color: var(--white-faint); font-weight: 300; }
    .policy-text h3 { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--white-dim); font-weight: 400; margin: 1rem 0 0.4rem; }
    .policy-text p { margin-bottom: 0.5rem; }

    /* Form messages */
    .form-message { font-size: 0.8rem; font-weight: 300; padding: 0.75rem 0; display: none; }
    .form-message.success { color: #a8f0c6; display: block; }
    .form-message.error { color: #f0a8a8; display: block; }

    /* How it works */
    .how-section { border-top: 0.5px solid var(--white-faint); padding: 5rem 3rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
    .how-item { display: flex; flex-direction: column; gap: 1rem; }
    .how-num { font-family: 'DM Sans', sans-serif; font-size: 2rem; font-weight: 300; color: var(--white-dim); line-height: 1; }
    .how-title { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: #ffffff; font-weight: 400; }
    .how-desc { font-size: 0.85rem; line-height: 1.75; color: var(--white-dim); letter-spacing: 0.01em; font-weight: 300; }
    footer { border-top: 0.5px solid var(--white-faint); padding: 2rem 3rem; }
    footer p { font-size: 0.7rem; letter-spacing: 0.1em; color: var(--white-faint); text-transform: uppercase; font-weight: 300; }
    @media (max-width: 768px) {
      nav { padding: 1.5rem; }
      .hero { padding: 4rem 1.5rem; }
      .signup-section { padding: 3rem 1.5rem; }
      .form-row { flex-direction: column; }
      .how-section { grid-template-columns: 1fr; padding: 3rem 1.5rem; }
      footer { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="bg-wrap">
    <img class="bg-image" src="/api/earth" alt="" aria-hidden="true" />
    <div class="overlay"></div>
  </div>
  <div class="page">
    <nav></nav>

    <section class="hero">
      <p class="hero-eyebrow">Instant weather &mdash; no app required</p>
      <h1>The weather,<br />by text.</h1>
      <p class="hero-sub">Sign up below and get a real forecast sent to your phone in seconds. Just text any city or zip code to get started.</p>
    </section>

    <section class="signup-section">
      <p class="signup-title">Sign up to get started</p>

      <div class="form-row">
        <input class="form-input" type="tel" id="phone" placeholder="Your phone number (e.g. +12125551234)" />
        <button class="form-submit" id="submitBtn" disabled onclick="handleSignup()">Subscribe</button>
      </div>

      <div class="checkbox-row">
        <input type="checkbox" id="consent" onchange="toggleSubmit()" />
        <label class="checkbox-label" for="consent">
          By providing your phone number and checking this box, you agree to receive recurring automated weather forecast text messages from Weatherline at the number provided. Message frequency varies based on your requests. Message and data rates may apply. Reply <strong>STOP</strong> to cancel at any time. Reply <strong>HELP</strong> for help.
        </label>
      </div>

      <div class="form-message" id="formMessage"></div>