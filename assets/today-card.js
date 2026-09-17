// Lógica compartilhada do card "Hoje" — usada no Início e no módulo de Stories.
export const DIAS_SEMANA = ['Segunda','Terça','Quarta','Quinta','Sexta'];
export const TURNOS = [['manha','Manhã'],['tarde','Tarde'],['noite','Noite']];

export const SLOTS = {
  ritual:      {label:'Ritual', cat:'humanizacao', sub:'Rituais'},
  engajamento: {label:'Engajamento', hint:'Caixinha, enquetes, desafios…', cat:'engajamento', sub:null},
  prova_social:{label:'Prova social', cat:'vendas', sub:'Com prova social'},
  oferta:      {label:'Oferta', cat:'vendas', sub:'Através de Storytelling'},
  bastidores:  {label:'Bastidores', cat:'humanizacao', sub:'Bastidores'},
  iniciando:   {label:'Iniciando os atendimentos', hint:'Bastidores de abertura do dia', cat:'humanizacao', sub:'Bastidores'},
  encerrando:  {label:'Encerrando os atendimentos', hint:'Bastidores de fechamento do dia', cat:'humanizacao', sub:'Bastidores'},
  vida_pessoal:{label:'Vida pessoal', cat:'humanizacao', sub:'Suas histórias'},
};

export const MODELOS = {
  1: {label:'Modelo 01', grid:{
    Segunda:{manha:'ritual', tarde:'engajamento', noite:null},
    Terça:  {manha:'ritual', tarde:'prova_social', noite:null},
    Quarta: {manha:'ritual', tarde:'iniciando',    noite:'encerrando'},
    Quinta: {manha:'ritual', tarde:'oferta',       noite:null},
    Sexta:  {manha:'ritual', tarde:'bastidores',   noite:'vida_pessoal'},
  }},
  2: {label:'Modelo 02', grid:{
    Segunda:{manha:'iniciando',    tarde:'ritual', noite:'encerrando'},
    Terça:  {manha:'prova_social', tarde:'ritual', noite:null},
    Quarta: {manha:'engajamento',  tarde:'ritual', noite:null},
    Quinta: {manha:'oferta',       tarde:'ritual', noite:null},
    Sexta:  {manha:'bastidores',   tarde:'ritual', noite:'vida_pessoal'},
  }},
  3: {label:'Modelo 03', grid:{
    Segunda:{manha:'ritual', tarde:'prova_social', noite:null},
    Terça:  {manha:'ritual', tarde:'iniciando',    noite:'encerrando'},
    Quarta: {manha:'ritual', tarde:'oferta',       noite:null},
    Quinta: {manha:'ritual', tarde:'engajamento',  noite:null},
    Sexta:  {manha:'ritual', tarde:'bastidores',   noite:'vida_pessoal'},
  }},
};

const WEEKDAY_MAP = {0:'Domingo',1:'Segunda',2:'Terça',3:'Quarta',4:'Quinta',5:'Sexta',6:'Sábado'};
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

export function todayName(){ return WEEKDAY_MAP[new Date().getDay()]; }

export function formatDatePt(){
  const now = new Date();
  return `${now.getDate()} de ${MESES[now.getMonth()]}`;
}

export function getSavedModelo(){
  try {
    const saved = parseInt(localStorage.getItem('stories-modelo'), 10);
    if ([1,2,3].includes(saved)) return saved;
  } catch(e){}
  return 1;
}

export function saveModelo(n){
  try { localStorage.setItem('stories-modelo', n); } catch(e){}
}

/**
 * Renderiza o card Hoje dentro de `el`.
 * `modelo` é o número do modelo (1, 2 ou 3).
 * `onFilter(cat, sub, query)` é chamado quando a pessoa clica em "Ver opções" ou num dos pills do fim de semana.
 */
export function renderTodayCard(el, modelo, onFilter){
  const name = todayName();
  const dayGrid = MODELOS[modelo].grid[name];

  if (!dayGrid){
    el.className = 'today-card rest';
    el.innerHTML = `
      <span class="eyebrow">Hoje · ${name}-feira, ${formatDatePt()}</span>
      <h3>Fim de semana, sem modelo oficial</h3>
      <p class="note">Os 3 modelos da Nexus Digital cobrem só de segunda a sexta. Se quiser postar mesmo assim, o banco tem dois clássicos pensados pro fim de semana:</p>
      <div class="today-pills">
        <button class="today-pill" data-title="Desabafo de sexta">🍿 Desabafo de sexta</button>
        <button class="today-pill" data-title="Fim de semana">❓ Fim de semana</button>
      </div>
    `;
    el.querySelectorAll('.today-pill').forEach(btn => {
      btn.addEventListener('click', () => onFilter('todos', null, btn.dataset.title));
    });
    return;
  }

  const entries = TURNOS
    .map(([key,label]) => dayGrid[key] ? {turno:key, time:label, meta:SLOTS[dayGrid[key]]} : null)
    .filter(Boolean);
  const primary = entries.find(e => e.meta !== SLOTS.ritual) || entries[0];
  el.className = 'today-card cat-' + primary.meta.cat;

  const todayISO = new Date().toISOString().slice(0,10);
  const doneKey = (turno) => `feito-${todayISO}-${turno}`;
  const isDone = (turno) => localStorage.getItem(doneKey(turno)) === '1';

  const slotsHtml = entries.map(e => `
    <div class="today-slot ${isDone(e.turno) ? 'done' : ''}" data-turno="${e.turno}">
      <label class="ts-check">
        <input type="checkbox" data-action="mark-done" data-turno="${e.turno}" ${isDone(e.turno) ? 'checked' : ''}>
      </label>
      <span class="ts-time">${e.time}</span>
      <span class="ts-label">${e.meta.label}${e.meta.hint ? ' · '+e.meta.hint : ''}</span>
      <button class="ts-btn" data-cat="${e.meta.cat}" data-sub="${e.meta.sub || ''}">Ver opções →</button>
    </div>
  `).join('');

  el.innerHTML = `
    <span class="eyebrow">Hoje · ${name}-feira, ${formatDatePt()} · ${MODELOS[modelo].label}</span>
    <h3>${entries.map(e => e.meta.label).join(' · ')}</h3>
    <div class="today-slots">${slotsHtml}</div>
  `;
  el.querySelectorAll('.ts-btn').forEach(btn => {
    btn.addEventListener('click', () => onFilter(btn.dataset.cat, btn.dataset.sub || null, ''));
  });
  el.querySelectorAll('[data-action="mark-done"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const turno = chk.dataset.turno;
      if (chk.checked) localStorage.setItem(doneKey(turno), '1');
      else localStorage.removeItem(doneKey(turno));
      chk.closest('.today-slot').classList.toggle('done', chk.checked);
    });
  });
}
