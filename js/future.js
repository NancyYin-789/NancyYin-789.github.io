/* Local UI enhancements: no external animation or modal dependency. */
(() => {
  'use strict';
  if (window.futureBlogReady) return;
  window.futureBlogReady = true;
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let typingTimer;
  function syncThemeButton() {
    const button = document.getElementById('future-theme-toggle');
    if (!button) return;
    const dark = root.getAttribute('data-theme') === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
    button.querySelector('.future-theme-icon').textContent = dark ? '☀' : '☾';
    button.querySelector('.future-theme-label').textContent = dark ? '日间模式' : '夜间模式';
  }
  new MutationObserver(syncThemeButton).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('click', event => {
    if (!event.target.closest('#future-theme-toggle')) return;
    const darkButton = document.getElementById('darkmode');
    if (darkButton) darkButton.click();
    else {
      const mode = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      try { localStorage.setItem('theme', JSON.stringify({ value: mode, expiry: Date.now() + 31536000000 })); } catch (_) {}
    }
  });
  function typeGreeting() {
    clearTimeout(typingTimer);
    const target = document.getElementById('future-typed');
    if (!target) return;
    const messages = ['欢迎来到我的博客', '今天心情如何，希望你天天开心~'];
    if (reducedMotion.matches) { target.textContent = messages.join(' · '); return; }
    let message = 0;
    let position = 0;
    let deleting = false;
    target.textContent = '';
    function tick() {
      if (!target.isConnected) return;
      const text = messages[message];
      position += deleting ? -1 : 1;
      target.textContent = text.slice(0, position);
      let delay = deleting ? 48 : 115;
      if (!deleting && position === text.length) { deleting = true; delay = 2200; }
      else if (deleting && position === 0) { deleting = false; message = (message + 1) % messages.length; delay = 450; }
      typingTimer = setTimeout(tick, delay);
    }
    typingTimer = setTimeout(tick, 350);
  }
  function highlightCategory() {
    document.querySelectorAll('.card-categories a').forEach(link => {
      if (decodeURI(link.pathname) === decodeURI(location.pathname)) link.setAttribute('aria-current', 'page');
    });
  }
  function welcome() {
    if (!document.querySelector('#page-header.full_page')) return;
    try { if (sessionStorage.getItem('future-welcome-dismissed')) return; } catch (_) {}
    if (document.getElementById('future-welcome')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'future-welcome';
    dialog.setAttribute('aria-labelledby', 'future-welcome-title');
    dialog.setAttribute('aria-describedby', 'future-welcome-description');
    dialog.innerHTML = '<button class="future-welcome-close" type="button" aria-label="关闭欢迎弹窗">×</button><div class="future-welcome-kicker">A MESSAGE FROM NANCYYIN</div><div class="future-welcome-symbol" aria-hidden="true">✦</div><h2 id="future-welcome-title">你好，未来的同行者</h2><p id="future-welcome-description">欢迎来到我的博客！<br>这里收藏代码、灵感与生活的闪光。<br>今天心情如何，希望你天天开心~</p><div class="future-welcome-actions"><button type="button" data-action="cancel" autofocus>取消</button><button type="button" class="future-primary" data-action="explore">开始探索 ↗</button></div>';
    document.body.appendChild(dialog);
    const previousFocus = document.activeElement;
    dialog.addEventListener('close', () => {
      document.body.classList.remove('future-dialog-open');
      try { sessionStorage.setItem('future-welcome-dismissed', '1'); } catch (_) {}
      if (previousFocus && previousFocus.isConnected && previousFocus !== document.body) previousFocus.focus();
    });
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button) {
        dialog.close();
        if (button.dataset.action === 'explore') document.getElementById('content-inner')?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      } else if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    });
    if (typeof dialog.showModal === 'function') { dialog.showModal(); document.body.classList.add('future-dialog-open'); }
  }
  function init() { syncThemeButton(); typeGreeting(); highlightCategory(); welcome(); }
  document.addEventListener('pjax:complete', init);
  document.addEventListener('pjax:send', () => { clearTimeout(typingTimer); const dialog = document.getElementById('future-welcome'); if (dialog?.open) dialog.close(); });
  reducedMotion.addEventListener('change', typeGreeting);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
