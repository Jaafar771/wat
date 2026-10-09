document.addEventListener("DOMContentLoaded", () => {
  const CONSENT_KEY = "wat_mariahilf_cookie_consent";

  // Bereits gespeicherte Auswahl?
  const savedConsent = localStorage.getItem(CONSENT_KEY);

  // Wenn bereits entschieden wurde, nichts anzeigen
  if (savedConsent) {
    return;
  }

  // =========================
  // CSS
  // =========================

  const style = document.createElement("style");

  style.textContent = `
    .cookie-banner {
      position: fixed;
      left: 24px;
      right: 24px;
      bottom: 24px;
      z-index: 99999;

      background: rgba(9, 13, 22, 0.97);
      border: 1px solid rgba(255, 0, 85, 0.35);
      border-radius: 20px;

      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.45),
        0 0 35px rgba(255, 0, 85, 0.08);

      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);

      color: #ffffff;
      font-family: inherit;

      padding: 22px 24px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;

      animation: cookieSlideUp 0.45s ease;
    }

    @keyframes cookieSlideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cookie-content {
      flex: 1;
      min-width: 0;
    }

    .cookie-title {
      display: flex;
      align-items: center;
      gap: 10px;

      margin-bottom: 7px;

      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .cookie-icon {
      width: 32px;
      height: 32px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;

      background: #ff0055;
      color: #ffffff;

      font-size: 16px;

      box-shadow: 0 0 18px rgba(255, 0, 85, 0.25);
    }

    .cookie-text {
      margin: 0;
      max-width: 850px;

      color: #b9c0d0;

      font-size: 0.88rem;
      line-height: 1.55;
    }

    .cookie-text a {
      color: #ffffff;
      text-decoration: underline;
      text-decoration-color: #ff0055;
      text-underline-offset: 3px;
    }

    .cookie-text a:hover {
      color: #ff0055;
    }

    .cookie-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      flex-shrink: 0;
    }

    .cookie-btn {
      border: none;
      border-radius: 12px;

      padding: 12px 17px;

      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;

      cursor: pointer;

      transition:
        transform 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .cookie-btn:hover {
      transform: translateY(-2px);
    }

    .cookie-btn-necessary {
      background: transparent;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .cookie-btn-necessary:hover {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.05);
    }

    .cookie-btn-settings {
      background: rgba(255, 255, 255, 0.07);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .cookie-btn-settings:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .cookie-btn-accept {
      background: #ff0055;
      color: #ffffff;

      box-shadow:
        0 8px 22px rgba(255, 0, 85, 0.25);
    }

    .cookie-btn-accept:hover {
      background: #ff1766;

      box-shadow:
        0 10px 28px rgba(255, 0, 85, 0.35);
    }

    /* =========================
       Einstellungen
       ========================= */

    .cookie-settings {
      display: none;

      position: fixed;
      inset: 0;
      z-index: 100000;

      background: rgba(0, 0, 0, 0.65);

      align-items: center;
      justify-content: center;

      padding: 20px;

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .cookie-settings.active {
      display: flex;
    }

    .cookie-settings-box {
      width: 100%;
      max-width: 560px;

      background: #0b101b;

      border: 1px solid rgba(255, 0, 85, 0.3);
      border-radius: 22px;

      padding: 28px;

      color: #ffffff;

      box-shadow:
        0 30px 90px rgba(0, 0, 0, 0.55);

      animation: cookieModalIn 0.25s ease;
    }

    @keyframes cookieModalIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(10px);
      }

      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .cookie-settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 22px;
    }

    .cookie-settings-title {
      margin: 0;

      font-size: 1.35rem;
      font-weight: 800;
    }

    .cookie-close {
      width: 36px;
      height: 36px;

      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;

      background: rgba(255,255,255,0.05);
      color: #ffffff;

      font-size: 20px;

      cursor: pointer;
    }

    .cookie-close:hover {
      background: rgba(255,255,255,0.1);
    }

    .cookie-category {
      padding: 16px 0;

      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .cookie-category:first-of-type {
      border-top: none;
    }

    .cookie-category-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .cookie-category-name {
      font-weight: 700;
      font-size: 0.95rem;
    }

    .cookie-category-description {
      margin: 6px 0 0;

      color: #9299aa;

      font-size: 0.82rem;
      line-height: 1.5;
    }

    .cookie-required {
      color: #ff0055;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .cookie-switch {
      position: relative;

      width: 46px;
      height: 26px;

      flex-shrink: 0;
    }

    .cookie-switch input {
      display: none;
    }

    .cookie-slider {
      position: absolute;
      inset: 0;

      border-radius: 50px;

      background: #2b3140;

      cursor: pointer;

      transition: 0.2s;
    }

    .cookie-slider::before {
      content: "";

      position: absolute;

      width: 20px;
      height: 20px;

      left: 3px;
      top: 3px;

      border-radius: 50%;

      background: #ffffff;

      transition: 0.2s;
    }

    .cookie-switch input:checked + .cookie-slider {
      background: #ff0055;
    }

    .cookie-switch input:checked + .cookie-slider::before {
      transform: translateX(20px);
    }

    .cookie-switch input:disabled + .cookie-slider {
      opacity: 0.65;
      cursor: default;
    }

    .cookie-settings-footer {
      display: flex;
      justify-content: flex-end;

      margin-top: 22px;
    }

    /* =========================
       Mobile
       ========================= */

    @media (max-width: 760px) {

      .cookie-banner {
        left: 12px;
        right: 12px;
        bottom: 12px;

        padding: 18px;

        border-radius: 18px;

        display: block;
      }

      .cookie-title {
        font-size: 0.98rem;
      }

      .cookie-text {
        font-size: 0.82rem;
        line-height: 1.5;
      }

      .cookie-actions {
        display: grid;

        grid-template-columns: 1fr 1fr;

        margin-top: 16px;

        gap: 8px;
      }

      .cookie-btn {
        width: 100%;

        padding: 11px 10px;

        font-size: 0.78rem;
      }

      .cookie-btn-accept {
        grid-column: 1 / -1;
        order: -1;
      }

      .cookie-settings {
        padding: 12px;
      }

      .cookie-settings-box {
        padding: 22px;

        max-height: 90vh;
        overflow-y: auto;

        border-radius: 18px;
      }

      .cookie-settings-title {
        font-size: 1.15rem;
      }
    }
  `;

  document.head.appendChild(style);

  // =========================
  // Banner HTML
  // =========================

  const banner = document.createElement("div");

  banner.className = "cookie-banner";

  banner.innerHTML = `
    <div class="cookie-content">

      <div class="cookie-title">
        <span class="cookie-icon">🍪</span>
        <span>Cookies & Datenschutz</span>
      </div>

      <p class="cookie-text">
        Wir verwenden notwendige Technologien, damit unsere Website
        funktioniert. Optionale Technologien verwenden wir nur mit deiner
        Zustimmung.
        <a href="datenschutz.html">Datenschutzerklärung</a>
      </p>

    </div>

    <div class="cookie-actions">

      <button
        type="button"
        class="cookie-btn cookie-btn-necessary"
        id="cookieNecessary">
        Nur notwendige
      </button>

      <button
        type="button"
        class="cookie-btn cookie-btn-settings"
        id="cookieSettings">
        Einstellungen
      </button>

      <button
        type="button"
        class="cookie-btn cookie-btn-accept"
        id="cookieAccept">
        Alle akzeptieren
      </button>

    </div>
  `;

  document.body.appendChild(banner);

  // =========================
  // Einstellungen Modal
  // =========================

  const settingsModal = document.createElement("div");

  settingsModal.className = "cookie-settings";

  settingsModal.innerHTML = `
    <div class="cookie-settings-box">

      <div class="cookie-settings-header">

        <h2 class="cookie-settings-title">
          Cookie-Einstellungen
        </h2>

        <button
          type="button"
          class="cookie-close"
          id="cookieClose"
          aria-label="Schließen">
          ×
        </button>

      </div>

      <div class="cookie-category">

        <div class="cookie-category-row">

          <div>
            <div class="cookie-category-name">
              Notwendig
              <span class="cookie-required">IMMER AKTIV</span>
            </div>

            <p class="cookie-category-description">
              Diese Technologien sind für grundlegende Funktionen
              der Website erforderlich.
            </p>
          </div>

          <label class="cookie-switch">
            <input
              type="checkbox"
              checked
              disabled>
            <span class="cookie-slider"></span>
          </label>

        </div>

      </div>

      <div class="cookie-category">

        <div class="cookie-category-row">

          <div>
            <div class="cookie-category-name">
              Statistik
            </div>

            <p class="cookie-category-description">
              Hilft uns zu verstehen, wie Besucher die Website nutzen.
              Wird aktuell nicht eingesetzt.
            </p>
          </div>

          <label class="cookie-switch">
            <input
              type="checkbox"
              id="cookieStatistics">
            <span class="cookie-slider"></span>
          </label>

        </div>

      </div>

      <div class="cookie-category">

        <div class="cookie-category-row">

          <div>
            <div class="cookie-category-name">
              Marketing
            </div>

            <p class="cookie-category-description">
              Technologien für personalisierte Inhalte und Werbung.
              Wird aktuell nicht eingesetzt.
            </p>
          </div>

          <label class="cookie-switch">
            <input
              type="checkbox"
              id="cookieMarketing">
            <span class="cookie-slider"></span>
          </label>

        </div>

      </div>

      <div class="cookie-settings-footer">

        <button
          type="button"
          class="cookie-btn cookie-btn-accept"
          id="cookieSave">
          Auswahl speichern
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(settingsModal);

  // =========================
  // Funktionen
  // =========================

  function saveConsent(statistics, marketing) {

    const consent = {
      necessary: true,
      statistics: statistics,
      marketing: marketing,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify(consent)
    );

    banner.remove();
    settingsModal.remove();

    // Hier können später optionale Dienste
    // nach Zustimmung geladen werden.
    loadOptionalServices(consent);
  }

  function loadOptionalServices(consent) {

    if (consent.statistics) {
      console.log("Statistik wurde akzeptiert.");
      // Google Analytics etc. erst HIER laden.
    }

    if (consent.marketing) {
      console.log("Marketing wurde akzeptiert.");
      // Marketing-Dienste erst HIER laden.
    }
  }

  // =========================
  // Buttons
  // =========================

  document
    .getElementById("cookieNecessary")
    .addEventListener("click", () => {
      saveConsent(false, false);
    });

  document
    .getElementById("cookieAccept")
    .addEventListener("click", () => {
      saveConsent(true, true);
    });

  document
    .getElementById("cookieSettings")
    .addEventListener("click", () => {
      settingsModal.classList.add("active");
    });

  document
    .getElementById("cookieClose")
    .addEventListener("click", () => {
      settingsModal.classList.remove("active");
    });

  document
    .getElementById("cookieSave")
    .addEventListener("click", () => {

      const statistics =
        document.getElementById("cookieStatistics").checked;

      const marketing =
        document.getElementById("cookieMarketing").checked;

      saveConsent(statistics, marketing);
    });

  // Klick außerhalb des Fensters
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      settingsModal.classList.remove("active");
    }
  });
});