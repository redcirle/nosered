const tagline = document.getElementById("tagline");

/**
 * ✅ 标语打字机（顿挫节奏版）
 * 目标节奏：
 *   请保持 / 心脏跳动，小丑猫 / 等着 / 与你共鸣。
 *
 * 说明：
 * - typingSpeed：单字速度
 * - microPause：每段打完后的小顿挫
 * - phrasePause：段与段之间的停顿（对应每个“/”）
 * - loopPause：整轮播放结束后，停顿再清空并重播
 */
const phraseArray = [
  "请保持",
  "心脏跳动，",
  "小丑猫",
  "等着",
  "与你共鸣。"
];

// 3 个“/”处停顿（ms）：请保持/心脏跳动，小丑猫/等着/与你共鸣。
const phrasePause = [200, 260, 260];

const typingSpeed = 240;
const microPause = 110;
const loopPause  = 1600;

let phraseIndex = 0;
let charIndex = 0;
let isTyping = true;

function typeWriter() {
  if (!tagline) return;

  const currentPhrase = phraseArray[phraseIndex];

  if (isTyping) {
    if (charIndex < currentPhrase.length) {
      tagline.innerHTML += currentPhrase[charIndex];
      charIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else {
      // ✅ 段末微停一下（顿挫）
      isTyping = false;
      setTimeout(typeWriter, microPause);
    }
  } else {
    phraseIndex++;

    if (phraseIndex >= phraseArray.length) {
      // ✅ 一轮结束：停顿 -> 清空 -> 重播
      setTimeout(() => {
        tagline.innerHTML = "";
        phraseIndex = 0;
        charIndex = 0;
        isTyping = true;
        typeWriter(); // 关键：重新启动下一轮
      }, loopPause);
    } else {
      const pause = phrasePause[phraseIndex - 1] ?? 300;
      charIndex = 0;
      isTyping = true;
      setTimeout(typeWriter, pause);
    }
  }
}

function initSwiper() {
  window.swiper = new Swiper(".swiper-container", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 30,
      stretch: 0,
      depth: 150,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    on: {
      slideChangeTransitionStart: function () {
        document.querySelectorAll('.card-button').forEach(btn => {
          btn.classList.remove('auto-hover');
        });

        setTimeout(() => {
          const activeSlide = document.querySelector('.swiper-slide-active');
          const activeBtn = activeSlide?.querySelector('.card-button');
          if (activeBtn) {
            activeBtn.classList.add('auto-hover');
            setTimeout(() => {
              activeBtn.classList.remove('auto-hover');
            }, 1500);
          }
        }, 600);
      }
    }
  });
}

// 其他按钮逻辑不变：
function confirmAndGoXHS() {
  const confirmed = confirm("是否前往[小丑猫]小红书主页？");
  if (confirmed) {
    window.open("https://xhslink.com/m/41ZuKjemtVh", "_blank");
  }
}
function toggleQR() {
  const popup = document.getElementById("qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function toggleWeChatPublicQR() {
  const popup = document.getElementById("wechat-public-qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}

// ===================== 卡片内二维码弹窗（openQR / closeQR） =====================
// ✅ 对应 HTML 里：onclick="openQR('qr-xxx')" / onclick="closeQR('qr-xxx')"
// 仅控制指定 id 的弹窗显示/隐藏；不改动你现有的 toggleQR / toggleWeChatPublicQR 等逻辑。
function openQR(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) {
    console.warn("openQR: element not found ->", popupId);
    return;
  }
  popup.style.display = "flex";

  // ✅ 打开弹窗时暂停卡片轮播
  if (window.swiper && window.swiper.autoplay) {
    window.swiper.autoplay.stop();
  }
}

function closeQR(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) {
    console.warn("closeQR: element not found ->", popupId);
    return;
  }
  popup.style.display = "none";

  // ✅ 关闭弹窗后：先“动一下”让你立刻感觉轮播恢复，再启动自动轮播计时
  if (window.swiper) {
    try {
      // 立刻推进一张（给用户即时反馈，避免看起来“卡住”）
      window.swiper.slideNext(450);
    } catch (e) {}
  }

  // ✅ 恢复自动轮播（注意：start() 会从一个完整 delay 开始计时）
  if (window.swiper && window.swiper.autoplay) {
    window.swiper.autoplay.start();
  }
}


// ===================== 卡片内按钮：点击播放语音（不改动原有功能/样式） =====================
// 用法：在 HTML 的卡片按钮上加 data-audio="audio/xxx.wav"
// 例如：<a class="card-button ..." data-audio="audio/card-click.wav" ...>...</a>
(function initCardButtonClickAudio() {
  const DEFAULT_SRC = "audio/card-click.wav";
  const audioCache = new Map();

  function getAudio(src) {
    if (!src) return null;
    if (audioCache.has(src)) return audioCache.get(src);
    const a = new Audio(src);
    a.preload = "auto";
    audioCache.set(src, a);
    return a;
  }

  function playOnce(src) {
    const a = getAudio(src);
    if (!a) return;
    try {
      a.currentTime = 0;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (e) {
      console.warn("卡片按钮语音播放失败：", e);
    }
  }

  document.addEventListener("click", (ev) => {
    const btn = ev.target && ev.target.closest
      ? ev.target.closest(".swiper-slide .card-button")
      : null;
    if (!btn) return;

    const src = btn.getAttribute("data-audio") || DEFAULT_SRC;
    playOnce(src);
  });
})();




function confirmAndMail() {
  const confirmed = confirm("是否跳转到邮件应用？");
  if (confirmed) {
    window.location.href = "mailto:hello@joker.red";
  }
}
function toggleSecondQR() {
  const popup = document.getElementById("second-qr-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function toggleThirdQR() {
  const popup = document.getElementById("third-qr-popup");
  if (!popup) {
    console.warn("toggleThirdQR: element #third-qr-popup not found");
    return;
  }
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}
function isWeChatBrowser() {
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes("micromessenger");
}
let autoHoverIntervalId = null;
let isAutoHoverPaused = false;
let lastButton = null;

function startAutoHoverFooterButtons(interval = 1600) {
  const buttons = Array.from(document.querySelectorAll('.footer-button'));

  function cycleHover() {
    if (isAutoHoverPaused) return;

    if (lastButton) lastButton.classList.remove('auto-hover');

    const candidates = buttons.filter(btn => btn !== lastButton && !(btn.id === "resonance-button" && isPlaying));
    const nextButton = candidates[Math.floor(Math.random() * candidates.length)];

    if (nextButton.id === "resonance-button") {
      autoHoverResonanceButton();
    } else {
      nextButton.classList.add('auto-hover');
    }

    lastButton = nextButton;
  }

  autoHoverIntervalId = setInterval(cycleHover, interval);
}

function pauseAutoHover() {
  isAutoHoverPaused = true;
}

function resumeAutoHover() {
  isAutoHoverPaused = false;
}
function confirmAndGoWeibo() {
  const confirmed = confirm("是否前往[小丑猫]微博主页？");
  if (confirmed) {
    window.open("https://weibo.com/u/7999616775", "_blank");
  }
}
// 与你共鸣（心脏跳动）按钮音频控制
const resonanceButton = document.getElementById("resonance-button");
const resonanceAudio = document.getElementById("tagline-audio");

// ✅ 功能开关：以后想恢复“auto-hover / hover 自动播放”，改 true 即可
const ENABLE_RESONANCE_AUDIO_ON_AUTOHOVER = false;   // auto-hover 选中时播放（默认关闭）
const ENABLE_RESONANCE_AUDIO_ON_MOUSEENTER = false; // 鼠标悬停时播放（默认关闭，避免桌面端误触卡住）

let isPlaying = false;

/**
 * 尝试播放按钮语音：
 * - 只有在播放真正开始后才会 isPlaying=true + pauseAutoHover()
 * - 如果被浏览器拦截（非用户手势自动播放），会自动恢复 auto-hover，避免“卡住”
 */
function playResonanceAudio({ pauseDuringPlayback = true } = {}) {
  if (!resonanceButton || !resonanceAudio) return;
  if (isPlaying) return;

  try {
    resonanceAudio.currentTime = 0;
    const playPromise = resonanceAudio.play();

    // 现代浏览器：play() 返回 Promise，可用来做“成功/失败”兜底
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          isPlaying = true;
          resonanceButton.classList.add("auto-hover");
          if (pauseDuringPlayback) pauseAutoHover();
        })
        .catch((e) => {
          console.warn("播放失败（可能被自动播放策略拦截）:", e);
          // ✅ 避免卡死：确保状态回滚 + 恢复 auto-hover
          isPlaying = false;
          try { resonanceButton.classList.remove("auto-hover"); } catch (_) {}
          resumeAutoHover();
        });
    } else {
      // 旧环境兜底：假设播放已开始
      isPlaying = true;
      resonanceButton.classList.add("auto-hover");
      if (pauseDuringPlayback) pauseAutoHover();
    }
  } catch (e) {
    console.warn("播放异常:", e);
    isPlaying = false;
    resumeAutoHover();
  }
}

// ✅ 点击：永远允许播放（用户手势）
if (resonanceButton) {
  resonanceButton.addEventListener("click", () => playResonanceAudio({ pauseDuringPlayback: true }));

  // ✅ 桌面端 hover：默认关闭，需要时可打开开关
  if (ENABLE_RESONANCE_AUDIO_ON_MOUSEENTER) {
    resonanceButton.addEventListener("mouseenter", () => playResonanceAudio({ pauseDuringPlayback: true }));
  }
}

// ✅ 播放结束：释放状态 + 恢复轮播
if (resonanceAudio) {
  resonanceAudio.addEventListener("ended", () => {
    isPlaying = false;
    try { resonanceButton.classList.remove("auto-hover"); } catch (_) {}
    resumeAutoHover();
  });
}

// ✅ auto-hover 选中时：保持高亮/心脏跳动，但默认不播放
function autoHoverResonanceButton() {
  if (!resonanceButton) return;

  // 保持 auto-hover 的视觉效果（含你的“心脏跳动”按钮表现）
  resonanceButton.classList.add("auto-hover");

  // 需要时可开启：auto-hover 选中也播放
  if (ENABLE_RESONANCE_AUDIO_ON_AUTOHOVER && !isPlaying) {
    playResonanceAudio({ pauseDuringPlayback: true });
  }
}
window.addEventListener("load", () => {
  if (!window.__typewriterStarted) { window.__typewriterStarted = true; typeWriter(); }

const images = document.querySelectorAll(".swiper-slide img");
  let loaded = 0;

  function checkAndInit() {
    loaded++;
    if (loaded === images.length) {
      initSwiper();
    }
  }
  images.forEach((img) => {
    if (img.complete) {
      checkAndInit();
    } else {
      img.onload = checkAndInit;
      img.onerror = checkAndInit;
    }
  });

  if (images.length === 0) {
    initSwiper();
  }

  startAutoHoverFooterButtons(1600);
});

// === Click to play & resume autohover (non-intrusive helper) ===
(function () {
  var btn = document.getElementById('resonance-button');
  var audio = document.getElementById('tagline-audio');
  if (!btn || !audio) return;

  function syntheticHover(el) {
    try {
      ['mouseenter','mouseover'].forEach(function(type){
        var ev = new Event(type, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
      });
    } catch (_) {}
  }

  function clearAutoHoverClasses() {
    try {
      document.querySelectorAll('.auto-hover').forEach(function(n){ n.classList.remove('auto-hover'); });
    } catch (_) {}
  }

  function nextFooterButton(fromEl) {
    var list = Array.prototype.slice.call(document.querySelectorAll('.footer-button'));
    if (!list.length) return null;
    var idx = list.indexOf(fromEl);
    if (idx < 0) idx = -1;
    return list[(idx + 1) % list.length];
  }

  function resumeAutoHover() {
    var next = nextFooterButton(btn);
    if (!next) return;
    clearAutoHoverClasses();
    // small delay to let click styles settle
    setTimeout(function(){
      // mark next as auto-hover target
      next.classList.add('auto-hover');
      syntheticHover(next);
    }, 80);
  }

  btn.addEventListener('click', function () {
    // user gesture: play audio then resume autohover
    try {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.catch(function(e){ /* swallow to avoid unhandled rejection */ });
      }
    } catch(_) {}

    resumeAutoHover();
  }, false);
})();


// ===================== 稀疏彩带（Confetti）点击触发 =====================
// ✅ 目标：
// - 从顶部飘落（像你发的成就彩带截图）
// - 彩带在二维码弹窗前面飘过（但不挡任何点击/扫码）
// - 只改 HTML 即可给任意按钮加触发：添加 data-confetti="true"
//
// 使用方式（HTML）：
//   <a ... data-confetti="true" ...>按钮</a>
//
// 说明：
// - 不改你的 CSS；canvas 的样式在这里内联设置
// - 播放完会自动清理 canvas，不常驻占资源

let __confettiCanvas = null;
let __confettiInstance = null;
let __confettiBusy = false;

function __ensureConfetti() {
  // canvas-confetti CDN 未加载时，直接跳过，不影响任何既有功能
  if (typeof window.confetti !== 'function') return null;

  if (__confettiInstance && __confettiCanvas) return __confettiInstance;

  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.position = 'fixed';
  c.style.left = '0';
  c.style.top = '0';
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.pointerEvents = 'none';
  // ✅ 尽量高，确保在二维码弹窗前面
  c.style.zIndex = '2000';
  document.body.appendChild(c);

  __confettiCanvas = c;
  __confettiInstance = window.confetti.create(c, { resize: true, useWorker: true });
  return __confettiInstance;
}

function launchSparseConfetti() {
  const conf = __ensureConfetti();
  if (!conf || __confettiBusy) return;

  __confettiBusy = true;

  // ✅ 让彩带“真正落下来”：喷射时间和清理时间分开控制
  // - sprayDuration：持续生成新彩带的时间（稀疏飘落）
  // - cleanupDelay：停止喷射后，留给彩带落到底部并自然消失的缓冲时间
  const sprayDuration = 3000; // ✅ 喷射时间（ms）
  const cleanupDelay  = 7000; // ✅ 停止喷射后继续存在的时间（ms）
  const colors = ["#ff4d4f", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#5e5ce6"];

  // ✅ 稀疏：用定时器而不是每帧喷，避免过密/过耗
  const timer = setInterval(() => {
    conf({
      particleCount: 420,      // ✅ 更稀疏
      startVelocity: 30,      // ✅ 更像“飘落”
      spread: 60,
      gravity: 1.1,         // ✅ 下降更慢，能看见落下过程
      ticks: 260,            // ✅ 粒子存活更久（避免半路消失）
      scalar: 0.9,
      shapes: ['square'],
      colors,
      origin: { x: Math.random(), y: -0.08 }
    });
  }, 160);

  setTimeout(() => {
    clearInterval(timer);
    // ✅ 结束：给粒子足够时间落完，再清理
    setTimeout(() => {
      try { conf.reset(); } catch (_) {}
      if (__confettiCanvas && __confettiCanvas.parentNode) {
        __confettiCanvas.parentNode.removeChild(__confettiCanvas);
      }
      __confettiCanvas = null;
      __confettiInstance = null;
      __confettiBusy = false;
    }, cleanupDelay);
  }, sprayDuration);
}

// ✅ 事件委托：以后你只改 HTML，加 data-confetti="true" 就能触发
// 用捕获阶段，确保就算按钮里有 inline onclick / confirm，也能先触发彩带
document.addEventListener('click', function (e) {
  const el = e.target && e.target.closest ? e.target.closest('[data-confetti="true"]') : null;
  if (!el) return;
  launchSparseConfetti();
}, true);


// ✅ Fix: make inline onclick handlers work reliably
try {
  window.confirmAndGoXHS = confirmAndGoXHS;
  window.toggleWeChatPublicQR = toggleWeChatPublicQR;
  window.confirmAndMail = confirmAndMail;
  window.confirmAndGoWeibo = confirmAndGoWeibo;
  window.toggleQR = toggleQR;
  window.toggleSecondQR = toggleSecondQR;
  window.toggleThirdQR = toggleThirdQR;
  window.openQR = openQR;
  window.closeQR = closeQR;

  // （可选）如果你未来想在控制台手动触发：launchSparseConfetti()
  window.launchSparseConfetti = launchSparseConfetti;
} catch (e) {
  console.warn("Export functions to window failed:", e);
}

