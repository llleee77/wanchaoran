﻿# push-project.ps1
# 提交并把当前项目推送到 Gitee 仓库 wan-chaoran/web-design（私人令牌认证）
# 用法: powershell -ExecutionPolicy Bypass -File push-project.ps1 [-message "提交信息"]

param(
    [string]$message = "update"
)

$ErrorActionPreference = "Stop"

# ---- 配置（与 SKILL.md 保持一致）----
$wcr_remote = "origin"
$wcr_user   = "wan-chaoran"
$wcr_token  = "82c80a3e20926deda9a3ae27bac189db"
$wcr_repo   = "https://gitee.com/wan-chaoran/web-design.git"
$wcr_branch = "master"

# ---- 检查 git 仓库 ----
git rev-parse --is-inside-work-tree 2>$null | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "当前目录不是 git 仓库，跳过提交。" -ForegroundColor Yellow
    exit 0
}

# ---- 暂存 ----
git add -A
Write-Host "已暂存所有改动。" -ForegroundColor Green

# ---- 提交 ----
git diff --cached --quiet
$wcr_hasChanges = $LASTEXITCODE -ne 0

if ($wcr_hasChanges) {
    git commit -m $message
    Write-Host "已提交：$message" -ForegroundColor Green
} else {
    Write-Host "没有需要提交的更改。" -ForegroundColor Yellow
}

# ---- 设置带令牌的远程地址 ----
$wcr_authUrl = "https://" + $wcr_user + ":" + $wcr_token + "@gitee.com/wan-chaoran/web-design.git"

git remote remove $wcr_remote 2>$null
git remote add $wcr_remote $wcr_authUrl
Write-Host "远程地址已配置。" -ForegroundColor Green

# ---- 推送 ----
git push -u $wcr_remote $wcr_branch
Write-Host "已推送到 gitee.com/wan-chaoran/web-design" -ForegroundColor Green