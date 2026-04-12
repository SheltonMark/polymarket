const API_BASE = "";
const ADMIN_TOKEN_KEY = "lockpro_admin_token";

const SECTION_META = {
  overview: { title: "数据概览", desc: "查看用户、资金、订单与内容的核心数据。" },
  "home-manage": { title: "首页管理", desc: "配置首页标题与文章内容。" },
  "user-manage": { title: "用户管理", desc: "查看用户信息并执行余额加减与账号状态管理。" },
  "order-config": { title: "订单配置", desc: "配置批量生成订单的默认参数（冻结、收益、时间、项目名）。" },
  "order-manage": { title: "订单管理", desc: "配置订单模板状态与归档。" },
  "deposit-manage": { title: "充值管理", desc: "审核用户充值申请，支持通过或驳回。" },
  "withdraw-manage": { title: "提现管理", desc: "审核用户提现申请，支持通过或驳回。" },
  "agreement-manage": { title: "协议管理", desc: "编辑注册时展示给用户的协议内容。" },
  "admin-settings": { title: "管理员设置", desc: "修改后台管理员登录密码。" },
};

const CATEGORY_LABEL_MAP = {
  hedge: "量化对冲套利",
  system: "系统说明",
  news: "区块链时事新闻",
};

const state = {
  token: localStorage.getItem(ADMIN_TOKEN_KEY) || "",
  credential: { username: "admin" },
  homeConfig: { title: "", subtitle: "", description: "" },
  agreementText: "",
  users: [],
  articles: [],
  orders: [],
  deposits: [],
  withdraws: [],
  activities: [],
};

let toastTimer = null;
let hasBoundEvents = false;

function q(selector) {
  return document.querySelector(selector);
}

function qq(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function formatMoney(value) {
  const num = Number(value) || 0;
  return `$${num.toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
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
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body } = options;
  const headers = { Accept: "application/json" };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  let payload;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  } else {
    payload = body;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: payload,
  });

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `请求失败(${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function sectionSwitch(sectionId) {
  qq(".section").forEach((section) => section.classList.toggle("active", section.id === sectionId));
  qq(".menu-btn[data-section]").forEach((btn) => btn.classList.toggle("active", btn.dataset.section === sectionId));
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
  pendingRoot.innerHTML = [
    `待审核充值：${pendingDepositCount()} 笔`,
    `待审核提现：${pendingWithdrawCount()} 笔`,
    `在架订单模板：${onShelfCount} 个`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join("");

  const activityRoot = q("#recentActivityList");
  if (!state.activities.length) {
    activityRoot.innerHTML = '<li class="empty">暂无操作记录</li>';
    return;
  }
  activityRoot.innerHTML = state.activities
    .slice(0, 8)
    .map((item) => `<li><strong>${escapeHtml(item.time)}</strong> ${escapeHtml(item.text)}</li>`)
    .join("");
}

function articleStatusLabel(status) {
  if (status === "published") return "已发布";
  if (status === "draft") return "草稿";
  return "已归档";
}

function renderArticleTable() {
  const body = q("#articleTableBody");
  const rows = [...state.articles].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty">暂无文章</td></tr>';
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
          <td>${item.hot ? '<span class="status published">热门</span>' : '-'}</td>
          <td>${escapeHtml(item.updatedAt)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn ghost sm" data-article-action="edit" data-id="${item.id}">编辑</button>
              <button class="btn danger sm" data-article-action="archive" data-id="${item.id}" ${isArchived ? "disabled" : ""}>归档</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderUserTable() {
  const body = q("#userTableBody");
  if (!state.users.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无用户</td></tr>';
    return;
  }

  body.innerHTML = state.users
    .map((user) => {
      const statusLabel = user.status === "enabled" ? "启用" : "封禁";
      const principal = formatMoney((Number(user.principalAvailable) || 0) + (Number(user.frozen) || 0));
      return `
        <tr>
          <td>${escapeHtml(user.account)}</td>
          <td>${escapeHtml(user.profile)}</td>
          <td>${principal}</td>
          <td>${formatMoney(user.available)}</td>
          <td>${formatMoney(user.frozen)}</td>
          <td><span class="status ${user.status}">${statusLabel}</span></td>
          <td>${escapeHtml(user.createdAt)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn success sm" data-user-action="add" data-id="${user.id}">加余额</button>
              <button class="btn danger sm" data-user-action="sub" data-id="${user.id}">减余额</button>
              <button class="btn primary sm" data-user-action="generate" data-id="${user.id}">生成订单</button>
              <button class="btn sm" data-user-action="viewOrders" data-id="${user.id}" style="background:#6366f1;color:#fff;">查看订单</button>
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

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无订单模板</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((order) => `
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
            <button class="btn danger sm" data-order-action="archive" data-id="${order.id}" ${order.archived ? "disabled" : ""}>归档</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderDepositTable() {
  const body = q("#depositTableBody");
  const rows = [...state.deposits].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无充值记录</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((item) => {
      const user = state.users.find((it) => it.id === item.userId);
      const userName = user ? user.account : "未知用户";
      const screenshot = item.screenshot
        ? `<a href="${escapeHtml(item.screenshot)}" target="_blank" rel="noopener noreferrer">查看截图</a>`
        : "-";
      return `
        <tr>
          <td>${escapeHtml(userName)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>${escapeHtml(item.method)}</td>
          <td>${screenshot}</td>
          <td>${escapeHtml(item.submittedAt)}</td>
          <td><span class="status ${item.status}">${item.status === "pending" ? "待审核" : item.status === "approved" ? "已通过" : "已驳回"}</span></td>
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

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无提现记录</td></tr>';
    return;
  }

  body.innerHTML = rows
    .map((item) => {
      const user = state.users.find((it) => it.id === item.userId);
      const userName = user ? user.account : "未知用户";
      return `
        <tr>
          <td>${escapeHtml(userName)}</td>
          <td>${formatMoney(item.amount)}</td>
          <td>${escapeHtml(item.method)}</td>
          <td>${escapeHtml(item.target || "-")}</td>
          <td>${escapeHtml(item.submittedAt)}</td>
          <td><span class="status ${item.status}">${item.status === "pending" ? "待审核" : item.status === "approved" ? "已通过" : "已驳回"}</span></td>
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

function renderAll() {
  q("#homeTitle").value = state.homeConfig.title;
  q("#homeSubtitle").value = state.homeConfig.subtitle;
  q("#homeDescription").value = state.homeConfig.description;
  q("#agreementText").value = state.agreementText;
  q("#currentAdmin").value = state.credential.username;

  renderOverview();
  renderArticleTable();
  renderUserTable();
  renderOrderTable();
  renderDepositTable();
  renderWithdrawTable();
}

function setCustomSelectValue(id, value, labelText) {
  const hidden = q(`#${id}`);
  const label = q(`#${id}Label`);
  const root = q(`#${id}Select`);
  if (!hidden || !label || !root) return;

  hidden.value = value;
  label.textContent = labelText;
  root.querySelectorAll(".custom-select-option").forEach((item) => {
    item.classList.toggle("active", item.dataset.value === value);
  });
}

function getCustomSelectLabel(root, value) {
  const target = root.querySelector(`.custom-select-option[data-value="${value}"]`);
  return target ? target.textContent.trim() : "";
}

function bindCustomSelect(rootId, hiddenId) {
  const root = q(`#${rootId}`);
  if (!root) return;
  const trigger = root.querySelector(".custom-select-trigger");
  const hidden = q(`#${hiddenId}`);

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    qq(".custom-select").forEach((item) => {
      if (item !== root) item.classList.remove("open");
    });
    root.classList.toggle("open");
  });

  root.querySelectorAll(".custom-select-option").forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "";
      if (!value) return;
      hidden.value = value;
      setCustomSelectValue(hiddenId, value, option.textContent.trim());
      root.classList.remove("open");
    });
  });
}

function syncSelectUIFromHidden() {
  ["articleCategory", "articleStatus", "orderStatus"].forEach((id) => {
    const hidden = q(`#${id}`);
    const root = q(`#${id}Select`);
    if (!hidden || !root) return;
    const label = getCustomSelectLabel(root, hidden.value);
    if (label) {
      setCustomSelectValue(id, hidden.value, label);
    }
  });
}

async function loadAdminData() {
  const payload = await apiRequest("/api/admin/bootstrap");
  state.credential = payload.credential;
  state.homeConfig = payload.homeConfig;
  state.agreementText = payload.agreementText;
  state.users = payload.users;
  state.articles = payload.articles;
  state.orders = payload.orders;
  state.deposits = payload.deposits;
  state.withdraws = payload.withdraws;
  state.activities = payload.activities;

  renderAll();
  syncSelectUIFromHidden();
}

function resetArticleForm() {
  q("#articleEditId").value = "";
  q("#articleTitle").value = "";
  q("#articleContent").value = "";
  q("#articleHot").checked = false;
  setCustomSelectValue("articleCategory", "hedge", "量化对冲套利");
  setCustomSelectValue("articleStatus", "published", "已发布");
  q("#articleSubmitBtn").textContent = "保存文章";
}

function fillArticleForm(article) {
  q("#articleEditId").value = article.id;
  q("#articleTitle").value = article.title;
  q("#articleContent").value = article.content;
  q("#articleHot").checked = Boolean(article.hot);
  setCustomSelectValue("articleCategory", article.category, CATEGORY_LABEL_MAP[article.category] || "未分类");
  setCustomSelectValue("articleStatus", article.status === "archived" ? "draft" : article.status, article.status === "published" ? "已发布" : "草稿");
  q("#articleSubmitBtn").textContent = "更新文章";
}

function resetOrderForm() {
  q("#orderEditId").value = "";
  q("#orderTitle").value = "";
  q("#orderTag").value = "";
  q("#orderDesc").value = "";
  q("#orderMinAmount").value = "100";
  q("#orderFreezeMin").value = "1";
  q("#orderFreezeMax").value = "3";
  q("#orderRateMin").value = "2";
  q("#orderRateMax").value = "4";
  setCustomSelectValue("orderStatus", "on_shelf", "上架");
  q("#orderSubmitBtn").textContent = "保存订单模板";
}

function fillOrderForm(order) {
  q("#orderEditId").value = order.id;
  q("#orderTitle").value = order.title;
  q("#orderTag").value = order.tag || "";
  q("#orderDesc").value = order.description || "";
  q("#orderMinAmount").value = String(order.minAmount);
  q("#orderFreezeMin").value = String(order.freezeMin);
  q("#orderFreezeMax").value = String(order.freezeMax);
  q("#orderRateMin").value = String(order.rateMin);
  q("#orderRateMax").value = String(order.rateMax);
  setCustomSelectValue("orderStatus", order.status, order.status === "on_shelf" ? "上架" : "下架");
  q("#orderSubmitBtn").textContent = "更新订单模板";
}

function openModal(modalId) {
  q(`#${modalId}`)?.classList.add("open");
}

function closeModal(modalId) {
  q(`#${modalId}`)?.classList.remove("open");
}

function openBalanceAdjustModal({ userId, direction, account }) {
  const isAdd = direction === "add";
  q("#balanceUserId").value = userId;
  q("#balanceDirection").value = direction;
  q("#balanceAdjustTitle").textContent = isAdd ? "增加充值本金" : "减少充值本金";
  q("#balanceAdjustHint").textContent = `目标用户：${account}，请输入本次${isAdd ? "增加" : "减少"}的本金金额。`;
  q("#balanceAdjustSubmitBtn").textContent = isAdd ? "确认增加本金" : "确认减少本金";
  q("#balanceAmountInput").value = "100";
  openModal("balanceAdjustModalBackdrop");
  q("#balanceAmountInput").focus();
}

function closeBalanceAdjustModal() {
  q("#balanceAdjustForm").reset();
  closeModal("balanceAdjustModalBackdrop");
}

function openRejectReasonModal({ type, recordId }) {
  const isDeposit = type === "deposit";
  q("#auditRejectType").value = type;
  q("#auditRejectRecordId").value = recordId;
  q("#auditRejectTitle").textContent = isDeposit ? "驳回充值申请" : "驳回提现申请";
  q("#auditRejectHint").textContent = `记录编号：${recordId}，驳回原因会展示给用户。`;
  q("#auditRejectReason").value = "";
  openModal("auditRejectModalBackdrop");
  q("#auditRejectReason").focus();
}

function closeRejectReasonModal() {
  q("#auditRejectForm").reset();
  closeModal("auditRejectModalBackdrop");
}

function bindActionInputModals() {
  q("#closeBalanceAdjustModal").addEventListener("click", closeBalanceAdjustModal);
  q("#cancelBalanceAdjustBtn").addEventListener("click", closeBalanceAdjustModal);
  q("#balanceAdjustModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "balanceAdjustModalBackdrop") closeBalanceAdjustModal();
  });

  q("#balanceAdjustForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = q("#balanceUserId").value;
    const direction = q("#balanceDirection").value;
    const amount = Number(q("#balanceAmountInput").value || 0);

    if (!userId || !["add", "sub"].includes(direction)) {
      showToast("参数异常，请重试", true);
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("请输入有效金额", true);
      return;
    }

    try {
      await apiRequest(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        body: { direction, amount },
      });
      await loadAdminData();
      closeBalanceAdjustModal();
      showToast("用户余额已调整");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#closeAuditRejectModal").addEventListener("click", closeRejectReasonModal);
  q("#cancelAuditRejectBtn").addEventListener("click", closeRejectReasonModal);
  q("#auditRejectModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "auditRejectModalBackdrop") closeRejectReasonModal();
  });

  q("#auditRejectForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const type = q("#auditRejectType").value;
    const recordId = q("#auditRejectRecordId").value;
    const reason = q("#auditRejectReason").value.trim();

    if (!reason) {
      showToast("驳回时必须填写原因", true);
      return;
    }

    const apiPath = type === "deposit"
      ? `/api/admin/deposits/${recordId}/reject`
      : `/api/admin/withdrawals/${recordId}/reject`;

    try {
      await apiRequest(apiPath, { method: "POST", body: { reason } });
      await loadAdminData();
      closeRejectReasonModal();
      showToast(type === "deposit" ? "充值审核已更新" : "提现审核已更新");
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function bindSectionSwitch() {
  qq(".menu-btn[data-section]").forEach((button) => {
    button.addEventListener("click", () => sectionSwitch(button.dataset.section));
  });

  qq("[data-jump]").forEach((button) => {
    button.addEventListener("click", () => sectionSwitch(button.dataset.jump));
  });
}

function bindCustomSelectClose() {
  document.addEventListener("click", (event) => {
    qq(".custom-select").forEach((root) => {
      if (!root.contains(event.target)) root.classList.remove("open");
    });
  });
}

async function submitArticleForm(event) {
  event.preventDefault();
  const editId = q("#articleEditId").value;
  const payload = {
    category: q("#articleCategory").value,
    status: q("#articleStatus").value,
    title: q("#articleTitle").value.trim(),
    content: q("#articleContent").value.trim(),
    hot: q("#articleHot").checked,
  };

  if (!payload.title || !payload.content) {
    showToast("请填写完整文章标题与内容", true);
    return;
  }

  if (editId) {
    await apiRequest(`/api/admin/articles/${editId}`, { method: "PUT", body: payload });
    showToast("文章已更新");
  } else {
    await apiRequest("/api/admin/articles", { method: "POST", body: payload });
    showToast("文章已新增");
  }

  closeModal("articleEditorModalBackdrop");
  await loadAdminData();
}

async function submitOrderForm(event) {
  event.preventDefault();
  const editId = q("#orderEditId").value;
  const payload = {
    title: q("#orderTitle").value.trim(),
    tag: q("#orderTag").value.trim(),
    description: q("#orderDesc").value.trim(),
    minAmount: Number(q("#orderMinAmount").value || 0),
    status: q("#orderStatus").value,
    freezeMin: Number(q("#orderFreezeMin").value || 0),
    freezeMax: Number(q("#orderFreezeMax").value || 0),
    rateMin: Number(q("#orderRateMin").value || 0),
    rateMax: Number(q("#orderRateMax").value || 0),
  };

  if (!payload.title || payload.minAmount <= 0) {
    showToast("请填写完整订单标题与起投金额", true);
    return;
  }

  if (editId) {
    await apiRequest(`/api/admin/orders/${editId}`, { method: "PUT", body: payload });
    showToast("订单模板已更新");
  } else {
    await apiRequest("/api/admin/orders", { method: "POST", body: payload });
    showToast("订单模板已新增");
  }

  closeModal("orderEditorModalBackdrop");
  await loadAdminData();
}

function bindHomeManage() {
  q("#homeConfigForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/admin/home-config", {
        method: "PUT",
        body: {
          title: q("#homeTitle").value.trim(),
          subtitle: q("#homeSubtitle").value.trim(),
          description: q("#homeDescription").value.trim(),
        },
      });
      await loadAdminData();
      showToast("首页配置已保存");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#openArticleModalBtn").addEventListener("click", () => {
    resetArticleForm();
    q("#articleModalTitle").textContent = "新增文章";
    openModal("articleEditorModalBackdrop");
  });

  q("#articleForm").addEventListener("submit", async (event) => {
    try {
      await submitArticleForm(event);
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#articleResetBtn").addEventListener("click", resetArticleForm);
  q("#closeArticleEditorModal").addEventListener("click", () => closeModal("articleEditorModalBackdrop"));
  q("#articleEditorModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "articleEditorModalBackdrop") closeModal("articleEditorModalBackdrop");
  });

  q("#articleTableBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-article-action]");
    if (!button) return;
    const action = button.dataset.articleAction;
    const id = button.dataset.id;
    const row = state.articles.find((item) => item.id === id);
    if (!row) return;

    try {
      if (action === "edit") {
        fillArticleForm(row);
        q("#articleModalTitle").textContent = "编辑文章";
        openModal("articleEditorModalBackdrop");
        return;
      }
      if (action === "archive") {
        await apiRequest(`/api/admin/articles/${id}/archive`, { method: "POST" });
        await loadAdminData();
        showToast("文章已归档");
      }
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function openGenerateOrdersModal(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  q("#genUserId").value = userId;
  q("#generateOrdersHint").textContent = `目标用户：${user.account}，可用本金：${formatMoney(user.principalAvailable)}`;
  q("#genTotalAmount").value = "";
  q("#genOrderCount").value = "5";
  q("#genFreezeMin").value = "";
  q("#genFreezeMax").value = "";
  q("#genRateMin").value = "";
  q("#genRateMax").value = "";
  q("#genTimeStart").value = "";
  q("#genTimeEnd").value = "";
  openModal("generateOrdersModalBackdrop");
  q("#genTotalAmount").focus();
}

function closeGenerateOrdersModal() {
  q("#generateOrdersForm").reset();
  closeModal("generateOrdersModalBackdrop");
}

function bindGenerateOrdersModal() {
  q("#closeGenerateOrdersModal").addEventListener("click", closeGenerateOrdersModal);
  q("#cancelGenerateOrdersBtn").addEventListener("click", closeGenerateOrdersModal);
  q("#generateOrdersModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "generateOrdersModalBackdrop") closeGenerateOrdersModal();
  });

  q("#generateOrdersForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = q("#genUserId").value;
    const totalAmount = Number(q("#genTotalAmount").value || 0);
    const orderCount = Number(q("#genOrderCount").value || 1);

    if (!userId || totalAmount <= 0 || orderCount < 1) {
      showToast("请填写有效的总金额和订单条数", true);
      return;
    }

    const body = { totalAmount, orderCount };
    const fMin = q("#genFreezeMin").value;
    const fMax = q("#genFreezeMax").value;
    const rMin = q("#genRateMin").value;
    const rMax = q("#genRateMax").value;
    const tStart = q("#genTimeStart").value;
    const tEnd = q("#genTimeEnd").value;

    if (fMin) body.freezeMin = Number(fMin);
    if (fMax) body.freezeMax = Number(fMax);
    if (rMin) body.rateMin = Number(rMin);
    if (rMax) body.rateMax = Number(rMax);
    if (tStart) body.timeStart = tStart.replace("T", " ") + ":00";
    if (tEnd) body.timeEnd = tEnd.replace("T", " ") + ":00";

    try {
      const result = await apiRequest(`/api/admin/users/${userId}/generate-orders`, {
        method: "POST",
        body,
      });
      await loadAdminData();
      closeGenerateOrdersModal();
      showToast(`已生成 ${result.generated} 笔订单（完成${result.doneCount}笔，进行中${result.runningCount}笔）`);
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

async function loadOrderGenDefaults() {
  try {
    const data = await apiRequest("/api/admin/order-generation-defaults");
    q("#ogdFreezeMin").value = String(data.freezeMin || 1);
    q("#ogdFreezeMax").value = String(data.freezeMax || 4);
    q("#ogdRateMin").value = String(data.rateMin || 2);
    q("#ogdRateMax").value = String(data.rateMax || 4.5);
    if (data.timeStart) {
      q("#ogdTimeStart").value = data.timeStart.replace(" ", "T").slice(0, 16);
    }
    if (data.timeEnd) {
      q("#ogdTimeEnd").value = data.timeEnd.replace(" ", "T").slice(0, 16);
    }
    const pool = Array.isArray(data.projectPool) ? data.projectPool : [];
    q("#ogdProjectPool").value = pool.join("\n");
  } catch { /* keep form empty */ }
}

function bindOrderGenDefaults() {
  q("#orderGenDefaultsForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const freezeMin = Number(q("#ogdFreezeMin").value || 0);
    const freezeMax = Number(q("#ogdFreezeMax").value || 0);
    const rateMin = Number(q("#ogdRateMin").value || 0);
    const rateMax = Number(q("#ogdRateMax").value || 0);
    const timeStart = (q("#ogdTimeStart").value || "").replace("T", " ") + ":00";
    const timeEnd = (q("#ogdTimeEnd").value || "").replace("T", " ") + ":00";
    const poolText = q("#ogdProjectPool").value.trim();
    const projectPool = poolText ? poolText.split("\n").map((s) => s.trim()).filter(Boolean) : [];

    try {
      await apiRequest("/api/admin/order-generation-defaults", {
        method: "PUT",
        body: { freezeMin, freezeMax, rateMin, rateMax, timeStart, timeEnd, projectPool },
      });
      showToast("默认配置已保存");
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function bindUserManage() {
  q("#userTableBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-user-action]");
    if (!button) return;

    const action = button.dataset.userAction;
    const userId = button.dataset.id;

    try {
      if (action === "toggle") {
        await apiRequest(`/api/admin/users/${userId}/toggle`, { method: "POST" });
        await loadAdminData();
        showToast("账号状态已更新");
        return;
      }
      if (action === "add" || action === "sub") {
        const user = state.users.find((item) => item.id === userId);
        openBalanceAdjustModal({
          userId,
          direction: action,
          account: user?.account || "未知用户",
        });
        return;
      }
      if (action === "generate") {
        openGenerateOrdersModal(userId);
        return;
      }
      if (action === "viewOrders") {
        openUserOrdersModal(userId);
        return;
      }
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function bindOrderManage() {
  q("#openOrderModalBtn").addEventListener("click", () => {
    resetOrderForm();
    q("#orderModalTitle").textContent = "新增订单模板";
    openModal("orderEditorModalBackdrop");
  });

  q("#orderForm").addEventListener("submit", async (event) => {
    try {
      await submitOrderForm(event);
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#orderResetBtn").addEventListener("click", resetOrderForm);
  q("#closeOrderEditorModal").addEventListener("click", () => closeModal("orderEditorModalBackdrop"));
  q("#orderEditorModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "orderEditorModalBackdrop") closeModal("orderEditorModalBackdrop");
  });

  q("#orderTableBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-order-action]");
    if (!button) return;
    const action = button.dataset.orderAction;
    const id = button.dataset.id;
    const row = state.orders.find((item) => item.id === id);
    if (!row) return;

    try {
      if (action === "edit") {
        fillOrderForm(row);
        q("#orderModalTitle").textContent = "编辑订单模板";
        openModal("orderEditorModalBackdrop");
        return;
      }
      if (action === "archive") {
        await apiRequest(`/api/admin/orders/${id}/archive`, { method: "POST" });
        await loadAdminData();
        showToast("订单模板已归档");
      }
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function bindAuditManage() {
  q("#depositTableBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-deposit-action]");
    if (!button) return;
    const action = button.dataset.depositAction;
    const id = button.dataset.id;

    try {
      if (action === "approve") {
        await apiRequest(`/api/admin/deposits/${id}/approve`, { method: "POST" });
        await loadAdminData();
        showToast("充值审核已更新");
        return;
      }
      openRejectReasonModal({ type: "deposit", recordId: id });
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#withdrawTableBody").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-withdraw-action]");
    if (!button) return;
    const action = button.dataset.withdrawAction;
    const id = button.dataset.id;

    try {
      if (action === "approve") {
        await apiRequest(`/api/admin/withdrawals/${id}/approve`, { method: "POST" });
        await loadAdminData();
        showToast("提现审核已更新");
        return;
      }
      openRejectReasonModal({ type: "withdraw", recordId: id });
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function bindSettings() {
  q("#agreementForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/admin/agreement", { method: "PUT", body: { content: q("#agreementText").value } });
      await loadAdminData();
      showToast("协议已保存");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#adminPasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPassword = q("#newAdminPassword").value.trim();
    const confirmPassword = q("#confirmAdminPassword").value.trim();

    if (newPassword !== confirmPassword) {
      showToast("两次输入的新密码不一致", true);
      return;
    }

    try {
      await apiRequest("/api/admin/password", { method: "PUT", body: { newPassword } });
      q("#newAdminPassword").value = "";
      q("#confirmAdminPassword").value = "";
      showToast("管理员密码更新成功");
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

let _userOrdersUserId = null;

function userOrderStatusText(status) {
  if (status === "done") return "已完成";
  if (status === "running") return "进行中";
  return status;
}

function userOrderStatusClass(status) {
  if (status === "done") return "enabled";
  if (status === "running") return "pending";
  return "";
}

async function openUserOrdersModal(userId) {
  _userOrdersUserId = userId;
  const user = state.users.find((u) => u.id === userId);
  q("#userOrdersTitle").textContent = `${user ? user.account : "用户"} 的订单`;

  q("#userOrdersTableBody").innerHTML = '<tr><td colspan="8" class="empty">加载中…</td></tr>';
  q("#userOrdersSelectAll").checked = false;
  q("#deleteSelectedOrdersBtn").disabled = true;
  openModal("userOrdersModalBackdrop");

  try {
    const data = await apiRequest(`/api/admin/users/${userId}/orders`);
    renderUserOrdersTable(data.orders || []);
  } catch (error) {
    q("#userOrdersTableBody").innerHTML = `<tr><td colspan="8" class="empty">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderUserOrdersTable(orders) {
  const body = q("#userOrdersTableBody");
  if (!orders.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无订单</td></tr>';
    return;
  }

  body.innerHTML = orders
    .map((o) => `
      <tr>
        <td><input type="checkbox" class="user-order-check" data-oid="${o.id}" /></td>
        <td>${escapeHtml(o.orderCode || "")}</td>
        <td>${escapeHtml(o.productName || "")}</td>
        <td>${formatMoney(o.amount)}</td>
        <td>${formatMoney(o.profit)}</td>
        <td><span class="status ${userOrderStatusClass(o.status)}">${userOrderStatusText(o.status)}</span></td>
        <td style="white-space:nowrap">${escapeHtml(o.submittedAt || "")}</td>
        <td style="white-space:nowrap">${escapeHtml(o.settleAt || "")}</td>
      </tr>
    `)
    .join("");

  syncDeleteBtnState();
}

function syncDeleteBtnState() {
  const checked = qq(".user-order-check:checked");
  q("#deleteSelectedOrdersBtn").disabled = !checked.length;
}

let _confirmDeleteResolve = null;

function showConfirmDeleteModal(count) {
  return new Promise((resolve) => {
    _confirmDeleteResolve = resolve;
    q("#confirmDeleteMsg").textContent = `确认删除选中的 ${count} 条订单？已完成订单的收益将被扣减，进行中订单将解冻本金。`;
    openModal("confirmDeleteModalBackdrop");
  });
}

function closeConfirmDeleteModal(result) {
  closeModal("confirmDeleteModalBackdrop");
  if (_confirmDeleteResolve) {
    _confirmDeleteResolve(result);
    _confirmDeleteResolve = null;
  }
}

async function deleteSelectedOrders() {
  const checked = qq(".user-order-check:checked");
  const ids = [...checked].map((c) => c.dataset.oid);
  if (!ids.length) return;

  const confirmed = await showConfirmDeleteModal(ids.length);
  if (!confirmed) return;

  try {
    await apiRequest(`/api/admin/users/${_userOrdersUserId}/delete-orders`, { method: "POST", body: { orderIds: ids } });
    showToast(`成功删除 ${ids.length} 条订单`);
    await loadAdminData();
    await openUserOrdersModal(_userOrdersUserId);
  } catch (error) {
    showToast(error.message, true);
  }
}

function bindUserOrdersModal() {
  q("#closeUserOrdersModal").addEventListener("click", () => closeModal("userOrdersModalBackdrop"));
  q("#cancelUserOrdersBtn").addEventListener("click", () => closeModal("userOrdersModalBackdrop"));
  q("#userOrdersModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "userOrdersModalBackdrop") closeModal("userOrdersModalBackdrop");
  });

  q("#userOrdersSelectAll").addEventListener("change", (e) => {
    qq(".user-order-check").forEach((cb) => { cb.checked = e.target.checked; });
    syncDeleteBtnState();
  });

  q("#userOrdersTableBody").addEventListener("change", (e) => {
    if (e.target.classList.contains("user-order-check")) {
      const all = qq(".user-order-check");
      const checked = qq(".user-order-check:checked");
      q("#userOrdersSelectAll").checked = all.length > 0 && all.length === checked.length;
      syncDeleteBtnState();
    }
  });

  q("#deleteSelectedOrdersBtn").addEventListener("click", deleteSelectedOrders);

  q("#confirmDeleteYes").addEventListener("click", () => closeConfirmDeleteModal(true));
  q("#confirmDeleteNo").addEventListener("click", () => closeConfirmDeleteModal(false));
  q("#confirmDeleteModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "confirmDeleteModalBackdrop") closeConfirmDeleteModal(false);
  });
}

function bindEventsOnce() {
  if (hasBoundEvents) return;
  bindSectionSwitch();
  bindCustomSelectClose();
  bindCustomSelect("articleCategorySelect", "articleCategory");
  bindCustomSelect("articleStatusSelect", "articleStatus");
  bindCustomSelect("orderStatusSelect", "orderStatus");
  bindHomeManage();
  bindActionInputModals();
  bindUserManage();
  bindOrderManage();
  bindAuditManage();
  bindSettings();
  bindGenerateOrdersModal();
  bindOrderGenDefaults();
  bindUserOrdersModal();
  hasBoundEvents = true;
}

async function enterAdminApp() {
  q("#loginView").classList.add("hidden");
  q("#adminApp").classList.remove("hidden");
  bindEventsOnce();
  await loadAdminData();
  await loadOrderGenDefaults();
  resetArticleForm();
  resetOrderForm();
  sectionSwitch("overview");
}

function bindLogin() {
  q("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = q("#loginUsername").value.trim();
    const password = q("#loginPassword").value.trim();

    try {
      const payload = await apiRequest("/api/admin/login", { method: "POST", body: { username, password } });
      state.token = payload.token;
      localStorage.setItem(ADMIN_TOKEN_KEY, state.token);
      showToast("登录成功");
      await enterAdminApp();
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#logoutBtn").addEventListener("click", () => {
    state.token = "";
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    q("#adminApp").classList.add("hidden");
    q("#loginView").classList.remove("hidden");
    q("#loginForm").reset();
    showToast("已退出登录");
  });
}

async function init() {
  bindLogin();
  if (!state.token) return;
  try {
    await enterAdminApp();
  } catch {
    state.token = "";
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

init();
