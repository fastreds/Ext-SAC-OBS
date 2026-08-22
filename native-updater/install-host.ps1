<#
.SYNOPSIS
    Instala el host de Native Messaging para la actualizacion automatica (Windows).
.DESCRIPTION
    Registra com.fastreds.extsacobs en el registro del usuario (HKCU) y escribe el
    manifest del host apuntando al script host.ps1 ubicado en esta misma carpeta.
.PARAMETER ExtensionId
    ID de la extension (se muestra en el popup: "Tu ID de extension").
.EXAMPLE
    .\install-host.ps1 -ExtensionId "abcdefghijklmnopqrstuvwxyz012345"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ExtensionId
)

$hostName = "com.fastreds.extsacobs"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$hostScript = Join-Path $scriptDir "host.ps1"
$manifestDestDir = Join-Path $env:LOCALAPPDATA "ExtSacObsUpdater"
$manifestDest = Join-Path $manifestDestDir "$hostName.json"

if (-not (Test-Path $hostScript)) {
    Write-Error "No se encontro host.ps1 en $scriptDir"
    exit 1
}

if ($ExtensionId -notmatch '^[a-p]{32}$') {
    Write-Warning "El ID de extension parece invalido (debe tener 32 caracteres). Continuando de todos modos."
}

# Plantilla del manifest
$template = Join-Path $scriptDir "$hostName.template.json"
$json = Get-Content $template -Raw
$json = $json -replace 'HOST_SCRIPT_PATH', $hostScript.Replace('\', '\\')
$json = $json -replace 'EXTENSION_ID', $ExtensionId

New-Item -ItemType Directory -Force -Path $manifestDestDir | Out-Null
Set-Content -Path $manifestDest -Value $json -Encoding UTF8

# Registrar en HKCU (no requiere permisos de administrador)
$regPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName"
New-Item -Path $regPath -Force | Out-Null
New-ItemProperty -Path $regPath -Name "(Default)" -Value $manifestDest -PropertyType String -Force | Out-Null

Write-Host ""
Write-Host "Host de actualizacion instalado correctamente." -ForegroundColor Green
Write-Host "  Manifest : $manifestDest"
Write-Host "  Registro : $regPath"
Write-Host ""
Write-Host "Ahora la extension puede actualizarse con un clic desde el popup."
