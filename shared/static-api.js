/* ============================================================
 * 静态演示适配层
 * ------------------------------------------------------------
 * 部署在 GitHub Pages 等无后端环境时（或地址带 ?static=1），
 * 拦截页面对 /api/* 的请求，改由 static-api-data.js 中的快照应答，
 * 并用快照初始化 localStorage 中的 DB，使工单编号与快照一致。
 * 必须在 app.js 之前加载。有后端时本文件不做任何事。
 * ============================================================ */
(function () {
  'use strict';

  var ONLINE_URL = 'https://macbook-pro.tail17deb.ts.net';
  var DB_KEY = 'ai_cost_control_data';
  var SEED_KEY = 'static_seed_version';

  var STATIC = /github\.io$/.test(location.hostname);
  try {
    if (/[?&]static=1\b/.test(location.search)) sessionStorage.setItem('static_demo', '1');
    STATIC = STATIC || sessionStorage.getItem('static_demo') === '1';
  } catch (e) { /* 忽略 */ }
  window.STATIC_DEMO = STATIC;

  var S = null;

  window.apiPreviewUrl = function (file) {
    if (S && S.previews[file]) return S.previews[file];
    return '/api/drawings/preview?file=' + encodeURIComponent(file);
  };

  if (!STATIC) return;

  function reply(obj, delay) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(new Response(JSON.stringify(obj), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        }));
      }, delay || 60);
    });
  }
  function ok(data) { return { code: 0, message: 'success', data: data }; }
  function fail(msg) { return { code: 1, message: msg, data: null }; }

  function readOnlyMsg() {
    return '静态演示版不支持该操作，请访问在线版 ' + ONLINE_URL;
  }

  function filterBom(params) {
    var fam = params.get('family') || '', q = params.get('q') || '', qt = params.get('quality') || '';
    var limit = parseInt(params.get('limit') || '100', 10), offset = parseInt(params.get('offset') || '0', 10);
    var rows = S.bomAll.filter(function (r) {
      if (fam && r.family !== fam) return false;
      if (qt && r.quality !== qt) return false;
      if (q && String(r.name || '').indexOf(q) < 0 && String(r.code || '').indexOf(q) < 0) return false;
      return true;
    });
    return ok({ total: rows.length, rows: rows.slice(offset, offset + limit) });
  }

  function readBody(init) {
    try { return JSON.parse((init && init.body) || '{}'); } catch (e) { return {}; }
  }

  function createLocalWO(b) {
    if (typeof DB === 'undefined' || typeof estimateHours !== 'function') return fail(readOnlyMsg());
    var params = {
      weight: b.weight || 0, complexity: b.complexity || 3,
      process: b.process_count || 6, batch: b.batch || 1
    };
    var hours = estimateHours(params);
    var cost = estimateCost(params, hours);
    var id = typeof genWO === 'function' ? genWO() : 'WO-' + Date.now();
    DB.workOrders.unshift({
      id: id, project: b.project || '', component: b.component || '', family: b.family || '',
      material: b.material || 'Q235B', weight: params.weight, thickness: b.thickness || 12,
      weldLength: b.weld_length || 0, holes: 0, complexity: params.complexity,
      process: params.process, batch: params.batch,
      estHours: hours, estCost: cost.total,
      confidence: typeof calcConfidence === 'function' ? calcConfidence(params) : 0.8,
      status: 'pending_calc', stage: 'craft', source: b.source || 'drawing',
      createdAt: new Date().toISOString(),
      actualHours: null, actualSteel: null, actualWeld: null, actualOutsource: null, scrapRate: null
    });
    saveDB();
    return ok({ id: id, est_hours: hours, cost_breakdown: { total: cost.total } });
  }

  function closeLocalAlert(rid) {
    if (typeof DB === 'undefined') return fail(readOnlyMsg());
    var a = DB.riskAlerts.filter(function (x) { return String(x.id) === String(rid); })[0];
    if (a) { a.status = 'closed'; saveDB(); }
    return ok({ id: rid });
  }

  function handle(url, init) {
    var method = ((init && init.method) || 'GET').toUpperCase();
    var path = url.pathname.slice(url.pathname.indexOf('/api/'));
    var key = path + url.search;
    var m;

    if (method === 'GET') {
      if (S.routes[key]) return reply(S.routes[key]);
      if (path === '/api/bom/items') return reply(filterBom(url.searchParams));
      if (S.routes[path]) return reply(S.routes[path]);
      if (/^\/api\/work-orders\/[^/]+$/.test(path)) return reply(ok({ logs: [] }));
      if (/^\/api\/analysis\/rootcause\//.test(path)) {
        return reply(fail('静态演示版仅包含预置工单的根因分析，新建工单请在在线版中体验'));
      }
      return reply(fail('静态演示版未包含该数据'));
    }

    if (path === '/api/drawings/recognize') {
      var f = readBody(init).file;
      var r = S.recognize[f];
      if (r) return reply(ok(r), 4500);
      return reply(fail('静态演示版预置了 ' + Object.keys(S.recognize).length +
        ' 张明细表（文件名含 mxb）的识别结果，其他图纸请在在线版中实时识别'), 1500);
    }
    if (path === '/api/work-orders') return reply(createLocalWO(readBody(init)));
    if ((m = path.match(/^\/api\/risk-alerts\/([^/]+)\/close$/))) return reply(closeLocalAlert(m[1]));
    return reply(fail(readOnlyMsg()));
  }

  window.__staticApiInit = function (data) {
    S = data;
    try {
      if (localStorage.getItem(SEED_KEY) !== data.version) {
        localStorage.setItem(DB_KEY, JSON.stringify(data.seed));
        localStorage.setItem(SEED_KEY, data.version);
      }
    } catch (e) { /* 隐私模式下 localStorage 不可用，退回 app.js 内置演示数据 */ }

    var nativeFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var u;
      try { u = new URL(typeof input === 'string' ? input : input.url, location.href); } catch (e) { u = null; }
      if (u && u.origin === location.origin && u.pathname.indexOf('/api/') >= 0) return handle(u, init);
      return nativeFetch(input, init);
    };
  };

  var src = (document.currentScript && document.currentScript.src || '').replace(/static-api\.js.*$/, 'static-api-data.js');
  document.write('<script src="' + (src || 'shared/static-api-data.js') + '"><\/script>');
})();
