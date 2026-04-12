import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import multer from "multer";
import { getNowString, initDb, newId } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const ADMIN_DIR = path.join(ROOT_DIR, "admin");
const UPLOAD_DIR = path.join(ROOT_DIR, "server", "uploads");

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "lockpro_dev_secret_change_me";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const db = await initDb();
const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "") || ".png";
      cb(null, `${Date.now()}_${Math.floor(Math.random() * 100000)}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function round2(value) {
  return Number((Number(value) || 0).toFixed(2));
}

function randomBetween(min, max) {
  const left = Number(min) || 0;
  const right = Number(max) || left;
  return left + Math.random() * (right - left);
}

function randomIntBetween(min, max) {
  const left = Math.max(1, Math.floor(Number(min) || 1));
  const right = Math.max(left, Math.floor(Number(max) || left));
  return Math.floor(Math.random() * (right - left + 1)) + left;
}

function safeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text || fallback;
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function parseBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

function requireUser(req, res, next) {
  const token = parseBearerToken(req);
  if (!token) {
    res.status(401).json({ message: "缺少登录凭证" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "user") {
      res.status(401).json({ message: "登录凭证无效" });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "登录已过期，请重新登录" });
  }
}

function requireAdmin(req, res, next) {
  const token = parseBearerToken(req);
  if (!token) {
    res.status(401).json({ message: "缺少管理员凭证" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || payload.role !== "admin") {
      res.status(401).json({ message: "管理员凭证无效" });
      return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "管理员登录已过期" });
  }
}

function makeOrderCode() {
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

async function addActivity(text) {
  await db.run("INSERT INTO activities (id, text, created_at) VALUES (?, ?, ?)", [newId("act"), text, getNowString()]);
}

async function getUserById(userId) {
  return db.get("SELECT * FROM users WHERE id = ?", [userId]);
}

async function getPublicSiteConfig() {
  const home = await db.get("SELECT * FROM home_config WHERE id = 1");
  const agreement = await db.get("SELECT content FROM agreements WHERE id = 1");
  const articles = await db.all(
    `SELECT id, category, title, summary, content, author, published_at AS publishedAt, hot
     FROM articles
     WHERE status = 'published'
     ORDER BY published_at DESC, updated_at DESC`
  );

  return {
    brandSubtitle: home?.brand_subtitle || "Digital Asset Workspace",
    payment: {
      digitalAddress: home?.digital_address || "",
      bank: {
        bankName: home?.bank_name || "",
        accountName: home?.bank_account_name || "",
        accountNo: home?.bank_account_no || "",
        branch: home?.bank_branch || "",
      },
    },
    agreementText: agreement?.content || "",
    home: {
      tag: home?.home_tag || "内容专栏",
      title: home?.title || "LockPro",
      description: home?.description || "",
      quickActions: [
        { label: "进入交易中心", target: "trade", variant: "primary" },
        { label: "打开个人中心", target: "profile", variant: "ghost" },
      ],
      topics: [
        { id: "hedge", label: "量化对冲套利" },
        { id: "system", label: "系统说明" },
        { id: "news", label: "区块链时事新闻" },
      ],
      articles: articles.map((item) => ({
        id: item.id,
        topicId: item.category,
        title: item.title,
        summary: item.summary,
        content: item.content,
        author: item.author,
        publishedAt: item.publishedAt,
        hot: Boolean(item.hot),
      })),
    },
  };
}

async function getUserSummary(userId) {
  const user = await db.get(
    `SELECT id, username, profile, status,
            available_balance AS available,
            principal_available AS principalAvailable,
            frozen_balance AS frozen,
            profit_available AS profitAvailable,
            total_profit AS totalProfit,
            created_at AS createdAt
     FROM users WHERE id = ?`,
    [userId]
  );
  if (!user) return null;

  const orderHistory = await db.all(
    `SELECT id,
            order_code AS orderCode,
            product_name AS productName,
            amount,
            profit,
            status,
            submitted_at AS submittedAt,
            settle_at AS settleAt,
            min_rate AS minRate,
            max_rate AS maxRate
     FROM user_orders
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    [userId]
  );

  const depositRecords = await db.all(
    `SELECT id, amount, method, screenshot, status, reason,
            submitted_at AS time, processed_at AS processedAt
     FROM deposits
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    [userId]
  );

  const withdrawRecords = await db.all(
    `SELECT id, amount, method, target, status, reason,
            submitted_at AS time, processed_at AS processedAt
     FROM withdrawals
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    [userId]
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      profile: user.profile,
      status: user.status,
      createdAt: user.createdAt,
    },
    wallet: {
      available: round2(user.available),
      withdrawable: round2(user.available),
      principalAvailable: round2(user.principalAvailable),
      frozen: round2(user.frozen),
      profitAvailable: round2(user.profitAvailable),
      totalProfit: round2(user.totalProfit),
    },
    orderHistory: orderHistory.map((item) => ({
      id: item.orderCode,
      internalId: item.id,
      productName: item.productName,
      amount: round2(item.amount),
      profit: round2(item.profit),
      status: item.status,
      submittedAt: new Date(item.submittedAt).getTime(),
      settleAt: new Date(item.settleAt).getTime(),
      minRate: Number(item.minRate),
      maxRate: Number(item.maxRate),
    })),
    depositRecords: depositRecords.map((item) => ({
      id: item.id,
      amount: round2(item.amount),
      method: item.method,
      screenshot: item.screenshot,
      status: item.status,
      reason: item.reason,
      time: new Date(item.time).getTime(),
      processedAt: item.processedAt ? new Date(item.processedAt).getTime() : null,
    })),
    withdrawRecords: withdrawRecords.map((item) => ({
      id: item.id,
      amount: round2(item.amount),
      method: item.method,
      target: item.target,
      status: item.status,
      reason: item.reason,
      time: new Date(item.time).getTime(),
      processedAt: item.processedAt ? new Date(item.processedAt).getTime() : null,
    })),
  };
}

async function getAdminState() {
  const admin = await db.get("SELECT username FROM admins ORDER BY created_at ASC LIMIT 1");
  const home = await db.get("SELECT * FROM home_config WHERE id = 1");
  const agreement = await db.get("SELECT content FROM agreements WHERE id = 1");

  const users = await db.all(
    `SELECT id,
            username AS account,
            profile,
            available_balance AS available,
            principal_available AS principalAvailable,
            frozen_balance AS frozen,
            status,
            created_at AS createdAt
     FROM users
     ORDER BY created_at DESC`
  );

  const articles = await db.all(
    `SELECT id, category, title, content, status, hot, updated_at AS updatedAt
     FROM articles
     ORDER BY updated_at DESC`
  );

  const orders = await db.all(
    `SELECT id, code, title, tag, description,
            min_amount AS minAmount,
            freeze_min AS freezeMin,
            freeze_max AS freezeMax,
            rate_min AS rateMin,
            rate_max AS rateMax,
            status, archived, updated_at AS updatedAt
     FROM order_templates
     ORDER BY archived ASC, updated_at DESC`
  );

  const deposits = await db.all(
    `SELECT id, user_id AS userId, amount, method, screenshot, status,
            reason, submitted_at AS submittedAt, processed_at AS processedAt
     FROM deposits
     ORDER BY submitted_at DESC`
  );

  const withdraws = await db.all(
    `SELECT id, user_id AS userId, amount, method, target, status,
            reason, submitted_at AS submittedAt, processed_at AS processedAt
     FROM withdrawals
     ORDER BY submitted_at DESC`
  );

  const activities = await db.all(
    `SELECT id, text, created_at AS time
     FROM activities
     ORDER BY created_at DESC
     LIMIT 60`
  );

  return {
    credential: { username: admin?.username || "admin" },
    homeConfig: {
      title: home?.title || "",
      subtitle: home?.brand_subtitle || "",
      description: home?.description || "",
    },
    agreementText: agreement?.content || "",
    users: users.map((item) => ({ ...item, available: round2(item.available), principalAvailable: round2(item.principalAvailable), frozen: round2(item.frozen) })),
    articles: articles.map((item) => ({ ...item, hot: Boolean(item.hot) })),
    orders: orders.map((item) => ({
      ...item,
      archived: Boolean(item.archived),
      minAmount: round2(item.minAmount),
      rateMin: Number(item.rateMin),
      rateMax: Number(item.rateMax),
    })),
    deposits: deposits.map((item) => ({ ...item, amount: round2(item.amount) })),
    withdraws: withdraws.map((item) => ({ ...item, amount: round2(item.amount) })),
    activities,
  };
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/frontend", express.static(FRONTEND_DIR));
app.use("/admin", express.static(ADMIN_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: getNowString() });
});

app.get("/api/site-config", async (_req, res) => {
  res.json(await getPublicSiteConfig());
});

app.post("/api/auth/register", async (req, res) => {
  const username = safeString(req.body.username);
  const password = safeString(req.body.password);
  const channel = safeString(req.body.channel, "account");

  if (username.length < 3 || password.length < 6) {
    res.status(400).json({ message: "账号至少3位，密码至少6位" });
    return;
  }

  const existed = await db.get("SELECT id FROM users WHERE username = ?", [username]);
  if (existed) {
    res.status(409).json({ message: "账号已存在" });
    return;
  }

  const now = getNowString();
  const userId = newId("u");
  const hash = await bcrypt.hash(password, 10);

  await db.run(
    `INSERT INTO users (
      id, username, password_hash, profile, channel, status,
      available_balance, principal_available, frozen_balance, profit_available, total_profit, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'enabled', 0, 0, 0, 0, 0, ?, ?)`,
    [userId, username, hash, username, channel, now, now]
  );

  await addActivity(`新用户 ${username} 注册成功。`);
  res.json({ token: signToken({ role: "user", userId, username }), summary: await getUserSummary(userId) });
});

app.post("/api/auth/login", async (req, res) => {
  const username = safeString(req.body.username);
  const password = safeString(req.body.password);

  if (!username || !password) {
    res.status(400).json({ message: "请输入账号和密码" });
    return;
  }

  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ message: "账号或密码错误" });
    return;
  }

  res.json({
    token: signToken({ role: "user", userId: user.id, username: user.username }),
    summary: await getUserSummary(user.id),
  });
});

app.get("/api/me/summary", requireUser, async (req, res) => {
  const summary = await getUserSummary(req.user.userId);
  if (!summary) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  res.json(summary);
});

app.get("/api/orders/templates", async (_req, res) => {
  const rows = await db.all(
    `SELECT id, title, tag, description,
            min_amount AS minAmount,
            freeze_min AS freezeMin,
            freeze_max AS freezeMax,
            rate_min AS rateMin,
            rate_max AS rateMax,
            status
     FROM order_templates
     WHERE archived = 0 AND status = 'on_shelf'
     ORDER BY updated_at DESC`
  );

  res.json({
    products: rows.map((item) => ({
      id: item.id,
      name: item.title,
      subtitle: item.description || "",
      tag: item.tag || "",
      minAmount: round2(item.minAmount),
      freezeMin: Number(item.freezeMin),
      freezeMax: Number(item.freezeMax),
      minRate: Number(item.rateMin),
      maxRate: Number(item.rateMax),
      status: item.status,
    })),
  });
});

app.post("/api/orders", requireUser, async (req, res) => {
  const templateId = safeString(req.body.templateId);
  const amount = round2(req.body.amount);

  if (!templateId || amount <= 0) {
    res.status(400).json({ message: "下单参数不完整" });
    return;
  }

  const user = await getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  if (user.status !== "enabled") {
    res.status(403).json({ message: "账号已被限制" });
    return;
  }

  const template = await db.get("SELECT * FROM order_templates WHERE id = ? AND archived = 0", [templateId]);
  if (!template || template.status !== "on_shelf") {
    res.status(404).json({ message: "订单模板不可用" });
    return;
  }

  if (amount < Number(template.min_amount)) {
    res.status(400).json({ message: `当前项目最低金额 $${round2(template.min_amount)}` });
    return;
  }
  if (amount > Number(user.principal_available)) {
    res.status(400).json({ message: "可下单本金不足" });
    return;
  }

  const now = new Date();
  const nowText = getNowString();
  const freezeHour = randomIntBetween(template.freeze_min, template.freeze_max);
  const settleAt = new Date(now.getTime() + freezeHour * 60 * 60 * 1000);
  const settleText = `${settleAt.getFullYear()}-${String(settleAt.getMonth() + 1).padStart(2, "0")}-${String(
    settleAt.getDate()
  ).padStart(2, "0")} ${String(settleAt.getHours()).padStart(2, "0")}:${String(settleAt.getMinutes()).padStart(
    2,
    "0"
  )}:${String(settleAt.getSeconds()).padStart(2, "0")}`;

  const orderId = newId("uo");
  const orderCode = makeOrderCode();

  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run(
      `INSERT INTO user_orders (
        id, user_id, template_id, order_code, product_name,
        amount, profit, status, submitted_at, settle_at,
        min_rate, max_rate, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'running', ?, ?, ?, ?, ?)`,
      [
        orderId,
        user.id,
        template.id,
        orderCode,
        template.title,
        amount,
        nowText,
        settleText,
        Number(template.rate_min),
        Number(template.rate_max),
        nowText,
      ]
    );

    await db.run(
      `UPDATE users
       SET available_balance = available_balance - ?,
           principal_available = principal_available - ?,
           frozen_balance = frozen_balance + ?,
           updated_at = ?
       WHERE id = ?`,
      [amount, amount, amount, nowText, user.id]
    );

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  await addActivity(`用户 ${user.username} 提交订单 ${orderCode}，金额 $${amount.toFixed(2)}。`);
  res.json({ message: "订单已提交", summary: await getUserSummary(user.id) });
});

app.post("/api/orders/settle", requireUser, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const running = await db.all(
    "SELECT * FROM user_orders WHERE user_id = ? AND status = 'running' ORDER BY submitted_at ASC",
    [user.id]
  );

  const now = Date.now();
  const nowText = getNowString();
  const toSettle = running.filter((item) => new Date(item.settle_at).getTime() <= now);

  if (!toSettle.length) {
    res.json({ settledCount: 0, summary: await getUserSummary(user.id) });
    return;
  }

  let released = 0;
  let profitSum = 0;

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const order of toSettle) {
      const rate = randomBetween(Number(order.min_rate), Number(order.max_rate));
      const profit = round2(Number(order.amount) * (rate / 100));
      released += Number(order.amount);
      profitSum += profit;
      await db.run("UPDATE user_orders SET profit = ?, status = 'done', updated_at = ? WHERE id = ?", [profit, nowText, order.id]);
    }

    await db.run(
      `UPDATE users
       SET available_balance = available_balance + ?,
           principal_available = principal_available + ?,
           frozen_balance = frozen_balance - ?,
           profit_available = profit_available + ?,
           total_profit = total_profit + ?,
           updated_at = ?
       WHERE id = ?`,
      [
        round2(released + profitSum),
        round2(released),
        round2(released),
        round2(profitSum),
        round2(profitSum),
        nowText,
        user.id,
      ]
    );

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  await addActivity(`用户 ${user.username} 有 ${toSettle.length} 笔订单完成结算。`);
  res.json({ settledCount: toSettle.length, summary: await getUserSummary(user.id) });
});

app.post("/api/deposits", requireUser, upload.single("screenshot"), async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const amount = round2(req.body.amount);
  const methodRaw = safeString(req.body.method, "digital");
  const method = methodRaw === "bank" ? "银行卡" : "USDT";

  if (amount <= 0) {
    res.status(400).json({ message: "充值金额不合法" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "请上传转账截图" });
    return;
  }

  const now = getNowString();
  const recordId = newId("dep");
  const screenshotPath = `/uploads/${req.file.filename}`;

  await db.run(
    `INSERT INTO deposits (
      id, user_id, amount, method, screenshot,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', '', ?, '')`,
    [recordId, user.id, amount, method, screenshotPath, now]
  );

  await addActivity(`用户 ${user.username} 提交充值申请 ${recordId}。`);
  res.json({ message: "充值申请已提交", summary: await getUserSummary(user.id) });
});

app.post("/api/withdrawals", requireUser, async (req, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const amount = round2(req.body.amount);
  const methodRaw = safeString(req.body.method, "usdt");
  const method = methodRaw === "bank" ? "银行卡" : "USDT";

  if (amount <= 0) {
    res.status(400).json({ message: "提现金额不合法" });
    return;
  }
  if (amount > Number(user.available_balance)) {
    res.status(400).json({ message: "提现金额超出可用余额" });
    return;
  }

  let target = "";
  if (methodRaw === "bank") {
    const bankName = safeString(req.body.bankName);
    const bankOwner = safeString(req.body.bankOwner);
    const bankNo = safeString(req.body.bankNo);
    if (!bankName || !bankOwner || !bankNo) {
      res.status(400).json({ message: "请完整填写银行卡信息" });
      return;
    }
    target = `${bankName} / ${bankOwner} / ${bankNo}`;
  } else {
    const usdtAddress = safeString(req.body.usdtAddress);
    if (!usdtAddress) {
      res.status(400).json({ message: "请填写收款地址" });
      return;
    }
    target = usdtAddress;
  }

  const now = getNowString();
  const recordId = newId("wd");

  await db.run(
    `INSERT INTO withdrawals (
      id, user_id, amount, method, target,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, 'pending', '', ?, '')`,
    [recordId, user.id, amount, method, target, now]
  );

  await addActivity(`用户 ${user.username} 提交提现申请 ${recordId}。`);
  res.json({ message: "提现申请已提交", summary: await getUserSummary(user.id) });
});

app.post("/api/admin/login", async (req, res) => {
  const username = safeString(req.body.username);
  const password = safeString(req.body.password);

  const admin = await db.get("SELECT * FROM admins WHERE username = ?", [username]);
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    res.status(401).json({ message: "管理员账号或密码错误" });
    return;
  }

  res.json({ token: signToken({ role: "admin", adminId: admin.id, username: admin.username }), username: admin.username });
});

app.get("/api/admin/bootstrap", requireAdmin, async (_req, res) => {
  res.json(await getAdminState());
});

app.put("/api/admin/home-config", requireAdmin, async (req, res) => {
  const title = safeString(req.body.title);
  const subtitle = safeString(req.body.subtitle);
  const description = safeString(req.body.description);

  if (!title || !subtitle || !description) {
    res.status(400).json({ message: "首页配置不能为空" });
    return;
  }

  await db.run(
    "UPDATE home_config SET title = ?, brand_subtitle = ?, description = ?, updated_at = ? WHERE id = 1",
    [title, subtitle, description, getNowString()]
  );
  await addActivity("首页基础配置已更新。");
  res.json({ ok: true });
});

app.post("/api/admin/articles", requireAdmin, async (req, res) => {
  const id = newId("art");
  const category = safeString(req.body.category, "system");
  const status = safeString(req.body.status, "draft");
  const title = safeString(req.body.title);
  const content = safeString(req.body.content);
  const hot = Boolean(req.body.hot);

  if (!title || !content) {
    res.status(400).json({ message: "文章标题和内容不能为空" });
    return;
  }

  const now = getNowString();
  await db.run(
    `INSERT INTO articles (
      id, category, title, summary, content, author, published_at, status, hot, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'LockPro Admin', ?, ?, ?, ?)`,
    [id, category, title, content.slice(0, 80), content, now.slice(0, 10), status, hot ? 1 : 0, now]
  );

  await addActivity(`新增文章“${title}”。`);
  res.json({ ok: true });
});

app.put("/api/admin/articles/:id", requireAdmin, async (req, res) => {
  const articleId = req.params.id;
  const category = safeString(req.body.category, "system");
  const status = safeString(req.body.status, "draft");
  const title = safeString(req.body.title);
  const content = safeString(req.body.content);
  const hot = Boolean(req.body.hot);

  if (!title || !content) {
    res.status(400).json({ message: "文章标题和内容不能为空" });
    return;
  }

  const row = await db.get("SELECT id FROM articles WHERE id = ?", [articleId]);
  if (!row) {
    res.status(404).json({ message: "文章不存在" });
    return;
  }

  const now = getNowString();
  await db.run(
    `UPDATE articles
     SET category = ?, title = ?, summary = ?, content = ?, status = ?, hot = ?, updated_at = ?
     WHERE id = ?`,
    [category, title, content.slice(0, 80), content, status, hot ? 1 : 0, now, articleId]
  );

  await addActivity(`文章“${title}”已更新。`);
  res.json({ ok: true });
});

app.post("/api/admin/articles/:id/toggle", requireAdmin, async (req, res) => {
  const articleId = req.params.id;
  const row = await db.get("SELECT id, title, status FROM articles WHERE id = ?", [articleId]);
  if (!row) {
    res.status(404).json({ message: "文章不存在" });
    return;
  }
  if (row.status === "archived") {
    res.status(400).json({ message: "已归档文章不能切换状态" });
    return;
  }

  const nextStatus = row.status === "published" ? "draft" : "published";
  await db.run("UPDATE articles SET status = ?, updated_at = ? WHERE id = ?", [nextStatus, getNowString(), articleId]);
  await addActivity(`文章“${row.title}”状态切换为${nextStatus === "published" ? "已发布" : "草稿"}。`);
  res.json({ ok: true });
});

app.post("/api/admin/articles/:id/archive", requireAdmin, async (req, res) => {
  const articleId = req.params.id;
  const row = await db.get("SELECT id, title FROM articles WHERE id = ?", [articleId]);
  if (!row) {
    res.status(404).json({ message: "文章不存在" });
    return;
  }

  await db.run("UPDATE articles SET status = 'archived', updated_at = ? WHERE id = ?", [getNowString(), articleId]);
  await addActivity(`文章“${row.title}”已归档。`);
  res.json({ ok: true });
});

app.post("/api/admin/users/:id/balance", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const direction = safeString(req.body.direction, "add");
  const amount = round2(req.body.amount);

  if (amount <= 0) {
    res.status(400).json({ message: "金额必须大于 0" });
    return;
  }

  const user = await db.get("SELECT id, username, available_balance, principal_available FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  if (direction === "sub" && Number(user.principal_available) < amount) {
    res.status(400).json({ message: "可下单本金不足，无法扣减" });
    return;
  }

  const delta = direction === "sub" ? -amount : amount;
  await db.run("UPDATE users SET available_balance = available_balance + ?, principal_available = principal_available + ?, updated_at = ? WHERE id = ?", [delta, delta, getNowString(), user.id]);
  await addActivity(`管理员手动${direction === "sub" ? "减少" : "增加"}用户 ${user.username} 充值本金 $${amount.toFixed(2)}。`);
  res.json({ ok: true });
});

app.get("/api/admin/users/:id/orders", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const user = await db.get("SELECT id, username FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const orders = await db.all(
    `SELECT id, order_code AS orderCode, product_name AS productName,
            amount, profit, status, submitted_at AS submittedAt,
            settle_at AS settleAt
     FROM user_orders
     WHERE user_id = ?
     ORDER BY submitted_at DESC`,
    [userId]
  );

  res.json({ username: user.username, orders });
});

app.post("/api/admin/users/:id/delete-orders", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const orderIds = Array.isArray(req.body.orderIds) ? req.body.orderIds : [];

  if (!orderIds.length) {
    res.status(400).json({ message: "请选择要删除的订单" });
    return;
  }

  const user = await db.get("SELECT id, username FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const placeholders = orderIds.map(() => "?").join(",");
  const orders = await db.all(
    `SELECT id, amount, profit, status FROM user_orders WHERE id IN (${placeholders}) AND user_id = ?`,
    [...orderIds, userId]
  );

  if (!orders.length) {
    res.status(404).json({ message: "未找到符合条件的订单" });
    return;
  }

  let frozenDelta = 0;
  let principalDelta = 0;
  let availableAdd = 0;
  let profitDelta = 0;

  for (const order of orders) {
    if (order.status === "running") {
      frozenDelta += Number(order.amount);
      principalDelta += Number(order.amount);
      availableAdd += Number(order.amount);
    } else if (order.status === "done") {
      profitDelta += Number(order.profit);
    }
  }

  frozenDelta = round2(frozenDelta);
  principalDelta = round2(principalDelta);
  availableAdd = round2(availableAdd);
  profitDelta = round2(profitDelta);

  const nowText = getNowString();
  const matchedIds = orders.map((o) => o.id);
  const delPlaceholders = matchedIds.map(() => "?").join(",");

  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run(`DELETE FROM user_orders WHERE id IN (${delPlaceholders})`, matchedIds);

    await db.run(
      `UPDATE users
       SET available_balance  = MAX(available_balance + ? - ?, 0),
           principal_available = MAX(principal_available + ?, 0),
           frozen_balance     = MAX(frozen_balance - ?, 0),
           profit_available   = MAX(profit_available - ?, 0),
           total_profit       = MAX(total_profit - ?, 0),
           updated_at = ?
       WHERE id = ?`,
      [availableAdd, profitDelta, principalDelta, frozenDelta, profitDelta, profitDelta, nowText, userId]
    );

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  await addActivity(`管理员删除用户 ${user.username} 的 ${orders.length} 笔订单，回退冻结 $${frozenDelta.toFixed(2)}，扣减收益 $${profitDelta.toFixed(2)}。`);
  res.json({ ok: true, deleted: orders.length });
});

app.post("/api/admin/users/:id/toggle", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const user = await db.get("SELECT id, username, status FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }

  const nextStatus = user.status === "enabled" ? "banned" : "enabled";
  await db.run("UPDATE users SET status = ?, updated_at = ? WHERE id = ?", [nextStatus, getNowString(), user.id]);
  await addActivity(`用户 ${user.username} 已${nextStatus === "enabled" ? "启用" : "封禁"}。`);
  res.json({ ok: true });
});

app.post("/api/admin/orders", requireAdmin, async (req, res) => {
  const id = newId("ord_tpl");
  const code = `LP${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const title = safeString(req.body.title);
  const tag = safeString(req.body.tag);
  const description = safeString(req.body.description);
  const minAmount = round2(req.body.minAmount);
  const freezeMin = Number(req.body.freezeMin || 0);
  const freezeMax = Number(req.body.freezeMax || 0);
  const rateMin = Number(req.body.rateMin || 0);
  const rateMax = Number(req.body.rateMax || 0);
  const status = safeString(req.body.status, "on_shelf");

  if (!title || minAmount <= 0) {
    res.status(400).json({ message: "请填写完整订单标题与起投金额" });
    return;
  }
  if (freezeMin <= 0 || freezeMax <= 0 || freezeMin > freezeMax) {
    res.status(400).json({ message: "冻结时间区间不合法" });
    return;
  }
  if (rateMin < 0 || rateMax < 0 || rateMin > rateMax) {
    res.status(400).json({ message: "盈利比例区间不合法" });
    return;
  }

  await db.run(
    `INSERT INTO order_templates (
      id, code, title, tag, description, min_amount,
      freeze_min, freeze_max, rate_min, rate_max, status, archived, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, code, title, tag, description, minAmount, freezeMin, freezeMax, rateMin, rateMax, status, getNowString()]
  );

  await addActivity(`新增订单模板 ${code}。`);
  res.json({ ok: true });
});

app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const orderId = req.params.id;
  const row = await db.get("SELECT id, code FROM order_templates WHERE id = ?", [orderId]);
  if (!row) {
    res.status(404).json({ message: "订单模板不存在" });
    return;
  }

  const title = safeString(req.body.title);
  const tag = safeString(req.body.tag);
  const description = safeString(req.body.description);
  const minAmount = round2(req.body.minAmount);
  const freezeMin = Number(req.body.freezeMin || 0);
  const freezeMax = Number(req.body.freezeMax || 0);
  const rateMin = Number(req.body.rateMin || 0);
  const rateMax = Number(req.body.rateMax || 0);
  const status = safeString(req.body.status, "on_shelf");

  if (!title || minAmount <= 0) {
    res.status(400).json({ message: "请填写完整订单标题与起投金额" });
    return;
  }
  if (freezeMin <= 0 || freezeMax <= 0 || freezeMin > freezeMax) {
    res.status(400).json({ message: "冻结时间区间不合法" });
    return;
  }
  if (rateMin < 0 || rateMax < 0 || rateMin > rateMax) {
    res.status(400).json({ message: "盈利比例区间不合法" });
    return;
  }

  await db.run(
    `UPDATE order_templates
     SET title = ?, tag = ?, description = ?, min_amount = ?,
         freeze_min = ?, freeze_max = ?, rate_min = ?, rate_max = ?,
         status = ?, updated_at = ?
     WHERE id = ?`,
    [title, tag, description, minAmount, freezeMin, freezeMax, rateMin, rateMax, status, getNowString(), orderId]
  );

  await addActivity(`订单模板 ${row.code} 已更新。`);
  res.json({ ok: true });
});

app.post("/api/admin/orders/:id/toggle", requireAdmin, async (req, res) => {
  const orderId = req.params.id;
  const row = await db.get("SELECT id, code, status, archived FROM order_templates WHERE id = ?", [orderId]);
  if (!row) {
    res.status(404).json({ message: "订单模板不存在" });
    return;
  }
  if (Number(row.archived) === 1) {
    res.status(400).json({ message: "已归档订单不可操作" });
    return;
  }

  const nextStatus = row.status === "on_shelf" ? "off_shelf" : "on_shelf";
  await db.run("UPDATE order_templates SET status = ?, updated_at = ? WHERE id = ?", [nextStatus, getNowString(), orderId]);
  await addActivity(`订单模板 ${row.code} 已切换为${nextStatus === "on_shelf" ? "上架" : "下架"}。`);
  res.json({ ok: true });
});

app.post("/api/admin/orders/:id/archive", requireAdmin, async (req, res) => {
  const orderId = req.params.id;
  const row = await db.get("SELECT id, code FROM order_templates WHERE id = ?", [orderId]);
  if (!row) {
    res.status(404).json({ message: "订单模板不存在" });
    return;
  }

  await db.run("UPDATE order_templates SET archived = 1, status = 'off_shelf', updated_at = ? WHERE id = ?", [getNowString(), orderId]);
  await addActivity(`订单模板 ${row.code} 已归档。`);
  res.json({ ok: true });
});

app.post("/api/admin/deposits/:id/approve", requireAdmin, async (req, res) => {
  const recordId = req.params.id;
  const row = await db.get("SELECT * FROM deposits WHERE id = ?", [recordId]);
  if (!row) {
    res.status(404).json({ message: "充值记录不存在" });
    return;
  }
  if (row.status !== "pending") {
    res.status(400).json({ message: "该记录已处理" });
    return;
  }

  const user = await db.get("SELECT id, username FROM users WHERE id = ?", [row.user_id]);
  if (!user) {
    res.status(404).json({ message: "未找到对应用户" });
    return;
  }

  const now = getNowString();
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run("UPDATE deposits SET status = 'approved', reason = '', processed_at = ? WHERE id = ?", [now, recordId]);
    await db.run("UPDATE users SET available_balance = available_balance + ?, principal_available = principal_available + ?, updated_at = ? WHERE id = ?", [round2(row.amount), round2(row.amount), now, user.id]);
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  await addActivity(`充值申请 ${recordId} 已通过，已为 ${user.username} 增加 $${round2(row.amount).toFixed(2)}。`);
  res.json({ ok: true });
});

app.post("/api/admin/deposits/:id/reject", requireAdmin, async (req, res) => {
  const recordId = req.params.id;
  const reason = safeString(req.body.reason);
  if (!reason) {
    res.status(400).json({ message: "驳回原因不能为空" });
    return;
  }

  const row = await db.get("SELECT id FROM deposits WHERE id = ?", [recordId]);
  if (!row) {
    res.status(404).json({ message: "充值记录不存在" });
    return;
  }

  await db.run("UPDATE deposits SET status = 'rejected', reason = ?, processed_at = ? WHERE id = ? AND status = 'pending'", [reason, getNowString(), recordId]);
  await addActivity(`充值申请 ${recordId} 已驳回。`);
  res.json({ ok: true });
});

app.post("/api/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  const recordId = req.params.id;
  const row = await db.get("SELECT * FROM withdrawals WHERE id = ?", [recordId]);
  if (!row) {
    res.status(404).json({ message: "提现记录不存在" });
    return;
  }
  if (row.status !== "pending") {
    res.status(400).json({ message: "该记录已处理" });
    return;
  }

  const user = await db.get("SELECT id, username, available_balance, principal_available, profit_available FROM users WHERE id = ?", [row.user_id]);
  if (!user) {
    res.status(404).json({ message: "未找到对应用户" });
    return;
  }

  const amount = round2(row.amount);
  if (Number(user.available_balance) < amount) {
    res.status(400).json({ message: "用户可用余额不足，无法通过" });
    return;
  }
  const profitPart = Math.min(Number(user.profit_available) || 0, amount);
  const principalPart = round2(amount - profitPart);
  if (Number(user.principal_available) < principalPart) {
    res.status(400).json({ message: "用户本金余额不足，无法通过" });
    return;
  }

  const now = getNowString();
  await db.exec("BEGIN TRANSACTION");
  try {
    await db.run("UPDATE withdrawals SET status = 'approved', reason = '', processed_at = ? WHERE id = ?", [now, recordId]);
    await db.run(
      "UPDATE users SET available_balance = available_balance - ?, principal_available = principal_available - ?, profit_available = profit_available - ?, updated_at = ? WHERE id = ?",
      [amount, principalPart, round2(profitPart), now, user.id]
    );
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  await addActivity(`提现申请 ${recordId} 已通过，已扣减 ${user.username} $${amount.toFixed(2)}。`);
  res.json({ ok: true });
});

app.post("/api/admin/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  const recordId = req.params.id;
  const reason = safeString(req.body.reason);
  if (!reason) {
    res.status(400).json({ message: "驳回原因不能为空" });
    return;
  }

  const row = await db.get("SELECT id FROM withdrawals WHERE id = ?", [recordId]);
  if (!row) {
    res.status(404).json({ message: "提现记录不存在" });
    return;
  }

  await db.run("UPDATE withdrawals SET status = 'rejected', reason = ?, processed_at = ? WHERE id = ? AND status = 'pending'", [reason, getNowString(), recordId]);
  await addActivity(`提现申请 ${recordId} 已驳回。`);
  res.json({ ok: true });
});

app.get("/api/admin/order-generation-defaults", requireAdmin, async (_req, res) => {
  const row = await db.get("SELECT * FROM order_generation_defaults WHERE id = 1");
  if (!row) {
    res.json({ freezeMin: 1, freezeMax: 4, rateMin: 2, rateMax: 4.5, timeStart: "", timeEnd: "", projectPool: [] });
    return;
  }
  let pool = [];
  try { pool = JSON.parse(row.project_pool); } catch { pool = []; }
  res.json({
    freezeMin: row.freeze_min,
    freezeMax: row.freeze_max,
    rateMin: row.rate_min,
    rateMax: row.rate_max,
    timeStart: row.time_start,
    timeEnd: row.time_end,
    projectPool: pool,
  });
});

app.put("/api/admin/order-generation-defaults", requireAdmin, async (req, res) => {
  const freezeMin = Number(req.body.freezeMin || 0);
  const freezeMax = Number(req.body.freezeMax || 0);
  const rateMin = Number(req.body.rateMin || 0);
  const rateMax = Number(req.body.rateMax || 0);
  const timeStart = safeString(req.body.timeStart);
  const timeEnd = safeString(req.body.timeEnd);
  const projectPool = Array.isArray(req.body.projectPool) ? req.body.projectPool : [];

  if (freezeMin <= 0 || freezeMax <= 0 || freezeMin > freezeMax) {
    res.status(400).json({ message: "冻结时间区间不合法" });
    return;
  }
  if (rateMin < 0 || rateMax < 0 || rateMin > rateMax) {
    res.status(400).json({ message: "收益比例区间不合法" });
    return;
  }
  if (!timeStart || !timeEnd) {
    res.status(400).json({ message: "时间区间不能为空" });
    return;
  }

  await db.run(
    `UPDATE order_generation_defaults
     SET freeze_min = ?, freeze_max = ?, rate_min = ?, rate_max = ?,
         time_start = ?, time_end = ?, project_pool = ?, updated_at = ?
     WHERE id = 1`,
    [freezeMin, freezeMax, rateMin, rateMax, timeStart, timeEnd, JSON.stringify(projectPool), getNowString()]
  );

  await addActivity("自动订单默认配置已更新。");
  res.json({ ok: true });
});

app.post("/api/admin/users/:id/generate-orders", requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const totalAmount = round2(req.body.totalAmount);
  const orderCount = Math.max(1, Math.floor(Number(req.body.orderCount) || 1));

  if (totalAmount <= 0) {
    res.status(400).json({ message: "总金额必须大于 0" });
    return;
  }

  const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ message: "用户不存在" });
    return;
  }
  if (totalAmount > Number(user.principal_available)) {
    res.status(400).json({ message: `可用本金不足，当前本金 $${round2(user.principal_available).toFixed(2)}` });
    return;
  }

  const defaults = await db.get("SELECT * FROM order_generation_defaults WHERE id = 1");
  const freezeMin = Number(req.body.freezeMin ?? defaults?.freeze_min ?? 1);
  const freezeMax = Number(req.body.freezeMax ?? defaults?.freeze_max ?? 4);
  const rateMin = Number(req.body.rateMin ?? defaults?.rate_min ?? 2);
  const rateMax = Number(req.body.rateMax ?? defaults?.rate_max ?? 4.5);
  const timeStart = safeString(req.body.timeStart) || defaults?.time_start || "";
  const timeEnd = safeString(req.body.timeEnd) || defaults?.time_end || "";

  let projectPool = [];
  if (Array.isArray(req.body.projectPool) && req.body.projectPool.length > 0) {
    projectPool = req.body.projectPool;
  } else {
    try { projectPool = JSON.parse(defaults?.project_pool || "[]"); } catch { projectPool = []; }
  }
  if (!projectPool.length) {
    projectPool = ["Value Matrix", "Signal Harbor", "Nova Grid", "Apex Flow", "Orion Pulse"];
  }

  if (!timeStart || !timeEnd) {
    res.status(400).json({ message: "订单时间区间不能为空" });
    return;
  }

  const tsStart = new Date(timeStart.replace(" ", "T")).getTime();
  const tsEnd = new Date(timeEnd.replace(" ", "T")).getTime();
  if (!Number.isFinite(tsStart) || !Number.isFinite(tsEnd) || tsStart > tsEnd) {
    res.status(400).json({ message: "订单时间区间不合法" });
    return;
  }

  const totalCents = Math.round(totalAmount * 100);
  const amounts = [];
  let remaining = totalCents;
  for (let i = 0; i < orderCount - 1; i++) {
    const avgRemaining = remaining / (orderCount - i);
    const lo = Math.max(1, Math.floor(avgRemaining * 0.5));
    const hi = Math.min(remaining - (orderCount - i - 1), Math.ceil(avgRemaining * 1.5));
    const cents = Math.floor(Math.random() * (hi - lo + 1)) + lo;
    amounts.push(cents);
    remaining -= cents;
  }
  amounts.push(remaining);

  const now = Date.now();
  const nowText = getNowString();

  let totalFrozen = 0;
  let totalReleasedPrincipal = 0;
  let totalProfitEarned = 0;

  const orders = amounts.map((cents) => {
    const amount = round2(cents / 100);
    const orderTime = new Date(tsStart + Math.random() * (tsEnd - tsStart));
    const freezeHours = freezeMin + Math.random() * (freezeMax - freezeMin);
    const settleTime = new Date(orderTime.getTime() + freezeHours * 3600000);
    const rate = rateMin + Math.random() * (rateMax - rateMin);
    const profit = round2(amount * (rate / 100));
    const projectName = projectPool[Math.floor(Math.random() * projectPool.length)];
    const isDone = settleTime.getTime() <= now;

    const fmt = (d) => {
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    };

    if (isDone) {
      totalReleasedPrincipal += amount;
      totalProfitEarned += profit;
    } else {
      totalFrozen += amount;
    }

    return {
      id: newId("uo"),
      orderCode: makeOrderCode(),
      productName: projectName,
      amount,
      profit: isDone ? profit : 0,
      status: isDone ? "done" : "running",
      submittedAt: fmt(orderTime),
      settleAt: fmt(settleTime),
      minRate: rateMin,
      maxRate: rateMax,
    };
  });

  totalFrozen = round2(totalFrozen);
  totalReleasedPrincipal = round2(totalReleasedPrincipal);
  totalProfitEarned = round2(totalProfitEarned);

  await db.exec("BEGIN TRANSACTION");
  try {
    for (const order of orders) {
      await db.run(
        `INSERT INTO user_orders (
          id, user_id, template_id, order_code, product_name,
          amount, profit, status, submitted_at, settle_at,
          min_rate, max_rate, updated_at
        ) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order.id, userId, order.orderCode, order.productName,
         order.amount, order.profit, order.status, order.submittedAt,
         order.settleAt, order.minRate, order.maxRate, nowText]
      );
    }

    await db.run(
      `UPDATE users
       SET available_balance = available_balance - ? + ?,
           principal_available = principal_available - ? + ?,
           frozen_balance = frozen_balance + ?,
           profit_available = profit_available + ?,
           total_profit = total_profit + ?,
           updated_at = ?
       WHERE id = ?`,
      [totalAmount, round2(totalReleasedPrincipal + totalProfitEarned),
       totalAmount, totalReleasedPrincipal, totalFrozen,
       totalProfitEarned, totalProfitEarned,
       nowText, userId]
    );

    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }

  const doneCount = orders.filter((o) => o.status === "done").length;
  const runningCount = orders.filter((o) => o.status === "running").length;
  await addActivity(`管理员为用户 ${user.username} 批量生成 ${orders.length} 笔订单（已完成${doneCount}笔，进行中${runningCount}笔），总金额 $${totalAmount.toFixed(2)}。`);
  res.json({ ok: true, generated: orders.length, doneCount, runningCount });
});

app.put("/api/admin/agreement", requireAdmin, async (req, res) => {
  const content = safeString(req.body.content);
  if (!content) {
    res.status(400).json({ message: "协议内容不能为空" });
    return;
  }

  await db.run("UPDATE agreements SET content = ?, updated_at = ? WHERE id = 1", [content, getNowString()]);
  await addActivity("用户协议内容已更新。");
  res.json({ ok: true });
});

app.put("/api/admin/password", requireAdmin, async (req, res) => {
  const newPassword = safeString(req.body.newPassword);
  if (newPassword.length < 8) {
    res.status(400).json({ message: "新密码长度至少 8 位" });
    return;
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await db.run("UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?", [hash, getNowString(), req.admin.adminId]);
  await addActivity("管理员密码已更新。");
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.get("/admin-panel", (_req, res) => {
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: `上传失败：${err.message}` });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "服务器内部错误" });
});

app.listen(PORT, () => {
  console.log(`LockPro server running on http://localhost:${PORT}`);
});
