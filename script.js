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

        const footerYear = document.getElementById("power-footer-year");

        if (footerYear) {
          footerYear.textContent = new Date().getFullYear();
        }
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
          link.setAttribute("aria-current", "page");
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

  document.documentElement.classList.add("js");

  const revealTargets = document.querySelectorAll(
    ".hero-section .container > *, .bento-grid > *, .timeline-row, .join-box, .gallery-item, .training-card, .legal-card, .week-grid > *, .table-responsive, .table-container, .mobile-schedule",
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
  });

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1,
  };

  const revealElements = document.querySelectorAll(
    ".animate-on-scroll, .reveal-on-scroll",
  );

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((element) => {
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
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
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

        weekGrid.replaceChildren();

        const errorMessage = document.createElement("div");
        errorMessage.className = "no-matches data-status--error";
        errorMessage.textContent = "Der Spielplan konnte gerade nicht geladen werden.";
        weekGrid.appendChild(errorMessage);
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

      const dayTitle = document.createElement("span");
      dayTitle.className = "day-title";
      dayTitle.textContent = dayNames[dayDate.getDay()];

      const dayDateLabel = document.createElement("span");
      dayDateLabel.className = "day-date";
      dayDateLabel.textContent = formatDate(dayDate);

      dayHeader.append(dayTitle, dayDateLabel);

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

          const matchType = document.createElement("span");
          matchType.className = `match-type match-type--${match.type}`;
          matchType.textContent = match.label;

          const matchTeams = document.createElement("span");
          matchTeams.className = "match-teams";
          matchTeams.textContent = match.text;

          badge.append(matchType, matchTeams);

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

      weekGrid.replaceChildren();

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const weekDisplay = document.getElementById("weekDisplay");

      /* Suche */

      if (filter) {
        if (weekDisplay) {
          weekDisplay.textContent = `Suchergebnisse für „${filterInput.value}“`;
        }

        const matchingDays = scheduleData.filter(
          (dayEntry) =>
            dayEntry.matches &&
            dayEntry.matches.some((match) =>
              match.text.toUpperCase().includes(filter),
            ),
        );

        if (!matchingDays.length) {
          const noResults = document.createElement("div");
          noResults.className = "no-matches";
          noResults.textContent = "Keine Spiele für diesen Suchbegriff gefunden.";
          weekGrid.appendChild(noResults);

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
        weekDisplay.textContent = `${formatDate(currentMonday)} – ${formatDate(sunday)}`;
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
/* =========================================================
   GOOGLE SHEETS: RANGLISTE UND NEWS
   External data is rendered with textContent, never as HTML.
   ========================================================= */

const PLAYERS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/195vlUex4eidOQBtazuNM9ylTtt2LR_qe8zbrQ5AP20s/export?format=csv";
const NEWS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1wsez9M8EGLXVtY9fFeVoDb1Xrwd2SEb_s6SEXiz22pY/export?format=csv";

function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

// Some Google Sheets are exported as one quoted cell per row (for example
// "Datum,Titel,Text"). Normalize that variant before reading the columns.
function normalizeSpreadsheetRows(csvText) {
  return parseCsvRows(csvText).map((row) => {
    if (row.length !== 1 || !row[0].includes(",")) return row;

    return parseCsvRows(row[0])[0] || row;
  });
}

function createTableMessage(message, isError = false) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = 3;
  cell.className = isError ? "table-status table-status--error" : "table-status";
  cell.textContent = message;
  row.append(cell);
  return row;
}

function initPlayerSearch() {
  const tableBody = document.getElementById("playerTableBody");
  const searchInput = document.getElementById("playerSearch");

  if (!tableBody || !searchInput) return;

  let players = [];

  const render = () => {
    const searchTerm = searchInput.value.trim().toLocaleLowerCase("de-AT");
    const visiblePlayers = players.filter((player) =>
      player.name.toLocaleLowerCase("de-AT").includes(searchTerm),
    );

    if (!visiblePlayers.length) {
      tableBody.replaceChildren(createTableMessage("Keine Spieler gefunden."));
      return;
    }

    const rows = visiblePlayers.map((player) => {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const year = document.createElement("td");
      const points = document.createElement("td");
      const pointsValue = document.createElement("strong");

      name.dataset.label = "Spieler";
      year.dataset.label = "Jahr";
      points.dataset.label = "RC-Punkte";
      name.textContent = player.name;
      year.textContent = player.year;
      pointsValue.textContent = player.points;
      points.append(pointsValue);
      row.append(name, year, points);
      return row;
    });

    tableBody.replaceChildren(...rows);
  };

  searchInput.addEventListener("input", render);

  fetch(PLAYERS_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Rangliste konnte nicht geladen werden.");
      return response.text();
    })
    .then((csvText) => {
      players = parseCsvRows(csvText)
        .map((row) => ({
          name: row[1] || "",
          year: row[2] || "",
          points: row[3] || "",
        }))
        .filter((player) => player.name && /^\d{4}$/.test(player.year));

      render();
    })
    .catch((error) => {
      console.error("Rangliste konnte nicht geladen werden:", error);
      tableBody.replaceChildren(
        createTableMessage("Die Rangliste konnte gerade nicht geladen werden.", true),
      );
    });
}

function initNews() {
  const newsGrid = document.getElementById("newsGrid");
  if (!newsGrid) return;

  const showMessage = (message, isError = false) => {
    const status = document.createElement("p");
    status.className = isError ? "data-status data-status--error" : "data-status";
    status.textContent = message;
    newsGrid.replaceChildren(status);
  };

  fetch(NEWS_CSV_URL)
    .then((response) => {
      if (!response.ok) throw new Error("News konnten nicht geladen werden.");
      return response.text();
    })
    .then((csvText) => {
      const articles = normalizeSpreadsheetRows(csvText)
        .slice(1)
        .map(([date = "", title = "", ...content]) => ({
          date,
          title,
          content: content.join(", "),
        }))
        .filter((article) => article.date && article.title);

      if (!articles.length) {
        showMessage("Aktuell sind keine News vorhanden.");
        return;
      }

      const cards = articles.map((article) => {
        const card = document.createElement("article");
        card.className = "news-card";

        const header = document.createElement("div");
        header.className = "news-header";

        const date = document.createElement("span");
        date.className = "news-date";
        date.textContent = article.date;

        const title = document.createElement("h2");
        title.className = "news-title";
        title.textContent = article.title;

        const text = document.createElement("p");
        text.className = "news-text";
        text.textContent = article.content;

        header.append(date);
        card.append(header, title, text);
        return card;
      });

      newsGrid.replaceChildren(...cards);
    })
    .catch((error) => {
      console.error("News konnten nicht geladen werden:", error);
      showMessage("Die News konnten gerade nicht geladen werden.", true);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initPlayerSearch();
  initNews();
});
