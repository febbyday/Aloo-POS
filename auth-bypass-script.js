/**
 * Authentication Bypass Script
 * 
 * This script completely disables authentication checks in the application.
 * It works by overriding key authentication functions and context providers.
 */

(function() {
    console.log('[AUTH BYPASS] Initializing authentication bypass...');

    // Create a mock admin user
    const mockUser = {
        id: 'admin-bypass-123',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        fullName: 'Admin User',
        role: 'ADMIN',
        roles: ['ADMIN'],
        permissions: ['*'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Store mock user in localStorage
    localStorage.setItem('auth_token', 'bypass-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'bypass-token');

    // Override authentication context
    function injectScript() {
        const script = document.createElement('script');
        script.textContent = `
            // Wait for React to be available
            const checkReactInterval = setInterval(() => {
                if (window.React) {
                    clearInterval(checkReactInterval);
                    console.log('[AUTH BYPASS] React detected, overriding authentication...');
                    
                    // Override authentication context
                    const originalCreateContext = React.createContext;
                    React.createContext = function(defaultValue, calculateChangedBits) {
                        const context = originalCreateContext(defaultValue, calculateChangedBits);
                        
                        // Check if this is the auth context
                        if (defaultValue && 
                            (defaultValue.hasOwnProperty('isAuthenticated') || 
                             defaultValue.hasOwnProperty('user'))) {
                            
                            console.log('[AUTH BYPASS] Detected Auth Context, overriding with bypass values');
                            
                            // Override the Provider component
                            const OriginalProvider = context.Provider;
                            context.Provider = function({ children, value, ...props }) {
                                // Create bypass auth context
                                const bypassValue = {
                                    user: {
                                        id: 'admin-bypass-123',
                                        username: 'admin',
                                        email: 'admin@example.com',
                                        firstName: 'Admin',
                                        lastName: 'User',
                                        fullName: 'Admin User',
                                        role: 'ADMIN',
                                        roles: ['ADMIN'],
                                        permissions: ['*'],
                                        isActive: true
                                    },
                                    isAuthenticated: true,
                                    isLoading: false,
                                    error: null,
                                    permissions: ['*'],
                                    isDevelopmentMode: true,
                                    isBypassEnabled: true,
                                    login: async () => ({ success: true }),
                                    logout: async () => {},
                                    hasPermission: () => true,
                                    hasRole: () => true,
                                    refreshAuth: async () => true,
                                    restoreAuth: () => {},
                                    clearAuthError: () => {}
                                };
                                
                                // Merge with original value to maintain other properties
                                const mergedValue = { ...value, ...bypassValue };
                                
                                return React.createElement(OriginalProvider, {
                                    value: mergedValue,
                                    ...props
                                }, children);
                            };
                        }
                        
                        return context;
                    };
                    
                    // Override Protected Route component if it exists
                    const originalCreateElement = React.createElement;
                    React.createElement = function(type, props, ...children) {
                        // Check if this is a ProtectedRoute component
                        if (type && type.name === 'ProtectedRoute') {
                            console.log('[AUTH BYPASS] Detected ProtectedRoute, bypassing protection');
                            // Just render the children directly
                            return children[0];
                        }
                        
                        return originalCreateElement.apply(this, [type, props, ...children]);
                    };
                    
                    console.log('[AUTH BYPASS] Authentication bypass complete');
                }
            }, 100);
        `;
        document.head.appendChild(script);
    }

    // Function to handle navigation events
    function handleNavigation() {
        console.log('[AUTH BYPASS] Page navigation detected, reapplying bypass');
        
        // Check if we're on a problematic route
        const problematicRoutes = ['/users', '/roles', '/permissions'];
        const isProblematicRoute = problematicRoutes.some(route => 
            window.location.pathname === route || 
            window.location.pathname.startsWith(route + '/')
        );
        
        if (isProblematicRoute) {
            console.log('[AUTH BYPASS] Detected problematic route:', window.location.pathname);
            
            // If we see a login form, we need to redirect back to the original page
            if (document.querySelector('form[action*="login"]') || 
                document.querySelector('input[name="password"]')) {
                console.log('[AUTH BYPASS] Login form detected, redirecting back');
                window.history.back();
            }
        }
    }

    // Execute the injection
    injectScript();
    
    // Set up navigation monitoring
    window.addEventListener('popstate', handleNavigation);
    
    // Check periodically for login forms
    setInterval(handleNavigation, 1000);
    
    console.log('[AUTH BYPASS] Script initialized');
})();
