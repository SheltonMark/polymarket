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

## 4.3 上传代码（SCP / 本地上传）

当前线上环境**不以服务器执行 `git clone` / `git pull` 为约定**（网络或策略限制时）。首次上线请在**本机**克隆仓库后，将项目目录同步到服务器，例如：

- 使用 **SCP / SFTP / rsync** 将整个 `polymarket` 目录上传到 `/home/ubuntu/apps/polymarket`；
- 或使用打包：`tar` / `zip` 在本机打好再上传到服务器解压到上述路径。

日常增量发布流程见 **[deploy-workflow.md](./deploy-workflow.md)**（仅 SCP）。

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

日常发布顺序（含构建失败时的处理、commit/push 先后）见 **[deploy-workflow.md](./deploy-workflow.md)**。

## 5.1 本地流程（建议）
1. **若有构建**：先在本地执行项目的构建命令，失败则改代码直至构建通过（参见 [deploy-workflow.md](./deploy-workflow.md)）。
2. `git add` / `git commit` / `git push`（便于备份与协作）。
3. **仅使用 SCP** 将变更文件上传到服务器（命令与清单见 [deploy-workflow.md](./deploy-workflow.md)）。

## 5.2 服务器更新（SCP，唯一约定）

1. 在本机按改动列表执行 `scp`（勿依赖服务器 `git pull`）。
2. 若 **`server/package.json`** 或 **`package-lock.json`** 有更新：SSH 登录后执行  
   `cd /home/ubuntu/apps/polymarket/server && npm install`
3. 重启应用：
```bash
cd /home/ubuntu/apps/polymarket/server
pm2 restart lockpro --update-env
```

## 6. 回滚方案

## 6.1 回滚（本地 Git + SCP 覆盖）

服务器不使用 `git pull` 时，回滚在**本地仓库**选定稳定版本，再将对应文件 **SCP 覆盖**到服务器并重启：

```bash
# 本机
cd /path/to/polymarket
git log --oneline -n 20
git checkout <稳定提交哈希>
# 将需要回滚的文件按 deploy-workflow 方式 scp 到服务器 …
```

完成后可将本地分支恢复为 `main` 继续开发；以服务器上已覆盖的文件为准运行。

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
