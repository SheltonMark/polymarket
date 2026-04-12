# LockPro 服务器部署与运维说明

## 1. 文档目的
本文件用于说明 LockPro（前端 + 后端 + SQLite）的标准部署、更新、回滚、日志排查流程。

## 2. 安全约束
1. 服务器账号、密码、私钥路径、数据库密码等敏感信息仅存放本地私有文件：`docs/config.md`（已在 `.gitignore` 中忽略）。
2. 禁止把敏感信息写入仓库文档、代码、提交记录。
3. 优先使用 SSH 密钥登录，避免长期使用密码登录。

## 3. 当前部署形态
1. 服务器系统：Ubuntu 24.04 LTS。
2. 应用目录：`/home/ubuntu/apps/polymarket`。
3. 运行进程：`pm2` 进程名 `lockpro`。
4. 服务端口：默认 `3000`（Node/Express）。
5. 数据库：SQLite（文件在 `server/data/`）。

## 4. 首次部署（服务器侧）
## 4.1 安装基础环境
```bash
sudo apt update
sudo apt install -y git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
pm2 -v
```

## 4.2 准备目录
```bash
mkdir -p /home/ubuntu/apps
cd /home/ubuntu/apps
```

## 4.3 上传代码（二选一）
1. Git 方式（推荐）
```bash
git clone https://github.com/SheltonMark/polymarket.git
```

2. SCP 方式（网络受限时）
- 在本地将项目目录同步到 `/home/ubuntu/apps/polymarket`。

## 4.4 安装依赖并启动
```bash
cd /home/ubuntu/apps/polymarket/server
npm install
pm2 start src/app.js --name lockpro
pm2 save
pm2 startup
```

## 4.5 验证
```bash
pm2 list
curl http://127.0.0.1:3000/api/health
```

## 5. 日常更新部署

## 5.1 本地流程（建议）
1. 本地改动并测试。
2. `git add` / `git commit` / `git push`。
3. 部署到服务器。

## 5.2 服务器更新（Git 方式）
```bash
cd /home/ubuntu/apps/polymarket
git pull --rebase origin main
cd server
npm install
pm2 restart lockpro --update-env
```

## 5.3 服务器更新（SCP 方式）
1. 本地将变更文件 `scp` 到服务器对应路径。
2. 执行：
```bash
cd /home/ubuntu/apps/polymarket
pm2 restart lockpro --update-env
```

## 6. 回滚方案

## 6.1 Git 回滚（推荐）
```bash
cd /home/ubuntu/apps/polymarket
git log --oneline -n 20
git checkout <稳定提交哈希>
cd server
pm2 restart lockpro --update-env
```

## 6.2 代码快照回滚
- 若使用 SCP，可在上传前先备份目标文件（`*.bak`），异常时恢复并重启 PM2。

## 7. 日志与排障
```bash
pm2 list
pm2 logs lockpro --lines 200
pm2 describe lockpro
```

常见检查项：
1. `server/node_modules` 是否完整。
2. `server/data/*.db` 是否存在且权限正常。
3. `server/uploads/` 目录是否存在且可写。
4. 端口 `3000` 是否被占用。

## 8. SQLite 数据备份
```bash
cd /home/ubuntu/apps/polymarket
mkdir -p backups
cp server/data/lockpro.db backups/lockpro_$(date +%F_%H%M%S).db
```

建议：
1. 每次重大部署前备份一次。
2. 保留最近 N 份备份，定期清理。

## 9. Nginx 与 SSL（可选但推荐）

## 9.1 目的
- 使用 80/443 对外访问，反代到 `127.0.0.1:3000`。
- 启用 HTTPS 证书（Let's Encrypt 免费证书）。

## 9.2 基本步骤
1. 安装 Nginx 与 Certbot。
2. 配置反向代理站点。
3. 申请证书并启用自动续期。

> 无域名场景可先使用 IP + HTTP，后续绑定域名再上 SSL。

## 10. 运维约定
1. 统一使用 `pm2 restart lockpro --update-env` 重启。
2. 生产改动先本地验证，再部署。
3. 每次部署记录：提交哈希、部署时间、操作者、结果。
