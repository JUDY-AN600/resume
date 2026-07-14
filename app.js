const data = window.PORTFOLIO_DATA;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const pagePaper = '#f2eee8';

// The project sequence begins with the cover color, so the first transition
// feels like the cover is naturally opening into the portfolio.
const workColors = [
  pagePaper,  // same as the cover
  '#d8cfc3', // warm stone
  '#b8c4b5', // muted sage
  '#bdc8d3', // mist blue
  '#d7b9ac', // dusty clay
  '#c6bdd2', // soft violet
  '#d8cfad'  // muted sand
];

// The experience sequence picks up the final project tone and returns to
// the same paper color used by the closing page.
const experienceColors = [
  '#d8cfad', // continues from the final project
  '#c6bdd2',
  '#bdc8d3',
  pagePaper  // same as the closing page
];

function renderProfile() {
  $('#profile-name').textContent = data.profile.name;
  $('#profile-en').textContent = data.profile.englishName;
  $('#profile-role').textContent = data.profile.role;
  $('#profile-intro').textContent = data.profile.intro;
  $('#profile-location').textContent = data.profile.location;
  $('#profile-photo').src = data.profile.photo;
  $('#email').textContent = data.profile.email;
  $('#email').href = `mailto:${data.profile.email}`;
  $('#phone').textContent = data.profile.phone;
}

function renderFilters() {
  $('#filters').innerHTML = data.categories.map((item, index) => `
    <button class="filter-button ${index === 0 ? 'active' : ''}" data-filter="${item.id}">${item.label}</button>
  `).join('');
}

function renderProjects() {
  $('#project-grid').innerHTML = data.projects.map((item, index) => `
    <article class="project-card" data-category="${item.category}" data-index="${index}" data-color="${workColors[index % workColors.length]}" tabindex="0" role="button" aria-label="查看${item.title}详情">
      <div class="card-top"><span>${item.type}</span><span>${item.period}</span></div>
      <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
      <h3>${item.title}</h3>
      <p class="summary">${item.summary}</p>
      <div class="card-bottom">
        <div class="card-result"><strong>${item.result}</strong><span>RESULT</span></div>
        <span class="card-open-label">查看详情 →</span>
      </div>
    </article>
  `).join('');
}

function setWorkColor(color) {
  const section = $('.work-section');
  if (!section || !color) return;
  section.style.setProperty('--work-bg', color);
}

function bindWorkColors() {
  const section = $('.work-section');
  if (!section) return;

  const cards = $$('.project-card');
  const updateByScroll = () => {
    if (section.getBoundingClientRect().bottom < 0 || section.getBoundingClientRect().top > innerHeight) return;
    const targetY = innerHeight * .52;
    let nearest = null;
    let distance = Infinity;
    cards.forEach(card => {
      if (card.classList.contains('is-hidden')) return;
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const currentDistance = Math.abs(center - targetY);
      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = card;
      }
    });
    if (nearest) setWorkColor(nearest.dataset.color);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateByScroll();
      ticking = false;
    });
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  $('#filters')?.addEventListener('click', () => setTimeout(requestUpdate, 0));
  updateByScroll();
}

function renderExperience() {
  $('#timeline').innerHTML = data.timeline.map((item, index) => `
    <article class="timeline-item" data-reveal data-experience-index="${index}" data-color="${experienceColors[index % experienceColors.length]}" tabindex="0">
      <span class="timeline-period">${item.period}</span>
      <div><h3>${item.title}</h3><p>${item.place}</p><p class="focus">${item.focus}</p></div>
      <button class="timeline-toggle" aria-label="展开${item.title}详情" aria-expanded="false">＋</button>
      <div class="timeline-details"><ul>${item.details.map(detail => `<li>${detail}</li>`).join('')}</ul></div>
    </article>
  `).join('');
  $('#education').innerHTML = data.education.map(item => `
    <article class="edu-item"><strong>${item.school}</strong><span>${item.period}</span><p>${item.degree}</p></article>
  `).join('');
  $('#skills').innerHTML = data.skills.map((item, index) => `<button data-skill-index="${index}" class="${index === 0 ? 'active' : ''}">${item.name}</button>`).join('');
  $('#skill-detail').textContent = data.skills[0]?.description || '';
}


function setExperienceColor(color) {
  const section = $('.experience-section');
  if (!section || !color) return;
  section.style.setProperty('--experience-bg', color);
}

function bindExperienceInteractions() {
  const section = $('.experience-section');
  const timeline = $('#timeline');
  const skills = $('#skills');

  const toggleItem = item => {
    const willOpen = !item.classList.contains('is-open');
    $$('.timeline-item', timeline).forEach(node => {
      node.classList.remove('is-open');
      $('.timeline-toggle', node)?.setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('is-open');
      $('.timeline-toggle', item)?.setAttribute('aria-expanded', 'true');
      setExperienceColor(item.dataset.color);
    }
  };

  timeline?.addEventListener('click', event => {
    const item = event.target.closest('.timeline-item');
    if (item) toggleItem(item);
  });
  timeline?.addEventListener('keydown', event => {
    const item = event.target.closest('.timeline-item');
    if (item && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleItem(item);
    }
  });

  skills?.addEventListener('click', event => {
    const button = event.target.closest('button[data-skill-index]');
    if (!button) return;
    $$('button', skills).forEach(node => node.classList.toggle('active', node === button));
    const skill = data.skills[Number(button.dataset.skillIndex)];
    $('#skill-detail').textContent = skill.description;
  });

  const items = $$('.timeline-item', timeline);
  let ticking = false;
  const updateByScroll = () => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const targetY = innerHeight * .54;
    let nearest = null;
    let distance = Infinity;
    items.forEach(item => {
      const r = item.getBoundingClientRect();
      const d = Math.abs((r.top + r.height / 2) - targetY);
      if (d < distance) { distance = d; nearest = item; }
    });
    if (nearest) setExperienceColor(nearest.dataset.color);
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateByScroll(); ticking = false; });
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateByScroll();
}

function bindFilters() {
  $('#filters').addEventListener('click', event => {
    const button = event.target.closest('.filter-button');
    if (!button) return;
    $$('.filter-button').forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    $$('.project-card').forEach(card => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
}

function openDrawer(index) {
  const item = data.projects[index];
  $('.drawer-type').textContent = item.type;
  $('.drawer-period').textContent = item.period;
  $('.drawer-title').textContent = item.title;
  $('.drawer-summary').textContent = item.summary;
  $('.drawer-details').innerHTML = item.details.map(detail => `<li>${detail}</li>`).join('');
  $('#drawer').classList.add('open');
  $('#drawer-mask').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#drawer-mask').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}

function bindProjects() {
  $('#project-grid').addEventListener('click', event => {
    const card = event.target.closest('.project-card');
    if (card) openDrawer(Number(card.dataset.index));
  });
  $('#project-grid').addEventListener('keydown', event => {
    const card = event.target.closest('.project-card');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDrawer(Number(card.dataset.index));
    }
  });
  $('.drawer-close').addEventListener('click', closeDrawer);
  $('#drawer-mask').addEventListener('click', closeDrawer);
  window.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });
}

function bindScrollEffects() {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .12 });
  $$('[data-reveal]').forEach(node => revealObserver.observe(node));

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? scrollY / max : 0;
    $('.page-progress span').style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function bindTilt() {
  const portrait = $('[data-tilt]');
  if (!portrait || matchMedia('(pointer: coarse)').matches) return;
  portrait.addEventListener('mousemove', event => {
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    portrait.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
  });
  portrait.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
}

renderProfile();
renderFilters();
renderProjects();
renderExperience();
bindFilters();
bindProjects();
bindScrollEffects();
bindWorkColors();
bindExperienceInteractions();
bindTilt();
