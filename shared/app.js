/* ============================================================
 * 智衡云 · 非标作业智能成本管控体系 - 共享数据层与业务逻辑
 * 所有页面引用此文件，实现工单跨页面流转与数据持久化
 * ============================================================ */

// ========== 通用工具函数 ==========
function showToast(msg, type) {
  var toast = document.createElement('div');
  toast.textContent = msg;
  var bg = type === 'error' ? '#dc2626' : type === 'warn' ? '#ea580c' : type === 'success' ? '#16a34a' : '#1a3a5c';
  toast.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);background:' + bg + ';color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:1;transition:opacity .3s';
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 2000);
}

function fmtMoney(n) {
  return '¥' + Math.round(n).toLocaleString();
}

function fmtDate(d) {
  if (!d) d = new Date();
  if (typeof d === 'string') d = new Date(d);
  var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function genWO() {
  var d = new Date();
  var s = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  var r = String(Math.floor(Math.random() * 900) + 100);
  return 'WO-' + s + r;
}

// ========== 数据层（localStorage持久化） ==========
var Store = {
  KEY: 'ai_cost_control_data',

  load: function() {
    try {
      var raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return this.initData();
  },

  save: function(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e) {}
  },

  initData: function() {
    var now = new Date().toISOString();
    var data = {
      workOrders: [
        {
          id: 'WO-20260901015', project: 'ZZ钢铁除尘EPC', component: 'CF-箱体', material: 'Q345R',
          weight: 1250, thickness: 16, weldLength: 18.5, holes: 24, complexity: 3, process: 6, batch: 4,
          estHours: 42.8, estCost: 18271, confidence: 0.68,
          status: 'pending_calc', stage: 'craft', createdAt: now,
          actualHours: null, actualSteel: null, actualWeld: null, actualOutsource: null, scrapRate: null
        },
        {
          id: 'WO-20260901016', project: 'XX电厂脱硫改造', component: 'CF-法兰', material: '304不锈钢',
          weight: 680, thickness: 12, weldLength: 9.2, holes: 16, complexity: 2, process: 5, batch: 8,
          estHours: 18.5, estCost: 9850, confidence: 0.82,
          status: 'pending_review', stage: 'craft', createdAt: now,
          actualHours: null, actualSteel: null, actualWeld: null, actualOutsource: null, scrapRate: null
        },
        {
          id: 'WO-20260901017', project: 'YY垃圾焚烧二期', component: 'CF-焊架', material: 'Q235B',
          weight: 320, thickness: 8, weldLength: 6.5, holes: 8, complexity: 2, process: 4, batch: 12,
          estHours: 12.3, estCost: 5620, confidence: 0.94,
          status: 'dispatched', stage: 'workshop', createdAt: now,
          actualHours: null, actualSteel: null, actualWeld: null, actualOutsource: null, scrapRate: null
        },
        {
          id: 'WO-20260901018', project: 'CC化工VOCs治理', component: '支架组件', material: 'Q355B',
          weight: 890, thickness: 14, weldLength: 12.8, holes: 32, complexity: 4, process: 7, batch: 6,
          estHours: 35.6, estCost: 14200, confidence: 0.75,
          status: 'in_production', stage: 'workshop', createdAt: now,
          actualHours: 28.5, actualSteel: 920, actualWeld: 15.2, actualOutsource: 0, scrapRate: 6.2,
          progress: 55, materialIssue: 70, warehouseQty: 920, manualReport: 860, systemSuggest: 890
        },
        {
          id: 'WO-20260901019', project: 'AA危废资源化', component: '反应釜内衬', material: '316L',
          weight: 1560, thickness: 20, weldLength: 22.4, holes: 12, complexity: 5, process: 9, batch: 2,
          estHours: 68.2, estCost: 32500, confidence: 0.71,
          status: 'completed', stage: 'finance', createdAt: now,
          actualHours: 72.5, actualSteel: 1620, actualWeld: 28.6, actualOutsource: 4500, scrapRate: 9.8,
          progress: 100, materialIssue: 98
        },
        {
          id: 'WO-20260901020', project: 'ZZ钢铁除尘EPC', component: '烟道组件', material: 'Q235B',
          weight: 2100, thickness: 10, weldLength: 28.5, holes: 48, complexity: 3, process: 6, batch: 3,
          estHours: 52.4, estCost: 21800, confidence: 0.88,
          status: 'posted', stage: 'audit', createdAt: now,
          actualHours: 55.8, actualSteel: 2180, actualWeld: 31.2, actualOutsource: 0, scrapRate: 5.5,
          progress: 100, materialIssue: 100
        }
      ],
      purchaseReqs: [
        { id: 'PR-001', project: 'ZZ钢铁除尘EPC', item: 'Q345R钢板 16mm', qty: 5.2, unit: '吨', amount: 21840, status: 'pending', dept: '铆焊一车间', createdAt: now },
        { id: 'PR-002', project: 'XX电厂脱硫改造', item: '304不锈钢板 12mm', qty: 2.8, unit: '吨', amount: 42000, status: 'pending', dept: '机加车间', createdAt: now },
        { id: 'PR-003', project: 'YY垃圾焚烧二期', item: '外协焊接加工', qty: 1, unit: '批', amount: 15000, status: 'approved', dept: '铆焊二车间', createdAt: now }
      ],
      riskAlerts: [
        { id: 'RA-001', woId: 'WO-20260901015', type: '工时偏差', value: '+36.7%', level: 'high', desc: '铆焊二车间·预估42.8h/实际58.5h', status: 'open', createdAt: now },
        { id: 'RA-002', woId: 'WO-20260901019', type: '外协超标', value: '+22.5%', level: 'high', desc: '外协分包·预算350万/实际428万·待会签', status: 'open', createdAt: now },
        { id: 'RA-003', woId: 'WO-20260901018', type: '焊材浪费', value: '+36%', level: 'medium', desc: '机加车间·理论50kg/实际68kg·待车间确认', status: 'open', createdAt: now },
        { id: 'RA-004', woId: 'WO-20260901020', type: '钢材超耗', value: '+3.8%', level: 'medium', desc: 'Q235B钢板·定额520kg/申请715kg·待主任双签', status: 'open', createdAt: now }
      ],
      auditLogs: []
    };
    this.save(data);
    return data;
  },

  reset: function() {
    localStorage.removeItem(this.KEY);
    return this.initData();
  }
};

// 全局数据对象
var DB = Store.load();

function saveDB() { Store.save(DB); }

// ========== 工单查询 ==========
function getWOByStage(stage) {
  return DB.workOrders.filter(function(w) { return w.stage === stage; });
}

function getWOByStatus(status) {
  return DB.workOrders.filter(function(w) { return w.status === status; });
}

function getWOById(id) {
  return DB.workOrders.find(function(w) { return w.id === id; });
}

// ========== 工时估算模型（多元线性回归） ==========
function estimateHours(params) {
  var w = params.weight || 0;
  var mc = params.materialCoef || 1.0;
  var c = params.complexity || 3;
  var p = params.process || 6;
  var b = params.batch || 1;
  var hist = params.histMean || 43.8;
  var hours = 1.5 + 0.032 * w * mc + 2.5 * c + 1.8 * p + 8.5 * (1 / b) + 0.3 * hist;
  return Math.round(hours * 10) / 10;
}

function calcConfidence(params) {
  var base = 0.95;
  if (params.complexity >= 4) base -= 0.1;
  if (params.materialCoef >= 1.4) base -= 0.08;
  if (params.batch <= 2) base -= 0.05;
  if (params.weight > 1500) base -= 0.03;
  return Math.max(0.5, Math.min(0.99, Math.round(base * 100) / 100));
}

// 若未加载 cost-assumptions.js，提供最小回退（不重复声明函数，避免提升覆盖）
if (typeof COST_ASSUMPTIONS === 'undefined') {
  window.COST_ASSUMPTIONS = {
    source: 'demo', label: '演示假设',
    annualFixedCost: 4800000,
    monthlyVolumeTons: { 2: 160, 6: 360, 9: 280 },
    laborRateByComplexity: { 1: 5, 2: 8, 3: 12, 4: 16, 5: 20 },
    defaultLaborRate: 12,
    progressMaterialWatch: 10, progressMaterialBad: 15,
    dualSourceTolerancePct: 8, defaultScrapRate: 8, defaultSteelPricePerTon: 4200
  };
}
function _monthlyFixed() {
  if (typeof getMonthlyFixedCost === 'function') return getMonthlyFixedCost();
  return Math.round((COST_ASSUMPTIONS.annualFixedCost || 4800000) / 12);
}
function _monthVol(month) {
  if (typeof getMonthVolumeTons === 'function') return getMonthVolumeTons(month);
  var m = month || 9;
  return (COST_ASSUMPTIONS.monthlyVolumeTons || {})[m] || 280;
}
function _laborRate(complexity) {
  if (typeof getLaborRate === 'function') return getLaborRate(complexity);
  var c = Math.max(1, Math.min(5, Math.round(complexity || 3)));
  var rates = COST_ASSUMPTIONS.laborRateByComplexity || {};
  return rates[c] != null ? rates[c] : 12;
}

/**
 * 三层成本对象测算：
 * 1) 直接材料  2) 直接人工（复杂度工价）  3) 制造费用（固定池按当月产量分摊）
 * params.month 可选，默认当前月；用于淡旺季对比
 */
function estimateCost(params, hours) {
  var weightKg = params.weight || 0;
  var steelPrice = params.steelPrice || (COST_ASSUMPTIONS.defaultSteelPricePerTon || 4200);
  var steelCost = Math.round(weightKg / 1000 * steelPrice);

  var laborRate = params.laborRate != null ? params.laborRate : _laborRate(params.complexity);
  var laborCost = Math.round(hours * laborRate);

  var outsource = Math.round(laborCost * 0.9 * (params.complexity >= 4 ? 1.3 : 1));
  var equip = 300 + (params.process || 6) * 50;
  var coating = Math.round(weightKg * 0.8);
  var install = 1500;

  // 固定制造费用：当月费用池 × (本单吨位 / 当月产量吨)
  var month = params.month || (new Date().getMonth() + 1);
  var monthVol = _monthVol(month);
  var monthlyFixed = _monthlyFixed();
  var orderTons = weightKg / 1000;
  var fixedShare = monthVol > 0 ? Math.round(monthlyFixed * (orderTons / monthVol)) : 0;

  var total = steelCost + laborCost + outsource + equip + coating + fixedShare + install;
  return {
    steel: steelCost,
    labor: laborCost,
    laborRate: laborRate,
    outsource: outsource,
    equip: equip,
    coating: coating,
    manage: fixedShare,
    fixedShare: fixedShare,
    month: month,
    monthVolumeTons: monthVol,
    monthlyFixedCost: monthlyFixed,
    install: install,
    total: Math.round(total)
  };
}

/** 同参数下淡季(2月) vs 旺季(6月)单位成本对比 —— 主因：产量驱动固定费分摊 */
function compareSeasonalUnitCost(params, hours) {
  var low = estimateCost(Object.assign({}, params, { month: 2 }), hours);
  var high = estimateCost(Object.assign({}, params, { month: 6 }), hours);
  var unitLow = params.weight > 0 ? Math.round(low.total / params.weight * 100) / 100 : 0;
  var unitHigh = params.weight > 0 ? Math.round(high.total / params.weight * 100) / 100 : 0;
  return {
    lowMonth: 2,
    highMonth: 6,
    low: low,
    high: high,
    unitCostLow: unitLow,
    unitCostHigh: unitHigh,
    deltaPct: unitHigh > 0 ? Math.round((unitLow - unitHigh) / unitHigh * 1000) / 10 : 0,
    driver: '产量分摊（淡季在制量低 → 单位固定费用高）'
  };
}

// ========== 异常检测（原 5 维 + 进度领料偏离 + 双源不一致） ==========
function detectAnomalies(wo) {
  var anomalies = [];
  if (wo.actualHours != null && wo.estHours) {
    var dev = (wo.actualHours - wo.estHours) / wo.estHours * 100;
    if (dev > 30) anomalies.push({ type: '工时偏差', value: '+' + dev.toFixed(1) + '%', level: 'high', threshold: '>30%' });
    else if (dev > 15) anomalies.push({ type: '工时偏差', value: '+' + dev.toFixed(1) + '%', level: 'medium', threshold: '>15%' });
  }
  if (wo.actualSteel != null && wo.weight) {
    var steelDev = (wo.actualSteel - wo.weight) / wo.weight * 100;
    if (steelDev > 10) anomalies.push({ type: '钢材超耗', value: '+' + steelDev.toFixed(1) + '%', level: 'high', threshold: '>10%' });
    else if (steelDev > 5) anomalies.push({ type: '钢材超耗', value: '+' + steelDev.toFixed(1) + '%', level: 'medium', threshold: '>5%' });
  }
  if (wo.actualWeld != null && wo.weldLength) {
    var weldDev = (wo.actualWeld - wo.weldLength) / wo.weldLength * 100;
    if (weldDev > 30) anomalies.push({ type: '焊材浪费', value: '+' + weldDev.toFixed(1) + '%', level: 'high', threshold: '>30%' });
    else if (weldDev > 20) anomalies.push({ type: '焊材浪费', value: '+' + weldDev.toFixed(1) + '%', level: 'medium', threshold: '>20%' });
  }
  if (wo.actualOutsource != null && wo.estCost) {
    var outRatio = wo.actualOutsource / wo.estCost * 100;
    if (outRatio > 20) anomalies.push({ type: '外协超标', value: outRatio.toFixed(1) + '%', level: 'high', threshold: '>20%' });
    else if (outRatio > 10) anomalies.push({ type: '外协超标', value: outRatio.toFixed(1) + '%', level: 'medium', threshold: '>10%' });
  }
  if (wo.scrapRate != null) {
    if (wo.scrapRate > 12) anomalies.push({ type: '余废料率', value: wo.scrapRate + '%', level: 'high', threshold: '>12%' });
    else if (wo.scrapRate > 8) anomalies.push({ type: '余废料率', value: wo.scrapRate + '%', level: 'medium', threshold: '>8%' });
  }

  // 进度–领料偏离（工单级：领料进度 − 生产完成度）
  if (wo.progress != null && wo.materialIssue != null) {
    var pmDev = wo.materialIssue - wo.progress;
    var absPm = Math.abs(pmDev);
    var watchT = (typeof COST_ASSUMPTIONS !== 'undefined' ? COST_ASSUMPTIONS.progressMaterialWatch : 10);
    var badT = (typeof COST_ASSUMPTIONS !== 'undefined' ? COST_ASSUMPTIONS.progressMaterialBad : 15);
    if (absPm >= badT) {
      anomalies.push({
        type: '进度领料偏离',
        value: (pmDev > 0 ? '+' : '') + pmDev.toFixed(1) + '%',
        level: 'high',
        threshold: '≥' + badT + '%',
        hint: pmDev > 0 ? '超领（领料快于进度）' : '进度滞后或预算偏松'
      });
    } else if (absPm > watchT) {
      anomalies.push({
        type: '进度领料偏离',
        value: (pmDev > 0 ? '+' : '') + pmDev.toFixed(1) + '%',
        level: 'medium',
        threshold: '>' + watchT + '%',
        hint: pmDev > 0 ? '领料偏快，关注在制' : '进度偏快而领料偏低'
      });
    }
  }

  // 双源不一致：仓库出库 vs 人工填报（相对定额建议量）
  if (wo.warehouseQty != null && wo.manualReport != null && wo.weight) {
    var dualTol = (typeof COST_ASSUMPTIONS !== 'undefined' ? COST_ASSUMPTIONS.dualSourceTolerancePct : 8);
    var dualGap = Math.abs(wo.warehouseQty - wo.manualReport) / wo.weight * 100;
    if (dualGap > dualTol) {
      anomalies.push({
        type: '双源不一致',
        value: dualGap.toFixed(1) + '%',
        level: dualGap > dualTol * 1.5 ? 'high' : 'medium',
        threshold: '>' + dualTol + '%',
        hint: '仓库出库 ' + wo.warehouseQty + 'kg vs 填报 ' + wo.manualReport + 'kg'
      });
    }
  }
  return anomalies;
}

// ========== 业务流转函数 ==========

// 工艺定额端：测算完成
function craftCalc(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'pending_review';
  wo.stage = 'craft';
  saveDB();
  showToast('✅ 测算完成，待复核', 'success');
  refreshCraftPage();
}

// 工艺定额端：确认下达
function craftDispatch(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'dispatched';
  wo.stage = 'workshop';
  wo.dispatchedAt = new Date().toISOString();
  saveDB();
  addAuditLog(woId, '工艺定额', '定额已下达，推送至车间管控端');
  showToast('✅ 定额已下达，推送至车间管控端', 'success');
  refreshCraftPage();
}

// 工艺定额端：驳回
function craftReject(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'pending_calc';
  saveDB();
  showToast('已驳回，返回待测算', 'warn');
  refreshCraftPage();
}

// 车间端：确认开工
function workshopStart(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'in_production';
  wo.stage = 'workshop';
  wo.startedAt = new Date().toISOString();
  saveDB();
  addAuditLog(woId, '车间管控', '已确认开工');
  showToast('✅ 已开工', 'success');
  refreshWorkshopPage();
}

// 车间端：报工（完工上报）；支持双源：定额建议 / 仓库出库 / 人工填报
function workshopComplete(woId, actualData) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.actualHours = actualData.hours;
  wo.actualSteel = actualData.steel;
  wo.actualWeld = actualData.weld;
  wo.actualOutsource = actualData.outsource || 0;
  wo.scrapRate = actualData.scrapRate;
  // 双源与进度字段（演示：可手填；B 线可接出入库/MES）
  if (actualData.systemSuggest != null) wo.systemSuggest = actualData.systemSuggest;
  else wo.systemSuggest = wo.weight;
  if (actualData.warehouseQty != null) wo.warehouseQty = actualData.warehouseQty;
  if (actualData.manualReport != null) wo.manualReport = actualData.manualReport;
  else wo.manualReport = actualData.steel;
  if (actualData.progress != null) wo.progress = actualData.progress;
  else wo.progress = 100;
  if (actualData.materialIssue != null) wo.materialIssue = actualData.materialIssue;
  else if (wo.weight && wo.warehouseQty != null) {
    wo.materialIssue = Math.round(wo.warehouseQty / wo.weight * 100);
  }
  wo.status = 'completed';
  wo.stage = 'finance';
  wo.completedAt = new Date().toISOString();
  saveDB();
  addAuditLog(woId, '车间管控', '已完工上报，推送至财务分析端（含双源对照）');
  // 自动检测异常
  var anomalies = detectAnomalies(wo);
  if (anomalies.length > 0) {
    anomalies.forEach(function(a) {
      DB.riskAlerts.push({
        id: 'RA-' + Date.now() + Math.floor(Math.random() * 100),
        woId: woId, type: a.type, value: a.value, level: a.level,
        desc: wo.project + '·' + wo.component + '·' + a.type + ' ' + a.value,
        status: 'open', createdAt: new Date().toISOString()
      });
    });
    saveDB();
    showToast('⚠️ 完工上报完成，检测到' + anomalies.length + '项异常', 'warn');
  } else {
    showToast('✅ 完工上报完成，推送至财务分析端', 'success');
  }
  refreshWorkshopPage();
}

// 财务端：过账
function financePost(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  var anomalies = detectAnomalies(wo);
  wo.status = 'posted';
  wo.stage = anomalies.length > 0 ? 'audit' : 'done';
  wo.postedAt = new Date().toISOString();
  saveDB();
  addAuditLog(woId, '财务分析', '已过账，成本归集完成' + (anomalies.length > 0 ? '，存在异常推送内审' : ''));
  if (anomalies.length > 0) {
    showToast('✅ 已过账，检测到' + anomalies.length + '项异常，推送内审追溯', 'warn');
  } else {
    showToast('✅ 已过账，成本归集完成', 'success');
  }
  refreshFinancePage();
}

// 财务端：退回
function financeReturn(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'completed';
  wo.stage = 'workshop';
  saveDB();
  showToast('已退回车间', 'warn');
  refreshFinancePage();
}

// 采购端：审批通过
function purchaseApprove(reqId) {
  var req = DB.purchaseReqs.find(function(r) { return r.id === reqId; });
  if (!req) return;
  req.status = 'approved';
  req.approvedAt = new Date().toISOString();
  saveDB();
  showToast('✅ 采购申请已审批通过', 'success');
  refreshPurchasePage();
}

// 采购端：驳回
function purchaseReject(reqId) {
  var req = DB.purchaseReqs.find(function(r) { return r.id === reqId; });
  if (!req) return;
  req.status = 'rejected';
  saveDB();
  showToast('已驳回采购申请', 'warn');
  refreshPurchasePage();
}

// 内审端：审核通过
function auditApprove(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'done';
  wo.stage = 'done';
  wo.auditedAt = new Date().toISOString();
  saveDB();
  // 关闭相关风险预警
  DB.riskAlerts.forEach(function(a) {
    if (a.woId === woId) a.status = 'closed';
  });
  saveDB();
  addAuditLog(woId, '内审追溯', '审核通过，风险闭环，流程结束');
  showToast('✅ 内审通过，风险闭环，流程结束', 'success');
  refreshAuditPage();
}

// 内审端：驳回
function auditReject(woId) {
  var wo = getWOById(woId);
  if (!wo) return;
  wo.status = 'posted';
  wo.stage = 'finance';
  saveDB();
  addAuditLog(woId, '内审追溯', '内审驳回，退回财务');
  showToast('已驳回，退回财务', 'warn');
  refreshAuditPage();
}

// 现场端：提交上报
function siteSubmit(data) {
  showToast('✅ 现场数据已提交', 'success');
  refreshSitePage();
}

// 审计日志
function addAuditLog(woId, dept, action) {
  DB.auditLogs.push({
    id: 'AL-' + Date.now(),
    woId: woId, dept: dept, action: action,
    operator: '当前用户', time: new Date().toISOString()
  });
  saveDB();
}

// ========== 页面刷新函数（各页面覆盖实现） ==========
function refreshCraftPage() { if (typeof renderCraft === 'function') renderCraft(); }
function refreshWorkshopPage() { if (typeof renderWorkshop === 'function') renderWorkshop(); }
function refreshFinancePage() { if (typeof renderFinance === 'function') renderFinance(); }
function refreshPurchasePage() { if (typeof renderPurchase === 'function') renderPurchase(); }
function refreshAuditPage() { if (typeof renderAudit === 'function') renderAudit(); }
function refreshSitePage() { if (typeof renderSite === 'function') renderSite(); }

// ========== 在制订单演示样本（看板 / 财务端共用） ==========
// 偏离度 = 领料进度 − 生产完成度；阈值读参数包（默认关注 10% / 异常 15%）
var ORDER_DEMO = [
  { id: 'ORD-001', name: 'ZZ钢铁除尘EPC', budget: 860, actual: 705, progress: 72, material: 78 },
  { id: 'ORD-002', name: 'XX电厂脱硫改造', budget: 520, actual: 410, progress: 60, material: 78 },
  { id: 'ORD-003', name: 'YY垃圾焚烧二期', budget: 380, actual: 268, progress: 65, material: 62 },
  { id: 'ORD-004', name: 'CC化工VOCs治理', budget: 450, actual: 312, progress: 55, material: 70 },
  { id: 'ORD-005', name: 'AA危废资源化', budget: 680, actual: 420, progress: 48, material: 52 }
];

var ORDER_DEV_WATCH = (typeof COST_ASSUMPTIONS !== 'undefined' ? COST_ASSUMPTIONS.progressMaterialWatch : 10);
var ORDER_DEV_BAD = (typeof COST_ASSUMPTIONS !== 'undefined' ? COST_ASSUMPTIONS.progressMaterialBad : 15);

function getAssumptionLabel() {
  return (typeof COST_ASSUMPTIONS !== 'undefined' && COST_ASSUMPTIONS.label)
    ? COST_ASSUMPTIONS.label
    : '演示假设';
}

function getMethodStackHtml() {
  return '<div style="font-size:11px;color:var(--gray-600);line-height:1.7;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:12px">' +
    '<strong style="color:var(--gray-800)">方法组合：</strong>' +
    '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;background:#eff6ff;border-radius:4px;color:#1e40af">目标成本（容许成本·前端约束）</span>' +
    '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;background:#f0fdf4;border-radius:4px;color:#166534">TDABC/作业动因（计量分摊）</span>' +
    '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;background:#fff7ed;border-radius:4px;color:#c2410c">标准–实际差异（事中纠偏）</span>' +
    '<div style="margin-top:6px;color:var(--gray-400)">参数来源：' + getAssumptionLabel() + '</div></div>';
}

/** 看板用：产量驱动单位成本示意（固定样例构件） */
function getSeasonalDriverDemo() {
  var params = { weight: 1250, complexity: 3, process: 6, steelPrice: 4200 };
  var hours = estimateHours({ weight: 1250, materialCoef: 1.15, complexity: 3, process: 6, batch: 4 });
  return compareSeasonalUnitCost(params, hours);
}

function orderDeviation(o) {
  return Math.round((o.material - o.progress) * 10) / 10;
}

function orderCostRate(o) {
  return Math.round((o.actual / o.budget) * 1000) / 10;
}

function orderStatus(o) {
  var d = Math.abs(orderDeviation(o));
  if (d >= ORDER_DEV_BAD) return '异常';
  if (d > ORDER_DEV_WATCH) return '关注';
  return '可控';
}

function orderStatusClass(status) {
  if (status === '异常') return 'status-bad';
  if (status === '关注') return 'status-watch';
  return 'status-ok';
}

function orderDevClass(o) {
  var d = Math.abs(orderDeviation(o));
  if (d >= ORDER_DEV_BAD) return 'dev-bad';
  if (d > ORDER_DEV_WATCH) return 'dev-watch';
  return 'dev-ok';
}

function getOrderKpis() {
  var totalBudget = 0, totalActual = 0, sumProgress = 0, bad = 0, watch = 0;
  ORDER_DEMO.forEach(function(o) {
    totalBudget += o.budget;
    totalActual += o.actual;
    sumProgress += o.progress;
    var st = orderStatus(o);
    if (st === '异常') bad++;
    else if (st === '关注') watch++;
  });
  return {
    orderCount: ORDER_DEMO.length,
    totalBudget: totalBudget,
    totalActual: totalActual,
    costRate: Math.round((totalActual / totalBudget) * 1000) / 10,
    avgProgress: Math.round(sumProgress / ORDER_DEMO.length),
    badCount: bad,
    watchCount: watch,
    alertCount: bad + watch
  };
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderOrderTableHtml() {
  var html = '<table class="role-table"><thead><tr>' +
    '<th>订单/项目</th><th>预算(万)</th><th>已归集(万)</th><th>成本消耗率</th>' +
    '<th>生产完成度</th><th>领料进度</th><th>偏离度</th><th>状态</th><th></th>' +
    '</tr></thead><tbody>';
  ORDER_DEMO.forEach(function(o) {
    var rate = orderCostRate(o);
    var dev = orderDeviation(o);
    var st = orderStatus(o);
    var devStr = (dev > 0 ? '+' : '') + dev + '%';
    html += '<tr class="order-row-clickable" data-ord-id="' + escapeHtml(o.id) + '" title="查看订单详情">' +
      '<td><strong>' + escapeHtml(o.name) + '</strong><div style="font-size:10px;color:var(--gray-400)">' + escapeHtml(o.id) + '</div></td>' +
      '<td>' + o.budget + '</td>' +
      '<td>' + o.actual + '</td>' +
      '<td>' + rate + '%</td>' +
      '<td>' + o.progress + '%</td>' +
      '<td>' + o.material + '%</td>' +
      '<td class="' + orderDevClass(o) + '">' + devStr + '</td>' +
      '<td><span class="status-pill ' + orderStatusClass(st) + '">' + st + '</span></td>' +
      '<td><button type="button" class="btn-sm primary od-open-btn" data-ord-id="' + escapeHtml(o.id) + '">详情</button></td>' +
      '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// ========== 订单详情抽屉（看板 / 财务共用） ==========
/** 演示补种子：DB 中同项目 WO 不足时合并，保证路演每单都能展开多部件 */
var ORDER_PARTS_DEMO = {
  'ORD-001': [
    { id: 'WO-D001-01', project: 'ZZ钢铁除尘EPC', component: '灰斗组件', material: 'Q235B', weight: 980, thickness: 10, weldLength: 14.2, holes: 20, complexity: 3, process: 5, batch: 4, estHours: 36.0, status: 'in_production', actualHours: 28, progress: 68, materialIssue: 80 },
    { id: 'WO-D001-02', project: 'ZZ钢铁除尘EPC', component: '支撑梁', material: 'Q345B', weight: 540, thickness: 12, weldLength: 8.0, holes: 16, complexity: 2, process: 4, batch: 6, estHours: 18.2, status: 'dispatched', progress: 12, materialIssue: 22 }
  ],
  'ORD-002': [
    { id: 'WO-D002-01', project: 'XX电厂脱硫改造', component: '吸收塔段节', material: 'Q345R', weight: 2400, thickness: 18, weldLength: 32.0, holes: 36, complexity: 4, process: 7, batch: 2, estHours: 78.5, status: 'in_production', actualHours: 52, progress: 58, materialIssue: 76, warehouseQty: 2550, manualReport: 2280, systemSuggest: 2400 },
    { id: 'WO-D002-02', project: 'XX电厂脱硫改造', component: '浆液循环管', material: '2205双相钢', weight: 420, thickness: 8, weldLength: 11.5, holes: 12, complexity: 3, process: 5, batch: 8, estHours: 22.0, status: 'dispatched', progress: 8, materialIssue: 30 }
  ],
  'ORD-003': [
    { id: 'WO-D003-01', project: 'YY垃圾焚烧二期', component: '炉排侧梁', material: 'Q355B', weight: 760, thickness: 14, weldLength: 10.8, holes: 18, complexity: 3, process: 5, batch: 4, estHours: 28.4, status: 'in_production', actualHours: 20, progress: 62, materialIssue: 60 },
    { id: 'WO-D003-02', project: 'YY垃圾焚烧二期', component: '风箱壳体', material: 'Q235B', weight: 1100, thickness: 10, weldLength: 16.0, holes: 24, complexity: 2, process: 5, batch: 3, estHours: 34.0, status: 'pending_review', progress: 5, materialIssue: 8 }
  ],
  'ORD-004': [
    { id: 'WO-D004-01', project: 'CC化工VOCs治理', component: '活性炭箱体', material: 'Q235B', weight: 1320, thickness: 8, weldLength: 19.5, holes: 40, complexity: 3, process: 6, batch: 3, estHours: 41.0, status: 'in_production', actualHours: 26, progress: 48, materialIssue: 72 },
    { id: 'WO-D004-02', project: 'CC化工VOCs治理', component: '风机底座', material: 'Q355B', weight: 380, thickness: 16, weldLength: 5.2, holes: 8, complexity: 2, process: 3, batch: 10, estHours: 11.5, status: 'dispatched', progress: 10, materialIssue: 18 }
  ],
  'ORD-005': [
    { id: 'WO-D005-01', project: 'AA危废资源化', component: '冷凝器壳体', material: '316L', weight: 920, thickness: 12, weldLength: 15.6, holes: 20, complexity: 4, process: 7, batch: 2, estHours: 48.0, status: 'in_production', actualHours: 30, progress: 45, materialIssue: 50 },
    { id: 'WO-D005-02', project: 'AA危废资源化', component: '管道支架组', material: 'Q235B', weight: 460, thickness: 8, weldLength: 7.8, holes: 28, complexity: 2, process: 4, batch: 12, estHours: 14.2, status: 'dispatched', progress: 15, materialIssue: 20 }
  ]
};

function getOrderById(id) {
  return ORDER_DEMO.find(function(o) { return o.id === id; });
}

function getWOsForOrder(o) {
  if (!o) return [];
  var fromDb = DB.workOrders.filter(function(w) { return w.project === o.name; });
  var demo = ORDER_PARTS_DEMO[o.id] || [];
  var seenId = {};
  var seenComp = {};
  var out = [];
  fromDb.forEach(function(w) {
    out.push(w);
    seenId[w.id] = true;
    if (w.component) seenComp[w.component] = true;
  });
  demo.forEach(function(w) {
    if (seenId[w.id] || (w.component && seenComp[w.component])) return;
    out.push(w);
  });
  return out;
}

function woStatusLabel(status) {
  var map = {
    pending_calc: '待测算', pending_review: '待复核', dispatched: '已下达',
    in_production: '生产中', completed: '已完工', posted: '已过账', done: '已结案'
  };
  return map[status] || (status || '—');
}

function partProgressPct(wo) {
  if (wo.progress != null) return Math.round(wo.progress);
  if (wo.actualHours != null && wo.estHours) {
    return Math.min(100, Math.round(wo.actualHours / wo.estHours * 100));
  }
  var map = { posted: 100, done: 100, completed: 100, in_production: 55, dispatched: 15, pending_review: 5, pending_calc: 0 };
  return map[wo.status] != null ? map[wo.status] : 0;
}

function partCostOf(wo) {
  var hours = wo.estHours != null ? wo.estHours : estimateHours({
    weight: wo.weight || 0,
    complexity: wo.complexity || 3,
    process: wo.process || 6,
    batch: wo.batch || 1,
    materialCoef: 1.0
  });
  return estimateCost({
    weight: wo.weight || 0,
    complexity: wo.complexity || 3,
    process: wo.process || 6,
    steelPrice: wo.steelPrice
  }, hours);
}

function aggregateOrderCost(wos) {
  var steel = 0, labor = 0, fixedShare = 0, other = 0, total = 0;
  wos.forEach(function(w) {
    var c = partCostOf(w);
    steel += c.steel;
    labor += c.labor;
    fixedShare += c.fixedShare;
    other += (c.outsource || 0) + (c.equip || 0) + (c.coating || 0) + (c.install || 0);
    total += c.total;
  });
  return { steel: steel, labor: labor, fixedShare: fixedShare, other: other, total: total };
}

function ensureOrderDrawer() {
  if (document.getElementById('orderDetailMask')) return;
  var mask = document.createElement('div');
  mask.id = 'orderDetailMask';
  mask.className = 'order-drawer-mask';
  mask.addEventListener('click', function(e) { if (e.target === mask) closeOrderDetail(); });
  var drawer = document.createElement('aside');
  drawer.className = 'order-drawer';
  drawer.id = 'orderDetailDrawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'odTitle');
  drawer.addEventListener('click', function(e) { e.stopPropagation(); });
  drawer.innerHTML =
    '<div class="order-drawer-head">' +
      '<div><div class="order-drawer-title" id="odTitle">订单详情</div>' +
      '<div class="order-drawer-sub" id="odSub"></div></div>' +
      '<button type="button" class="order-drawer-close" id="odCloseBtn" aria-label="关闭">×</button>' +
    '</div>' +
    '<div class="order-drawer-body" id="odBody"></div>';
  mask.appendChild(drawer);
  document.body.appendChild(mask);
  document.getElementById('odCloseBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    closeOrderDetail();
  });
  if (!window._orderDrawerEscBound) {
    window._orderDrawerEscBound = true;
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeOrderDetail();
    });
  }
}

function closeOrderDetail() {
  var mask = document.getElementById('orderDetailMask');
  if (!mask) return;
  mask.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleOrderPart(idx) {
  var row = document.getElementById('od-part-' + idx);
  if (!row) return;
  row.classList.toggle('open');
}

function openOrderDetail(ordId) {
  try {
    _openOrderDetailImpl(ordId);
  } catch (err) {
    console.error('[智衡云] openOrderDetail failed', err);
    showToast('打开订单详情失败：' + (err && err.message ? err.message : err), 'error');
  }
}

function _openOrderDetailImpl(ordId) {
  var o = getOrderById(ordId);
  if (!o) {
    showToast('未找到订单 ' + ordId, 'warn');
    return;
  }
  ensureOrderDrawer();
  var wos = getWOsForOrder(o);
  var cost = aggregateOrderCost(wos);
  var st = orderStatus(o);
  var dev = orderDeviation(o);
  var rate = orderCostRate(o);
  var layerSum = cost.steel + cost.labor + cost.fixedShare + cost.other;
  var pct = function(n) { return layerSum > 0 ? Math.round(n / layerSum * 1000) / 10 : 0; };
  var totalWan = Math.round(cost.total / 100) / 100;

  document.getElementById('odTitle').textContent = o.name;
  document.getElementById('odSub').innerHTML =
    escapeHtml(o.id) + ' · <span class="status-pill ' + orderStatusClass(st) + '">' + st + '</span>' +
    ' · 部件 ' + wos.length + ' 件';

  var html = '';
  html += '<div class="od-kpi-grid">' +
    '<div class="od-kpi"><div class="od-kpi-label">预算</div><div class="od-kpi-val">' + o.budget + '<span>万</span></div></div>' +
    '<div class="od-kpi"><div class="od-kpi-label">已归集</div><div class="od-kpi-val">' + o.actual + '<span>万</span></div></div>' +
    '<div class="od-kpi"><div class="od-kpi-label">成本消耗率</div><div class="od-kpi-val">' + rate + '<span>%</span></div></div>' +
    '<div class="od-kpi"><div class="od-kpi-label">生产完成度</div><div class="od-kpi-val">' + o.progress + '<span>%</span></div></div>' +
    '<div class="od-kpi"><div class="od-kpi-label">领料进度</div><div class="od-kpi-val">' + o.material + '<span>%</span></div></div>' +
    '<div class="od-kpi"><div class="od-kpi-label">偏离度</div><div class="od-kpi-val ' + orderDevClass(o) + '">' +
      (dev > 0 ? '+' : '') + dev + '<span>%</span></div></div>' +
    '</div>';

  html += '<div class="od-section-title">料 · 工 · 费（部件测算合计）</div>';
  html += '<div class="od-cost-row od-cost-row-4">' +
    '<div class="od-cost-card"><div class="od-cost-name">料（直接材料）</div><div class="od-cost-amt">' + fmtMoney(cost.steel) +
      '</div><div class="od-cost-pct">' + pct(cost.steel) + '%</div></div>' +
    '<div class="od-cost-card"><div class="od-cost-name">工（直接人工）</div><div class="od-cost-amt">' + fmtMoney(cost.labor) +
      '</div><div class="od-cost-pct">' + pct(cost.labor) + '%</div></div>' +
    '<div class="od-cost-card"><div class="od-cost-name">费（固定分摊）</div><div class="od-cost-amt">' + fmtMoney(cost.fixedShare) +
      '</div><div class="od-cost-pct">' + pct(cost.fixedShare) + '%</div></div>' +
    '<div class="od-cost-card"><div class="od-cost-name">其他（外协等）</div><div class="od-cost-amt">' + fmtMoney(cost.other) +
      '</div><div class="od-cost-pct">' + pct(cost.other) + '%</div></div>' +
    '</div>';
  html += '<div class="od-cost-note">部件测算合计 ' + fmtMoney(cost.total) +
    '（约 ' + totalWan + ' 万），仅覆盖当前关联部件定额测算，与上方「已归集」订单财务口径不同。</div>';

  html += '<div class="od-section-title">涉及部件</div>';
  if (wos.length === 0) {
    html += '<div class="od-empty">暂无关联工单</div>';
  } else {
    html += '<table class="role-table od-part-table"><thead><tr>' +
      '<th>部件</th><th>规格</th><th>状态</th><th>进度</th><th>料</th><th>工</th><th>费</th><th></th>' +
      '</tr></thead><tbody>';
    wos.forEach(function(w, idx) {
      var c = partCostOf(w);
      var pp = partProgressPct(w);
      html += '<tr class="od-part-row" data-part-idx="' + idx + '">' +
        '<td><strong>' + escapeHtml(w.component || '—') + '</strong><div class="od-muted">' + escapeHtml(w.id) + '</div></td>' +
        '<td>' + escapeHtml(w.material || '—') + ' · ' + (w.weight || 0) + 'kg</td>' +
        '<td>' + escapeHtml(woStatusLabel(w.status)) + '</td>' +
        '<td><div class="od-prog"><div class="od-prog-bar" style="width:' + pp + '%"></div></div>' + pp + '%</td>' +
        '<td>' + fmtMoney(c.steel) + '</td>' +
        '<td>' + fmtMoney(c.labor) + '</td>' +
        '<td>' + fmtMoney(c.fixedShare) + '</td>' +
        '<td class="od-expand-hint">明细</td></tr>';
      html += '<tr class="od-part-detail" id="od-part-' + idx + '"><td colspan="8">' +
        '<div class="od-part-detail-inner">' +
        '料 ' + fmtMoney(c.steel) + ' · 工 ' + fmtMoney(c.labor) + '（¥' + c.laborRate + '/h） · 费(固定分摊) ' + fmtMoney(c.fixedShare) +
        ' · 外协 ' + fmtMoney(c.outsource) + ' · 合计 <strong>' + fmtMoney(c.total) + '</strong>' +
        (w.materialIssue != null ? '<br>领料进度 ' + w.materialIssue + '%' : '') +
        (w.warehouseQty != null ? ' · 双源：仓库 ' + w.warehouseQty + 'kg / 填报 ' + (w.manualReport || '—') + 'kg' : '') +
        '</div></td></tr>';
    });
    html += '</tbody></table>';
  }

  html += '<div class="od-section-title">异常 / 预警</div>';
  var alerts = [];
  var seenAlert = {};
  if (orderStatus(o) !== '可控') {
    alerts.push({
      level: st === '异常' ? 'high' : 'medium',
      title: '订单进度领料偏离',
      desc: '领料 ' + o.material + '% − 完成度 ' + o.progress + '% = ' + (dev > 0 ? '+' : '') + dev + '%'
    });
    seenAlert['进度领料偏离'] = true;
  }
  wos.forEach(function(w) {
    detectAnomalies(w).forEach(function(a) {
      if (a.type === '进度领料偏离' && seenAlert['进度领料偏离']) return;
      var key = a.type + '|' + (w.component || w.id) + '|' + a.value;
      if (seenAlert[key]) return;
      seenAlert[key] = true;
      alerts.push({
        level: a.level,
        title: (w.component || w.id) + ' · ' + a.type,
        desc: a.value + (a.hint ? ' · ' + a.hint : '') + (a.threshold ? '（阈值 ' + a.threshold + '）' : '')
      });
    });
  });
  if (alerts.length === 0) {
    html += '<div class="od-empty">当前无异常</div>';
  } else {
    alerts.forEach(function(a) {
      html += '<div class="od-alert ' + (a.level === 'high' ? 'high' : 'mid') + '">' +
        '<div class="od-alert-title">' + escapeHtml(a.title) + '</div>' +
        '<div class="od-alert-desc">' + escapeHtml(a.desc) + '</div></div>';
    });
  }

  var odBody = document.getElementById('odBody');
  var mask = document.getElementById('orderDetailMask');
  if (!odBody || !mask) {
    throw new Error('抽屉 DOM 未就绪');
  }
  odBody.innerHTML = html;
  mask.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/** 事件委托：行 / 详情按钮 / 预警卡片 → 打开订单；部件行 → 展开明细 */
function bindOrderDetailClicks() {
  if (window._orderDetailClickBound) return;
  window._orderDetailClickBound = true;
  document.addEventListener('click', function(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var partRow = t.closest('.od-part-row[data-part-idx]');
    if (partRow) {
      e.preventDefault();
      toggleOrderPart(partRow.getAttribute('data-part-idx'));
      return;
    }
    var ordEl = t.closest('[data-ord-id]');
    if (ordEl) {
      var oid = ordEl.getAttribute('data-ord-id');
      if (oid) {
        e.preventDefault();
        openOrderDetail(oid);
      }
    }
  });
}

bindOrderDetailClicks();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindOrderDetailClicks);
} else {
  bindOrderDetailClicks();
}

console.log('[智衡云] 共享数据层已加载，工单数量：' + DB.workOrders.length);

// ========== 角色清单 + 右上角切换（企业财务台常见交互） ==========
var ROLE_MENU = [
  { id: 'home', name: '企业管理', short: '企', href: 'index.html', tag: '总览' },
  { id: 'finance', name: '财务', short: '财', href: 'finance.html', tag: '核算' },
  { id: 'craft', name: '工艺定额', short: '定', href: 'craft.html', tag: '事前' },
  { id: 'workshop', name: '车间', short: '车', href: 'workshop.html', tag: '事中' },
  { id: 'purchase', name: '采购', short: '采', href: 'purchase.html', tag: '事中' },
  { id: 'audit', name: '内审', short: '审', href: 'audit.html', tag: '事后' },
  { id: 'site', name: '现场', short: '现', href: 'site.html', tag: '现场' }
];

function detectCurrentRoleId() {
  var path = (location.pathname || '').split('/').pop() || 'index.html';
  if (path === '' || path === 'index.html') return 'home';
  for (var i = 0; i < ROLE_MENU.length; i++) {
    if (ROLE_MENU[i].href === path) return ROLE_MENU[i].id;
  }
  return 'home';
}

function getRoleById(id) {
  for (var i = 0; i < ROLE_MENU.length; i++) {
    if (ROLE_MENU[i].id === id) return ROLE_MENU[i];
  }
  return ROLE_MENU[0];
}

function renderRoleSwitcherHtml(currentId) {
  var curId = currentId || detectCurrentRoleId();
  var html = '<div class="role-panel-box" id="roleSwitcher" title="切换业务角色">' +
    '<span class="role-panel-label">角色</span>' +
    '<div class="role-panel-list">';
  ROLE_MENU.forEach(function(r) {
    var cls = r.id === curId ? 'role-pill current' : 'role-pill';
    html += '<a class="' + cls + '" href="' + r.href + '" title="' + r.name + '"><i class="role-pill-ico">' + r.short + '</i>' + r.name + '</a>';
  });
  html += '</div></div>';
  return html;
}

function toggleRoleSwitcher(e) {
  /* 角色板块为平铺切换，无需下拉 */
  if (e) e.stopPropagation();
}

function mountRoleSwitcher(targetSelector, currentId) {
  var box = typeof targetSelector === 'string'
    ? document.querySelector(targetSelector)
    : targetSelector;
  if (!box) return;
  box.innerHTML = renderRoleSwitcherHtml(currentId);
}

document.addEventListener('DOMContentLoaded', function() {
  var slot = document.getElementById('roleSwitcherSlot');
  if (slot) mountRoleSwitcher(slot, slot.getAttribute('data-role') || detectCurrentRoleId());
});
