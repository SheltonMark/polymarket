const ADMIN_CREDENTIAL = {
  username: "admin",
  password: "admin123456",
};

const state = {
  isLogin: false,
  hasBoundAdminEvents: false,
  usersCount: 1284,
  siteConfig: {
    brandSubtitle: "Digital Asset Workspace",
    homeChip: "平台说明",
    homeTitle: "稳定、清晰、可追踪的数字资产操作台",
    homeDesc: "提供账户总览、订单操作、资金申请与记录查询。",
    payDigitalAddress: "TRON-TX5V8ZVQ2FJ3L8KM9P6S1N4Q7R2W0YH8J",
    payBankName: "招商银行",
    payBankAccountName: "平台结算账户",
    payBankAccountNo: "6225 8888 7766 1098",
    payBankBranch: "深圳南山支行",
    agreementText:
      "【用户协议】\n1. 用户在注册前应完整阅读并同意本协议条款。\n2. 用户需确保提交信息真实、有效、可核验。\n3. 平台有权依据风控规则进行必要审核。",
  },
  orderConfig: {
    defaultMinRate: 3.0,
    defaultMaxRate: 5.0,
    templates: [
      { id: "tpl_001", name: "Prime Growth", minAmount: 120, durationHour: 1, useCustomRange: false, minRate: 0, maxRate: 0 },
      { id: "tpl_002", name: "Event Alpha", minAmount: 220, durationHour: 3, useCustomRange: true, minRate: 3.8, maxRate: 5.2 },
      { id: "tpl_003", name: "Momentum Core", minAmount: 360, durationHour: 6, useCustomRange: false, minRate: 0, maxRate: 0 },
    ],
  },
  deposits: [
    { id: "dep_001", user: "sunny168", amount: 200, method: "数字地址", voucher: "TX-93A8F2", time: "2026-04-11 11:05:22", status: "pending" },
    { id: "dep_002", user: "mark09", amount: 500, method: "银行卡", voucher: "BANK-20260411-02", time: "2026-04-11 10:40:19", status: "pending" },
  ],
  withdraws: [
    { id: "wd_001", user: "sunny168", amount: 120, method: "银行卡", target: "招商银行 / ****1098", time: "2026-04-11 11:16:30", status: "pending" },
    { id: "wd_002", user: "haku11", amount: 80, method: "数字地址", target: "TRON-******9Q2M", time: "2026-04-11 10:22:10", status: "pending" },
  ],
};

let toastTimer = null;

function q(selector) {
  return document.querySelector(selector);
}

function qq(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function showToast(message, isError = false) {
  const toast = q("#toast");
  toast.textContent = message;
  toast.style.background = isError ? "rgba(106, 34, 34, 0.92)" : "rgba(23, 36, 78, 0.92)";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateSegmentIndicator(container, selector, indicator) {
  if (!container || !indicator) return;
  const active = container.querySelector(selector);
  if (!active) return;
  const cRect = container.getBoundingClientRect();
  const aRect = active.getBoundingClientRect();
  indicator.style.width = `${aRect.width}px`;
  indicator.style.transform = `translateX(${aRect.left - cRect.left}px)`;
}

function refreshNavIndicator() {
  updateSegmentIndicator(q("#mainNav"), ".nav-btn.active", q("#segmentIndicator"));
}

function switchSection(id) {
  qq(".section").forEach((section) => section.classList.toggle("active", section.id === id));
  qq(".nav-btn[data-section]").forEach((btn) => btn.classList.toggle("active", btn.dataset.section === id));
  refreshNavIndicator();
}

function bindMainNav() {
  qq(".nav-btn[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
  });
  qq("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => switchSection(btn.dataset.jump));
  });
}

function pendingDepositCount() {
  return state.deposits.filter((item) => item.status === "pending").length;
}

function pendingWithdrawCount() {
  return state.withdraws.filter((item) => item.status === "pending").length;
}

function updateMetrics() {
  q("#metricDeposits").textContent = String(pendingDepositCount());
  q("#metricWithdraws").textContent = String(pendingWithdrawCount());
  q("#metricProducts").textContent = String(state.orderConfig.templates.length);
  q("#metricUsers").textContent = String(state.usersCount);
}

function renderPendingList() {
  const list = q("#pendingList");
  list.innerHTML = `
    <li>待审核充值：${pendingDepositCount()} 笔</li>
    <li>待审核提现：${pendingWithdrawCount()} 笔</li>
    <li>可用订单模板：${state.orderConfig.templates.length} 个</li>
  `;
}

function fillSiteConfigForm() {
  q("#brandSubtitle").value = state.siteConfig.brandSubtitle;
  q("#homeChip").value = state.siteConfig.homeChip;
  q("#homeTitle").value = state.siteConfig.homeTitle;
  q("#homeDesc").value = state.siteConfig.homeDesc;
  q("#payDigitalAddress").value = state.siteConfig.payDigitalAddress;
  q("#payBankName").value = state.siteConfig.payBankName;
  q("#payBankAccountName").value = state.siteConfig.payBankAccountName;
  q("#payBankAccountNo").value = state.siteConfig.payBankAccountNo;
  q("#payBankBranch").value = state.siteConfig.payBankBranch;
  q("#agreementText").value = state.siteConfig.agreementText;
}

function bindSiteConfigForm() {
  q("#siteConfigForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.siteConfig = {
      brandSubtitle: q("#brandSubtitle").value.trim(),
      homeChip: q("#homeChip").value.trim(),
      homeTitle: q("#homeTitle").value.trim(),
      homeDesc: q("#homeDesc").value.trim(),
      payDigitalAddress: q("#payDigitalAddress").value.trim(),
      payBankName: q("#payBankName").value.trim(),
      payBankAccountName: q("#payBankAccountName").value.trim(),
      payBankAccountNo: q("#payBankAccountNo").value.trim(),
      payBankBranch: q("#payBankBranch").value.trim(),
      agreementText: q("#agreementText").value,
    };
    showToast("站点配置已保存");
  });
}

function refreshOrderConfigPanel() {
  q("#defaultMinRate").value = String(state.orderConfig.defaultMinRate);
  q("#defaultMaxRate").value = String(state.orderConfig.defaultMaxRate);
  renderOrderConfigList();
}

function renderOrderConfigList() {
  const root = q("#orderConfigList");
  root.innerHTML = "";
  state.orderConfig.templates.forEach((tpl) => {
    const item = document.createElement("article");
    item.className = "order-config-item";
    item.innerHTML = `
      <div class="field-row">
        <div class="field">
          <label>模板名称</label>
          <input data-oc-id="${tpl.id}" data-field="name" type="text" value="${tpl.name}" />
        </div>
        <div class="field">
          <label>起投金额</label>
          <input data-oc-id="${tpl.id}" data-field="minAmount" type="number" min="0" step="1" value="${tpl.minAmount}" />
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>订单周期（小时）</label>
          <input data-oc-id="${tpl.id}" data-field="durationHour" type="number" min="1" step="1" value="${tpl.durationHour}" />
        </div>
        <div class="field">
          <label class="check-row">
            <input data-oc-id="${tpl.id}" data-field="useCustomRange" type="checkbox" ${tpl.useCustomRange ? "checked" : ""} />
            <span>启用独立收益区间</span>
          </label>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>独立最小收益率 (%)</label>
          <input data-oc-id="${tpl.id}" data-field="minRate" type="number" min="0" step="0.01" value="${tpl.minRate}" ${tpl.useCustomRange ? "" : "disabled"} />
        </div>
        <div class="field">
          <label>独立最大收益率 (%)</label>
          <input data-oc-id="${tpl.id}" data-field="maxRate" type="number" min="0" step="0.01" value="${tpl.maxRate}" ${tpl.useCustomRange ? "" : "disabled"} />
        </div>
      </div>
    `;
    root.appendChild(item);
  });

  qq("[data-oc-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const tpl = state.orderConfig.templates.find((it) => it.id === input.dataset.ocId);
      if (!tpl) return;
      const field = input.dataset.field;
      if (field === "useCustomRange") {
        tpl.useCustomRange = input.checked;
        renderOrderConfigList();
        return;
      }
      if (field === "name") tpl.name = input.value;
      if (field === "minAmount") tpl.minAmount = Number(input.value || 0);
      if (field === "durationHour") tpl.durationHour = Number(input.value || 1);
      if (field === "minRate") tpl.minRate = Number(input.value || 0);
      if (field === "maxRate") tpl.maxRate = Number(input.value || 0);
    });
  });
}

function bindOrderConfig() {
  q("#addOrderTemplateBtn").addEventListener("click", () => {
    const id = `tpl_${Date.now()}`;
    state.orderConfig.templates.push({
      id,
      name: "新订单模板",
      minAmount: 100,
      durationHour: 1,
      useCustomRange: false,
      minRate: 0,
      maxRate: 0,
    });
    renderOrderConfigList();
    updateMetrics();
    renderPendingList();
  });

  q("#saveOrderConfigBtn").addEventListener("click", () => {
    const min = Number(q("#defaultMinRate").value || 0);
    const max = Number(q("#defaultMaxRate").value || 0);
    if (min > max) {
      showToast("全局区间配置不合法", true);
      return;
    }
    state.orderConfig.defaultMinRate = min;
    state.orderConfig.defaultMaxRate = max;
    showToast("订单配置已保存");
  });
}

function renderDepositTable() {
  const body = q("#depositTableBody");
  body.innerHTML = "";
  state.deposits.forEach((item) => {
    const tr = document.createElement("tr");
    const statusText = item.status === "pending" ? "待审核" : item.status === "done" ? "已通过" : "已驳回";
    tr.innerHTML = `
      <td>${item.user}</td>
      <td>$${item.amount.toFixed(2)}</td>
      <td>${item.method}</td>
      <td>${item.voucher}</td>
      <td>${item.time}</td>
      <td><span class="status ${item.status}">${statusText}</span></td>
      <td>
        <button class="btn ghost sm" data-deposit-action="approve" data-id="${item.id}">通过</button>
        <button class="btn ghost sm" data-deposit-action="reject" data-id="${item.id}">驳回</button>
      </td>
    `;
    body.appendChild(tr);
  });

  qq("[data-deposit-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = state.deposits.find((it) => it.id === btn.dataset.id);
      if (!row || row.status !== "pending") return;
      row.status = btn.dataset.depositAction === "approve" ? "done" : "rejected";
      renderDepositTable();
      updateMetrics();
      renderPendingList();
      showToast(`充值申请已${row.status === "done" ? "通过" : "驳回"}`);
    });
  });
}

function renderWithdrawTable() {
  const body = q("#withdrawTableBody");
  body.innerHTML = "";
  state.withdraws.forEach((item) => {
    const tr = document.createElement("tr");
    const statusText = item.status === "pending" ? "待审核" : item.status === "done" ? "已通过" : "已驳回";
    tr.innerHTML = `
      <td>${item.user}</td>
      <td>$${item.amount.toFixed(2)}</td>
      <td>${item.method}</td>
      <td>${item.target}</td>
      <td>${item.time}</td>
      <td><span class="status ${item.status}">${statusText}</span></td>
      <td>
        <button class="btn ghost sm" data-withdraw-action="approve" data-id="${item.id}">通过</button>
        <button class="btn ghost sm" data-withdraw-action="reject" data-id="${item.id}">驳回</button>
      </td>
    `;
    body.appendChild(tr);
  });

  qq("[data-withdraw-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = state.withdraws.find((it) => it.id === btn.dataset.id);
      if (!row || row.status !== "pending") return;
      row.status = btn.dataset.withdrawAction === "approve" ? "done" : "rejected";
      renderWithdrawTable();
      updateMetrics();
      renderPendingList();
      showToast(`提现申请已${row.status === "done" ? "通过" : "驳回"}`);
    });
  });
}

function bindAdminSetting() {
  q("#saveAdminBtn").addEventListener("click", () => {
    const pwd = q("#newAdminPassword").value.trim();
    if (pwd.length < 8) {
      showToast("密码长度至少 8 位", true);
      return;
    }
    q("#newAdminPassword").value = "";
    showToast("管理员密码已更新");
  });
}

function bindAdminAppOnce() {
  if (state.hasBoundAdminEvents) return;
  bindMainNav();
  bindSiteConfigForm();
  bindOrderConfig();
  bindAdminSetting();
  state.hasBoundAdminEvents = true;
}

function enterAdminApp() {
  state.isLogin = true;
  q("#loginView").classList.add("hidden");
  q("#adminApp").classList.remove("hidden");
  bindAdminAppOnce();
  switchSection("overview");
  updateMetrics();
  renderPendingList();
  fillSiteConfigForm();
  refreshOrderConfigPanel();
  renderDepositTable();
  renderWithdrawTable();
  refreshNavIndicator();
}

function bindLogin() {
  q("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = q("#loginUsername").value.trim();
    const password = q("#loginPassword").value.trim();
    if (username !== ADMIN_CREDENTIAL.username || password !== ADMIN_CREDENTIAL.password) {
      showToast("管理员账号或密码错误", true);
      return;
    }
    showToast("登录成功");
    enterAdminApp();
  });

  q("#logoutBtn").addEventListener("click", () => {
    state.isLogin = false;
    q("#adminApp").classList.add("hidden");
    q("#loginView").classList.remove("hidden");
    q("#loginForm").reset();
    showToast("已退出登录");
  });
}

function init() {
  bindLogin();
  window.addEventListener("resize", refreshNavIndicator);
}

init();
