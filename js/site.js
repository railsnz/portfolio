(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setCopyrightYear() {
    document.querySelectorAll('.js-copyright-year').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initStickyMenu() {
    var stickyElm = document.querySelector('.sticky-menu');
    if (!stickyElm) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries[0].target.classList.toggle('isSticky', entries[0].intersectionRatio < 1);
      },
      { threshold: [1] }
    );
    observer.observe(stickyElm);
  }

  function initDropdowns() {
    document.querySelectorAll('.w-dropdown').forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.w-dropdown-toggle');
      var list = dropdown.querySelector('.w-dropdown-list');
      if (!toggle || !list) return;

      var hoverEnabled = dropdown.getAttribute('data-hover') === 'true';
      var delay = parseInt(dropdown.getAttribute('data-delay') || '0', 10);
      var closeTimer = null;
      var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      toggle.setAttribute('role', 'button');
      toggle.setAttribute('tabindex', toggle.getAttribute('tabindex') || '0');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'true');

      function isOpen() {
        return list.classList.contains('w--open');
      }

      function open() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        list.classList.add('w--open');
        toggle.classList.add('w--open');
        toggle.setAttribute('aria-expanded', 'true');
      }

      function close() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        list.classList.remove('w--open');
        toggle.classList.remove('w--open');
        toggle.setAttribute('aria-expanded', 'false');
      }

      if (hoverEnabled && canHover) {
        dropdown.addEventListener('mouseenter', open);
        dropdown.addEventListener('mouseleave', function () {
          closeTimer = setTimeout(close, delay);
        });
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (isOpen()) close();
        else open();
      });

      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (isOpen()) close();
          else open();
        } else if (event.key === 'Escape') {
          close();
          toggle.focus();
        }
      });

      document.addEventListener('click', function (event) {
        if (!dropdown.contains(event.target)) close();
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen()) close();
      });
    });
  }

  function apply3d(el, transform) {
    el.style.transform = transform;
    el.style.transformStyle = 'preserve-3d';
  }

  function initHomeLayers() {
    var holder = document.querySelector('.animation-holder');
    if (!holder) return;

    var back = holder.querySelector('.back');
    var mid = holder.querySelector('.mid');
    var front = holder.querySelector('.front');
    var shimmer = holder.querySelector('.shimmer');
    var centred = holder.querySelector('.centred-holder');
    if (!back || !mid || !front || !centred) return;

    document.documentElement.classList.add('w-mod-ix');

    back.style.display = 'flex';
    apply3d(back, 'translate3d(0px, 0px, 0px)');
    mid.style.opacity = '0';
    apply3d(mid, 'translate3d(0px, 0px, 0px)');
    front.style.opacity = '0';
    apply3d(front, 'translate3d(0px, 0px, 0px)');

    function setFinalState() {
      mid.style.opacity = '1';
      front.style.opacity = '1';
      apply3d(back, 'translate3d(0px, 0px, -150px)');
      apply3d(mid, 'translate3d(0px, 0px, 0px)');
      apply3d(front, 'translate3d(0px, 0px, 150px)');
    }

    if (prefersReducedMotion() || !centred.animate) {
      setFinalState();
    } else {
      mid.animate(
        [
          { opacity: 0, transform: 'translate3d(0px, 0px, 0px)', offset: 0 },
          { opacity: 0, transform: 'translate3d(0px, 0px, 0px)', offset: 0.333 },
          { opacity: 1, transform: 'translate3d(0px, 0px, 75px)', offset: 1 }
        ],
        { duration: 1500, easing: 'ease-in-out', fill: 'forwards' }
      );
      front.animate(
        [{ transform: 'translate3d(0px, 0px, 0px)' }, { transform: 'translate3d(0px, 0px, 75px)' }],
        { delay: 500, duration: 500, fill: 'forwards' }
      );

      window.setTimeout(function () {
        front.animate(
          [
            { transform: 'translate3d(0px, 0px, 75px)' },
            { transform: 'translate3d(0px, 0px, 150px)' }
          ],
          { duration: 1000, easing: 'ease-out', fill: 'forwards' }
        );
        front.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 250, fill: 'forwards' }
        );
        back.animate(
          [
            { transform: 'translate3d(0px, 0px, 0px)' },
            { transform: 'translate3d(0px, 0px, -150px)' }
          ],
          { duration: 1000, easing: 'ease-out', fill: 'forwards' }
        );
        mid.animate(
          [
            { transform: 'translate3d(0px, 0px, 75px)', opacity: 1 },
            { transform: 'translate3d(0px, 0px, 0px)', opacity: 1 }
          ],
          { duration: 1000, easing: 'ease-out', fill: 'forwards' }
        );
      }, 1500);
    }

    initMouseTilt(centred, shimmer);
  }

  function initMouseTilt(centred, shimmer) {
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var hasPointer = false;
    var ticking = false;
    var lastTime = 0;

    centred.style.willChange = 'transform';
    centred.style.transformStyle = 'preserve-3d';
    if (shimmer) {
      shimmer.style.willChange = 'transform';
      shimmer.style.transformStyle = 'preserve-3d';
    }

    function render(now) {
      ticking = true;
      var dt = lastTime ? now - lastTime : 16.67;
      lastTime = now;
      // Smoothing values from the original IX2 mouse animation (66 / 50).
      var lerpX = 1 - Math.pow(0.66, dt / 16.67);
      var lerpY = 1 - Math.pow(0.5, dt / 16.67);
      currentX += (targetX - currentX) * lerpX;
      currentY += (targetY - currentY) * lerpY;

      var rotY = 35 + (currentX * -70);
      var rotX = -20 + (currentY * 35);
      apply3d(centred, 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)');

      if (shimmer) {
        var sx = -100 + currentX * 200;
        var sy = -50 + currentY * 100;
        apply3d(shimmer, 'translate3d(' + sx + '%, ' + sy + '%, 0px)');
      }

      if (Math.abs(targetX - currentX) > 0.0005 || Math.abs(targetY - currentY) > 0.0005) {
        window.requestAnimationFrame(render);
      } else {
        ticking = false;
        lastTime = 0;
      }
    }

    function kick() {
      if (!ticking) {
        lastTime = 0;
        window.requestAnimationFrame(render);
      }
    }

    function onMove(event) {
      hasPointer = true;
      var point = event.touches ? event.touches[0] : event;
      targetX = point.clientX / window.innerWidth;
      targetY = point.clientY / window.innerHeight;
      kick();
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    // Resting state matches Webflow: treat the pointer as being at 0,0 until it moves.
    apply3d(centred, 'rotateX(-20deg) rotateY(35deg)');
    if (shimmer) apply3d(shimmer, 'translate3d(-100%, -50%, 0px)');
    if (hasPointer) kick();
  }

  function initScrollFades() {
    var els = document.querySelectorAll('.card-tile-description[data-w-id]');
    if (!els.length) return;
    document.documentElement.classList.add('w-mod-ix');

    function show(el) {
      if (prefersReducedMotion() || !el.animate) {
        el.style.opacity = '1';
        el.style.transform = 'translate3d(0px, 0px, 0px)';
        return;
      }
      el.animate(
        [
          { opacity: 0, transform: 'translate3d(0px, 75px, 0px)' },
          { opacity: 1, transform: 'translate3d(0px, 0px, 0px)' }
        ],
        { delay: 100, duration: 500, easing: 'ease-out', fill: 'forwards' }
      );
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(show);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: '0px' }
    );
    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initSliders() {
    document.querySelectorAll('.w-slider').forEach(function (slider) {
      var mask = slider.querySelector('.w-slider-mask');
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.w-slide'));
      if (!mask || slides.length === 0) return;

      var animation = slider.getAttribute('data-animation') || 'slide';
      var duration = parseInt(slider.getAttribute('data-duration') || '500', 10);
      var easing = slider.getAttribute('data-easing') || 'ease';
      var autoplay = slider.getAttribute('data-autoplay') === 'true';
      var delay = parseInt(slider.getAttribute('data-delay') || '4000', 10);
      var infinite = slider.getAttribute('data-infinite') !== 'false';
      var disableSwipe = slider.getAttribute('data-disable-swipe') === 'true';
      var hideArrows = slider.getAttribute('data-hide-arrows') === 'true';
      var navSpacing = slider.getAttribute('data-nav-spacing') || '3';
      var nav = slider.querySelector('.w-slider-nav');
      var prevBtn = slider.querySelector('.w-slider-arrow-left');
      var nextBtn = slider.querySelector('.w-slider-arrow-right');
      var index = 0;
      var timer = null;
      var cssEase = easing === 'easeInOut' ? 'ease-in-out' : easing === 'easeOut' ? 'ease-out' : easing === 'easeIn' ? 'ease-in' : 'ease';

      if (nav) {
        nav.innerHTML = '';
        slides.forEach(function (_, i) {
          var dot = document.createElement('div');
          dot.className = 'w-slider-dot';
          dot.setAttribute('role', 'button');
          dot.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
          dot.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
          dot.tabIndex = i === 0 ? 0 : -1;
          dot.style.marginLeft = navSpacing + 'px';
          dot.style.marginRight = navSpacing + 'px';
          dot.addEventListener('click', function () {
            goTo(i, true);
          });
          nav.appendChild(dot);
        });
      }

      if (animation === 'cross') {
        mask.style.position = 'relative';
        slides.forEach(function (slide, i) {
          slide.style.position = i === 0 ? 'relative' : 'absolute';
          slide.style.top = '0';
          slide.style.left = '0';
          slide.style.width = '100%';
          slide.style.transition = 'opacity ' + duration + 'ms ' + cssEase + ', visibility ' + duration + 'ms ' + cssEase;
          if (i !== 0) {
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
          } else {
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
          }
        });
      } else {
        mask.style.display = 'flex';
        mask.style.transition = 'transform ' + duration + 'ms ' + cssEase;
        mask.style.willChange = 'transform';
        slides.forEach(function (slide) {
          slide.style.flex = '0 0 100%';
          slide.style.width = '100%';
          slide.style.transition = 'none';
        });
      }

      function updateArrows() {
        if (!hideArrows) return;
        if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = index === slides.length - 1 ? 'none' : 'block';
      }

      function goTo(next, user) {
        if (infinite) {
          next = (next + slides.length) % slides.length;
        } else {
          next = Math.max(0, Math.min(slides.length - 1, next));
        }
        index = next;

        if (animation === 'cross') {
          slides.forEach(function (slide, i) {
            if (i === index) {
              slide.style.position = 'relative';
              slide.style.opacity = '1';
              slide.style.visibility = 'visible';
            } else {
              slide.style.position = 'absolute';
              slide.style.opacity = '0';
              slide.style.visibility = 'hidden';
            }
          });
        } else {
          mask.style.transform = 'translateX(' + (-index * 100) + '%)';
        }

        slides.forEach(function (slide, i) {
          if (i === index) slide.removeAttribute('aria-hidden');
          else slide.setAttribute('aria-hidden', 'true');
        });

        if (nav) {
          Array.prototype.forEach.call(nav.children, function (dot, i) {
            var active = i === index;
            dot.classList.toggle('w-active', active);
            dot.setAttribute('aria-pressed', active ? 'true' : 'false');
            dot.tabIndex = active ? 0 : -1;
          });
        }

        updateArrows();
        if (user) restartAutoplay();
      }

      function restartAutoplay() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        if (autoplay && slides.length > 1) {
          timer = window.setInterval(function () {
            goTo(index + 1, false);
          }, delay);
        }
      }

      if (prevBtn) {
        prevBtn.setAttribute('role', 'button');
        prevBtn.setAttribute('aria-label', 'previous slide');
        prevBtn.addEventListener('click', function (event) {
          event.preventDefault();
          goTo(index - 1, true);
        });
      }
      if (nextBtn) {
        nextBtn.setAttribute('role', 'button');
        nextBtn.setAttribute('aria-label', 'next slide');
        nextBtn.addEventListener('click', function (event) {
          event.preventDefault();
          goTo(index + 1, true);
        });
      }

      mask.style.touchAction = disableSwipe ? 'auto' : 'pan-y';
      slides.forEach(function (slide) {
        slide.querySelectorAll('img').forEach(function (img) {
          img.draggable = false;
          img.style.webkitUserDrag = 'none';
        });
      });

      if (!disableSwipe && slides.length > 1) {
        var startX = null;
        var startY = null;
        var tracking = false;

        mask.addEventListener('pointerdown', function (event) {
          startX = event.clientX;
          startY = event.clientY;
          tracking = true;
          try { mask.setPointerCapture(event.pointerId); } catch (err) {}
        });
        mask.addEventListener('pointerup', function (event) {
          if (!tracking || startX == null) return;
          var dx = event.clientX - startX;
          var dy = event.clientY - startY;
          tracking = false;
          startX = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            event.preventDefault();
            if (dx > 0) goTo(index - 1, true);
            else goTo(index + 1, true);
          }
        });
        mask.addEventListener('pointercancel', function () {
          tracking = false;
          startX = null;
        });
      }

      goTo(0, false);
      restartAutoplay();
    });
  }

  function initLightboxes() {
    document.querySelectorAll('a.w-lightbox').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var data = { items: [] };
        var jsonEl = link.querySelector('script.w-json');
        if (jsonEl) {
          try {
            data = JSON.parse(jsonEl.textContent);
          } catch (err) {
            data = { items: [] };
          }
        }
        var items = data.items || [];
        if (!items.length) {
          var img = link.querySelector('img');
          if (img) items = [{ url: img.getAttribute('src'), type: 'image' }];
        }
        if (!items.length) return;
        openLightbox(items, 0, link.querySelector('img'));
      });
    });
  }

  function openLightbox(items, startIndex, triggerImg) {
    var index = startIndex || 0;
    var previousOverflow = document.documentElement.style.overflow;
    document.documentElement.classList.add('w-lightbox-noscroll');
    document.body.classList.add('w-lightbox-noscroll');

    var backdrop = document.createElement('div');
    backdrop.className = 'w-lightbox-backdrop';
    backdrop.style.opacity = '0';
    backdrop.innerHTML =
      '<div class="w-lightbox-container">' +
        '<div class="w-lightbox-content">' +
          '<div class="w-lightbox-spinner" role="progressbar" aria-live="polite" aria-hidden="false"></div>' +
          '<div class="w-lightbox-view" id="w-lightbox-view">' +
            '<div class="w-lightbox-frame">' +
              '<figure class="w-lightbox-figure">' +
                '<img class="w-lightbox-img w-lightbox-image" alt="">' +
              '</figure>' +
            '</div>' +
          '</div>' +
          '<div class="w-lightbox-control w-lightbox-left" role="button" aria-label="previous image" aria-controls="w-lightbox-view"></div>' +
          '<div class="w-lightbox-control w-lightbox-right" role="button" aria-label="next image" aria-controls="w-lightbox-view"></div>' +
          '<div class="w-lightbox-control w-lightbox-close" role="button" aria-label="close lightbox" tabindex="0"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    window.requestAnimationFrame(function () {
      backdrop.style.transition = 'opacity 300ms';
      backdrop.style.opacity = '1';
    });

    var img = backdrop.querySelector('.w-lightbox-img');
    var view = backdrop.querySelector('.w-lightbox-view');
    var spinner = backdrop.querySelector('.w-lightbox-spinner');
    var closeBtn = backdrop.querySelector('.w-lightbox-close');
    var prevBtn = backdrop.querySelector('.w-lightbox-left');
    var nextBtn = backdrop.querySelector('.w-lightbox-right');
    var usedFallback = false;

    function showImage() {
      if (spinner) spinner.classList.add('w-lightbox-hide');
      view.style.opacity = '1';
    }

    img.addEventListener('load', function () {
      if (img.naturalWidth) showImage();
    });
    img.addEventListener('error', function () {
      if (!usedFallback && triggerImg && triggerImg.getAttribute('src') && triggerImg.getAttribute('src') !== img.getAttribute('src')) {
        usedFallback = true;
        img.src = triggerImg.getAttribute('src');
        return;
      }
      // Keep the spinner if the image cannot be loaded, matching the old Webflow behaviour.
    });

    function show(i) {
      index = (i + items.length) % items.length;
      var item = items[index];
      usedFallback = false;
      if (spinner) spinner.classList.remove('w-lightbox-hide');
      view.style.opacity = '0';
      img.alt = (triggerImg && triggerImg.alt) || '';
      img.src = item.url;
      if (img.complete && img.naturalWidth) showImage();
      var single = items.length < 2;
      prevBtn.classList.toggle('w-lightbox-inactive', single);
      nextBtn.classList.toggle('w-lightbox-inactive', single);
      prevBtn.setAttribute('aria-hidden', single ? 'true' : 'false');
      nextBtn.setAttribute('aria-hidden', single ? 'true' : 'false');
    }

    function close() {
      backdrop.style.opacity = '0';
      window.setTimeout(function () {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        document.documentElement.classList.remove('w-lightbox-noscroll');
        document.body.classList.remove('w-lightbox-noscroll');
        document.documentElement.style.overflow = previousOverflow;
        document.removeEventListener('keydown', onKey);
      }, 300);
    }

    function onKey(event) {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft' && items.length > 1) show(index - 1);
      else if (event.key === 'ArrowRight' && items.length > 1) show(index + 1);
    }

    closeBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      close();
    });
    prevBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (items.length > 1) show(index - 1);
    });
    nextBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (items.length > 1) show(index + 1);
    });
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop || event.target.classList.contains('w-lightbox-container') || event.target.classList.contains('w-lightbox-content') || event.target.classList.contains('w-lightbox-view')) {
        close();
      }
    });
    document.addEventListener('keydown', onKey);
    show(index);
    closeBtn.focus();
  }


  function headerOffset() {
    var sticky = document.querySelector('.sticky-menu');
    if (!sticky) return 0;
    return Math.ceil(sticky.getBoundingClientRect().height);
  }

  function applyScrollPadding() {
    var offset = headerOffset();
    document.documentElement.style.scrollPaddingTop = offset ? offset + 'px' : '';
  }

  function targetFromHash(hash) {
    if (!hash || hash === '#') return null;
    var id;
    try {
      id = decodeURIComponent(hash.replace(/^#/, ''));
    } catch (err) {
      id = hash.replace(/^#/, '');
    }
    return document.getElementById(id);
  }

  function jumpToTarget(target) {
    if (!target) return;
    applyScrollPadding();
    var html = document.documentElement;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo(0, Math.max(0, top));
    html.style.scrollBehavior = prev;
  }

  var scrollToken = 0;
  var pinUntil = 0;
  var spyLockId = null;
  var updateScrollSpy = function () {};

  function pinAlignment() {
    pinUntil = Date.now() + 2500;
  }

  function realignHashIfPinned() {
    if (Date.now() > pinUntil) return;
    jumpToTarget(targetFromHash(window.location.hash));
  }

  function scrollToHash(hash, instant) {
    var target = targetFromHash(hash);
    if (!target) return false;
    applyScrollPadding();
    pinAlignment();
    spyLockId = target.id;
    var instantMove = instant || prefersReducedMotion();
    if (instantMove) {
      jumpToTarget(target);
      spyLockId = null;
      updateScrollSpy();
      return true;
    }

    var token = ++scrollToken;
    var top = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerOffset());
    window.scrollTo({ top: top, behavior: 'smooth' });

    var finished = false;
    function correct() {
      if (finished || token !== scrollToken) return;
      finished = true;
      jumpToTarget(target);
      spyLockId = null;
      updateScrollSpy();
    }
    window.addEventListener('scrollend', correct, { once: true });
    var last = window.scrollY;
    var still = 0;
    var started = Date.now();
    var iv = window.setInterval(function () {
      if (token !== scrollToken) {
        window.clearInterval(iv);
        return;
      }
      if (window.scrollY === last) still += 1;
      else still = 0;
      last = window.scrollY;
      if (still >= 8 || Date.now() - started > 10000) {
        window.clearInterval(iv);
        correct();
      }
    }, 50);
    return true;
  }

  function initSmoothScroll() {
    applyScrollPadding();
    window.addEventListener('resize', applyScrollPadding);

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#' || href === '#') return;
      if (link.classList.contains('w-lightbox')) return;
      if (!targetFromHash(href)) return;
      event.preventDefault();
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', href);
      } else {
        window.location.hash = href;
      }
      scrollToHash(href, false);
    });

    window.addEventListener('popstate', function () {
      if (window.location.hash) scrollToHash(window.location.hash, prefersReducedMotion());
    });

    document.addEventListener('load', function (event) {
      var el = event.target;
      if (!el || !el.tagName || el.tagName !== 'IMG') return;
      if (Date.now() > pinUntil) return;
      window.setTimeout(realignHashIfPinned, 50);
    }, true);

    if (window.location.hash) {
      scrollToHash(window.location.hash, true);
    }
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.sticky-menu a.nav-anchor[href^="#"]'));
    if (!links.length) return;

    var items = [];
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      var section = targetFromHash(href);
      if (section) items.push({ link: link, section: section, href: href });
    });
    if (!items.length) return;

    function setCurrent(id) {
      items.forEach(function (item) {
        var on = item.section.id === id;
        item.link.classList.toggle('w--current', on);
        if (on) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }

    function update() {
      if (spyLockId) {
        setCurrent(spyLockId);
        return;
      }
      var probe = headerOffset() + 8;
      var currentId = null;
      items.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= probe) {
          currentId = item.section.id;
        }
      });
      setCurrent(currentId);
    }
    updateScrollSpy = update;

    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        update();
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function () {
        update();
      }, {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      });
      items.forEach(function (item) {
        observer.observe(item.section);
      });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href');
        var target = targetFromHash(href);
        if (target) setCurrent(target.id);
      });
    });
    update();
  }

  ready(function () {
    setCopyrightYear();
    initStickyMenu();
    initDropdowns();
    initHomeLayers();
    initScrollFades();
    initSliders();
    initLightboxes();
    initSmoothScroll();
    initScrollSpy();
  });
})();
