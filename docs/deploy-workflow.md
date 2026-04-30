# LockPro 发布与部署流程（日常）

本文描述**从改代码到上线**的推荐顺序。**当前约定：服务器不使用 `git pull`，上线仅通过 SCP（或等价的全量上传）同步文件。** 服务器目录、PM2、健康检查等细节见 [server-deployment-guide.md](./server-deployment-guide.md)。敏感信息（SSH 主机、密钥路径）只写在本地 `docs/config.md`，**不要**写进仓库。

---

## 1. 总体顺序（牢记）

```
本地修改代码
    ↓
（若项目有构建步骤）在本地执行构建
    ↓
构建失败 → 先修构建/代码，再重新构建，直到通过
    ↓
git commit + git push（归档与协作；与 SCP 部署互相独立）
    ↓
用 SCP 将变更文件上传到服务器对应路径
    ↓
（若 package.json / 锁文件有变）SSH 登录后在 server 目录 npm install
    ↓
pm2 restart lockpro --update-env
    ↓
验收（健康检查、关键页面）
```

**原则：**  
1. 有构建时：**构建绿 → 再 commit/push → 再 SCP**。  
2. 不要把未进 Git 或未通过构建的产物当作唯一备份；**本地仓库应先提交再上传**，便于追溯与回滚。

---

## 2. 当前仓库的构建说明

| 部分 | 说明 |
|------|------|
| `frontend/`、`admin/` | 静态 HTML / CSS / JS，由 Express 静态托管，**当前无 `npm run build`**。改动后直接 SCP 对应文件即可。 |
| `server/` | Node 直接运行 `src/app.js`，**无打包构建**。依赖变更后须在服务器 `server` 目录执行 `npm install`。 |

若日后增加前端打包（如 Vite），在本节补充：**本地构建命令**、**产物目录**，以及 SCP 目标是「dist 产物」还是源码。

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

3. **提交并推送（强烈建议每次上线前执行）**  
   ```bash
   git status
   git add -A
   git commit -m "feat: 简述改动"
   git push origin main
   ```

---

## 4. 服务器部署（仅 SCP）

在 **本机** 执行上传（路径、用户、IP、密钥以本地 `docs/config.md` 为准）。

**PowerShell：** 禁止使用变量名 **`$host`**（与内置变量冲突），请使用例如 **`$sshHost`**。

### 4.1 单次改动常用文件示例

按本次实际改动增减 `scp` 行；远端根目录一般为 `/home/ubuntu/apps/polymarket`。

```powershell
$key = "C:\Users\你的用户名\.ssh\你的私钥"
$sshHost = "ubuntu@你的服务器IP"
$base = "d:\mast\polymarket"

scp -i $key -o IdentitiesOnly=yes "$base\server\src\app.js" "${sshHost}:/home/ubuntu/apps/polymarket/server/src/app.js"
scp -i $key -o IdentitiesOnly=yes "$base\server\src\db.js" "${sshHost}:/home/ubuntu/apps/polymarket/server/src/db.js"
scp -i $key -o IdentitiesOnly=yes "$base\frontend\index.html" "${sshHost}:/home/ubuntu/apps/polymarket/frontend/index.html"
scp -i $key -o IdentitiesOnly=yes "$base\frontend\app.js" "${sshHost}:/home/ubuntu/apps/polymarket/frontend/app.js"
scp -i $key -o IdentitiesOnly=yes "$base\frontend\styles.css" "${sshHost}:/home/ubuntu/apps/polymarket/frontend/styles.css"
scp -i $key -o IdentitiesOnly=yes "$base\admin\index.html" "${sshHost}:/home/ubuntu/apps/polymarket/admin/index.html"
scp -i $key -o IdentitiesOnly=yes "$base\admin\app.js" "${sshHost}:/home/ubuntu/apps/polymarket/admin/app.js"

ssh -i $key -o IdentitiesOnly=yes $sshHost "cd /home/ubuntu/apps/polymarket/server && pm2 restart lockpro --update-env"
```

### 4.2 避免漏文件

- 改动涉及多个目录时，对照 `git status` 或 `git diff --name-only`，逐条 SCP。  
- 修改了 **`server/package.json`** 或 **`package-lock.json`** 时：除上传这两个文件外，务必 SSH 到服务器执行 **`cd .../server && npm install`**，再重启 PM2。

### 4.3 大范围变更

若本次触及文件很多，可在本机从干净仓库打包后上传解压（仍属「文件拷贝」思路），或分批 SCP；**不要假设服务器能执行 `git pull`**。

---

## 5. 部署后验收

```bash
# SSH 登录服务器后
curl -s http://127.0.0.1:3000/api/health
pm2 logs lockpro --lines 80
```

浏览器打开站点，检查交易中心、管理后台、相关接口等。

---

## 6. 常见问题

| 现象 | 处理 |
|------|------|
| 构建失败 | 不要部署；本地修到构建通过 → 再 commit/push → 再 SCP。 |
| 依赖报错 | 服务器 `server` 目录执行 `npm install` 后再 `pm2 restart`。 |
| 静态页仍是旧的 | 核对 SCP 目标路径是否与线上静态目录一致；确认已覆盖文件且无 CDN/浏览器强缓存干扰。 |

---

## 7. 与运维大文档的关系

- **流程与顺序**：以本文为准。  
- **环境安装、备份、日志、Nginx**：见 [server-deployment-guide.md](./server-deployment-guide.md)。  
- **回滚**：服务器无 Git 时，在**本地** checkout 到稳定提交后，将对应文件再次 **SCP 覆盖** 并重启 PM2（详见运维文档 §6）。
