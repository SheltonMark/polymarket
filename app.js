const state = {
  user: {
    username: "sunny168",
    registered: false,
    loggedIn: false,
  },
  wallet: {
    available: 1260.0,
    frozen: 0,
    totalProfit: 0,
  },
  chartSeries: [],
  activeRange: "day",
  orderPreviewLimit: 4,
  products: [
    {
      id: "od_301",
      name: "Prime Growth",
      subtitle: "热门订单池，活跃度高",
      minAmount: 120,
      durationMs: 38 * 1000,
      minRate: 0.018,
      maxRate: 0.042,
      status: "open",
    },
    {
      id: "od_302",
      name: "Event Alpha",
      subtitle: "跨市场组合，流动性稳定",
      minAmount: 220,
      durationMs: 55 * 1000,
      minRate: 0.02,
      maxRate: 0.038,
      status: "open",
    },
    {
      id: "od_303",
      name: "Momentum Core",
      subtitle: "中高频策略组合，成交活跃",
      minAmount: 360,
      durationMs: 70 * 1000,
      minRate: 0.022,
      maxRate: 0.05,
      status: "open",
    },
    {
      id: "od_304",
      name: "Value Matrix",
      subtitle: "多市场覆盖，策略稳定",
      minAmount: 180,
      durationMs: 52 * 1000,
      minRate: 0.019,
      maxRate: 0.041,
      status: "open",
    },
    {
      id: "od_305",
      name: "Pulse Select",
      subtitle: "快节奏标的池，流转效率高",
      minAmount: 260,
      durationMs: 66 * 1000,
      minRate: 0.02,
      maxRate: 0.048,
      status: "open",
    },
  ],
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
};

const defaultSiteConfig = {
  brandSubtitle: "Digital Asset Workspace",
  payment: {
    digitalAddress: "TRON-TX5V8ZVQ2FJ3L8KM9P6S1N4Q7R2W0YH8J",
    bank: {
      bankName: "招商银行",
      accountName: "平台结算账户",
      accountNo: "6225 8888 7766 1098",
      branch: "深圳南山支行",
    },
  },
  agreementText: `【用户协议】

1. 用户在注册前应完整阅读并同意本协议条款。
2. 用户需确保提交的账户与收款信息真实、有效、可核验。
3. 平台有权依据风控规则对异常行为进行限制或进一步核验。
4. 用户应妥善保管账号与密码，因个人原因造成的损失由用户承担。
5. 本协议最终解释与更新说明以平台最新发布版本为准。`,
  home: {
    chip: "平台说明",
    title: "稳定、清晰、可追踪的数字资产操作台",
    description:
      "提供账户总览、订单操作、资金申请与记录查询。页面采用卡片式布局，交互简洁明确，方便用户快速定位关键操作。",
    heroActions: [
      { label: "进入交易中心", target: "trade", variant: "primary" },
      { label: "打开个人中心", target: "profile", variant: "ghost" },
    ],
    heroStats: [
      { label: "今日访问", value: "12,860" },
      { label: "在线用户", value: "1,284" },
      { label: "已完成订单", value: "9,462" },
    ],
    highlights: [
      { title: "资产更新", desc: "账户资产卡片随交易状态刷新，关键数值优先展示。" },
      { title: "订单执行", desc: "订单支持快速下单、跟踪与状态回看。" },
      { title: "资金处理", desc: "充值与提现申请统一集中管理，记录可追溯。" },
      { title: "权限入口", desc: "注册与登录合并在同一弹窗，流程更集中。" },
    ],
    carousel: [
      { title: "资产总览", description: "顶部指标卡实时展示账户金额变化，便于快速掌握当前资产状态。" },
      { title: "订单执行", description: "订单区支持快速下单和记录跟踪，确认信息后即可完成提交。" },
      { title: "账户管理", description: "个人中心集中处理充值、提现、协议查看和账户设置类操作。" },
    ],
    quickLinks: [
      { label: "收益曲线", target: "trade" },
      { label: "订单簿", target: "trade" },
      { label: "充值 / 提现", target: "profile" },
      { label: "账户记录", target: "profile" },
    ],
    notices: [
      "注册时需阅读并勾选用户协议后方可完成注册。",
      "充值与提现申请均需先提交信息，等待人工处理结果。",
      "订单、资金与账户记录可在个人中心统一查询。",
      "请妥善保管账号密码并定期更新登录凭据。",
    ],
  },
};

let toastTimer = null;
let carouselTimer = null;
let carouselIndex = 0;

function q(selector) {
  return document.querySelector(selector);
}

function qq(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
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

function walletTotal() {
  return state.wallet.available + state.wallet.frozen;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeArray(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function applySiteConfig(config) {
  const finalConfig = config || defaultSiteConfig;
  state.siteConfig = finalConfig;
  state.agreementText = safeString(finalConfig.agreementText, defaultSiteConfig.agreementText);

  const subtitleNode = q(".brand-text p");
  if (subtitleNode) {
    subtitleNode.textContent = safeString(finalConfig.brandSubtitle, defaultSiteConfig.brandSubtitle);
  }

  const home = finalConfig.home || defaultSiteConfig.home;
  q("#homeChip").textContent = safeString(home.chip, defaultSiteConfig.home.chip);
  q("#homeHeroTitle").textContent = safeString(home.title, defaultSiteConfig.home.title);
  q("#homeHeroDesc").textContent = safeString(home.description, defaultSiteConfig.home.description);

  const actionRoot = q("#homeHeroActions");
  actionRoot.innerHTML = "";
  safeArray(home.heroActions, defaultSiteConfig.home.heroActions).forEach((item) => {
    const btn = document.createElement("button");
    btn.className = `btn ${item.variant === "ghost" ? "ghost" : "primary"}`;
    btn.dataset.jump = safeString(item.target, "trade");
    btn.textContent = safeString(item.label, "杩涘叆");
    actionRoot.appendChild(btn);
  });

  const statsRoot = q("#homeHeroStats");
  statsRoot.innerHTML = "";
  safeArray(home.heroStats, defaultSiteConfig.home.heroStats).forEach((item) => {
    const card = document.createElement("article");
    card.className = "hero-stat";
    card.innerHTML = `
      <span>${safeString(item.label, "--")}</span>
      <strong>${safeString(item.value, "--")}</strong>
    `;
    statsRoot.appendChild(card);
  });

  const highlightsRoot = q("#homeHighlights");
  highlightsRoot.innerHTML = "";
  safeArray(home.highlights, defaultSiteConfig.home.highlights).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="line-1">
        <span>${safeString(item.title, "--")}</span>
      </div>
      <div class="line-2">${safeString(item.desc, "")}</div>
    `;
    highlightsRoot.appendChild(li);
  });

  const carouselRoot = q("#homeCarouselItems");
  carouselRoot.innerHTML = "";
  safeArray(home.carousel, defaultSiteConfig.home.carousel).forEach((item, index) => {
    const block = document.createElement("div");
    block.className = `carousel-item${index === 0 ? " active" : ""}`;
    block.innerHTML = `
      <h3>${safeString(item.title, "--")}</h3>
      <p>${safeString(item.description, "")}</p>
    `;
    carouselRoot.appendChild(block);
  });

  const quickRoot = q("#homeQuickLinks");
  quickRoot.innerHTML = "";
  safeArray(home.quickLinks, defaultSiteConfig.home.quickLinks).forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quick-link";
    btn.dataset.jump = safeString(item.target, "trade");
    btn.textContent = safeString(item.label, "杩涘叆");
    quickRoot.appendChild(btn);
  });

  const noticeRoot = q("#homeNotices");
  noticeRoot.innerHTML = "";
  safeArray(home.notices, defaultSiteConfig.home.notices).forEach((text) => {
    const li = document.createElement("li");
    li.textContent = safeString(text, "--");
    noticeRoot.appendChild(li);
  });

  const paymentConfig = finalConfig.payment || defaultSiteConfig.payment;
  const digitalAddress = safeString(paymentConfig.digitalAddress, defaultSiteConfig.payment.digitalAddress);
  q("#usdtAddress").textContent = digitalAddress;

  const bank = paymentConfig.bank || defaultSiteConfig.payment.bank;
  const bankInfoRoot = q("#platformBankInfo");
  bankInfoRoot.innerHTML = `
    <div class="bank-line"><span>寮€鎴疯</span><span>${safeString(bank.bankName, defaultSiteConfig.payment.bank.bankName)}</span></div>
    <div class="bank-line"><span>鎴峰悕</span><span>${safeString(bank.accountName, defaultSiteConfig.payment.bank.accountName)}</span></div>
    <div class="bank-line"><span>鍗″彿</span><span>${safeString(bank.accountNo, defaultSiteConfig.payment.bank.accountNo)}</span></div>
    <div class="bank-line"><span>鏀</span><span>${safeString(bank.branch, defaultSiteConfig.payment.bank.branch)}</span></div>
  `;

  const agreementNode = q("#agreementContent");
  if (agreementNode) {
    agreementNode.textContent = state.agreementText;
  }
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
    const response = await fetch("/api/site-config", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return;
    const payload = await response.json();
    applySiteConfig(mergeSiteConfig(payload));
  } catch (_error) {
    // Keep default configuration when endpoint is unavailable.
  }
}

function buildInitialSeries() {
  const now = Date.now();
  const points = 220;
  const step = 6 * 60 * 60 * 1000;
  let value = 960;
  const series = [];

  for (let i = points - 1; i >= 0; i -= 1) {
    const ts = now - i * step;
    const drift = randomBetween(-18, 24);
    value = Math.max(700, value + drift);
    series.push({ ts, value: Number(value.toFixed(2)) });
  }
  return series;
}

function pushChartPoint(amount) {
  state.chartSeries.push({
    ts: Date.now(),
    value: Number(amount.toFixed(2)),
  });
  if (state.chartSeries.length > 400) {
    state.chartSeries = state.chartSeries.slice(-300);
  }
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
    data = [
      { ts: latest.ts - 1, value: latest.value },
      latest,
    ];
  }

  const maxByRange = {
    day: 32,
    week: 46,
    month: 64,
    all: 90,
  };
  return downSample(data, maxByRange[range] || 64);
}

function updateWalletView() {
  q("#metricTotal").textContent = money(walletTotal());
  q("#metricAvailable").textContent = money(state.wallet.available);
  q("#metricFrozen").textContent = money(state.wallet.frozen);
  q("#metricProfit").textContent = money(state.wallet.totalProfit);
  q("#profileTotal").textContent = money(walletTotal());
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
  for (let i = 1; i < data.length; i += 1) {
    ctx.lineTo(toX(i), toY(data[i].value));
  }
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

  const lastPoint = data[data.length - 1];
  const lx = toX(data.length - 1);
  const ly = toY(lastPoint.value);
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#2fbf9f";
  ctx.fill();
  ctx.fillStyle = "rgba(22, 43, 106, 0.74)";
  ctx.font = "12px Manrope";
  ctx.fillText(money(lastPoint.value), lx - 78, ly - 10);
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
  updateSegmentIndicator(q("#authTabs"), ".auth-tab.active", q("#authIndicator"));
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

function switchSection(id) {
  qq(".section").forEach((section) => section.classList.toggle("active", section.id === id));
  qq(".nav-btn[data-section]").forEach((btn) => btn.classList.toggle("active", btn.dataset.section === id));
}

function initCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  const items = qq(".carousel-item");
  const dotsRoot = q("#carouselDots");
  if (!items.length || !dotsRoot) return;

  carouselIndex = 0;
  dotsRoot.innerHTML = "";
  items.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = `carousel-dot${index === 0 ? " active" : ""}`;
    dot.addEventListener("click", () => showCarouselSlide(index));
    dotsRoot.appendChild(dot);
  });

  items.forEach((item, i) => item.classList.toggle("active", i === 0));
  carouselTimer = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % items.length;
    showCarouselSlide(carouselIndex);
  }, 3600);
}

function showCarouselSlide(index) {
  qq(".carousel-item").forEach((item, i) => item.classList.toggle("active", i === index));
  qq(".carousel-dot").forEach((dot, i) => dot.classList.toggle("active", i === index));
  carouselIndex = index;
}

function createOrderCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `ODR${y}${m}${d}${suffix}`;
}

function renderProductCard(product, compact = false) {
  if (compact) {
    return `
      <div class="title-row">
        <h4>${product.name}</h4>
        <span class="status done">开放中</span>
      </div>
      <p>${product.subtitle}</p>
      <div class="meta-row">
        <span class="meta-pill">起投 ${money(product.minAmount)}</span>
        <span class="meta-pill">支持快速入场</span>
      </div>
      <div style="margin-top:10px;">
        <button class="btn primary sm" data-invest-id="${product.id}">立即下单</button>
      </div>
    `;
  }

  return `
    <div class="all-product-head">
      <h4>${product.name}</h4>
      <span class="status done">开放中</span>
    </div>
    <p>${product.subtitle}</p>
    <div class="meta-row">
      <span class="meta-pill">起投 ${money(product.minAmount)}</span>
      <span class="meta-pill">优先撮合</span>
    </div>
    <div style="margin-top:10px;">
      <button class="btn primary sm" data-invest-id="${product.id}">立即下单</button>
    </div>
  `;
}

function bindInvestButtons(scopeRoot = document) {
  scopeRoot.querySelectorAll("[data-invest-id]").forEach((btn) => {
    btn.onclick = () => openOrderModal(btn.dataset.investId);
  });
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

function renderAllProductsList() {
  const root = q("#allProductsList");
  if (!root) return;
  root.innerHTML = "";

  if (!state.products.length) {
    root.innerHTML = `<div class="order-item">暂无可用订单</div>`;
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

function getProductById(productId) {
  return state.products.find((item) => item.id === productId);
}

function closeProductsModal() {
  q("#productsModalBackdrop")?.classList.remove("open");
}

function openOrderModal(productId) {
  const product = getProductById(productId);
  if (!product) return;
  closeProductsModal();
  state.selectedProductId = productId;
  q("#selectedProductName").textContent = product.name;
  q("#orderAmount").value = "";
  q("#orderModalBackdrop").classList.add("open");
}

function closeOrderModal() {
  q("#orderModalBackdrop").classList.remove("open");
}

function openProductsModal() {
  renderAllProductsList();
  q("#productsModalBackdrop")?.classList.add("open");
}

function createOrder(product, amount) {
  const now = Date.now();
  const order = {
    id: createOrderCode(),
    productName: product.name,
    amount,
    profit: 0,
    status: "running",
    submittedAt: now,
    settleAt: now + product.durationMs,
    minRate: product.minRate,
    maxRate: product.maxRate,
  };
  state.orderHistory.unshift(order);
}

function submitOrder() {
  const product = getProductById(state.selectedProductId);
  const amount = Number(q("#orderAmount").value || 0);
  if (!product) {
    showToast("订单项目不存在", true);
    return;
  }
  if (amount < product.minAmount) {
    showToast(`当前项目最低金额 ${money(product.minAmount)}`, true);
    return;
  }
  if (amount > state.wallet.available) {
    showToast("可用余额不足", true);
    return;
  }

  state.wallet.available -= amount;
  state.wallet.frozen += amount;
  createOrder(product, amount);
  updateWalletView();
  renderOrderHistory();
  renderRecords();
  pushChartPoint(walletTotal());
  drawPnlChart();
  closeOrderModal();
  showToast("订单已提交");
}

function settleOrder(order) {
  if (order.status === "done") return;
  const rate = randomBetween(order.minRate, order.maxRate);
  order.profit = Number((order.amount * rate).toFixed(2));
  order.status = "done";
  state.wallet.frozen -= order.amount;
  state.wallet.available += order.amount + order.profit;
  state.wallet.totalProfit += order.profit;
}

function settleDueOrders(force = false) {
  const now = Date.now();
  let count = 0;

  state.orderHistory.forEach((order) => {
    if (order.status === "running" && (force || now >= order.settleAt)) {
      settleOrder(order);
      count += 1;
    }
  });

  if (count > 0) {
    updateWalletView();
    renderOrderHistory();
    renderRecords();
    pushChartPoint(walletTotal());
    drawPnlChart();
    showToast(`已更新 ${count} 条订单状态`);
  }
}

function renderOrderHistory() {
  const tbody = q("#orderHistoryBody");
  tbody.innerHTML = "";

  if (!state.orderHistory.length) {
    tbody.innerHTML = `<tr><td colspan="6">暂无订单记录</td></tr>`;
    return;
  }

  state.orderHistory.forEach((order) => {
    const tr = document.createElement("tr");
    const statusClass = order.status === "done" ? "done" : "running";
    const statusText = order.status === "done" ? "已完成" : "进行中";
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.productName}</td>
      <td>${money(order.amount)}</td>
      <td>${money(order.profit)}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>${new Date(order.submittedAt).toLocaleString("zh-CN", { hour12: false })}</td>
    `;
    tbody.appendChild(tr);
  });
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

function initPaymentForms() {
  q("#copyAddressBtn").addEventListener("click", copyAddress);

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
      qq(".switch-btn[data-method]").forEach((item) => {
        item.classList.toggle("active", item.dataset.method === state.withdrawMethod);
      });
      q("#withdrawUSDT").classList.toggle("active", state.withdrawMethod === "usdt");
      q("#withdrawBank").classList.toggle("active", state.withdrawMethod === "bank");
    });
  });

  q("#depositForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(q("#depositAmount").value || 0);
    const txid = q("#depositTxid").value.trim();
    if (!amount || !txid) {
      showToast("请填写完整的充值信息", true);
      return;
    }

    state.depositRecords.unshift({
      amount,
      txid,
      method: state.depositMethod,
      status: "待处理",
      time: Date.now(),
    });

    event.target.reset();
    renderRecords();
    showToast("充值申请已提交");
  });

  q("#withdrawForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(q("#withdrawAmount").value || 0);
    if (!amount || amount > state.wallet.available) {
      showToast("提现金额不合法或超出余额", true);
      return;
    }

    if (state.withdrawMethod === "usdt") {
      if (!q("#withdrawUsdtAddress").value.trim()) {
        showToast("请输入收款地址", true);
        return;
      }
    } else if (!q("#bankName").value.trim() || !q("#bankOwner").value.trim() || !q("#bankNo").value.trim()) {
      showToast("请完整填写银行卡信息", true);
      return;
    }

    state.withdrawRecords.unshift({
      amount,
      method: state.withdrawMethod,
      status: "待处理",
      time: Date.now(),
    });

    event.target.reset();
    state.withdrawMethod = "usdt";
    qq(".switch-btn[data-method]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.method === "usdt");
    });
    q("#withdrawUSDT").classList.add("active");
    q("#withdrawBank").classList.remove("active");
    renderRecords();
    showToast("提现申请已提交");
  });
}

function initRecordSwitch() {
  qq(".switch-btn[data-record]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.recordType = btn.dataset.record;
      qq(".switch-btn[data-record]").forEach((item) => {
        item.classList.toggle("active", item.dataset.record === state.recordType);
      });
      renderRecords();
    });
  });
}

function renderRecords() {
  const list = q("#recordList");
  list.innerHTML = "";
  let records = [];

  if (state.recordType === "deposit") {
    records = state.depositRecords.map((record) => ({
      title: `充值申请 ${money(record.amount)}`,
      desc: `方式：${record.method === "bank" ? "银行卡" : "数字地址"} ｜ 凭证：${record.txid} ｜ 状态：${record.status}`,
      time: record.time,
    }));
  } else if (state.recordType === "withdraw") {
    records = state.withdrawRecords.map((record) => ({
      title: `提现申请 ${money(record.amount)}`,
      desc: `方式：${record.method === "usdt" ? "数字地址" : "银行卡"} ｜ 状态：${record.status}`,
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
    list.innerHTML = `<li class="record-item">暂无记录</li>`;
    return;
  }

  records.forEach((record) => {
    const li = document.createElement("li");
    li.className = "record-item";
    li.innerHTML = `
      <div class="line-1">
        <span>${record.title}</span>
        <span>${new Date(record.time).toLocaleString("zh-CN", { hour12: false })}</span>
      </div>
      <div class="line-2">${record.desc}</div>
    `;
    list.appendChild(li);
  });
}

function setAuthMode(mode) {
  state.authMode = mode;
  qq(".auth-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authType === mode);
  });
  const isRegister = mode === "register";
  q("#confirmPasswordField").style.display = isRegister ? "block" : "none";
  q("#agreementCheckRow").style.display = isRegister ? "inline-flex" : "none";
  q("#authSubmitBtn").textContent = isRegister ? "立即注册" : "立即登录";
  refreshAllSegmentIndicators();
}

function initAuthChannelSelect() {
  const root = q("#authChannelSelect");
  const trigger = q("#authChannelTrigger");
  const menu = q("#authChannelMenu");
  const label = q("#authChannelLabel");
  const input = q("#authChannel");
  if (!root || !trigger || !menu || !label || !input) return;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    root.classList.toggle("open");
  });

  qq(".custom-select-option").forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "account";
      const text = option.textContent.trim();
      input.value = value;
      label.textContent = text;
      qq(".custom-select-option").forEach((item) => item.classList.toggle("active", item === option));
      root.classList.remove("open");
    });
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      root.classList.remove("open");
    }
  });
}

function initAuth() {
  q("#agreementContent").textContent = state.agreementText || defaultSiteConfig.agreementText;
  initAuthChannelSelect();

  q("#authBtn").addEventListener("click", () => q("#authModalBackdrop").classList.add("open"));
  q("#closeAuthModal").addEventListener("click", () => q("#authModalBackdrop").classList.remove("open"));
  q("#authModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "authModalBackdrop") q("#authModalBackdrop").classList.remove("open");
  });

  qq(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => setAuthMode(tab.dataset.authType));
  });

  q("#openAgreementBtn").addEventListener("click", () => q("#agreementModalBackdrop").classList.add("open"));
  q("#closeAgreementModal").addEventListener("click", () => q("#agreementModalBackdrop").classList.remove("open"));
  q("#agreementModalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "agreementModalBackdrop") q("#agreementModalBackdrop").classList.remove("open");
  });

  q("#authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = q("#authUsername").value.trim();
    const password = q("#authPassword").value.trim();
    const confirmPassword = q("#authConfirmPassword").value.trim();
    const agreed = q("#agreementCheck").checked;

    if (!username || !password) {
      showToast("请输入账号和密码", true);
      return;
    }

    if (state.authMode === "register") {
      if (!confirmPassword || confirmPassword !== password) {
        showToast("两次密码不一致", true);
        return;
      }
      if (!agreed) {
        showToast("请先勾选用户协议", true);
        return;
      }
      state.user.registered = true;
      state.user.loggedIn = true;
      state.user.username = username;
      q("#displayUsername").textContent = username;
      q("#profileStatus").textContent = "已登录";
      showToast("注册成功");
    } else {
      state.user.loggedIn = true;
      state.user.username = username;
      q("#displayUsername").textContent = username;
      q("#profileStatus").textContent = "已登录";
      showToast("登录成功");
    }

    event.target.reset();
    setAuthMode("login");
    q("#authModalBackdrop").classList.remove("open");
  });

  setAuthMode("login");
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
  q("#viewAllProductsBtn")?.addEventListener("click", openProductsModal);
  q("#closeProductsModal")?.addEventListener("click", closeProductsModal);
  q("#productsModalBackdrop")?.addEventListener("click", (event) => {
    if (event.target.id === "productsModalBackdrop") closeProductsModal();
  });
}

function initTimeFilter() {
  qq(".time-btn[data-range]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeRange = btn.dataset.range;
      qq(".time-btn[data-range]").forEach((item) => {
        item.classList.toggle("active", item.dataset.range === state.activeRange);
      });
      refreshAllSegmentIndicators();
      drawPnlChart();
    });
  });
}

function initSettleControls() {
  q("#settleNowBtn").addEventListener("click", () => settleDueOrders(true));
  setInterval(() => settleDueOrders(false), 1000);
}

function seedInitialData() {
  state.chartSeries = buildInitialSeries();
  const existingOrder = {
    id: createOrderCode(),
    productName: "Prime Growth",
    amount: 260,
    profit: 11.6,
    status: "done",
    submittedAt: Date.now() - 80 * 60 * 1000,
    settleAt: Date.now() - 20 * 60 * 1000,
    minRate: 0.018,
    maxRate: 0.042,
  };
  state.orderHistory.push(existingOrder);
  state.wallet.totalProfit = existingOrder.profit;
  pushChartPoint(walletTotal() + existingOrder.profit);
}

async function init() {
  seedInitialData();
  initNav();
  initOrderModal();
  initProductsModal();
  initTimeFilter();
  initPaymentForms();
  initRecordSwitch();
  initAuth();
  initSettleControls();

  renderOrderProducts();
  renderOrderHistory();
  renderRecords();
  updateWalletView();

  await loadSiteConfig();
  initCarousel();

  drawPnlChart();
  refreshAllSegmentIndicators();

  window.addEventListener("resize", () => {
    drawPnlChart();
    refreshAllSegmentIndicators();
  });
}

init();










