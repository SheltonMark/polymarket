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
  homeActiveTopic: "all",
  selectedHomeArticleId: null,
  homeArticles: [],
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
    tag: "内容专栏",
    title: "LockPro 深度内容中心",
    description: "围绕量化策略、系统逻辑和行业动态持续更新，支持按专题筛选并查看完整文章详情。",
    quickActions: [
      { label: "进入交易中心", target: "trade", variant: "primary" },
      { label: "打开个人中心", target: "profile", variant: "ghost" },
    ],
    topics: [
      { id: "hedge", label: "量化对冲套利" },
      { id: "system", label: "系统说明" },
      { id: "news", label: "区块链时事新闻" },
    ],
    articles: [
      {
        id: "art_001",
        topicId: "hedge",
        title: "量化对冲套利的核心框架与执行边界",
        summary: "拆解对冲套利的信号生成、仓位控制和执行节奏，明确策略在不同波动阶段的适用条件。",
        content:
          "量化对冲套利的目标不是追求单笔极值收益，而是通过高纪律、可重复的执行提升总体稳定性。\n\n在执行层面，需要优先控制风险敞口和仓位结构，其次才是进场时机优化。通过持续校准参数，可以减少市场噪音对结果的冲击。\n\n系统化的复盘机制同样关键，它决定了策略能否在环境变化中保持适应能力。",
        author: "LockPro Research",
        publishedAt: "2026-04-10",
        hot: true,
      },
      {
        id: "art_002",
        topicId: "system",
        title: "系统说明：从信号到结果的闭环设计",
        summary: "说明指标、阈值、执行和复盘之间的关系，帮助用户快速理解策略为什么有效。",
        content:
          "策略逻辑的关键在于闭环：信号识别、条件确认、执行动作和结果反馈必须形成一致链路。\n\n如果缺少反馈层，模型就无法对偏差进行修正，长期表现会逐步退化。\n\n因此我们在设计时强调可解释、可验证、可追踪，确保每个步骤都有明确输入输出。",
        author: "LockPro Research",
        publishedAt: "2026-04-09",
        hot: false,
      },
      {
        id: "art_003",
        topicId: "hedge",
        title: "策略解读：如何根据资金规模安排下单节奏",
        summary: "结合资金体量和风险偏好，给出更稳健的下单节奏建议，避免集中暴露。",
        content:
          "策略执行中常见问题是仓位过度集中。更稳妥的方式是分段下单并设置明确的复核节点。\n\n对于不同资金规模，建议采用不同的分配比例和执行间隔，以降低阶段性波动带来的影响。\n\n下单节奏不是固定模板，而是需要随着市场环境与账户状态动态调整。",
        author: "LockPro Strategy Team",
        publishedAt: "2026-04-08",
        hot: false,
      },
      {
        id: "art_004",
        topicId: "system",
        title: "系统优势解读：为什么强调流程一致性",
        summary: "通过统一流程与可视化记录，降低人工操作偏差，提升整体执行效率。",
        content:
          "流程一致性能显著降低执行误差。统一的操作路径有助于团队协作，也能让用户更快定位关键信息。\n\n在系统层面，清晰的状态反馈和记录链路，使得每一步操作都能追溯并复查。\n\n这类优势不会在单次操作中完全体现，但会在长期使用中持续放大。",
        author: "LockPro Product",
        publishedAt: "2026-04-07",
        hot: false,
      },
      {
        id: "art_005",
        topicId: "system",
        title: "系统说明：账户、订单与记录模块如何协同",
        summary: "梳理首页、交易中心、个人中心的协同关系，明确各模块的使用路径。",
        content:
          "账户模块负责资金与状态展示，交易模块负责下单与订单跟踪，记录模块负责历史查询与复核。\n\n三者的协同设计目标是降低切换成本、减少重复输入、提高信息一致性。\n\n当模块边界清晰后，后续联调和后台配置也会更直接。",
        author: "LockPro Product",
        publishedAt: "2026-04-06",
        hot: false,
      },
      {
        id: "art_006",
        topicId: "news",
        title: "区块链时事速览：近期市场情绪与风险关注点",
        summary: "从资金流向和波动特征出发，提炼近期值得关注的行业动态与风险提示。",
        content:
          "市场情绪通常会在短周期内快速切换，热点题材往往伴随更高波动。\n\n对普通用户而言，保持节奏稳定比追逐短时情绪更重要。\n\n建议在观察行业动态时，始终结合自身仓位结构与风险承受能力。",
        author: "LockPro News Desk",
        publishedAt: "2026-04-05",
        hot: true,
      },
    ],
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

function resolveHomeTopics(home) {
  const topics = safeArray(home.topics, defaultSiteConfig.home.topics);
  return topics
    .map((item) => ({
      id: safeString(item.id),
      label: safeString(item.label, "未命名专题"),
    }))
    .filter((item) => item.id);
}

function resolveHomeArticles(home, topics) {
  const topicLabelMap = Object.fromEntries(topics.map((topic) => [topic.id, topic.label]));
  const source = safeArray(home.articles, defaultSiteConfig.home.articles);

  return source
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

function formatDateText(text) {
  if (!text) return "--";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function renderHomeTopics(topics) {
  const root = q("#homeTopicTabs");
  if (!root) return;

  root.querySelectorAll(".home-topic-btn").forEach((button) => button.remove());

  const list = [{ id: "all", label: "全部" }, ...topics];
  const exists = list.some((item) => item.id === state.homeActiveTopic);
  if (!exists) {
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
  const topicMeta = q("#homeTopicMeta");
  if (topicMeta) {
    topicMeta.textContent = activeTopic.id === "all" ? "全部文章" : activeTopic.label;
  }
}

function openHomeArticleModal(articleId) {
  const article = state.homeArticles.find((item) => item.id === articleId);
  if (!article) return;

  state.selectedHomeArticleId = articleId;

  const title = q("#homeArticleModalTitle");
  const meta = q("#homeArticleModalMeta");
  const content = q("#homeArticleModalContent");
  if (!title || !meta || !content) return;

  title.textContent = article.title;
  meta.innerHTML = "";

  const metaItems = [article.topicLabel, article.author, formatDateText(article.publishedAt)];
  metaItems.forEach((value) => {
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

  content.innerHTML = "";
  const blocks = article.content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs = blocks.length ? blocks : [article.summary || "暂无正文内容"];
  paragraphs.forEach((text) => {
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

  const filtered = state.homeActiveTopic === "all"
    ? articles
    : articles.filter((item) => item.topicId === state.homeActiveTopic);

  const hint = q("#homeArticleHint");
  if (hint) {
    hint.textContent = `共 ${filtered.length} 篇`;
  }

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

    const head = document.createElement("div");
    head.className = "article-item-head";

    const title = document.createElement("h4");
    title.className = "article-item-title";
    title.textContent = article.title;

    const topic = document.createElement("span");
    topic.className = "article-topic";
    topic.textContent = article.topicLabel;

    head.appendChild(title);
    head.appendChild(topic);

    const summary = document.createElement("p");
    summary.className = "article-item-summary";
    summary.textContent = article.summary;

    const meta = document.createElement("div");
    meta.className = "article-item-meta";

    const date = document.createElement("span");
    date.textContent = formatDateText(article.publishedAt);

    const author = document.createElement("span");
    author.textContent = article.author;

    meta.appendChild(date);
    meta.appendChild(author);

    if (article.hot) {
      const hot = document.createElement("span");
      hot.className = "article-hot";
      hot.textContent = "热门";
      meta.appendChild(hot);
    }

    item.appendChild(head);
    item.appendChild(summary);
    item.appendChild(meta);
    root.appendChild(item);
  });
}

function renderHomeContent(home) {
  const introTag = q("#homeIntroTag");
  if (introTag) {
    introTag.textContent = safeString(home.tag, defaultSiteConfig.home.tag);
  }

  const introTitle = q("#homeIntroTitle");
  if (introTitle) {
    introTitle.textContent = safeString(home.title, defaultSiteConfig.home.title);
  }

  const introDesc = q("#homeIntroDesc");
  if (introDesc) {
    introDesc.textContent = safeString(home.description, defaultSiteConfig.home.description);
  }

  const actionRoot = q("#homeQuickActions");
  if (actionRoot) {
    actionRoot.innerHTML = "";
    safeArray(home.quickActions, defaultSiteConfig.home.quickActions).forEach((item) => {
      const btn = document.createElement("button");
      btn.className = `btn ${item.variant === "ghost" ? "ghost" : "primary"}`;
      btn.dataset.jump = safeString(item.target, "trade");
      btn.textContent = safeString(item.label, "进入");
      actionRoot.appendChild(btn);
    });
  }

  const topics = resolveHomeTopics(home);
  const articles = resolveHomeArticles(home, topics);
  state.homeArticles = articles;

  renderHomeTopics(topics);
  renderHomeArticles(articles);
}

function initHomeArticleModal() {
  q("#closeHomeArticleModal")?.addEventListener("click", closeHomeArticleModal);
  q("#homeArticleModalBackdrop")?.addEventListener("click", (event) => {
    if (event.target.id === "homeArticleModalBackdrop") {
      closeHomeArticleModal();
    }
  });
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
  renderHomeContent(home);

  const paymentConfig = finalConfig.payment || defaultSiteConfig.payment;
  const digitalAddress = safeString(paymentConfig.digitalAddress, defaultSiteConfig.payment.digitalAddress);
  q("#usdtAddress").textContent = digitalAddress;

  const bank = paymentConfig.bank || defaultSiteConfig.payment.bank;
  const bankInfoRoot = q("#platformBankInfo");
  bankInfoRoot.innerHTML = `
    <div class="bank-line"><span>开户行</span><span>${safeString(bank.bankName, defaultSiteConfig.payment.bank.bankName)}</span></div>
    <div class="bank-line"><span>户名</span><span>${safeString(bank.accountName, defaultSiteConfig.payment.bank.accountName)}</span></div>
    <div class="bank-line"><span>卡号</span><span>${safeString(bank.accountNo, defaultSiteConfig.payment.bank.accountNo)}</span></div>
    <div class="bank-line"><span>支行</span><span>${safeString(bank.branch, defaultSiteConfig.payment.bank.branch)}</span></div>
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
  updateSegmentIndicator(q("#homeTopicTabs"), ".home-topic-btn.active", q("#homeTopicIndicator"));
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
  const depositScreenshotInput = q("#depositScreenshot");
  const depositScreenshotHint = q("#depositScreenshotHint");

  if (depositScreenshotInput && depositScreenshotHint) {
    depositScreenshotInput.addEventListener("change", () => {
      const file = depositScreenshotInput.files?.[0];
      depositScreenshotHint.textContent = file
        ? `已选择截图：${file.name}`
        : "请上传清晰的转账截图，便于后台审核。";
    });
  }

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
    const screenshotFile = q("#depositScreenshot").files?.[0];
    if (!amount || !screenshotFile) {
      showToast("请填写完整的充值信息", true);
      return;
    }

    state.depositRecords.unshift({
      amount,
      screenshotName: screenshotFile.name,
      method: state.depositMethod,
      status: "待处理",
      time: Date.now(),
    });

    event.target.reset();
    if (depositScreenshotHint) {
      depositScreenshotHint.textContent = "请上传清晰的转账截图，便于后台审核。";
    }
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
      desc: `方式：${record.method === "bank" ? "银行卡" : "数字地址"} ｜ 截图：${record.screenshotName || "未上传"} ｜ 状态：${record.status}`,
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
  initHomeArticleModal();
  initSettleControls();

  renderOrderProducts();
  renderOrderHistory();
  renderRecords();
  updateWalletView();

  await loadSiteConfig();

  drawPnlChart();
  refreshAllSegmentIndicators();

  window.addEventListener("resize", () => {
    drawPnlChart();
    refreshAllSegmentIndicators();
  });
}

init();










