/* =========================================================
   光影展 LUMEN · 轮播实验室  —  main.js
   任务一：new Swiper('#mySwi4', {…}) 的四条硬性要求
   任务二：creative 电影墙（prev 缩左带角度 / next 放大右移进场）
   任务三：键盘 + 滚轮 + 现场调 delay
   ========================================================= */

(() => {
  'use strict';

  /* ------------------------- 1. 七种特效的参数表 ------------------------- */
  const EFFECTS = {
    // 01 默认推进
    slide: {},

    // 02 淡入淡出（crossFade 让两张图叠着化，不是一明一暗）
    fade: {
      effect: 'fade',
      fadeEffect: { crossFade: true }
    },

    // 03 立方体 —— 任务一要求的初始效果
    cube: {
      effect: 'cube',
      cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 22,
        shadowScale: 0.92
      }
    },

    // 04 唱片封面
    coverflow: {
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 36,
        stretch: -12,
        depth: 220,
        modifier: 1,
        slideShadows: false
      }
    },

    // 05 翻牌
    flip: {
      effect: 'flip',
      flipEffect: { slideShadows: true, limitRotation: true }
    },

    // 06 叠牌
    cards: {
      effect: 'cards',
      cardsEffect: { perSlideOffset: 14, perSlideRotate: 3, slideShadows: true }
    },

    // 07 ★ creative：课堂没讲的第七种，靠 creativeEffect.transform 手写
    creative: {
      effect: 'creative',
      creativeEffect: {
        limitProgress: 3,           // 往后叠 3 层，形成"选片墙"的纵深
        prev: {
          translate: ['-20%', 0, -380],  // 左移 + 后退 380px（Z 轴）
          rotate: [0, 30, 0],            // 绕 Y 轴转 30°，卡片侧过去
          scale: 0.6,                    // 缩小到 60%
          opacity: 0.55,                 // 压暗，让位给当前张
          shadow: true,
          origin: 'left center'          // 以左边缘为轴，像立在墙上
        },
        next: {
          translate: ['112%', 0, -120],  // 停在右侧画外，带一点纵深
          rotate: [0, -6, 0],            // 轻微反向角度，进场有"推镜"感
          scale: 1.18,                   // 起始放大 18%，推近后回到 1
          shadow: true
        }
      }
    }
  };

  /* ------------------------- 2. 公共基础参数 ------------------------- */
  // 任务一四条：loop / autoplay(3200, 手动后不停) / pagination(clickable) / 初始 cube
  const BASE = {
    loop: true,
    speed: 700,
    grabCursor: true,
    slidesPerView: 1,
    pagination: {
      el: '#pager',
      clickable: true            // ③ 圆点可点击
    },
    navigation: {
      prevEl: '#btnPrev',
      nextEl: '#btnNext'
    },
    // 任务三选的能力：parallax 视差（课堂上没讲过）
    // 打开后会给 [data-swiper-parallax] 的元素按 slide 进度做位移
    parallax: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    mousewheel: {
      enabled: true,
      forceToAxis: false,
      releaseOnEdges: true,
      thresholdDelta: 18,
      sensitivity: 1
    }
  };

  /* ------------------------- 3. 状态 ------------------------- */
  const state = {
    fx: 'cube',        // 初始效果 = cube（任务一 ④）
    autoOn: true,
    wheelOn: true,
    keysOn: true,
    parallaxOn: true,
    delay: 3200,       // 3.2 秒（任务一 ②）
    speed: 700,
    start: 0
  };

  // 地址栏可以直接指定特效：index.html?fx=creative —— 答辩时省得手点
  const qs = new URLSearchParams(location.search);
  if (qs.get('fx') && EFFECTS[qs.get('fx')]) state.fx = qs.get('fx');
  if (qs.get('delay') && Number(qs.get('delay')) > 0) state.delay = Number(qs.get('delay'));
  if (qs.get('speed') && Number(qs.get('speed')) > 0) state.speed = Number(qs.get('speed'));
  // ?freeze=380：自动翻一张，并在动画走到 380ms 时把浏览器真实算出的 transform 钉住
  // 仅用于截图取证，正常访问不触发
  const freezeAt = Number(qs.get('freeze')) || 0;
  if (qs.get('slide') && Number(qs.get('slide')) > 0) state.start = Number(qs.get('slide')) - 1;

  let swiper = null;

  /* ------------------------- 4. DOM ------------------------- */
  const $ = (s) => document.querySelector(s);
  const elDump   = $('#paramDump');
  const elCur    = $('#curIndex');
  const elTotal  = $('#totalIndex');
  const fxbar    = $('#fxbar');
  const chkAuto  = $('#chkAutoplay');
  const chkWheel = $('#chkWheel');
  const chkKeys  = $('#chkKeys');
  const chkPar   = $('#chkParallax');
  const delayRange = $('#delayRange');
  const delayInput = $('#delayInput');
  const speedRange = $('#speedRange');
  const speedInput = $('#speedInput');
  const delaySay = $('#delaySay');
  const speedSay = $('#speedSay');

  /* ------------------------- 5. 建实例 ------------------------- */
  function build(fx) {
    const keep = swiper ? swiper.realIndex : state.start;

    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }

    // 视差关掉时清一次残留：parallax 只改子元素 inline style，重建实例不会自动复位
    document.querySelectorAll('#mySwi4 [data-swiper-parallax]').forEach((el) => {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.transitionDuration = '';
    });

    const cfg = Object.assign({}, BASE, EFFECTS[fx] || {}, {
      parallax: state.parallaxOn,
      speed: state.speed,
      initialSlide: keep,
      autoplay: {
        delay: state.delay,
        disableOnInteraction: false,   // ② 手动操作后不停止
        pauseOnMouseEnter: false       // 鼠标悬停也不停，严格照要求来
      }
    });

    swiper = new Swiper('#mySwi4', cfg);
    window.mySwiper = swiper;          // 答辩时可在控制台直接玩

    // 用模块自带的 enable/disable 做开关，避免重建闪烁
    if (!state.wheelOn) swiper.mousewheel && swiper.mousewheel.disable();
    if (!state.keysOn)  swiper.keyboard && swiper.keyboard.disable();
    if (!state.autoOn)  swiper.autoplay.stop();

    swiper.on('slideChange', renderInfo);
    swiper.on('slideChangeTransitionEnd', renderInfo);

    // 对应官方 demo 340-history：把当前展品写进 URL，浏览器前进/后退也能切张
    bindHistory(swiper);

    renderInfo();
  }

  /* ------------------------- 5.5 浏览器历史（demo 340 的思路） -------------------------
     官方 340 用 Swiper 的 history 模块，它把地址拼成"路径"（/slide/neon），
     静态站一刷新就 404、相对路径也会断。这里用同一套 history API，
     但把状态放在 hash 里（#neon）：刷新、分享、前进后退都不会坏。
     ------------------------------------------------------------------------ */
  let userActed = false;

  document.addEventListener('pointerdown', () => {
    userActed = true;
    setTimeout(() => { userActed = false; }, 1500);
  }, true);
  document.addEventListener('keydown', () => {
    userActed = true;
    setTimeout(() => { userActed = false; }, 1500);
  }, true);

  function slugsOf(sw) {
    return Array.from(sw.el.querySelectorAll('.swiper-slide')).map((el) => el.dataset.history || '');
  }

  function bindHistory(sw) {
    const slugs = slugsOf(sw);

    const write = (i) => {
      const slug = slugs[i];
      if (!slug) return;
      const url = '#' + slug;
      if (location.hash === url) return;
      // 用户操作 -> 新增一条历史（能按后退）；自动播放 -> 替换当前条（不刷屏）
      const state = { exhibit: i, slug };
      if (userActed) history.pushState(state, '', url);
      else history.replaceState(state, '', url);
    };

    sw.on('slideChange', () => write(sw.realIndex));

    // 打开带 #neon 的链接，直接落在对应展品
    const at = slugs.indexOf(decodeURIComponent(location.hash.slice(1)));
    if (at > 0) setTimeout(() => sw.slideToLoop(at, 0), 80);

    renderDump();
  }

  // 只绑一次，切换特效重建实例后仍然有效
  window.addEventListener('popstate', (e) => {
    if (!swiper) return;
    const slugs = slugsOf(swiper);
    const idx = (e.state && typeof e.state.exhibit === 'number')
      ? e.state.exhibit
      : slugs.indexOf(decodeURIComponent(location.hash.slice(1)));
    if (idx >= 0 && idx < slugs.length) swiper.slideToLoop(idx, 500);
  });

  /* ------------------------- 6. 当前展品信息 ------------------------- */
  function renderInfo() {
    if (!swiper) return;
    const i = swiper.realIndex;
    elCur.textContent = i + 1;
    elTotal.textContent = swiper.slides.length;
    renderDump();
  }

  /* ------------------------- 7. 参数回读（实时） ------------------------- */
  function dumpParams() {
    const p = swiper.params;
    const out = {
      effect: p.effect,
      loop: p.loop,
      speed: p.speed,
      slidesPerView: p.slidesPerView,
      autoplay: state.autoOn
        ? { delay: p.autoplay.delay, disableOnInteraction: p.autoplay.disableOnInteraction }
        : false,
      pagination: { el: '#pager', clickable: p.pagination.clickable },
      parallax: typeof p.parallax === 'object' ? !!(p.parallax && p.parallax.enabled) : !!p.parallax,
      history: { mode: 'hash (#展品名)', url: location.hash || '(未写入)' },
      keyboard: { enabled: !!(p.keyboard && p.keyboard.enabled) },
      mousewheel: {
        enabled: !!(p.mousewheel && p.mousewheel.enabled),
        releaseOnEdges: !!(p.mousewheel && p.mousewheel.releaseOnEdges)
      }
    };

    if (p.effect === 'creative') {
      const c = p.creativeEffect;
      out.creativeEffect = {
        limitProgress: c.limitProgress,
        prev: { translate: c.prev.translate, rotate: c.prev.rotate, scale: c.prev.scale, opacity: c.prev.opacity },
        next: { translate: c.next.translate, rotate: c.next.rotate, scale: c.next.scale }
      };
    }

    return JSON.stringify(out, null, 2);
  }

  function highlight(json) {
    const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
    return json.replace(re, (m, str, colon, bool, num) => {
      if (str) return colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`;
      if (bool) return `<span class="b">${bool}</span>`;
      if (num) return `<span class="n">${num}</span>`;
      return m;
    });
  }

  function renderDump() {
    if (!swiper) return;
    elDump.innerHTML = highlight(dumpParams());
  }

  /* ------------------------- 8. 现场调参 · 说预期 ------------------------- */
  function sayDelay() {
    const d = state.delay;
    const s = state.speed;
    const pct = Math.round((s / d) * 100);
    let tone;

    if (pct >= 70) {
      tone = `动画占了一个周期的 <b>${pct}%</b>，上一张还没落定就被推走——观感像“卡带”，这是往小改 delay 最容易踩的坑。`;
    } else if (pct >= 40) {
      tone = `动画占比 <b>${pct}%</b>，节奏偏紧，翻页有点赶，但还能看清。`;
    } else {
      tone = `动画占比 <b>${pct}%</b>，节奏从容，每张都停得住。`;
    }
    const head = d === 3200
      ? `预期：保持默认 <b>3.2s</b>，每 3.2 秒切一张。`
      : `预期：自动翻页间隔从默认的 <b>3.2s</b> 变成 <b>${(d / 1000).toFixed(1)}s</b>，即每 ${(d / 1000).toFixed(1)} 秒切一张。`;
    delaySay.innerHTML =
      `${head}speed 仍是 ${s}ms，${tone}` +
      `<br>注意：delay 是“多久动一次”，speed 是“动多久”，两个不叠加。`;
  }

  function saySpeed() {
    if (!swiper) return;
    const s = state.speed;
    const d = state.delay;
    const pct = Math.round((s / d) * 100);
    speedSay.innerHTML =
      `预期：单次切换动画变长/变短，仅影响“动多久”，<b>不影响多久切一张</b>。` +
      `现在一周期里动画占 <b>${pct}%</b>。` +
      (pct >= 70 ? `已经超过 2/3，肉眼会觉得拖沓甚至追尾。` : `仍在舒服区间。`);
  }

  function applyDelay(v) {
    state.delay = v;
    delayRange.value = v;
    delayInput.value = v;
    if (swiper) {
      swiper.params.autoplay.delay = v;
      if (state.autoOn) {
        swiper.autoplay.stop();
        swiper.autoplay.start();
      }
    }
    sayDelay();
    renderDump();
  }

  function applySpeed(v) {
    state.speed = v;
    speedRange.value = v;
    speedInput.value = v;
    if (swiper) swiper.params.speed = v;
    saySpeed();
    renderDump();
  }

  /* ------------------------- 9. 事件绑定 ------------------------- */
  fxbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.fx');
    if (!btn) return;
    const fx = btn.dataset.fx;
    if (fx === state.fx && swiper) return;

    state.fx = fx;
    fxbar.querySelectorAll('.fx').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    build(fx);
  });

  chkAuto.addEventListener('change', () => {
    state.autoOn = chkAuto.checked;
    if (!swiper) return;
    state.autoOn ? swiper.autoplay.start() : swiper.autoplay.stop();
    renderDump();
  });

  chkWheel.addEventListener('change', () => {
    state.wheelOn = chkWheel.checked;
    if (!swiper || !swiper.mousewheel) return;
    state.wheelOn ? swiper.mousewheel.enable() : swiper.mousewheel.disable();
    renderDump();
  });

  // Swiper 11 没有 swiper.parallax.enable() 这种运行时开关（只有 params 上的开关），
  // 所以这里靠重新构造实例来切换——build() 里会先把子元素残留的 inline style 清掉。
  chkPar.addEventListener('change', () => {
    state.parallaxOn = chkPar.checked;
    build(state.fx);
  });

  chkKeys.addEventListener('change', () => {
    state.keysOn = chkKeys.checked;
    if (!swiper || !swiper.keyboard) return;
    state.keysOn ? swiper.keyboard.enable() : swiper.keyboard.disable();
    renderDump();
  });

  delayRange.addEventListener('input', () => applyDelay(Number(delayRange.value)));
  speedRange.addEventListener('input', () => applySpeed(Number(speedRange.value)));

  delayInput.addEventListener('change', () => {
    const v = Math.min(6000, Math.max(800, Number(delayInput.value) || 3200));
    applyDelay(v);
  });
  speedInput.addEventListener('change', () => {
    const v = Math.min(1600, Math.max(200, Number(speedInput.value) || 700));
    applySpeed(v);
  });

  // range 的填充色跟着走
  function paintRange(el) {
    const min = Number(el.min), max = Number(el.max), v = Number(el.value);
    const pct = ((v - min) / (max - min)) * 100;
    el.style.background =
      `linear-gradient(90deg,var(--ink) 0%,var(--ink) ${pct}%,#e2ddd2 ${pct}%,#e2ddd2 100%)`;
  }
  delayRange.addEventListener('input', () => paintRange(delayRange));
  speedRange.addEventListener('input', () => paintRange(speedRange));

  /* ------------------------- 10. 启动 ------------------------- */
  // 若地址栏带了 ?fx= / ?delay=，把 UI 也同步过去
  fxbar.querySelectorAll('.fx').forEach((b) => {
    const on = b.dataset.fx === state.fx;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
  });
  delayRange.value = state.delay;
  delayInput.value = state.delay;
  speedRange.value = state.speed;
  speedInput.value = state.speed;

  build(state.fx);          // 首屏就是 cube
  paintRange(delayRange);
  paintRange(speedRange);
  sayDelay();
  saySpeed();

  /* ------------------------- 11. 截图取证：冻结动画帧 ------------------------- */
  if (freezeAt > 0) {
    setTimeout(() => {
      swiper.slideNext();
      setTimeout(() => {
        swiper.autoplay.stop();
        swiper.slides.forEach((sl) => {
          const cs = getComputedStyle(sl);
          sl.style.transitionDuration = '0ms';
          sl.style.transform = cs.transform;
          sl.style.opacity = cs.opacity;
        });
      }, freezeAt);
    }, 500);
  }
})();
