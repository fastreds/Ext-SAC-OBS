<#
.SYNOPSIS
    Host de Native Messaging para la actualizacion automatica de Ext Gestion SAC-UCR (Windows).
.DESCRIPTION
    Recibe un mensaje JSON por stdin (prefijo de 4 bytes con la longitud),
    descarga el ZIP mas reciente desde GitHub, lo extrae y reemplaza los
    archivos de la extension en la ruta indicada. Reporta el progreso por stdout.
#>

$ErrorActionPreference = 'Stop'

function Send-NativeMessage {
    param($obj)
    $json = [System.Text.Encoding]::UTF8.GetBytes((ConvertTo-Json $obj -Compress))
    $stdout = [System.Console]::OpenStandardOutput()
    $bytes = [System.BitConverter]::GetBytes([uint32]$json.Length)
    $stdout.Write($bytes, 0, 4)
    $stdout.Write($json, 0, $json.Length)
    $stdout.Flush()
}

try {
    # Leer prefijo de longitud (4 bytes) desde stdin
    $stdin = [System.Console]::OpenStandardInput()
    $lenBytes = New-Object byte[] 4
    $read = 0
    while ($read -lt 4) { $read += $stdin.Read($lenBytes, $read, 4 - $read) }
    $len = [System.BitConverter]::ToUInt32($lenBytes, 0)

    $msgBytes = New-Object byte[] $len
    $read = 0
    while ($read -lt $len) { $read += $stdin.Read($msgBytes, $read, $len - $read) }
    $msg = [System.Text.Encoding]::UTF8.GetString($msgBytes) | ConvertFrom-Json

    $installPath = $msg.path
    $zipUrl = if ($msg.url) { $msg.url } else { "https://github.com/fastreds/Ext-SAC-OBS/archive/refs/heads/main.zip" }

    if (-not $installPath -or -not (Test-Path $installPath)) {
        Send-NativeMessage @{ status = 'error'; message = "Ruta de instalacion no valida: $installPath" }
        exit 1
    }

    Send-NativeMessage @{ status = 'progress'; step = 'download'; message = 'Descargando actualizacion...' }

    $tmp = Join-Path $env:TEMP ("extsacobs_" + [guid]::NewGuid().ToString("N"))
    $zip = Join-Path $tmp "update.zip"
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
    Invoke-WebRequest -Uri $zipUrl -OutFile $zip -UseBasicParsing

    Send-NativeMessage @{ status = 'progress'; step = 'extract'; message = 'Extrayendo archivos...' }
    $extract = Join-Path $tmp "extracted"
    New-Item -ItemType Directory -Force -Path $extract | Out-Null
    Expand-Archive -Path $zip -DestinationPath $extract -Force

    # El ZIP de GitHub envuelve el contenido en una carpeta superior (Ext-SAC-OBS-main)
    $inner = Get-ChildItem $extract | Select-Object -First 1
    $source = $inner.FullName

    Send-NativeMessage @{ status = 'progress'; step = 'copy'; message = 'Reemplazando archivos...' }
    Get-ChildItem $source -Force | ForEach-Object {
        $dest = Join-Path $installPath $_.Name
        if ($_.PSIsContainer) {
            Copy-Item $_.FullName $dest -Recurse -Force
        } else {
            Copy-Item $_.FullName $dest -Force
        }
    }

    Send-NativeMessage @{ status = 'done'; message = 'Actualizacion completada.' }

    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}
catch {
    Send-NativeMessage @{ status = 'error'; message = $_.Exception.Message }
    exit 1
}
