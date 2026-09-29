document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Navbar und Footer automatisch nachladen
  Promise.all([
    fetch('navbar.html').then(res => res.text()).catch(() => null),
    fetch('footer.html').then(res => res.text()).catch(() => null)
  ]).then(([navData, footerData]) => {
    
    const navPlaceholder = document.getElementById('navbar-placeholder');
    if (navPlaceholder && navData) navPlaceholder.innerHTML = navData;

    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder && footerData) footerPlaceholder.innerHTML = footerData;

    const currentPath = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href').split("/").pop().toLowerCase();
      if (href === currentPath || (currentPath === "" && href.includes("index.html"))) {
        link.style.display = 'none';
      } else {
        link.style.display = '';
      }
    });

    const themeToggle = document.getElementById('themeToggle');
    const bodyElement = document.body;

    if (localStorage.getItem('theme') === 'light') {
      bodyElement.classList.add('light-mode');
      if (themeToggle) themeToggle.checked = true;
    } else {
      if (themeToggle) themeToggle.checked = false;
    }

    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
          bodyElement.classList.add('light-mode');
          localStorage.setItem('theme', 'light');
        } else {
          bodyElement.classList.remove('light-mode');
          localStorage.setItem('theme', 'dark');
        }
      });
    }

    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('navMenu');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
      });

      navLinks.forEach(item => {
        item.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }

  }).catch(err => console.error('Fehler beim Laden der Komponenten:', err));

  // Scroll-Animationen
  const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
  });

  // ==========================================
  // SPIELPLAN LOGIK
  // ==========================================
  const weekGrid = document.getElementById('weekGrid');
  
  if (weekGrid) {
    let scheduleData = [];
    let currentMonday = getMonday(new Date());

    // Google Sheet CSV-Link
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/19EeAE72Ar168tLCG2ueu3-grB37o4tEdZhkvY5a8kG8/export?format=csv';

    function parseDate(str) {
      if (!str) return null;
      let clean = String(str).trim();
      
      let matchSlash = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (matchSlash) {
        return new Date(matchSlash[3], matchSlash[2] - 1, matchSlash[1]);
      }

      let matchDot = clean.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (matchDot) {
        return new Date(matchDot[3], matchDot[2] - 1, matchDot[1]);
      }
      
      let matchIso = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (matchIso) {
        return new Date(matchIso[1], matchIso[2] - 1, matchIso[3]);
      }

      return null;
    }

    function getMonday(d) {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }

    function formatDate(d) {
      if (!d || isNaN(d)) return '';
      return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function parseCSVLine(textLine) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < textLine.length; i++) {
        const char = textLine[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    }

    async function loadGoogleSheetSchedule() {
      try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error('Netzwerkfehler beim Laden');
        const csvText = await response.text();
        parseCSV(csvText);
        renderWeek();
      } catch (error) {
        console.error("Fehler beim Laden des Google Sheets:", error);
        weekGrid.innerHTML = '<div class="no-matches" style="padding: 20px; text-align:center;">Fehler beim Laden des Spielplans. Bitte überprüfe die Freigabe der Tabelle.</div>';
      }
    }

    function parseCSV(text) {
      scheduleData = [];
      const csvLines = text.split(/\r?\n/);
      if (csvLines.length < 2) return;

      const headers = parseCSVLine(csvLines[0]);

      for (let i = 1; i < csvLines.length; i++) {
        const rawLine = csvLines[i];
        if (!rawLine || !rawLine.trim()) continue;

        const row = parseCSVLine(rawLine);
        let dateObj = null;

        // Datum in der Zeile finden
        for (let c = 0; c < row.length; c++) {
          const parsed = parseDate(row[c]);
          if (parsed && !isNaN(parsed)) {
            dateObj = parsed;
            dateObj.setHours(0, 0, 0, 0);
            break;
          }
        }

        if (!dateObj) continue;

        let matches = [];

        // Spalten C bis L (Heimspiele / Tische 1 bis 5): Index 2 bis 11 in 2er-Schritten
        for (let c = 2; c <= 11; c += 2) {
          const team1 = row[c] ? row[c].trim() : '';
          const team2 = row[c + 1] ? row[c + 1].trim() : '';

          if (!team1 && !team2) continue;
          if (parseDate(team1) || parseDate(team2)) continue;

          const tischNummer = (c - 2) / 2 + 1;
          let label = `Tisch ${tischNummer}`;

          matches.push({
            text: team2 ? `${team1} - ${team2}` : team1,
            type: 'home',
            label: label
          });
        }

        // Spalte M (Index 12) wird komplett ignoriert/übersprungen!

        // Auswärtsspiele: Spalten N-O (Index 13,14), P-Q (Index 15,16), R-S (Index 17,18)
        const awayPairs = [
          [13, 14], // Spalte N & O
          [15, 16], // Spalte P & Q
          [17, 18]  // Spalte R & S
        ];

        awayPairs.forEach(pair => {
          const col1 = pair[0];
          const col2 = pair[1];
          const team1 = row[col1] ? row[col1].trim() : '';
          const team2 = row[col2] ? row[col2].trim() : '';

          // Wenn beide leer sind, einfach überspringen
          if (!team1 && !team2) return;
          if (parseDate(team1) || parseDate(team2)) return;

          let combinedText = team2 ? `${team1} - ${team2}` : team1;
          if (combinedText) {
            matches.push({
              text: combinedText,
              type: 'away',
              label: 'Auswärtsspiel'
            });
          }
        });

        scheduleData.push({
          dateObj: dateObj,
          matches: matches
        });
      }
    }

    function renderDayCard(dayEntry, today, filter) {
      const dayDate = dayEntry.dateObj;
      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';

      if (dayDate.getTime() === today.getTime()) {
        dayCard.classList.add('today-card');
      }

      const dayHeader = document.createElement('div');
      dayHeader.className = 'day-header';

      const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
      dayHeader.innerHTML = `<span class="day-title">${dayNames[dayDate.getDay()]}</span><span class="day-date">${formatDate(dayDate)}</span>`;
      dayCard.appendChild(dayHeader);

      const matchesContainer = document.createElement('div');
      matchesContainer.className = 'matches-container';

      let hasVisibleMatches = false;

      if (dayEntry && dayEntry.matches && dayEntry.matches.length > 0) {
        dayEntry.matches.forEach(match => {
          if (filter && !match.text.toUpperCase().includes(filter)) return;

          hasVisibleMatches = true;
          const badge = document.createElement('div');
          badge.className = `match-badge ${match.type}`;

          // Prüft auf die Teams (egal wer der Gegner ist, solange WILI4/MAR3, WILI1/DAMEN/MAR1 oder KONT12/MAR8 vorkommen)
          const textUpper = match.text.toUpperCase();
          if (textUpper.includes('WILI4') || textUpper.includes('MAR3')) {
            badge.classList.add('team-green');
          } else if (textUpper.includes('WILI1') || textUpper.includes('DAMEN') || textUpper.includes('MAR1')) {
            badge.classList.add('team-red');
          } else if (textUpper.includes('KONT12') || textUpper.includes('MAR8')) {
            badge.classList.add('team-blue');
          }

          let colorStyle = 'color:#0284c7;'; 
          if (match.type === 'away') colorStyle = 'color:#d97706;'; 

          badge.innerHTML = `
            <span class="match-type" style="${colorStyle}">${match.label}</span>
            <span class="match-teams">${match.text}</span>
          `;
          matchesContainer.appendChild(badge);
        });
      }

      if (hasVisibleMatches) {
        dayCard.classList.add('has-matches');
        dayCard.appendChild(matchesContainer);
      } else {
        const noMatchesDiv = document.createElement('div');
        noMatchesDiv.className = 'no-matches';
        noMatchesDiv.textContent = filter ? 'Keine Spiele für diesen Filter.' : 'Spielfrei';
        dayCard.appendChild(noMatchesDiv);
      }

      weekGrid.appendChild(dayCard);
    }

    function renderWeek() {
      const filterInput = document.getElementById('filterInput');
      const filter = filterInput ? filterInput.value.toUpperCase() : '';
      weekGrid.innerHTML = '';

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekDisplay = document.getElementById('weekDisplay');

      if (filter) {
        if (weekDisplay) {
          weekDisplay.innerText = `Suchergebnisse für "${filterInput.value}"`;
        }

        const matchingDays = scheduleData.filter(dayEntry => {
          return dayEntry.matches && dayEntry.matches.some(match => match.text.toUpperCase().includes(filter));
        });

        if (matchingDays.length === 0) {
          weekGrid.innerHTML = '<div class="no-matches" style="padding: 20px; text-align:center;">Keine Spiele für diesen Suchbegriff gefunden.</div>';
          return;
        }

        matchingDays.sort((a, b) => a.dateObj - b.dateObj);

        matchingDays.forEach(dayEntry => {
          renderDayCard(dayEntry, today, filter);
        });

      } else {
        const sunday = new Date(currentMonday);
        sunday.setDate(sunday.getDate() + 6);

        if (weekDisplay) {
          weekDisplay.innerText = `${formatDate(currentMonday)} – ${formatDate(sunday)}`;
        }

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(currentMonday);
          dayDate.setDate(dayDate.getDate() + i);
          dayDate.setHours(0, 0, 0, 0);

          const dayEntry = scheduleData.find(d => d.dateObj && d.dateObj.getTime() === dayDate.getTime());
          renderDayCard(dayEntry || { dateObj: dayDate, matches: [] }, today, '');
        }
      }
    }

    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const todayWeekBtn = document.getElementById('todayWeek');
    const filterInputElem = document.getElementById('filterInput');

    if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => { currentMonday.setDate(currentMonday.getDate() - 7); renderWeek(); });
    if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => { currentMonday.setDate(currentMonday.getDate() + 7); renderWeek(); });
    if (todayWeekBtn) todayWeekBtn.addEventListener('click', () => { currentMonday = getMonday(new Date()); renderWeek(); });
    if (filterInputElem) filterInputElem.addEventListener('input', renderWeek);

    loadGoogleSheetSchedule();
  }
// ==========================================
// PRO TISCHTENNIS SPIEL-LOGIK
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("proPongCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const overlay = document.getElementById("pongOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const startBtn = document.getElementById("pongStartBtn");
  const pauseBtn = document.getElementById("pongPauseBtn");

  let gameRunning = false;
  let gamePaused = false;
  let animationFrameId;

  // Spiel-Objekte
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 5,
    velocityX: 5,
    velocityY: 3,
    color: "#facc15"
  };

  const player = {
    x: 20,
    y: canvas.height / 2 - 35,
    width: 12,
    height: 70,
    score: 0,
    color: "#38bdf8"
  };

  const com = {
    x: canvas.width - 32,
    y: canvas.height / 2 - 35,
    width: 12,
    height: 70,
    score: 0,
    color: "#22c55e"
  };

  // Steuerung (Maus & Touch)
  function handleMove(clientY) {
    if (!gameRunning || gamePaused) return;
    const rect = canvas.getBoundingClientRect();
    let mouseY = clientY - rect.top;
    player.y = mouseY - player.height / 2;

    if (player.y < 20) player.y = 20;
    if (player.y > canvas.height - player.height - 20) player.y = canvas.height - player.height - 20;
  }

  canvas.addEventListener("mousemove", (e) => handleMove(e.clientY));
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientY);
  }, { passive: true });

  function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
  }

  function resetBall(winner) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = winner === 'player' ? 5 : -5;
    ball.velocityY = (Math.random() - 0.5) * 4;
  }

  function update() {
    if (!gameRunning || gamePaused) return;

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // KI-Gegner mit realistischer Verzögerung
    let aiSpeed = 0.085;
    com.y += (ball.y - (com.y + com.height / 2)) * aiSpeed;
    if (com.y < 20) com.y = 20;
    if (com.y > canvas.height - com.height - 20) com.y = canvas.height - com.height - 20;

    // Tisch-Begrenzung oben & unten (Kanten)
    if (ball.y - ball.radius < 20 || ball.y + ball.radius > canvas.height - 20) {
      ball.velocityY = -ball.velocityY;
    }

    // Schläger Kollisionen
    let activePaddle = (ball.x < canvas.width / 2) ? player : com;
    if (collision(ball, activePaddle)) {
      let collidePoint = ball.y - (activePaddle.y + activePaddle.height / 2);
      collidePoint = collidePoint / (activePaddle.height / 2);

      let angleRad = (Math.PI / 4) * collidePoint;
      let direction = (ball.x < canvas.width / 2) ? 1 : -1;

      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      ball.speed += 0.3; // Wird bei jedem Schlag schneller
    }

    // Punkte prüfen (Bis 5 Punkte gewinnt jemand)
    if (ball.x - ball.radius < 0) {
      com.score++;
      if (com.score >= 5) {
        endGame("Gegner gewinnt!", "Schade! Probiere es gleich noch einmal.");
      } else {
        resetBall('com');
      }
    } else if (ball.x + ball.radius > canvas.width) {
      player.score++;
      if (player.score >= 5) {
        endGame("Sieg! 🏆", "Starke Leistung! Du hast das Match gewonnen.");
      } else {
        resetBall('player');
      }
    }
  }

  function render() {
    const isLight = document.body.classList.contains('light-mode');

    // Hintergrund & Tisch-Platte (Blau mit Rahmen im echten Tischtennis-Look)
    ctx.fillStyle = isLight ? '#f1f5f9' : '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tischfläche
    ctx.fillStyle = isLight ? '#0284c7' : '#0369a1';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Weiße Linien auf dem Tisch
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Mittellinie & Netz
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Netz-Pfosten in der Mitte
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(canvas.width / 2 - 3, 10, 6, canvas.height - 20);

    // Punkte-Anzeige auf dem Tisch
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = "bold 70px monospace";
    ctx.textAlign = "center";
    ctx.fillText(player.score, canvas.width / 4, canvas.height / 2 + 25);
    ctx.fillText(com.score, canvas.width * 3 / 4, canvas.height / 2 + 25);

    // Schläger Spieler (Rot / Blau)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Schläger Computer
    ctx.fillStyle = com.color;
    ctx.fillRect(com.x, com.y, com.width, com.height);

    // Ball mit Schatten-Effekt
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 4, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function gameLoop() {
    update();
    render();
    if (gameRunning && !gamePaused) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function startGame() {
    player.score = 0;
    com.score = 0;
    gameRunning = true;
    gamePaused = false;
    overlay.style.display = "none";
    pauseBtn.style.display = "inline-block";
    pauseBtn.textContent = "PAUSE";
    resetBall('player');
    cancelAnimationFrame(animationFrameId);
    gameLoop();
  }

  function endGame(title, text) {
    gameRunning = false;
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = "ERNEUT SPIELEN";
    overlay.style.display = "flex";
    pauseBtn.style.display = "none";
  }

  startBtn.addEventListener("click", startGame);

  pauseBtn.addEventListener("click", () => {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    if (gamePaused) {
      pauseBtn.textContent = "WEITERSPIELEN";
      overlayTitle.textContent = "SPIEL PAUSIERT";
      overlayText.textContent = "Klicke auf Weiter, um fortzufahren.";
      startBtn.textContent = "FORTSETZEN";
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
      gameLoop();
    }
  });

  // Initiale Ansicht zeichnen
  render();
});
  // ==========================================
  // BACK-TO-TOP PFEIL LOGIK
  // ==========================================
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});