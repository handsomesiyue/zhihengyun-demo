/* ============================================================
 * 后端适配层
 * ------------------------------------------------------------
 * 角色页面原本直接读写 localStorage 里的 DB。本文件在 app.js 之后加载，
 * 把 DB 的数据源切换为后端 API，并重写各流转动作，使其真正调用后端。
 * 页面自身的渲染逻辑（renderCraft / renderWorkshop ...）无需修改。
 * 后端不可用时自动降级为本地 localStorage 演示模式。
 * ============================================================ */
(function () {
  'use strict';

  // 静态演示站：流转动作留给 app.js 的 localStorage 实现
  if (window.STATIC_DEMO) return;

  var BASE = '';
  var online = false;

  function req(path, opt) {
    return fetch(BASE + path, opt).then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.code !== 0) throw new Error(j.message || '接口错误');
        return j.data;
      });
  }
  function get(p) { return req(p); }
  function post(p, b) {
    return req(p, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b || {})
    });
  }

  // ---------- 字段映射：后端 snake_case → 前端 camelCase ----------
  function mapWO(w) {
    return {
      id: w.id, project: w.project || '', component: w.component || '',
      family: w.family || '', material: w.material || 'Q235B',
      weight: w.weight || 0, thickness: w.thickness || 12,
      weldLength: w.weld_length || 0, holes: w.holes || 0,
      complexity: w.complexity || 3, process: w.process_count || 6, batch: w.batch || 1,
      estHours: w.est_hours, estCost: w.est_cost, confidence: w.confidence,
      ciLow: w.ci_low, ciHigh: w.ci_high,
      actualHours: w.actual_hours, actualSteel: w.actual_steel,
      actualWeld: w.actual_weld, actualOutsource: w.actual_outsource,
      scrapRate: w.scrap_rate,
      status: w.status, stage: w.stage, source: w.source || '',
      createdAt: w.created_at, dispatchedAt: w.dispatched_at, startedAt: w.started_at,
      completedAt: w.completed_at, postedAt: w.posted_at, auditedAt: w.audited_at,
      cost: w.cost
    };
  }
  function mapAlert(a) {
    return {
      id: a.id, woId: a.wo_id, type: a.alert_type, value: a.alert_value,
      level: a.level, desc: a.description || a.alert_type, threshold: a.threshold || '',
      riskClass: a.risk_class || '', status: a.status,
      createdAt: a.created_at, assignedTo: a.assigned_to || ''
    };
  }
  function mapPR(p) {
    return {
      id: p.id, project: p.project || '', item: p.item || '', qty: p.qty || 0,
      unit: p.unit || '', amount: p.amount || 0, status: p.status,
      dept: p.dept || '', createdAt: p.created_at
    };
  }

  function refill(arr, rows) {
    arr.length = 0;
    rows.forEach(function (x) { arr.push(x); });
  }

  // ---------- 从后端拉取全量数据 ----------
  function syncAll() {
    return Promise.all([get('/api/work-orders'), get('/api/risk-alerts'),
                        get('/api/purchase-requests')]).then(function (r) {
      refill(DB.workOrders, r[0].map(mapWO));
      refill(DB.riskAlerts, r[1].map(mapAlert));
      refill(DB.purchaseReqs, r[2].map(mapPR));
      saveDB();
      online = true;
    });
  }

  // ---------- 刷新当前页面 ----------
  // site.html 的 loadSiteData 内部会调用 renderSite，故优先用它
  var RENDER = {
    'craft.html': 'renderCraft', 'workshop.html': 'renderWorkshop',
    'finance.html': 'renderFinance', 'purchase.html': 'renderPurchase',
    'audit.html': 'renderAudit', 'site.html': 'loadSiteData',
    'index.html': 'renderDashboard'
  };
  function refreshCurrent() {
    var f = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
    var fn = RENDER[f];
    if (fn && typeof window[fn] === 'function') {
      try { window[fn](); } catch (e) { /* 忽略渲染异常 */ }
    }
  }

  // ---------- 统一动作封装 ----------
  function act(path, okMsg, opts) {
    opts = opts || {};
    return post(path, opts.body).then(function (data) {
      return syncAll().then(function () {
        if (opts.after) opts.after(data);
        refreshCurrent();
        if (typeof showToast === 'function') {
          var msg = (typeof okMsg === 'function') ? okMsg(data) : okMsg;
          showToast(msg, opts.type || 'success');
        }
      });
    }).catch(function (e) {
      if (typeof showToast === 'function') showToast('后端不可用：' + e.message, 'error');
      throw e;
    });
  }

  // ---------- 覆盖 app.js 中的流转函数 ----------
  window.craftCalc = function (woId) {
    return act('/api/work-orders/' + woId + '/calculate', function (d) {
      var wo = getWOById(woId);
      var h = d && d.est_hours;
      return '✅ 测算完成：预估 ' + (h != null ? h + 'h' : '') +
             '，置信度 ' + (d && d.confidence) + '（' + (d && d.route_strategy) + '）';
    });
  };

  window.craftDispatch = function (woId) {
    return act('/api/work-orders/' + woId + '/dispatch', '✅ 定额已下达，推送至车间管控端');
  };

  window.craftReject = function (woId) {
    return act('/api/work-orders/' + woId + '/reject', '已驳回，返回待测算', { type: 'warn' });
  };

  window.workshopStart = function (woId) {
    return act('/api/work-orders/' + woId + '/start', '✅ 已开工');
  };

  window.workshopComplete = function (woId, d) {
    d = d || {};
    return act('/api/work-orders/' + woId + '/complete', function (res) {
      var n = res && res.anomalies ? res.anomalies.length : 0;
      return n > 0 ? ('⚠️ 完工上报完成，检测到 ' + n + ' 项异常') : '✅ 完工上报完成，无异常';
    }, {
      type: 'warn',
      body: {
        actual_hours: d.hours, actual_steel: d.steel, actual_weld: d.weld,
        actual_outsource: d.outsource || 0, scrap_rate: d.scrapRate, remark: d.remark || ''
      }
    });
  };

  window.financePost = function (woId) {
    return act('/api/work-orders/' + woId + '/post', function () {
      var wo = getWOById(woId);
      var n = wo ? (DB.riskAlerts.filter(function (a) {
        return a.woId === woId && a.status === 'open'; }).length) : 0;
      return n > 0 ? ('✅ 已过账，' + n + ' 项异常推送内审') : '✅ 已过账，成本归集完成';
    });
  };

  window.financeReturn = function (woId) {
    return act('/api/work-orders/' + woId + '/return', '已退回车间', { type: 'warn' });
  };

  window.auditApprove = function (woId) {
    return act('/api/work-orders/' + woId + '/audit', '✅ 内审通过，风险闭环，流程结束');
  };

  window.auditReject = function (woId) {
    return act('/api/work-orders/' + woId + '/unaudit', '已驳回，退回财务', { type: 'warn' });
  };

  window.purchaseApprove = function (reqId) {
    return act('/api/purchase-requests/' + reqId + '/approve', '✅ 采购申请已审批通过');
  };

  window.purchaseReject = function (reqId) {
    return act('/api/purchase-requests/' + reqId + '/reject', '已驳回采购申请', { type: 'warn' });
  };

  // 风险闭环
  window.closeRiskAlert = function (rid) {
    return act('/api/risk-alerts/' + rid + '/close', '✅ 风险已闭环');
  };

  window.ApiSync = {
    get: get, post: post, syncAll: syncAll, refresh: refreshCurrent,
    isOnline: function () { return online; }
  };

  // ---------- 页面加载后拉一次真数据 ----------
  function boot() {
    syncAll().then(function () {
      refreshCurrent();
      console.log('[后端适配层] 已同步真实数据，工单 ' + DB.workOrders.length +
                  ' 个 / 预警 ' + DB.riskAlerts.length + ' 条');
    }).catch(function () {
      console.warn('[后端适配层] 后端未启动，使用本地演示数据');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
