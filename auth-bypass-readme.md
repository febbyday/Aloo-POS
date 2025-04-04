# Authentication Bypass Tool

This tool provides a simple way to bypass authentication in the POS application for development and testing purposes. It's a standalone HTML page that can be opened directly in a browser without needing to be integrated into the application.

## Features

- Set up authentication data for different user roles (Admin, Manager, Cashier)
- Clear authentication data when no longer needed
- View current authentication data stored in localStorage
- Quick links to protected application pages
- Completely separate from the application code

## How to Use

1. Open the `auth-bypass-tool.html` file in a web browser
2. Click one of the role buttons (Admin, Manager, Cashier) to set up authentication data
3. Use the links provided to navigate to protected pages in the application
4. When finished, click "Clear Authentication" to remove the auth data

## How It Works

The tool works by:

1. Creating mock authentication data (token and user object) based on the selected role
2. Storing this data in localStorage, which is where the application looks for authentication information
3. Setting up session storage flags to prevent navigation throttling and handle problematic routes
4. Providing direct links to protected pages in the application

## Troubleshooting

If you encounter issues:

- Make sure you're using the correct application URL (default is localhost:5173)
- Try refreshing the page after setting up authentication
- Check browser console for any errors
- Clear browser cache if issues persist
- Verify that the application is using localStorage for authentication (this tool assumes it does)

## Security Notice

This tool is for development and testing purposes only. It bypasses normal authentication flows and should never be used in production environments or shared with end users.

## Customization

You can customize the tool by:

- Modifying the user templates in the JavaScript code to match your application's user structure
- Updating the application links to point to your specific routes
- Adjusting the token generation logic if your application expects a specific token format

## Technical Details

The tool creates:

1. A mock JWT token with appropriate claims for the selected role
2. A user object with role-specific permissions
3. Stores these in localStorage under the keys used by the application
4. Sets session storage flags to handle special cases for problematic routes

No server-side changes are required, making this a completely client-side solution.
