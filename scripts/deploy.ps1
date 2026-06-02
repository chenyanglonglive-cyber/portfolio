# Build, pack, upload, unpack and restart Strapi on ECS

$ErrorActionPreference = "Stop"

# Paths
$rootDir = Resolve-Path "$PSScriptRoot/.."
$backendDir = "$rootDir/backend"
$keyPath = "$rootDir/agent.pem"
$server = "root@47.95.242.40"
$remotePath = "/var/www/strapi"

Write-Host "=== 1. 开始本地构建 Strapi ===" -ForegroundColor Cyan
Set-Location $backendDir
npm run build

Write-Host "=== 2. 打包构建产物 (dist 和 src) ===" -ForegroundColor Cyan
# 使用 tar 压缩 dist 和 src 文件夹
if (Test-Path "backend.tar.gz") {
    Remove-Item "backend.tar.gz"
}
tar -czf backend.tar.gz dist src

Write-Host "=== 3. 上传压缩包到 ECS ===" -ForegroundColor Cyan
scp -i $keyPath backend.tar.gz "$server:$remotePath/"

Write-Host "=== 4. 在 ECS 解压并重启 PM2 ===" -ForegroundColor Cyan
ssh -i $keyPath $server "tar -xzf $remotePath/backend.tar.gz -C $remotePath/ && rm $remotePath/backend.tar.gz && pm2 restart strapi"

# 清理本地的压缩包
Remove-Item "backend.tar.gz"

# 播放任务完成提示音
if (Test-Path "$rootDir/scripts/task_complete.ps1") {
    powershell -File "$rootDir/scripts/task_complete.ps1"
}

Write-Host "=== 部署成功！ ===" -ForegroundColor Green
