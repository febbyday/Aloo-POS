# Authentication Bypass Tools

This package contains several tools to bypass authentication in the POS application for development and testing purposes. These tools are completely separate from the application code and can be used without modifying any application files.

## Tools Included

1. **Auth Bypass Injector** (`auth-bypass-injector.html`)
   - The most powerful option that completely disables authentication checks
   - Works for all routes including problematic ones (users, roles, permissions)
   - Injects a script that overrides React's authentication context

2. **Auth Bypass Bookmarklet** (`auth-bypass-bookmarklet.html`)
   - A bookmarklet that can be added to your browser's bookmarks bar
   - Can be activated on any page in the application
   - Convenient for quick access to protected routes

3. **Simple Auth Bypass Tool** (`auth-bypass-tool.html`)
   - Basic tool that sets up authentication data in localStorage
   - May not work for all routes but is simpler to understand
   - Good for learning how authentication works in the application

## How to Use

### Auth Bypass Injector (Recommended)

1. Open `auth-bypass-injector.html` in your browser
2. Click "Open in New Tab" to launch the application with authentication bypass
3. You can also use the direct links to open specific pages with bypass applied

### Auth Bypass Bookmarklet

1. Open `auth-bypass-bookmarklet.html` in your browser
2. Drag the "Auth Bypass" button to your bookmarks bar
3. Navigate to your application at `http://localhost:5173`
4. Click the bookmarklet in your bookmarks bar to apply the bypass

### Simple Auth Bypass Tool

1. Open `auth-bypass-tool.html` in your browser
2. Click one of the role buttons (Admin, Manager, Cashier) to set up authentication data
3. Use the links provided to navigate to protected pages in the application

## How It Works

These tools use different approaches to bypass authentication:

1. **Injector**: Overrides React's context API to force authentication to always return true
2. **Bookmarklet**: Similar to the injector but packaged as a convenient bookmarklet
3. **Simple Tool**: Sets authentication data in localStorage where the application looks for it

## Security Notice

These tools are for development and testing purposes only. They bypass normal authentication flows and should never be used in production environments or shared with end users.

## Troubleshooting

If you encounter issues:

- Make sure your application is running at `http://localhost:5173`
- Try refreshing the page after applying the bypass
- Check browser console for any errors
- Clear browser cache if issues persist
- The injector and bookmarklet require React to be loaded on the page
