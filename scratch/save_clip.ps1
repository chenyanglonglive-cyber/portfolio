Add-Type -AssemblyName System.Windows.Forms, System.Drawing

if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
    $img = [System.Windows.Forms.Clipboard]::GetImage()
    $outputPath = Join-Path $PSScriptRoot "clipboard.png"
    $img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Image saved to: $outputPath"
} elseif ([System.Windows.Forms.Clipboard]::ContainsText()) {
    $text = [System.Windows.Forms.Clipboard]::GetText()
    Write-Output "Clipboard Text:"
    Write-Output $text
} else {
    Write-Output "Clipboard does not contain image or text."
}
