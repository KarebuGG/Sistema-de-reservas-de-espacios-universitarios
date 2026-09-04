const timeBlocks = {
  '08:30': '08:30 - 10:00',
  '10:15': '10:15 - 11:45',
  '12:00': '12:00 - 13:30',
  '14:30': '14:30 - 16:00',
  '16:15': '16:15 - 17:45',
  '18:00': '18:00 - 19:30'
};

const spaces = [
  { id: 1, name: 'Justin Bieber', building: 'Edificio Humanidades', room: 'Piso 2 · H-201', type: 'Sala de clases', capacity: 96, features: ['Proyector laser', 'Audio', 'Accesibilidad'], image: 0, blocked: ['10:15'] },
  { id: 2, name: 'Laboratorio Curie', building: 'Facultad de Ciencias', room: 'Piso 1 · LAB-04', type: 'Laboratorio', capacity: 32, features: ['Mesones equipados', 'Extraccion', 'Ducha de seguridad'], image: 1, blocked: ['12:00', '16:15'] },
  { id: 3, name: 'Sala Los Arrayanes', building: 'Biblioteca Central', room: 'Piso 3 · B-312', type: 'Sala de estudio', capacity: 12, features: ['Pizarra', 'Luz natural', 'Zona silenciosa'], image: 2, blocked: ['08:30'] },
  { id: 4, name: 'Sala Gabriela Mistral', building: 'Centro Estudiantil', room: 'Piso 2 · CE-08', type: 'Sala de reunion', capacity: 10, features: ['Pantalla', 'Videollamadas', 'Pizarra'], image: 3, blocked: ['14:30'] },
  { id: 5, name: 'Laboratorio Turing', building: 'Edificio Tecnologia', room: 'Piso 4 · TI-402', type: 'Laboratorio', capacity: 40, features: ['32 computadores', 'Proyector', 'Climatizacion'], image: 4, blocked: ['18:00'] },
  { id: 6, name: 'Agora Campus', building: 'Centro Estudiantil', room: 'Piso 1 · CE-01', type: 'Espacio multiuso', capacity: 120, features: ['Mobiliario movil', 'Audio', 'Accesibilidad'], image: 5, blocked: ['10:15', '14:30'] }
];

const state = {
  reservations: loadReservations(),
  pendingCancellationId: null
};

const elements = {
  spacesGrid: document.querySelector('#spacesGrid'),
  spacesEmpty: document.querySelector('#spacesEmpty'),
  resultsSummary: document.querySelector('#resultsSummary'),
  availableToday: document.querySelector('#availableToday'),
  search: document.querySelector('#searchInput'),
  building: document.querySelector('#buildingFilter'),
  type: document.querySelector('#typeFilter'),
  capacity: document.querySelector('#capacityFilter'),
  date: document.querySelector('#dateFilter'),
  time: document.querySelector('#timeFilter'),
  activeFilters: document.querySelector('#activeFilters'),
  reservationsList: document.querySelector('#reservationsList'),
  reservationsEmpty: document.querySelector('#reservationsEmpty'),
  navReservationCount: document.querySelector('#navReservationCount'),
  bookingForm: document.querySelector('#bookingForm'),
  bookingModal: document.querySelector('#bookingModal'),
  cancelModal: document.querySelector('#cancelModal'),
  toast: document.querySelector('#appToast')
};

const bookingModal = new bootstrap.Modal(elements.bookingModal);
const cancelModal = new bootstrap.Modal(elements.cancelModal);
const appToast = new bootstrap.Toast(elements.toast, { delay: 4200 });

function loadReservations() {
  try {
    return JSON.parse(localStorage.getItem('espacioUReservations')) || [];
  } catch (error) {
    return [];
  }
}

function saveReservations() {
  localStorage.setItem('espacioUReservations', JSON.stringify(state.reservations));
}

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${dateString}T12:00:00Z`));
}

function isReserved(spaceId, date, time) {
  return state.reservations.some((reservation) => reservation.spaceId === spaceId && reservation.date === date && reservation.time === time);
}

function isSpaceAvailable(space, date, time) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return weekday !== 0 && !space.blocked.includes(time) && !isReserved(space.id, date, time);
}

function populateFilters() {
  [...new Set(spaces.map((space) => space.building))].sort().forEach((building) => {
    elements.building.insertAdjacentHTML('beforeend', `<option value="${building}">${building}</option>`);
  });
  [...new Set(spaces.map((space) => space.type))].sort().forEach((type) => {
    elements.type.insertAdjacentHTML('beforeend', `<option value="${type}">${type}</option>`);
  });
}

function getFilteredSpaces() {
  const query = elements.search.value.trim().toLocaleLowerCase('es');
  const minCapacity = Number(elements.capacity.value);
  return spaces.filter((space) => {
    const haystack = [space.name, space.building, space.room, space.type, ...space.features].join(' ').toLocaleLowerCase('es');
    return (!query || haystack.includes(query))
      && (elements.building.value === 'all' || space.building === elements.building.value)
      && (elements.type.value === 'all' || space.type === elements.type.value)
      && space.capacity >= minCapacity;
  });
}

function renderSpaces() {
  const filteredSpaces = getFilteredSpaces();
  const date = elements.date.value;
  const time = elements.time.value;
  const availableCount = filteredSpaces.filter((space) => isSpaceAvailable(space, date, time)).length;

  elements.spacesGrid.innerHTML = filteredSpaces.map((space) => {
    const available = isSpaceAvailable(space, date, time);
    return `
      <div class="col-sm-6 col-xl-4">
        <article class="space-card">
          <div class="space-image image-${space.image}" role="img" aria-label="Vista de ${space.name}">
            <span class="space-type">${space.type}</span>
            <span class="availability-badge ${available ? '' : 'unavailable'}">${available ? 'Disponible' : 'No disponible'}</span>
          </div>
          <div class="space-body">
            <div class="space-title-row">
              <h3>${space.name}</h3>
              <span><i class="bi bi-people" aria-hidden="true"></i> ${space.capacity}</span>
            </div>
            <p class="space-location"><i class="bi bi-geo-alt" aria-hidden="true"></i>${space.building} · ${space.room}</p>
            <div class="feature-list">${space.features.map((feature) => `<span class="feature-tag">${feature}</span>`).join('')}</div>
            <div class="space-card-footer">
              <span class="slot-label">Horario seleccionado<strong>${timeBlocks[time]}</strong></span>
              <button class="btn btn-sm ${available ? 'btn-primary' : 'btn-outline-secondary'}" type="button" data-book-space="${space.id}" ${available ? '' : 'disabled'}>${available ? 'Reservar' : 'Ocupado'}</button>
            </div>
          </div>
        </article>
      </div>`;
  }).join('');

  elements.availableToday.textContent = availableCount;
  elements.resultsSummary.textContent = `${availableCount} de ${filteredSpaces.length} disponibles · ${timeBlocks[time]}`;
  elements.spacesEmpty.classList.toggle('d-none', filteredSpaces.length > 0);
  elements.spacesGrid.classList.toggle('d-none', filteredSpaces.length === 0);
  renderActiveFilters();
}

function renderActiveFilters() {
  const filters = [];
  if (elements.search.value.trim()) filters.push(`Busqueda: ${elements.search.value.trim()}`);
  if (elements.building.value !== 'all') filters.push(elements.building.value);
  if (elements.type.value !== 'all') filters.push(elements.type.value);
  if (Number(elements.capacity.value)) filters.push(`${elements.capacity.value}+ personas`);
  elements.activeFilters.innerHTML = filters.map((filter) => `<span class="filter-pill">${filter}</span>`).join('');
  elements.activeFilters.classList.toggle('d-none', filters.length === 0);
}

function openBookingForm(spaceId) {
  const space = spaces.find((item) => item.id === spaceId);
  if (!space) return;

  const selectedDate = elements.date.value;
  document.querySelector('#bookingSpaceId').value = space.id;
  document.querySelector('#bookingDate').value = selectedDate;
  document.querySelector('#bookingDate').min = localDateValue();
  document.querySelector('#bookingAttendees').max = space.capacity;
  document.querySelector('#attendeesFeedback').textContent = `Ingresa entre 1 y ${space.capacity} asistentes.`;
  document.querySelector('#bookingSpaceSummary').innerHTML = `
    <div class="booking-summary-image space-image image-${space.image}" role="img" aria-label="${space.name}"></div>
    <div><h3>${space.name}</h3><p>${space.building} · ${space.room} · Capacidad ${space.capacity}</p></div>`;
  updateBookingTimeOptions(space.id, selectedDate, elements.time.value);
  elements.bookingForm.classList.remove('was-validated');
  bookingModal.show();
}

function updateBookingTimeOptions(spaceId, date, preferredTime) {
  const space = spaces.find((item) => item.id === Number(spaceId));
  const timeSelect = document.querySelector('#bookingTime');
  const availableTimes = Object.keys(timeBlocks).filter((time) => isSpaceAvailable(space, date, time));
  timeSelect.innerHTML = availableTimes.length
    ? availableTimes.map((time) => `<option value="${time}" ${time === preferredTime ? 'selected' : ''}>${timeBlocks[time]}</option>`).join('')
    : '<option value="">Sin horarios disponibles</option>';
}

function validateBookingForm() {
  const space = spaces.find((item) => item.id === Number(document.querySelector('#bookingSpaceId').value));
  const attendees = document.querySelector('#bookingAttendees');
  attendees.setCustomValidity(Number(attendees.value) > space.capacity ? 'capacity' : '');
  return elements.bookingForm.checkValidity();
}

function submitBooking(event) {
  event.preventDefault();
  if (!validateBookingForm()) {
    elements.bookingForm.classList.add('was-validated');
    showToast('Revisa el formulario', 'Hay campos incompletos o con datos no validos.', 'error');
    return;
  }

  const spaceId = Number(document.querySelector('#bookingSpaceId').value);
  const date = document.querySelector('#bookingDate').value;
  const time = document.querySelector('#bookingTime').value;
  if (isReserved(spaceId, date, time)) {
    showToast('Horario no disponible', 'Otra reserva ya ocupa ese bloque. Selecciona uno distinto.', 'error');
    updateBookingTimeOptions(spaceId, date, '');
    return;
  }

  const reservation = {
    id: crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}`,
    spaceId,
    name: document.querySelector('#bookingName').value.trim(),
    email: document.querySelector('#bookingEmail').value.trim(),
    date,
    time,
    attendees: Number(document.querySelector('#bookingAttendees').value),
    role: document.querySelector('#bookingRole').value,
    purpose: document.querySelector('#bookingPurpose').value.trim(),
    status: 'Confirmada',
    createdAt: new Date().toISOString()
  };

  state.reservations.push(reservation);
  saveReservations();
  elements.bookingForm.reset();
  document.querySelector('#purposeCount').textContent = '0';
  bookingModal.hide();
  renderAll();
  showToast('Reserva confirmada', `Tu solicitud para ${spaces.find((space) => space.id === spaceId).name} fue registrada.`);
}

function renderReservations() {
  const ordered = [...state.reservations].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  elements.reservationsList.innerHTML = ordered.map((reservation) => {
    const space = spaces.find((item) => item.id === reservation.spaceId);
    return `
      <article class="reservation-item">
        <div class="reservation-thumb space-image image-${space.image}" role="img" aria-label="${space.name}"></div>
        <div class="reservation-info">
          <h3>${space.name}</h3>
          <p><i class="bi bi-geo-alt" aria-hidden="true"></i> ${space.building} · ${space.room}</p>
          <span class="status-chip">${reservation.status}</span>
        </div>
        <div class="reservation-date">
          <strong><i class="bi bi-calendar3" aria-hidden="true"></i> ${formatDate(reservation.date)}</strong>
          <p><i class="bi bi-clock" aria-hidden="true"></i> ${timeBlocks[reservation.time]} · ${reservation.attendees} asistentes</p>
        </div>
        <div class="reservation-actions">
          <button class="btn btn-sm btn-outline-danger" type="button" data-cancel-reservation="${reservation.id}"><i class="bi bi-x-circle" aria-hidden="true"></i> Cancelar</button>
        </div>
      </article>`;
  }).join('');
  elements.reservationsEmpty.classList.toggle('d-none', ordered.length > 0);
  elements.reservationsList.classList.toggle('d-none', ordered.length === 0);
  elements.navReservationCount.textContent = state.reservations.length;
}

function askForCancellation(reservationId) {
  const reservation = state.reservations.find((item) => item.id === reservationId);
  const space = reservation && spaces.find((item) => item.id === reservation.spaceId);
  if (!reservation || !space) return;
  state.pendingCancellationId = reservationId;
  document.querySelector('#cancelSummary').innerHTML = `<strong>${space.name}</strong><br>${formatDate(reservation.date)} · ${timeBlocks[reservation.time]}`;
  cancelModal.show();
}

function confirmCancellation() {
  const reservation = state.reservations.find((item) => item.id === state.pendingCancellationId);
  const space = reservation && spaces.find((item) => item.id === reservation.spaceId);
  state.reservations = state.reservations.filter((item) => item.id !== state.pendingCancellationId);
  state.pendingCancellationId = null;
  saveReservations();
  cancelModal.hide();
  renderAll();
  showToast('Reserva cancelada', `${space ? space.name : 'El espacio'} vuelve a estar disponible.`);
}

function showView(viewName) {
  const reservationsView = viewName === 'reservations';
  document.querySelector('#spacesView').classList.toggle('active', !reservationsView);
  document.querySelector('#reservationsView').classList.toggle('active', reservationsView);
  document.querySelectorAll('[data-view-link]').forEach((link) => link.classList.toggle('active', link.dataset.viewLink === viewName));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(title, message, type = 'success') {
  document.querySelector('#toastTitle').textContent = title;
  document.querySelector('#toastMessage').textContent = message;
  elements.toast.classList.toggle('error', type === 'error');
  elements.toast.querySelector('.toast-icon i').className = `bi ${type === 'error' ? 'bi-exclamation-lg' : 'bi-check-lg'}`;
  appToast.show();
}

function clearFilters() {
  elements.search.value = '';
  elements.building.value = 'all';
  elements.type.value = 'all';
  elements.capacity.value = '0';
  renderSpaces();
}

function renderAll() {
  renderSpaces();
  renderReservations();
}

function bindEvents() {
  document.querySelector('#filterForm').addEventListener('input', renderSpaces);
  elements.spacesGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-book-space]');
    if (button) openBookingForm(Number(button.dataset.bookSpace));
  });
  elements.bookingForm.addEventListener('submit', submitBooking);
  document.querySelector('#bookingDate').addEventListener('change', (event) => updateBookingTimeOptions(document.querySelector('#bookingSpaceId').value, event.target.value, ''));
  document.querySelector('#bookingPurpose').addEventListener('input', (event) => { document.querySelector('#purposeCount').textContent = event.target.value.length; });
  elements.reservationsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel-reservation]');
    if (button) askForCancellation(button.dataset.cancelReservation);
  });
  document.querySelector('#confirmCancelButton').addEventListener('click', confirmCancellation);
  document.querySelector('#clearFiltersButton').addEventListener('click', clearFilters);
  document.querySelectorAll('[data-view-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.viewLink);
    bootstrap.Collapse.getInstance(document.querySelector('#mainNav'))?.hide();
  }));
  document.querySelectorAll('[data-action="browse-spaces"]').forEach((button) => button.addEventListener('click', () => showView('spaces')));
  window.addEventListener('hashchange', () => showView(location.hash === '#mis-reservas' ? 'reservations' : 'spaces'));
}

function init() {
  const today = localDateValue();
  elements.date.min = today;
  elements.date.value = today;
  document.querySelector('#bookingDate').min = today;
  populateFilters();
  bindEvents();
  renderAll();
  if (location.hash === '#mis-reservas') showView('reservations');
}

init();
