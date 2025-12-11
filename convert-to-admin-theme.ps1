# PowerShell script to convert organizer theme to admin purple theme
# Run this in PowerShell: .\convert-to-admin-theme.ps1

$files = Get-ChildItem -Path "app\admin\problem-bank\[id]" -Filter *.tsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace routes
    $content = $content -replace '/organizer/problem-bank', '/admin/problem-bank'
    $content = $content -replace 'href="/organizer"', 'href="/admin"'
    
    # Replace colors
    $content = $content -replace 'bg-\[#f49700\]', 'bg-purple-600'
    $content = $content -replace 'hover:bg-\[#d68400\]', 'hover:bg-purple-700'
    $content = $content -replace 'text-\[#f49700\]', 'text-purple-600'
    $content = $content -replace 'border-\[#f49700\]', 'border-purple-600'
    $content = $content -replace 'focus:ring-\[#f49700\]', 'focus:ring-purple-600'
    
    # Replace sidebar text
    $content = $content -replace '<p className="text-xs text-slate-500">Organizer</p>', '<p className="text-xs text-purple-600 font-medium">Admin</p>'
    
    # Save file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "✅ Conversion complete! All files updated with purple theme and admin routes."
