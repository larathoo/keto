// ── 0. CONFIG ──────────────────────────────────────────────────────────────────

// ── 1. CONSTANTS & FOOD DATABASE ──────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  dailyCarbLimit:  20,
  height:          170,
  heightUnit:      'cm',
  weightUnit:      'kg',
  warnThreshold:   80
};

// carbs/calories/protein/fat are per `qty` units
const FOOD_DB = [
  { name: 'Eggs',         unit: 'eggs',    qty: 2,   carbs: 1,    calories: 140, protein: 12,  fat: 10  },
  { name: 'Bacon',        unit: 'rashers', qty: 3,   carbs: 0,    calories: 135, protein: 9,   fat: 11  },
  { name: 'Avocado',      unit: 'halves',  qty: 1,   carbs: 2,    calories: 120, protein: 1,   fat: 11  },
  { name: 'Cheddar',      unit: 'g',       qty: 30,  carbs: 0.4,  calories: 120, protein: 7,   fat: 10  },
  { name: 'Chicken',      unit: 'g',       qty: 100, carbs: 0,    calories: 165, protein: 31,  fat: 3.6 },
  { name: 'Salmon',       unit: 'g',       qty: 100, carbs: 0,    calories: 208, protein: 20,  fat: 13  },
  { name: 'Butter',       unit: 'g',       qty: 15,  carbs: 0,    calories: 108, protein: 0,   fat: 12  },
  { name: 'Almonds',      unit: 'g',       qty: 30,  carbs: 2.5,  calories: 173, protein: 6,   fat: 15  },
  { name: 'Broccoli',     unit: 'g',       qty: 80,  carbs: 4,    calories: 28,  protein: 2,   fat: 0.3 },
  { name: 'Spinach',      unit: 'g',       qty: 50,  carbs: 0.4,  calories: 11,  protein: 1.4, fat: 0.2 },
  { name: 'Beef Mince',   unit: 'g',       qty: 100, carbs: 0,    calories: 250, protein: 26,  fat: 17  },
  { name: 'Cream',        unit: 'ml',      qty: 30,  carbs: 0.9,  calories: 103, protein: 0.6, fat: 11  },
  { name: 'Olives',       unit: 'g',       qty: 30,  carbs: 0.5,  calories: 42,  protein: 0.3, fat: 4   },
  { name: 'Pork Belly',   unit: 'g',       qty: 100, carbs: 0,    calories: 242, protein: 27,  fat: 14  },
  { name: 'Greek Yogurt', unit: 'serving', qty: 1,   carbs: 3.6,  calories: 59,  protein: 10,  fat: 0.4 },
  { name: 'Cucumber',     unit: 'g',       qty: 80,  carbs: 2,    calories: 12,  protein: 0.6, fat: 0.1 },
  { name: 'Cream Cheese', unit: 'tbsp',    qty: 1,   carbs: 1,    calories: 100, protein: 2,   fat: 10  },
  { name: 'Tuna',         unit: 'g',       qty: 100, carbs: 0,    calories: 116, protein: 26,  fat: 1   },
];

// ── 2. STORAGE MODULE ──────────────────────────────────────────────────────────

const Storage = {
  getSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('keto_settings') || '{}') };
    } catch { return { ...DEFAULT_SETTINGS }; }
  },
  saveSettings(s) {
    localStorage.setItem('keto_settings', JSON.stringify(s));
  },
  getMeals() {
    try { return JSON.parse(localStorage.getItem('keto_meals') || '{}'); }
    catch { return {}; }
  },
  getMealsForDate(dateStr) {
    return Storage.getMeals()[dateStr] || [];
  },
  saveMeal(dateStr, meal) {
    const all = Storage.getMeals();
    if (!all[dateStr]) all[dateStr] = [];
    all[dateStr].push(meal);
    localStorage.setItem('keto_meals', JSON.stringify(all));
  },
  deleteMeal(dateStr, mealId) {
    const all = Storage.getMeals();
    if (all[dateStr]) {
      all[dateStr] = all[dateStr].filter(m => m.id !== mealId);
      localStorage.setItem('keto_meals', JSON.stringify(all));
    }
  },
  getCustomFoods() {
    try { return JSON.parse(localStorage.getItem('keto_custom_foods') || '[]'); }
    catch { return []; }
  },
  saveCustomFood(food) {
    const all = Storage.getCustomFoods();
    all.push(food);
    localStorage.setItem('keto_custom_foods', JSON.stringify(all));
  },
  deleteCustomFood(id) {
    const all = Storage.getCustomFoods().filter(f => f.id !== id);
    localStorage.setItem('keto_custom_foods', JSON.stringify(all));
  },
  getWeights() {
    try { return JSON.parse(localStorage.getItem('keto_weights') || '{}'); }
    catch { return {}; }
  },
  saveWeight(dateStr, entry) {
    const all = Storage.getWeights();
    all[dateStr] = entry;
    localStorage.setItem('keto_weights', JSON.stringify(all));
  }
};

// ── 3. UTILS ───────────────────────────────────────────────────────────────────

const Utils = {
  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  },
  formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  },
  calcBMI(weight, weightUnit, height, heightUnit) {
    const kg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
    const m  = heightUnit === 'cm'  ? height / 100 : height * 0.0254;
    if (!m || !kg) return null;
    return +(kg / (m * m)).toFixed(1);
  },
  bmiCategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
    if (bmi < 25)   return { label: 'Normal',      color: '#22c55e' };
    if (bmi < 30)   return { label: 'Overweight',  color: '#fb923c' };
    return                  { label: 'Obese',       color: '#f87171' };
  },
  bmiPointerPct(bmi) {
    return Math.min(100, Math.max(0, ((bmi - 14) / 26) * 100));
  },
  genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
  currentTimeStr() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  },
  roundNum(n) {
    return Math.round(n * 10) / 10;
  }
};

// ── 4. STATE ───────────────────────────────────────────────────────────────────

const State = {
  activeTab: 'dashboard',
  weightChart: null,
  macroChart: null,
  clearConfirmTimer: null,
};

// ── 5. DASHBOARD MODULE ────────────────────────────────────────────────────────

const Dashboard = {
  CIRCUMFERENCE: 2 * Math.PI * 76, // r=76 → ≈ 477.5

  render() {
    const today    = Utils.todayStr();
    const settings = Storage.getSettings();
    const meals    = Storage.getMealsForDate(today);
    const weights  = Storage.getWeights();

    // Totals
    const totals = meals.reduce(
      (acc, m) => ({
        carbs:    acc.carbs    + (parseFloat(m.carbs)    || 0),
        calories: acc.calories + (parseFloat(m.calories) || 0),
        protein:  acc.protein  + (parseFloat(m.protein)  || 0),
        fat:      acc.fat      + (parseFloat(m.fat)      || 0),
      }),
      { carbs: 0, calories: 0, protein: 0, fat: 0 }
    );

    const limit = settings.dailyCarbLimit;
    const pct   = limit > 0 ? totals.carbs / limit : 0;
    const warnPct = (settings.warnThreshold || 80) / 100;

    // Ring progress
    const ring     = document.getElementById('carb-ring');
    const progress = document.getElementById('carb-ring-progress');
    const offset   = Dashboard.CIRCUMFERENCE - Math.min(pct, 1) * Dashboard.CIRCUMFERENCE;
    progress.style.strokeDasharray  = Dashboard.CIRCUMFERENCE;
    progress.style.strokeDashoffset = Math.max(0, offset);

    // Ring classes
    ring.classList.remove('warning', 'over-limit');
    if (totals.carbs > limit)         ring.classList.add('over-limit');
    else if (pct >= warnPct)          ring.classList.add('warning');

    // Ring text
    document.getElementById('ring-carbs-val').textContent = `${Utils.roundNum(totals.carbs)}g`;
    document.getElementById('ring-carbs-lim').textContent = `/ ${limit}g limit`;
    const remaining = limit - totals.carbs;
    const remEl = document.getElementById('ring-carbs-rem');
    if (remaining >= 0) {
      remEl.textContent = `${Utils.roundNum(remaining)}g left`;
    } else {
      remEl.textContent = `${Utils.roundNum(Math.abs(remaining))}g over!`;
    }

    // Macro pills
    document.getElementById('dash-calories').textContent = Math.round(totals.calories);
    document.getElementById('dash-protein').textContent  = Utils.roundNum(totals.protein);
    document.getElementById('dash-fat').textContent      = Utils.roundNum(totals.fat);

    // Weight card
    const todayWeight = weights[today];
    const weightKeys  = Object.keys(weights).sort();
    const latestKey   = weightKeys[weightKeys.length - 1];
    const latestEntry = latestKey ? weights[latestKey] : null;

    const weightVal  = document.getElementById('dash-weight-val');
    const weightUnit = document.getElementById('dash-weight-unit');
    const weightDate = document.getElementById('dash-weight-date');
    const bmiEl      = document.getElementById('dash-bmi');
    const bmiCatEl   = document.getElementById('dash-bmi-cat');

    if (latestEntry) {
      weightVal.textContent  = latestEntry.weight;
      weightUnit.textContent = settings.weightUnit;
      weightDate.textContent = latestKey === today ? 'Logged today' : `Last: ${Utils.formatDateShort(latestKey)}`;
      if (latestEntry.bmi) {
        const cat = Utils.bmiCategory(latestEntry.bmi);
        bmiEl.textContent       = latestEntry.bmi;
        bmiEl.style.color       = cat.color;
        bmiCatEl.textContent    = cat.label;
        bmiCatEl.style.color    = cat.color;
      } else {
        bmiEl.textContent = '--';
        bmiCatEl.textContent = 'Set height in settings';
      }
    } else {
      weightVal.textContent  = '--';
      weightUnit.textContent = settings.weightUnit;
      weightDate.textContent = 'Not logged yet';
      bmiEl.textContent      = '--';
      bmiCatEl.textContent   = '';
    }

    // Macro chart
    Dashboard.renderMacroChart(totals);

    // Meals list
    Dashboard.renderMealsList(meals, today);
  },

  renderMacroChart(totals) {
    const wrap   = document.getElementById('macro-chart-wrap');
    const legend = document.getElementById('macro-chart-legend');
    const empty  = document.getElementById('macro-chart-empty');
    const canvas = document.getElementById('macro-chart');

    const values = [Utils.roundNum(totals.carbs), Utils.roundNum(totals.protein), Utils.roundNum(totals.fat)];
    const total  = values[0] + values[1] + values[2];

    if (total === 0) {
      wrap.style.display   = 'none';
      legend.style.display = 'none';
      empty.style.display  = '';
      if (State.macroChart) { State.macroChart.destroy(); State.macroChart = null; }
      return;
    }

    wrap.style.display   = '';
    legend.style.display = '';
    empty.style.display  = 'none';

    const labels = ['Carbs', 'Protein', 'Fat'];
    const colors = ['#fb923c', '#60a5fa', '#4ade80'];

    if (State.macroChart) { State.macroChart.destroy(); State.macroChart = null; }

    State.macroChart = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}g` } }
        }
      }
    });

    legend.innerHTML = labels.map((l, i) => `
      <div class="macro-legend-item">
        <span class="macro-legend-dot" style="background:${colors[i]}"></span>
        <span class="macro-legend-name">${l}</span>
        <span class="macro-legend-val">${values[i]}g</span>
        <span class="macro-legend-pct">${Math.round(values[i] / total * 100)}%</span>
      </div>`).join('');
  },

  renderMealsList(meals, today) {
    const list = document.getElementById('meals-today-list');
    if (!meals.length) {
      list.innerHTML = '<li class="empty-state">No meals logged today yet.</li>';
      return;
    }
    const sorted = [...meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    list.innerHTML = sorted.map(m => `
      <li>
        <span class="meal-time">${m.time || '--:--'}</span>
        <span class="meal-name">${escHtml(m.name)}</span>
        <span class="meal-carbs">${Utils.roundNum(m.carbs)}g</span>
        <button class="delete-meal-btn" data-meal-id="${m.id}" data-date="${today}" title="Remove">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </li>
    `).join('');
  },

  bindDeleteMeal() {
    document.getElementById('meals-today-list').addEventListener('click', e => {
      const btn = e.target.closest('.delete-meal-btn');
      if (!btn) return;
      const { mealId, date } = btn.dataset;
      Storage.deleteMeal(date, mealId);
      Dashboard.render();
    });
  }
};

// ── 6. LOG MEAL MODULE ─────────────────────────────────────────────────────────

const LogMeal = {
  init() {
    LogMeal.renderChips();
    document.getElementById('meal-form').addEventListener('submit', LogMeal.handleSubmit);
    document.getElementById('meal-time').value = Utils.currentTimeStr();
  },

  renderChips() {
    const container = document.getElementById('food-chips');
    container.innerHTML = '';

    const addChip = (food, deletable) => {
      const wrap = document.createElement('div');
      wrap.className = 'food-chip-wrap';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'food-chip';
      btn.innerHTML = `<span class="chip-name">${escHtml(food.name)}</span><span class="chip-carbs">${food.carbs}g carbs / ${food.qty} ${food.unit}</span>`;
      btn.addEventListener('click', () => IngredientBuilder.add(food));
      wrap.appendChild(btn);

      if (deletable) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'chip-delete';
        del.setAttribute('aria-label', `Remove ${food.name}`);
        del.textContent = '×';
        del.addEventListener('click', e => {
          e.stopPropagation();
          Storage.deleteCustomFood(food.id);
          LogMeal.renderChips();
        });
        wrap.appendChild(del);
      }

      container.appendChild(wrap);
    };

    Storage.getCustomFoods().forEach(food => addChip(food, true));
    FOOD_DB.forEach(food => addChip(food, false));
  },

  handleSubmit(e) {
    e.preventDefault();
    const name     = document.getElementById('meal-name').value.trim();
    const carbsRaw = document.getElementById('meal-carbs').value;
    const time     = document.getElementById('meal-time').value || Utils.currentTimeStr();
    const calories = parseFloat(document.getElementById('meal-calories').value) || 0;
    const protein  = parseFloat(document.getElementById('meal-protein').value)  || 0;
    const fat      = parseFloat(document.getElementById('meal-fat').value)      || 0;

    const feedback = document.getElementById('form-feedback');

    if (!name) {
      LogMeal.showFeedback('Please enter a meal name.', 'error');
      return;
    }
    if (carbsRaw === '' || isNaN(parseFloat(carbsRaw)) || parseFloat(carbsRaw) < 0) {
      LogMeal.showFeedback('Please enter a valid carb amount (0 or more).', 'error');
      return;
    }

    const meal = {
      id:       Utils.genId(),
      time,
      name,
      carbs:    parseFloat(carbsRaw),
      calories,
      protein,
      fat,
    };

    if (document.getElementById('meal-save-food').checked) {
      Storage.saveCustomFood({ id: Utils.genId(), name, carbs: parseFloat(carbsRaw), calories, protein, fat, qty: 100, unit: 'g' });
      LogMeal.renderChips();
    }

    Storage.saveMeal(Utils.todayStr(), meal);
    e.target.reset();
    document.getElementById('meal-time').value = Utils.currentTimeStr();
    LogMeal.showFeedback('Meal added!', 'success');

    if (State.activeTab === 'dashboard') Dashboard.render();
  },

  showFeedback(msg, type) {
    const el = document.getElementById('form-feedback');
    el.textContent = msg;
    el.className = `form-feedback ${type}`;
    clearTimeout(LogMeal._feedbackTimer);
    LogMeal._feedbackTimer = setTimeout(() => {
      el.textContent = '';
      el.className = 'form-feedback';
    }, 2500);
  },

  _feedbackTimer: null,
};

// ── 7. INGREDIENT BUILDER ──────────────────────────────────────────────────────

const IngredientBuilder = {
  items: [],

  init() {
    document.getElementById('builder-meal-time').value = Utils.currentTimeStr();

    document.getElementById('log-ingredients-btn').addEventListener('click', IngredientBuilder.handleLog);

    document.getElementById('clear-ingredients-btn').addEventListener('click', () => {
      IngredientBuilder.items = [];
      const nameEl = document.getElementById('builder-meal-name');
      nameEl.value = '';
      delete nameEl.dataset.userEdited;
      IngredientBuilder.render();
    });

    document.getElementById('builder-meal-name').addEventListener('input', e => {
      e.target.dataset.userEdited = '1';
    });

    document.getElementById('ingredient-list').addEventListener('click', e => {
      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const idx  = parseInt(qtyBtn.dataset.idx);
        const step = parseFloat(qtyBtn.dataset.step) || 1;
        if (qtyBtn.dataset.action === 'inc') {
          IngredientBuilder.items[idx].qty = Utils.roundNum(IngredientBuilder.items[idx].qty + step);
        } else {
          IngredientBuilder.items[idx].qty = Math.max(step, Utils.roundNum(IngredientBuilder.items[idx].qty - step));
        }
        IngredientBuilder.render();
        return;
      }
      const delBtn = e.target.closest('.delete-ingredient-btn');
      if (delBtn) {
        IngredientBuilder.items.splice(parseInt(delBtn.dataset.idx), 1);
        IngredientBuilder._autoName();
        IngredientBuilder.render();
      }
    });

    document.getElementById('ingredient-list').addEventListener('change', e => {
      const input = e.target.closest('.qty-input');
      if (!input) return;
      const idx = parseInt(input.dataset.idx);
      const val = parseFloat(input.value);
      if (val > 0) {
        IngredientBuilder.items[idx].qty = val;
        IngredientBuilder.render();
      } else {
        input.value = IngredientBuilder.items[idx].qty;
      }
    });
  },

  add(food) {
    const step = (food.unit === 'g' || food.unit === 'ml') ? 5 : 1;
    const existing = IngredientBuilder.items.find(i => i.food.name === food.name);
    if (existing) {
      existing.qty = Utils.roundNum(existing.qty + step);
    } else {
      IngredientBuilder.items.push({ food, qty: food.qty });
    }
    IngredientBuilder._autoName();
    IngredientBuilder.render();
    document.getElementById('ingredient-builder-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  _autoName() {
    const nameEl = document.getElementById('builder-meal-name');
    if (nameEl.dataset.userEdited) return;
    if (!IngredientBuilder.items.length) {
      nameEl.value = '';
      return;
    }
    const names = IngredientBuilder.items.slice(0, 2).map(i => i.food.name);
    nameEl.value = names.join(', ') + (IngredientBuilder.items.length > 2 ? ` +${IngredientBuilder.items.length - 2}` : '');
  },

  getTotals() {
    return IngredientBuilder.items.reduce((acc, { food, qty }) => {
      const scale = qty / food.qty;
      return {
        carbs:    acc.carbs    + food.carbs    * scale,
        calories: acc.calories + food.calories * scale,
        protein:  acc.protein  + food.protein  * scale,
        fat:      acc.fat      + food.fat      * scale,
      };
    }, { carbs: 0, calories: 0, protein: 0, fat: 0 });
  },

  render() {
    const card = document.getElementById('ingredient-builder-card');
    const list = document.getElementById('ingredient-list');
    const totalsEl = document.getElementById('ingredient-totals');

    if (!IngredientBuilder.items.length) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';

    list.innerHTML = IngredientBuilder.items.map(({ food, qty }, idx) => {
      const scale = qty / food.qty;
      const carbs = Utils.roundNum(food.carbs * scale);
      const cals  = Math.round(food.calories * scale);
      const prot  = Utils.roundNum(food.protein * scale);
      const fat   = Utils.roundNum(food.fat * scale);
      const step  = (food.unit === 'g' || food.unit === 'ml') ? 5 : 1;
      return `
        <li class="ingredient-row">
          <div class="ingredient-info">
            <span class="ingredient-name">${escHtml(food.name)}</span>
            <span class="ingredient-macros">${carbs}g carbs · ${cals} kcal · ${prot}g protein · ${fat}g fat</span>
          </div>
          <div class="ingredient-qty">
            <button type="button" class="qty-btn" data-action="dec" data-idx="${idx}" data-step="${step}">−</button>
            <input class="qty-input" type="number" value="${qty}" min="0.5" step="${step}" data-idx="${idx}" />
            <button type="button" class="qty-btn" data-action="inc" data-idx="${idx}" data-step="${step}">+</button>
            <span class="qty-unit">${escHtml(food.unit)}</span>
          </div>
          <button type="button" class="delete-ingredient-btn" data-idx="${idx}" title="Remove">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </li>`;
    }).join('');

    const t = IngredientBuilder.getTotals();
    totalsEl.innerHTML = `
      <div class="totals-row">
        <span class="totals-label">Total</span>
        <span class="totals-carbs-val">${Utils.roundNum(t.carbs)}g carbs</span>
        <span class="totals-detail">${Math.round(t.calories)} kcal · ${Utils.roundNum(t.protein)}g protein · ${Utils.roundNum(t.fat)}g fat</span>
      </div>`;
  },

  handleLog() {
    if (!IngredientBuilder.items.length) return;
    const totals = IngredientBuilder.getTotals();
    const nameEl = document.getElementById('builder-meal-name');
    const timeEl = document.getElementById('builder-meal-time');
    const name   = nameEl.value.trim() || IngredientBuilder.items.map(i => i.food.name).join(', ');
    const time   = timeEl.value || Utils.currentTimeStr();

    Storage.saveMeal(Utils.todayStr(), {
      id:       Utils.genId(),
      time,
      name,
      carbs:    Utils.roundNum(totals.carbs),
      calories: Math.round(totals.calories),
      protein:  Utils.roundNum(totals.protein),
      fat:      Utils.roundNum(totals.fat),
    });

    IngredientBuilder.items = [];
    nameEl.value = '';
    delete nameEl.dataset.userEdited;
    timeEl.value = Utils.currentTimeStr();
    IngredientBuilder.render();

    const fb = document.getElementById('builder-feedback');
    fb.textContent = 'Meal logged!';
    fb.className = 'form-feedback success';
    clearTimeout(IngredientBuilder._feedbackTimer);
    IngredientBuilder._feedbackTimer = setTimeout(() => {
      fb.textContent = '';
      fb.className = 'form-feedback';
    }, 2500);

    if (State.activeTab === 'dashboard') Dashboard.render();
  },

  _feedbackTimer: null,
};

// ── 8. FOOD SEARCH ─────────────────────────────────────────────────────────────

const FoodSearch = {
  _debounceTimer: null,
  _abortController: null,
  _lastResults: [],

  init() {
    const input = document.getElementById('food-search-input');

    input.addEventListener('input', () => {
      clearTimeout(FoodSearch._debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) { FoodSearch.hideResults(); return; }
      FoodSearch._debounceTimer = setTimeout(() => FoodSearch.search(q), 420);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { FoodSearch.hideResults(); input.blur(); }
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.food-search-wrap')) FoodSearch.hideResults();
    });
  },

  async search(query) {
    if (FoodSearch._abortController) FoodSearch._abortController.abort();
    FoodSearch._abortController = new AbortController();
    FoodSearch._setSpinner(true);

    try {
      const url =
        `https://world.openfoodfacts.org/cgi/search.pl` +
        `?search_terms=${encodeURIComponent(query)}` +
        `&search_simple=1&action=process&json=1&page_size=8` +
        `&fields=product_name,brands,nutriments`;
      const res = await fetch(url, { signal: FoodSearch._abortController.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      FoodSearch._setSpinner(false);
      FoodSearch._showResults(data.products || []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      FoodSearch._setSpinner(false);
      FoodSearch._showMessage('Search unavailable. Check your connection.', true);
    }
  },

  _showResults(foods) {
    const list = document.getElementById('food-search-results');

    if (!foods.length) {
      FoodSearch._showMessage('No results found.');
      return;
    }

    FoodSearch._lastResults = foods
      .filter(food => food.product_name)
      .map(food => ({
        name: FoodSearch._titleCase(
          food.brands ? `${food.product_name} (${food.brands})` : food.product_name
        ),
        unit: 'g',
        qty:  100,
        ...FoodSearch._extractNutrients(food.nutriments || {}),
      }));

    if (!FoodSearch._lastResults.length) {
      FoodSearch._showMessage('No results found.');
      return;
    }

    list.innerHTML = FoodSearch._lastResults.map((food, i) => `
      <li class="search-result-item" data-idx="${i}">
        <span class="search-result-name">${escHtml(food.name)}</span>
        <span class="search-result-macros">${food.carbs}g carbs · ${food.calories} kcal · ${food.protein}g protein per 100g</span>
      </li>`).join('');

    list.querySelectorAll('.search-result-item').forEach(li => {
      li.addEventListener('click', () => {
        const food = FoodSearch._lastResults[parseInt(li.dataset.idx)];
        IngredientBuilder.add(food);
        document.getElementById('food-search-input').value = '';
        FoodSearch.hideResults();
      });
    });

    list.style.display = '';
  },

  _showMessage(msg, isError = false) {
    const list = document.getElementById('food-search-results');
    list.innerHTML = `<li class="search-no-results${isError ? ' search-error' : ''}">${escHtml(msg)}</li>`;
    list.style.display = '';
  },

  hideResults() {
    const list = document.getElementById('food-search-results');
    list.style.display = 'none';
    list.innerHTML = '';
  },

  _setSpinner(visible) {
    document.getElementById('food-search-spinner').style.display = visible ? '' : 'none';
  },

  _extractNutrients(n) {
    const get = key => Utils.roundNum(n[key] ?? 0);
    return {
      calories: get('energy-kcal_100g'),
      carbs:    get('carbohydrates_100g'),
      protein:  get('proteins_100g'),
      fat:      get('fat_100g'),
    };
  },

  _titleCase(str) {
    return str.toLowerCase().replace(/(?:^|\s)\w/g, c => c.toUpperCase());
  },
};

// ── 9. WEIGHT MODULE ───────────────────────────────────────────────────────────

const Weight = {
  render() {
    const settings = Storage.getSettings();
    const today    = Utils.todayStr();
    const weights  = Storage.getWeights();

    // Set unit label
    document.getElementById('weight-unit-label').textContent = settings.weightUnit;

    // Pre-fill if already logged today
    const todayEntry = weights[today];
    const input = document.getElementById('weight-input');
    if (todayEntry) {
      input.value = todayEntry.weight;
      Weight.updateBMIDisplay(todayEntry.weight);
    } else {
      input.value = '';
      document.getElementById('bmi-live').innerHTML = '';
    }

    Weight.renderChart();
    if (todayEntry && todayEntry.bmi) {
      Weight.updatePointer(todayEntry.bmi);
    }
  },

  handleInput() {
    const val = parseFloat(document.getElementById('weight-input').value);
    if (!val || val <= 0) {
      document.getElementById('bmi-live').innerHTML = '';
      return;
    }
    Weight.updateBMIDisplay(val);
  },

  updateBMIDisplay(weight) {
    const settings = Storage.getSettings();
    const bmi = Utils.calcBMI(weight, settings.weightUnit, settings.height, settings.heightUnit);
    const liveEl = document.getElementById('bmi-live');
    if (bmi) {
      const cat = Utils.bmiCategory(bmi);
      liveEl.innerHTML = `BMI: <strong style="color:${cat.color}">${bmi} — ${cat.label}</strong>`;
      Weight.updatePointer(bmi);
    } else {
      liveEl.textContent = 'Set your height in Settings to see BMI.';
    }
  },

  updatePointer(bmi) {
    const pct = Utils.bmiPointerPct(bmi);
    document.getElementById('bmi-pointer').style.left = `${pct}%`;
    const cat = Utils.bmiCategory(bmi);
    document.getElementById('bmi-pointer-label').textContent = `Your BMI: ${bmi} — ${cat.label}`;
    document.getElementById('bmi-pointer-label').style.color = cat.color;
  },

  handleSave() {
    const val = parseFloat(document.getElementById('weight-input').value);
    if (!val || val <= 0) {
      alert('Please enter a valid weight.');
      return;
    }
    const settings = Storage.getSettings();
    const bmi = Utils.calcBMI(val, settings.weightUnit, settings.height, settings.heightUnit);
    const today = Utils.todayStr();
    Storage.saveWeight(today, { weight: val, bmi });

    // Visual confirmation
    const btn = document.getElementById('save-weight-btn');
    const orig = btn.textContent;
    btn.textContent = 'Saved ✓';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 1800);

    Weight.renderChart();
    if (bmi) Weight.updatePointer(bmi);
    if (State.activeTab === 'dashboard') Dashboard.render();
  },

  renderChart() {
    const settings = Storage.getSettings();
    const all      = Storage.getWeights();
    const keys     = Object.keys(all).sort();

    const canvas  = document.getElementById('weight-chart');
    const placeholder = document.getElementById('chart-placeholder');

    if (keys.length < 2) {
      canvas.style.display = 'none';
      placeholder.style.display = 'block';
      if (State.weightChart) { State.weightChart.destroy(); State.weightChart = null; }
      return;
    }

    canvas.style.display = 'block';
    placeholder.style.display = 'none';

    const last30 = keys.slice(-30);
    const labels = last30.map(k => Utils.formatDateShort(k));
    const data   = last30.map(k => all[k].weight);

    if (State.weightChart) { State.weightChart.destroy(); State.weightChart = null; }

    const ctx = canvas.getContext('2d');
    State.weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Weight (${settings.weightUnit})`,
          data,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(34,197,94,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          tension: 0.35,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} ${settings.weightUnit}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 7, font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { size: 11 },
              callback: v => `${v} ${settings.weightUnit}`
            }
          }
        }
      }
    });
  }
};

// ── 8. HISTORY MODULE ──────────────────────────────────────────────────────────

const History = {
  render() {
    const allMeals  = Storage.getMeals();
    const today     = Utils.todayStr();
    const currentMo = today.slice(0, 7);

    // Build month list
    const monthSet = new Set(Object.keys(allMeals).map(d => d.slice(0, 7)));
    monthSet.add(currentMo);
    const months = [...monthSet].sort().reverse();

    const sel = document.getElementById('history-month');
    const prevVal = sel.value;
    sel.innerHTML = months.map(m => {
      const d = new Date(m + '-01');
      const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      return `<option value="${m}">${label}</option>`;
    }).join('');

    // Restore selection or default to current month
    if (prevVal && months.includes(prevVal)) sel.value = prevVal;
    else sel.value = currentMo;

    History.renderForMonth(sel.value);
  },

  renderForMonth(yearMonth) {
    const allMeals = Storage.getMeals();
    const settings = Storage.getSettings();
    const list     = document.getElementById('history-list');

    const keys = Object.keys(allMeals)
      .filter(k => k.startsWith(yearMonth) && allMeals[k].length > 0)
      .sort()
      .reverse();

    if (!keys.length) {
      list.innerHTML = '<div class="history-empty">No meals logged this month.</div>';
      return;
    }

    list.innerHTML = keys.map(dateStr => {
      const meals = allMeals[dateStr];
      const totalCarbs = meals.reduce((s, m) => s + (parseFloat(m.carbs) || 0), 0);
      const limit      = settings.dailyCarbLimit;
      const pct        = limit > 0 ? totalCarbs / limit : 0;

      let badgeClass = 'badge-green';
      if      (pct > 1)   badgeClass = 'badge-red';
      else if (pct > 0.8) badgeClass = 'badge-orange';

      const sorted = [...meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      const mealItems = sorted.map(m => `
        <li>
          <span class="hm-time">${m.time || '--'}</span>
          <span class="hm-name">${escHtml(m.name)}</span>
          <span class="hm-carbs">${Utils.roundNum(m.carbs)}g</span>
        </li>
      `).join('');

      return `
        <div class="card history-day">
          <div class="history-day-header">
            <span class="history-day-date">${Utils.formatDate(dateStr)}</span>
            <span class="carb-badge ${badgeClass}">${Utils.roundNum(totalCarbs)}g carbs</span>
          </div>
          <ul class="history-meals">${mealItems}</ul>
        </div>
      `;
    }).join('');
  }
};

// ── 9. SETTINGS MODULE ─────────────────────────────────────────────────────────

const Settings = {
  render() {
    const s = Storage.getSettings();
    document.getElementById('set-carb-limit').value    = s.dailyCarbLimit;
    document.getElementById('set-warn-threshold').value = s.warnThreshold;
    document.getElementById('warn-output').textContent  = `${s.warnThreshold}%`;
    document.getElementById('set-weight-unit').value   = s.weightUnit;
    document.getElementById('set-height-unit').value   = s.heightUnit;

    if (s.heightUnit === 'cm') {
      document.getElementById('set-height-cm').value = s.height;
      Settings.showCmHeight();
    } else {
      const totalIn = s.height;
      document.getElementById('set-height-ft').value = Math.floor(totalIn / 12);
      document.getElementById('set-height-in').value = totalIn % 12;
      Settings.showFtHeight();
    }
  },

  showCmHeight() {
    document.getElementById('height-cm-group').style.display = '';
    document.getElementById('height-ft-group').style.display = 'none';
  },

  showFtHeight() {
    document.getElementById('height-cm-group').style.display = 'none';
    document.getElementById('height-ft-group').style.display = '';
  },

  bindHeightUnitToggle() {
    document.getElementById('set-height-unit').addEventListener('change', e => {
      if (e.target.value === 'cm') Settings.showCmHeight();
      else                         Settings.showFtHeight();
    });
  },

  bindRangeOutput() {
    document.getElementById('set-warn-threshold').addEventListener('input', e => {
      document.getElementById('warn-output').textContent = `${e.target.value}%`;
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    const carbLimit = parseInt(document.getElementById('set-carb-limit').value, 10);
    const warnThr   = parseInt(document.getElementById('set-warn-threshold').value, 10);
    const weightUnit = document.getElementById('set-weight-unit').value;
    const heightUnit = document.getElementById('set-height-unit').value;

    let height = 0;
    if (heightUnit === 'cm') {
      height = parseFloat(document.getElementById('set-height-cm').value) || 0;
    } else {
      const ft = parseInt(document.getElementById('set-height-ft').value, 10) || 0;
      const inches = parseInt(document.getElementById('set-height-in').value, 10) || 0;
      height = ft * 12 + inches; // stored as total inches
    }

    if (carbLimit < 5 || carbLimit > 150) {
      Settings.showFeedback('Carb limit must be between 5 and 150g.', 'error');
      return;
    }

    Storage.saveSettings({ dailyCarbLimit: carbLimit, height, heightUnit, weightUnit, warnThreshold: warnThr });
    Settings.showFeedback('Settings saved!', 'success');

    if (State.activeTab === 'weight')     Weight.render();
    if (State.activeTab === 'dashboard')  Dashboard.render();
  },

  showFeedback(msg, type) {
    const el = document.getElementById('settings-feedback');
    el.textContent = msg;
    el.className = `form-feedback ${type}`;
    clearTimeout(Settings._timer);
    Settings._timer = setTimeout(() => {
      el.textContent = '';
      el.className = 'form-feedback';
    }, 2500);
  },

  bindDangerZone() {
    const btn = document.getElementById('clear-data-btn');
    btn.addEventListener('click', () => {
      if (btn.classList.contains('confirm-state')) {
        // Second click — clear data
        clearTimeout(State.clearConfirmTimer);
        localStorage.removeItem('keto_meals');
        localStorage.removeItem('keto_weights');
        btn.textContent = 'Data cleared.';
        btn.classList.remove('confirm-state');
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = 'Clear All Data';
          btn.disabled = false;
        }, 2000);
        // Re-render dashboard and history if needed
        if (State.activeTab === 'dashboard') Dashboard.render();
        if (State.activeTab === 'history')   History.render();
      } else {
        // First click — ask for confirm
        btn.textContent = 'Tap again to confirm';
        btn.classList.add('confirm-state');
        State.clearConfirmTimer = setTimeout(() => {
          btn.textContent = 'Clear All Data';
          btn.classList.remove('confirm-state');
        }, 3000);
      }
    });
  },

  _timer: null,
};

// ── 10. NAV / TAB ROUTING ──────────────────────────────────────────────────────

const Nav = {
  init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => Nav.go(btn.dataset.tab));
    });
  },

  go(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    const targetBtn   = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const targetPanel = document.getElementById(`tab-${tabName}`);
    if (targetBtn)   targetBtn.classList.add('active');
    if (targetPanel) targetPanel.classList.add('active');

    State.activeTab = tabName;

    const renders = {
      dashboard: () => Dashboard.render(),
      weight:    () => Weight.render(),
      history:   () => History.render(),
      settings:  () => Settings.render(),
    };
    renders[tabName]?.();
  }
};

// ── HELPERS ────────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── 11. INIT ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Header date
  document.getElementById('header-date').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // One-time bindings
  Nav.init();
  LogMeal.init();
  IngredientBuilder.init();
  FoodSearch.init();
  Dashboard.bindDeleteMeal();
  Settings.bindRangeOutput();
  Settings.bindHeightUnitToggle();
  Settings.bindDangerZone();

  document.getElementById('weight-input').addEventListener('input', Weight.handleInput);
  document.getElementById('save-weight-btn').addEventListener('click', Weight.handleSave);
  document.getElementById('history-month').addEventListener('change', e => {
    History.renderForMonth(e.target.value);
  });
  document.getElementById('settings-form').addEventListener('submit', Settings.handleSubmit);

  // Initial render
  Nav.go('dashboard');
});
