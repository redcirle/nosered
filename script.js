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
  new Swiper(".swiper-container", {
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
}

function closeQR(popupId) {
  const popup = document.getElementById(popupId);
  if (!popup) {
    console.warn("closeQR: element not found ->", popupId);
    return;
  }
  popup.style.display = "none";
}

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
// 与你共鸣按钮音频控制
const resonanceButton = document.getElementById("resonance-button");
const resonanceAudio = document.getElementById("tagline-audio");
let isPlaying = false;

function triggerResonanceAudio() {
  if (!resonanceButton || !resonanceAudio) return;
  if (!isPlaying && resonanceAudio) {
    isPlaying = true;
    resonanceAudio.currentTime = 0;
    resonanceAudio.play().catch(e => {
      console.warn("播放失败:", e);
    });
    resonanceButton.classList.add("auto-hover");
    pauseAutoHover(); // 🔸播放语音时暂停自动轮播
  }
}

if (resonanceButton) {
resonanceButton.addEventListener("mouseenter", triggerResonanceAudio);
resonanceButton.addEventListener("click", triggerResonanceAudio);
}

resonanceAudio.addEventListener("ended", () => {
  isPlaying = false;
  resonanceButton.classList.remove("auto-hover");
  resumeAutoHover(); // 🔸播放完毕恢复轮播
});

// ✅ 自动 hover 调用时的判断逻辑
function autoHoverResonanceButton() {
  if (!isPlaying) {
    triggerResonanceAudio();
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
} catch (e) {
  console.warn("Export functions to window failed:", e);
}

