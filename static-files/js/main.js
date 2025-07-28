document.addEventListener('DOMContentLoaded', () => {
  // Sticky menu
  const header = document.querySelector('.main-header');
  const body = document.body;
  const html = document.documentElement;
  const isMobileOrTablet = () => {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 1024px)").matches;
  };

  // function handleScroll() {
  //   if (window.innerWidth > 767) {
  //     header.classList.toggle('fixed', window.pageYOffset > 20);
  //   } else {
  //     header.classList.remove('fixed'); // на всякий випадок прибрати клас, якщо був доданий
  //   }
  // }
  // window.addEventListener('scroll', handleScroll);
  // // Також рекомендується оновлювати стан при зміні розміру вікна
  // window.addEventListener('resize', handleScroll);


  let lastScroll = 0;

  function handleScroll() {
    // if (window.innerWidth <= 767) {
    //   header.classList.remove('fixed');
    //   return;
    // }
    if (!header) return; // <--- Додаємо цю перевірку
    const currentScroll = window.pageYOffset;

    if (currentScroll < lastScroll && currentScroll > 20) {
      // Прокрутка вгору — показати і зафіксувати
      header.classList.add('fixed');
    } else {
      // Прокрутка вниз — прибрати фіксацію
      header.classList.remove('fixed');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);






  // --- Dropdown  --- //

  function openDropdown(list, dropdown) {
    adjustPosition(list, dropdown);
    list.classList.add('opened');
    const toggle = dropdown.querySelector('.cs-drop-toggle');
    toggle?.classList.add('active');
    setTimeout(() => list.classList.add('animate'), 10);
    list.classList.remove('mobile');
  }

  function closeDropdown(list) {
    list.classList.remove('animate');
    const handler = function () {
      list.classList.remove('opened');
      list.removeEventListener('transitionend', handler);
      const dropdown = list.closest('.cs-dropdown');
      const toggle = dropdown?.querySelector('.cs-drop-toggle');
      toggle?.classList.remove('active');
    };
    list.addEventListener('transitionend', handler);
  }


  const closeAll = () => {
    document.querySelectorAll('.cs-dropdown-list.opened').forEach(list => {
      closeDropdown(list);
      list.classList.remove('measuring');
    });
  };

  const adjustPosition = (list, dropdown) => {
    list.classList.add('measuring');
    list.style.left = '';
    list.style.right = '';
    list.style.top = '';
    list.style.bottom = '';

    const dropdownRect = dropdown.getBoundingClientRect();
    const listWidth = list.offsetWidth;
    const listHeight = list.offsetHeight;

    const spaceLeft = dropdownRect.left;
    const spaceRight = window.innerWidth - dropdownRect.right;
    const spaceBottom = window.innerHeight - dropdownRect.bottom;
    const spaceTop = dropdownRect.top;

    if (spaceRight >= listWidth) {
      list.style.left = '0';
      list.style.right = 'auto';
    } else if (spaceLeft >= listWidth) {
      list.style.right = '0';
      list.style.left = 'auto';
    } else {
      list.style.left = '0';
      list.style.right = '0';
      list.style.maxWidth = '100vw';
    }

    if (spaceBottom >= listHeight) {
      list.style.top = 'calc(100% + 2px)';
      list.style.bottom = 'auto';
    } else if (spaceTop >= listHeight) {
      list.style.top = 'auto';
      list.style.bottom = 'calc(100% + 2px)';
    } else {
      // не влазить ні зверху, ні знизу
      list.style.top = 'calc(100% + 2px)';
      list.style.bottom = 'auto';
    }

    list.classList.remove('measuring');
  }



  function highlightTextInElement(element, query) {
    const safeQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');

    function walk(node) {
      if (node.nodeType === 3) { // Text node
        if (regex.test(node.nodeValue)) {
          const span = document.createElement('span');
          span.innerHTML = node.nodeValue.replace(regex, '<strong>$1</strong>');
          node.replaceWith(...span.childNodes);
        }
      } else if (node.nodeType === 1 && node.childNodes) {
        Array.from(node.childNodes).forEach(walk);
      }
    }

    walk(element);
  }



  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.cs-drop-toggle');
    const dropdown = toggle?.closest('.cs-dropdown');

    if (toggle && dropdown) {
      e.preventDefault();
      const list = dropdown.querySelector('.cs-dropdown-list');
      const isOpen = list.classList.contains('opened');
      if (!isOpen) {
        closeAll();
        openDropdown(list, dropdown);
      } else {
        closeAll();
      }

    } else if (e.target.closest('.drop-link')) {
      closeAll();
    } else {
      if (!e.target.closest('.cs-dropdown')) {
        closeAll();
      }
    }
  });

  let previousSelectedOption = null;
  document.querySelectorAll('.cs-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.cs-drop-toggle');
    const list = dropdown.querySelector('.cs-dropdown-list');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    // --- Додаємо іконку тільки якщо це селект ---
    if (toggle.classList.contains('cs-select') && !toggle.querySelector('.ico-arrow-sm-down-filled')) {
      const icon = document.createElement('span');
      icon.className = 'ico ico-arrow-sm-down-filled';
      toggle.appendChild(icon);
    }

    // === Додаємо пошук для всіх дропдаунів з >10 опцій ===

    const allOptions = Array.from(list.querySelectorAll('.drop-link'));

    allOptions.forEach(option => {
      if (!option.dataset.originalHtml) {
        option.dataset.originalHtml = option.innerHTML.trim();
      }
      if (!option.dataset.originalText) {
        option.dataset.originalText = option.textContent.trim().toLowerCase();
      }
    });


    if (allOptions.length > 10 && !list.querySelector('.c-search')) {
      const searchHTML = `
    <div class="f-row">
        <div class="c-form c-search">
            <span class="ico ico-search"></span>
            <input class="form-in f-md search" type="text" placeholder="Search..." autocomplete="off">
            <span class="ico ico-close btn-clear" style="display: none;"></span>
        </div>
    </div>`;

      list.insertAdjacentHTML('afterbegin', searchHTML);

      const wrapper = list.querySelector('.drop-list-wrapper') || list;
      const searchInput = list.querySelector('.search');
      const clearBtn = list.querySelector('.btn-clear');

      // Зберігаємо оригінальний вміст і текст для пошуку
      allOptions.forEach(option => {
        if (!option.dataset.originalHtml) {
          option.dataset.originalHtml = option.innerHTML.trim();
        }
        if (!option.dataset.originalText) {
          option.dataset.originalText = option.textContent.trim().toLowerCase();
        }
      });

      const filterList = () => {
        const query = searchInput.value.toLowerCase().trim();
        clearBtn.style.display = query ? 'flex' : 'none';
        let hasMatch = false;

        wrapper.querySelectorAll('.drop-link').forEach(option => {
          const originalHtml = option.dataset.originalHtml;
          const originalText = option.dataset.originalText;

          if (originalText.includes(query)) {
            option.innerHTML = originalHtml;
            if (query) {
              highlightTextInElement(option, query);
            }
            option.style.display = 'flex';
            hasMatch = true;
          } else {
            option.innerHTML = originalHtml;
            option.style.display = 'none';
          }
        });

        const noResults = list.querySelector('.no-results');
        if (!hasMatch) {
          if (!noResults) {
            const msg = document.createElement('div');
            msg.className = 'no-results';
            msg.textContent = 'No matches...';
            msg.style.padding = '10px 20px';
            msg.style.opacity = '0.6';
            wrapper.appendChild(msg);
          } else {
            noResults.style.display = 'block';
          }
        } else if (noResults) {
          noResults.style.display = 'none';
        }
      };

      searchInput.addEventListener('input', filterList);
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        filterList();
      });
    }




    // === Призначаємо обробники на drop-link для ВСІХ дропдаунів ===
    list.querySelectorAll('.drop-link').forEach(option => {
      option.addEventListener('click', e => {
        const isSelect = toggle.classList.contains('cs-select');

        if (isSelect) {
          e.preventDefault();

          // 1. Повертаємо попередній пункт у список
          if (previousSelectedOption) {
            previousSelectedOption.style.display = 'flex';
          }

          // 2. Приховуємо поточний вибраний пункт
          option.style.display = 'none';
          previousSelectedOption = option;

          // 4. Оновлюємо текст toggle
          const icon = toggle.querySelector('.ico-arrow-sm-down-filled');
          const newText = option.dataset.original || option.textContent.trim();

          toggle.innerHTML = option.dataset.originalHtml;
          if (icon) toggle.appendChild(icon);

          dropdown.dataset.value = option.dataset.value;
          if (hiddenInput) {
            hiddenInput.value = option.dataset.value;
          }
        }

        closeAll();
      });


    });

  });


  window.addEventListener('resize', () => {
    document.querySelectorAll('.cs-dropdown-list.opened').forEach(list => {
      const dropdown = list.closest('.cs-dropdown');
      adjustPosition(list, dropdown);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
    }
  });








  // ======== MODALS ========
  // === Функції відкриття/закриття модалів ===
  // === Відкриття модалок по data-target ===

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('opened');
    document.body.classList.add('static'); // щоб заблокувати скрол
  }


  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('opened');
    document.body.classList.remove('static');
  }

  document.querySelectorAll('[data-target]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const targetSelector = trigger.getAttribute('data-target');
      const targetModal = document.querySelector(targetSelector);

      // Закрити іншу модалку, якщо вказано data-close-target
      const closeTargetSelector = trigger.getAttribute('data-close-target');
      if (closeTargetSelector) {
        const closeModalElement = document.querySelector(closeTargetSelector);
        if (closeModalElement) closeModal(closeModalElement);
      }

      openModal(targetModal);
    });
  });




  // === Закриття модалок при кліку на .close-btn або на порожню область modal-container ===
  document.querySelectorAll('.modal-wrapper').forEach(function (modal) {
    modal.querySelectorAll('.close-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeModal(modal);
      });
    });

    modal.querySelector('.modal-container').addEventListener('mousedown', function (e) {
      if (e.target === this) {
        this.dataset.mouseDown = 'true';
      } else {
        this.dataset.mouseDown = 'false';
      }
    });

    modal.querySelector('.modal-container').addEventListener('mouseup', function (e) {
      if (e.target === this && this.dataset.mouseDown === 'true') {
        closeModal(modal);
      }
      delete this.dataset.mouseDown;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const openedModals = document.querySelectorAll('.modal-wrapper.opened');
      const lastOpened = openedModals[openedModals.length - 1];

      if (lastOpened) {
        closeModal(lastOpened);
      }
    }
  });

  document.documentElement.style.minWidth = '0';
  document.body.style.minWidth = '0';

  // === Закриття модалки по data-close ===
  document.querySelectorAll('[data-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      const modal = button.closest('.modal');
      if (modal) closeModal(modal);
    });
  });
});




// ======== MODAL VIDEO ========
document.addEventListener('DOMContentLoaded', function () {
  console.log('Скрипт модалки відео ініціалізовано');

  // Перевірка наявності модалки
  const modal = document.querySelector('#m-video-box');
  if (!modal) {
    console.error('Помилка: модалка #m-video-box не знайдена в DOM');
    return;
  }
  console.log('Модалка #m-video-box знайдена');

  const videoContainer = modal.querySelector('.mod-box');
  const closeModalBtn = modal.querySelector('.close-btn');
  const modalContainer = modal.querySelector('.modal-container');
  if (!videoContainer || !closeModalBtn || !modalContainer) {
    console.error('Помилка: відсутні .mod-box, .close-btn або .modal-container у #m-video-box');
    return;
  }
  console.log('Усі необхідні елементи модалки знайдено');

  // Функція для отримання YouTube ID
  function extractYouTubeId(url) {
    if (!url) {
      console.warn('URL відео не надано');
      return null;
    }
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) {
      console.warn(`Невалідний YouTube URL: ${url}`);
      return null;
    }
    return match[1];
  }

  // Перевірка, чи це shorts
  function isShortsUrl(url) {
    return /youtube\.com\/shorts\//.test(url) || (/youtu\.be\/[a-zA-Z0-9_-]+/.test(url) && /shorts/.test(url));
  }

  // Загальна функція openModal із першого скрипту
  function openModal(modal) {
    if (!modal) {
      console.error('Помилка: модалка для відкриття не передана');
      return;
    }
    modal.classList.add('opened');
    document.body.classList.add('static');
    console.log('Модалка відкрита:', modal.id);
  }

  // Обробка кліків по .a-video
  document.querySelectorAll('.a-video.a-hover').forEach(link => {
    if (!link.querySelector('.ico-play-solid')) {
      const playIcon = document.createElement('span');
      playIcon.className = 'ico ico-play-solid';
      link.appendChild(playIcon);
    }
  });

  document.querySelectorAll('.a-video:not(.cloned)').forEach(link => {
    console.log('Ініціалізація посилання:', link.getAttribute('href'));
    const videoUrl = link.getAttribute('href');
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return;

    // Додаємо прев’ю для .a-hover
    if (link.classList.contains('a-hover') && !link.querySelector('img')) {
      const img = document.createElement('img');
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.alt = 'YouTube preview';
      link.insertBefore(img, link.firstChild);
      console.log('Додано прев’ю для:', videoUrl);
    }

    // Hover-ефект
    if (link.classList.contains('a-hover')) {
      link.addEventListener('mouseenter', function () {
        if (!link.querySelector('iframe')) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&rel=0&playsinline=1`;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 1;';
          link.style.position = 'relative';
          link.appendChild(iframe);
          console.log('Додано hover-iframe для:', videoUrl);
        }
      });
      link.addEventListener('mouseleave', function () {
        const iframe = link.querySelector('iframe');
        if (iframe) {
          iframe.remove();
          console.log('Видалено hover-iframe для:', videoUrl);
        }
      });
    }

    // Відкриття модалки
    link.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Клік по відео:', videoUrl);

      // Формуємо список відео
      let parentList = null;
      let allLinks = [link];
      let modalIndex = 0;
      let el = link.parentElement;
      while (el && el !== document.body) {
        if (el.classList.contains('cs-video-list')) {
          const videos = el.querySelectorAll('.a-video');
          if (videos.length > 1) {
            parentList = el;
            allLinks = Array.from(videos);
            modalIndex = allLinks.indexOf(link);
          }
          break;
        }
        el = el.grandparentElement;
      }

      modalVideoList = allLinks.map(l => extractYouTubeId(l.getAttribute('href'))).filter(Boolean);
      modalCurrentIndex = modalIndex;
      console.log('Список відео:', modalVideoList, 'Поточний індекс:', modalCurrentIndex);

      // Визначаємо shorts
      const isShorts = isShortsUrl(videoUrl);
      const cModal = modal.querySelector('.c-modal');
      if (cModal) cModal.classList.toggle('is-shorts', isShorts);
      modalContainer.classList.toggle('vertical-video', isShorts);
      modalContainer.classList.toggle('horisontal-video', !isShorts);

      renderModalVideo(modalCurrentIndex);
      openModal(modal);
    });
  });

  // --- МОДАЛЬНЕ ПЕРЕМИКАННЯ ВІДЕО ---
  let modalVideoList = [];
  let modalCurrentIndex = 0;

  function renderModalVideo(index) {
    console.log('Рендеринг відео з індексом:', index);
    const videoId = modalVideoList[index];
    if (!videoId) {
      console.error('Помилка: videoId не знайдено для індексу', index);
      return;
    }

    videoContainer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
    console.log('Додано iframe для videoId:', videoId);

    // Обробка thumbnails (спрощено)
    let thumbs = modal.querySelector('.modal-thumbnails');
    if (modalVideoList.length > 1) {
      modalContainer.classList.add('m-media-list');
      if (!thumbs) {
        thumbs = document.createElement('div');
        thumbs.className = 'modal-thumbnails';
        modal.querySelector('.c-modal.mod-media')?.appendChild(thumbs) || modal.appendChild(thumbs);
      }
      thumbs.innerHTML = '';
      thumbs.style.display = 'flex';

      modalVideoList.forEach((vid, i) => {
        const thumb = document.createElement('img');
        thumb.src = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
        thumb.alt = 'Thumbnail';
        thumb.className = 'modal-thumb';
        if (i === index) thumb.classList.add('active');
        thumb.style.cursor = 'pointer';
        thumb.onclick = function (e) {
          e.stopPropagation();
          modalCurrentIndex = i;
          renderModalVideo(i);
        };
        thumbs.appendChild(thumb);
      });
      console.log('Додано thumbnails для', modalVideoList.length, 'відео');
    } else {
      if (thumbs) thumbs.style.display = 'none';
      modalContainer.classList.remove('m-media-list');
    }

    // Навігація
    let nav = modal.querySelector('.modal-media-nav');
    if (!nav && modalVideoList.length > 1) {
      nav = document.createElement('div');
      nav.className = 'modal-media-nav';
      nav.innerHTML = `
        <button class="nav-arrow prev" type="button"><span class="ico ico-alt-arrow-left"></span></button>
        <button class="nav-arrow next" type="button"><span class="ico ico-alt-arrow-right"></span></button>
      `;
      modal.querySelector('.c-modal.mod-media')?.appendChild(nav) || modal.appendChild(nav);
      nav.querySelector('.nav-arrow.prev').onclick = function (e) {
        e.stopPropagation();
        const prevIndex = (modalCurrentIndex - 1 + modalVideoList.length) % modalVideoList.length;
        modalCurrentIndex = prevIndex;
        renderModalVideo(prevIndex);
      };
      nav.querySelector('.nav-arrow.next').onclick = function (e) {
        e.stopPropagation();
        const nextIndex = (modalCurrentIndex + 1) % modalVideoList.length;
        modalCurrentIndex = nextIndex;
        renderModalVideo(nextIndex);
      };
      console.log('Додано навігацію для відео');
    }
    if (nav) nav.style.display = modalVideoList.length > 1 ? '' : 'none';
  }

  // Закриття модалки
  function closeVideoModal() {
    modal.classList.remove('opened');
    document.body.classList.remove('static');
    videoContainer.innerHTML = '';
    const nav = modal.querySelector('.modal-media-nav');
    if (nav) nav.remove();
    const thumbs = modal.querySelector('.modal-thumbnails');
    if (thumbs) thumbs.remove();
    modalVideoList = [];
    modalCurrentIndex = 0;
    modal.querySelector('.c-modal')?.classList.remove('is-shorts');
    modalContainer.classList.remove('vertical-video', 'horisontal-video', 'm-media-list');
    console.log('Модалка відео закрита');
  }

  // Обробники закриття
  closeModalBtn.addEventListener('click', closeVideoModal);
  modalContainer.addEventListener('click', function (e) {
    if (e.target === modalContainer) closeVideoModal();
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeVideoModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (modal.classList.contains('opened')) closeVideoModal();
    }
  });









  // --- Додаємо розбиття на два блоки по половині зображень ---
  function resizeGalleryImages(container, maxSize = 500) {
    container.querySelectorAll('.gallery-item img').forEach(imgEl => {
      if (imgEl.dataset.thumbGenerated) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgEl.src;
      img.onload = function () {
        let w = img.width, h = img.height, ratio = 1;
        if (w > h && w > maxSize) ratio = maxSize / w;
        if (h >= w && h > maxSize) ratio = maxSize / h;
        const drawW = Math.round(w * ratio), drawH = Math.round(h * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = drawW; canvas.height = drawH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, drawW, drawH);
        imgEl.dataset.originalSrc = imgEl.src;
        imgEl.src = canvas.toDataURL('image/jpeg', 0.8);
        imgEl.width = drawW;
        imgEl.height = drawH;
        imgEl.dataset.thumbGenerated = "1";
      };
    });
  }

  // Викликаємо функцію для всіх контейнерів з класом .gallery-list
  window.addEventListener('load', () => {
    document.querySelectorAll('.gallery-list').forEach(container => {
      resizeGalleryImages(container);
    });
  });


  // --- Dotted button hover effect ---
  document.querySelectorAll('.p-btn.btn-dotted').forEach(button => {
    const innerDiv = button.querySelector('div');
    let currentX = 50, currentY = 50, targetX = 50, targetY = 50, isInside = false, hoveredShouldRemove = false;

    const animate = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      const pos = `${currentX}% ${currentY}%`;
      button.style.setProperty('--mask-pos', pos);
      innerDiv && innerDiv.style.setProperty('--mask-pos', pos);

      if (hoveredShouldRemove && !isInside) {
        if (Math.abs(currentX - 50) < 0.5 && Math.abs(currentY - 50) < 0.5) {
          button.classList.remove('hovered');
          hoveredShouldRemove = false;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();

    const updateTargetFromEvent = e => {
      const rect = button.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    button.addEventListener('mouseenter', e => {
      isInside = true; hoveredShouldRemove = false;
      updateTargetFromEvent(e);
      button.classList.add('hovered');
    });
    button.addEventListener('mousemove', e => { if (isInside) updateTargetFromEvent(e); });
    button.addEventListener('mouseleave', () => {
      isInside = false; targetX = 50; targetY = 50; hoveredShouldRemove = true;
    });
  });

  // --- Smooth anchor scroll ---
  document.body.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // --- Map code початок ---

  const mapFilterClass = 'map-color-filter';
  const map = L.map('map', {
    center: [48, 15], zoom: 4, minZoom: 2, maxZoom: 18, worldCopyJump: false,
    maxBounds: [[-85, -180], [85, 180]]
  });
  const positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>', subdomains: 'abcd', maxZoom: 19
  }).addTo(map);
  positron.on('load', () => positron.getContainer()?.classList.add(mapFilterClass));
  positron.getContainer()?.classList.add(mapFilterClass);

  const locationLinks = document.querySelectorAll('.c-location');
  const locations = Array.from(locationLinks).map(el => {
    const titleEl = el.querySelector('.location-title');
    return [
      parseFloat(el.getAttribute('data-lat')),
      parseFloat(el.getAttribute('data-lng')),
      titleEl ? titleEl.textContent.trim() : el.textContent.trim()
    ];
  });
  const markers = [];

  function setActiveLocationLink(link) {
    document.querySelectorAll('.location-title .ico.ico-location-solid').forEach(ico => ico.remove());
    const title = link.querySelector('.location-title');
    if (title && !title.querySelector('.ico-location-solid')) {
      const icon = document.createElement('span');
      icon.className = 'ico ico-location-solid';
      title.insertBefore(icon, title.firstChild);
    }
    setTimeout(() => {
      const mapEl = document.getElementById('map');
      const markerEl = document.querySelector('.leaflet-marker-icon.active');
      if (mapEl && markerEl) {
        const markerLatLng = markers.find(m => m.getElement() === markerEl)?.getLatLng();
        markerLatLng && map.panTo(markerLatLng, { animate: true });
      }
    }, 0);

    const lat = link.getAttribute('data-lat'), lng = link.getAttribute('data-lng');
    let foundGallery = false;
    document.querySelectorAll('.location-photo-list').forEach(list => {
      if (list.getAttribute('data-lat') === lat && list.getAttribute('data-lng') === lng) {
        list.classList.add('active'); foundGallery = true;
        setTimeout(() => {
          if (list.swiper) {
            list.swiper.update();
            list.swiper.slideTo(0, 0, false);
          }
        }, 0);
        if (list.swiper?.destroy) { list.swiper.destroy(true, true); list.swiper = null; }
        if (!list.querySelector('.swiper-wrapper')) {
          const slides = Array.from(list.children);
          const wrapper = document.createElement('div');
          wrapper.className = 'swiper-wrapper';
          slides.forEach(slide => { slide.classList.add('swiper-slide'); wrapper.appendChild(slide); });
          list.innerHTML = ''; list.appendChild(wrapper);
        }
        if (!list.querySelector('.swiper-button-prev')) {
          const prev = document.createElement('div');
          prev.className = 'p-btn btn-nav prev swiper-button-prev';
          prev.innerHTML = '<span class="ico ico-arrow-sm-left-filled"></span>';
          const next = document.createElement('div');
          next.className = 'p-btn btn-nav next swiper-button-next';
          next.innerHTML = '<span class="ico ico-arrow-sm-right-filled"></span>';
          list.append(prev, next);
        }
        list.swiper = new Swiper(list, {
          slidesPerView: 1,
          spaceBetween: 10,
          loop: list.querySelectorAll('.swiper-slide').length > 1,
          navigation: {
            nextEl: list.querySelector('.swiper-button-next'),
            prevEl: list.querySelector('.swiper-button-prev'),
          },

          // breakpoints: {
          //   991: { slidesPerView: 1 }, // від 991px і більше — 1 слайд
          //   769: { slidesPerView: 2 }, // 769px - 990px — 2 слайди
          //   577: { slidesPerView: 2 }, // 577px - 768px — 2 слайди
          //   0: { slidesPerView: 1 }  // 576px і менше — 1 слайд
          // }
        });
      } else {
        list.classList.remove('active');
        if (list.swiper?.destroy) { list.swiper.destroy(true, true); list.swiper = null; }
      }
    });
    const photoBlock = link.closest('.side-block')?.querySelector('.location-photo-block');
    if (photoBlock) {
      const title = photoBlock.querySelector('.sm-block-title');
      if (title) title.classList.toggle('hidden', !foundGallery);
    }
  }

  locations.forEach((loc, index) => {
    const icon = L.divIcon({
      className: '', iconSize: [22, 22], iconAnchor: [11, 11],
      html: '<div class="marker-inner"><span class="marker-point"></span></div>'
    });
    const marker = L.marker([loc[0], loc[1]], { icon })
      .addTo(map)
      .bindPopup(loc[2], { className: 'custom-popup' });

    marker.on('click', () => {
      markers.forEach(m => m.getElement()?.classList.remove('active'));
      locationLinks.forEach(el => el.classList.remove('active'));
      marker.getElement()?.classList.add('active');
      locationLinks[index]?.classList.add('active');
      setActiveLocationLink(locationLinks[index]);
      map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
      marker.openPopup();
    });
    marker.on('mouseover', () => marker.openPopup());
    marker.on('mouseout', () => {
      const markerEl = marker.getElement();
      if (!markerEl?.classList.contains('active')) marker.closePopup();
    });
    markers.push(marker);
  });

  locationLinks.forEach((el, i) => {
    el.addEventListener('click', e => {
      e.preventDefault();
      if (el.classList.contains('active')) return;
      locationLinks.forEach(link => link.classList.remove('active'));
      markers.forEach(m => m.getElement()?.classList.remove('active'));
      el.classList.add('active');
      setActiveLocationLink(el);
      const lat = parseFloat(el.getAttribute('data-lat')), lng = parseFloat(el.getAttribute('data-lng'));
      const marker = markers[i], latlng = marker?.getLatLng();
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], map.getZoom(), { animate: true });
        map.once('moveend', () => {
          marker.openPopup();
          marker.getElement()?.classList.add('active');
        });
      } else if (latlng) {
        map.setView(latlng, map.getZoom(), { animate: true });
        map.once('moveend', () => {
          marker.openPopup();
          marker.getElement()?.classList.add('active');
        });
      }
    });
  });

  function activateLocationByCountry(userCountry) {
    let idx = -1;
    if (userCountry) idx = locations.findIndex(loc => loc[2].toLowerCase().includes(userCountry.toLowerCase()));
    if (idx === -1 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        let minDist = Infinity, minIdx = 0;
        locations.forEach((loc, i) => {
          const d = Math.hypot(loc[0] - pos.coords.latitude, loc[1] - pos.coords.longitude);
          if (d < minDist) { minDist = d; minIdx = i; }
        });
        activateByIndex(minIdx);
      }, () => activateByIndex(0));
    } else if (idx !== -1) {
      activateByIndex(idx);
    } else {
      activateByIndex(0);
    }
  }
  function activateByIndex(i) {
    locationLinks.forEach(link => link.classList.remove('active'));
    markers.forEach(m => m.getElement()?.classList.remove('active'));
    locationLinks[i].classList.add('active');
    setActiveLocationLink(locationLinks[i]);
    const marker = markers[i];
    marker.getElement()?.classList.add('active');
    map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
    marker.openPopup();
  }

  fetch('https://ip-api.io/json')
    .then(r => r.json())
    .then(data => activateLocationByCountry(data.country || ''))
    .catch(() => activateLocationByCountry(''));

  const navPrev = document.querySelector('#locationNav .prev');
  const navNext = document.querySelector('#locationNav .next');

  function getMarkersOrderByMap() {
    return markers
      .map((marker, i) => {
        const point = map.project(marker.getLatLng(), map.getZoom());
        return { i, x: point.x, y: point.y };
      })
      .sort((a, b) => a.x - b.x || a.y - b.y)
      .map(obj => obj.i);
  }
  function getActiveIndexByMapOrder(orderArr) {
    const activeIdx = Array.from(locationLinks).findIndex(link => link.classList.contains('active'));
    return orderArr.findIndex(i => i === activeIdx);
  }
  function activateLocationByIndexMapOrder(idx) {
    const orderArr = getMarkersOrderByMap();
    if (!orderArr.length) return;
    if (idx < 0) idx = orderArr.length - 1;
    if (idx >= orderArr.length) idx = 0;
    const realIdx = orderArr[idx];
    locationLinks.forEach(link => link.classList.remove('active'));
    markers.forEach(m => m.getElement()?.classList.remove('active'));
    setActiveLocationLink(locationLinks[realIdx]);
    locationLinks[realIdx].classList.add('active');
    const marker = markers[realIdx];
    marker.getElement()?.classList.add('active');
    map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
    marker.openPopup();
  }
  navPrev && navPrev.addEventListener('click', e => {
    e.preventDefault();
    const orderArr = getMarkersOrderByMap();
    let idx = getActiveIndexByMapOrder(orderArr);
    if (idx === -1) idx = 0;
    activateLocationByIndexMapOrder(idx - 1);
  });
  navNext && navNext.addEventListener('click', e => {
    e.preventDefault();
    const orderArr = getMarkersOrderByMap();
    let idx = getActiveIndexByMapOrder(orderArr);
    if (idx === -1) idx = 0;
    activateLocationByIndexMapOrder(idx + 1);
  });
  // --- Map code кінець ---

  // --- Swiper slider-list ---
  $('.slider-list').each(function () {
    const $slider = $(this);
    if ($slider.find('.swiper-wrapper').length === 0) {
      const slides = $slider.children().detach();
      const $wrapper = $('<div class="swiper-wrapper"></div>');
      slides.each(function () {
        let $slide = $(this);
        if (!$slide.hasClass('swiper-slide')) $slide.addClass('swiper-slide');
        $wrapper.append($slide);
      });
      $slider.empty().append($wrapper).addClass('swiper');
    }
    if ($slider.find('.swiper-button-prev').length === 0) {
      $slider.append(`
        <div class="cs-swiper-nav">
          <div class="p-btn btn-nav prev swiper-button-prev"><span class="ico ico-arrow-sm-left-filled"></span></div>
          <div class="p-btn btn-nav next swiper-button-next"><span class="ico ico-arrow-sm-right-filled"></span></div>
        </div>
      `);
    }
    const initSwiper = () => {
      const swiperOptions = {
        slidesPerView: 1,
        spaceBetween: 10,
        loop: $slider.find('.swiper-slide').length > 1,
        autoplay: {
          delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false
        },
        navigation: {
          nextEl: $slider.find('.swiper-button-next')[0],
          prevEl: $slider.find('.swiper-button-prev')[0],
        },
        on: {
          init() {
            if (this.autoplay?.start && !this.autoplay.running) this.autoplay.start();
          }
        }
      };


      const swiper = new Swiper($slider[0], swiperOptions);

      if ($slider.find('.swiper-slide').length === 1) {
        if (!swiper._fakeAutoplayInterval) {
          swiper._fakeAutoplayInterval = setInterval(() => swiper.slideTo(0, 500, true), 5000);
        }
        $slider.on('mouseenter', () => swiper._fakeAutoplayInterval && clearInterval(swiper._fakeAutoplayInterval));
        $slider.on('mouseleave', () => {
          if (!swiper._fakeAutoplayInterval) {
            swiper._fakeAutoplayInterval = setInterval(() => swiper.slideTo(0, 500, true), 5000);
          }
        });
      } else {
        swiper.autoplay?.start && swiper.autoplay.start();
        $slider.on('mouseenter', () => swiper.autoplay?.stop && swiper.autoplay.stop());
        $slider.on('mouseleave', () => swiper.autoplay?.start && swiper.autoplay.start());
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { initSwiper(); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe($slider[0]);
  });

  // === Галерея Swiper з fullscreen переглядом ===
  if (!document.getElementById('gallery-fullscreen')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="gallery-fullscreen">
        <div class="gallery-fullscreen-inner">
          <div class="gallery-thumbs"></div>
          <div class="gallery-main">
            <div class="swiper gallery-swiper">
              <div class="swiper-wrapper"></div>
              <div class="cs-swiper-nav">
                <div class="p-btn btn-nav prev swiper-button-prev"><span class="ico ico-alt-arrow-left"></span></div>
                <div class="p-btn btn-nav next swiper-button-next"><span class="ico ico-alt-arrow-right"></span></div>
              </div>
            </div>
          </div>
          <button class="close-btn close-gallery"><span class="ico ico-close"></span></button>
        </div>
      </div>
    `);


    // === Додаємо автоконтраст для іконок закриття та кнопок навігації ===
    function updateCloseBtnIconColor() {
      const galleryFs = document.getElementById('gallery-fullscreen');
      if (!galleryFs) return;
      const closeBtn = galleryFs.querySelector('.close-btn');
      const closeIco = closeBtn?.querySelector('.ico');
      const navBtns = galleryFs.querySelectorAll('.btn-nav');
      if (!closeBtn || !closeIco || navBtns.length === 0) return;
      const img = galleryFs.querySelector('.swiper-slide-active img');
      if (!img) {
        closeIco.style.color = '#1A3D2F';
        navBtns.forEach(btn => {
          const ico = btn.querySelector('.ico');
          if (ico) ico.style.color = '#1A3D2F';
        });
        return;
      }
      if (!img.complete || img.naturalWidth === 0) {
        img.onload = updateCloseBtnIconColor;
        closeIco.style.color = '#1A3D2F';
        navBtns.forEach(btn => {
          const ico = btn.querySelector('.ico');
          if (ico) ico.style.color = '#1A3D2F';
        });
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const imgRect = img.getBoundingClientRect();
      function getBrightnessAtButton(btn) {
        const rect = btn.getBoundingClientRect();
        const x = ((rect.left + rect.width / 2) - imgRect.left) * (img.naturalWidth / imgRect.width);
        const y = ((rect.top + rect.height / 2) - imgRect.top) * (img.naturalHeight / imgRect.height);

        if (x < 0 || y < 0 || x > img.naturalWidth || y > img.naturalHeight) {
          return 255; // Ставимо максимально яскраво, щоб не тригерило білий
        }
        ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
        const pixel = ctx.getImageData(0, 0, 1, 1).data;
        const brightness = (pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114) / 1000;
        return brightness;
      }
      // Рахуємо для кнопки закриття
      const brightnessClose = getBrightnessAtButton(closeBtn);
      closeIco.style.color = (brightnessClose < 128) ? '#fff' : '#1A3D2F';
      // Рахуємо для всіх навігаційних кнопок
      let anyShouldBeWhite = false;
      navBtns.forEach(btn => {
        const brightness = getBrightnessAtButton(btn);
        if (brightness < 128) {
          anyShouldBeWhite = true;
        }
      });
      // Встановлюємо однаковий колір для всіх .btn-nav
      navBtns.forEach(btn => {
        const ico = btn.querySelector('.ico');
        if (ico) ico.style.color = anyShouldBeWhite ? '#fff' : '#1A3D2F';
      });
    }
    // Оновлювати при відкритті галереї, зміні слайду та ресайзі
    const galleryFs = document.getElementById('gallery-fullscreen');
    galleryFs.addEventListener('transitionend', updateCloseBtnIconColor);
    window.addEventListener('resize', updateCloseBtnIconColor);
  }


  document.body.addEventListener('click', function (e) {
    const item = e.target.closest('.gallery-list .gallery-item');
    if (!item) return;
    e.preventDefault();
    const galleryList = item.closest('.gallery-list');
    const items = Array.from(galleryList.querySelectorAll('.gallery-item'));
    const clickedImg = item.querySelector('img');
    const clickedSrc = clickedImg?.dataset.originalSrc || clickedImg?.getAttribute('src') || item.getAttribute('data-href');

    const swiperWrapper = document.querySelector('#gallery-fullscreen .swiper-wrapper');
    swiperWrapper.innerHTML = '';
    const thumbs = document.querySelector('#gallery-fullscreen .gallery-thumbs');
    thumbs.innerHTML = '';

    const uniqueSrcSet = new Set();
    const uniqueItems = [];

    items.forEach(it => {
      const imgEl = it.querySelector('img');
      const imgSrc = imgEl?.dataset.originalSrc || imgEl?.getAttribute('src') || it.getAttribute('data-href');
      if (!uniqueSrcSet.has(imgSrc)) {
        swiperWrapper.innerHTML += `<div class="swiper-slide gallery-slide"><img src="${imgSrc}"/></div>`;
        uniqueSrcSet.add(imgSrc);
        uniqueItems.push({ el: it, src: imgSrc });
      }
    });

    const startIdx = uniqueItems.findIndex(obj => obj.src === clickedSrc);

    const uniqueThumbs = new Set();
    uniqueItems.forEach((obj, idx) => {
      const imgSrc = obj.src;
      const thumb = document.createElement('div');
      thumb.className = 'gallery-thumb' + (idx === startIdx ? ' active' : '');
      thumb.innerHTML = `<div style="width:60px;height:60px;background:#eee;"></div>`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgSrc;
      img.onload = function () {
        const size = 60, canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let ratio = Math.min(size / img.width, size / img.height);
        let drawWidth = img.width * ratio, drawHeight = img.height * ratio;
        let offsetX = (size - drawWidth) / 2, offsetY = (size - drawHeight) / 2;
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        thumb.innerHTML = `<img src="${canvas.toDataURL('image/jpeg', 0.7)}" width="60" height="60" style="object-fit:contain;"/>`;
      };
      img.onerror = function () {
        thumb.innerHTML = `<img src="${imgSrc}" width="60" height="60" style="object-fit:contain;"/>`;
      };
      thumb.addEventListener('click', () => window.gallerySwiper?.slideToLoop(idx, 300));
      thumbs.appendChild(thumb);
    });


    const galleryFs = document.getElementById('gallery-fullscreen');
    galleryFs.style.display = 'block';

    function getScrollbarWidth() {
      return window.innerWidth - document.documentElement.clientWidth;
    }
    if (!/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)) {
      const scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    document.body.classList.add('static');
    setTimeout(() => { galleryFs.style.opacity = '1'; }, 10);

    function arrowHandler(ev) {
      if (!window.gallerySwiper) return;
      if (ev.key === 'ArrowRight') window.gallerySwiper.slideNext();
      if (ev.key === 'ArrowLeft') window.gallerySwiper.slidePrev();
    }
    function escCloseHandler(ev) {
      if (ev.key === 'Escape') {
        galleryFs.style.opacity = '0';
        setTimeout(() => {
          galleryFs.style.display = 'none';
          document.body.classList.remove('static');
          document.body.style.paddingRight = '';
          window.gallerySwiper?.destroy(true, true);
          window.gallerySwiper = null;
        }, 300);
        document.removeEventListener('keydown', escCloseHandler);
        document.removeEventListener('keydown', arrowHandler);
      }
    }
    document.addEventListener('keydown', escCloseHandler);
    document.addEventListener('keydown', arrowHandler);

    window.gallerySwiper?.destroy(true, true);
    window.gallerySwiper = null;
    let gallerySwiper = new Swiper('#gallery-fullscreen .gallery-swiper', {
      slidesPerView: 1, spaceBetween: 10, loop: items.length > 1,
      navigation: {
        nextEl: '#gallery-fullscreen .swiper-button-next',
        prevEl: '#gallery-fullscreen .swiper-button-prev',
      },
      touchReleaseOnEdges: true, 
      on: {
        init() { this.slideToLoop(startIdx, 0, false); },
        slideChange() {
          const realIdx = this.realIndex || 0;
          thumbs.querySelectorAll('.gallery-thumb').forEach((el, i) => el.classList.toggle('active', i === realIdx));
          const activeThumb = thumbs.querySelectorAll('.gallery-thumb')[realIdx];
          activeThumb && activeThumb.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        }
      }
    });
    gallerySwiper.init();
    window.gallerySwiper = gallerySwiper;

    setTimeout(() => {
      const realIdx = gallerySwiper.realIndex || 0;
      const activeThumb = thumbs.querySelectorAll('.gallery-thumb')[realIdx];
      activeThumb && activeThumb.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
    }, 100);
  });


  document.querySelector('#gallery-fullscreen .close-gallery').addEventListener('click', function () {
    const galleryFs = document.getElementById('gallery-fullscreen');
    galleryFs.style.opacity = '0';
    setTimeout(() => {
      galleryFs.style.display = 'none';
      document.body.classList.remove('static');
      document.body.style.paddingRight = '';
      window.gallerySwiper?.destroy(true, true);
      window.gallerySwiper = null;
    }, 300);
    document.onkeydown = null;
  });

  document.getElementById('gallery-fullscreen').addEventListener('mousedown', function (e) {
    if (e.target === this) {
      this.style.opacity = '0';
      setTimeout(() => {
        this.style.display = 'none';
        window.gallerySwiper?.destroy(true, true);
        window.gallerySwiper = null;
      }, 300);
      document.onkeydown = null;
    }
  });






  const galleryCont = document.querySelector('.gallery-cont');
  const allContainer = document.getElementById('gallery-all');
  const allImages = Array.from(allContainer.querySelectorAll('.gallery-item'));
  const half = Math.ceil(allImages.length / 2);

  // --- Створюємо перший контейнер ---
  const container1 = document.createElement('div');
  container1.className = 'gallery-container';
  container1.id = 'flow-left';
  const wrapper1 = document.createElement('div');
  wrapper1.className = 'scroll-wrapper';
  const row1 = document.createElement('div');
  row1.className = 'scroll-row';
  allImages.slice(0, half).forEach(img => {
    const clone = img.cloneNode(true);
    const original = img.querySelector('img');
    const cloneImg = clone.querySelector('img');
    if (original && cloneImg && original.dataset.originalSrc) {
      cloneImg.dataset.originalSrc = original.dataset.originalSrc;
    }
    row1.appendChild(clone);
  });
  wrapper1.appendChild(row1);
  container1.appendChild(wrapper1);

  // --- Створюємо другий контейнер (reverse) ---
  const container2 = document.createElement('div');
  container2.className = 'gallery-container reverse';
  container2.id = 'flow-right';
  const wrapper2 = document.createElement('div');
  wrapper2.className = 'scroll-wrapper';
  const row2 = document.createElement('div');
  row2.className = 'scroll-row';
  allImages.slice(half).forEach(img => {
    const clone = img.cloneNode(true);
    const original = img.querySelector('img');
    const cloneImg = clone.querySelector('img');
    if (original && cloneImg && original.dataset.originalSrc) {
      cloneImg.dataset.originalSrc = original.dataset.originalSrc;
    }
    row2.appendChild(clone);
  });
  wrapper2.appendChild(row2);
  container2.appendChild(wrapper2);

  // --- Очищаємо старий контейнер і додаємо нові ---
  galleryCont.innerHTML = '';
  galleryCont.appendChild(container1);
  galleryCont.appendChild(container2);

  // ⏳ Чекаємо, щоб зображення встигли з'явитись
  setTimeout(() => {
    resizeGalleryImages(row1);
    resizeGalleryImages(row2);
  }, 50);

  // --- Безкінечний скрол ---
  const running = [true, true];
  function setupInfiniteScroll(gallerySelector, direction = 1, speed = 1, idx = 0) {
    const gallery = document.querySelector(gallerySelector);
    const wrapper = gallery.querySelector('.scroll-wrapper');
    const row = wrapper.querySelector('.scroll-row');
    const clone = row.cloneNode(true);
    wrapper.appendChild(clone);

    requestAnimationFrame(() => {
      let rowWidth = row.offsetWidth;
      let scroll = 0;

      function animate() {
        if (running[idx]) {
          scroll += direction * speed;
          if (scroll >= rowWidth) scroll -= rowWidth;
          if (scroll < 0) scroll += rowWidth;
          wrapper.style.transform = `translateX(${-scroll}px)`;
        }
        requestAnimationFrame(animate);
      }

      animate();

      const resizeObserver = new ResizeObserver(() => {
        rowWidth = row.offsetWidth;
      });
      resizeObserver.observe(row);

      window.addEventListener('resize', () => {
        rowWidth = row.offsetWidth;
      });
    });
  }

  function setupLogoScroll(selector, speed = 1) {
  const container = document.querySelector(selector);
  if (!container) return;

  const wrapper = container.querySelector('.scroll-wrapper');
  const row = wrapper.querySelector('.scroll-row');

  // Додаємо ще 2 дублікати (всього буде 3)
  for (let i = 0; i < 3; i++) {
    const clone = row.cloneNode(true);
    wrapper.appendChild(clone);
  }

  let rowWidth = row.offsetWidth;
  let scroll = 0;

  function animate() {
    scroll += speed;
    if (scroll >= rowWidth) scroll -= rowWidth;
    wrapper.style.transform = `translateX(-${scroll}px)`;
    requestAnimationFrame(animate);
  }

  animate();

  const resizeObserver = new ResizeObserver(() => {
    rowWidth = row.offsetWidth;
  });
  resizeObserver.observe(row);
}




  setupInfiniteScroll('#flow-left', 1, 1, 0);
  setupInfiniteScroll('#flow-right', -1, 1, 1);

  // ➕ Додаємо скрол для логотипів
  setupLogoScroll('.logo-list', 1);

  // --- Наведення миші ставить на паузу ---
  document.querySelectorAll('.gallery-container').forEach(container => {
    container.addEventListener('mouseenter', () => {
      running[0] = false;
      running[1] = false;
    });
    container.addEventListener('mouseleave', () => {
      running[0] = true;
      running[1] = true;
    });
  });



});







document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#subscription");
  if (!form) return;

  const input = form.querySelector("input[type='email']");
  const button = form.querySelector("button");

  function adjustPadding() {
    const buttonWidth = button.offsetWidth;
    input.style.paddingRight = (buttonWidth + 15) + "px";
  }

  // Виклик одразу
  adjustPadding();

  // Виклик при ресайзі для адаптивності
  window.addEventListener("resize", adjustPadding);
});









// Скрипт для адаптивного меню з More (додає клас drop-link при перенесенні без зміни логіки)
window.addEventListener('DOMContentLoaded', function () {
  const menu = document.querySelector('#menu');
  const menuToggle = document.querySelector('#menuToggle');
  const body = document.body;

  if (!menu || !menuToggle) return;

  let moreMenu = null;
  let closeButton = null;

  // Створюємо overlay один раз
  const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
menu.insertAdjacentElement('afterend', overlay);

  function toggleMenu() {
    const isOpened = menu.classList.toggle('opened');
    body.classList.toggle('static', isOpened);
    overlay.classList.toggle('opened', isOpened);
  }

  function closeMenu() {
    menu.classList.remove('opened');
    body.classList.remove('static');
    overlay.classList.remove('opened');
  }

  menuToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  function createMoreMenu() {
    moreMenu = document.createElement('div');
    moreMenu.id = 'moreMenu';
    moreMenu.className = 'cs-dropdown';
    moreMenu.innerHTML = `
      <button id="more-button" class="cs-drop-toggle p-btn btn-link btn-dark-green btn-sm">
        <span class="btn-inner">More<span class="ico ico-arrow-sm-down-filled"></span></span>
      </button>
      <div class="cs-dropdown-list">
        <div class="drop-list-wrapper"></div>
      </div>
    `;
    menu.appendChild(moreMenu);
  }

  function addCloseButton() {
    if (closeButton || window.innerWidth > 768) return;

    closeButton = document.createElement('button');
    closeButton.id = 'closeMenu';
    closeButton.className = 'p-btn btn-link close-btn';
    closeButton.type = 'button';
    closeButton.innerHTML = `<span class="ico ico-close"></span>`;

    closeButton.addEventListener('click', closeMenu); // використовуємо одну функцію

    menu.prepend(closeButton);
  }

  function removeCloseButton() {
    if (closeButton) {
      closeButton.remove();
      closeButton = null;
    }
  }

  function updateMenu() {
    if (window.innerWidth <= 768) {
      menu.classList.add('mobile-menu');
      if (moreMenu) moreMenu.style.display = 'none';
      menu.querySelectorAll('.h-link').forEach(link => {
        link.classList.remove('drop-link');
        link.style.display = '';
      });
      addCloseButton();
      return;
    }

    menu.classList.remove('mobile-menu');
    removeCloseButton();

    if (!moreMenu) createMoreMenu();
    const wrapper = moreMenu.querySelector('.drop-list-wrapper');
    wrapper.innerHTML = '';

    const links = Array.from(menu.querySelectorAll('.h-link'));
    moreMenu.style.display = 'none';

    links.forEach(link => link.style.display = '');

    let lastVisibleIndex = links.length - 1;

    while (menu.scrollWidth > menu.clientWidth && lastVisibleIndex >= 0) {
      const linkToMove = links[lastVisibleIndex];
      const newLink = linkToMove.cloneNode(true);
      newLink.classList.add('drop-link');
      wrapper.prepend(newLink);
      linkToMove.classList.add('drop-link');
      linkToMove.style.display = 'none';
      moreMenu.style.display = '';
      lastVisibleIndex--;
    }
  }

  window.addEventListener('resize', updateMenu);
  updateMenu();
});





