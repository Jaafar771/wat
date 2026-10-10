/* =========================================================
   WAT MARIAHILF – MAIN SCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =======================================================
     NAVBAR & FOOTER LADEN
     ======================================================= */

  Promise.all([
    fetch("navbar.html")
      .then((res) => {
        if (!res.ok) {
          throw new Error("navbar.html konnte nicht geladen werden.");
        }
        return res.text();
      })
      .catch((err) => {
        console.error("Navbar:", err);
        return null;
      }),

    fetch("footer.html")
      .then((res) => {
        if (!res.ok) {
          throw new Error("footer.html konnte nicht geladen werden.");
        }
        return res.text();
      })
      .catch((err) => {
        console.error("Footer:", err);
        return null;
      }),
  ])
    .then(([navData, footerData]) => {
      /* Navbar */

      const navPlaceholder = document.getElementById("navbar-placeholder");

      if (navPlaceholder && navData) {
        navPlaceholder.innerHTML = navData;
      }

      /* Footer */

      const footerPlaceholder = document.getElementById("footer-placeholder");

      if (footerPlaceholder && footerData) {
        footerPlaceholder.innerHTML = footerData;
      }

      /* =====================================================
       NAVBAR ELEMENTE
       ===================================================== */

      const navMenu = document.getElementById("navMenu");

      const menuToggle = document.getElementById("menuToggle");

      const themeToggle = document.getElementById("themeToggle");

      const infoDropdown = document.querySelector(".nav-dropdown");

      const infoButton = document.querySelector(".nav-dropdown-button");

      /* =====================================================
       THEME
       ===================================================== */

      function applyTheme(theme) {
        if (theme === "light") {
          document.body.classList.add("light-mode");

          if (themeToggle) {
            themeToggle.checked = true;
          }
        } else {
          document.body.classList.remove("light-mode");

          if (themeToggle) {
            themeToggle.checked = false;
          }
        }
      }

      const savedTheme = localStorage.getItem("theme") || "dark";

      applyTheme(savedTheme);

      if (themeToggle) {
        themeToggle.addEventListener("change", () => {
          const newTheme = themeToggle.checked ? "light" : "dark";

          applyTheme(newTheme);

          localStorage.setItem("theme", newTheme);
        });
      }

      /* =====================================================
       MOBILE MENU
       ===================================================== */

      function closeMobileMenu() {
        if (!navMenu || !menuToggle) {
          return;
        }

        navMenu.classList.remove("active");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.setAttribute("aria-label", "Menü öffnen");
      }

      function openMobileMenu() {
        if (!navMenu || !menuToggle) {
          return;
        }

        navMenu.classList.add("active");

        menuToggle.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");

        menuToggle.setAttribute("aria-label", "Menü schließen");
      }

      if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", (event) => {
          event.stopPropagation();

          const isOpen = navMenu.classList.contains("active");

          if (isOpen) {
            closeMobileMenu();
          } else {
            openMobileMenu();
          }
        });
      }

      /* =====================================================
       INFOS DROPDOWN
       ===================================================== */

      function closeInfoDropdown() {
        if (!infoDropdown || !infoButton) {
          return;
        }

        infoDropdown.classList.remove("open");
        infoDropdown.classList.remove("active");

        infoButton.setAttribute("aria-expanded", "false");
      }

      function openInfoDropdown() {
        if (!infoDropdown || !infoButton) {
          return;
        }

        infoDropdown.classList.add("open");
        infoDropdown.classList.add("active");

        infoButton.setAttribute("aria-expanded", "true");
      }

      if (infoButton && infoDropdown) {
        infoButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const isOpen =
            infoDropdown.classList.contains("open") ||
            infoDropdown.classList.contains("active");

          if (isOpen) {
            closeInfoDropdown();
          } else {
            openInfoDropdown();
          }
        });
      }

      /* =====================================================
       AKTIVE SEITE
       ===================================================== */

      const currentPath =
        window.location.pathname.split("/").pop().toLowerCase() || "index.html";

      const navLinks = document.querySelectorAll(".main-nav a");

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        /* Anchor-Links nicht markieren */

        if (href.includes("#")) {
          return;
        }

        const cleanHref = href.split("/").pop().toLowerCase();

        if (
          cleanHref === currentPath ||
          (currentPath === "" && cleanHref === "index.html")
        ) {
          link.classList.add("active");
        }
      });

      /* =====================================================
       LINKS → MOBILE MENÜ SCHLIESSEN
       ===================================================== */

      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          closeMobileMenu();
          closeInfoDropdown();
        });
      });

      const mobileContact = document.querySelector(".mobile-contact");

      if (mobileContact) {
        mobileContact.addEventListener("click", () => {
          closeMobileMenu();
          closeInfoDropdown();
        });
      }

      /* =====================================================
       KLICK AUSSERHALB
       ===================================================== */

      document.addEventListener("click", (event) => {
        if (infoDropdown && !infoDropdown.contains(event.target)) {
          closeInfoDropdown();
        }

        if (
          navMenu &&
          menuToggle &&
          !navMenu.contains(event.target) &&
          !menuToggle.contains(event.target)
        ) {
          closeMobileMenu();
        }
      });

      /* =====================================================
       ESC → MENU SCHLIESSEN
       ===================================================== */

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
          return;
        }

        closeInfoDropdown();
        closeMobileMenu();
      });

      /* =====================================================
       RESIZE
       ===================================================== */

      window.addEventListener("resize", () => {
        if (window.innerWidth > 850) {
          closeMobileMenu();
        }
      });
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Komponenten:", error);
    });

  /* =========================================================
     SCROLL ANIMATIONEN
     ========================================================= */

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach((element) => {
    observer.observe(element);
  });

  /* =========================================================
     SPIELPLAN
     ========================================================= */

  const weekGrid = document.getElementById("weekGrid");

  if (weekGrid) {
    let scheduleData = [];

    let currentMonday = getMonday(new Date());

    const SHEET_CSV_URL =
      "https://docs.google.com/spreadsheets/d/19EeAE72Ar168tLCG2ueu3-grB37o4tEdZhkvY5a8kG8/export?format=csv";

    /* -------------------------------------------------------
       DATUM PARSEN
       ------------------------------------------------------- */

    function parseDate(str) {
      if (!str) {
        return null;
      }

      const clean = String(str).trim();

      /* DD/MM/YYYY */

      let match = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

      if (match) {
        return new Date(match[3], match[2] - 1, match[1]);
      }

      /* DD.MM.YYYY */

      match = clean.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);

      if (match) {
        return new Date(match[3], match[2] - 1, match[1]);
      }

      /* YYYY-MM-DD */

      match = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

      if (match) {
        return new Date(match[1], match[2] - 1, match[3]);
      }

      return null;
    }

    /* -------------------------------------------------------
       MONTAG
       ------------------------------------------------------- */

    function getMonday(date) {
      const d = new Date(date);

      const day = d.getDay();

      const diff = d.getDate() - day + (day === 0 ? -6 : 1);

      const monday = new Date(d.setDate(diff));

      monday.setHours(0, 0, 0, 0);

      return monday;
    }

    /* -------------------------------------------------------
       DATUM FORMATIEREN
       ------------------------------------------------------- */

    function formatDate(date) {
      if (!date || isNaN(date)) {
        return "";
      }

      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    /* -------------------------------------------------------
       CSV ZEILE PARSEN
       ------------------------------------------------------- */

    function parseCSVLine(line) {
      const result = [];

      let current = "";

      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ""));

          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim().replace(/^"|"$/g, ""));

      return result;
    }

    /* -------------------------------------------------------
       GOOGLE SHEET LADEN
       ------------------------------------------------------- */

    async function loadGoogleSheetSchedule() {
      try {
        const response = await fetch(SHEET_CSV_URL);

        if (!response.ok) {
          throw new Error("Google Sheet konnte nicht geladen werden.");
        }

        const csvText = await response.text();

        parseCSV(csvText);

        renderWeek();
      } catch (error) {
        console.error("Spielplan Fehler:", error);

        weekGrid.innerHTML = `
          <div class="no-matches"
               style="
                 padding:20px;
                 text-align:center;
               ">
            Fehler beim Laden des Spielplans.
          </div>
        `;
      }
    }

    /* -------------------------------------------------------
       CSV PARSEN
       ------------------------------------------------------- */

    function parseCSV(text) {
      scheduleData = [];

      const lines = text.split(/\r?\n/);

      if (lines.length < 2) {
        return;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (!line.trim()) {
          continue;
        }

        const row = parseCSVLine(line);

        let dateObj = null;

        /* Datum suchen */

        for (let c = 0; c < row.length; c++) {
          const parsed = parseDate(row[c]);

          if (parsed && !isNaN(parsed)) {
            dateObj = parsed;

            dateObj.setHours(0, 0, 0, 0);

            break;
          }
        }

        if (!dateObj) {
          continue;
        }

        const matches = [];

        /* ---------------------------------------------------
           HEIMSPIELE
           C-L
           --------------------------------------------------- */

        for (let c = 2; c <= 11; c += 2) {
          const team1 = row[c] ? row[c].trim() : "";

          const team2 = row[c + 1] ? row[c + 1].trim() : "";

          if (!team1 && !team2) {
            continue;
          }

          if (parseDate(team1) || parseDate(team2)) {
            continue;
          }

          const tableNumber = (c - 2) / 2 + 1;

          matches.push({
            text: team2 ? `${team1} - ${team2}` : team1,

            type: "home",

            label: `Tisch ${tableNumber}`,
          });
        }

        /* ---------------------------------------------------
           AUSWÄRTSSPIELE
           N-O / P-Q / R-S
           --------------------------------------------------- */

        const awayPairs = [
          [13, 14],
          [15, 16],
          [17, 18],
        ];

        awayPairs.forEach((pair) => {
          const team1 = row[pair[0]] ? row[pair[0]].trim() : "";

          const team2 = row[pair[1]] ? row[pair[1]].trim() : "";

          if (!team1 && !team2) {
            return;
          }

          if (parseDate(team1) || parseDate(team2)) {
            return;
          }

          matches.push({
            text: team2 ? `${team1} - ${team2}` : team1,

            type: "away",

            label: "Auswärtsspiel",
          });
        });

        scheduleData.push({
          dateObj: dateObj,

          matches: matches,
        });
      }
    }

    /* -------------------------------------------------------
       TAG RENDERN
       ------------------------------------------------------- */

    function renderDayCard(dayEntry, today, filter) {
      const dayDate = dayEntry.dateObj;

      const dayCard = document.createElement("div");

      dayCard.className = "day-card";

      if (dayDate.getTime() === today.getTime()) {
        dayCard.classList.add("today-card");
      }

      const dayHeader = document.createElement("div");

      dayHeader.className = "day-header";

      const dayNames = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
      ];

      dayHeader.innerHTML = `

        <span class="day-title">
          ${dayNames[dayDate.getDay()]}
        </span>

        <span class="day-date">
          ${formatDate(dayDate)}
        </span>

      `;

      dayCard.appendChild(dayHeader);

      const matchesContainer = document.createElement("div");

      matchesContainer.className = "matches-container";

      let hasVisibleMatches = false;

      if (dayEntry.matches && dayEntry.matches.length) {
        dayEntry.matches.forEach((match) => {
          if (filter && !match.text.toUpperCase().includes(filter)) {
            return;
          }

          hasVisibleMatches = true;

          const badge = document.createElement("div");

          badge.className = `match-badge ${match.type}`;

          const textUpper = match.text.toUpperCase();

          /* Team-Farben */

          if (textUpper.includes("WILI4") || textUpper.includes("MAR3")) {
            badge.classList.add("team-green");
          } else if (
            textUpper.includes("WILI1") ||
            textUpper.includes("DAMEN") ||
            textUpper.includes("MAR1")
          ) {
            badge.classList.add("team-red");
          } else if (
            textUpper.includes("KONT12") ||
            textUpper.includes("MAR8")
          ) {
            badge.classList.add("team-blue");
          }

          const color = match.type === "away" ? "#d97706" : "#0284c7";

          badge.innerHTML = `

              <span
                class="match-type"
                style="color:${color};"
              >
                ${match.label}
              </span>

              <span class="match-teams">
                ${match.text}
              </span>

            `;

          matchesContainer.appendChild(badge);
        });
      }

      if (hasVisibleMatches) {
        dayCard.classList.add("has-matches");

        dayCard.appendChild(matchesContainer);
      } else {
        const noMatches = document.createElement("div");

        noMatches.className = "no-matches";

        noMatches.textContent = filter
          ? "Keine Spiele für diesen Filter."
          : "Spielfrei";

        dayCard.appendChild(noMatches);
      }

      weekGrid.appendChild(dayCard);
    }

    /* -------------------------------------------------------
       WOCHE RENDERN
       ------------------------------------------------------- */

    function renderWeek() {
      const filterInput = document.getElementById("filterInput");

      const filter = filterInput ? filterInput.value.trim().toUpperCase() : "";

      weekGrid.innerHTML = "";

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const weekDisplay = document.getElementById("weekDisplay");

      /* Suche */

      if (filter) {
        if (weekDisplay) {
          weekDisplay.innerText = `Suchergebnisse für "${filterInput.value}"`;
        }

        const matchingDays = scheduleData.filter(
          (dayEntry) =>
            dayEntry.matches &&
            dayEntry.matches.some((match) =>
              match.text.toUpperCase().includes(filter),
            ),
        );

        if (!matchingDays.length) {
          weekGrid.innerHTML = `

            <div
              class="no-matches"
              style="
                padding:20px;
                text-align:center;
              "
            >
              Keine Spiele für diesen
              Suchbegriff gefunden.
            </div>

          `;

          return;
        }

        matchingDays.sort((a, b) => a.dateObj - b.dateObj);

        matchingDays.forEach((dayEntry) => {
          renderDayCard(dayEntry, today, filter);
        });

        return;
      }

      /* Normale Woche */

      const sunday = new Date(currentMonday);

      sunday.setDate(sunday.getDate() + 6);

      if (weekDisplay) {
        weekDisplay.innerText = `${formatDate(currentMonday)} – ${formatDate(sunday)}`;
      }

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentMonday);

        dayDate.setDate(dayDate.getDate() + i);

        dayDate.setHours(0, 0, 0, 0);

        const dayEntry = scheduleData.find(
          (entry) =>
            entry.dateObj && entry.dateObj.getTime() === dayDate.getTime(),
        );

        renderDayCard(
          dayEntry || {
            dateObj: dayDate,

            matches: [],
          },

          today,

          "",
        );
      }
    }

    /* =====================================================
       SPIELPLAN BUTTONS
       ===================================================== */

    const prevWeek = document.getElementById("prevWeek");

    const nextWeek = document.getElementById("nextWeek");

    const todayWeek = document.getElementById("todayWeek");

    const filterInput = document.getElementById("filterInput");

    if (prevWeek) {
      prevWeek.addEventListener("click", () => {
        currentMonday.setDate(currentMonday.getDate() - 7);

        renderWeek();
      });
    }

    if (nextWeek) {
      nextWeek.addEventListener("click", () => {
        currentMonday.setDate(currentMonday.getDate() + 7);

        renderWeek();
      });
    }

    if (todayWeek) {
      todayWeek.addEventListener("click", () => {
        currentMonday = getMonday(new Date());

        renderWeek();
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", renderWeek);
    }

    loadGoogleSheetSchedule();
  }

  /* =====================================================
   CURRENT PAGE NAVIGATION
   ===================================================== */

  function hideCurrentNavItem() {
    const navMenu = document.getElementById("navMenu");

    if (!navMenu) {
      console.log("NAV MENU NICHT GEFUNDEN");
      return;
    }

    let currentPage = window.location.pathname.split("/").pop().toLowerCase();

    if (!currentPage) {
      currentPage = "index.html";
    }

    console.log("CURRENT PAGE:", currentPage);

    const items = navMenu.querySelectorAll("[data-page]");

    items.forEach((item) => {
      const page = item.getAttribute("data-page").toLowerCase();

      console.log("CHECK:", page);

      if (page === currentPage) {
        console.log("HIDE:", page);

        item.style.setProperty("display", "none", "important");
      }
    });
  }
  
  /* =========================================================
     BACK TO TOP
     ========================================================= */

  const backToTop = document.getElementById("backToTop");

  if (backToTop) {
    function updateBackToTop() {
      if (window.scrollY > 300) {
        backToTop.classList.add("show");
      } else {
        backToTop.classList.remove("show");
      }
    }

    window.addEventListener("scroll", updateBackToTop, {
      passive: true,
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    });

    updateBackToTop();
  }
});
/* ========================================== */
/* GOOGLE SHEETS RANGLISTE & LIVE-SUCHE       */
/* ========================================== */

const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/195vlUex4eidOQBtazuNM9ylTtt2LR_qe8zbrQ5AP20s/export?format=csv';

let allPlayers = [];

// Event-Listener, der wartet, bis die Seite komplett geladen ist
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('playerTableBody');
  if (tableBody) {
    loadGoogleSheetData();
  }
});

async function loadGoogleSheetData() {
  const tableBody = document.getElementById('playerTableBody');
  if (!tableBody) return;

  try {
    const response = await fetch(sheetCsvUrl);
    const data = await response.text();
    parseAndDisplayCSV(data);
  } catch (error) {
    console.error('Fehler beim Laden der Tabelle:', error);
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--neon-red);">Fehler beim Laden der Daten. Bitte prüfen ob das Google Sheet öffentlich freigegeben ist.</td></tr>`;
  }
}

function parseAndDisplayCSV(csvText) {
  const rows = csvText.split('\n');
  allPlayers = [];

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i].trim();
    if (!row) continue;
    
    // CSV Zeile sauber aufteilen
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"\vert{}"$/g, '').trim());
    
    // Da deine CSV so aufgebaut ist: [leer, Name, Jahr, Punkte]
    // cols[1] = Spielername
    // cols[2] = Jahr
    // cols[3] = RC-Punkte / Wert
    if (cols.length >= 3 && cols[2] && !isNaN(cols[2])) {
      allPlayers.push({
        name: cols[1],       
        year: cols[2],       
        points: cols[3] || '' 
      });
    }
  }

  renderTable(allPlayers);
}

function renderTable(players) {
  const tbody = document.getElementById('playerTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Keine Spieler gefunden.</td></tr>`;
    return;
  }

  players.forEach((player) => {
    const tr = document.createElement('tr');
    // Hier wird KEIN Rang (#1, #2...) mehr erzeugt! Nur noch Name, Jahr und Punkte:
    tr.innerHTML = `
      <td>${player.name}</td>
      <td>${player.year}</td>
      <td><strong>${player.points}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterPlayers() {
  const searchInput = document.getElementById('playerSearch');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase();
  const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(query));
  
  const tbody = document.getElementById('playerTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Keine Spieler gefunden.</td></tr>`;
    return;
  }

  filtered.forEach((player) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${player.name}</td>
      <td>${player.year}</td>
      <td><strong>${player.points}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("power-footer-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
