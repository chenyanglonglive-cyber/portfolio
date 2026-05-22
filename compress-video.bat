@echo off
chcp 65001 >nul
title 本地视频一键压缩工具 (H.264 Web 优化)

echo ===================================================
echo           本地视频一键压缩工具
echo ===================================================
echo.

:: 检查是否拖入了文件
if "%~1"=="" (
    echo [提示] 请将要压缩的视频文件拖拽到此 .bat 图标上进行压缩。
    echo.
    pause
    exit /b
)

:: 检查系统是否安装了 FFmpeg
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未在系统 PATH 中检测到 ffmpeg 命令。
    echo 请先安装 FFmpeg 并将其添加到系统环境变量中。
    echo 下载地址: https://ffmpeg.org/download.html
    echo.
    pause
    exit /b
)

set "INPUT_FILE=%~1"
set "OUTPUT_FILE=%~dpn1_compressed.mp4"

echo [文件输入]: %INPUT_FILE%
echo [文件输出]: %OUTPUT_FILE%
echo.
echo 正在压缩中，请稍候...
echo ---------------------------------------------------

:: 执行 FFmpeg 压缩 (采用 H.264 / AAC 编码，加入 +faststart 优化网页秒开)
ffmpeg -i "%INPUT_FILE%" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "%OUTPUT_FILE%" -y

if %errorlevel% equ 0 (
    echo ---------------------------------------------------
    echo.
    echo [成功] 视频压缩完成！
    echo.
    echo ================= 压缩前后文件大小对比 =================
    
    :: 获取压缩前文件大小
    for %%A in ("%INPUT_FILE%") do set "SIZE_BEFORE=%%~zA"
    :: 获取压缩后文件大小
    for %%B in ("%OUTPUT_FILE%") do set "SIZE_AFTER=%%~zA"
    
    :: 转换为 MB 显示 (KB -> MB)
    set /a SIZE_BEFORE_MB=SIZE_BEFORE/1024/1024
    set /a SIZE_AFTER_MB=SIZE_AFTER/1024/1024
    
    echo 压缩前: !SIZE_BEFORE_MB! MB
    echo 压缩后: !SIZE_AFTER_MB! MB
    echo.
    echo [提示] 压缩后的视频已保存在原视频同目录下，后缀为 _compressed.mp4
    echo 现在您可以直接上传到 Strapi 媒体库了。
) else (
    echo.
    echo [失败] 视频压缩过程中出错，请检查视频格式或 FFmpeg 配置。
)

echo.
pause
