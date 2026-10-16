param([string]$Source, [string]$Dest)
$exclude = @('node_modules', 'dist', '.git', '.superpowers', '.astro', 'graphify-out', 'BI')
robocopy $Source $Dest /MIR /XD $exclude /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with $LASTEXITCODE" }
$nm = Join-Path $Dest 'node_modules'
if (-not (Test-Path $nm)) {
  New-Item -ItemType Junction -Path $nm -Target (Join-Path 'C:\Users\User\Desktop\gynnitech\.claude\worktrees\analizza-corsi-structure-f4afab' 'node_modules') | Out-Null
}
Write-Output "mirror ok: $Dest"
