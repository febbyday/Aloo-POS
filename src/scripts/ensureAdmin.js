/**
 * Ensure Admin User Script
 * 
 * This script ensures that an admin user exists in the system
 * and provides login credentials.
 */

// Simple fetch-based script to check and create admin user
(async function() {
  console.log('=== POS System Admin User Setup ===');
  
  // API endpoints
  const BASE_URL = 'http://localhost:5000/api/v1';
  const AUTH_ENDPOINT = `${BASE_URL}/auth`;
  const USERS_ENDPOINT = `${BASE_URL}/users`;
  
  // Admin user credentials
  const ADMIN_USER = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };
  
  // Check API health
  console.log('\nChecking backend connectivity...');
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running and accessible');
    } else {
      console.error('❌ Backend is running but returned an error:', await healthResponse.text());
      return;
    }
  } catch (error) {
    console.error('❌ Backend is not accessible. Please ensure the backend server is running.');
    console.error('Error details:', error.message);
    return;
  }
  
  // Try to login with default credentials
  console.log('\nTrying to login with default admin credentials...');
  try {
    const loginResponse = await fetch(`${AUTH_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: ADMIN_USER.username,
        password: ADMIN_USER.password
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Successfully logged in with admin credentials');
      console.log('\nAdmin user exists with the following credentials:');
      console.log('----------------------------------');
      console.log('Username:', ADMIN_USER.username);
      console.log('Password:', ADMIN_USER.password);
      console.log('----------------------------------');
      return;
    } else {
      console.log('❌ Login failed. Admin user might not exist or has different credentials');
    }
  } catch (error) {
    console.error('❌ Error during login attempt:', error.message);
  }
  
  // Try to create admin user
  console.log('\nAttempting to create admin user...');
  try {
    const registerResponse = await fetch(`${AUTH_ENDPOINT}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_USER)
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok && registerData.success) {
      console.log('✅ Successfully created admin user');
      console.log('\nAdmin user created with the following credentials:');
      console.log('----------------------------------');
      console.log('Username:', ADMIN_USER.username);
      console.log('Password:', ADMIN_USER.password);
      console.log('----------------------------------');
    } else {
      console.error('❌ Failed to create admin user:', registerData.message || 'Unknown error');
      
      if (registerData.error && registerData.error.includes('duplicate')) {
        console.log('\nAdmin user might already exist but with different credentials.');
        console.log('Try using the default credentials:');
        console.log('----------------------------------');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('----------------------------------');
      }
    }
  } catch (error) {
    console.error('❌ Error during admin user creation:', error.message);
  }
})();
