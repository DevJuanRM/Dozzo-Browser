$desktop = [Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $desktop "Dozzo Browser.lnk"
$sc = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath = "c:\Users\jrobl\.gemini\antigravity-ide\scratch\brave-browser\node_modules\electron\dist\electron.exe"
$sc.Arguments = "c:\Users\jrobl\.gemini\antigravity-ide\scratch\brave-browser"
$sc.WorkingDirectory = "c:\Users\jrobl\.gemini\antigravity-ide\scratch\brave-browser"
$sc.WindowStyle = 1
$sc.Description = "Dozzo Browser - Navegador Privado y Rapido"
$sc.Save()

if (Test-Path "C:\Users\jrobl\Desktop") {
  Copy-Item $shortcutPath "C:\Users\jrobl\Desktop\Dozzo Browser.lnk" -Force
}

Write-Host "Acceso directo actualizado con éxito en: $shortcutPath"
