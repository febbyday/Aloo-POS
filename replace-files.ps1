Write-Host "Replacing user module files with new versions..." -ForegroundColor Green

# Create backup directory
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Backup and replace UserManagementPage.tsx
Copy-Item "src\features\users\pages\UserManagementPage.tsx" -Destination "$backupDir\UserManagementPage.tsx.bak"
Move-Item "src\features\users\pages\UserManagementPage.new.tsx" -Destination "src\features\users\pages\UserManagementPage.tsx" -Force

# Backup and replace UserForm.tsx
Copy-Item "src\features\users\components\UserForm.tsx" -Destination "$backupDir\UserForm.tsx.bak"
Move-Item "src\features\users\components\UserForm.new.tsx" -Destination "src\features\users\components\UserForm.tsx" -Force

# Backup and replace userService.ts
Copy-Item "src\features\users\services\userService.ts" -Destination "$backupDir\userService.ts.bak"
Move-Item "src\features\users\services\userService.new.ts" -Destination "src\features\users\services\userService.ts" -Force

# Backup and replace AuthContext.tsx
Copy-Item "src\features\auth\context\AuthContext.tsx" -Destination "$backupDir\AuthContext.tsx.bak"
Move-Item "src\features\auth\context\AuthContext.new.tsx" -Destination "src\features\auth\context\AuthContext.tsx" -Force

# Backup and replace useAuth.tsx
Copy-Item "src\features\auth\hooks\useAuth.tsx" -Destination "$backupDir\useAuth.tsx.bak"
Move-Item "src\features\auth\hooks\useAuth.new.tsx" -Destination "src\features\auth\hooks\useAuth.tsx" -Force

# Backup and replace authService.ts
Copy-Item "src\features\auth\services\authService.ts" -Destination "$backupDir\authService.ts.bak"
Move-Item "src\features\auth\services\authService.new.ts" -Destination "src\features\auth\services\authService.ts" -Force

Write-Host "Files replaced successfully. Backups stored in $backupDir" -ForegroundColor Green
