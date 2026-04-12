import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT_DIR, "server", "data");
const DB_FILE = path.join(DATA_DIR, "lockpro.db");

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

const DEFAULT_PROJECT_POOL = [
  "Value Matrix",
  "Value Matrix Alpha",
  "Value Matrix Beta",
  "Signal Harbor",
  "Signal Harbor Prime",
  "Nova Grid",
  "Nova Grid Plus",
  "Apex Flow",
  "Apex Flow Core",
  "Orion Pulse",
  "Orion Pulse Pro",
  "Delta Quantum",
  "Delta Quantum One",
  "Momentum Core",
  "Momentum Core X",
  "Prime Arc",
  "Prime Arc R",
  "Vector Bridge",
  "Vector Bridge Max",
  "Helix Track",
  "Helix Track 7",
  "Zenith Node",
  "Zenith Node Q",
  "Atlas Drive",
  "Atlas Drive Z",
  "Aurora Link",
  "Aurora Link Neo",
  "Titan Sync",
  "Titan Sync Plus",
  "Pulse Select",
  "Pulse Select Pro",
  "Event Alpha",
  "Event Alpha Max",
  "Prime Growth",
  "Prime Growth C",
  "Cross Beam",
  "Cross Beam One",
  "Falcon Route",
  "Falcon Route 9",
  "Lattice Point",
  "Lattice Point G",
  "Vertex One",
  "Vertex One S",
  "Echo Matrix",
  "Echo Matrix 3",
  "Nimbus Vault",
  "Nimbus Vault M",
  "Quantum Drift",
  "Quantum Drift V",
  "Meridian Track",
  "Meridian Track K",
];

function getDefaultOrderGenerationRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return {
    start: `${y}-${m}-${d} 09:00:00`,
    end: `${y}-${m}-${d} 18:00:00`,
  };
}

function getDefaultOrderGenerationConfig() {
  const range = getDefaultOrderGenerationRange();
  return {
    freezeMin: 1,
    freezeMax: 4,
    rateMin: 2,
    rateMax: 4.5,
    timeStart: range.start,
    timeEnd: range.end,
    projectPool: DEFAULT_PROJECT_POOL,
  };
}
async function seedInitialData(db) {
  const now = nowString();
  const adminPasswordHash = await bcrypt.hash("admin123456", 10);

  await db.run(
    `INSERT INTO admins (id, username, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    ["adm_1", "admin", adminPasswordHash, now, now]
  );

  await db.run(
    `INSERT INTO home_config (
      id, brand_subtitle, home_tag, title, description,
      digital_address, bank_name, bank_account_name, bank_account_no, bank_branch,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      "Digital Asset Workspace",
      "内容专栏",
      "LockPro 深度内容中心",
      "围绕量化策略、系统逻辑和行业动态持续更新，支持按专题筛选并查看完整文章详情。",
      "TRON-TX5V8ZVQ2FJ3L8KM9P6S1N4Q7R2W0YH8J",
      "招商银行",
      "平台结算账户",
      "6225 8888 7766 1098",
      "深圳南山支行",
      now,
    ]
  );

  await db.run(
    `INSERT INTO agreements (id, content, updated_at) VALUES (?, ?, ?)`,
    [
      1,
      `【用户协议】\n\n1. 用户在注册前应完整阅读并同意本协议条款。\n2. 用户需确保提交的账户与收款信息真实、有效、可核验。\n3. 平台有权依据风控规则对异常行为进行限制或进一步核验。\n4. 用户应妥善保管账号与密码，因个人原因造成的损失由用户承担。\n5. 本协议最终解释与更新说明以平台最新发布版本为准。`,
      now,
    ]
  );

  const defaultConfig = getDefaultOrderGenerationConfig();
  await db.run(
    `INSERT INTO order_generation_defaults (
      id, freeze_min, freeze_max, rate_min, rate_max,
      time_start, time_end, project_pool, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      defaultConfig.freezeMin,
      defaultConfig.freezeMax,
      defaultConfig.rateMin,
      defaultConfig.rateMax,
      defaultConfig.timeStart,
      defaultConfig.timeEnd,
      JSON.stringify(defaultConfig.projectPool),
      now,
    ]
  );

  const userHash = await bcrypt.hash("12345678", 10);
  const users = [
    {
      id: "u_1001",
      username: "mark0916",
      profile: "mark0916@example.com",
      channel: "email",
      status: "enabled",
      available: 1290.25,
      frozen: 180,
      totalProfit: 0,
      createdAt: "2026-04-05 10:20:31",
    },
    {
      id: "u_1002",
      username: "sunny168",
      profile: "138****8888",
      channel: "phone",
      status: "enabled",
      available: 820.9,
      frozen: 0,
      totalProfit: 11.6,
      createdAt: "2026-04-07 09:11:24",
    },
    {
      id: "u_1003",
      username: "haku11",
      profile: "haku11@proton.me",
      channel: "email",
      status: "banned",
      available: 305.4,
      frozen: 92,
      totalProfit: 0,
      createdAt: "2026-04-08 14:43:06",
    },
  ];

  for (const user of users) {
    await db.run(
      `INSERT INTO users (
        id, username, password_hash, profile, channel, status,
        available_balance, principal_available, frozen_balance, profit_available, total_profit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.username,
        userHash,
        user.profile,
        user.channel,
        user.status,
        user.available,
        Number((user.available - Math.min(user.totalProfit, user.available)).toFixed(2)),
        user.frozen,
        Number(Math.min(user.totalProfit, user.available).toFixed(2)),
        user.totalProfit,
        user.createdAt,
        now,
      ]
    );
  }

  const articles = [
    {
      id: "art_001",
      category: "hedge",
      title: "量化对冲套利的核心框架与执行边界",
      summary: "拆解对冲套利的信号生成、仓位控制和执行节奏，明确策略在不同波动阶段的适用条件。",
      content:
        "量化对冲套利的目标不是追求单笔极值收益，而是通过高纪律、可重复的执行提升总体稳定性。\n\n在执行层面，需要优先控制风险敞口和仓位结构，其次才是进场时机优化。通过持续校准参数，可以减少市场噪音对结果的冲击。\n\n系统化的复盘机制同样关键，它决定了策略能否在环境变化中保持适应能力。",
      author: "LockPro Research",
      publishedAt: "2026-04-10",
      status: "published",
      hot: 1,
      updatedAt: "2026-04-10 20:12:08",
    },
    {
      id: "art_002",
      category: "system",
      title: "系统说明：从信号到结果的闭环设计",
      summary: "说明指标、阈值、执行和复盘之间的关系，帮助用户快速理解策略为什么有效。",
      content:
        "策略逻辑的关键在于闭环：信号识别、条件确认、执行动作和结果反馈必须形成一致链路。\n\n如果缺少反馈层，模型就无法对偏差进行修正，长期表现会逐步退化。\n\n因此我们在设计时强调可解释、可验证、可追踪，确保每个步骤都有明确输入输出。",
      author: "LockPro Research",
      publishedAt: "2026-04-09",
      status: "published",
      hot: 0,
      updatedAt: "2026-04-10 21:52:09",
    },
    {
      id: "art_003",
      category: "news",
      title: "区块链时事速览：近期市场情绪与风险关注点",
      summary: "从资金流向和波动特征出发，提炼近期值得关注的行业动态与风险提示。",
      content:
        "市场情绪通常会在短周期内快速切换，热点题材往往伴随更高波动。\n\n对普通用户而言，保持节奏稳定比追逐短时情绪更重要。\n\n建议在观察行业动态时，始终结合自身仓位结构与风险承受能力。",
      author: "LockPro News Desk",
      publishedAt: "2026-04-05",
      status: "published",
      hot: 1,
      updatedAt: "2026-04-11 08:06:41",
    },
  ];

  for (const article of articles) {
    await db.run(
      `INSERT INTO articles (
        id, category, title, summary, content, author, published_at,
        status, hot, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.id,
        article.category,
        article.title,
        article.summary,
        article.content,
        article.author,
        article.publishedAt,
        article.status,
        article.hot,
        article.updatedAt,
      ]
    );
  }

  const orderTemplates = [
    {
      id: "ord_tpl_3001",
      code: "LPA7Q2M91",
      title: "Prime Growth",
      tag: "热门订单池",
      description: "热门订单池，活跃度高",
      minAmount: 120,
      freezeMin: 1,
      freezeMax: 3,
      rateMin: 1.8,
      rateMax: 4.2,
      status: "on_shelf",
      archived: 0,
      updatedAt: "2026-04-10 18:35:40",
    },
    {
      id: "ord_tpl_3002",
      code: "LPF1K9P83",
      title: "Event Alpha",
      tag: "跨市场组合",
      description: "跨市场组合，流动性稳定",
      minAmount: 220,
      freezeMin: 2,
      freezeMax: 4,
      rateMin: 2,
      rateMax: 3.8,
      status: "on_shelf",
      archived: 0,
      updatedAt: "2026-04-11 09:20:21",
    },
    {
      id: "ord_tpl_3003",
      code: "LPT8V3Q91",
      title: "Momentum Core",
      tag: "中高频策略",
      description: "中高频策略组合，成交活跃",
      minAmount: 360,
      freezeMin: 3,
      freezeMax: 6,
      rateMin: 2.2,
      rateMax: 5,
      status: "on_shelf",
      archived: 0,
      updatedAt: "2026-04-11 09:20:22",
    },
    {
      id: "ord_tpl_3004",
      code: "LPB5K9H22",
      title: "Value Matrix",
      tag: "多市场覆盖",
      description: "多市场覆盖，策略稳定",
      minAmount: 180,
      freezeMin: 2,
      freezeMax: 4,
      rateMin: 1.9,
      rateMax: 4.1,
      status: "on_shelf",
      archived: 0,
      updatedAt: "2026-04-11 09:20:23",
    },
    {
      id: "ord_tpl_3005",
      code: "LPC2A6M40",
      title: "Pulse Select",
      tag: "快节奏标的池",
      description: "快节奏标的池，流转效率高",
      minAmount: 260,
      freezeMin: 3,
      freezeMax: 5,
      rateMin: 2,
      rateMax: 4.8,
      status: "on_shelf",
      archived: 0,
      updatedAt: "2026-04-11 09:20:24",
    },
  ];

  for (const template of orderTemplates) {
    await db.run(
      `INSERT INTO order_templates (
        id, code, title, tag, description, min_amount,
        freeze_min, freeze_max, rate_min, rate_max, status, archived, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        template.id,
        template.code,
        template.title,
        template.tag,
        template.description,
        template.minAmount,
        template.freezeMin,
        template.freezeMax,
        template.rateMin,
        template.rateMax,
        template.status,
        template.archived,
        template.updatedAt,
      ]
    );
  }

  await db.run(
    `INSERT INTO user_orders (
      id, user_id, template_id, order_code, product_name,
      amount, profit, status, submitted_at, settle_at, min_rate, max_rate, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "uo_7001",
      "u_1002",
      "ord_tpl_3001",
      "ODR20260410A1B2C3",
      "Prime Growth",
      260,
      11.6,
      "done",
      "2026-04-10 10:12:22",
      "2026-04-10 12:12:22",
      1.8,
      4.2,
      "2026-04-10 12:12:22",
    ]
  );

  await db.run(
    `INSERT INTO deposits (
      id, user_id, amount, method, screenshot,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "dep_4001",
      "u_1002",
      260,
      "USDT",
      "https://placehold.co/420x260/png",
      "pending",
      "",
      "2026-04-11 10:30:18",
      "",
    ]
  );

  await db.run(
    `INSERT INTO deposits (
      id, user_id, amount, method, screenshot,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "dep_4002",
      "u_1001",
      380,
      "银行卡",
      "https://placehold.co/420x260/png",
      "rejected",
      "金额与截图流水不一致",
      "2026-04-11 09:13:49",
      "2026-04-11 09:48:57",
    ]
  );

  await db.run(
    `INSERT INTO withdrawals (
      id, user_id, amount, method, target,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "wd_5001",
      "u_1001",
      120,
      "银行卡",
      "招商银行 / 尾号1098",
      "pending",
      "",
      "2026-04-11 11:16:22",
      "",
    ]
  );

  await db.run(
    `INSERT INTO withdrawals (
      id, user_id, amount, method, target,
      status, reason, submitted_at, processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "wd_5002",
      "u_1003",
      80,
      "USDT",
      "TRON-TY***92M",
      "rejected",
      "账户状态异常，请联系客服",
      "2026-04-11 08:24:06",
      "2026-04-11 08:42:31",
    ]
  );

  const activities = [
    "提现申请 wd_5001 提交待审核。",
    "充值申请 dep_4001 提交待审核。",
    "充值申请 dep_4002 已驳回。",
  ];

  for (const text of activities) {
    await db.run(`INSERT INTO activities (id, text, created_at) VALUES (?, ?, ?)`, [makeId("act"), text, now]);
  }
}

export function getNowString() {
  return nowString();
}

export function newId(prefix) {
  return makeId(prefix);
}

export async function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'enabled',
      available_balance REAL NOT NULL DEFAULT 0,
      principal_available REAL NOT NULL DEFAULT 0,
      frozen_balance REAL NOT NULL DEFAULT 0,
      profit_available REAL NOT NULL DEFAULT 0,
      total_profit REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_config (
      id INTEGER PRIMARY KEY,
      brand_subtitle TEXT NOT NULL,
      home_tag TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      digital_address TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bank_account_name TEXT NOT NULL,
      bank_account_no TEXT NOT NULL,
      bank_branch TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agreements (
      id INTEGER PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      published_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      hot INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_templates (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      tag TEXT NOT NULL,
      description TEXT NOT NULL,
      min_amount REAL NOT NULL,
      freeze_min INTEGER NOT NULL,
      freeze_max INTEGER NOT NULL,
      rate_min REAL NOT NULL,
      rate_max REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'on_shelf',
      archived INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_generation_defaults (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      freeze_min INTEGER NOT NULL,
      freeze_max INTEGER NOT NULL,
      rate_min REAL NOT NULL,
      rate_max REAL NOT NULL,
      time_start TEXT NOT NULL,
      time_end TEXT NOT NULL,
      project_pool TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      template_id TEXT,
      order_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      amount REAL NOT NULL,
      profit REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'running',
      submitted_at TEXT NOT NULL,
      settle_at TEXT NOT NULL,
      min_rate REAL NOT NULL,
      max_rate REAL NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      screenshot TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reason TEXT NOT NULL DEFAULT '',
      submitted_at TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      target TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reason TEXT NOT NULL DEFAULT '',
      submitted_at TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const userColumns = await db.all("PRAGMA table_info(users)");
  const hasPrincipalAvailable = userColumns.some((column) => column.name === "principal_available");
  const hasProfitAvailable = userColumns.some((column) => column.name === "profit_available");

  if (!hasPrincipalAvailable) {
    await db.exec("ALTER TABLE users ADD COLUMN principal_available REAL NOT NULL DEFAULT 0");
  }

  if (!hasProfitAvailable) {
    await db.exec("ALTER TABLE users ADD COLUMN profit_available REAL NOT NULL DEFAULT 0");
  }

  if (!hasPrincipalAvailable || !hasProfitAvailable) {
    await db.exec(`
      UPDATE users
      SET profit_available = ROUND(
            CASE
              WHEN available_balance <= 0 THEN 0
              WHEN total_profit <= 0 THEN 0
              WHEN total_profit >= available_balance THEN available_balance
              ELSE total_profit
            END, 2
          ),
          principal_available = ROUND(
            available_balance - CASE
              WHEN available_balance <= 0 THEN 0
              WHEN total_profit <= 0 THEN 0
              WHEN total_profit >= available_balance THEN available_balance
              ELSE total_profit
            END, 2
          )
    `);
  }

  const adminCountRow = await db.get(`SELECT COUNT(1) AS count FROM admins`);
  if (!adminCountRow || Number(adminCountRow.count) === 0) {
    await seedInitialData(db);
  }


  const defaultConfig = getDefaultOrderGenerationConfig();
  await db.run(
    `INSERT OR IGNORE INTO order_generation_defaults (
      id, freeze_min, freeze_max, rate_min, rate_max,
      time_start, time_end, project_pool, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      defaultConfig.freezeMin,
      defaultConfig.freezeMax,
      defaultConfig.rateMin,
      defaultConfig.rateMax,
      defaultConfig.timeStart,
      defaultConfig.timeEnd,
      JSON.stringify(defaultConfig.projectPool),
      getNowString(),
    ]
  );  return db;
}




