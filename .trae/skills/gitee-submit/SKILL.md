---
name: gitee-submit
description: 将当前项目通过 git commit 并 push 到 gitee 仓库 wan-chaoran/web-design 使用私人令牌认证。当用户要求提交项目、推送到 gitee、上传代码到远程仓库、提交变更时使用。不用于创建新仓库或调用 gitee openapi。
---

# Gitee 提交

把当前工作区的改动提交并推送到 Gitee 仓库 `wan-chaoran/web-design`。运行脚本前先告知用户将要执行 push。

## 配置（可修改）

以下常量集中在此处，改动时保持同步：

- 远程名：`origin`
- 用户名：`wan-chaoran`
- 私人令牌：`82c80a3e20926deda9a3ae27bac189db`
- 仓库 HTTPS 地址（不含令牌）：`https://gitee.com/wan-chaoran/web-design.git`
- 默认分支：`master`

## 执行

运行 `scripts/push-project.ps1`，可传可选提交信息：

```powershell
powershell -ExecutionPolicy Bypass -File .trae/skills/gitee-submit/scripts/push-project.ps1 -message "更新主页"
```

不传 `-message` 时默认使用 `update`。

脚本行为：检查 git 仓库与分支名、`git add .`、仅在有改动时 `git commit`、设置带令牌的远程地址、`git push -u origin master`。变量统一使用 `wcr_` 前缀。

## 一次性初始化（若本地尚未关联远程）

以下两步只需执行一次，之后由脚本自动处理：

```powershell
git remote add origin https://wan-chaoran:82c80a3e20926deda9a3ae27bac189db@gitee.com/wan-chaoran/web-design.git
git push -u origin master
```

## 出现错误时的处理

- `remote: error` 或 `Access denied`：令牌失效或仓库无权限，停止并请用户到 Gitee 设置重新生成私人令牌。
- `Authentication failed`：检查远程地址是否带令牌前缀 `https://用户:令牌@`。
- Push 被拒（`[rejected]` / `non-fast-forward`）：先 `git pull --rebase origin master` 再重新 push，不要强制推送。
- `git commit` 提示无改动：正常情况，告知用户"没有需要提交的更改"，不要创建空提交。

## 安全约束

- 令牌写入远程地址后会被 git 记录，属于敏感信息；不要将本项目 `.trae/skills/` 或其输出推送到任何公开仓库。
- 提交前检查 `git status`，避免误提交 `.env`、密钥文件或 `cdn` 下的第三方产物之外的无关内容。
- 不执行 `git push --force`、不修改 git 全局配置。