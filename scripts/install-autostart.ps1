# Legt eine Autostart-Verknüpfung für die Kiosk-Slideshow an (Windows, aktueller Benutzer).
# Aufruf (PowerShell):
#   .\install-autostart.ps1 -Exe "C:\Kiosk\Kiosk Slideshow.exe" -Config "D:\kiosk\config.json"
# Entfernen: Verknüpfung "Kiosk Slideshow.lnk" aus shell:startup löschen.
param(
  [Parameter(Mandatory = $true)][string]$Exe,
  [Parameter(Mandatory = $true)][string]$Config
)
if (-not (Test-Path $Exe)) { throw "Exe nicht gefunden: $Exe" }
$startup = [Environment]::GetFolderPath("Startup")
$lnk = Join-Path $startup "Kiosk Slideshow.lnk"
$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut($lnk)
$sc.TargetPath = (Resolve-Path $Exe).Path
$sc.Arguments = "--config `"$Config`""
$sc.WorkingDirectory = Split-Path (Resolve-Path $Exe).Path
$sc.Save()
Write-Host "Autostart angelegt: $lnk"
