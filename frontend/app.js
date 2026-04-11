const API_BASE = "";
const USER_TOKEN_KEY = "lockpro_user_token";

const state = {
  token: localStorage.getItem(USER_TOKEN_KEY) || "",
  user: {
    id: "",
    username: "游客",
    status: "未登录",
    loggedIn: false,
  },
  wallet: {
    available: 0,
    frozen: 0,
    totalProfit: 0,
  },
  chartSeries: [],
  activeRange: "day",
  orderPreviewLimit: 4,
  products: [],
  selectedProductId: null,
  orderHistory: [],
  depositRecords: [],
  withdrawRecords: [],
  recordType: "deposit",
  depositMethod: "digital",
  withdrawMethod: "usdt",
  authMode: "login",
  siteConfig: null,
  agreementText: "",
  homeActiveTopic: "all",
  selectedHomeArticleId: null,
  homeArticles: [],
};

const defaultSiteConfig = {
  brandSubtitle: "Digital Asset Workspace",
  payment: {
    digitalAddress: "",
    bank: {
      bankName: "",
      accountName: "",
      accountNo: "",
      branch: "",
    },
  },
  agreementText: "",
  home: {
    tag: "内容专栏",
    title: "LockPro 内容中心",
    description: "围绕策略、系统和时事持续更新。",
    quickActions: [
      { label: "进入交易中心", target: "trade", variant: "primary" },
      { label: "打开个人中心", target: "profile", variant: "ghost" },
    ],
    topics: [
      { id: "hedge", label: "量化对冲套利" },
      { id: "system", label: "系统说明" },
      { id: "news", label: "区块链时事新闻" },
    ],
    articles: [],
  },
};

let toastTimer = null;

function q(selector) {
  return document.querySelector(selector);
}

function qq(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function showToast(message, isError = false) {
  const toast = q("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "rgba(106, 34, 34, 0.92)" : "rgba(23, 36, 78, 0.92)";
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

function walletTotal() {
  return Number(state.wallet.available || 0) + Number(state.wallet.frozen || 0);
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function formatDateText(text) {
  if (!text) return "--";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function updateSegmentIndicator(container, selector, indicator) {
  if (!container || !indicator) return;
  const active = container.querySelector(selector);
  if (!active) return;
  const cRect = container.getBoundingClientRect();
  const aRect = active.getBoundingClientRect();
  const left = aRect.left - cRect.left;
  indicator.style.width = `${aRect.width}px`;
  indicator.style.transform = `translateX(${left}px)`;
}

function refreshAllSegmentIndicators() {
  updateSegmentIndicator(q("#mainNav"), ".nav-btn.active", q("#segmentIndicator"));
  updateSegmentIndicator(q("#timeFilter"), ".time-btn.active", q("#timeIndicator"));
  updateSegmentIndicator(q("#homeTopicTabs"), ".home-topic-btn.active", q("#homeTopicIndicator"));
  updateSegmentIndicator(q("#authTabs"), ".auth-tab.active", q("#authIndicator"));
}

function switchSection(id) {
  qq(".section").forEach((section) => section.classList.toggle("active", section.id === id));
  qq(".nav-btn[data-section]").forEach((btn) => btn.classList.toggle("active", btn.dataset.section === id));
}

function initNav() {
  qq(".nav-btn[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchSection(btn.dataset.section);
      refreshAllSegmentIndicators();
    });
  });

  document.addEventListener("click", (event) => {
    const jumpTarget = event.target.closest("[data-jump]");
    if (!jumpTarget) return;
    const section = jumpTarget.dataset.jump;
    if (!section) return;
    switchSection(section);
    refreshAllSegmentIndicators();
  });
}

function resolveHomeTopics(home) {
  return safeArray(home.topics, defaultSiteConfig.home.topics)
    .map((item) => ({ id: safeString(item.id), label: safeString(item.label, "未命名专题") }))
    .filter((item) => item.id);
}

function resolveHomeArticles(home, topics) {
  const topicLabelMap = Object.fromEntries(topics.map((topic) => [topic.id, topic.label]));
  return safeArray(home.articles, defaultSiteConfig.home.articles)
    .map((item, index) => {
      const topicId = safeString(item.topicId, topics[0]?.id || "");
      return {
        id: safeString(item.id, `article_${index + 1}`),
        topicId,
        topicLabel: topicLabelMap[topicId] || "未分类",
        title: safeString(item.title, "未命名文章"),
        summary: safeString(item.summary, ""),
        content: safeString(item.content, ""),
        author: safeString(item.author, "LockPro"),
        publishedAt: safeString(item.publishedAt, ""),
        hot: Boolean(item.hot),
      };
    })
    .filter((item) => item.topicId);
}

function renderHomeTopics(topics) {
  const root = q("#homeTopicTabs");
  if (!root) return;

  root.querySelectorAll(".home-topic-btn").forEach((button) => button.remove());
  const list = [{ id: "all", label: "全部" }, ...topics];
  if (!list.some((item) => item.id === state.homeActiveTopic)) {
    state.homeActiveTopic = "all";
  }

  list.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `home-topic-btn${item.id === state.homeActiveTopic ? " active" : ""}`;
    btn.dataset.topicId = item.id;
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      state.homeActiveTopic = item.id;
      renderHomeArticles(state.homeArticles);
      renderHomeTopics(topics);
      refreshAllSegmentIndicators();
    });
    root.appendChild(btn);
  });

  const activeTopic = list.find((item) => item.id === state.homeActiveTopic) || list[0];
  q("#homeTopicMeta").textContent = activeTopic.id === "all" ? "全部文章" : activeTopic.label;
}

function openHomeArticleModal(articleId) {
  const article = state.homeArticles.find((item) => item.id === articleId);
  if (!article) return;

  q("#homeArticleModalTitle").textContent = article.title;
  const meta = q("#homeArticleModalMeta");
  meta.innerHTML = "";
  [article.topicLabel, article.author, formatDateText(article.publishedAt)].forEach((value) => {
    const chip = document.createElement("span");
    chip.textContent = value;
    meta.appendChild(chip);
  });
  if (article.hot) {
    const hot = document.createElement("span");
    hot.className = "article-hot";
    hot.textContent = "热门";
    meta.appendChild(hot);
  }

  const content = q("#homeArticleModalContent");
  content.innerHTML = "";
  const blocks = article.content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  (blocks.length ? blocks : [article.summary || "暂无正文内容"]).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    content.appendChild(p);
  });

  q("#homeArticleModalBackdrop")?.classList.add("open");
}

function closeHomeArticleModal() {
  q("#homeArticleModalBackdrop")?.classList.remove("open");
}

function renderHomeArticles(articles) {
  const root = q("#homeArticleList");
  if (!root) return;

  const filtered = state.homeActiveTopic === "all" ? articles : articles.filter((item) => item.topicId === state.homeActiveTopic);
  q("#homeArticleHint").textContent = `共 ${filtered.length} 篇`;

  root.innerHTML = "";
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "home-article-empty";
    empty.textContent = "当前专题暂时没有文章。";
    root.appendChild(empty);
    return;
  }

  filtered.forEach((article) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "home-article-item";
    item.addEventListener("click", () => openHomeArticleModal(article.id));

    item.innerHTML = `
      <div class="article-item-head">
        <h4 class="article-item-title">${article.title}</h4>
        <span class="article-topic">${article.topicLabel}</span>
      </div>
      <p class="article-item-summary">${article.summary}</p>
      <div class="article-item-meta">
        <span>${formatDateText(article.publishedAt)}</span>
        <span>${article.author}</span>
        ${article.hot ? '<span class="article-hot">热门</span>' : ""}
      </div>
    `;

    root.appendChild(item);
  });
}

function renderHomeContent(home) {
  q("#homeIntroTag").textContent = safeString(home.tag, defaultSiteConfig.home.tag);
  q("#homeIntroTitle").textContent = safeString(home.title, defaultSiteConfig.home.title);
  q("#homeIntroDesc").textContent = safeString(home.description, defaultSiteConfig.home.description);

  const actionRoot = q("#homeQuickActions");
  actionRoot.innerHTML = "";
  safeArray(home.quickActions, defaultSiteConfig.home.quickActions).forEach((item) => {
    const btn = document.createElement("button");
    btn.className = `btn ${item.variant === "ghost" ? "ghost" : "primary"}`;
    btn.dataset.jump = safeString(item.target, "trade");
    btn.textContent = safeString(item.label, "进入");
    actionRoot.appendChild(btn);
  });

  const topics = resolveHomeTopics(home);
  const articles = resolveHomeArticles(home, topics);
  state.homeArticles = articles;
  renderHomeTopics(topics);
  renderHomeArticles(articles);
}

function applySiteConfig(config) {
  const finalConfig = config || defaultSiteConfig;
  state.siteConfig = finalConfig;
  state.agreementText = safeString(finalConfig.agreementText, defaultSiteConfig.agreementText);

  const subtitleNode = q(".brand-text p");
  if (subtitleNode) subtitleNode.textContent = safeString(finalConfig.brandSubtitle, defaultSiteConfig.brandSubtitle);

  const home = finalConfig.home || defaultSiteConfig.home;
  renderHomeContent(home);

  const paymentConfig = finalConfig.payment || defaultSiteConfig.payment;
  q("#usdtAddress").textContent = safeString(paymentConfig.digitalAddress, defaultSiteConfig.payment.digitalAddress);

  const bank = paymentConfig.bank || defaultSiteConfig.payment.bank;
  q("#platformBankInfo").innerHTML = `
    <div class="bank-line"><span>开户行</span><span>${safeString(bank.bankName)}</span></div>
    <div class="bank-line"><span>户名</span><span>${safeString(bank.accountName)}</span></div>
    <div class="bank-line"><span>卡号</span><span>${safeString(bank.accountNo)}</span></div>
    <div class="bank-line"><span>支行</span><span>${safeString(bank.branch)}</span></div>
  `;

  q("#agreementContent").textContent = state.agreementText;
}

function mergeSiteConfig(raw) {
  if (!raw || typeof raw !== "object") return defaultSiteConfig;
  return {
    ...defaultSiteConfig,
    ...raw,
    payment: {
      ...defaultSiteConfig.payment,
      ...(raw.payment || {}),
      bank: {
        ...defaultSiteConfig.payment.bank,
        ...((raw.payment && raw.payment.bank) || {}),
      },
    },
    home: {
      ...defaultSiteConfig.home,
      ...(raw.home || {}),
    },
  };
}

async function loadSiteConfig() {
  applySiteConfig(defaultSiteConfig);
  try {
    const payload = await apiRequest("/api/site-config");
    applySiteConfig(mergeSiteConfig(payload));
  } catch {
    // keep default
  }
}

function buildChartSeriesFromOrders() {
  const now = Date.now();
  const base = Math.max(0, walletTotal() - state.wallet.totalProfit);
  const points = [{ ts: now - 24 * 60 * 60 * 1000, value: base }];

  const doneOrders = [...state.orderHistory]
    .filter((item) => item.status === "done")
    .sort((a, b) => a.settleAt - b.settleAt);

  let runningValue = base;
  doneOrders.forEach((order) => {
    runningValue += Number(order.profit || 0);
    points.push({ ts: order.settleAt, value: Number(runningValue.toFixed(2)) });
  });

  points.push({ ts: now, value: walletTotal() });
  state.chartSeries = points;
}

function downSample(data, maxPoints) {
  if (data.length <= maxPoints) return data;
  const sampled = [];
  const step = (data.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i += 1) {
    const idx = Math.round(i * step);
    sampled.push(data[idx]);
  }
  return sampled;
}

function getSeriesByRange(range) {
  const now = Date.now();
  const durations = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    all: null,
  };

  let data = state.chartSeries;
  if (durations[range]) {
    const limit = now - durations[range];
    data = state.chartSeries.filter((point) => point.ts >= limit);
  }

  if (data.length < 2) {
    const latest = state.chartSeries[state.chartSeries.length - 1] || { ts: now, value: walletTotal() };
    data = [{ ts: latest.ts - 1, value: latest.value }, latest];
  }

  const maxByRange = { day: 32, week: 46, month: 64, all: 90 };
  return downSample(data, maxByRange[range] || 64);
}

function updateWalletView() {
  q("#metricTotal").textContent = money(walletTotal());
  q("#metricAvailable").textContent = money(state.wallet.available);
  q("#metricFrozen").textContent = money(state.wallet.frozen);
  q("#metricProfit").textContent = money(state.wallet.totalProfit);
  q("#profileTotal").textContent = money(walletTotal());
  q("#displayUsername").textContent = state.user.username || "游客";
  q("#profileStatus").textContent = state.user.loggedIn ? "已登录" : "未登录";
}

function updateRangeStats(series) {
  const first = series[0].value;
  const last = series[series.length - 1].value;
  const high = Math.max(...series.map((p) => p.value));
  const low = Math.min(...series.map((p) => p.value));
  const profit = last - first;

  const rangeProfitEl = q("#rangeProfit");
  rangeProfitEl.textContent = `${profit >= 0 ? "+" : ""}${money(profit)}`;
  rangeProfitEl.style.color = profit >= 0 ? "#1f9d55" : "#d83a3a";
  q("#rangeHigh").textContent = money(high);
  q("#rangeLow").textContent = money(low);
}

function drawPnlChart() {
  const canvas = q("#pnlChart");
  if (!canvas) return;
  const parentWidth = canvas.parentElement.clientWidth;
  const width = Math.max(320, Math.floor(parentWidth - 36));
  const height = 280;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const data = getSeriesByRange(state.activeRange);
  updateRangeStats(data);

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padX = 24;
  const padY = 24;
  const drawW = width - padX * 2;
  const drawH = height - padY * 2;

  const toX = (index) => padX + (index / (data.length - 1 || 1)) * drawW;
  const toY = (value) => {
    const ratio = (value - min) / (max - min || 1);
    return padY + (1 - ratio) * drawH;
  };

  ctx.strokeStyle = "rgba(76, 117, 255, 0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, height - padY);
  ctx.lineTo(width - padX, height - padY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0].value));
  for (let i = 1; i < data.length; i += 1) ctx.lineTo(toX(i), toY(data[i].value));
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = "#2fbf9f";
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padY, 0, height - padY);
  gradient.addColorStop(0, "rgba(47, 191, 159, 0.28)");
  gradient.addColorStop(1, "rgba(47, 191, 159, 0)");

  ctx.lineTo(toX(data.length - 1), height - padY);
  ctx.lineTo(toX(0), height - padY);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  const last = data[data.length - 1];
  const lx = toX(data.length - 1);
  const ly = toY(last.value);
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#2fbf9f";
  ctx.fill();
}

function renderProductCard(product, compact = false) {
  if (compact) {
    return `
      <div class="title-row">
        <h4>${product.name}</h4>
        <span class="status done">开放中</span>
      </div>
      <p>${product.subtitle || ""}</p>
      <div class="meta-row">
        <span class="meta-pill">起投 ${money(product.minAmount)}</span>
        <span class="meta-pill">支持快速入场</span>
      </div>
      <div style="margin-top:10px;"><button class="btn primary sm" data-invest-id="${product.id}">立即下单</button></div>
    `;
  }

  return `
    <div class="all-product-head">
      <h4>${product.name}</h4>
      <span class="status done">开放中</span>
    </div>
    <p>${product.subtitle || ""}</p>
    <div class="meta-row">
      <span class="meta-pill">起投 ${money(product.minAmount)}</span>
      <span class="meta-pill">优先撮合</span>
    </div>
    <div style="margin-top:10px;"><button class="btn primary sm" data-invest-id="${product.id}">立即下单</button></div>
  `;
}

function bindInvestButtons(scopeRoot = document) {
  scopeRoot.querySelectorAll("[data-invest-id]").forEach((btn) => {
    btn.onclick = () => openOrderModal(btn.dataset.investId);
  });
}

function renderAllProductsList() {
  const root = q("#allProductsList");
  root.innerHTML = "";
  if (!state.products.length) {
    root.innerHTML = '<div class="order-item">暂无可用订单</div>';
    return;
  }

  state.products.forEach((product) => {
    const item = document.createElement("article");
    item.className = "order-item all-product-item";
    item.innerHTML = renderProductCard(product, false);
    root.appendChild(item);
  });
  bindInvestButtons(root);
}

function renderOrderProducts() {
  const root = q("#orderList");
  root.innerHTML = "";

  const preview = state.products.slice(0, state.orderPreviewLimit);
  preview.forEach((product) => {
    const item = document.createElement("article");
    item.className = "order-item";
    item.innerHTML = renderProductCard(product, true);
    root.appendChild(item);
  });

  const remainCount = state.products.length - preview.length;
  if (remainCount > 0) {
    const tip = document.createElement("article");
    tip.className = "order-item order-preview-note";
    tip.innerHTML = `<p>还有 ${remainCount} 个订单可选，点击“查看全部”浏览完整列表。</p>`;
    root.appendChild(tip);
  }

  bindInvestButtons(root);
  renderAllProductsList();
}

function renderOrderHistory() {
  const tbody = q("#orderHistoryBody");
  tbody.innerHTML = "";

  if (!state.orderHistory.length) {
    tbody.innerHTML = '<tr><td colspan="6">暂无订单记录</td></tr>';
    return;
  }

  state.orderHistory.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.productName}</td>
      <td>${money(order.amount)}</td>
      <td>${money(order.profit)}</td>
      <td><span class="status ${order.status === "done" ? "done" : "running"}">${order.status === "done" ? "已完成" : "进行中"}</span></td>
      <td>${new Date(order.submittedAt).toLocaleString("zh-CN", { hour12: false })}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRecords() {
  const list = q("#recordList");
  list.innerHTML = "";
  let records = [];

  if (state.recordType === "deposit") {
    records = state.depositRecords.map((record) => ({
      title: `充值申请 ${money(record.amount)}`,
      desc: `方式：${record.method} ｜ 状态：${record.status}${record.reason ? ` ｜ 原因：${record.reason}` : ""}`,
      time: record.time,
    }));
  } else if (state.recordType === "withdraw") {
    records = state.withdrawRecords.map((record) => ({
      title: `提现申请 ${money(record.amount)}`,
      desc: `方式：${record.method} ｜ 状态：${record.status}${record.reason ? ` ｜ 原因：${record.reason}` : ""}`,
      time: record.time,
    }));
  } else {
    records = state.orderHistory.map((record) => ({
      title: `${record.productName} ｜ ${money(record.amount)}`,
      desc: `订单号：${record.id} ｜ 收益：${money(record.profit)} ｜ ${record.status === "done" ? "已完成" : "进行中"}`,
      time: record.submittedAt,
    }));
  }

  if (!records.length) {
    list.innerHTML = '<li class="record-item">暂无记录</li>';
    return;
  }

  records.forEach((record) => {
    const li = document.createElement("li");
    li.className = "record-item";
    li.innerHTML = `
      <div class="line-1"><span>${record.title}</span><span>${new Date(record.time).toLocaleString("zh-CN", { hour12: false })}</span></div>
      <div class="line-2">${record.desc}</div>
    `;
    list.appendChild(li);
  });
}

function closeProductsModal() {
  q("#productsModalBackdrop")?.classList.remove("open");
}

function openProductsModal() {
  renderAllProductsList();
  q("#productsModalBackdrop")?.classList.add("open");
}

function openOrderModal(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  if (!state.user.loggedIn) {
    showToast("请先登录", true);
    q("#authModalBackdrop").classList.add("open");
    return;
  }

  closeProductsModal();
  state.selectedProductId = productId;
  q("#selectedProductName").textContent = product.name;
  q("#selectedProductMeta").textContent = `起投 ${money(product.minAmount)}，确认金额后提交。`;
  q("#orderAmount").value = "";
  q("#orderModalBackdrop").classList.add("open");
}

function closeOrderModal() {
  q("#orderModalBackdrop").classList.remove("open");
}

function applySummary(summary) {
  if (!summary) return;
  state.user.id = summary.user.id;
  state.user.username = summary.user.username;
  state.user.status = summary.user.status;
  state.user.loggedIn = true;

  state.wallet.available = Number(summary.wallet.available || 0);
  state.wallet.frozen = Number(summary.wallet.frozen || 0);
  state.wallet.totalProfit = Number(summary.wallet.totalProfit || 0);

  state.orderHistory = safeArray(summary.orderHistory, []);
  state.depositRecords = safeArray(summary.depositRecords, []);
  state.withdrawRecords = safeArray(summary.withdrawRecords, []);

  buildChartSeriesFromOrders();
  updateWalletView();
  drawPnlChart();
  renderOrderHistory();
  renderRecords();
}

async function loadProducts() {
  try {
    const payload = await apiRequest("/api/orders/templates");
    state.products = safeArray(payload.products, []);
  } catch {
    state.products = [];
  }
  renderOrderProducts();
}

async function refreshUserSummary() {
  if (!state.token) return;
  const summary = await apiRequest("/api/me/summary");
  applySummary(summary);
}

async function submitOrder() {
  const product = state.products.find((item) => item.id === state.selectedProductId);
  const amount = Number(q("#orderAmount").value || 0);
  if (!product) {
    showToast("订单项目不存在", true);
    return;
  }
  if (amount < Number(product.minAmount || 0)) {
    showToast(`当前项目最低金额 ${money(product.minAmount)}`, true);
    return;
  }

  try {
    const payload = await apiRequest("/api/orders", {
      method: "POST",
      body: { templateId: product.id, amount },
    });
    applySummary(payload.summary);
    closeOrderModal();
    showToast("订单已提交");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function settleDueOrders(force = false) {
  if (!state.user.loggedIn) return;
  try {
    const payload = await apiRequest("/api/orders/settle", {
      method: "POST",
      body: { force },
    });
    applySummary(payload.summary);
    if (payload.settledCount > 0) showToast(`已更新 ${payload.settledCount} 条订单状态`);
  } catch (_error) {
    // silent for interval checks
  }
}

function copyAddress() {
  const address = q("#usdtAddress").textContent;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(address).then(
      () => showToast("地址已复制"),
      () => showToast("复制失败，请手动复制", true)
    );
    return;
  }
  const temp = document.createElement("textarea");
  temp.value = address;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  showToast("地址已复制");
}

function initAuthChannelSelect() {
  const root = q("#authChannelSelect");
  const trigger = q("#authChannelTrigger");
  const label = q("#authChannelLabel");
  const input = q("#authChannel");
  if (!root || !trigger || !label || !input) return;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    root.classList.toggle("open");
  });

  qq(".custom-select-option").forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "account";
      input.value = value;
      label.textContent = option.textContent.trim();
      qq(".custom-select-option").forEach((item) => item.classList.toggle("active", item === option));
      root.classList.remove("open");
    });
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) root.classList.remove("open");
  });
}

function setAuthMode(mode) {
  state.authMode = mode;
  qq(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.authType === mode));
  const isRegister = mode === "register";
  q("#confirmPasswordField").style.display = isRegister ? "block" : "none";
  q("#agreementCheckRow").style.display = isRegister ? "inline-flex" : "none";
  q("#authSubmitBtn").textContent = isRegister ? "立即注册" : "立即登录";
  refreshAllSegmentIndicators();
}

function initAuth() {
  q("#agreementContent").textContent = state.agreementText || defaultSiteConfig.agreementText;
  initAuthChannelSelect();

  q("#authBtn").addEventListener("click", () => q("#authModalBackdrop").classList.add("open"));
  q("#closeAuthModal").addEventListener("click", () => q("#authModalBackdrop").classList.remove("open"));
  q("#authModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "authModalBackdrop") q("#authModalBackdrop").classList.remove("open");
  });

  qq(".auth-tab").forEach((tab) => tab.addEventListener("click", () => setAuthMode(tab.dataset.authType)));

  q("#openAgreementBtn").addEventListener("click", () => q("#agreementModalBackdrop").classList.add("open"));
  q("#closeAgreementModal").addEventListener("click", () => q("#agreementModalBackdrop").classList.remove("open"));
  q("#agreementModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "agreementModalBackdrop") q("#agreementModalBackdrop").classList.remove("open");
  });

  q("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = q("#authUsername").value.trim();
    const password = q("#authPassword").value.trim();
    const confirmPassword = q("#authConfirmPassword").value.trim();
    const agreed = q("#agreementCheck").checked;
    const channel = q("#authChannel").value;

    if (!username || !password) {
      showToast("请输入账号和密码", true);
      return;
    }

    try {
      let payload;
      if (state.authMode === "register") {
        if (!confirmPassword || confirmPassword !== password) {
          showToast("两次密码不一致", true);
          return;
        }
        if (!agreed) {
          showToast("请先勾选用户协议", true);
          return;
        }
        payload = await apiRequest("/api/auth/register", {
          method: "POST",
          body: { username, password, channel },
        });
      } else {
        payload = await apiRequest("/api/auth/login", {
          method: "POST",
          body: { username, password },
        });
      }

      state.token = payload.token;
      localStorage.setItem(USER_TOKEN_KEY, state.token);
      applySummary(payload.summary);
      q("#authForm").reset();
      setAuthMode("login");
      q("#authModalBackdrop").classList.remove("open");
      showToast(state.authMode === "register" ? "注册成功" : "登录成功");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  setAuthMode("login");
}

function initPaymentForms() {
  q("#copyAddressBtn").addEventListener("click", copyAddress);

  const screenshotInput = q("#depositScreenshot");
  const hint = q("#depositScreenshotHint");
  screenshotInput.addEventListener("change", () => {
    const file = screenshotInput.files?.[0];
    hint.textContent = file ? `已选择截图：${file.name}` : "请上传清晰的转账截图，便于后台审核。";
  });

  qq(".switch-btn[data-deposit-method]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.depositMethod = btn.dataset.depositMethod;
      qq(".switch-btn[data-deposit-method]").forEach((item) => {
        item.classList.toggle("active", item.dataset.depositMethod === state.depositMethod);
      });
      q("#depositDigitalPanel").classList.toggle("active", state.depositMethod === "digital");
      q("#depositBankPanel").classList.toggle("active", state.depositMethod === "bank");
    });
  });

  qq(".switch-btn[data-method]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.withdrawMethod = btn.dataset.method;
      qq(".switch-btn[data-method]").forEach((item) => item.classList.toggle("active", item.dataset.method === state.withdrawMethod));
      q("#withdrawUSDT").classList.toggle("active", state.withdrawMethod === "usdt");
      q("#withdrawBank").classList.toggle("active", state.withdrawMethod === "bank");
    });
  });

  q("#depositForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.user.loggedIn) {
      showToast("请先登录", true);
      return;
    }

    const amount = Number(q("#depositAmount").value || 0);
    const file = screenshotInput.files?.[0];
    if (!amount || !file) {
      showToast("请填写完整的充值信息", true);
      return;
    }

    const formData = new FormData();
    formData.append("amount", String(amount));
    formData.append("method", state.depositMethod);
    formData.append("screenshot", file);

    try {
      const payload = await apiRequest("/api/deposits", { method: "POST", body: formData });
      applySummary(payload.summary);
      event.target.reset();
      hint.textContent = "请上传清晰的转账截图，便于后台审核。";
      showToast("充值申请已提交");
    } catch (error) {
      showToast(error.message, true);
    }
  });

  q("#withdrawForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.user.loggedIn) {
      showToast("请先登录", true);
      return;
    }

    const amount = Number(q("#withdrawAmount").value || 0);
    if (!amount || amount > state.wallet.available) {
      showToast("提现金额不合法或超出余额", true);
      return;
    }

    const payload = {
      amount,
      method: state.withdrawMethod,
      usdtAddress: q("#withdrawUsdtAddress").value.trim(),
      bankName: q("#bankName").value.trim(),
      bankOwner: q("#bankOwner").value.trim(),
      bankNo: q("#bankNo").value.trim(),
    };

    try {
      const data = await apiRequest("/api/withdrawals", { method: "POST", body: payload });
      applySummary(data.summary);
      event.target.reset();
      state.withdrawMethod = "usdt";
      qq(".switch-btn[data-method]").forEach((btn) => btn.classList.toggle("active", btn.dataset.method === "usdt"));
      q("#withdrawUSDT").classList.add("active");
      q("#withdrawBank").classList.remove("active");
      showToast("提现申请已提交");
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

function initRecordSwitch() {
  qq(".switch-btn[data-record]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.recordType = btn.dataset.record;
      qq(".switch-btn[data-record]").forEach((item) => item.classList.toggle("active", item.dataset.record === state.recordType));
      renderRecords();
    });
  });
}

function initOrderModal() {
  q("#closeOrderModal").addEventListener("click", closeOrderModal);
  q("#orderModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "orderModalBackdrop") closeOrderModal();
  });
  q("#confirmOrderBtn").addEventListener("click", submitOrder);
  qq("[data-portion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const portion = Number(btn.dataset.portion);
      q("#orderAmount").value = Number(state.wallet.available * portion).toFixed(2);
    });
  });
}

function initProductsModal() {
  q("#viewAllProductsBtn").addEventListener("click", openProductsModal);
  q("#closeProductsModal").addEventListener("click", closeProductsModal);
  q("#productsModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "productsModalBackdrop") closeProductsModal();
  });
}

function initHomeArticleModal() {
  q("#closeHomeArticleModal").addEventListener("click", closeHomeArticleModal);
  q("#homeArticleModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "homeArticleModalBackdrop") closeHomeArticleModal();
  });
}

function initTimeFilter() {
  qq(".time-btn[data-range]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeRange = btn.dataset.range;
      qq(".time-btn[data-range]").forEach((item) => item.classList.toggle("active", item.dataset.range === state.activeRange));
      refreshAllSegmentIndicators();
      drawPnlChart();
    });
  });
}

function initSettleControls() {
  q("#settleNowBtn").addEventListener("click", () => settleDueOrders(true));
  setInterval(() => settleDueOrders(false), 15000);
}

async function bootstrapUserSession() {
  if (!state.token) {
    buildChartSeriesFromOrders();
    updateWalletView();
    drawPnlChart();
    renderOrderHistory();
    renderRecords();
    return;
  }

  try {
    await refreshUserSummary();
  } catch {
    state.token = "";
    localStorage.removeItem(USER_TOKEN_KEY);
    buildChartSeriesFromOrders();
    updateWalletView();
    drawPnlChart();
    renderOrderHistory();
    renderRecords();
  }
}

async function init() {
  initNav();
  initOrderModal();
  initProductsModal();
  initHomeArticleModal();
  initTimeFilter();
  initPaymentForms();
  initRecordSwitch();
  initAuth();
  initSettleControls();

  await loadSiteConfig();
  await loadProducts();
  await bootstrapUserSession();

  refreshAllSegmentIndicators();

  window.addEventListener("resize", () => {
    drawPnlChart();
    refreshAllSegmentIndicators();
  });
}

init();
