<#
PowerShell script: dump_reservation_salles_with_events.ps1
- Active temporairement event_scheduler si nécessaire
- Génère un dump SQL (sans commentaires) puis le compresse en .zip
- Copie l'archive vers un dossier cible si fourni
- Restaure l'état initial de event_scheduler
Usage example (PowerShell):
  .\dump_reservation_salles_with_events.ps1 -MySQLBin "C:\xampp\mysql\bin" -Port 3309 -OutDir "C:\backups" -CopyTo "\\server\share\backups"
#>
param(
  [string]
  $MySQLBin = "C:\\xampp\\mysql\\bin",

  [int]
  $Port = 3309,

  [string]
  $DB = "reservation_salles",

  [string]
  $OutDir = "C:\\xampp\\backups",

  [string]
  $CopyTo = "",

  [switch]
  $KeepEventScheduler,

  [switch]
  $KeepSQLFile
)

# Ensure output dir exists
if (-not (Test-Path -Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

# Paths to executables
$mysqldump = Join-Path $MySQLBin "mysqldump.exe"
$mysql = Join-Path $MySQLBin "mysql.exe"

if (-not (Test-Path $mysqldump)) {
  Write-Error "mysqldump.exe not found at $mysqldump. Adjust -MySQLBin parameter."
  exit 1
}
if (-not (Test-Path $mysql)) {
  Write-Error "mysql.exe not found at $mysql. Adjust -MySQLBin parameter."
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlFile = Join-Path $OutDir ("$($DB)_$timestamp.sql")
$zipFile = Join-Path $OutDir ("$($DB)_$timestamp.zip")

# Helper to run mysql command and capture single value
function Get-MySQLScalar([string]$query) {
  $cmd = & $mysql -u root -P $Port -N -s -e $query 2>&1
  return $cmd -join "`n"
}

# Get original event_scheduler value
try {
  $origVal = Get-MySQLScalar "SELECT @@global.event_scheduler;"
  if ($origVal -eq '') { $origVal = "0" }
  Write-Host "Original event_scheduler = $origVal"
} catch {
  Write-Warning "Impossible de lire event_scheduler: $_. Will proceed trying to set it on for dump."
  $origVal = "0"
}

$enabledTemp = $false

function Run-Mysqldump([string[]]$argList) {
  # Use Start-Process with temp files for reliable argument passing and capture
  $outFile = [System.IO.Path]::GetTempFileName()
  $errFile = [System.IO.Path]::GetTempFileName()
  try {
    # Ensure all args are strings and non-null
    $safeArgs = @()
    $i = 0
    foreach ($a in $argList) {
      Write-Host "ARG[$i] = '$a'"
      if ($null -ne $a -and $a -ne '') { $safeArgs += [string]$a }
      $i++
    }
    Write-Host "Safe args count: $($safeArgs.Count)"
    $proc = Start-Process -FilePath $mysqldump -ArgumentList $safeArgs -NoNewWindow -RedirectStandardOutput $outFile -RedirectStandardError $errFile -PassThru
    $proc.WaitForExit()
    $stdOut = Get-Content -Raw -Path $outFile -ErrorAction SilentlyContinue
    $stdErr = Get-Content -Raw -Path $errFile -ErrorAction SilentlyContinue
    return @{ ExitCode = $proc.ExitCode; StdOut = $stdOut; StdErr = $stdErr }
  } finally {
    if (Test-Path $outFile) { Remove-Item $outFile -ErrorAction SilentlyContinue }
    if (Test-Path $errFile) { Remove-Item $errFile -ErrorAction SilentlyContinue }
  }
}

# Try combinations in order to handle different mysqldump/mysql-server versions
$optionsList = @(
  @{ needEvent = $true; columnStats = $false },
  @{ needEvent = $false; columnStats = $false },
  @{ needEvent = $true; columnStats = $true },
  @{ needEvent = $false; columnStats = $true }
)

$dumpSuccess = $false
foreach ($opt in $optionsList) {
  $needEvent = $opt.needEvent
  $colStats = $opt.columnStats
  Write-Host "Trying mysqldump (events=$needEvent, columnStats=$colStats)"

  # Build args dynamically
  $baseArgs = @("-u", "root", "-P", "$Port", "--skip-comments", "--single-transaction", "--routines", "--triggers")
  if ($colStats) { $baseArgs = @("--column-statistics=0") + $baseArgs }
  if ($needEvent) { $baseArgs += "--events" }
  $baseArgs += $DB

  $eventWasEnabledByUs = $false
  if ($needEvent -and ($origVal -ne 'ON' -and $origVal -ne '1')) {
    try {
      Write-Host "Enabling event_scheduler temporarily for this attempt..."
      & $mysql -u root -P $Port -e "SET GLOBAL event_scheduler=ON;" 2>&1 | Out-Null
      $eventWasEnabledByUs = $true
      Start-Sleep -Seconds 1
    } catch {
      Write-Warning "Failed to enable event_scheduler: $_"
    }
  }

  $result = Run-Mysqldump -argList $baseArgs
  if ($result.ExitCode -eq 0) {
    [System.IO.File]::WriteAllText($sqlFile, $result.StdOut, [System.Text.Encoding]::UTF8)
    Write-Host "Dump created: $sqlFile"
    $dumpSuccess = $true
    if ($eventWasEnabledByUs) { $enabledTemp = $true }
    break
  } else {
    Write-Warning "mysqldump exit code $($result.ExitCode). stderr: $($result.StdErr)"
  }

  if ($eventWasEnabledByUs) {
    try { & $mysql -u root -P $Port -e "SET GLOBAL event_scheduler=OFF;" | Out-Null } catch { }
  }
}

if (-not $dumpSuccess) {
  Write-Error "All mysqldump attempts failed. See previous warnings."
  if ($enabledTemp -and -not $KeepEventScheduler) {
    try { & $mysql -u root -P $Port -e "SET GLOBAL event_scheduler=OFF;" | Out-Null } catch {}
  }
  exit 2
}

# Compress into zip
try {
  if (Test-Path $zipFile) { Remove-Item -Path $zipFile -Force }
  Write-Host "Compressing $sqlFile -> $zipFile"
  Compress-Archive -Path $sqlFile -DestinationPath $zipFile -Force
  Write-Host "Compressed: $zipFile"
  if (-not $KeepSQLFile) { Remove-Item -Path $sqlFile -Force }
} catch {
  Write-Warning "Compression failed: $_"
}

# Copy to destination if provided
if ($CopyTo -and $CopyTo -ne "") {
  try {
    if (-not (Test-Path -Path $CopyTo)) { New-Item -ItemType Directory -Path $CopyTo -Force | Out-Null }
    $dest = Join-Path $CopyTo (Split-Path -Leaf $zipFile)
    Copy-Item -Path $zipFile -Destination $dest -Force
    Write-Host "Copied archive to $dest"
  } catch {
    Write-Warning "Copy failed: $_"
  }
}

# Restore event_scheduler to original if we changed it and user did not request to keep it
if ($enabledTemp -and -not $KeepEventScheduler) {
  try {
    Write-Host "Restoring event_scheduler to OFF"
    & $mysql -u root -P $Port -e "SET GLOBAL event_scheduler=OFF;" | Out-Null
  } catch {
    Write-Warning "Failed to restore event_scheduler: $_"
  }
}

Write-Host "Done. Archive: $zipFile"
exit 0
