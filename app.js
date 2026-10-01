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
    THEME: 'gts_theme_pref',
    USER_PROFILE: 'gts_user_profile'
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
    checkBothWays: document.getElementById('checkBothWays'),

    // Quick Repeat Bar
    btnGenReturnFromDepart: document.getElementById('btnGenReturnFromDepart'),
    btnCopyPrevDay: document.getElementById('btnCopyPrevDay'),
    btnRepeatLast: document.getElementById('btnRepeatLast'),

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
    btnSummaryExportPDF: document.getElementById('btnSummaryExportPDF'),

    // History Tab
    historyMonthHeading: document.getElementById('historyMonthHeading'),
    historyTotalSubheading: document.getElementById('historyTotalSubheading'),
    historySearchInput: document.getElementById('historySearchInput'),
    historyChips: document.querySelectorAll('.history-chip'),
    monthlyDailyLogContainer: document.getElementById('monthlyDailyLogContainer'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnExportPDF: document.getElementById('btnExportPDF'),

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

    // PDF Report Modal
    pdfReportModal: document.getElementById('pdfReportModal'),
    btnClosePdfModal: document.getElementById('btnClosePdfModal'),
    btnDownloadPDF: document.getElementById('btnDownloadPDF'),
    btnPrintPDF: document.getElementById('btnPrintPDF'),
    pdfPrintableContent: document.getElementById('pdfPrintableContent'),
    pdfAuthorNameInput: document.getElementById('pdfAuthorNameInput'),
    pdfAuthorSubInput: document.getElementById('pdfAuthorSubInput'),
    btnSavePdfAuthor: document.getElementById('btnSavePdfAuthor'),

    // User Profile Modal
    btnUserProfile: document.getElementById('btnUserProfile'),
    userProfileModal: document.getElementById('userProfileModal'),
    btnCloseUserProfile: document.getElementById('btnCloseUserProfile'),
    btnCancelUserProfile: document.getElementById('btnCancelUserProfile'),
    userProfileForm: document.getElementById('userProfileForm'),
    profileUserNameInput: document.getElementById('profileUserNameInput'),
    profileUserSubInput: document.getElementById('profileUserSubInput'),

    // Clear Month Controls
    btnClearMonthSummary: document.getElementById('btnClearMonthSummary'),
    btnClearMonthHistory: document.getElementById('btnClearMonthHistory'),
    clearMonthConfirmModal: document.getElementById('clearMonthConfirmModal'),
    btnCloseClearMonthModal: document.getElementById('btnCloseClearMonthModal'),
    btnCancelClearMonth: document.getElementById('btnCancelClearMonth'),
    btnConfirmDeleteMonth: document.getElementById('btnConfirmDeleteMonth'),
    clearMonthTargetName: document.getElementById('clearMonthTargetName'),
    clearMonthTargetCount: document.getElementById('clearMonthTargetCount'),
    clearMonthTargetTotal: document.getElementById('clearMonthTargetTotal'),

    // Duplicate Modal
    duplicateModal: document.getElementById('duplicateModal'),
    btnCloseDuplicateModal: document.getElementById('btnCloseDuplicateModal'),
    duplicateItemPreview: document.getElementById('duplicateItemPreview'),
    btnDupSameDaySameDir: document.getElementById('btnDupSameDaySameDir'),
    btnDupSameDayOppositeDir: document.getElementById('btnDupSameDayOppositeDir'),
    btnDupToToday: document.getElementById('btnDupToToday'),
    dupTargetDateLabel: document.getElementById('dupTargetDateLabel'),
    
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
              <button type="button" class="action-btn-mini copy" onclick="window.gtsApp.openDuplicateModal('${entry.id}')" title="ทำซ้ำรายการนี้">
                <i class="fa-solid fa-clone"></i>
              </button>
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
                <button type="button" class="action-btn-mini copy" onclick="window.gtsApp.openDuplicateModal('${entry.id}')" title="ทำซ้ำรายการนี้">
                  <i class="fa-solid fa-clone"></i>
                </button>
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
    const isRoundTripBoth = el.checkBothWays && el.checkBothWays.checked;

    if (isRoundTripBoth) {
      // Create both Depart and Return entries in 1 click
      const departEntry = {
        id: 'gts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        day: Number(currentSelectedDay),
        month: Number(currentSelectedMonth),
        yearBE: Number(currentSelectedYearBE),
        isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
        direction: 'depart',
        transportType,
        amount,
        note: note ? `${note} (ขาไป)` : '',
        createdAt: new Date().toISOString()
      };

      const returnEntry = {
        id: 'gts_' + (Date.now() + 1) + '_' + Math.random().toString(36).substring(2, 7),
        day: Number(currentSelectedDay),
        month: Number(currentSelectedMonth),
        yearBE: Number(currentSelectedYearBE),
        isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
        direction: 'return',
        transportType,
        amount,
        note: note ? `${note} (ขากลับ)` : '',
        createdAt: new Date(Date.now() + 1).toISOString()
      };

      entries.unshift(returnEntry);
      entries.unshift(departEntry);
      saveEntriesToStorage();

      localStorage.setItem(STORAGE_KEYS.LAST_TRANSPORT, transportType);

      el.amountInput.value = '';
      el.noteInput.value = '';

      renderDayStrip();
      syncUIWithSelectedDate();
      renderSummaryTab();
      renderHistoryTab();

      showToast(`บันทึกแบบไป-กลับ (${transportType} ฿${amount} x2 เที่ยว) เรียบร้อย!`, 'success');
      return;
    }

    // Single Entry
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

  // --- Quick Repeat & Duplication Operations ---
  function generateReturnTripsFromDepart() {
    const dayEntries = getSelectedDateEntries();
    const departEntries = dayEntries.filter(e => e.direction === 'depart');

    if (departEntries.length === 0) {
      showToast('ยังไม่มีรายการขาไปของวันนี้สำหรับสร้างขากลับ', 'warning');
      return;
    }

    // Invert sequence for realistic return commute
    const reversedDepart = [...departEntries].reverse();
    const newReturnEntries = reversedDepart.map((dep, index) => {
      let returnNote = dep.note || '';
      if (returnNote.includes('ต่อ 1')) returnNote = returnNote.replace('ต่อ 1', `ขากลับต่อ ${index + 1}`);
      else if (returnNote.includes('เที่ยวไป')) returnNote = returnNote.replace('เที่ยวไป', 'เที่ยวกลับ');
      else if (returnNote.includes('ขาไป')) returnNote = returnNote.replace('ขาไป', 'ขากลับ');
      else if (!returnNote) returnNote = `ขากลับ`;

      return {
        id: 'gts_' + (Date.now() + index + 2) + '_' + Math.random().toString(36).substring(2, 7),
        day: Number(currentSelectedDay),
        month: Number(currentSelectedMonth),
        yearBE: Number(currentSelectedYearBE),
        isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
        direction: 'return',
        transportType: dep.transportType,
        amount: Number(dep.amount),
        note: returnNote,
        createdAt: new Date(Date.now() + index + 2).toISOString()
      };
    });

    newReturnEntries.forEach(entry => entries.unshift(entry));
    saveEntriesToStorage();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast(`สร้างรายการขากลับให้อัตโนมัติ ${newReturnEntries.length} รายการแล้ว!`, 'success');
  }

  function copyTripsFromPreviousDay() {
    const curYear = Number(currentSelectedYearBE);
    const curMonth = Number(currentSelectedMonth);
    const curDay = Number(currentSelectedDay);

    // 1. Look for previous active day in the same month first (day < curDay)
    const earlierInMonth = entries
      .filter(e => Number(e.yearBE) === curYear && Number(e.month) === curMonth && Number(e.day) < curDay)
      .sort((a, b) => Number(b.day) - Number(a.day));

    let sourceEntries = [];
    let sourceDateText = '';

    if (earlierInMonth.length > 0) {
      const targetDay = earlierInMonth[0].day;
      sourceEntries = earlierInMonth.filter(e => Number(e.day) === Number(targetDay));
      sourceDateText = `วันที่ ${targetDay} ${THAI_MONTHS_FULL[curMonth - 1]}`;
    } else {
      // 2. Look in any prior month/year (itemVal < curVal)
      const sortedPrior = [...entries].filter(e => {
        const itemVal = Number(e.yearBE) * 10000 + Number(e.month) * 100 + Number(e.day);
        const curVal = curYear * 10000 + curMonth * 100 + curDay;
        return itemVal < curVal;
      }).sort((a, b) => {
        const valA = Number(a.yearBE) * 10000 + Number(a.month) * 100 + Number(a.day);
        const valB = Number(b.yearBE) * 10000 + Number(b.month) * 100 + Number(b.day);
        return valB - valA;
      });

      if (sortedPrior.length > 0) {
        const top = sortedPrior[0];
        sourceEntries = sortedPrior.filter(e => 
          Number(e.yearBE) === Number(top.yearBE) && 
          Number(e.month) === Number(top.month) && 
          Number(e.day) === Number(top.day)
        );
        sourceDateText = `วันที่ ${top.day} ${THAI_MONTHS_FULL[top.month - 1]} ${top.yearBE}`;
      } else {
        // 3. Fallback: Find the most recent active day across the entire history (excluding current day)
        const otherDays = [...entries].filter(e => 
          !(Number(e.yearBE) === curYear && Number(e.month) === curMonth && Number(e.day) === curDay)
        ).sort((a, b) => {
          const valA = Number(a.yearBE) * 10000 + Number(a.month) * 100 + Number(a.day);
          const valB = Number(b.yearBE) * 10000 + Number(b.month) * 100 + Number(b.day);
          return valB - valA;
        });

        if (otherDays.length > 0) {
          const top = otherDays[0];
          sourceEntries = otherDays.filter(e => 
            Number(e.yearBE) === Number(top.yearBE) && 
            Number(e.month) === Number(top.month) && 
            Number(e.day) === Number(top.day)
          );
          sourceDateText = `วันที่ ${top.day} ${THAI_MONTHS_FULL[top.month - 1]} ${top.yearBE}`;
        } else if (entries.length > 0) {
          // 4. If all entries are on current day, duplicate them
          const top = entries[0];
          sourceEntries = entries.filter(e => 
            Number(e.yearBE) === Number(top.yearBE) && 
            Number(e.month) === Number(top.month) && 
            Number(e.day) === Number(top.day)
          );
          sourceDateText = `วันที่ ${top.day} ${THAI_MONTHS_FULL[top.month - 1]}`;
        }
      }
    }

    if (sourceEntries.length === 0) {
      showToast('ยังไม่มีประวัติการเดินทางที่จะคัดลอก กรุณาบันทึกรายการก่อนหน้าอย่างน้อย 1 รายการ', 'warning');
      return;
    }

    const cloned = sourceEntries.map((src, idx) => ({
      id: 'gts_' + (Date.now() + idx + 5) + '_' + Math.random().toString(36).substring(2, 7),
      day: Number(currentSelectedDay),
      month: Number(currentSelectedMonth),
      yearBE: Number(currentSelectedYearBE),
      isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
      direction: src.direction,
      transportType: src.transportType,
      amount: Number(src.amount),
      note: src.note || '',
      createdAt: new Date(Date.now() + idx + 5).toISOString()
    }));

    cloned.forEach(item => entries.unshift(item));
    saveEntriesToStorage();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast(`คัดลอก ${cloned.length} รายการจาก (${sourceDateText}) มาใส่วันนี้เรียบร้อยแล้ว!`, 'success');
  }

  function repeatLastTrip() {
    if (entries.length === 0) {
      showToast('ยังไม่มีประวัติการเดินทางที่จะทำซ้ำ', 'warning');
      return;
    }

    const last = entries[0];
    const newEntry = {
      id: 'gts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      day: Number(currentSelectedDay),
      month: Number(currentSelectedMonth),
      yearBE: Number(currentSelectedYearBE),
      isoDate: formatDateISO(currentSelectedYearBE, currentSelectedMonth, currentSelectedDay),
      direction: last.direction,
      transportType: last.transportType,
      amount: Number(last.amount),
      note: last.note || '',
      createdAt: new Date().toISOString()
    };

    entries.unshift(newEntry);
    saveEntriesToStorage();
    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    showToast(`ทำซ้ำรายการ "${last.transportType}" ฿${last.amount} ในวันที่เลือกแล้ว!`, 'success');
  }

  // Duplicate Item Modal Logic
  let activeDuplicateItem = null;

  function openDuplicateModal(id) {
    const item = entries.find(e => e.id === id);
    if (!item) return;

    activeDuplicateItem = item;
    const isDepart = item.direction === 'depart';
    const iconClass = getTransportIconClass(item.transportType);

    el.dupTargetDateLabel.textContent = `${currentSelectedDay} ${THAI_MONTHS_FULL[currentSelectedMonth - 1]}`;

    el.duplicateItemPreview.innerHTML = `
      <div class="entry-item ${isDepart ? 'depart' : 'return'}" style="margin: 0; background: var(--bg-card);">
        <div class="entry-left">
          <div class="entry-type-icon"><i class="fa-solid ${iconClass}"></i></div>
          <div class="entry-info">
            <div class="entry-name">
              <span>${escapeHtml(item.transportType)}</span>
              <span class="dir-badge ${isDepart ? 'depart' : 'return'}">${isDepart ? 'ขาไป' : 'ขากลับ'}</span>
            </div>
            <span class="entry-note">วันที่ ${item.day}/${item.month}/${item.yearBE} • ${item.note ? escapeHtml(item.note) : 'ไม่มีหมายเหตุ'}</span>
          </div>
        </div>
        <div class="entry-right">
          <span class="entry-price">฿${Number(item.amount).toLocaleString('th-TH')}</span>
        </div>
      </div>
    `;

    el.duplicateModal.style.display = 'flex';
  }

  function closeDuplicateModal() {
    el.duplicateModal.style.display = 'none';
    activeDuplicateItem = null;
  }

  function handleDuplicateAction(type) {
    if (!activeDuplicateItem) return;

    let targetDay = activeDuplicateItem.day;
    let targetMonth = activeDuplicateItem.month;
    let targetYearBE = activeDuplicateItem.yearBE;
    let targetDirection = activeDuplicateItem.direction;
    let targetNote = activeDuplicateItem.note || '';

    if (type === 'same-day-same-dir') {
      // keep original day & direction
    } else if (type === 'same-day-opposite-dir') {
      targetDirection = targetDirection === 'depart' ? 'return' : 'depart';
      if (targetNote.includes('ขาไป')) targetNote = targetNote.replace('ขาไป', 'ขากลับ');
      else if (targetNote.includes('ขากลับ')) targetNote = targetNote.replace('ขากลับ', 'ขาไป');
      else if (!targetNote) targetNote = targetDirection === 'depart' ? 'เที่ยวไป' : 'เที่ยวกลับ';
    } else if (type === 'to-current-date') {
      targetDay = Number(currentSelectedDay);
      targetMonth = Number(currentSelectedMonth);
      targetYearBE = Number(currentSelectedYearBE);
    }

    const newItem = {
      id: 'gts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      day: Number(targetDay),
      month: Number(targetMonth),
      yearBE: Number(targetYearBE),
      isoDate: formatDateISO(targetYearBE, targetMonth, targetDay),
      direction: targetDirection,
      transportType: activeDuplicateItem.transportType,
      amount: Number(activeDuplicateItem.amount),
      note: targetNote,
      createdAt: new Date().toISOString()
    };

    entries.unshift(newItem);
    saveEntriesToStorage();
    closeDuplicateModal();

    renderDayStrip();
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();

    const dirText = targetDirection === 'depart' ? 'ขาไป' : 'ขากลับ';
    showToast(`ทำซ้ำรายการ (${newItem.transportType} ${dirText} ฿${newItem.amount}) สำเร็จ!`, 'success');
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

  // --- PDF Export & Printable Document Rendering ---
  function openPdfReportModal() {
    const selectedMonth = Number(el.summaryMonthSelect.value);
    const selectedYearBE = Number(el.summaryYearSelect.value);

    const profile = loadUserProfile();
    if (el.pdfAuthorNameInput) el.pdfAuthorNameInput.value = profile.name || '';
    if (el.pdfAuthorSubInput) el.pdfAuthorSubInput.value = profile.sub || '';

    renderPdfReportContent(selectedMonth, selectedYearBE);
    el.pdfReportModal.style.display = 'flex';
  }

  function closePdfReportModal() {
    el.pdfReportModal.style.display = 'none';
  }

  function renderPdfReportContent(month, yearBE) {
    const monthEntries = entries
      .filter(e => Number(e.month) === month && Number(e.yearBE) === yearBE)
      .sort((a, b) => Number(a.day) - Number(b.day));

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
    const monthName = THAI_MONTHS_FULL[month - 1];
    const nowStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let breakdownRows = '';
    const sortedTypes = Object.entries(typeTotals).sort((a, b) => b[1] - a[1]);
    sortedTypes.forEach(([type, amt]) => {
      const pct = grandTotal > 0 ? ((amt / grandTotal) * 100).toFixed(1) : 0;
      breakdownRows += `
        <tr>
          <td>${escapeHtml(type)}</td>
          <td class="col-right">฿${amt.toLocaleString('th-TH')}</td>
          <td class="col-right">${pct}%</td>
        </tr>
      `;
    });

    let itemsRows = '';
    if (monthEntries.length === 0) {
      itemsRows = `<tr><td colspan="5" style="text-align: center; color: #9ca3af; padding: 18px;">ไม่มีรายการบันทึกในเดือนนี้</td></tr>`;
    } else {
      monthEntries.forEach((e) => {
        const isDepart = e.direction === 'depart';
        const dayOfWeek = getDayOfWeekShort(e.yearBE, e.month, e.day);
        itemsRows += `
          <tr>
            <td>${e.day} ${monthName} (${dayOfWeek})</td>
            <td><span class="${isDepart ? 'pdf-badge-depart' : 'pdf-badge-return'}">${isDepart ? 'ขาไป' : 'ขากลับ'}</span></td>
            <td>${escapeHtml(e.transportType)}</td>
            <td>${e.note ? escapeHtml(e.note) : '-'}</td>
            <td class="col-right">฿${Number(e.amount).toLocaleString('th-TH')}</td>
          </tr>
        `;
      });
    }

    const userProfile = loadUserProfile();
    const userName = userProfile.name ? userProfile.name.trim() : '';
    const userSub = userProfile.sub ? userProfile.sub.trim() : '';

    el.pdfPrintableContent.innerHTML = `
      <div class="pdf-doc-header">
        <div class="pdf-doc-brand">
          <div class="pdf-doc-logo"><i class="fa-solid fa-graduation-cap"></i></div>
          <div>
            <h2>GoToSchool Travel Report</h2>
            <p>รายงานสรุปค่าใช้จ่ายการเดินทางไปมหาวิทยาลัยรายวัน</p>
          </div>
        </div>
        <div class="pdf-doc-meta">
          <div class="pdf-doc-month">${monthName} ${yearBE}</div>
          ${userName ? `<div class="pdf-doc-author"><i class="fa-solid fa-user-graduate"></i> <strong>ผู้จัดทำ:</strong> ${escapeHtml(userName)}</div>` : ''}
          ${userSub ? `<div class="pdf-doc-sub">${escapeHtml(userSub)}</div>` : ''}
          <div class="pdf-doc-generated">พิมพ์เมื่อ: ${nowStr}</div>
        </div>
      </div>

      <div class="pdf-stats-row">
        <div class="pdf-stat-card highlight">
          <span class="pdf-stat-label">ยอดรวมทั้งเดือน</span>
          <span class="pdf-stat-value">฿${grandTotal.toLocaleString('th-TH')}</span>
          <span class="pdf-stat-sub">${monthEntries.length} รายการ</span>
        </div>
        <div class="pdf-stat-card">
          <span class="pdf-stat-label">รวมขาไป (มหา'ลัย)</span>
          <span class="pdf-stat-value">฿${departTotal.toLocaleString('th-TH')}</span>
          <span class="pdf-stat-sub">${departCount} เที่ยว</span>
        </div>
        <div class="pdf-stat-card">
          <span class="pdf-stat-label">รวมขากลับ (บ้าน/หอ)</span>
          <span class="pdf-stat-value">฿${returnTotal.toLocaleString('th-TH')}</span>
          <span class="pdf-stat-sub">${returnCount} เที่ยว</span>
        </div>
        <div class="pdf-stat-card">
          <span class="pdf-stat-label">วันเดินทาง / เฉลี่ย</span>
          <span class="pdf-stat-value">${activeDaysCount} วัน</span>
          <span class="pdf-stat-sub">เฉลี่ย ฿${avgPerDay.toLocaleString('th-TH')}/วัน</span>
        </div>
      </div>

      <div class="pdf-section-title"><i class="fa-solid fa-chart-pie" style="color: #4f46e5;"></i> สรุปตามประเภทการเดินทาง</div>
      <table class="pdf-table">
        <thead>
          <tr>
            <th>ประเภทการเดินทาง</th>
            <th class="col-right">รวมเงิน (บาท)</th>
            <th class="col-right">สัดส่วน (%)</th>
          </tr>
        </thead>
        <tbody>
          ${breakdownRows || '<tr><td colspan="3" style="text-align: center;">ไม่มีข้อมูล</td></tr>'}
        </tbody>
      </table>

      <div class="pdf-section-title" style="margin-top: 18px;"><i class="fa-solid fa-list-ol" style="color: #4f46e5;"></i> รายละเอียดการเดินทางรายวัน (${monthEntries.length} รายการ)</div>
      <table class="pdf-table">
        <thead>
          <tr>
            <th style="width: 22%;">วันที่</th>
            <th style="width: 14%;">ทิศทาง</th>
            <th style="width: 26%;">ประเภทรถ</th>
            <th style="width: 24%;">หมายเหตุ</th>
            <th style="width: 14%;" class="col-right">ค่าโดยสาร</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr class="pdf-total-row">
            <td colspan="4" style="text-align: right;"><strong>ยอดรวมสุทธิทั้งเดือน:</strong></td>
            <td class="col-right"><strong>฿${grandTotal.toLocaleString('th-TH')}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="pdf-signature-section">
        <div class="pdf-sign-box">
          <div class="pdf-sign-line">ลงชื่อ ........................................................... ผู้ขอรับการสนับสนุน / ผู้เบิกจ่าย</div>
          <div class="pdf-sign-name">(${escapeHtml(userName || '...........................................................')})</div>
          <div class="pdf-sign-date">วันที่ ........ เดือน ........................ พ.ศ. ................</div>
        </div>
      </div>

      <div class="pdf-doc-footer">
        <span>GoToSchool App • บันทึกค่าเดินทางไปมหาวิทยาลัย</span>
        <span>หน้า 1 / 1</span>
      </div>
    `;
  }

  function downloadPDF() {
    const selectedMonth = Number(el.summaryMonthSelect.value);
    const selectedYearBE = Number(el.summaryYearSelect.value);
    const monthName = THAI_MONTHS_FULL[selectedMonth - 1];

    const sourceEl = document.getElementById('pdfPrintableContent');
    if (!sourceEl) return;

    if (typeof html2pdf === 'undefined') {
      window.print();
      return;
    }

    const userProfile = loadUserProfile();
    const safeName = (userProfile && userProfile.name)
      ? userProfile.name.trim().replace(/[\\/:*?"<>|]/g, '_') + '_'
      : '';

    showToast('กำลังประมวลผลและสร้างไฟล์ PDF...', 'info');

    // Create a dedicated off-screen container with fixed A4 desktop width (794px)
    // to ensure html2canvas never suffers from parent scroll or mobile container clipping!
    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.left = '0';
    printContainer.style.top = '0';
    printContainer.style.width = '794px';
    printContainer.style.zIndex = '-99999';
    printContainer.style.background = '#ffffff';
    printContainer.style.overflow = 'visible';

    const clonedEl = sourceEl.cloneNode(true);
    clonedEl.style.width = '794px';
    clonedEl.style.minWidth = '794px';
    clonedEl.style.maxWidth = '794px';
    clonedEl.style.margin = '0';
    clonedEl.style.padding = '24px 24px';
    clonedEl.style.boxSizing = 'border-box';
    clonedEl.style.boxShadow = 'none';
    clonedEl.style.background = '#ffffff';

    printContainer.appendChild(clonedEl);
    document.body.appendChild(printContainer);

    const opt = {
      margin: [6, 6, 6, 6],
      filename: `GoToSchool_รายงานค่าเดินทาง_${safeName}${monthName}_${selectedYearBE}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        logging: false,
        width: 794,
        windowWidth: 794,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { 
        mode: ['css', 'legacy'], 
        avoid: ['tr', '.pdf-stat-card', '.pdf-stats-row', '.pdf-section-title', '.pdf-doc-header', '.pdf-doc-footer', '.pdf-signature-section'] 
      }
    };

    html2pdf().set(opt).from(clonedEl).save().then(() => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      showToast('ดาวน์โหลดไฟล์ PDF สำเร็จแล้ว!', 'success');
    }).catch(err => {
      console.error('PDF generation error:', err);
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      window.print();
    });
  }

  function printPDF() {
    window.print();
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

    const userProfile = loadUserProfile();
    const safeName = (userProfile && userProfile.name)
      ? userProfile.name.trim().replace(/[\\/:*?"<>|]/g, '_') + '_'
      : '';

    // CSV Headers
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    if (userProfile && userProfile.name) {
      csvContent += `# รายงานสรุปค่าใช้จ่ายการเดินทาง GoToSchool\n`;
      csvContent += `# ผู้จัดทำ: ${userProfile.name} ${userProfile.sub ? `(${userProfile.sub})` : ''}\n`;
      csvContent += `# ประจำเดือน: ${THAI_MONTHS_FULL[selectedMonth - 1]} ${selectedYearBE}\n\n`;
    }
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
    link.setAttribute('download', `GoToSchool_รายงานค่าเดินทาง_${safeName}${THAI_MONTHS_FULL[selectedMonth - 1]}_${selectedYearBE}.csv`);
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

    // Fast Repeat Bar Action Listeners
    if (el.btnGenReturnFromDepart) {
      el.btnGenReturnFromDepart.addEventListener('click', generateReturnTripsFromDepart);
    }
    if (el.btnCopyPrevDay) {
      el.btnCopyPrevDay.addEventListener('click', copyTripsFromPreviousDay);
    }
    if (el.btnRepeatLast) {
      el.btnRepeatLast.addEventListener('click', repeatLastTrip);
    }

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

    // Exports
    el.btnExportCSV.addEventListener('click', exportCSV);
    if (el.btnExportPDF) el.btnExportPDF.addEventListener('click', openPdfReportModal);
    if (el.btnSummaryExportPDF) el.btnSummaryExportPDF.addEventListener('click', openPdfReportModal);

    // PDF Modal Controls
    if (el.btnClosePdfModal) el.btnClosePdfModal.addEventListener('click', closePdfReportModal);
    if (el.btnDownloadPDF) el.btnDownloadPDF.addEventListener('click', downloadPDF);
    if (el.btnPrintPDF) el.btnPrintPDF.addEventListener('click', printPDF);

    // Duplicate Modal Controls
    if (el.btnCloseDuplicateModal) el.btnCloseDuplicateModal.addEventListener('click', closeDuplicateModal);
    if (el.btnDupSameDaySameDir) el.btnDupSameDaySameDir.addEventListener('click', () => handleDuplicateAction('same-day-same-dir'));
    if (el.btnDupSameDayOppositeDir) el.btnDupSameDayOppositeDir.addEventListener('click', () => handleDuplicateAction('same-day-opposite-dir'));
    if (el.btnDupToToday) el.btnDupToToday.addEventListener('click', () => handleDuplicateAction('to-current-date'));

    // Modals Edit & Backup
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
      if (e.target === el.pdfReportModal) closePdfReportModal();
      if (e.target === el.duplicateModal) closeDuplicateModal();
      if (e.target === el.userProfileModal) closeUserProfileModal();
      if (e.target === el.clearMonthConfirmModal) closeClearMonthConfirmModal();
    });

    // User Profile Controls
    if (el.btnUserProfile) el.btnUserProfile.addEventListener('click', openUserProfileModal);
    if (el.btnCloseUserProfile) el.btnCloseUserProfile.addEventListener('click', closeUserProfileModal);
    if (el.btnCancelUserProfile) el.btnCancelUserProfile.addEventListener('click', closeUserProfileModal);
    if (el.userProfileForm) el.userProfileForm.addEventListener('submit', handleUserProfileSubmit);

    // Clear Month Controls
    if (el.btnClearMonthSummary) el.btnClearMonthSummary.addEventListener('click', () => openClearMonthConfirmModal());
    if (el.btnClearMonthHistory) el.btnClearMonthHistory.addEventListener('click', () => openClearMonthConfirmModal());
    if (el.btnCloseClearMonthModal) el.btnCloseClearMonthModal.addEventListener('click', closeClearMonthConfirmModal);
    if (el.btnCancelClearMonth) el.btnCancelClearMonth.addEventListener('click', closeClearMonthConfirmModal);
    if (el.btnConfirmDeleteMonth) el.btnConfirmDeleteMonth.addEventListener('click', executeClearCurrentMonth);

    // PDF Live Author Listeners
    setupPdfAuthorListeners();
  }

  // --- User Profile Functions ---
  function loadUserProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name || '',
            sub: parsed.sub || ''
          };
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
    return { name: '', sub: '' };
  }

  function saveUserProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (err) {
      console.error('Error saving user profile:', err);
      return false;
    }
  }

  function openUserProfileModal() {
    const profile = loadUserProfile();
    if (el.profileUserNameInput) el.profileUserNameInput.value = profile.name || '';
    if (el.profileUserSubInput) el.profileUserSubInput.value = profile.sub || '';
    if (el.userProfileModal) el.userProfileModal.style.display = 'flex';
  }

  function closeUserProfileModal() {
    if (el.userProfileModal) el.userProfileModal.style.display = 'none';
  }

  function handleUserProfileSubmit(e) {
    e.preventDefault();
    const name = el.profileUserNameInput ? el.profileUserNameInput.value.trim() : '';
    const sub = el.profileUserSubInput ? el.profileUserSubInput.value.trim() : '';

    if (!name) {
      showToast('กรุณากรอกชื่อ-นามสกุล', 'warning');
      if (el.profileUserNameInput) el.profileUserNameInput.focus();
      return;
    }

    saveUserProfile({ name, sub });
    closeUserProfileModal();
    showToast('บันทึกข้อมูลผู้จัดทำเรียบร้อยแล้ว!', 'success');

    if (el.pdfAuthorNameInput) el.pdfAuthorNameInput.value = name;
    if (el.pdfAuthorSubInput) el.pdfAuthorSubInput.value = sub;
  }

  function setupPdfAuthorListeners() {
    function updateAndSave(notify = false) {
      const name = el.pdfAuthorNameInput ? el.pdfAuthorNameInput.value.trim() : '';
      const sub = el.pdfAuthorSubInput ? el.pdfAuthorSubInput.value.trim() : '';
      saveUserProfile({ name, sub });

      const selectedMonth = Number(el.summaryMonthSelect.value);
      const selectedYearBE = Number(el.summaryYearSelect.value);
      renderPdfReportContent(selectedMonth, selectedYearBE);

      if (el.profileUserNameInput) el.profileUserNameInput.value = name;
      if (el.profileUserSubInput) el.profileUserSubInput.value = sub;

      if (notify) {
        showToast('บันทึกชื่อผู้จัดทำเรียบร้อยแล้ว!', 'success');
      }
    }

    if (el.pdfAuthorNameInput) {
      el.pdfAuthorNameInput.addEventListener('input', () => updateAndSave(false));
    }
    if (el.pdfAuthorSubInput) {
      el.pdfAuthorSubInput.addEventListener('input', () => updateAndSave(false));
    }
    if (el.btnSavePdfAuthor) {
      el.btnSavePdfAuthor.addEventListener('click', () => updateAndSave(true));
    }
  }

  // --- Clear Month Functions ---
  let pendingClearMonth = null;
  let pendingClearYearBE = null;

  function openClearMonthConfirmModal(month, yearBE) {
    const targetMonth = Number(month || el.summaryMonthSelect.value || summarySelectedMonth);
    const targetYear = Number(yearBE || el.summaryYearSelect.value || summarySelectedYearBE);

    const monthEntries = entries.filter(e => 
      Number(e.month) === targetMonth && 
      Number(e.yearBE) === targetYear
    );

    if (monthEntries.length === 0) {
      showToast(`ไม่มีรายการเดินทางในเดือน ${THAI_MONTHS_FULL[targetMonth - 1]} ${targetYear} ให้ลบ`, 'info');
      return;
    }

    pendingClearMonth = targetMonth;
    pendingClearYearBE = targetYear;

    const totalAmt = monthEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    if (el.clearMonthTargetName) el.clearMonthTargetName.textContent = `${THAI_MONTHS_FULL[targetMonth - 1]} ${targetYear}`;
    if (el.clearMonthTargetCount) el.clearMonthTargetCount.textContent = `${monthEntries.length} รายการ`;
    if (el.clearMonthTargetTotal) el.clearMonthTargetTotal.textContent = `฿${totalAmt.toLocaleString('th-TH')}`;

    if (el.clearMonthConfirmModal) el.clearMonthConfirmModal.style.display = 'flex';
  }

  function closeClearMonthConfirmModal() {
    if (el.clearMonthConfirmModal) el.clearMonthConfirmModal.style.display = 'none';
    pendingClearMonth = null;
    pendingClearYearBE = null;
  }

  function executeClearCurrentMonth() {
    if (!pendingClearMonth || !pendingClearYearBE) return;

    const targetMonth = pendingClearMonth;
    const targetYear = pendingClearYearBE;
    const monthName = THAI_MONTHS_FULL[targetMonth - 1];

    const prevCount = entries.length;
    entries = entries.filter(e => !(Number(e.month) === targetMonth && Number(e.yearBE) === targetYear));
    const deletedCount = prevCount - entries.length;

    saveEntriesToStorage();
    closeClearMonthConfirmModal();

    // Re-render UI
    syncUIWithSelectedDate();
    renderSummaryTab();
    renderHistoryTab();
    renderDailyEntries();
    updateBannerStats();
    buildSwiperDays();
    updateNavBadge();

    showToast(`ลบรายการทั้งหมดของเดือน ${monthName} ${targetYear} เรียบร้อยแล้ว (ลบออก ${deletedCount} รายการ)`, 'success');
  }

  // Expose global methods for inline HTML onclick handlers
  window.gtsApp = {
    openEditModal,
    deleteEntry,
    openDuplicateModal,
    openPdfReportModal,
    downloadPDF,
    printPDF,
    generateReturnTripsFromDepart,
    copyTripsFromPreviousDay,
    repeatLastTrip,
    openUserProfileModal,
    openClearMonthConfirmModal
  };

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
