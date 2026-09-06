Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & WshShell.CurrentDirectory & "\SmartTeacherSchedule_Windows.bat" & chr(34), 0
Set WshShell = Nothing
