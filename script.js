document.addEventListener('DOMContentLoaded', () => {

  /* =======================
     1) Set active dock button
  ======================== */
  (function setActiveDockBtn(){
    const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.dock-btn').forEach(btn=>{
      const href = btn.getAttribute('href');
      if (!href) return;
      const page = href.split('/').pop().toLowerCase();
      if (page === currentPage){
        btn.classList.add('active');
        btn.setAttribute('aria-current','page');
      }
    });
  })();

  /* =======================
     2) Language switcher
  ======================== */

  function applyLang(lang){
    const rtlLangs = ['ar'];
    const dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);

    // toggle active button
    document.querySelectorAll('.lang-btn').forEach(b=>{
      const isActive = b.dataset.lang === lang;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // replace text via data-*
    document.querySelectorAll('[data-en]').forEach(el=>{
      const newTxt = el.getAttribute(`data-${lang}`) || el.getAttribute('data-en');
      if (newTxt != null){
        el.textContent = newTxt;
      }
    });
  }

  const savedLang = localStorage.getItem('lang')
    || document.documentElement.getAttribute('lang')
    || 'en';
  applyLang(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const lang = btn.dataset.lang || 'en';
      localStorage.setItem('lang', lang);
      applyLang(lang);
    });
  });

  /* =======================
     3) Page transition overlay (between pages)
     - overlay fade + scale
     - triggers on dock-btn click
  ======================== */
  (function setupPageTransition(){
    // create overlay element once
    let overlay = document.querySelector('.page-transition-overlay');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay active'; // start visible
      document.body.appendChild(overlay);

      // fade it out after first frame (page load reveal)
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          overlay.classList.remove('active');
        });
      });
    }

    // intercept nav clicks
    document.querySelectorAll('.dock-btn[href]').forEach(link=>{
      if(link.dataset.transitionBound === 'true') return;
      link.dataset.transitionBound = 'true';

      link.addEventListener('click', (e)=>{
        const href = link.getAttribute('href');
        if(!href) return;

        // skip external or _blank
        if (link.target === '_blank') return;
        if (/^https?:\/\//i.test(href)) return;

        // same page? do nothing
        const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (href.toLowerCase() === currentPage) return;

        e.preventDefault();

        overlay.classList.add('active');
        document.body.classList.add('page-is-transitioning');

        setTimeout(()=>{
          window.location.href = href;
        }, 350); // نفس المدة بتاعة الـ CSS
      });
    });

  })();

  /* =======================
     4) Update Cairo time
  ======================== */
  const timeEl = document.getElementById('current-time');
  function updateTime(){
    if(!timeEl) return;
    const now = new Date();
    try{
      timeEl.textContent = now.toLocaleTimeString('en-GB', {
        hour12:false,
        timeZone:'Africa/Cairo'
      });
    }catch(e){
      // fallback لو المتصفح مش بيدعم الـ timeZone
      timeEl.textContent = now.toLocaleTimeString('en-GB', {hour12:false});
    }
  }
  updateTime();
  setInterval(updateTime, 1000);

  /* =======================
     5) Why choose me modal
  ======================== */
  const whyModal = document.getElementById('whyModal');
  const openWhy = document.getElementById('openWhyModal');

  function openWhyModalFn(){
    if(!whyModal) return;
    whyModal.classList.add('active');
    document.body.style.overflow='hidden';
  }
  function closeWhyModalFn(){
    if(!whyModal) return;
    whyModal.classList.remove('active');
    document.body.style.overflow='';
  }

  if(openWhy){
    openWhy.addEventListener('click', openWhyModalFn);
  }
  if(whyModal){
    whyModal.querySelectorAll('.why-close,.close-btn,[data-close="why"]').forEach(btn=>{
      btn.addEventListener('click', closeWhyModalFn);
    });
    whyModal.addEventListener('click', e=>{
      if(e.target === whyModal) closeWhyModalFn();
    });
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && whyModal.classList.contains('active')){
        closeWhyModalFn();
      }
    });
  }

  /* =======================
     6) FAQ Accordion
  ======================== */
  document.querySelectorAll('.faq-question').forEach(q=>{
    q.addEventListener('click', ()=>{
      const item = q.closest('.faq-item');
      if(!item) return;
      const alreadyOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item.active').forEach(i=>{
        if(i!==item) i.classList.remove('active');
      });

      if(alreadyOpen){
        item.classList.remove('active');
      }else{
        item.classList.add('active');
      }
    });
  });

  /* =======================
     7) Portfolio / Work image modal
  ======================== */
  const imageModal = document.getElementById('imageModal');
  const modalImg   = document.getElementById('modalImage');
  const closeImgBtn= document.getElementById('closeModal');

  function openImgModal(src, alt){
    if(!imageModal) return;
    modalImg.src = src;
    modalImg.alt = alt || 'Work preview';
    imageModal.classList.add('active');
    document.body.style.overflow='hidden';
  }
  function closeImgModal(){
    if(!imageModal) return;
    imageModal.classList.remove('active');
    setTimeout(()=>{
      if(!imageModal.classList.contains('active')){
        modalImg.src='';
        document.body.style.overflow='';
      }
    },200);
  }

  document.querySelectorAll('.portfolio-item, .work-card').forEach(card=>{
    if(card.dataset.bound === 'true') return;
    card.dataset.bound = 'true';
    card.addEventListener('click', ()=>{
      const img = card.querySelector('img');
      if(img) openImgModal(img.src, img.alt);
    });
  });

  if(closeImgBtn){
    closeImgBtn.addEventListener('click', closeImgModal);
  }
  if(imageModal){
    imageModal.addEventListener('click', e=>{
      if(e.target === imageModal) closeImgModal();
    });
  }
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && imageModal && imageModal.classList.contains('active')){
      closeImgModal();
    }
  });

  /* =======================
     8) Reveal animation on scroll
  ======================== */
  const revealEls = document.querySelectorAll('.reveal, .work-card, .portfolio-item, .plan-card, .rule-card, .game-card');
  if(revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el = e.target;
          if(el.classList.contains('show')) {
            io.unobserve(el);
            return;
          }

          const group = el.getAttribute('data-group');
          if(group){
            const groupEls = [...document.querySelectorAll('[data-group="'+group+'"]')];
            const order = groupEls.indexOf(el);
            el.style.transitionDelay = (order * 120) + 'ms';
          } else if (el.style && el.style.getPropertyValue('--delay')){
            // لو فيه delay manual زي rule-card
          }

          el.classList.add('show');
          io.unobserve(el);
        }
      });
    }, {threshold:0.2});
    revealEls.forEach(el=>io.observe(el));
  }

  /* =======================
     9) Games page Roblox fetch
     - يبني الكروت ديناميك
  ======================== */
  async function initGames(){
    const gamesWrap = document.getElementById('gamesWrap');
    if(!gamesWrap) return;

    // كل الألعاب (قديم + جديد)
    const GAMES = [
      { url: 'https://www.roblox.com/games/111021125092689/Steal-A-Forsaken', owner:'SnowStorm', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/17745731375/Bous-Revenge-HORROR', owner:'SnowStorm', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/128915436393653/Dongdaemun-Game-Season-3', owner:'SnowStorm', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/93605084835085/99-Nights-In-The-Winter', owner:'SnowStorm', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/116868134708688/Steal-A-Forest', owner:'SnowStorm', ui:'youssef_design' },

      { url: 'https://www.roblox.com/games/85746704401525/Clash-VS-Brainrots', owner:'Gren', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/115481659064840/Build-a-UFO', owner:'Gren', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/92369489899222/Troll-Pinning-Slap-Tower', owner:'nilcous', ui:'youssef_design' },
      { url: 'https://www.roblox.com/games/121873420604621/Obby-But-You-Are-A-Ghost-RELEASE', owner:'schwerer', ui:'youssef_design' }
    ];

    const locale = document.documentElement.lang || 'en';
    const fmtNum = (n) => new Intl.NumberFormat(locale).format(n);
    const fmtBI = (bi) => {
      try {
        if (bi <= BigInt(Number.MAX_SAFE_INTEGER)) return fmtNum(Number(bi));
      } catch(e){}
      return bi.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const parseUniverseId = (url) => {
      const m = url.match(/\/games\/(\d+)/);
      return m ? m[1] : null;
    };

    function makeCard({thumb, name, url, visits, owner, ui}){
      const card = document.createElement('section');
      card.className = 'game-card reveal';

      const thumbHTML = thumb
        ? `<img class="game-thumb" alt="${name} icon" src="${thumb}">`
        : `<div class="game-thumb placeholder" role="img" aria-label="${name} icon"></div>`;

      card.innerHTML = `
        <div class="thumb-side">
          <a class="thumb-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${name}">
            ${thumbHTML}
            <div class="thumb-overlay"></div>
          </a>
        </div>

        <div class="game-body">
          <div class="game-head">
            <div class="game-title">
              <i class="fas fa-gamepad" aria-hidden="true"></i>
              <span>${name || '—'}</span>
            </div>
            <span class="game-badge">Roblox Game</span>
          </div>

          <ul class="info-list">
            <li class="info-row">
              <span class="label"
                    data-en="Owner:"
                    data-ar="صاحب اللعبة:"
                    data-es="Propietario:">Owner:</span>
              <span>${owner}</span>
            </li>

            <li class="info-row">
              <span class="label"
                    data-en="UI Designer:"
                    data-ar="مصمم الواجهة:"
                    data-es="Diseñador UI:">UI Designer:</span>
              <span>${ui}</span>
            </li>

            <li class="info-row visits">
              <span class="label"
                    data-en="Visits:"
                    data-ar="الزيارات:"
                    data-es="Visitas:">Visits:</span>
              <span class="visits-num">${(visits ?? '—')}</span>
            </li>
          </ul>

          <a class="open-btn" href="${url}" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-external-link-alt" aria-hidden="true"></i>
            <span
              data-en="Open game"
              data-ar="افتح اللعبة"
              data-es="Abrir juego">Open game</span>
          </a>
        </div>
      `;

      const img = card.querySelector('.game-thumb');
      if (img && img.tagName === 'IMG') {
        img.addEventListener('error', () => {
          const holder = document.createElement('div');
          holder.className = 'game-thumb placeholder';
          holder.setAttribute('role','img');
          holder.setAttribute('aria-label', `${name} icon`);
          img.replaceWith(holder);
        });
      }

      return card;
    }

    // placeholders first
    gamesWrap.innerHTML = '';
    GAMES.forEach(g => {
      const ph = makeCard({
        thumb: '',
        name: 'Loading...',
        url: g.url,
        visits: '—',
        owner: g.owner,
        ui: g.ui
      });
      gamesWrap.appendChild(ph);
      requestAnimationFrame(() => ph.classList.add('show'));
    });

    // طبّق اللغة على البليس هولدر
    applyLang(savedLang);

    try {
      const universes = GAMES
        .map(g => ({ ...g, universeId: parseUniverseId(g.url) }))
        .filter(g => g.universeId);

      const chunk = (arr, size) => arr.length
        ? [arr.slice(0, size), ...chunk(arr.slice(size), size)]
        : [];

      // game info
      const infoByUniverse = new Map();
      for (const ch of chunk(universes.map(u => u.universeId), 50)) {
        const res = await fetch(
          `https://games.roblox.com/v1/games?universeIds=${ch.join(',')}`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        (json?.data || []).forEach(d => infoByUniverse.set(String(d.id), d));
      }

      // thumbnails
      const thumbByUniverse = new Map();
      for (const ch of chunk(universes.map(u => u.universeId), 100)) {
        const res = await fetch(
          `https://thumbnails.roblox.com/v1/games/icons?universeIds=${ch.join(',')}&size=420x420&format=Png&isCircular=false`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        (json?.data || []).forEach(t => thumbByUniverse.set(String(t.targetId), t.imageUrl));
      }

      // rebuild cards
      gamesWrap.innerHTML = '';
      let total = 0n;

      for (const g of universes) {
        const info = infoByUniverse.get(String(g.universeId));
        const gameName = info?.name || 'Unknown Game';
        const visitsBI = BigInt(info?.visits ?? 0);
        total += visitsBI;

        const thumb = thumbByUniverse.get(String(g.universeId)) || '';

        const card = makeCard({
          thumb,
          name: gameName,
          url: g.url,
          visits: fmtBI(visitsBI),
          owner: g.owner,
          ui: g.ui
        });

        gamesWrap.appendChild(card);
        requestAnimationFrame(() => card.classList.add('show'));
      }

      const totalVisitsEl = document.getElementById('totalVisits');
      if (totalVisitsEl) {
        totalVisitsEl.textContent = fmtBI(total);
      }

      // بعد ما خلصنا بناء الكروت، رجّع اللغة
      applyLang(savedLang);

    } catch (err) {
      console.error(err);
      const totalVisitsEl = document.getElementById('totalVisits');
      if (totalVisitsEl) totalVisitsEl.textContent = '—';
    }
  }
  initGames();

  /* =======================
     10) Starfield background
  ======================== */
  (function starfield(){
    const cvs = document.getElementById('stars');
    if(!cvs) return;
    const ctx = cvs.getContext('2d');
    let w,h,stars;

    function resize(){
      w = cvs.width = window.innerWidth;
      h = cvs.height = window.innerHeight;
      stars = Array.from({ length: Math.min(200, Math.floor(w*h/5000)) }, () => ({
        x: Math.random()*w,
        y: Math.random()*h,
        z: Math.random()*0.8 + 0.2,
        s: Math.random()*1.2 + 0.4,
        a: Math.random()*0.8 + 0.2,
        da:(Math.random()*0.01 + 0.005) * (Math.random()<0.5?-1:1),
        hue: 210 + Math.random()*40
      }));
    }

    function tick(){
      ctx.clearRect(0,0,w,h);

      const grd = ctx.createRadialGradient(
        w/2, h/2, 0,
        w/2, h/2, Math.max(w,h)*0.8
      );
      grd.addColorStop(0,"rgba(10,12,20,1)");
      grd.addColorStop(1,"rgba(0,0,0,1)");
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,w,h);

      for(const st of stars){
        st.a += st.da;
        if(st.a <= 0.1 || st.a >= 1){
          st.da *= -1;
        }
        st.x += st.z * 0.25;
        if(st.x > w+20){
          st.x = -20;
          st.y = Math.random()*h;
        }
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.s, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${st.hue},100%,75%,${st.a})`;
        ctx.shadowColor = `hsla(${st.hue},100%,60%,${st.a})`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();
    tick();
  })();

  /* =======================
     11) Testimonials Slider
  ======================== */
  (function initReviewSlider(){
    const track         = document.getElementById('reviewsTrack');
    const dotsWrap      = document.getElementById('reviewsDots');
    const sliderWindow  = document.querySelector('.slider-window');

    const summaryStarsEl = document.getElementById('summaryStars');
    const avgRatingEl    = document.getElementById('avgRating');
    const reviewCountEl  = document.getElementById('reviewCount');

    if (!track || !dotsWrap || !sliderWindow) return;

    const reviewsData = [
      {
        user: "@10dok",
        text: {
          en: "Yooo the UI is super good and affordable, without your affordable and good looking UI I would’ve quit finishing my game",
          ar: "ياخي الـUI جامد وسعره كويس، من غير الـUI الكويس والرخيص بتاعك كنت بطلت أكمل لعبتي",
          es: "Bro la UI es muy buena y barata, sin tu UI bonita y asequible habría dejado de terminar mi juego"
        },
        rating: 5.0,
        date: {
          en: "26 Oct 2025",
          ar: "26 أكتوبر 2025",
          es: "26 Oct 2025"
        }
      },
      {
        user: "@Gren",
        text: {
          en: "Very fast orders and good quality",
          ar: "طلبات سريعة جداً وجودة ممتازة",
          es: "Pedidos muy rápidos y buena calidad"
        },
        rating: 5.0,
        date: {
          en: "26 Oct 2025",
          ar: "26 أكتوبر 2025",
          es: "26 Oct 2025"
        }
      },
      {
        user: "@schwerer",
        text: {
          en: "It's affordable, fast, flexible with revisions and good quality solid",
          ar: "السعر ممتاز، الشغل سريع، مرن مع التعديلات وجودة قوية",
          es: "Es asequible, rápido, flexible con revisiones y buena calidad sólida"
        },
        rating: 5.0,
        date: {
          en: "26 Oct 2025",
          ar: "26 أكتوبر 2025",
          es: "26 Oct 2025"
        }
      },
      {
        user: "@snowstorm/king",
        text: {
          en: "You're good, cheap, fast, UI is high quality and more affordable than other UI designers",
          ar: "شغلك حلو، رخيص، سريع، والـUI عالية الجودة وأرخص من غيرك",
          es: "Tu trabajo es bueno, barato, rápido, la UI es de alta calidad y más asequible que otros diseñadores"
        },
        rating: 5.0,
        date: {
          en: "26 Oct 2025",
          ar: "26 أكتوبر 2025",
          es: "26 Oct 2025"
        }
      },
      {
        user: "@nilcous",
        text: {
          en: "You handled everything perfectly according to my requests. My experience was great, and you delivered quickly, even on short notice. I would rate you 4/5 stars. The only area that could be improved is communication and response time.",
          ar: "نفذت كل حاجة زي ما طلبت بالظبط. تجربتي كانت ممتازة وسلّمت بسرعة حتى مع الوقت الضيق. أقيمك 4/5. الحاجة الوحيدة اللي محتاجة تحسين هي سرعة الرد والتواصل.",
          es: "Manejaste todo perfectamente según mis pedidos. Mi experiencia fue muy buena y entregaste rápido incluso con poco tiempo. Te daría 4/5 estrellas. Lo único a mejorar es la comunicación y el tiempo de respuesta."
        },
        rating: 4.0,
        date: {
          en: "27 Oct 2025",
          ar: "27 أكتوبر 2025",
          es: "27 Oct 2025"
        }
      }
    ];

    function buildStarsForCard(rating){
      const fullStars = Math.floor(rating);

      let html = "";
      for (let i = 0; i < 5; i++){
        if (i < fullStars){
          html += `<i class="fa-solid fa-star" aria-hidden="true"
              style="color:#ffd95e;text-shadow:0 0 8px rgba(255,217,94,.45);font-size:.8rem;"></i>`;
        } else {
          html += `<i class="fa-solid fa-star" aria-hidden="true"
              style="color:rgba(255,217,94,.22);text-shadow:none;font-size:.8rem;"></i>`;
        }
      }
      html += `<span class="tscore">${rating}</span>`;
      return html;
    }

    function renderSummaryStars(avg){
      const filled = Math.round(avg);
      let html = "";
      for (let i = 1; i <= 5; i++){
        if (i <= filled){
          html += `<i class="fa-solid fa-star" aria-hidden="true"></i>`;
        } else {
          html += `<i class="fa-regular fa-star" aria-hidden="true"></i>`;
        }
      }
      if (summaryStarsEl) summaryStarsEl.innerHTML = html;
    }

    track.innerHTML = '';
    dotsWrap.innerHTML = '';

    reviewsData.forEach((rv,idx)=>{
      const slide = document.createElement('div');
      slide.className = 'tslide';
      slide.style.flex = '0 0 100%';

      slide.innerHTML = `
        <article class="tcard">
          <header class="tcard-head">
            <span class="tuser">${rv.user}</span>
            <div class="tstars">${buildStarsForCard(rv.rating)}</div>
          </header>
          <p class="tbody"
             data-en="${rv.text.en.replace(/"/g,'&quot;')}"
             data-ar="${rv.text.ar.replace(/"/g,'&quot;')}"
             data-es="${rv.text.es.replace(/"/g,'&quot;')}">
            ${rv.text.en}
          </p>
          <footer class="tdate"
             data-en="${rv.date.en.replace(/"/g,'&quot;')}"
             data-ar="${rv.date.ar.replace(/"/g,'&quot;')}"
             data-es="${rv.date.es.replace(/"/g,'&quot;')}">
             ${rv.date.en}
          </footer>
        </article>
      `;
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Show review ${idx+1}`);
      dotsWrap.appendChild(dot);
    });

    // طبق اللغة الحالية بعد إنشاء السلايدز
    applyLang(savedLang);

    const dots = [...dotsWrap.children];
    let index = 0;
    const total = reviewsData.length;

    track.style.display = 'flex';
    track.style.flexWrap = 'nowrap';
    track.style.willChange = 'transform';
    track.style.transition = 'transform .5s cubic-bezier(.22,.9,.22,1)';

    function updateDots(){
      dots.forEach((d,i)=>{
        d.classList.toggle('active', i===index);
      });
    }

    function goTo(i){
      index = (i + total) % total;
      track.style.transform = `translateX(${-index * 100}%)`;
      updateDots();
    }

    dots.forEach((dot,i)=>{
      dot.addEventListener('click', ()=>{
        goTo(i);
        startAuto();
      });
    });

    const totalReviews = reviewsData.length;
    const totalStars   = reviewsData.reduce((sum,rv)=> sum + rv.rating, 0);
    const avgRating    = totalReviews > 0 ? (totalStars / totalReviews) : 0;
    const avgDisplay   = avgRating.toFixed(1).replace(/\.0$/,'');

    if (avgRatingEl)   avgRatingEl.textContent   = avgDisplay;
    if (reviewCountEl) reviewCountEl.textContent = totalReviews.toString();
    if (summaryStarsEl) renderSummaryStars(avgRating);

    let autoTimer;
    function startAuto(){
      stopAuto();
      autoTimer = setInterval(()=>{
        goTo(index+1);
      }, 4500);
    }
    function stopAuto(){
      if(autoTimer){
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    sliderWindow.addEventListener('mouseenter', stopAuto);
    sliderWindow.addEventListener('mouseleave', startAuto);

    goTo(0);
    startAuto();
  })();

  /* =======================
     12) Pricing CTA buttons -> Discord
     - يخلي زر "Go with this plan" يفتح ديسكورد بتاعك
  ======================== */
  (function setupPlanCTAs(){
    // لو حابب تغيّر اللينك، عدّله هنا
    const DISCORD_URL = "https://discord.com/users/1077620522680057856";

    const ctas = document.querySelectorAll('.plan-cta');
    if(!ctas.length) return;

    ctas.forEach(btn=>{
      // نتأكد إن مش معمولة قبل كده
      if (btn.dataset.boundDiscord === "true") return;
      btn.dataset.boundDiscord = "true";

      btn.addEventListener('click', ()=>{
        window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
      });
    });
  })();

});
