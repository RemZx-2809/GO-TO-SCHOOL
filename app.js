/**
 * GoToSchool - Daily University Travel Fare Logger & Monthly Summarizer
 * Enhanced with:
 *  - Horizontal Swipable Day Carousel (No awkward vertical dropdowns!)
 *  - Sticky Month & Year persistence in LocalStorage
 *  - Interactive Calendar Grid Sheet Modal for Mobile
 *  - 1-Click Fast Daily Entry & Multi-legs per day
 *  - Real Calendar Monthly Aggregation & Analytics
 *  - Daily History Log with Edit & Delete
 *  - LocalStorage Data Persistence + JSON Backup/Import & CSV Export
 */

(() => {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    ENTRIES: 'gts_entries_v1',
    STICKY_MONTH: 'gts_sticky_month',
    STICKY_YEAR_BE: 'gts_sticky_year_be',
    LAST_TRANSPORT: 'gts_last_transport',
    THEME: 'gts_theme_pref'
  };

  // Month names in Thai
  const THAI_MONTHS_FULL = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const THAI_DAYS_NAME = [
    'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
  ];

  const THAI_DAYS_SHORT = [
    'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
  ];

  // Transport Icons Map
  const TRANSPORT_ICONS = {
    'รถเมล์': 'fa-bus',
    'รถไฟฟ้า (BTS/MRT/ARL)': 'fa-train-subway',
    'วินมอเตอร์ไซค์': 'fa-motorcycle',
    'รถตู้ / มินิบัส': 'fa-van-shuttle',
    'สองแถว': 'fa-truck-pickup',
    'แท็กซี่ / Grab': 'fa-taxi',
    'เรือโดยสาร': 'fa-ship',
    'อื่นๆ': 'fa-ellipsis'
  };

  // State
  let entries = [];
  let currentSelectedDay = 1;
  let currentSelectedMonth = 1; // 1 - 12
  let currentSelectedYearBE = 2569; // Buddhist Era (B.E.)

  let calendarSheetMonth = 1;
  let calendarSheetYearBE = 2569;

  let summarySelectedMonth = 1;
  let summarySelectedYearBE = 2569;
  let historyFilterDirection = 'all';
  let historySearchQuery = '';

  // DOM Elements Cache
  const el = {
    // Theme
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    
    // Nav Tabs
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    navTripCount: document.getElementById('navTripCount'),
    
    // Top banner
    bannerSelectedDateText: document.getElementById('bannerSelectedDateText'),
    bannerTodayTotal: document.getElementById('bannerTodayTotal'),
    bannerTripsList: document.getElementById('bannerTripsList'),

    // Sticky Date Selectors & Day Strip
    selectMonth: document.getElementById('selectMonth'),
    selectYear: document.getElementById('selectYear'),
    dayStripContainer: document.getElementById('dayStripContainer'),
    btnPrevDay: document.getElementById('btnPrevDay'),
    btnNextDay: document.getElementById('btnNextDay'),
    btnSetToday: document.getElementById('btnSetToday'),
    btnOpenCalendarSheet: document.getElementById('btnOpenCalendarSheet'),
    fullDateDisplay: document.getElementById('fullDateDisplay'),

    // Calendar Sheet Modal
    calendarSheetModal: document.getElementById('calendarSheetModal'),
    btnCloseCalendarSheet: document.getElementById('btnCloseCalendarSheet'),
    calSheetMonthTitle: document.getElementById('calSheetMonthTitle'),
    calSheetDaysGrid: document.getElementById('calSheetDaysGrid'),
    btnCalPrevMonth: document.getElementById('btnCalPrevMonth'),
    btnCalNextMonth: document.getElementById('btnCalNextMonth'),
    btnCalSheetToday: document.getElementById('btnCalSheetToday'),

    // Form
    fareForm: document.getElementById('fareForm'),
    directionRadios: document.querySelectorAll('input[name="direction"]'),
    transportChipsContainer: document.getElementById('transportChipsContainer'),
    transportChips: document.querySelectorAll('.transport-chip'),
    btnCustomTypeToggle: document.getElementById('btnCustomTypeToggle'),
    customTypeWrap: document.getElementById('customTypeWrap'),
    customTypeInput: document.getElementById('customTypeInput'),
    amountInput: document.getElementById('amountInput'),
    btnClearAmount: document.getElementById('btnClearAmount'),
    pillButtons: document.querySelectorAll('.pill-btn'),
    noteInput: document.getElementById('noteInput'),
    noteTags: document.querySelectorAll('.note-tag'),

    // Today list
    selectedDateEntriesCount: document.getElementById('selectedDateEntriesCount'),
    selectedDateEntriesList: document.getElementById('selectedDateEntriesList'),

    // Summary Tab
    summaryMonthSelect: document.getElementById('summaryMonthSelect'),
    summaryYearSelect: document.getElementById('summaryYearSelect'),
    btnSummaryPrevMonth: document.getElementById('btnSummaryPrevMonth'),
    btnSummaryNextMonth: document.getElementById('btnSummaryNextMonth'),
    summaryMonthTitle: document.getElementById('summaryMonthTitle'),
    summaryGrandTotal: document.getElementById('summaryGrandTotal'),
    summaryDepartTotal: document.getElementById('summaryDepartTotal'),
    summaryDepartCount: document.getElementById('summaryDepartCount'),
    summaryReturnTotal: document.getElementById('summaryReturnTotal'),
    summaryReturnCount: document.getElementById('summaryReturnCount'),
    summaryActiveDays: document.getElementById('summaryActiveDays'),
    summaryAvgPerDay: document.getElementById('summaryAvgPerDay'),
    summaryTotalTrips: document.getElementById('summaryTotalTrips'),
    summaryAvgPerTrip: document.getElementById('summaryAvgPerTrip'),
    ratioPercentLabel: document.getElementById('ratioPercentLabel'),
    ratioDepartBar: document.getElementById('ratioDepartBar'),
    ratioReturnBar: document.getElementById('ratioReturnBar'),
    ratioDepartAmt: document.getElementById('ratioDepartAmt'),
    ratioReturnAmt: document.getElementById('ratioReturnAmt'),
    transportBreakdownList: document.getElementById('transportBreakdownList'),

    // History Tab
    historyMonthHeading: document.getElementById('historyMonthHeading'),
    historyTotalSubheading: document.getElementById('historyTotalSubheading'),
    historySearchInput: document.getElementById('historySearchInput'),
    historyChips: document.querySelectorAll('.history-chip'),
    monthlyDailyLogContainer: document.getElementById('monthlyDailyLogContainer'),
    btnExportCSV: document.getElementById('btnExportCSV'),

    // Modals
    editModal: document.getElementById('editModal'),
    editFareForm: document.getElementById('editFareForm'),
    editEntryId: document.getElementById('editEntryId'),
    editDay: document.getElementById('editDay'),
    editMonth: document.getElementById('editMonth'),
    editYear: document.getElementById('editYear'),
    editDirDepart: document.getElementById('editDirDepart'),
    editDirReturn: document.getElementById('editDirReturn'),
    editTransportType: document.getElementById('editTransportType'),
    editAmount: document.getElementById('editAmount'),
    editNote: document.getElementById('editNote'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),
    btnCancelEdit2: document.getElementById('btnCancelEdit2'),

    btnBackup: document.getElementById('btnBackup'),
    backupModal: document.getElementById('backupModal'),
    btnCloseBackup: document.getElementById('btnCloseBackup'),
    btnExportJSON: document.getElementById('btnExportJSON'),
    fileImportJSON: document.getElementById('fileImportJSON'),
    btnClearAllData: document.getElementById('btnClearAllData'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Initializer ---
  function init() {
    loadTheme();
    loadEntriesFromStorage();
    initYearSelectors();
    initStickyDateState();
    setupEventListeners();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();
  }

  // --- Helper Date & Year Calculations ---
  function getDaysInMonth(yearBE, month) {
    const yearCE = yearBE - 543;
    return new Date(yearCE, month, 0).getDate();
  }

  function getFirstDayOfWeek(yearBE, month) {
    const yearCE = yearBE - 543;
    return new Date(yearCE, month - 1, 1).getDay(); // 0 = Sunday, 6 = Saturday
  }

  function getDayOfWeekName(yearBE, month, day) {
    const yearCE = yearBE - 543;
    const dateObj = new Date(yearCE, month - 1, day);
    return THAI_DAYS_NAME[dateObj.getDay()];
  }

  function getDayOfWeekShort(yearBE, month, day) {
    const yearCE = yearBE - 543;
    const dateObj = new Date(yearCE, month - 1, day);
    return THAI_DAYS_SHORT[dateObj.getDay()];
  }

  function formatDateISO(yearBE, month, day) {
    const yearCE = yearBE - 543;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yearCE}-${mm}-${dd}`;
  }

  function formatDisplayDateThai(yearBE, month, day) {
    const dayName = getDayOfWeekName(yearBE, month, day);
    const monthName = THAI_MONTHS_FULL[month - 1];
    return `${dayName}ที่ ${day} ${monthName} ${yearBE}`;
  }

  // --- Theme Management ---
  function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    updateThemeIcon(nextTheme);
  }

  function updateThemeIcon(theme) {
    if (el.btnThemeToggle) {
      el.btnThemeToggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  // --- Storage Management ---
  function loadEntriesFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      entries = data ? JSON.parse(data) : [];
      if (!Array.isArray(entries)) entries = [];
    } catch (err) {
      console.error('Error loading entries from localStorage:', err);
      entries = [];
    }
  }

  function saveEntriesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
      updateNavBadge();
    } catch (err) {
      console.error('Error saving entries to localStorage:', err);
      showToast('ไม่สามารถบันทึกข้อมูลลงในเบราว์เซอร์ได้', 'danger');
    }
  }

  function updateNavBadge() {
    const currentMonthEntries = entries.filter(e => 
      Number(e.month) === Number(summarySelectedMonth) && 
      Number(e.yearBE) === Number(summarySelectedYearBE)
    );
    if (el.navTripCount) {
      el.navTripCount.textContent = currentMonthEntries.length;
    }
  }

  // --- Year Selectors Setup ---
  function initYearSelectors() {
    const now = new Date();
    const currentRealYearBE = now.getFullYear() + 543;
    
    // Generate years range: Current - 2 to Current + 5
    const years = [];
    for (let y = currentRealYearBE - 2; y <= currentRealYearBE + 5; y++) {
      years.push(y);
    }

    const generateOptions = (selectedYear) => {
      return years.map(y => `<option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>`).join('');
    };

    el.selectYear.innerHTML = generateOptions(currentRealYearBE);
    el.summaryYearSelect.innerHTML = generateOptions(currentRealYearBE);
    el.editYear.innerHTML = generateOptions(currentRealYearBE);
  }

  // --- Sticky Date State Init ---
  function initStickyDateState() {
    const now = new Date();
    const todayRealDay = now.getDate();
    const todayRealMonth = now.getMonth() + 1;
    const todayRealYearBE = now.getFullYear() + 543;

    // Retrieve sticky month & year or fallback to real today
    const stickyMonth = localStorage.getItem(STORAGE_KEYS.STICKY_MONTH);
    const stickyYearBE = localStorage.getItem(STORAGE_KEYS.STICKY_YEAR_BE);

    currentSelectedMonth = stickyMonth ? parseInt(stickyMonth, 10) : todayRealMonth;
    currentSelectedYearBE = stickyYearBE ? parseInt(stickyYearBE, 10) : todayRealYearBE;
    currentSelectedDay = todayRealDay;

    calendarSheetMonth = currentSelectedMonth;
    calendarSheetYearBE = currentSelectedYearBE;

    // Summary tab defaults to current sticky month & year
    summarySelectedMonth = currentSelectedMonth;
    summarySelectedYearBE = currentSelectedYearBE;

    el.selectMonth.value = currentSelectedMonth;
    el.selectYear.value = currentSelectedYearBE;
    el.summaryMonthSelect.value = summarySelectedMonth;
    el.summaryYearSelect.value = summarySelectedYearBE;

    // Restore last used transport type chip
    const lastTransport = localStorage.getItem(STORAGE_KEYS.LAST_TRANSPORT);
    if (lastTransport) {
      setTransportTypeSelection(lastTransport);
    }
  }

  function persistStickyDate() {
    localStorage.setItem(STORAGE_KEYS.STICKY_MONTH, currentSelectedMonth);
    localStorage.setItem(STORAGE_KEYS.STICKY_YEAR_BE, currentSelectedYearBE);
  }

  // --- Render Horizontal Swipable Day Strip ---
  function renderDayStrip() {
    const maxDays = getDaysInMonth(currentSelectedYearBE, currentSelectedMonth);
    if (currentSelectedDay > maxDays) {
      currentSelectedDay = maxDays;
    }

    const now = new Date();
    const isCurrentRealMonth = (currentSelectedMonth === (now.getMonth() + 1)) && (currentSelectedYearBE === (now.getFullYear() + 543));
    const realToday = now.getDate();

    // Map of days with entries in this month
    const daysWithEntries = new Set(
      entries
        .filter(e => Number(e.month) === Number(currentSelectedMonth) && Number(e.yearBE) === Number(currentSelectedYearBE))
        .map(e => Number(e.day))
    );

    let html = '';
    for (let d = 1; d <= maxDays; d++) {
      const isSelected = (d === currentSelectedDay);
      const isToday = isCurrentRealMonth && (d === realToday);
      const hasEntry = daysWithEntries.has(d);
      const shortDayName = getDayOfWeekShort(currentSelectedYearBE, currentSelectedMonth, d);

      html += `
        <div class="day-strip-card ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : ''}" 
             data-day="${d}" 
             id="dayCard_${d}"
             role="button"
             aria-label="วันที่ ${d} ${shortDayName}">
          <span class="weekday-label">${shortDayName}</span>
          <span class="day-num">${String(d).padStart(2, '0')}</span>
          ${hasEntry ? '<span class="entry-indicator-dot"></span>' : ''}
        </div>
      `;
    }

    el.dayStripContainer.innerHTML = html;

    // Attach click listeners to cards
    const cards = el.dayStripContainer.querySelectorAll('.day-strip-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const day = parseInt(card.dataset.day, 10);
        selectDay(day);
      });
    });

    scrollActiveDayIntoView();
  }

  function selectDay(day) {
    const maxDays = getDaysInMonth(currentSelectedYearBE, currentSelectedMonth);
    if (day < 1) day = 1;
    if (day > maxDays) day = maxDays;

    currentSelectedDay = day;

    // Update active class on day cards
    const cards = el.dayStripContainer.querySelectorAll('.day-strip-card');
    cards.forEach(c => {
      if (parseInt(c.dataset.day, 10) === currentSelectedDay) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    scrollActiveDayIntoView();
    syncUIWithSelectedDate();
  }

  function scrollActiveDayIntoView() {
    setTimeout(() => {
      const activeCard = document.getElementById(`dayCard_${currentSelectedDay}`);
      if (activeCard && el.dayStripContainer) {
        const containerWidth = el.dayStripContainer.offsetWidth;
        const cardLeft = activeCard.offsetLeft;
        const cardWidth = activeCard.offsetWidth;
        el.dayStripContainer.scrollTo({
          left: cardLeft - (containerWidth / 2) + (cardWidth / 2),
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  // --- Render Calendar Grid Bottom Sheet ---
  function openCalendarSheet() {
    calendarSheetMonth = currentSelectedMonth;
    calendarSheetYearBE = currentSelectedYearBE;
    renderCalendarSheetGrid();
    el.calendarSheetModal.style.display = 'flex';
  }

  function closeCalendarSheet() {
    el.calendarSheetModal.style.display = 'none';
  }

  function renderCalendarSheetGrid() {
    el.calSheetMonthTitle.textContent = `${THAI_MONTHS_FULL[calendarSheetMonth - 1]} ${calendarSheetYearBE}`;

    const maxDays = getDaysInMonth(calendarSheetYearBE, calendarSheetMonth);
    const firstDayIndex = getFirstDayOfWeek(calendarSheetYearBE, calendarSheetMonth); // 0 (Sun) - 6 (Sat)

    const now = new Date();
    const isCurrentRealMonth = (calendarSheetMonth === (now.getMonth() + 1)) && (calendarSheetYearBE === (now.getFullYear() + 543));
    const realToday = now.getDate();

    const daysWithEntries = new Set(
      entries
        .filter(e => Number(e.month) === Number(calendarSheetMonth) && Number(e.yearBE) === Number(calendarSheetYearBE))
        .map(e => Number(e.day))
    );

    let html = '';

    // Empty cells for alignment before day 1
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell empty"></div>`;
    }

    // Day cells 1..maxDays
    for (let d = 1; d <= maxDays; d++) {
      const isSelected = (d === currentSelectedDay && calendarSheetMonth === currentSelectedMonth && calendarSheetYearBE === currentSelectedYearBE);
      const isToday = isCurrentRealMonth && (d === realToday);
      const hasEntry = daysWithEntries.has(d);

      html += `
        <div class="cal-day-cell ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : ''}" 
             data-day="${d}">
          <span>${d}</span>
        </div>
      `;
    }

    el.calSheetDaysGrid.innerHTML = html;

    // Attach click listeners
    const cells = el.calSheetDaysGrid.querySelectorAll('.cal-day-cell:not(.empty)');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.day, 10);
        currentSelectedMonth = calendarSheetMonth;
        currentSelectedYearBE = calendarSheetYearBE;
        el.selectMonth.value = currentSelectedMonth;
        el.selectYear.value = currentSelectedYearBE;
        
        renderDayStrip();
        selectDay(day);
        closeCalendarSheet();
      });
    });
  }

  // --- Synchronize UI with Selected Date ---
  function syncUIWithSelectedDate() {
    persistStickyDate();

    const maxDays = getDaysInMonth(currentSelectedYearBE, currentSelectedMonth);
    if (currentSelectedDay > maxDays) currentSelectedDay = maxDays;

    const fullDateText = formatDisplayDateThai(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay);
    el.fullDateDisplay.textContent = fullDateText;
    el.bannerSelectedDateText.textContent = `${currentSelectedDay} ${THAI_MONTHS_FULL[currentSelectedMonth - 1]}`;

    renderDayEntriesList();
    renderBannerSummary();
    updateNavBadge();
  }

  // --- Banner & Day Entries List ---
  function getSelectedDateEntries() {
    return entries.filter(item => 
      Number(item.day) === Number(currentSelectedDay) &&
      Number(item.month) === Number(currentSelectedMonth) &&
      Number(item.yearBE) === Number(currentSelectedYearBE)
    );
  }

  function renderBannerSummary() {
    const dayEntries = getSelectedDateEntries();
    const totalDayCost = dayEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    el.bannerTodayTotal.textContent = totalDayCost.toLocaleString('th-TH');

    if (dayEntries.length === 0) {
      el.bannerTripsList.innerHTML = '<span class="no-trips-hint">ยังไม่มีรายการในวันที่เลือกนี้</span>';
    } else {
      el.bannerTripsList.innerHTML = dayEntries.map(e => `
        <span class="banner-trip-pill">
          <i class="fa-solid ${e.direction === 'depart' ? 'fa-graduation-cap' : 'fa-house'}"></i>
          ${escapeHtml(e.transportType)}: ฿${e.amount}
        </span>
      `).join('');
    }
  }

  function renderDayEntriesList() {
    const dayEntries = getSelectedDateEntries();
    el.selectedDateEntriesCount.textContent = `${dayEntries.length} รายการ`;

    if (dayEntries.length === 0) {
      el.selectedDateEntriesList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <p>ยังไม่มีรายการบันทึกสำหรับวันนี้</p>
          <small style="color: var(--text-light); font-size: 0.76rem;">กรอกแบบฟอร์มด้านล่างแล้วกด "บันทึกรายการนี้"</small>
        </div>
      `;
      return;
    }

    el.selectedDateEntriesList.innerHTML = dayEntries.map(entry => {
      const isDepart = entry.direction === 'depart';
      const iconClass = getTransportIconClass(entry.transportType);
      return `
        <div class="entry-item ${isDepart ? 'depart' : 'return'}" data-id="${entry.id}">
          <div class="entry-left">
            <div class="entry-type-icon">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="entry-info">
              <div class="entry-name">
                <span>${escapeHtml(entry.transportType)}</span>
                <span class="dir-badge ${isDepart ? 'depart' : 'return'}">
                  ${isDepart ? 'ขาไป' : 'ขากลับ'}
                </span>
              </div>
              <span class="entry-note">${entry.note ? escapeHtml(entry.note) : 'ไม่มีหมายเหตุ'}</span>
            </div>
          </div>
          <div class="entry-right">
            <span class="entry-price">฿${Number(entry.amount).toLocaleString('th-TH')}</span>
            <div class="entry-actions">
              <button type="button" class="action-btn-mini edit" onclick="window.gtsApp.openEditModal('${entry.id}')" title="แก้ไข">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="action-btn-mini delete" onclick="window.gtsApp.deleteEntry('${entry.id}')" title="ลบ">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getTransportIconClass(transportType) {
    if (!transportType) return 'fa-bus';
    for (const [key, icon] of Object.entries(TRANSPORT_ICONS)) {
      if (transportType.includes(key) || key.includes(transportType)) return icon;
    }
    return 'fa-van-shuttle';
  }

  // --- Transport Type Selection Helpers ---
  function getSelectedTransportType() {
    if (el.customTypeWrap.style.display !== 'none' && el.customTypeInput.value.trim()) {
      return el.customTypeInput.value.trim();
    }
    const activeChip = el.transportChipsContainer.querySelector('.transport-chip.active');
    if (activeChip) {
      if (activeChip.dataset.type === 'อื่นๆ' && el.customTypeInput.value.trim()) {
        return el.customTypeInput.value.trim();
      }
      return activeChip.dataset.type;
    }
    return 'รถเมล์';
  }

  function setTransportTypeSelection(type) {
    let matched = false;
    el.transportChips.forEach(chip => {
      if (chip.dataset.type === type) {
        chip.classList.add('active');
        matched = true;
      } else {
        chip.classList.remove('active');
      }
    });

    if (!matched) {
      const otherChip = Array.from(el.transportChips).find(c => c.dataset.type === 'อื่นๆ');
      if (otherChip) otherChip.classList.add('active');
      el.customTypeWrap.style.display = 'block';
      el.customTypeInput.value = type;
    } else {
      el.customTypeWrap.style.display = 'none';
    }
  }

  // --- Monthly Summary Tab Rendering ---
  function renderSummaryTab() {
    const selectedMonth = Number(el.summaryMonthSelect.value);
    const selectedYearBE = Number(el.summaryYearSelect.value);

    summarySelectedMonth = selectedMonth;
    summarySelectedYearBE = selectedYearBE;

    const monthTitle = `สรุปค่าใช้จ่าย ${THAI_MONTHS_FULL[selectedMonth - 1]} ${selectedYearBE}`;
    el.summaryMonthTitle.textContent = monthTitle;
    el.historyMonthHeading.textContent = `รายการประจำ ${THAI_MONTHS_FULL[selectedMonth - 1]} ${selectedYearBE}`;

    // Filter entries for this month & year
    const monthEntries = entries.filter(e => 
      Number(e.month) === selectedMonth && 
      Number(e.yearBE) === selectedYearBE
    );

    // Compute Metrics
    let grandTotal = 0;
    let departTotal = 0;
    let departCount = 0;
    let returnTotal = 0;
    let returnCount = 0;
    const uniqueDays = new Set();
    const typeTotals = {};

    monthEntries.forEach(entry => {
      const amt = Number(entry.amount || 0);
      grandTotal += amt;
      uniqueDays.add(entry.day);

      if (entry.direction === 'depart') {
        departTotal += amt;
        departCount++;
      } else {
        returnTotal += amt;
        returnCount++;
      }

      const typeKey = entry.transportType || 'อื่นๆ';
      typeTotals[typeKey] = (typeTotals[typeKey] || 0) + amt;
    });

    const activeDaysCount = uniqueDays.size;
    const avgPerDay = activeDaysCount > 0 ? Math.round(grandTotal / activeDaysCount) : 0;
    const totalTrips = monthEntries.length;
    const avgPerTrip = totalTrips > 0 ? (grandTotal / totalTrips).toFixed(1) : 0;

    // Update UI Stats
    el.summaryGrandTotal.textContent = grandTotal.toLocaleString('th-TH');
    el.summaryDepartTotal.textContent = `฿${departTotal.toLocaleString('th-TH')}`;
    el.summaryDepartCount.textContent = `${departCount} เที่ยว/ต่อ`;
    el.summaryReturnTotal.textContent = `฿${returnTotal.toLocaleString('th-TH')}`;
    el.summaryReturnCount.textContent = `${returnCount} เที่ยว/ต่อ`;
    el.summaryActiveDays.textContent = `${activeDaysCount} วัน`;
    el.summaryAvgPerDay.textContent = `เฉลี่ย ฿${avgPerDay.toLocaleString('th-TH')}/วัน`;
    el.summaryTotalTrips.textContent = `${totalTrips} รายการ`;
    el.summaryAvgPerTrip.textContent = `เฉลี่ย ฿${avgPerTrip}/รายการ`;

    el.historyTotalSubheading.textContent = `ยอดรวมทั้งเดือน: ${grandTotal.toLocaleString('th-TH')} บาท (${totalTrips} รายการ)`;

    // Direction Ratio Progress Bar
    const departPercent = grandTotal > 0 ? Math.round((departTotal / grandTotal) * 100) : 50;
    const returnPercent = grandTotal > 0 ? (100 - departPercent) : 50;

    el.ratioPercentLabel.textContent = `ขาไป ${departPercent}% / ขากลับ ${returnPercent}%`;
    el.ratioDepartBar.style.width = `${departPercent}%`;
    el.ratioReturnBar.style.width = `${returnPercent}%`;
    el.ratioDepartAmt.textContent = `฿${departTotal.toLocaleString('th-TH')}`;
    el.ratioReturnAmt.textContent = `฿${returnTotal.toLocaleString('th-TH')}`;

    // Transport Types Breakdown List
    renderTransportBreakdown(typeTotals, grandTotal);
    updateNavBadge();
  }

  function renderTransportBreakdown(typeTotals, grandTotal) {
    const sortedTypes = Object.entries(typeTotals).sort((a, b) => b[1] - a[1]);

    if (sortedTypes.length === 0) {
      el.transportBreakdownList.innerHTML = `
        <div class="empty-state" style="padding: 12px;">
          <p>ยังไม่มีข้อมูลในเดือนนี้</p>
        </div>
      `;
      return;
    }

    el.transportBreakdownList.innerHTML = sortedTypes.map(([type, amount]) => {
      const percentage = grandTotal > 0 ? ((amount / grandTotal) * 100).toFixed(1) : 0;
      const icon = getTransportIconClass(type);
      return `
        <div class="breakdown-item">
          <div class="breakdown-info">
            <div class="breakdown-type">
              <i class="fa-solid ${icon}" style="color: var(--primary); width: 20px;"></i>
              <span>${escapeHtml(type)}</span>
            </div>
            <div class="breakdown-amounts">
              <span class="breakdown-total">฿${amount.toLocaleString('th-TH')}</span>
              <span class="breakdown-percentage">(${percentage}%)</span>
            </div>
          </div>
          <div class="breakdown-bar-bg">
            <div class="breakdown-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Monthly Daily Log History Rendering ---
  function renderHistoryTab() {
    const selectedMonth = Number(el.summaryMonthSelect.value);
    const selectedYearBE = Number(el.summaryYearSelect.value);

    let monthEntries = entries.filter(e => 
      Number(e.month) === selectedMonth && 
      Number(e.yearBE) === selectedYearBE
    );

    // Apply Direction filter
    if (historyFilterDirection !== 'all') {
      monthEntries = monthEntries.filter(e => e.direction === historyFilterDirection);
    }

    // Apply Search query
    if (historySearchQuery) {
      const query = historySearchQuery.toLowerCase();
      monthEntries = monthEntries.filter(e => 
        (e.transportType && e.transportType.toLowerCase().includes(query)) ||
        (e.note && e.note.toLowerCase().includes(query)) ||
        (String(e.amount).includes(query))
      );
    }

    if (monthEntries.length === 0) {
      el.monthlyDailyLogContainer.innerHTML = `
        <div class="empty-state card">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>ไม่พบรายการเดินทางในเดือนนี้ตามเงื่อนไขที่ค้นหา</p>
        </div>
      `;
      return;
    }

    // Group entries by day (Descending order: newest days first)
    const groupedByDay = {};
    monthEntries.forEach(item => {
      const day = item.day;
      if (!groupedByDay[day]) groupedByDay[day] = [];
      groupedByDay[day].push(item);
    });

    const sortedDays = Object.keys(groupedByDay).map(Number).sort((a, b) => b - a);

    el.monthlyDailyLogContainer.innerHTML = sortedDays.map(day => {
      const dayList = groupedByDay[day];
      const dayTotal = dayList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const dayOfWeek = getDayOfWeekName(selectedYearBE, selectedMonth, day);

      const itemsHtml = dayList.map(entry => {
        const isDepart = entry.direction === 'depart';
        const iconClass = getTransportIconClass(entry.transportType);
        return `
          <div class="entry-item ${isDepart ? 'depart' : 'return'}" style="background: var(--bg-card);">
            <div class="entry-left">
              <div class="entry-type-icon">
                <i class="fa-solid ${iconClass}"></i>
              </div>
              <div class="entry-info">
                <div class="entry-name">
                  <span>${escapeHtml(entry.transportType)}</span>
                  <span class="dir-badge ${isDepart ? 'depart' : 'return'}">
                    ${isDepart ? 'ขาไป' : 'ขากลับ'}
                  </span>
                </div>
                <span class="entry-note">${entry.note ? escapeHtml(entry.note) : 'ไม่มีหมายเหตุ'}</span>
              </div>
            </div>
            <div class="entry-right">
              <span class="entry-price">฿${Number(entry.amount).toLocaleString('th-TH')}</span>
              <div class="entry-actions">
                <button type="button" class="action-btn-mini edit" onclick="window.gtsApp.openEditModal('${entry.id}')" title="แก้ไข">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="action-btn-mini delete" onclick="window.gtsApp.deleteEntry('${entry.id}')" title="ลบ">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="day-group-card">
          <div class="day-group-header">
            <div class="day-date-badge">
              <span class="day-number">${String(day).padStart(2, '0')}</span>
              <span class="day-name">${dayOfWeek} ${THAI_MONTHS_FULL[selectedMonth - 1]}</span>
            </div>
            <span class="day-total-badge">รวม ฿${dayTotal.toLocaleString('th-TH')}</span>
          </div>
          <div class="day-trips-list">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Add Entry Form Handler ---
  function handleFormSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(el.amountInput.value);
    if (isNaN(amount) || amount < 0) {
      showToast('กรุณากรอกจำนวนเงินค่าโดยสารที่ถูกต้อง', 'warning');
      el.amountInput.focus();
      return;
    }

    const directionInput = document.querySelector('input[name="direction"]:checked');
    const direction = directionInput ? directionInput.value : 'depart';
    const transportType = getSelectedTransportType();
    const note = el.noteInput.value.trim();

    const newEntry = {
      id: 'gts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      day: Number(currentSelectedDay),
      month: Number(currentSelectedMonth),
      yearBE: Number(currentSelectedYearBE),
      isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
      direction,
      transportType,
      amount,
      note,
      createdAt: new Date().toISOString()
    };

    entries.unshift(newEntry);
    saveEntriesToStorage();

    // Persist last transport
    localStorage.setItem(STORAGE_KEYS.LAST_TRANSPORT, transportType);

    // Reset amount & note input, but keep direction & transport mode for rapid logging
    el.amountInput.value = '';
    el.noteInput.value = '';

    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast(`บันทึก ${transportType} ฿${amount} สำเร็จ!`, 'success');
  }

  // --- Edit Modal Operations ---
  function openEditModal(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    el.editEntryId.value = entry.id;
    el.editYear.value = entry.yearBE;
    el.editMonth.value = entry.month;
    
    // Populate day selector for this year/month
    const maxDays = getDaysInMonth(entry.yearBE, entry.month);
    let optionsHtml = '';
    for (let d = 1; d <= maxDays; d++) {
      optionsHtml += `<option value="${d}" ${d === Number(entry.day) ? 'selected' : ''}>${d}</option>`;
    }
    el.editDay.innerHTML = optionsHtml;
    el.editDay.value = entry.day;

    if (entry.direction === 'depart') {
      el.editDirDepart.checked = true;
    } else {
      el.editDirReturn.checked = true;
    }

    el.editTransportType.value = entry.transportType;
    el.editAmount.value = entry.amount;
    el.editNote.value = entry.note || '';

    el.editModal.style.display = 'flex';
  }

  function closeEditModal() {
    el.editModal.style.display = 'none';
  }

  function handleEditFormSubmit(e) {
    e.preventDefault();
    const id = el.editEntryId.value;
    const index = entries.findIndex(item => item.id === id);
    if (index === -1) return;

    const day = Number(el.editDay.value);
    const month = Number(el.editMonth.value);
    const yearBE = Number(el.editYear.value);
    const direction = document.querySelector('input[name="editDirection"]:checked').value;
    const transportType = el.editTransportType.value.trim() || 'รถเมล์';
    const amount = parseFloat(el.editAmount.value) || 0;
    const note = el.editNote.value.trim();

    entries[index] = {
      ...entries[index],
      day,
      month,
      yearBE,
      isoDate: formatDateISO(yearBE, month, day),
      direction,
      transportType,
      amount,
      note,
      updatedAt: new Date().toISOString()
    };

    saveEntriesToStorage();
    closeEditModal();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast('แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
  }

  // --- Delete Entry Operation ---
  function deleteEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    const confirmMsg = `ต้องการลบรายการ "${entry.transportType}" จำนวน ฿${entry.amount} ใช่หรือไม่?`;
    if (!confirm(confirmMsg)) return;

    entries = entries.filter(e => e.id !== id);
    saveEntriesToStorage();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  }

  // --- Export & Import Operations ---
  function exportCSV() {
    const selectedMonth = Number(el.summaryMonthSelect.value);
    const selectedYearBE = Number(el.summaryYearSelect.value);
    const monthEntries = entries.filter(e => 
      Number(e.month) === selectedMonth && 
      Number(e.yearBE) === selectedYearBE
    );

    if (monthEntries.length === 0) {
      showToast('ไม่มีรายการในเดือนนี้ให้ส่งออก', 'warning');
      return;
    }

    // CSV Headers
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += 'วันที่,วัน,เดือน,ปี พ.ศ.,ทิศทาง,ประเภทการเดินทาง,ราคาค่าโดยสาร (บาท),หมายเหตุ\n';

    monthEntries.forEach(e => {
      const dirText = e.direction === 'depart' ? 'ขาไป' : 'ขากลับ';
      const cleanNote = (e.note || '').replace(/"/g, '""');
      const cleanType = (e.transportType || '').replace(/"/g, '""');
      csvContent += `"${e.day}/${e.month}/${e.yearBE}",${e.day},"${THAI_MONTHS_FULL[e.month - 1]}",${e.yearBE},"${dirText}","${cleanType}",${e.amount},"${cleanNote}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GoToSchool_Travel_Fare_${THAI_MONTHS_FULL[selectedMonth - 1]}_${selectedYearBE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success');
  }

  function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GoToSchool_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('ส่งออกไฟล์สำรอง JSON เรียบร้อยแล้ว', 'success');
  }

  function handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          entries = importedData;
          saveEntriesToStorage();
          renderDayStrip();
          syncUIWithSelectedDate();
          renderSummaryTab();
          renderHistoryTab();
          showToast(`นำเข้าข้อมูลเรียบร้อยแล้ว (${entries.length} รายการ)`, 'success');
          el.backupModal.style.display = 'none';
        } else {
          showToast('รูปแบบไฟล์ไม่ถูกต้อง', 'danger');
        }
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  }

  function clearAllData() {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลค่าโดยสารทั้งหมดที่บันทึกไว้ในเครื่อง? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      entries = [];
      saveEntriesToStorage();
      renderDayStrip();
      syncUIWithSelectedDate();
      renderSummaryTab();
      renderHistoryTab();
      el.backupModal.style.display = 'none';
      showToast('ล้างข้อมูลทั้งหมดในเครื่องแล้ว', 'info');
    }
  }

  // --- Toast System ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'danger') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2600);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Theme toggle
    el.btnThemeToggle.addEventListener('click', toggleTheme);

    // Tab Switching
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.navTabs.forEach(t => t.classList.remove('active'));
        el.tabPanes.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        if (targetId === 'summary-tab') renderSummaryTab();
        if (targetId === 'history-tab') renderHistoryTab();
      });
    });

    // Sticky Month / Year Controls
    el.selectMonth.addEventListener('change', (e) => {
      currentSelectedMonth = parseInt(e.target.value, 10);
      renderDayStrip();
      syncUIWithSelectedDate();
      el.summaryMonthSelect.value = currentSelectedMonth;
      renderSummaryTab();
    });

    el.selectYear.addEventListener('change', (e) => {
      currentSelectedYearBE = parseInt(e.target.value, 10);
      renderDayStrip();
      syncUIWithSelectedDate();
      el.summaryYearSelect.value = currentSelectedYearBE;
      renderSummaryTab();
    });

    // Day Navigation Arrows
    el.btnPrevDay.addEventListener('click', () => {
      if (currentSelectedDay > 1) {
        selectDay(currentSelectedDay - 1);
      } else {
        const maxDays = getDaysInMonth(currentSelectedYearBE, currentSelectedMonth);
        selectDay(maxDays);
      }
    });

    el.btnNextDay.addEventListener('click', () => {
      const maxDays = getDaysInMonth(currentSelectedYearBE, currentSelectedMonth);
      if (currentSelectedDay < maxDays) {
        selectDay(currentSelectedDay + 1);
      } else {
        selectDay(1);
      }
    });

    // Jump to Today
    el.btnSetToday.addEventListener('click', () => {
      const now = new Date();
      currentSelectedDay = now.getDate();
      currentSelectedMonth = now.getMonth() + 1;
      currentSelectedYearBE = now.getFullYear() + 543;

      el.selectMonth.value = currentSelectedMonth;
      el.selectYear.value = currentSelectedYearBE;
      renderDayStrip();
      syncUIWithSelectedDate();
      showToast('เลือกวันที่ปัจจุบันแล้ว', 'info');
    });

    // Calendar Sheet Trigger
    el.btnOpenCalendarSheet.addEventListener('click', openCalendarSheet);
    el.fullDateDisplay.addEventListener('click', openCalendarSheet);
    el.fullDateDisplay.style.cursor = 'pointer';

    el.btnCloseCalendarSheet.addEventListener('click', closeCalendarSheet);

    el.btnCalPrevMonth.addEventListener('click', () => {
      calendarSheetMonth--;
      if (calendarSheetMonth < 1) {
        calendarSheetMonth = 12;
        calendarSheetYearBE--;
      }
      renderCalendarSheetGrid();
    });

    el.btnCalNextMonth.addEventListener('click', () => {
      calendarSheetMonth++;
      if (calendarSheetMonth > 12) {
        calendarSheetMonth = 1;
        calendarSheetYearBE++;
      }
      renderCalendarSheetGrid();
    });

    el.btnCalSheetToday.addEventListener('click', () => {
      const now = new Date();
      currentSelectedDay = now.getDate();
      currentSelectedMonth = now.getMonth() + 1;
      currentSelectedYearBE = now.getFullYear() + 543;

      el.selectMonth.value = currentSelectedMonth;
      el.selectYear.value = currentSelectedYearBE;
      renderDayStrip();
      syncUIWithSelectedDate();
      closeCalendarSheet();
      showToast('เลือกวันที่ปัจจุบันแล้ว', 'info');
    });

    // Transport Chips Click
    el.transportChips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.transportChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (chip.dataset.type === 'อื่นๆ') {
          el.customTypeWrap.style.display = 'block';
          el.customTypeInput.focus();
        } else {
          el.customTypeWrap.style.display = 'none';
        }
      });
    });

    el.btnCustomTypeToggle.addEventListener('click', () => {
      if (el.customTypeWrap.style.display === 'none') {
        el.customTypeWrap.style.display = 'block';
        el.customTypeInput.focus();
      } else {
        el.customTypeWrap.style.display = 'none';
      }
    });

    // Quick Amount Pills
    el.pillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.amountInput.value = btn.dataset.amt;
        el.amountInput.focus();
      });
    });

    el.btnClearAmount.addEventListener('click', () => {
      el.amountInput.value = '';
      el.amountInput.focus();
    });

    // Quick Note Tags
    el.noteTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const currentVal = el.noteInput.value.trim();
        const tagVal = tag.dataset.note;
        if (!currentVal) {
          el.noteInput.value = tagVal;
        } else if (!currentVal.includes(tagVal)) {
          el.noteInput.value = `${currentVal}, ${tagVal}`;
        }
        el.noteInput.focus();
      });
    });

    // Form Submit
    el.fareForm.addEventListener('submit', handleFormSubmit);

    // Summary Month / Year Selector Changes
    el.summaryMonthSelect.addEventListener('change', () => {
      renderSummaryTab();
      renderHistoryTab();
    });

    el.summaryYearSelect.addEventListener('change', () => {
      renderSummaryTab();
      renderHistoryTab();
    });

    el.btnSummaryPrevMonth.addEventListener('click', () => {
      let m = Number(el.summaryMonthSelect.value) - 1;
      let y = Number(el.summaryYearSelect.value);
      if (m < 1) {
        m = 12;
        y--;
      }
      el.summaryMonthSelect.value = m;
      el.summaryYearSelect.value = y;
      renderSummaryTab();
      renderHistoryTab();
    });

    el.btnSummaryNextMonth.addEventListener('click', () => {
      let m = Number(el.summaryMonthSelect.value) + 1;
      let y = Number(el.summaryYearSelect.value);
      if (m > 12) {
        m = 1;
        y++;
      }
      el.summaryMonthSelect.value = m;
      el.summaryYearSelect.value = y;
      renderSummaryTab();
      renderHistoryTab();
    });

    // History Filters & Search
    el.historyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.historyChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        historyFilterDirection = chip.dataset.filter;
        renderHistoryTab();
      });
    });

    el.historySearchInput.addEventListener('input', (e) => {
      historySearchQuery = e.target.value.trim();
      renderHistoryTab();
    });

    el.btnExportCSV.addEventListener('click', exportCSV);

    // Modals
    el.btnCancelEdit.addEventListener('click', closeEditModal);
    el.btnCancelEdit2.addEventListener('click', closeEditModal);
    el.editFareForm.addEventListener('submit', handleEditFormSubmit);

    el.btnBackup.addEventListener('click', () => { el.backupModal.style.display = 'flex'; });
    el.btnCloseBackup.addEventListener('click', () => { el.backupModal.style.display = 'none'; });
    el.btnExportJSON.addEventListener('click', exportJSON);
    el.fileImportJSON.addEventListener('change', handleImportJSON);
    el.btnClearAllData.addEventListener('click', clearAllData);

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target === el.editModal) closeEditModal();
      if (e.target === el.backupModal) el.backupModal.style.display = 'none';
      if (e.target === el.calendarSheetModal) closeCalendarSheet();
    });
  }

  // Expose global methods for inline HTML onclick handlers
  window.gtsApp = {
    openEditModal,
    deleteEntry
  };

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
