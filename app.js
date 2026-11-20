
// 1. ESTADO DE LOS DATOS
let proyectos = [];

// 2. REFERENCIAS AL DOM
const grid = document.getElementById("projects-grid");
const resultsCount = document.getElementById("results-count");
const filterSearch = document.getElementById("filter-search");
const filterYear = document.getElementById("filter-year");
const filterSubject = document.getElementById("filter-subject");
const filterEngine = document.getElementById("filter-engine");
const filterTheme = document.getElementById("filter-theme");
const btnReset = document.getElementById("btn-reset");

// 3. POBLAR DESPLEGABLES AUTOMÁTICAMENTE DESDE LOS DATOS
function populateSelects(data) {
  const years = [...new Set(data.map((p) => p.curso))].sort().reverse();
  const subjects = [...new Set(data.map((p) => p.asignatura))].sort();
  const engines = [...new Set(data.map((p) => p.motor))].sort();
  const themes = [...new Set(data.flatMap((p) => p.tematicas))].sort();

  appendOptions(filterYear, years);
  appendOptions(filterSubject, subjects);
  appendOptions(filterEngine, engines);
  appendOptions(filterTheme, themes);
}

function appendOptions(selectElement, values) {
  values.forEach((val) => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    selectElement.appendChild(option);
  });
}

// 4. RENDERIZAR TARJETAS
function renderProjects(list) {
  grid.innerHTML = "";
  resultsCount.textContent = `Mostrando ${list.length} ${list.length === 1 ? "proyecto" : "proyectos"}`;

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state">No hay proyectos que coincidan con los filtros seleccionados.</div>`;
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";

    const themeTags = p.tematicas
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");

    const playBtn = p.jugarUrl
      ? `<a href="${p.jugarUrl}" class="btn-link" target="_blank" rel="noopener">Jugar / Ver build</a>`
      : "";

    const repoBtn = p.repoUrl
      ? `<a href="${p.repoUrl}" class="btn-link btn-secondary" target="_blank" rel="noopener">Código</a>`
      : "";

    card.innerHTML = `
      <img class="card-thumb" src="${p.imagen}" alt="Captura del juego ${p.titulo}" loading="lazy" />
      <div class="card-body">
        <div class="card-meta">
          <span class="badge-year">${p.curso}</span>
          <span>${p.asignatura}</span>
        </div>
        <h2 class="card-title">${p.titulo}</h2>
        <p class="card-authors">Por ${p.autoria}</p>
        <p class="card-desc">${p.sinopsis}</p>
        <div class="tags">
          <span class="tag tag-engine">${p.motor}</span>
          ${themeTags}
        </div>
        <div class="card-actions">
          ${playBtn}
          ${repoBtn}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 5. APLICAR FILTROS COMBINADOS
function applyFilters() {
  const query = filterSearch.value.trim().toLowerCase();
  const year = filterYear.value;
  const subject = filterSubject.value;
  const engine = filterEngine.value;
  const theme = filterTheme.value;

  const filtered = proyectos.filter((p) => {
    const matchesSearch =
      !query ||
      p.titulo.toLowerCase().includes(query) ||
      p.autoria.toLowerCase().includes(query) ||
      p.sinopsis.toLowerCase().includes(query);

    const matchesYear = !year || p.curso === year;
    const matchesSubject = !subject || p.asignatura === subject;
    const matchesEngine = !engine || p.motor === engine;
    const matchesTheme = !theme || p.tematicas.includes(theme);

    return matchesSearch && matchesYear && matchesSubject && matchesEngine && matchesTheme;
  });

  renderProjects(filtered);
}

// 6. EVENTOS
[filterSearch, filterYear, filterSubject, filterEngine, filterTheme].forEach((el) => {
  el.addEventListener("input", applyFilters);
  el.addEventListener("change", applyFilters);
});

btnReset.addEventListener("click", () => {
  filterSearch.value = "";
  filterYear.value = "";
  filterSubject.value = "";
  filterEngine.value = "";
  filterTheme.value = "";
  applyFilters();
});

// 7. CARGAR JSON E INICIALIZAR
async function init() {
  try {
    const response = await fetch("./data/proyectos.json");
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    proyectos = await response.json();
    populateSelects(proyectos);
    renderProjects(proyectos);
  } catch (error) {
    console.error("No se pudo cargar el archivo JSON:", error);
    resultsCount.textContent = "";
    grid.innerHTML = `<div class="empty-state">No se han podido cargar los proyectos. Comprueba que el JSON sea válido y que la ruta coincida.</div>`;
  }
}

init();