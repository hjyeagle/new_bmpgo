/* ==========================================================
   main.js
   - 4개 언어(ko/en/ja/zh) JSON을 불러와 data-i18n 요소 치환
   - 언어 선택은 localStorage에 저장하여 재방문 시 유지
   - 모바일 햄버거 메뉴 토글
   ========================================================== */

const SUPPORTED_LANGS = ['ko', 'en', 'ja', 'zh'];
const DEFAULT_LANG = 'ko';
const STORAGE_KEY = 'bmpgo_lang';

async function loadLang(lang) {
  const res = await fetch(`lang/${lang}.json`);
  if (!res.ok) throw new Error(`언어팩 로드 실패: ${lang}`);
  return res.json();
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });
}

function updateLangLinks(lang) {
  // 제품 상세페이지 등 "언어별 별도 파일"로 존재하는 링크의 href를
  // 현재 선택된 언어에 맞게 재작성한다.
  // 예: data-lang-link="product-01-hanwoo" → ko: product-01-hanwoo.html
  //                                          en: product-01-hanwoo.en.html
  document.querySelectorAll('[data-lang-link]').forEach((el) => {
    const base = el.getAttribute('data-lang-link');
    el.setAttribute('href', lang === 'ko' ? `${base}.html` : `${base}.${lang}.html`);
  });
}

function setActiveLangButtons(lang) {
  document.querySelectorAll('.lang-switch button, .footer-lang button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

async function switchLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  try {
    const dict = await loadLang(lang);
    applyTranslations(dict);
    updateLangLinks(lang);
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang);
    setActiveLangButtons(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (err) {
    console.error(err);
  }
}

function initLangSwitch() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const browserLang = navigator.language.slice(0, 2);
  const initial = saved || (SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG);

  switchLang(initial);

  document.querySelectorAll('.lang-switch button, .footer-lang button').forEach((btn) => {
    btn.addEventListener('click', () => switchLang(btn.dataset.lang));
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLangSwitch();
  initMobileNav();
});
