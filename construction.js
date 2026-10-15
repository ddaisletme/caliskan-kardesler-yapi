(() => {
  const body = document.body;
  const header = document.querySelector('.header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const mobileContact = document.querySelector('.mobile-contact');
  const contactSection = document.querySelector('#iletisim');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let contactInView = false;
  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 32);
    body.classList.toggle('has-scrolled', window.scrollY > window.innerHeight * .72);
    if (mobileContact) mobileContact.classList.toggle('is-hidden', window.scrollY <= window.innerHeight * .72 || contactInView);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  if (mobileContact && contactSection && 'IntersectionObserver' in window) {
    const contactObserver = new IntersectionObserver(entries => {
      contactInView = entries.some(entry => entry.isIntersecting);
      updateHeader();
    }, { threshold: .12 });
    contactObserver.observe(contactSection);
  }

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px' });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('in-view'));
  }

  const setMenu = (open, restoreFocus = true) => {
    body.classList.toggle('nav-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    const menuLabel = menuButton.querySelector('.menu-label');
    if (menuLabel) menuLabel.textContent = open ? 'KAPAT' : 'MENÜ';
    if (open) nav.querySelector('a')?.focus({ preventScroll: true });
    else if (restoreFocus) menuButton.focus({ preventScroll: true });
  };
  menuButton.addEventListener('click', () => setMenu(!body.classList.contains('nav-open')));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && body.classList.contains('nav-open')) setMenu(false);
    if (event.key !== 'Tab' || !body.classList.contains('nav-open')) return;
    const menuLinks = [...nav.querySelectorAll('a')];
    const first = menuLinks[0];
    const last = menuLinks[menuLinks.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      menuButton.focus({ preventScroll: true });
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === menuButton)) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    } else if (event.shiftKey && document.activeElement === menuButton) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    }
  });

  const journey = document.querySelector('.build-stage');
  if (!journey) return;
  const scene = journey.querySelector('.build-scene');
  const illustration = journey.querySelector('.build-illustration');
  if (scene && illustration && window.matchMedia('(pointer:fine)').matches && !prefersReducedMotion) {
    scene.addEventListener('pointermove', event => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      illustration.style.setProperty('--scene-x', `${x * -13}px`);
      illustration.style.setProperty('--scene-y', `${y * -9}px`);
    });
    scene.addEventListener('pointerleave', () => {
      illustration.style.setProperty('--scene-x', '0px');
      illustration.style.setProperty('--scene-y', '0px');
    });
  }
  const phases = [
    { label: '01 / HAZIRLIK', title: 'İyi bir yapı, sağlam bir planla başlar.', description: 'İhtiyaçlar belirlenir, zemin değerlendirilir ve yapının yol haritası hazırlanır.' },
    { label: '02 / TEMEL', title: 'Sağlam temel, güvenli başlangıç.', description: 'Zemin koşullarına uygun temel hazırlanır; yapının yükü için ilk sağlam zemin oluşturulur.' },
    { label: '03 / TAŞIYICI SİSTEM', title: 'Yapının iskeleti yükselir.', description: 'Kolonlar, kirişler ve döşemeler yapının taşıyıcı sistemini meydana getirir.' },
    { label: '04 / CEPHE', title: 'Yapı, karakterini kazanır.', description: 'Dış cephe yüzeyi; fibercement, betopan ve özenli detaylarla tamamlanır.' },
    { label: '05 / TAMAMLANDI', title: 'Her detay, bütünü tamamlar.', description: 'Son kontrollerle yapı yaşama hazır hâle gelir. Şimdi gerçek projelerimize göz atın.' }
  ];
  const dots = [...journey.querySelectorAll('[data-go-step]')];
  const layers = [...journey.querySelectorAll('[data-step]')];
  const count = journey.querySelector('[data-step-count]');
  const label = journey.querySelector('[data-step-label]');
  const title = journey.querySelector('[data-step-title]');
  const description = journey.querySelector('[data-step-description]');
  const replay = journey.querySelector('.stage-replay');
  let current = 0;
  let timer;

  const showPhase = index => {
    current = Math.max(0, Math.min(phases.length - 1, index));
    const phase = phases[current];
    journey.dataset.current = String(current);
    count.textContent = String(current + 1).padStart(2, '0');
    label.textContent = phase.label;
    title.textContent = phase.title;
    description.textContent = phase.description;
    layers.forEach(layer => layer.classList.toggle('is-built', Number(layer.dataset.step) <= current));
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.classList.toggle('is-built', dotIndex < current);
      if (dotIndex === current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    const heroCount = document.querySelector('.hero-bottom > span:first-child');
    if (heroCount) heroCount.textContent = `${String(current + 1).padStart(2, '0')} / 05`;
  };

  const stopSequence = () => window.clearInterval(timer);
  const startSequence = () => {
    stopSequence();
    if (prefersReducedMotion) return;
    timer = window.setInterval(() => {
      if (current >= phases.length - 1) return stopSequence();
      showPhase(current + 1);
    }, 3400);
  };
  dots.forEach(dot => dot.addEventListener('click', () => {
    stopSequence();
    showPhase(Number(dot.dataset.goStep));
  }));
  replay.addEventListener('click', () => {
    showPhase(0);
    startSequence();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSequence();
    else if (current < phases.length - 1 && !prefersReducedMotion) startSequence();
  });
  showPhase(prefersReducedMotion ? phases.length - 1 : 0);
  if (!prefersReducedMotion) window.setTimeout(startSequence, 1200);
})();
