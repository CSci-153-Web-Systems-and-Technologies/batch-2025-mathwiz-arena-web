@echo off
echo Converting admin files from organizer theme to purple theme...

REM Update all TypeScript files in the admin problem-bank folder
for /R "app\admin\problem-bank\[id]" %%f in (*.tsx) do (
    powershell -Command "(Get-Content '%%f' -Raw) -replace '/organizer/problem-bank','/admin/problem-bank' -replace '/organizer','/admin' -replace 'focus:ring-\[#f49700\]','focus:ring-purple-600' -replace 'text-\[#f49700\]','text-purple-600' -replace 'border-\[#f49700\]','border-purple-600' -replace 'bg-\[#f49700\]/5','bg-purple-600/5' -replace 'bg-\[#f49700\]','bg-purple-600' -replace 'hover:bg-\[#d68400\]','hover:bg-purple-700' -replace 'text-xs text-slate-500\u003eOrganizer','text-xs text-purple-600 font-medium\u003eAdmin' | Set-Content '%%f' -NoNewline"
    echo Updated: %%f
)

echo Done! All files converted to admin purple theme.
pause
