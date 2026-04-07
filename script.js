// ──────────────────────────────────────────────
// SUSTAINABILITY DECISION ENGINE — script.js
// ──────────────────────────────────────────────

const LABELS = [
  'Recycling Practices', 'Transport Mode', 'Diet Type',
  'Water Usage', 'Waste Production', 'Consumption Behavior',
  'Community Involvement', 'Green Product Usage',
  'Home Energy Saving', 'Eco-Friendly Habits'
];

const SUGGESTIONS = [
  'Recycling Practices: Start separating waste and recycle regularly',
  'Transport Mode: Switch to public transport or cycling',
  'Diet Type: Shift towards a plant-based diet',
  'Water Usage: Install low-flow taps and take shorter showers',
  'Waste Production: Reduce single-use plastics and compost food waste',
  'Consumption Behavior: Buy only what you need, choose sustainable brands',
  'Community Involvement: Join local environmental groups or initiatives',
  'Green Product Usage: Replace household items with eco-certified alternatives',
  'Home Energy Saving: Use LED bulbs and unplug devices when not in use',
  'Eco-Friendly Habits: Build daily habits like carrying reusable bags and bottles'
];

const DECISIONS = [
  'Your weakest area is Recycling Practices. Start separating waste and recycle regularly.',
  'Your weakest area is Transport Mode. Switch to public transport or cycling.',
  'Your weakest area is Diet Type. Shift towards a plant-based diet.',
  'Your weakest area is Water Usage. Install low-flow taps and take shorter showers.',
  'Your weakest area is Waste Production. Reduce single-use plastics and compost food waste.',
  'Your weakest area is Consumption Behavior. Buy only what you need, choose sustainable brands.',
  'Your weakest area is Community Involvement. Join local environmental groups or initiatives.',
  'Your weakest area is Green Product Usage. Replace household items with eco-certified alternatives.',
  'Your weakest area is Home Energy Saving. Use LED bulbs and unplug devices when not in use.',
  'Your weakest area is Eco-Friendly Habits. Build daily habits like carrying reusable bags and bottles.'
];

let myChart = null;
let lastScore = 0;
let lastDecision = '';
let lastSuggestions = [];

// ──────────────────────────────────────────────
// CALCULATE SCORE
// ──────────────────────────────────────────────
function calculateScore() {
  const ids = [
    'recycling', 'transport', 'diet', 'water', 'waste',
    'consumption', 'community', 'greenProducts', 'homeEnergy', 'ecoHabits'
  ];

  // Read all dropdown values
  const factors = ids.map(id => parseInt(document.getElementById(id).value) || 0);

  // Average all 10 values into one score
  const score = Math.round(factors.reduce((a, b) => a + b, 0) / 10);
  lastScore = score;

  // Determine emoji, grade letter, grade label, and colors
  let emoji, gradeLetter, gradeColor, progressColor, gradeText;

  if (score <= 40) {
    emoji = '😟';
    gradeLetter = 'D';
    gradeColor = '#e63946';
    progressColor = '#e63946';
    gradeText = 'Critical';
  } else if (score <= 59) {
    emoji = '🙂';
    gradeLetter = 'C';
    gradeColor = '#f4a261';
    progressColor = '#f4a261';
    gradeText = 'Moderate';
  } else if (score <= 79) {
    emoji = '😊';
    gradeLetter = 'B';
    gradeColor = '#52b788';
    progressColor = '#52b788';
    gradeText = 'Good';
  } else {
    emoji = '😃';
    gradeLetter = 'A';
    gradeColor = '#2a9d8f';
    progressColor = '#2a9d8f';
    gradeText = 'Excellent';
  }

  // ── Update Score Display ──
  document.getElementById('scorePlaceholder').style.display = 'none';
  document.getElementById('scoreNum').textContent = score;
  document.getElementById('scorePct').textContent = '%';
  document.getElementById('scoreEmoji').textContent = emoji;

  // Grade badge
  const badgeRow = document.getElementById('badgeRow');
  badgeRow.style.display = 'flex';

  const gradeLabel = document.getElementById('gradeLabel');
  gradeLabel.textContent = gradeText;
  gradeLabel.style.background = gradeColor + '22';
  gradeLabel.style.color = gradeColor;

  document.getElementById('gradeBadge').textContent = gradeLetter;

  // ── Progress Bar ──
  const fill = document.getElementById('progressFill');
  fill.style.background = progressColor;
  setTimeout(() => {
    fill.style.width = score + '%';
  }, 50); // small delay so CSS transition triggers

  // ── Find Weakest Factor → Decision ──
  const minVal = Math.min(...factors);
  const minIdx = factors.indexOf(minVal);
  const decision = DECISIONS[minIdx];
  lastDecision = decision;

  const decisionEl = document.getElementById('decisionText');
  decisionEl.textContent = decision;
  decisionEl.style.display = 'block';

  // ── Future Prediction ──
  const improved = Math.min(score + 20, 100);
  document.getElementById('predictText').textContent =
    `If you follow these suggestions, your score can reach ${improved}%.`;

  // ── Build Suggestions (any factor ≤ 50 triggers a tip) ──
  const suggestions = [];
  factors.forEach((val, i) => {
    if (val <= 50) {
      suggestions.push({ text: SUGGESTIONS[i], idx: i });
    }
  });

  // If everything is great, show positive message
  if (suggestions.length === 0) {
    suggestions.push({ text: 'Excellent! Keep maintaining your sustainable lifestyle.', idx: -1 });
  }

  lastSuggestions = suggestions;

  // ── Render Suggestions List ──
  const sugList = document.getElementById('suggestionsList');
  sugList.innerHTML = suggestions.map(s => `
    <div class="suggestion-item">
      <span class="suggestion-dot"></span>
      <span>${s.text}</span>
    </div>
  `).join('');

  // ── Render Top 3 Priority Actions ──
  const top3 = suggestions.slice(0, 3);
  const prioList = document.getElementById('priorityList');
  prioList.innerHTML = top3.map((s, i) => `
    <div class="priority-item">
      <span class="priority-num">${i + 1}</span>
      <span>${s.text}</span>
    </div>
  `).join('');

  // ── Render Chart ──
  renderChart(factors);
}

// ──────────────────────────────────────────────
// RENDER HORIZONTAL BAR CHART (Chart.js)
// ──────────────────────────────────────────────
function renderChart(factors) {
  document.getElementById('chartPlaceholder').style.display = 'none';

  const canvas = document.getElementById('chart');
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');

  // Destroy previous chart before drawing new one
  if (myChart) myChart.destroy();

  // Color each bar based on its score value
  const barColors = factors.map(v => {
    if (v <= 25)  return '#e63946'; // red — very low
    if (v <= 50)  return '#f4a261'; // amber — low
    if (v <= 75)  return '#52b788'; // green — moderate
    return '#2a9d8f';               // teal — high
  });

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: LABELS,
      datasets: [{
        label: 'Score',
        data: factors,
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y', // horizontal bars
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x}%`
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: {
            callback: v => v + '%',
            color: '#6c757d',
            font: { family: 'DM Sans', size: 11 }
          },
          grid: { color: '#f0f0f0' }
        },
        y: {
          ticks: {
            color: '#3d5a50',
            font: { family: 'DM Sans', size: 11 }
          },
          grid: { display: false }
        }
      }
    }
  });

  // Set fixed height for chart container
  canvas.parentElement.style.height = '320px';
}

// ──────────────────────────────────────────────
// RESET FORM
// ──────────────────────────────────────────────
function resetForm() {
  // Reset all dropdowns to first option
  ['recycling', 'transport', 'diet', 'water', 'waste',
   'consumption', 'community', 'greenProducts', 'homeEnergy', 'ecoHabits']
    .forEach(id => document.getElementById(id).selectedIndex = 0);

  // Clear score display
  document.getElementById('scoreNum').textContent = '—';
  document.getElementById('scorePct').textContent = '';
  document.getElementById('scoreEmoji').textContent = '';
  document.getElementById('badgeRow').style.display = 'none';
  document.getElementById('decisionText').style.display = 'none';
  document.getElementById('predictText').textContent = '';
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('scorePlaceholder').style.display = 'block';

  // Reset suggestions
  document.getElementById('suggestionsList').innerHTML = `
    <div class="placeholder-state">
      <div class="ph-icon">💡</div>
      Your personalised tips will appear here
    </div>`;

  // Reset priority actions
  document.getElementById('priorityList').innerHTML = `
    <div class="placeholder-state">
      <div class="ph-icon">🎯</div>
      Calculate your score to see priority actions
    </div>`;

  // Destroy chart and reset canvas
  if (myChart) {
    myChart.destroy();
    myChart = null;
  }
  document.getElementById('chart').style.display = 'none';
  document.getElementById('chartPlaceholder').style.display = 'block';

  // Clear stored state
  lastScore = 0;
  lastDecision = '';
  lastSuggestions = [];
}

// ──────────────────────────────────────────────
// FLOATING ECO ASSISTANT CHAT
// ──────────────────────────────────────────────
function toggleChat() {
  const panel = document.getElementById('chatPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function quickChat(type) {
  const out = document.getElementById('chatOutput');
  out.style.display = 'block';

  if (type === 'score') {
    out.textContent = lastScore
      ? `Your current sustainability score is ${lastScore}%.`
      : 'Please calculate your score first.';

  } else if (type === 'decision') {
    out.textContent = lastDecision
      ? lastDecision
      : 'Please calculate your score first.';

  } else if (type === 'improve') {
    out.textContent = lastSuggestions.length
      ? lastSuggestions[0].text
      : 'Please calculate your score first.';
  }
}

// Close chat panel when clicking outside
document.addEventListener('click', function (e) {
  const panel = document.getElementById('chatPanel');
  const bubble = document.getElementById('chatBubble');
  if (
    panel.style.display === 'block' &&
    !panel.contains(e.target) &&
    e.target !== bubble
  ) {
    panel.style.display = 'none';
  }
});