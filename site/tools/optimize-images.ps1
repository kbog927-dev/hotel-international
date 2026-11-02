# Redimensionne, étalonne et compresse les photos sources pour le web.
# Usage : powershell -ExecutionPolicy Bypass -File site\tools\optimize-images.ps1
# Les originaux (dossier racine du projet) ne sont jamais modifiés.
#
# Étalonnage appliqué à chaque photo (retouche légère, sans changer le contenu) :
#  - niveaux automatiques : étire l'histogramme entre les 0,5 % les plus sombres
#    et les 0,5 % les plus clairs (photos ternes ou voilées)
#  - saturation +12 %, légère chaleur (ambiance tropicale de fin de journée)

Add-Type -AssemblyName System.Drawing

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$out  = Join-Path $PSScriptRoot '..\assets\img'
New-Item -ItemType Directory -Force $out | Out-Null

# source -> nom web
$map = [ordered]@{
  'piscine hotel international.jpg'   = 'piscine'
  'hotelinternational232.jpg'         = 'facade'
  'hotelinternational.jpg'            = 'cour-paillotes'
  'imageaccueil.jpg'                  = 'terrasse-restaurant'
  'piscine12.jpg'                     = 'espace-billard'
  'chambre hotel international.jpg'   = 'chambre-a'
  'chi2.jpg'                          = 'chambre-b'
  'hotelin2.jpg'                      = 'salon-suite'
  'img123.jpg'                        = 'salon-decor-romantique'
  'chambre love.jpg'                  = 'chambre-decor-romantique'
  'amourchambre.jpg'                  = 'linge-coeurs'
  'salle reception.jpg'               = 'salle-conference'
  'salle recep13.jpg'                 = 'salle-banquet'
}
$widths = 800, 1600
$quality = 84
$saturation = 1.12
$maxStretch = 1.3

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)

# Points noir et blanc de l'image (percentiles de luminance sur une miniature).
function Get-Levels($img) {
  $tw = 160; $th = [int][Math]::Max(1, [Math]::Round($img.Height * $tw / $img.Width))
  $thumb = New-Object System.Drawing.Bitmap $img, $tw, $th
  $hist = New-Object int[] 256
  for ($y = 0; $y -lt $th; $y++) { for ($x = 0; $x -lt $tw; $x++) {
    $c = $thumb.GetPixel($x, $y)
    $hist[[int](0.2126 * $c.R + 0.7152 * $c.G + 0.0722 * $c.B)]++
  } }
  $thumb.Dispose()
  $total = $tw * $th; $acc = 0; $lo = 0; $hi = 255
  for ($i = 0; $i -lt 256; $i++) { $acc += $hist[$i]; if ($acc -ge $total * 0.005) { $lo = $i; break } }
  $acc = 0
  for ($i = 255; $i -ge 0; $i--) { $acc += $hist[$i]; if ($acc -ge $total * 0.005) { $hi = $i; break } }
  return @($lo, $hi)
}

function New-Grade($lo, $hi) {
  $k = [Math]::Min($maxStretch, 255.0 / [Math]::Max(1, $hi - $lo))
  $o = -($lo / 255.0) * $k
  $s = $saturation
  $wr = 0.3086 * (1 - $s); $wg = 0.6094 * (1 - $s); $wb = 0.0820 * (1 - $s)
  $m = New-Object System.Drawing.Imaging.ColorMatrix
  $m.Matrix00 = ($wr + $s) * $k; $m.Matrix01 = $wr * $k;        $m.Matrix02 = $wr * $k
  $m.Matrix10 = $wg * $k;        $m.Matrix11 = ($wg + $s) * $k; $m.Matrix12 = $wg * $k
  $m.Matrix20 = $wb * $k;        $m.Matrix21 = $wb * $k;        $m.Matrix22 = ($wb + $s) * $k
  $m.Matrix33 = 1
  $m.Matrix40 = $o + 0.018; $m.Matrix41 = $o + 0.006; $m.Matrix42 = $o - 0.012; $m.Matrix44 = 1
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetColorMatrix($m)
  return $attr
}

function Save-Resized($img, [int]$w, [int]$h, $path, $isPng, $attr) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  if ($attr) { $g.DrawImage($img, $rect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr) }
  else { $g.DrawImage($img, $rect) }
  if ($isPng) { $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png) }
  else { $bmp.Save($path, $codec, $params) }
  $g.Dispose(); $bmp.Dispose()
}

foreach ($src in $map.Keys) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $root $src))
  $lv = Get-Levels $img
  $attr = New-Grade $lv[0] $lv[1]
  foreach ($w in $widths) {
    $tw = [Math]::Min($w, $img.Width)
    $th = [int][Math]::Round($img.Height * $tw / $img.Width)
    Save-Resized $img $tw $th (Join-Path $out ("{0}-{1}.jpg" -f $map[$src], $w)) $false $attr
  }
  Write-Output ("{0} ({1}x{2}) niveaux {3}-{4}" -f $map[$src], $img.Width, $img.Height, $lv[0], $lv[1])
  $attr.Dispose(); $img.Dispose()
}

& (Join-Path $PSScriptRoot 'logo-transparent.ps1')
