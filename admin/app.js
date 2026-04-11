const STORAGE_KEY = "lockpro_admin_mock_v2";

const SECTION_META = {
  overview: {
    title: "数据概览",
    desc: "查看平台总览与待处理事项。",
  },
  "home-manage": {
    title: "首页管理",
    desc: "配置首页标题与文章内容。",
  },
  "user-manage": {
    title: "用户管理",
    desc: "查看用户信息并执行余额加减与账号状态管理。",
  },
  "order-manage": {
    title: "订单管理",
    desc: "配置订单模板、上下架状态与归档。",
  },
  "deposit-manage": {
    title: "充值管理",
    desc: "审核用户充值申请，支持通过或驳回。",
  },
  "withdraw-manage": {
    title: "提现管理",
    desc: "审核用户提现申请，支持通过或驳回。",
  },
  "agreement-manage": {
    title: "协议管理",
    desc: "编辑注册时展示给用户的协议内容。",
  },
  "admin-settings": {
    title: "管理员设置",
    desc: "修改后台管理员登录密码。",
  },
};

const CATEGORY_LABEL_MAP = {
  hedge: "量化对冲套利",
  system: "系统说明",
  news: "区块链时事新闻",
};

const DEFAULT_STATE = {
  credential: {
    username: "admin",
    password: "admin123456",
  },
  homeConfig: {
    title: "LockPro",
    subtitle: "智能策略执行平台",
    description: "首页支持后台配置标题、副标题与说明文案，前端按最新配置渲染。",
  },
  agreementText:
    "【用户协议】\n\n1. 用户注册并勾选同意协议后方可使用平台服务。\n2. 用户需保证提交信息真实、有效且可验证。\n3. 平台可依据风控规则对充值、提现与订单行为进行审核。\n4. 若出现异常交易行为，平台有权限制账号功能并要求补充材料。",
  users: [
    {
      id: "u_1001",
      account: "mark0916",
      profile: "mark0916@example.com",
      available: 1290.25,
      frozen: 180,
      status: "enabled",
      createdAt: "2026-04-05 10:20:31",
    },
    {
      id: "u_1002",
      account: "sunny168",
      profile: "138****8888",
      available: 820.9,
      frozen: 0,
      status: "enabled",
      createdAt: "2026-04-07 09:11:24",
    },
    {
      id: "u_1003",
      account: "haku11",
      profile: "haku11@proton.me",
      available: 305.4,
      frozen: 92,
      status: "banned",
      createdAt: "2026-04-08 14:43:06",
    },
  ],
  articles: [
    {
      id: "art_2001",
      category: "hedge",
      title: "量化对冲套利基础框架",
      content: "介绍策略对冲基础逻辑、风险控制及执行流程。",
      status: "published",
      updatedAt: "2026-04-10 20:12:08",
    },
    {
      id: "art_2002",
      category: "system",
      title: "系统说明与订单执行流程",
      content: "展示订单创建、冻结、结算与资金流转说明。",
      status: "published",
      updatedAt: "2026-04-10 21:52:09",
    },
    {
      id: "art_2003",
      category: "news",
      title: "本周区块链市场动态",
      content: "整理近期链上热点与市场情绪变化。",
      status: "draft",
      updatedAt: "2026-04-11 08:06:41",
    },
  ],
  orders: [
    {
      id: "ord_tpl_3001",
      code: "LPA7Q2M91",
      title: "Prime Hedge A",
      tag: "低波动",
      description: "适合稳健型资金分配。",
      minAmount: 100,
      freezeMin: 1,
      freezeMax: 3,
      rateMin: 2.8,
      rateMax: 4.3,
      status: "on_shelf",
      archived: false,
      updatedAt: "2026-04-10 18:35:40",
    },
    {
      id: "ord_tpl_3002",
      code: "LPF1K9P83",
      title: "Momentum Grid B",
      tag: "事件驱动",
      description: "适合中短周期资金操作。",
      minAmount: 220,
      freezeMin: 3,
      freezeMax: 6,
      rateMin: 3.5,
      rateMax: 5.2,
      status: "off_shelf",
      archived: false,
      updatedAt: "2026-04-11 09:20:21",
    },
  ],
  deposits: [
    {
      id: "dep_4001",
      userId: "u_1002",
      amount: 260,
      method: "USDT",
      screenshot: "https://placehold.co/420x260/png",
      status: "pending",
      reason: "",
      submittedAt: "2026-04-11 10:30:18",
      processedAt: "",
    },
    {
      id: "dep_4002",
      userId: "u_1001",
      amount: 380,
      method: "银行卡",
      screenshot: "https://placehold.co/420x260/png",
      status: "rejected",
      reason: "金额与截图流水不一致",
      submittedAt: "2026-04-11 09:13:49",
      processedAt: "2026-04-11 09:48:57",
    },
  ],
  withdraws: [
    {
      id: "wd_5001",
      userId: "u_1001",
      amount: 120,
      method: "银行卡",
      target: "招商银行 / 尾号1098",
      status: "pending",
      reason: "",
      submittedAt: "2026-04-11 11:16:22",
      processedAt: "",
    },
    {
      id: "wd_5002",
      userId: "u_1003",
      amount: 80,
      method: "USDT",
      target: "TRON-TY***92M",
      status: "rejected",
      reason: "账户状态异常，请联系客服",
      submittedAt: "2026-04-11 08:24:06",
      processedAt: "2026-04-11 08:42:31",
    },
  ],
  activities: [
    {
      id: "act_6001",
      time: "2026-04-11 11:19:03",
      text: "提现申请 wd_5001 提交待审核。",
    },
    {
      id: "act_6002",
      time: "2026-04-11 10:31:10",
      text: "充值申请 dep_4001 提交待审核。",
    },
    {
      id: "act_6003",
      time: "2026-04-11 09:49:05",
      text: "充值申请 dep_4002 已驳回。",
    },
  ],
};

const state = loadState();

let toastTimer = null;
let isAdminEventsBound = false;

function q(selector) {
  return document.querySelector(selector);
}

function qq(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return clone(DEFAULT_STATE);
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return clone(DEFAULT_STATE);
    }

    const merged = clone(DEFAULT_STATE);

    if (parsed.credential && typeof parsed.credential === "object") {
      if (typeof parsed.credential.username === "string" && parsed.credential.username.trim()) {
        merged.credential.username = parsed.credential.username;
      }
      if (typeof parsed.credential.password === "string" && parsed.credential.password.trim()) {
        merged.credential.password = parsed.credential.password;
      }
    }

    if (parsed.homeConfig && typeof parsed.homeConfig === "object") {
      if (typeof parsed.homeConfig.title === "string") merged.homeConfig.title = parsed.homeConfig.title;
      if (typeof parsed.homeConfig.subtitle === "string") merged.homeConfig.subtitle = parsed.homeConfig.subtitle;
      if (typeof parsed.homeConfig.description === "string") merged.homeConfig.description = parsed.homeConfig.description;
    }

    if (typeof parsed.agreementText === "string") {
      merged.agreementText = parsed.agreementText;
    }

    if (Array.isArray(parsed.users)) merged.users = parsed.users;
    if (Array.isArray(parsed.articles)) merged.articles = parsed.articles;
    if (Array.isArray(parsed.orders)) merged.orders = parsed.orders;
    if (Array.isArray(parsed.deposits)) merged.deposits = parsed.deposits;
    if (Array.isArray(parsed.withdraws)) merged.withdraws = parsed.withdraws;
    if (Array.isArray(parsed.activities)) merged.activities = parsed.activities;

    return merged;
  } catch (error) {
    return clone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function nowString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function makeOrderCode() {
  const left = Date.now().toString(36).slice(-4).toUpperCase();
  const right = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LP${left}${right}`;
}

function formatMoney(value) {
  const num = Number(value) || 0;
  return `$${num.toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, isError = false) {
  const toast = q("#toast");
  toast.textContent = message;
  toast.style.background = isError ? "rgba(111, 39, 57, 0.93)" : "rgba(23, 35, 67, 0.92)";
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function addActivity(text) {
  state.activities.unshift({
    id: makeId("act"),
    time: nowString(),
    text,
  });
  state.activities = state.activities.slice(0, 40);
}

function findUser(userId) {
  return state.users.find((item) => item.id === userId);
}

function getUserLabel(userId) {
  const user = findUser(userId);
  if (!user) return "未知用户";
  return `${user.account}`;
}

function sectionSwitch(sectionId) {
  qq(".section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });
  qq(".menu-btn[data-section]").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  const meta = SECTION_META[sectionId] || { title: "后台", desc: "" };
  q("#pageTitle").textContent = meta.title;
  q("#pageDesc").textContent = meta.desc;
}

function pendingDepositCount() {
  return state.deposits.filter((item) => item.status === "pending").length;
}

function pendingWithdrawCount() {
  return state.withdraws.filter((item) => item.status === "pending").length;
}

function renderOverview() {
  const enabledCount = state.users.filter((item) => item.status === "enabled").length;
  const onShelfCount = state.orders.filter((item) => !item.archived && item.status === "on_shelf").length;
  const totalAvailable = state.users.reduce((sum, item) => sum + (Number(item.available) || 0), 0);
  const totalFrozen = state.users.reduce((sum, item) => sum + (Number(item.frozen) || 0), 0);
  const articleCount = state.articles.filter((item) => item.status !== "archived").length;

  q("#metricUserCount").textContent = String(state.users.length);
  q("#metricEnabledCount").textContent = String(enabledCount);
  q("#metricOrderOnShelf").textContent = String(onShelfCount);
  q("#metricPendingDeposits").textContent = String(pendingDepositCount());
  q("#metricPendingWithdraws").textContent = String(pendingWithdrawCount());
  q("#metricWalletAvailable").textContent = formatMoney(totalAvailable);
  q("#metricWalletFrozen").textContent = formatMoney(totalFrozen);
  q("#metricArticleCount").textContent = String(articleCount);

  const pendingRoot = q("#pendingList");
  const pendingItems = [
    `待审核充值：${pendingDepositCount()} 笔`,
    `待审核提现：${pendingWithdrawCount()} 笔`,
    `上架订单模板：${onShelfCount} 个`,
  ];
  pendingRoot.innerHTML = pendingItems.map((item) => `<li>${item}</li>`).join("");

  const activityRoot = q("#recentActivityList");
  if (state.activities.length === 0) {
    activityRoot.innerHTML = '<li class="empty">暂无操作记录</li>';
    return;
  }
  activityRoot.innerHTML = state.activities
    .slice(0, 8)
    .map((item) => `<li><strong>${escapeHtml(item.time)}</strong> ${escapeHtml(item.text)}</li>`)
    .join("");
}

function fillHomeConfigForm() {
  q("#homeTitle").value = state.homeConfig.title;
  q("#homeSubtitle").value = state.homeConfig.subtitle;
  q("#homeDescription").value = state.homeConfig.description;
}

function articleStatusLabel(status) {
  if (status === "published") return "已发布";
  if (status === "draft") return "草稿";
  return "已归档";
}

function renderArticleTable() {
  const body = q("#articleTableBody");
  const rows = [...state.articles].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty">暂无文章</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((item) => {
      const categoryLabel = CATEGORY_LABEL_MAP[item.category] || "未分类";
      const isArchived = item.status === "archived";
      return `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(categoryLabel)}</td>
          <td><span class="status ${item.status}">${articleStatusLabel(item.status)}</span></td>
          <td>${escapeHtml(item.updatedAt)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn ghost sm" data-article-action="edit" data-id="${item.id}">编辑</button>
              <button class="btn ghost sm" data-article-action="toggle" data-id="${item.id}" ${isArchived ? "disabled" : ""}>切换状态</button>
              <button class="btn danger sm" data-article-action="archive" data-id="${item.id}" ${isArchived ? "disabled" : ""}>归档</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function resetArticleForm() {
  q("#articleEditId").value = "";
  q("#articleTitle").value = "";
  q("#articleContent").value = "";
  q("#articleCategory").value = "hedge";
  q("#articleStatus").value = "published";
  q("#articleSubmitBtn").textContent = "保存文章";
}

function fillArticleForm(article) {
  q("#articleEditId").value = article.id;
  q("#articleTitle").value = article.title;
  q("#articleContent").value = article.content;
  q("#articleCategory").value = article.category;
  q("#articleStatus").value = article.status === "archived" ? "draft" : article.status;
  q("#articleSubmitBtn").textContent = "更新文章";
}

function renderUserTable() {
  const body = q("#userTableBody");
  if (state.users.length === 0) {
    body.innerHTML = '<tr><td colspan="7" class="empty">暂无用户</td></tr>';
    return;
  }

  body.innerHTML = state.users
    .map((user) => {
      const statusLabel = user.status === "enabled" ? "启用" : "封禁";
      return `
        <tr>
          <td>${escapeHtml(user.account)}</td>
          <td>${escapeHtml(user.profile)}</td>
          <td>${formatMoney(user.available)}</td>
          <td>${formatMoney(user.frozen)}</td>
          <td><span class="status ${user.status}">${statusLabel}</span></td>
          <td>${escapeHtml(user.createdAt)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn success sm" data-user-action="add" data-id="${user.id}">加余额</button>
              <button class="btn danger sm" data-user-action="sub" data-id="${user.id}">减余额</button>
              <button class="btn ghost sm" data-user-action="toggle" data-id="${user.id}">${user.status === "enabled" ? "封禁" : "启用"}</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function orderStatusLabel(order) {
  if (order.archived) return "已归档";
  return order.status === "on_shelf" ? "上架" : "下架";
}

function orderStatusClass(order) {
  if (order.archived) return "archived";
  return order.status;
}

function renderOrderTable() {
  const body = q("#orderTableBody");
  const rows = [...state.orders].sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无订单模板</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((order) => {
      return `
        <tr>
          <td class="cell-mono">${escapeHtml(order.code)}</td>
          <td>${escapeHtml(order.title)}</td>
          <td>${formatMoney(order.minAmount)}</td>
          <td>${order.freezeMin}h - ${order.freezeMax}h</td>
          <td>${order.rateMin}% - ${order.rateMax}%</td>
          <td><span class="status ${orderStatusClass(order)}">${orderStatusLabel(order)}</span></td>
          <td>${escapeHtml(order.updatedAt)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn ghost sm" data-order-action="edit" data-id="${order.id}" ${order.archived ? "disabled" : ""}>编辑</button>
              <button class="btn ghost sm" data-order-action="toggle" data-id="${order.id}" ${order.archived ? "disabled" : ""}>上下架</button>
              <button class="btn danger sm" data-order-action="archive" data-id="${order.id}" ${order.archived ? "disabled" : ""}>归档</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function resetOrderForm() {
  q("#orderEditId").value = "";
  q("#orderTitle").value = "";
  q("#orderTag").value = "";
  q("#orderDesc").value = "";
  q("#orderMinAmount").value = "100";
  q("#orderStatus").value = "on_shelf";
  q("#orderFreezeMin").value = "1";
  q("#orderFreezeMax").value = "3";
  q("#orderRateMin").value = "2";
  q("#orderRateMax").value = "4";
  q("#orderSubmitBtn").textContent = "保存订单模板";
}

function fillOrderForm(order) {
  q("#orderEditId").value = order.id;
  q("#orderTitle").value = order.title;
  q("#orderTag").value = order.tag || "";
  q("#orderDesc").value = order.description || "";
  q("#orderMinAmount").value = String(order.minAmount);
  q("#orderStatus").value = order.status;
  q("#orderFreezeMin").value = String(order.freezeMin);
  q("#orderFreezeMax").value = String(order.freezeMax);
  q("#orderRateMin").value = String(order.rateMin);
  q("#orderRateMax").value = String(order.rateMax);
  q("#orderSubmitBtn").textContent = "更新订单模板";
}

function applyMoneyAdjustment(userId, direction) {
  const user = findUser(userId);
  if (!user) {
    showToast("未找到用户", true);
    return;
  }

  const raw = window.prompt(direction === "add" ? "请输入增加金额" : "请输入减少金额", "100");
  if (raw === null) return;

  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("请输入大于 0 的数字", true);
    return;
  }

  if (direction === "sub") {
    if (user.available < amount) {
      showToast("可用余额不足，无法扣减", true);
      return;
    }
    user.available = Number((user.available - amount).toFixed(2));
    addActivity(`管理员手动减少用户 ${user.account} 余额 ${formatMoney(amount)}。`);
    showToast("余额扣减成功");
  } else {
    user.available = Number((user.available + amount).toFixed(2));
    addActivity(`管理员手动增加用户 ${user.account} 余额 ${formatMoney(amount)}。`);
    showToast("余额增加成功");
  }

  saveAndRefresh();
}

function depositStatusLabel(status) {
  if (status === "approved") return "已通过";
  if (status === "rejected") return "已驳回";
  return "待审核";
}

function withdrawStatusLabel(status) {
  if (status === "approved") return "已通过";
  if (status === "rejected") return "已驳回";
  return "待审核";
}

function renderDepositTable() {
  const body = q("#depositTableBody");
  const rows = [...state.deposits].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无充值记录</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((item) => {
      const userLabel = getUserLabel(item.userId);
      const screenshotHtml = item.screenshot
        ? `<a href="${escapeHtml(item.screenshot)}" target="_blank" rel="noopener noreferrer">查看截图</a>`
        : "-";
      return `
        <tr>
          <td>${escapeHtml(userLabel)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>${escapeHtml(item.method)}</td>
          <td>${screenshotHtml}</td>
          <td>${escapeHtml(item.submittedAt)}</td>
          <td><span class="status ${item.status}">${depositStatusLabel(item.status)}</span></td>
          <td>${item.reason ? escapeHtml(item.reason) : "-"}</td>
          <td>
            <div class="cell-actions">
              <button class="btn success sm" data-deposit-action="approve" data-id="${item.id}" ${item.status !== "pending" ? "disabled" : ""}>通过</button>
              <button class="btn danger sm" data-deposit-action="reject" data-id="${item.id}" ${item.status !== "pending" ? "disabled" : ""}>驳回</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderWithdrawTable() {
  const body = q("#withdrawTableBody");
  const rows = [...state.withdraws].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无提现记录</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((item) => {
      const userLabel = getUserLabel(item.userId);
      return `
        <tr>
          <td>${escapeHtml(userLabel)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>${escapeHtml(item.method)}</td>
          <td>${escapeHtml(item.target || "-")}</td>
          <td>${escapeHtml(item.submittedAt)}</td>
          <td><span class="status ${item.status}">${withdrawStatusLabel(item.status)}</span></td>
          <td>${item.reason ? escapeHtml(item.reason) : "-"}</td>
          <td>
            <div class="cell-actions">
              <button class="btn success sm" data-withdraw-action="approve" data-id="${item.id}" ${item.status !== "pending" ? "disabled" : ""}>通过</button>
              <button class="btn danger sm" data-withdraw-action="reject" data-id="${item.id}" ${item.status !== "pending" ? "disabled" : ""}>驳回</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function saveAndRefresh() {
  saveState();
  renderOverview();
  renderArticleTable();
  renderUserTable();
  renderOrderTable();
  renderDepositTable();
  renderWithdrawTable();
}

function bindSectionSwitch() {
  qq(".menu-btn[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      sectionSwitch(button.dataset.section);
    });
  });

  qq("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      sectionSwitch(button.dataset.jump);
    });
  });
}

function bindHomeManage() {
  q("#homeConfigForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.homeConfig.title = q("#homeTitle").value.trim();
    state.homeConfig.subtitle = q("#homeSubtitle").value.trim();
    state.homeConfig.description = q("#homeDescription").value.trim();
    addActivity("首页基础信息已更新。");
    saveAndRefresh();
    showToast("首页配置已保存");
  });

  q("#articleForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const editId = q("#articleEditId").value;
    const category = q("#articleCategory").value;
    const status = q("#articleStatus").value;
    const title = q("#articleTitle").value.trim();
    const content = q("#articleContent").value.trim();

    if (!title || !content) {
      showToast("请填写完整文章标题与内容", true);
      return;
    }

    if (editId) {
      const target = state.articles.find((item) => item.id === editId);
      if (!target) {
        showToast("文章不存在", true);
        return;
      }
      target.category = category;
      target.status = status;
      target.title = title;
      target.content = content;
      target.updatedAt = nowString();
      addActivity(`文章“${title}”已更新。`);
      showToast("文章已更新");
    } else {
      state.articles.push({
        id: makeId("art"),
        category,
        status,
        title,
        content,
        updatedAt: nowString(),
      });
      addActivity(`新增文章“${title}”。`);
      showToast("文章已新增");
    }

    resetArticleForm();
    saveAndRefresh();
  });

  q("#articleResetBtn").addEventListener("click", () => {
    resetArticleForm();
  });

  q("#articleTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-article-action]");
    if (!button) return;

    const action = button.dataset.articleAction;
    const id = button.dataset.id;
    const target = state.articles.find((item) => item.id === id);
    if (!target) return;

    if (action === "edit") {
      fillArticleForm(target);
      sectionSwitch("home-manage");
      return;
    }

    if (action === "toggle") {
      if (target.status === "archived") {
        showToast("已归档文章不能切换状态", true);
        return;
      }
      target.status = target.status === "published" ? "draft" : "published";
      target.updatedAt = nowString();
      addActivity(`文章“${target.title}”状态切换为${articleStatusLabel(target.status)}。`);
      saveAndRefresh();
      showToast("文章状态已切换");
      return;
    }

    if (action === "archive") {
      target.status = "archived";
      target.updatedAt = nowString();
      addActivity(`文章“${target.title}”已归档。`);
      saveAndRefresh();
      showToast("文章已归档");
    }
  });
}

function bindUserManage() {
  q("#userTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-user-action]");
    if (!button) return;

    const action = button.dataset.userAction;
    const userId = button.dataset.id;
    const user = findUser(userId);
    if (!user) return;

    if (action === "add") {
      applyMoneyAdjustment(userId, "add");
      return;
    }

    if (action === "sub") {
      applyMoneyAdjustment(userId, "sub");
      return;
    }

    if (action === "toggle") {
      user.status = user.status === "enabled" ? "banned" : "enabled";
      addActivity(`用户 ${user.account} 已${user.status === "enabled" ? "启用" : "封禁"}。`);
      saveAndRefresh();
      showToast(`账号已${user.status === "enabled" ? "启用" : "封禁"}`);
    }
  });
}

function bindOrderManage() {
  q("#orderForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const editId = q("#orderEditId").value;
    const title = q("#orderTitle").value.trim();
    const tag = q("#orderTag").value.trim();
    const description = q("#orderDesc").value.trim();
    const minAmount = Number(q("#orderMinAmount").value || 0);
    const status = q("#orderStatus").value;
    const freezeMin = Number(q("#orderFreezeMin").value || 0);
    const freezeMax = Number(q("#orderFreezeMax").value || 0);
    const rateMin = Number(q("#orderRateMin").value || 0);
    const rateMax = Number(q("#orderRateMax").value || 0);

    if (!title || minAmount <= 0) {
      showToast("请填写完整订单标题与起投金额", true);
      return;
    }
    if (freezeMin <= 0 || freezeMax <= 0 || freezeMin > freezeMax) {
      showToast("冻结时间区间不合法", true);
      return;
    }
    if (rateMin < 0 || rateMax < 0 || rateMin > rateMax) {
      showToast("盈利比例区间不合法", true);
      return;
    }

    if (editId) {
      const target = state.orders.find((item) => item.id === editId);
      if (!target) {
        showToast("订单模板不存在", true);
        return;
      }
      target.title = title;
      target.tag = tag;
      target.description = description;
      target.minAmount = Number(minAmount.toFixed(2));
      target.status = status;
      target.freezeMin = freezeMin;
      target.freezeMax = freezeMax;
      target.rateMin = Number(rateMin.toFixed(2));
      target.rateMax = Number(rateMax.toFixed(2));
      target.updatedAt = nowString();
      addActivity(`订单模板 ${target.code} 已更新。`);
      showToast("订单模板已更新");
    } else {
      const code = makeOrderCode();
      state.orders.push({
        id: makeId("ord_tpl"),
        code,
        title,
        tag,
        description,
        minAmount: Number(minAmount.toFixed(2)),
        freezeMin,
        freezeMax,
        rateMin: Number(rateMin.toFixed(2)),
        rateMax: Number(rateMax.toFixed(2)),
        status,
        archived: false,
        updatedAt: nowString(),
      });
      addActivity(`新增订单模板 ${code}。`);
      showToast("订单模板已新增");
    }

    resetOrderForm();
    saveAndRefresh();
  });

  q("#orderResetBtn").addEventListener("click", () => {
    resetOrderForm();
  });

  q("#orderTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-order-action]");
    if (!button) return;

    const action = button.dataset.orderAction;
    const id = button.dataset.id;
    const target = state.orders.find((item) => item.id === id);
    if (!target) return;

    if (target.archived) {
      showToast("已归档订单不可操作", true);
      return;
    }

    if (action === "edit") {
      fillOrderForm(target);
      sectionSwitch("order-manage");
      return;
    }

    if (action === "toggle") {
      target.status = target.status === "on_shelf" ? "off_shelf" : "on_shelf";
      target.updatedAt = nowString();
      addActivity(`订单模板 ${target.code} 已切换为${orderStatusLabel(target)}。`);
      saveAndRefresh();
      showToast("订单上下架状态已切换");
      return;
    }

    if (action === "archive") {
      target.archived = true;
      target.status = "off_shelf";
      target.updatedAt = nowString();
      addActivity(`订单模板 ${target.code} 已归档。`);
      saveAndRefresh();
      showToast("订单模板已归档");
    }
  });
}

function bindDepositManage() {
  q("#depositTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-deposit-action]");
    if (!button) return;

    const action = button.dataset.depositAction;
    const id = button.dataset.id;
    const target = state.deposits.find((item) => item.id === id);
    if (!target || target.status !== "pending") return;

    const user = findUser(target.userId);
    if (!user) {
      showToast("未找到对应用户", true);
      return;
    }

    if (action === "approve") {
      target.status = "approved";
      target.reason = "";
      target.processedAt = nowString();
      user.available = Number((user.available + target.amount).toFixed(2));
      addActivity(`充值申请 ${target.id} 已通过，已为 ${user.account} 增加 ${formatMoney(target.amount)}。`);
      saveAndRefresh();
      showToast("充值申请已通过");
      return;
    }

    if (action === "reject") {
      const reason = window.prompt("请输入驳回原因", "");
      if (reason === null) return;
      if (!reason.trim()) {
        showToast("驳回时必须填写原因", true);
        return;
      }
      target.status = "rejected";
      target.reason = reason.trim();
      target.processedAt = nowString();
      addActivity(`充值申请 ${target.id} 已驳回。`);
      saveAndRefresh();
      showToast("充值申请已驳回");
    }
  });
}

function bindWithdrawManage() {
  q("#withdrawTableBody").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-withdraw-action]");
    if (!button) return;

    const action = button.dataset.withdrawAction;
    const id = button.dataset.id;
    const target = state.withdraws.find((item) => item.id === id);
    if (!target || target.status !== "pending") return;

    const user = findUser(target.userId);
    if (!user) {
      showToast("未找到对应用户", true);
      return;
    }

    if (action === "approve") {
      if (user.available < target.amount) {
        showToast("用户可用余额不足，无法通过", true);
        return;
      }
      target.status = "approved";
      target.reason = "";
      target.processedAt = nowString();
      user.available = Number((user.available - target.amount).toFixed(2));
      addActivity(`提现申请 ${target.id} 已通过，已扣减 ${user.account} ${formatMoney(target.amount)}。`);
      saveAndRefresh();
      showToast("提现申请已通过");
      return;
    }

    if (action === "reject") {
      const reason = window.prompt("请输入驳回原因", "");
      if (reason === null) return;
      if (!reason.trim()) {
        showToast("驳回时必须填写原因", true);
        return;
      }
      target.status = "rejected";
      target.reason = reason.trim();
      target.processedAt = nowString();
      addActivity(`提现申请 ${target.id} 已驳回。`);
      saveAndRefresh();
      showToast("提现申请已驳回");
    }
  });
}

function bindAgreementManage() {
  q("#agreementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.agreementText = q("#agreementText").value;
    addActivity("用户协议内容已更新。");
    saveAndRefresh();
    showToast("协议已保存");
  });
}

function bindAdminSettings() {
  q("#adminPasswordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const newPassword = q("#newAdminPassword").value.trim();
    const confirmPassword = q("#confirmAdminPassword").value.trim();

    if (newPassword.length < 8) {
      showToast("新密码长度至少 8 位", true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("两次输入的新密码不一致", true);
      return;
    }

    state.credential.password = newPassword;
    addActivity("管理员密码已更新。");
    saveAndRefresh();

    q("#newAdminPassword").value = "";
    q("#confirmAdminPassword").value = "";
    showToast("管理员密码更新成功");
  });
}

function bindAdminEventsOnce() {
  if (isAdminEventsBound) return;
  bindSectionSwitch();
  bindHomeManage();
  bindUserManage();
  bindOrderManage();
  bindDepositManage();
  bindWithdrawManage();
  bindAgreementManage();
  bindAdminSettings();
  isAdminEventsBound = true;
}

function fillAgreementForm() {
  q("#agreementText").value = state.agreementText;
}

function enterAdminApp() {
  q("#loginView").classList.add("hidden");
  q("#adminApp").classList.remove("hidden");
  q("#currentAdmin").value = state.credential.username;

  bindAdminEventsOnce();
  fillHomeConfigForm();
  fillAgreementForm();
  resetArticleForm();
  resetOrderForm();
  saveAndRefresh();
  sectionSwitch("overview");
}

function bindLogin() {
  q("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = q("#loginUsername").value.trim();
    const password = q("#loginPassword").value.trim();

    if (username !== state.credential.username || password !== state.credential.password) {
      showToast("管理员账号或密码错误", true);
      return;
    }

    showToast("登录成功");
    enterAdminApp();
  });

  q("#logoutBtn").addEventListener("click", () => {
    q("#adminApp").classList.add("hidden");
    q("#loginView").classList.remove("hidden");
    q("#loginForm").reset();
    showToast("已退出登录");
  });
}

function init() {
  bindLogin();
}

init();

