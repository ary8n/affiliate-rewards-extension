Param(
  [string]$Letter = 'A'
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$colors = @{ 16 = '#FFB347'; 48 = '#FF9F1C'; 128 = '#FF8C00' }
$fontName = 'Arial'

foreach ($size in $colors.Keys) {
  $bmp = New-Object System.Drawing.Bitmap($size,$size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $bg = [System.Drawing.ColorTranslator]::FromHtml($colors[$size])
  $g.Clear($bg)
  $fontSize = [int]($size * 0.55)
  $font = New-Object System.Drawing.Font($fontName,$fontSize,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = 'Center'
  $format.LineAlignment = 'Center'
  $brush = [System.Drawing.Brushes]::Black
  $g.DrawString($Letter,$font,$brush,([System.Drawing.RectangleF]::new(0,0,$size,$size)),$format)
  $outPath = Join-Path $root "icons/icon$size.png"
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $font.Dispose()
  Write-Host "Generated $outPath" -ForegroundColor Green
}
