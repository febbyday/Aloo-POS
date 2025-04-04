@echo off
echo Authentication Bypass Toggle Script
echo ================================

set ORIGINAL_FILE=src\features\auth\components\ProtectedRoute.tsx
set BYPASS_FILE=src\features\auth\components\BypassProtectedRoute.tsx
set INDICATOR_FILE=src\features\auth\components\DevelopmentModeIndicator.tsx
set APP_FILE=src\App.tsx

if exist %BYPASS_FILE% (
    echo Authentication bypass is currently ENABLED.

    set /p CHOICE="Do you want to DISABLE the authentication bypass? (Y/N): "
    if /i "%CHOICE%"=="Y" (
        echo Disabling authentication bypass...

        REM Restore the original import in App.tsx
        powershell -Command "(Get-Content %APP_FILE%) -replace '// Import the bypass version of ProtectedRoute instead of the original\r\nimport { ProtectedRoute } from ''./features/auth/components/BypassProtectedRoute'';', 'import { ProtectedRoute } from ''./features/auth/components/ProtectedRoute'';'" | Set-Content %APP_FILE%

        REM Remove the bypass components if they exist
        if exist %BYPASS_FILE% (
            echo Removing bypass component files...
            del %BYPASS_FILE%
        )

        if exist %INDICATOR_FILE% (
            del %INDICATOR_FILE%
        )

        echo Authentication bypass has been DISABLED.
    ) else (
        echo No changes made. Authentication bypass remains ENABLED.
    )
) else (
    echo Authentication bypass is currently DISABLED.

    set /p CHOICE="Do you want to ENABLE the authentication bypass? (Y/N): "
    if /i "%CHOICE%"=="Y" (
        echo Enabling authentication bypass...

        REM Create the bypass file if it doesn't exist
        echo Creating bypass ProtectedRoute component...

        REM Create the DevelopmentModeIndicator component if it doesn't exist
        echo Creating DevelopmentModeIndicator component...
        echo /**> %INDICATOR_FILE%
        echo  * Development Mode Indicator>> %INDICATOR_FILE%
        echo  * >> %INDICATOR_FILE%
        echo  * A simple component that displays a visual indicator when the application>> %INDICATOR_FILE%
        echo  * is running in development mode with authentication bypass enabled.>> %INDICATOR_FILE%
        echo  */>> %INDICATOR_FILE%
        echo.>> %INDICATOR_FILE%
        echo import React from 'react';>> %INDICATOR_FILE%
        echo.>> %INDICATOR_FILE%
        echo export function DevelopmentModeIndicator() {>> %INDICATOR_FILE%
        echo   // Only show in development mode>> %INDICATOR_FILE%
        echo   if (import.meta.env.MODE !== 'development') {>> %INDICATOR_FILE%
        echo     return null;>> %INDICATOR_FILE%
        echo   }>> %INDICATOR_FILE%
        echo.>> %INDICATOR_FILE%
        echo   // Styles for the indicator>> %INDICATOR_FILE%
        echo   const styles = {>> %INDICATOR_FILE%
        echo     container: {>> %INDICATOR_FILE%
        echo       position: 'fixed' as const,>> %INDICATOR_FILE%
        echo       bottom: '10px',>> %INDICATOR_FILE%
        echo       right: '10px',>> %INDICATOR_FILE%
        echo       backgroundColor: 'rgba(255, 0, 0, 0.7)',>> %INDICATOR_FILE%
        echo       color: 'white',>> %INDICATOR_FILE%
        echo       padding: '5px 10px',>> %INDICATOR_FILE%
        echo       borderRadius: '4px',>> %INDICATOR_FILE%
        echo       fontSize: '12px',>> %INDICATOR_FILE%
        echo       fontWeight: 'bold' as const,>> %INDICATOR_FILE%
        echo       zIndex: 9999,>> %INDICATOR_FILE%
        echo       pointerEvents: 'none' as const,>> %INDICATOR_FILE%
        echo       boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'>> %INDICATOR_FILE%
        echo     }>> %INDICATOR_FILE%
        echo   };>> %INDICATOR_FILE%
        echo.>> %INDICATOR_FILE%
        echo   return (>> %INDICATOR_FILE%
        echo     ^<div style={styles.container}^>>> %INDICATOR_FILE%
        echo       AUTH BYPASS ENABLED>> %INDICATOR_FILE%
        echo     ^</div^>>> %INDICATOR_FILE%
        echo   );>> %INDICATOR_FILE%
        echo }>> %INDICATOR_FILE%

        echo /**> %BYPASS_FILE%
        echo  * Bypass Protected Route Component>> %BYPASS_FILE%
        echo  * >> %BYPASS_FILE%
        echo  * This is a modified version of the ProtectedRoute component that always allows access.>> %BYPASS_FILE%
        echo  * It completely bypasses authentication checks for all routes.>> %BYPASS_FILE%
        echo  */>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo import React from 'react';>> %BYPASS_FILE%
        echo import { DevelopmentModeIndicator } from './DevelopmentModeIndicator';>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo interface ProtectedRouteProps {>> %BYPASS_FILE%
        echo   children: React.ReactNode;>> %BYPASS_FILE%
        echo   permissions?: string[];>> %BYPASS_FILE%
        echo   roles?: string[];>> %BYPASS_FILE%
        echo   redirectPath?: string;>> %BYPASS_FILE%
        echo }>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo /**>> %BYPASS_FILE%
        echo  * Bypass Protected Route Component>> %BYPASS_FILE%
        echo  * Always allows access to the route regardless of authentication status>> %BYPASS_FILE%
        echo  */>> %BYPASS_FILE%
        echo export function ProtectedRoute({ >> %BYPASS_FILE%
        echo   children, >> %BYPASS_FILE%
        echo   permissions = [], >> %BYPASS_FILE%
        echo   roles = [], >> %BYPASS_FILE%
        echo   redirectPath = '/login' >> %BYPASS_FILE%
        echo }: ProtectedRouteProps) {>> %BYPASS_FILE%
        echo   // Log that we're using the bypass version>> %BYPASS_FILE%
        echo   console.log('[AUTH BYPASS] Using bypass ProtectedRoute - Authentication checks disabled');>> %BYPASS_FILE%
        echo   >> %BYPASS_FILE%
        echo   // Log permissions and roles that would normally be required>> %BYPASS_FILE%
        echo   if (permissions.length ^> 0 ^|^| roles.length ^> 0) {>> %BYPASS_FILE%
        echo     const permissionMessage = permissions.length ^> 0>> %BYPASS_FILE%
        echo       ? `Permissions needed: ${permissions.join(', ')}`>> %BYPASS_FILE%
        echo       : '';>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo     const rolesMessage = roles.length ^> 0>> %BYPASS_FILE%
        echo       ? `Roles needed: ${roles.join(', ')}`>> %BYPASS_FILE%
        echo       : '';>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo     console.log(>> %BYPASS_FILE%
        echo       '[AUTH BYPASS] Access requirements bypassed.',>> %BYPASS_FILE%
        echo       permissionMessage,>> %BYPASS_FILE%
        echo       rolesMessage>> %BYPASS_FILE%
        echo     );>> %BYPASS_FILE%
        echo   }>> %BYPASS_FILE%
        echo.>> %BYPASS_FILE%
        echo   // Always render the children with a development mode indicator>> %BYPASS_FILE%
        echo   return (>> %BYPASS_FILE%
        echo     ^<^>>> %BYPASS_FILE%
        echo       {children}>> %BYPASS_FILE%
        echo       ^<DevelopmentModeIndicator /^>>> %BYPASS_FILE%
        echo     ^</^>>> %BYPASS_FILE%
        echo   );>> %BYPASS_FILE%
        echo }>> %BYPASS_FILE%

        REM Update the import in App.tsx
        powershell -Command "(Get-Content %APP_FILE%) -replace 'import { ProtectedRoute } from ''./features/auth/components/ProtectedRoute'';', '// Import the bypass version of ProtectedRoute instead of the original\r\nimport { ProtectedRoute } from ''./features/auth/components/BypassProtectedRoute'';'" | Set-Content %APP_FILE%

        echo Authentication bypass has been ENABLED.
    ) else (
        echo No changes made. Authentication bypass remains DISABLED.
    )
)

echo.
echo Press any key to exit...
pause > nul
