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

  const gsap = window.gsap;
  const gsapEnabled = Boolean(gsap && window.ScrollTrigger && !prefersReducedMotion);
  if (gsapEnabled) {
    gsap.registerPlugin(window.ScrollTrigger);
    const revealMedia = gsap.matchMedia();
    revealMedia.add({ desktop: '(min-width: 641px)', mobile: '(max-width: 640px)' }, ({ conditions }) => {
      const isMobile = conditions.mobile;
      const lift = isMobile ? 34 : 62;
      document.querySelectorAll('.reveal').forEach((element, index) => {
        gsap.fromTo(element, {
          autoAlpha: 0,
          y: lift,
          scale: element.classList.contains('project-card') ? .94 : .975,
          filter: 'blur(10px)'
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: isMobile ? .95 : 1.15,
          delay: element.classList.contains('project-card') ? (index % 3) * .12 : 0,
          ease: 'power3.out',
          overwrite: 'auto',
          scrollTrigger: { trigger: element, start: isMobile ? 'top 92%' : 'top 88%', once: true }
        });
      });

      document.querySelectorAll('.project-card img, .approach-image img').forEach(image => {
        gsap.fromTo(image, { objectPosition: '50% 34%' }, {
          objectPosition: '50% 66%',
          ease: 'none',
          scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: isMobile ? .55 : .9 }
        });
      });
    });

    const entranceItems = [
      ...document.querySelectorAll('.build-hero .hero-content .eyebrow, .build-hero h1, .build-hero .hero-lead, .build-hero .hero-actions, .build-stage-head, .build-scene, .stage-copy, .stage-controls')
    ];
    gsap.fromTo(entranceItems, { autoAlpha: 0, y: 38, filter: 'blur(8px)' }, {
      autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .95, stagger: .105, delay: .08, ease: 'power3.out', overwrite: 'auto'
    });
  } else if ('IntersectionObserver' in window && !prefersReducedMotion) {
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
    document.querySelectorAll('main, footer, .mobile-contact, .header > .brand, .header-contact').forEach(element => { element.inert = open; });
    if (open) nav.scrollTop = 0;
    if (open) requestAnimationFrame(() => {
      if (body.classList.contains('nav-open')) nav.querySelector('a')?.focus({ preventScroll: true });
    });
    else if (restoreFocus) menuButton.focus({ preventScroll: true });
  };
  menuButton.addEventListener('click', () => setMenu(!body.classList.contains('nav-open')));
  window.addEventListener('pageshow', event => { if (event.persisted) setMenu(false, false); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, false)));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const destination = new URL(link.href, location.href);
    const pagePath = path => path.replace(/index\.html$/, '');
    if (destination.origin !== location.origin || pagePath(destination.pathname) !== pagePath(location.pathname) || !destination.hash) return;
    const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (body.classList.contains('nav-open')) setMenu(false, false);
    if (location.hash !== destination.hash) history.pushState(null, '', destination.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 16), behavior: prefersReducedMotion ? 'instant' : 'smooth' });
  });
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

  // Review and copy a draft before opening Instagram. Nothing is sent by this site.
  const draftDialog = document.createElement('dialog');
  draftDialog.className = 'instagram-draft';
  draftDialog.setAttribute('aria-labelledby', 'instagram-draft-title');
  draftDialog.innerHTML = `
    <button class="draft-close" type="button" aria-label="Mesaj taslağını kapat">×</button>
    <p class="eyebrow">İLK ADIMI BİRLİKTE ATALIM</p>
    <h2 id="instagram-draft-title">Projenizi konuşalım.</h2>
    <p>Mesajı düzenleyip kopyalayın; Instagram sohbetine yapıştırın. Gönderme kararı sizde.</p>
    <label for="instagram-draft-text">Mesaj taslağınız</label>
    <textarea id="instagram-draft-text" rows="7"></textarea>
    <div class="draft-actions"><button type="button" class="button button-gold" data-copy-draft>Mesajı kopyala <span>↗</span></button>
    <a class="button" href="https://ig.me/m/caliskankardesleryapi" target="_blank" rel="noopener noreferrer">Instagram’da sohbeti aç <span>↗</span></a></div>
    <p class="draft-status" role="status" aria-live="polite"></p>
    <small>Sohbet açılmazsa <a href="https://www.instagram.com/caliskankardesleryapi/" target="_blank" rel="noopener noreferrer">profilimizdeki Mesaj düğmesini kullanın ↗</a></small>`;
  body.append(draftDialog);
  const draftText = draftDialog.querySelector('textarea');
  const draftStatus = draftDialog.querySelector('.draft-status');
  document.querySelectorAll('[data-instagram-message]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (body.classList.contains('nav-open')) setMenu(false, false);
      draftText.value = trigger.textContent.includes('Deneyiminizi')
        ? 'Merhaba Çalışkan Kardeşler Yapı, birlikte çalıştığımız projeyle ilgili deneyimimi paylaşmak istiyorum.\n\nDeneyimim: '
        : 'Merhaba Çalışkan Kardeşler Yapı, web sitenizdeki projeleri inceledim. Cephe uygulaması hakkında bilgi almak istiyorum.\n\nProjenin konumu: \nDüşündüğüm uygulama: \nYaklaşık alan / ek bilgiler: ';
      draftStatus.textContent = '';
      draftDialog.showModal();
    });
  });
  draftDialog.querySelector('.draft-close').addEventListener('click', () => draftDialog.close());
  draftDialog.addEventListener('click', event => {
    if (event.target !== draftDialog) return;
    const bounds = draftDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) draftDialog.close();
  });
  draftDialog.querySelector('[data-copy-draft]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftText.value);
      draftStatus.textContent = 'Mesaj kopyalandı. Instagram sohbetine yapıştırabilirsiniz.';
    } catch {
      draftText.focus();
      draftText.select();
      draftStatus.textContent = 'Metni seçtik. Kopyalayıp Instagram sohbetine yapıştırın.';
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
  let initialTimer;
  let phaseHasRendered = false;
  if (gsapEnabled) {
    const crane = journey.querySelector('.crane');
    if (crane) {
      crane.style.animation = 'none';
      const boom = crane.querySelector('path:nth-of-type(2)');
      if (boom) boom.style.animation = 'none';
      gsap.to(crane, { rotation: 2.1, duration: .45, ease: 'sine.inOut', repeat: -1, yoyo: true, transformOrigin: '112px 391px' });
      const trolley = crane.querySelector('circle');
      const cable = crane.querySelector('path:nth-of-type(4)');
      if (trolley && cable) gsap.to([trolley, cable], { x: 30, duration: .65, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(crane, { filter: 'drop-shadow(0 0 10px rgba(243,202,121,.5))', duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
  }

  const showPhase = index => {
    const previous = current;
    current = Math.max(0, Math.min(phases.length - 1, index));
    const phase = phases[current];
    journey.dataset.current = String(current);
    count.textContent = String(current + 1).padStart(2, '0');
    label.textContent = phase.label;
    title.textContent = phase.title;
    description.textContent = phase.description;
    if (gsapEnabled) {
      gsap.killTweensOf(layers);
      gsap.set(layers, { clearProps: 'opacity,visibility,transform' });
    }
    layers.forEach(layer => layer.classList.toggle('is-built', Number(layer.dataset.step) <= current));
    if (gsapEnabled && phaseHasRendered) {
      const newlyBuilt = layers.filter(layer => Number(layer.dataset.step) > previous && Number(layer.dataset.step) <= current);
      if (newlyBuilt.length) gsap.fromTo(newlyBuilt, { autoAlpha: 0, y: 24, scaleY: .9, transformOrigin: '50% 100%' }, { autoAlpha: 1, y: 0, scaleY: 1, duration: .72, stagger: .075, ease: 'back.out(1.25)', overwrite: 'auto' });
      gsap.fromTo([label, title, description], { autoAlpha: 0, y: 13 }, { autoAlpha: 1, y: 0, duration: .48, stagger: .055, ease: 'power2.out', overwrite: 'auto' });
    }
    phaseHasRendered = true;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.classList.toggle('is-built', dotIndex < current);
      if (dotIndex === current) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    const heroCount = document.querySelector('.hero-bottom > span:first-child');
    if (heroCount) heroCount.textContent = `${String(current + 1).padStart(2, '0')} / 05`;
  };

  const stopSequence = () => {
    window.clearInterval(timer);
    window.clearTimeout(initialTimer);
  };
  const startSequence = () => {
    stopSequence();
    if (prefersReducedMotion) return;
    timer = window.setInterval(() => {
      if (current >= phases.length - 1) return stopSequence();
      showPhase(current + 1);
    }, 1800);
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
  if (!prefersReducedMotion) initialTimer = window.setTimeout(startSequence, 400);
})();
