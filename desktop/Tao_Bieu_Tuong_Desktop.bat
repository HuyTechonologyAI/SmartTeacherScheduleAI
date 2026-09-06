@echo off
chcp 65001 >nul
title Cai Dat Bieu Tuong Smart Teacher Schedule AI Len Desktop

echo ========================================================
echo   SMART TEACHER SCHEDULE AI - CAI DAT BIEU TUONG DESKTOP
echo ========================================================
echo.
echo Dang tao bieu tuong phan mem voi Logo chinh thuc ra Man hinh chinh (Desktop)...

powershell -ExecutionPolicy Bypass -Command "^
$WshShell = New-Object -ComObject WScript.Shell; ^
$Desktop = $WshShell.SpecialFolders('Desktop'); ^
$Shortcut = $WshShell.CreateShortcut("$Desktop\Smart Teacher Schedule AI.lnk"); ^
$CurDir = (Get-Item .).FullName; ^
$Ico = "$CurDir\icon.ico"; ^
$Edge = "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"; ^
if (-not (Test-Path $Edge)) { $Edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }; ^
if (Test-Path $Edge) { ^
    $Shortcut.TargetPath = $Edge; ^
    $Shortcut.Arguments = '--app=\"https://gvcncdsai.io.vn/app\" --window-size=1280,820'; ^
} else { ^
    $Shortcut.TargetPath = 'wscript.exe'; ^
    $Shortcut.Arguments = "\"$CurDir\Run_Desktop_Silent.vbs\""; ^
}; ^
$Shortcut.WorkingDirectory = $CurDir; ^
$Shortcut.IconLocation = "$Ico, 0"; ^
$Shortcut.Description = 'Smart Teacher Schedule AI'; ^
$Shortcut.Save(); ^
"

echo.
echo [THANH CONG] Da tao bieu tuong voi Logo chinh thuc ngoai Desktop!
echo Thay/Co co the bam truc tiep vao bieu tuong 'Smart Teacher Schedule AI' tren Desktop de mo app.
echo.
pause