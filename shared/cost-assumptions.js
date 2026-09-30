/* ============================================================
 * 智衡云 · 成本假设参数包（演示默认 / 企业脱敏可整包替换）
 * 替换说明：企业提供月产量、年固定费用、工时单价档后，
 * 只改本文件数值，算法层无需改动。
 * source: 'demo' | 'enterprise'
 * ============================================================ */
var COST_ASSUMPTIONS = {
  source: 'demo',
  label: '演示假设（调研场景模拟，非企业台账原值）',

  // 年固定费用池（元）：折旧 + 水电 + 房租等制造费用大类
  annualFixedCost: 4800000,

  // 月产量/在制量（吨）——淡季 1–2，旺季 5–8（朱总建议的产量驱动假设）
  monthlyVolumeTons: {
    1: 180, 2: 160, 3: 220, 4: 260,
    5: 340, 6: 360, 7: 350, 8: 330,
    9: 280, 10: 250, 11: 230, 12: 200
  },

  // 工序工时单价档（元/小时）：按作业复杂度
  laborRateByComplexity: {
    1: 5, 2: 8, 3: 12, 4: 16, 5: 20
  },
  defaultLaborRate: 12,

  // 进度–领料偏离容忍带（%）
  progressMaterialWatch: 10,
  progressMaterialBad: 15,

  // 双源不一致容忍（出库 vs 填报，相对定额建议量的百分比）
  dualSourceTolerancePct: 8,

  // 默认废料率假设（%）
  defaultScrapRate: 8,

  // 钢材参考价（元/吨）——可被企业采购价替换
  defaultSteelPricePerTon: 4200
};

/** 当月固定费用（元）= 年池 / 12 */
function getMonthlyFixedCost() {
  return Math.round((COST_ASSUMPTIONS.annualFixedCost || 0) / 12);
}

/** 指定月份在制/产量（吨） */
function getMonthVolumeTons(month) {
  var m = month || (new Date().getMonth() + 1);
  var map = COST_ASSUMPTIONS.monthlyVolumeTons || {};
  return map[m] || map[9] || 280;
}

/** 按复杂度取工时单价 */
function getLaborRate(complexity) {
  var c = Math.max(1, Math.min(5, Math.round(complexity || 3)));
  var rates = COST_ASSUMPTIONS.laborRateByComplexity || {};
  return rates[c] != null ? rates[c] : (COST_ASSUMPTIONS.defaultLaborRate || 12);
}
