import express from 'express';

console.log('Express import:', express);
console.log('Express Router:', express.Router);

try {
  const router = express.Router();
  console.log('Router created successfully');
} catch (error) {
  console.error('Error creating router:', error);
}

console.log('Test completed'); 