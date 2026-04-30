# LockPro 发布与部署流程（日常）

本文描述**从改代码到上线**的推荐顺序；服务器目录、PM2、健康检查等细节见 [server-deployment-guide.md](./server-deployment-guide.md)。敏感信息（SSH 主机、密钥路径）只写在本地 `docs/config.md`，**不要**写进仓库。

---

## 1. 总体顺序（牢记）

```
本地修改代码
    ↓
（若项目有构建步骤）在本地执行构建
    ↓
构建失败 → 先修构建/代码，再重新构建，直到通过
    ↓
git commit + git push（保证远端与即将上线内容一致）
    ↓
部署到服务器（git pull 或 scp）
    ↓
（若依赖或脚本有变）服务器上 npm install 等
    ↓
pm2 restart lockpro --update-env
    ↓
验收（健康检查、关键页面）
```

**原则：** 永远是「构建绿 → 再 commit/push → 再部署」。不要把未进 Git 或未通过构建的产物直接丢上服务器。

---

## 2. 当前仓库的构建说明

| 部分 | 说明 |
|------|------|
| `frontend/`、`admin/` | 静态 HTML / CSS / JS，由 Express 静态托管，**当前无 `npm run build`**。改完直接随 Git 或 scp 同步即可。 |
| `server/` | Node 直接运行 `src/app.js`，**无打包构建**；`package.json` 仅有 `start` / `dev`。依赖变更后需在服务器执行 `npm install`。 |

若日后为前台增加 Vite/Webpack 等，应在本节补充：**本地执行的构建命令**、**产物目录**、以及部署时需同步的是「构建输出」还是「源码」。

---

## 3. 本地：提交前检查清单

1. **（可选）本地跑服务自检**  
   ```bash
   cd server
   npm install
   npm run dev
   ```
   浏览器验证前台 `/frontend`、后台 `/admin`、接口 `/api/health`。

2. **若有构建**（将来引入时）：  
   ```bash
   # 示例，以实际 package.json 为准
   npm run build
   ```
   失败则修改代码或配置，重复直到构建成功。

3. **提交并推送**  
   ```bash
   git status
   git add -A
   git commit -m "feat: 简述改动"
   git push origin main
   ```

---

## 4. 服务器部署（二选一）

### 方式 A：Git（推荐）

在服务器执行：

```bash
cd /home/ubuntu/apps/polymarket
git pull --rebase origin main
cd server
npm install
pm2 restart lockpro --update-env
```

### 方式 B：SCP（仅同步指定文件）

在 **本机** 执行（路径、用户、IP、密钥按你本地 `docs/config.md` 填写；**不要用 PowerShell 变量名 `$host`**，请使用例如 `$sshHost`）：

```powershell
$key = "C:\Users\你的用户名\.ssh\你的私钥"
$sshHost = "ubuntu@你的服务器IP"

scp -i $key -o IdentitiesOnly=yes "d:\mast\polymarket\server\src\app.js" "${sshHost}:/home/ubuntu/apps/polymarket/server/src/app.js"
# … 按需追加其它文件 …

ssh -i $key -o IdentitiesOnly=yes $sshHost "cd /home/ubuntu/apps/polymarket/server && pm2 restart lockpro --update-env"
```

仅当你**明确知道**本次改动涉及哪些路径时再使用 SCP；否则优先 Git，避免漏文件。

---

## 5. 部署后验收

```bash
# 服务器上
curl -s http://127.0.0.1:3000/api/health
pm2 logs lockpro --lines 80
```

浏览器打开站点，检查交易中心、管理后台、新增接口等。

---

## 6. 常见问题

| 现象 | 处理 |
|------|------|
| 构建失败 | 不要部署；本地修到构建通过 → 再 commit / push / 部署。 |
| 依赖报错 | 服务器 `server` 目录执行 `npm install` 后再 `pm2 restart`。 |
| 静态页仍是旧的 | 确认已推送且服务器已 pull，或 SCP 路径与 Nginx/Express 静态根目录一致。 |

---

## 7. 与运维大文档的关系

- **流程与顺序**：以本文为准。  
- **环境安装、回滚、备份、日志**：见 [server-deployment-guide.md](./server-deployment-guide.md)。
