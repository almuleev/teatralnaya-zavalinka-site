const carouselAnimations = new WeakMap();

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initDocumentSearch();
  initCopyButtons();
  initVideoPlayers();

  const desktopCarouselMode = supportsDesktopCarouselMode();

  bindCarouselButtons(desktopCarouselMode);
  initCarousels(desktopCarouselMode);
});

function initVideoPlayers() {
  const shells = Array.from(document.querySelectorAll("[data-video-shell]"));

  if (!shells.length) {
    return;
  }

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

  shells.forEach((shell) => {
    const video = shell.querySelector("[data-video-player]");
    const playButton = shell.querySelector("[data-video-play]");
    const toggleLayer = shell.querySelector("[data-video-toggle]");

    if (
      !(video instanceof HTMLVideoElement) ||
      !(playButton instanceof HTMLButtonElement) ||
      !(toggleLayer instanceof HTMLButtonElement)
    ) {
      return;
    }

    if (isTouchDevice) {
      shell.classList.add("is-touch-device");
    }

    const setPlayingState = () => {
      shell.classList.add("is-playing");
      playButton.hidden = true;
      video.controls = true;
    };

    const setPausedState = () => {
      shell.classList.remove("is-playing");
      playButton.hidden = false;
      video.controls = false;
    };

    const ensureVideoSource = () => {
      if (video.currentSrc || video.src) {
        return true;
      }

      const sourceUrl = video.dataset.videoSrc || "";
      if (!sourceUrl) {
        return false;
      }

      video.src = sourceUrl;
      video.load();
      return true;
    };

    let fullscreenPressState = null;
    let suppressToggleUntil = 0;
    let suppressPauseUiUntil = 0;
    let suppressPauseDuringSeekUntil = 0;
    let wasPlayingBeforeSeek = false;
    let lastToggleAt = 0;
    let pauseHideTimer = 0;
    const isControlsBarPoint = (clientX, clientY) => {
      if (!video.controls || !shell.classList.contains("is-playing")) {
        return false;
      }

      const rect = video.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;

      if (offsetX < 0 || offsetX > rect.width || offsetY < 0 || offsetY > rect.height) {
        return false;
      }

      const controlsBarHeight = Math.min(86, Math.max(42, Math.round(rect.height * 0.2)));
      return offsetY >= rect.height - controlsBarHeight;
    };
    const isVideoFullscreenMode = () => {
      const fullscreenElement =
        document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

      if (fullscreenElement instanceof Element) {
        return (
          fullscreenElement === video ||
          fullscreenElement === shell ||
          fullscreenElement.contains(video)
        );
      }

      return video.webkitDisplayingFullscreen === true;
    };
    const togglePlayback = () => {
      const now = Date.now();
      if (now - lastToggleAt < 120) {
        return;
      }

      lastToggleAt = now;
      suppressToggleUntil = now + 120;

      if (video.paused || video.ended) {
        startPlayback();
        return;
      }

      video.pause();
    };

    setPausedState();

    const startPlayback = async () => {
      if (!video.paused && !video.ended) {
        return;
      }

      ensureVideoSource();
      setPlayingState();

      try {
        await video.play();
      } catch (error) {
        setPausedState();
      }
    };

    playButton.addEventListener("click", () => {
      ensureVideoSource();
      startPlayback();
    });

    toggleLayer.addEventListener("click", (event) => {
      event.preventDefault();

      if (isTouchDevice && shell.classList.contains("is-playing")) {
        return;
      }

      if (Date.now() < suppressToggleUntil || video.seeking) {
        return;
      }

      ensureVideoSource();
      togglePlayback();
    });

    video.addEventListener(
      "pointerdown",
      (event) => {
        if (!isVideoFullscreenMode()) {
          return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        fullscreenPressState = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startedOnControls: isControlsBarPoint(event.clientX, event.clientY)
        };
      },
      true
    );

    video.addEventListener(
      "pointerup",
      (event) => {
        if (!isVideoFullscreenMode()) {
          return;
        }

        if (!fullscreenPressState || fullscreenPressState.pointerId !== event.pointerId) {
          return;
        }

        const moved =
          Math.abs(event.clientX - fullscreenPressState.startX) > 8 ||
          Math.abs(event.clientY - fullscreenPressState.startY) > 8;
        const startedOnControls = fullscreenPressState.startedOnControls;
        fullscreenPressState = null;

        if (moved || Date.now() < suppressToggleUntil || video.seeking) {
          return;
        }

        if (startedOnControls || isControlsBarPoint(event.clientX, event.clientY)) {
          return;
        }

        togglePlayback();
      },
      true
    );

    video.addEventListener(
      "pointercancel",
      () => {
        fullscreenPressState = null;
      },
      true
    );

    video.addEventListener("seeking", () => {
      clearTimeout(pauseHideTimer);
      wasPlayingBeforeSeek = !video.paused || shell.classList.contains("is-playing");
      const suppressMs = isTouchDevice ? 1600 : 450;
      const until = Date.now() + suppressMs;

      suppressToggleUntil = until;
      suppressPauseUiUntil = until;
      suppressPauseDuringSeekUntil = until;
    });

    video.addEventListener("seeked", () => {
      const suppressMs = isTouchDevice ? 1600 : 320;
      const until = Date.now() + suppressMs;

      suppressToggleUntil = until;
      suppressPauseUiUntil = until;
      suppressPauseDuringSeekUntil = until;
      const shouldResume = wasPlayingBeforeSeek && video.paused && !video.ended;
      wasPlayingBeforeSeek = false;

      if (!shouldResume) {
        return;
      }

      video.play().catch(() => {});
    });

    video.addEventListener("play", () => {
      setPlayingState();
    });

    video.addEventListener("pause", () => {
      if (video.ended) {
        clearTimeout(pauseHideTimer);
        setPausedState();
        return;
      }

      if (Date.now() < suppressPauseDuringSeekUntil) {
        return;
      }

      clearTimeout(pauseHideTimer);
      pauseHideTimer = setTimeout(() => {
        if (
          video.seeking ||
          Date.now() < suppressPauseUiUntil ||
          Date.now() < suppressPauseDuringSeekUntil ||
          !video.paused
        ) {
          return;
        }
        setPausedState();
      }, 150);
    });

    video.addEventListener("ended", () => {
      setPausedState();
    });
  });
}

function initCopyButtons() {
  const phoneButtons = Array.from(document.querySelectorAll("[data-copy-phone]")).map((button) => ({
    button,
    value: button.dataset.copyPhone || "",
    successMessage: (value) => `Номер скопирован: ${value}`
  }));
  const emailButtons = Array.from(document.querySelectorAll("[data-copy-email]")).map((button) => ({
    button,
    value: button.dataset.copyEmail || "",
    successMessage: (value) => `Email скопирован: ${value}`
  }));
  const buttons = [...phoneButtons, ...emailButtons];

  if (!buttons.length) {
    return;
  }

  const toast = ensureCopyToast();

  buttons.forEach(({ button, value, successMessage }) => {
    button.addEventListener("click", async () => {
      if (!value) {
        return;
      }

      const copied = await copyText(value);
      showCopyToast(
        toast,
        copied ? successMessage(value) : "Не удалось скопировать. Попробуйте еще раз.",
        !copied
      );
    });
  });
}

async function copyText(value) {
  if (!value) {
    return false;
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (error) {
      // Fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  textarea.remove();
  return copied;
}

function ensureCopyToast() {
  const existing = document.querySelector("[data-copy-toast]");

  if (existing) {
    return existing;
  }

  const toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.hidden = true;
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-atomic", "true");
  toast.dataset.copyToast = "true";
  document.body.appendChild(toast);
  return toast;
}

function showCopyToast(toast, message, isError = false) {
  if (!toast) {
    return;
  }

  window.clearTimeout(showCopyToast.timeoutId);
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.toggle("is-error", Boolean(isError));
  toast.classList.add("is-visible");

  showCopyToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 2200);
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const nextState = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", nextState);
    toggle.setAttribute("aria-expanded", String(nextState));
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initDocumentSearch() {
  const searchRoot = document.querySelector("[data-doc-search]");
  const input = document.querySelector("[data-doc-search-input]");
  const clearButton = document.querySelector("[data-doc-search-clear]");
  const status = document.querySelector("[data-doc-search-status]");
  const emptyState = document.querySelector("[data-doc-search-empty]");
  const cards = Array.from(document.querySelectorAll("[data-document-card]"));
  const groups = Array.from(document.querySelectorAll("[data-documents-group]"));
  const archiveSection = document.querySelector("[data-documents-archive]");

  if (!searchRoot || !input || !cards.length) {
    return;
  }

  const totalCount = cards.length;

  const applySearch = () => {
    const query = normalizeSearchValue(input.value);
    const tokens = query.split(" ").filter(Boolean);
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalizeSearchValue(card.dataset.documentSearch || "");
      const matches = !tokens.length || tokens.every((token) => haystack.includes(token));
      card.hidden = !matches;

      if (matches) {
        visibleCount += 1;
      }
    });

    groups.forEach((group) => {
      const visibleCards = Array.from(group.querySelectorAll("[data-document-card]")).some((card) => !card.hidden);
      group.hidden = !visibleCards;
    });

    if (archiveSection) {
      const visibleArchiveGroups = Array.from(archiveSection.querySelectorAll("[data-documents-group]")).some((group) => !group.hidden);
      archiveSection.hidden = !visibleArchiveGroups;
    }

    if (clearButton) {
      clearButton.hidden = !query;
    }

    if (emptyState) {
      emptyState.hidden = visibleCount > 0 || !query;
    }

    if (status) {
      if (!query) {
        status.textContent = `Всего документов: ${totalCount}`;
      } else if (visibleCount > 0) {
        status.textContent = `Найдено документов: ${visibleCount} из ${totalCount}`;
      } else {
        status.textContent = "По вашему запросу ничего не найдено.";
      }
    }
  };

  input.addEventListener("input", applySearch);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      input.value = "";
      applySearch();
      input.focus();
    });
  }

  applySearch();
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function supportsDesktopCarouselMode() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function bindCarouselButtons(desktopCarouselMode) {
  document.querySelectorAll("[data-carousel-prev], [data-carousel-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-carousel-prev") || button.getAttribute("data-carousel-next");
      const track = document.getElementById(targetId);

      if (!track) {
        return;
      }

      const direction = button.hasAttribute("data-carousel-next") ? 1 : -1;
      const targetLeft = getDirectionalCardLeft(track, direction);

      if (desktopCarouselMode) {
        animateTrackScroll(track, targetLeft, 240);
        return;
      }

      track.scrollTo({
        left: targetLeft,
        behavior: "smooth"
      });
    });
  });
}

function initCarousels(desktopCarouselMode) {
  const tracks = Array.from(document.querySelectorAll("[data-carousel-track]"));

  if (!tracks.length) {
    return;
  }

  const updateAll = () => {
    tracks.forEach((track) => {
      cancelTrackAnimation(track);
      updateCarouselState(track);
    });
  };

  tracks.forEach((track) => {
    updateCarouselState(track);
    track.addEventListener("scroll", () => updateCarouselState(track), { passive: true });

    if (desktopCarouselMode) {
      bindPointerDrag(track);
      bindDesktopScrollSnap(track);
    }

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => updateCarouselState(track));
      observer.observe(track);

      const shell = track.closest("[data-carousel-shell]");
      if (shell) {
        observer.observe(shell);
      }
    }
  });

  window.requestAnimationFrame(() => window.requestAnimationFrame(updateAll));
  window.addEventListener("load", updateAll);
  window.addEventListener("resize", updateAll);
}

function updateCarouselState(track) {
  const shell = track.closest("[data-carousel-shell]");
  const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
  const offsets = getCardOffsets(track);
  const firstCard = track.firstElementChild;
  const meaningfulOverflowThreshold = firstCard
    ? Math.max(48, firstCard.getBoundingClientRect().width * 0.35)
    : 48;
  const hasOverflow = maxScrollLeft > meaningfulOverflowThreshold && offsets.length > 1;
  const isAtStart = track.scrollLeft <= 8;
  const isAtEnd = track.scrollLeft >= maxScrollLeft - 8;
  const prevButtons = document.querySelectorAll(`[data-carousel-prev="${track.id}"]`);
  const nextButtons = document.querySelectorAll(`[data-carousel-next="${track.id}"]`);

  if (shell) {
    shell.classList.toggle("is-at-start", isAtStart);
    shell.classList.toggle("is-at-end", isAtEnd);
    shell.classList.toggle("has-overflow", hasOverflow);
  }

  prevButtons.forEach((button) => {
    button.disabled = !hasOverflow || isAtStart;
    button.setAttribute("aria-disabled", String(button.disabled));
  });

  nextButtons.forEach((button) => {
    button.disabled = !hasOverflow || isAtEnd;
    button.setAttribute("aria-disabled", String(button.disabled));
  });
}

function bindPointerDrag(track) {
  const interactiveSelector = "a, button, input, textarea, select, label, iframe";
  let dragState = null;
  let suppressClick = false;

  const finishDrag = () => {
    if (!dragState) {
      return;
    }

    const didMove = dragState.moved;
    dragState = null;
    track.classList.remove("is-dragging");

    if (didMove) {
      snapToNearestCard(track, 220);

      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  };

  track.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const eventTarget = event.target instanceof Element ? event.target : null;
    if (eventTarget && eventTarget.closest(interactiveSelector)) {
      return;
    }

    if (track.scrollWidth <= track.clientWidth + 8) {
      return;
    }

    cancelTrackAnimation(track);

    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false
    };

    track.classList.add("is-dragging");

    if (track.setPointerCapture) {
      track.setPointerCapture(event.pointerId);
    }
  });

  track.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;

    if (Math.abs(deltaX) > 6) {
      dragState.moved = true;
      suppressClick = true;
    }

    track.scrollLeft = dragState.startScrollLeft - deltaX;
    updateCarouselState(track);
  });

  track.addEventListener("pointerup", finishDrag);
  track.addEventListener("pointercancel", finishDrag);
  track.addEventListener("lostpointercapture", finishDrag);

  track.addEventListener(
    "click",
    (event) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (eventTarget && eventTarget.closest(interactiveSelector)) {
        suppressClick = false;
        return;
      }

      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    },
    true
  );
}

function bindDesktopScrollSnap(track) {
  let timeoutId = 0;

  track.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        if (track.classList.contains("is-dragging") || track.classList.contains("is-snapping")) {
          return;
        }

        snapToNearestCard(track, 200);
      }, 130);
    },
    { passive: true }
  );
}

function snapToNearestCard(track, duration = 220) {
  const targetLeft = getDirectionalCardLeft(track, 0);

  if (Math.abs(targetLeft - track.scrollLeft) <= 6) {
    track.classList.remove("is-snapping");
    updateCarouselState(track);
    return;
  }

  animateTrackScroll(track, targetLeft, duration);
}

function getDirectionalCardLeft(track, direction) {
  const offsets = getCardOffsets(track);

  if (!offsets.length) {
    return track.scrollLeft;
  }

  const currentIndex = getNearestOffsetIndex(offsets, track.scrollLeft);
  const targetIndex = clamp(currentIndex + direction, 0, offsets.length - 1);

  return offsets[targetIndex];
}

function getCardOffsets(track) {
  const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
  const leadingInset = getTrackLeadingInset(track);

  return Array.from(track.children)
    .map((card) => clamp(card.offsetLeft - leadingInset, 0, maxScrollLeft))
    .filter((offset, index, offsets) => index === 0 || Math.abs(offset - offsets[index - 1]) > 1);
}

function getTrackLeadingInset(track) {
  const styles = window.getComputedStyle(track);
  return Number.parseFloat(styles.paddingLeft) || 0;
}

function getNearestOffsetIndex(offsets, currentScrollLeft) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  offsets.forEach((offset, index) => {
    const distance = Math.abs(offset - currentScrollLeft);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function animateTrackScroll(track, targetLeft, duration = 220) {
  cancelTrackAnimation(track);

  const startLeft = track.scrollLeft;
  const delta = targetLeft - startLeft;

  if (Math.abs(delta) <= 1) {
    track.scrollLeft = targetLeft;
    updateCarouselState(track);
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    track.scrollLeft = targetLeft;
    updateCarouselState(track);
    return;
  }

  track.classList.add("is-snapping");

  const startTime = performance.now();

  const step = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    track.scrollLeft = startLeft + delta * eased;
    updateCarouselState(track);

    if (progress < 1) {
      carouselAnimations.set(track, window.requestAnimationFrame(step));
      return;
    }

    track.scrollLeft = targetLeft;
    track.classList.remove("is-snapping");
    carouselAnimations.delete(track);
    updateCarouselState(track);
  };

  carouselAnimations.set(track, window.requestAnimationFrame(step));
}

function cancelTrackAnimation(track) {
  const animationFrameId = carouselAnimations.get(track);

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
    carouselAnimations.delete(track);
  }

  track.classList.remove("is-snapping");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
