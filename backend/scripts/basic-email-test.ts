/**
 * Basic email test
 */

import nodemailer from 'nodemailer';

console.log('Creating test account...');

// Create a test account
nodemailer.createTestAccount()
  .then(testAccount => {
    console.log('Test account created:', testAccount);

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    console.log('Sending test email...');

    // Send mail with defined transport object
    return transporter.sendMail({
      from: '"POS System" <noreply@posapp.com>',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<b>This is a test email</b>'
    });
  })
  .then(info => {
    console.log('Email sent:', info);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
