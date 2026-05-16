const { exec } = require('child_process');

/**
 * 修复反重力通知在系统设置中不显示的问题
 * 核心原理：使用固定的 AppUserModelID (AUMID) 发送通知
 * 这样 Windows 就会将通知关联到已注册的 AppID "Google.Antigravity"
 */
function sendFixedNotification(title, message) {
    // 这个 AUMID 是我刚才查到的系统注册 ID
    const appId = 'Google.Antigravity';
    
    // 使用 Windows 10/11 的新通知 API (Toast) 而不是旧的 BalloonTip
    // 这种方式更稳定，且能强制关联 AppID
    const psCommand = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null
        
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
        $xml.LoadXml($template.GetXml())
        
        $textNodes = $xml.GetElementsByTagName('text')
        $textNodes.Item(0).AppendChild($xml.CreateTextNode('${title}')) > $null
        $textNodes.Item(1).AppendChild($xml.CreateTextNode('${message}')) > $null
        
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${appId}').Show($toast)
    `;

    const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
    
    exec(`powershell -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, (error) => {
        if (error) {
            console.error('发送通知失败:', error);
        } else {
            console.log('修复通知已发送！请检查系统设置。');
        }
    });
}

sendFixedNotification('反重力 (Antigravity)', '核心通知系统已重连。现在你应该能在系统设置中找到我了！');
