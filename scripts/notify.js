const { exec } = require('child_process');

/**
 * 发送 Windows 桌面通知的工具函数
 * 这个函数通过 PowerShell 调用系统原生 API，不需要安装额外的 npm 包。
 */
function sendNotification(title, message) {
    const psCommand = `
        Add-Type -AssemblyName System.Windows.Forms
        $notify = New-Object System.Windows.Forms.NotifyIcon
        $notify.Icon = [System.Drawing.SystemIcons]::Information
        $notify.Visible = $true
        $notify.ShowBalloonTip(3000, '${title}', '${message}', 'Info')
    `;

    // 使用 base64 编码来避免特殊字符和编码问题
    const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
    
    exec(`powershell -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, (error) => {
        if (error) {
            console.error('发送通知失败:', error);
        } else {
            console.log('通知已发送！请检查任务栏或通知中心。');
        }
    });
}

// 首次运行：激活应用在系统设置中的存在
sendNotification('反重力 (Antigravity)', '通知功能已成功初始化！您现在可以在系统设置中管理我的通知了。');
