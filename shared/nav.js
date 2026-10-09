/* 智衡云 · 统一导航条（注入式，避免每个页面手改一遍）
 * 桌面端：插在 .topbar 下方；看板页（app-shell）：插进 .app-sider-foot 顶部。
 * 角色切换统一由右上角角色栏承担（shared/app.js），这里只保留主功能导航。
 */
(function () {
  var MAIN = [
    { href: 'index.html',   name: '企业看板',     desc: '非标业务成本总览 / 预警' },
    { href: 'data.html',    name: '数据底座',     desc: '真实 BOM · 工时台账 · 采购明细' },
    { href: 'brain.html',   name: '智能决策中心', desc: '智能定额模型 · 可解释 · 带区间' },
    { href: 'project.html', name: '项目挣值管控', desc: 'PV / EV / AC · CPI / SPI · EAC' },
    { href: 'steel.html',   name: '钢材行情',     desc: '真实采购均价 · EWMA 控制图 · 比价' },
    { href: 'eval.html',    name: '效果评价',     desc: '降本成效量化' },
    { href: 'tech.html',    name: '技术说明',     desc: '模型与算法原理' }
  ];

  function cur() {
    return (location.pathname.split('/').pop() || 'index.html');
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  function build(vertical) {
    var me = cur();
    var bar = el('div', 'nav-bar' + (vertical ? ' sider' : ''));
    var g1 = el('div', 'nav-group');
    MAIN.forEach(function (it) {
      var a = el('a', 'nav-pill' + (it.href === me ? ' current' : ''), it.name);
      a.href = it.href;
      if (it.desc) a.title = it.desc;
      g1.appendChild(a);
    });
    bar.appendChild(g1);
    return bar;
  }

  function mount() {
    if (document.getElementById('navBarRoot')) return;
    var top = document.querySelector('.topbar');
    if (top) {
      var bar = build(false);
      bar.id = 'navBarRoot';
      top.parentNode.insertBefore(bar, top.nextSibling);
      return;
    }
    var foot = document.querySelector('.app-sider-foot');
    if (foot) {
      var vb = build(true);
      vb.id = 'navBarRoot';
      foot.insertBefore(vb, foot.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
