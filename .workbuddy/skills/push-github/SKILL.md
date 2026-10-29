---
name: push-github
description: 将本项目提交 commit 并 push 到 GitHub 仓库，使用已设置的 SSH 公钥
---

# 提交到 GitHub

将本项目提交 commit 并 push 到 https://github.com/llleee77/wanchaoran ，使用已设置公钥。

## 步骤

1. `git add -A` —— 暂存所有改动
2. `git commit -m "<用一句话描述本次改动>"` —— 提交
3. `git push origin main` —— 推送到 GitHub（远程仓库地址：`git@github.com:llleee77/wanchaoran.git`）

## 说明

- 身份认证使用本机 `~/.ssh/id_ed25519` SSH 公钥，已添加到 GitHub 账号 llleee77
- 分支固定为 `main`
- 如 push 被拒绝，先 `git pull --rebase origin main` 再重试
- push 成功后，页面通过 GitHub Pages 发布：仓库 Settings → Pages → Source 选 `Deploy from a branch` → 分支选 `main` / `/ (root)` → Save

## 检查

push 完成后访问 https://github.com/llleee77/wanchaoran 确认文件已更新。
