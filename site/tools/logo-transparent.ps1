# Détoure le logo : le fond blanc devient transparent, contours lissés conservés.
# Usage : powershell -ExecutionPolicy Bypass -File site\tools\logo-transparent.ps1
# Méthode : l'opacité de chaque pixel est déduite de sa distance au blanc
# (canal le plus faible), puis la couleur est « dé-mélangée » du blanc.
# Le fichier original n'est jamais modifié.

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class Unwhite {
  public static Bitmap Run(Bitmap src) {
    var dst = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
    for (int y = 0; y < src.Height; y++) {
      for (int x = 0; x < src.Width; x++) {
        Color c = src.GetPixel(x, y);
        double a = (1.0 - Math.Min(c.R, Math.Min(c.G, c.B)) / 255.0) * (c.A / 255.0);
        if (a < 0.03) { dst.SetPixel(x, y, Color.Transparent); continue; }
        Func<int, int> un = v => (int)Math.Max(0, Math.Min(255, Math.Round((v - (1 - a) * 255) / a)));
        dst.SetPixel(x, y, Color.FromArgb((int)Math.Round(a * 255), un(c.R), un(c.G), un(c.B)));
      }
    }
    return dst;
  }
}
'@

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$out  = Join-Path $PSScriptRoot '..\assets\img'

$src = New-Object System.Drawing.Bitmap (Join-Path $root 'logoofficielHOTELINTERNATIONAL.png')
$clear = [Unwhite]::Run($src)
$src.Dispose()

foreach ($size in 192, 512) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($clear, 0, 0, $size, $size)
  $bmp.Save((Join-Path $out "logo-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
$clear.Dispose()
Write-Output 'logo détouré (logo-192.png, logo-512.png)'
