# Play a notification sound for authorization request
[System.Media.SystemSounds]::Hand.Play()

# Send a toast notification
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] > $null
    
    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $xml.LoadXml($template.GetXml())
    
    $textNodes = $xml.GetElementsByTagName('text')
    $textNodes.Item(0).AppendChild($xml.CreateTextNode('Antigravity')) > $null
    $textNodes.Item(1).AppendChild($xml.CreateTextNode('Authorization Required: A command is waiting for your approval.')) > $null
    
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Google.Antigravity').Show($toast)
} catch {
    Write-Warning "Failed to send toast notification: $_"
}
