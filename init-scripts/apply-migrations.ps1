<#
apply-migrations.ps1
Script PowerShell pour appliquer les migrations SQL dans `init-scripts` sur une instance MySQL (XAMPP).
Usage exemple (PowerShell):
  .\apply-migrations.ps1 -MysqlPath 'C:\xampp\mysql\bin\mysql.exe' -User root -SqlFile '.\\001-add-department-to-reservations.sql'

Le script vous demandera le mot de passe MySQL si nécessaire.
#>
param(
  [string]$MysqlPath = "C:\xampp\mysql\bin\mysql.exe",
  [string]$User = "root",
  [string]$Password,
  [int]$Port = 3306,
  [string]$SqlFile = "001-add-department-to-reservations.sql",
  [string]$Database = "reservation_salles"
)

function Abort([string]$msg) {
  Write-Error $msg
  exit 1
}

# Résoudre les chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$fullSqlPath = Join-Path $scriptDir $SqlFile

if (-not (Test-Path $MysqlPath)) {
  Abort "Impossible de trouver mysql.exe à '$MysqlPath'. Vérifiez le chemin vers votre installation XAMPP (ex: C:\xampp\mysql\bin\mysql.exe)."
}

if (-not (Test-Path $fullSqlPath)) {
  Abort "Fichier SQL introuvable : $fullSqlPath"
}

if (-not $Password) {
  $secure = Read-Host -AsSecureString "Mot de passe MySQL pour l'utilisateur '$User' (laissez vide pour aucun mot de passe)"
  if ($secure.Length -gt 0) {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR) | Out-Null
  } else {
    $Password = ""
  }
}

Write-Host "Application de la migration : $fullSqlPath -> base $Database"
Write-Host "Exécution : $MysqlPath (port $Port)"

# Préparer les arguments pour Start-Process
$argsList = @()
$argsList += "-u"
$argsList += $User
if ($Password -ne "") {
  # mysql accepte -pPASSWORD (sans espace)
  $argsList += "-p$Password"
}
$argsList += "--port"
$argsList += [string]$Port
$argsList += $Database

# Utiliser Start-Process avec redirection d'entrée pour fournir le fichier SQL
try {
  $proc = Start-Process -FilePath $MysqlPath -ArgumentList $argsList -RedirectStandardInput $fullSqlPath -NoNewWindow -Wait -PassThru
} catch {
  Write-Error "❌ Échec de l'exécution de mysql.exe : $($_.Exception.Message)"
  Exit 1
}

if ($proc.ExitCode -eq 0) {
  Write-Host "✅ Migration appliquée avec succès." -ForegroundColor Green
} else {
  Write-Error "❌ Erreur lors de l'exécution de mysql.exe (code de sortie $($proc.ExitCode))."
  Exit $proc.ExitCode
}
