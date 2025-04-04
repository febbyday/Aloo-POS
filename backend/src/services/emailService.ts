/**
 * Email Service
 *
 * Handles sending emails from the application.
 * Uses Nodemailer for sending emails.
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// Email template types
export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  STAFF_CREDENTIALS = 'staff-credentials',
  ORDER_CONFIRMATION = 'order-confirmation',
  INVOICE = 'invoice',
}

// Email configuration
interface EmailConfig {
  from: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  useMock?: boolean;
}

// Email data
export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: EmailTemplate;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Email Service class
 */
export class EmailService {
  private static instance: EmailService;
  private transporter!: nodemailer.Transporter; // Using the definite assignment assertion
  private config!: EmailConfig; // Using the definite assignment assertion
  private initialized: boolean = false;
  private useMock: boolean = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Default configuration
    this.config = {
      from: process.env.EMAIL_FROM || 'noreply@posapp.com',
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
      useMock: process.env.NODE_ENV !== 'production' || process.env.EMAIL_USE_MOCK === 'true',
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize the email service
   * @param config Optional configuration to override defaults
   */
  public initialize(config?: Partial<EmailConfig>): void {
    console.log('Initializing email service...');
    if (this.initialized) {
      console.log('Email service already initialized');
      logger.info('Email service already initialized');
      return;
    }

    // Merge provided config with defaults
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.useMock = this.config.useMock || process.env.NODE_ENV !== 'production';

    if (this.useMock) {
      console.log('Email service initialized in mock mode');
      logger.info('Email service initialized in mock mode');
      // Create a mock transporter that logs emails instead of sending them
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    } else {
      console.log('Email service initialized with SMTP transport');
      // Create a real SMTP transporter
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
      });
    }

    this.initialized = true;
    console.log('Email service initialized successfully');
    logger.info('Email service initialized');
  }

  /**
   * Send an email
   * @param emailData Email data
   * @returns Promise with send result
   */
  public async sendEmail(emailData: EmailData): Promise<boolean> {
    console.log('Attempting to send email to:', emailData.to);
    if (!this.initialized) {
      console.log('Email service not initialized, initializing now...');
      this.initialize();
    }

    try {
      // If a template is specified, render it
      if (emailData.template) {
        const renderedTemplate = await this.renderTemplate(
          emailData.template,
          emailData.templateData || {}
        );
        emailData.html = renderedTemplate;
      }

      // Prepare email options
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments,
      };

      // Send the email
      console.log('Sending email with options:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
      const info = await this.transporter.sendMail(mailOptions);

      if (this.useMock) {
        // Log the email in development mode
        console.log('Email sent (MOCK MODE):', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          messageId: info.messageId,
        });
        logger.info('Email sent (MOCK MODE):', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          messageId: info.messageId,
        });
        logger.debug('Email content:', {
          text: mailOptions.text,
          html: mailOptions.html?.substring(0, 500) + (mailOptions.html && mailOptions.html.length > 500 ? '...' : ''),
        });
      } else {
        console.log('Email sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          messageId: info.messageId,
        });
        logger.info('Email sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          messageId: info.messageId,
        });
      }

      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send a welcome email to a new user
   * @param to Recipient email
   * @param userData User data
   * @returns Promise with send result
   */
  public async sendWelcomeEmail(to: string, userData: {
    name: string;
    username: string;
    password?: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to POS System',
      template: EmailTemplate.WELCOME,
      templateData: userData,
    });
  }

  /**
   * Send staff credentials email
   * @param to Recipient email
   * @param staffData Staff data
   * @returns Promise with send result
   */
  public async sendStaffCredentialsEmail(to: string, staffData: {
    name: string;
    username: string;
    password: string;
    role: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Your POS System Account Credentials',
      template: EmailTemplate.STAFF_CREDENTIALS,
      templateData: staffData,
    });
  }

  /**
   * Send password reset email
   * @param to Recipient email
   * @param resetData Reset data
   * @returns Promise with send result
   */
  public async sendPasswordResetEmail(to: string, resetData: {
    name: string;
    resetLink: string;
    expiresIn: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: EmailTemplate.PASSWORD_RESET,
      templateData: resetData,
    });
  }

  /**
   * Render an email template
   * @param template Template name
   * @param data Template data
   * @returns Rendered HTML
   */
  private async renderTemplate(
    template: EmailTemplate,
    data: Record<string, any>
  ): Promise<string> {
    // In a real application, you would use a template engine like Handlebars
    // For simplicity, we'll use a switch statement with template literals
    switch (template) {
      case EmailTemplate.WELCOME:
        return this.renderWelcomeTemplate(data);
      case EmailTemplate.PASSWORD_RESET:
        return this.renderPasswordResetTemplate(data);
      case EmailTemplate.STAFF_CREDENTIALS:
        return this.renderStaffCredentialsTemplate(data);
      case EmailTemplate.ORDER_CONFIRMATION:
        return this.renderOrderConfirmationTemplate(data);
      case EmailTemplate.INVOICE:
        return this.renderInvoiceTemplate(data);
      default:
        return `<p>No template found for ${template}</p>`;
    }
  }

  /**
   * Render welcome email template
   * @param data Template data
   * @returns Rendered HTML
   */
  private renderWelcomeTemplate(data: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Welcome to POS System!</h1>
        <p>Hello ${data.name},</p>
        <p>Thank you for joining our POS System. We're excited to have you on board!</p>
        <p>Your account has been created with the following details:</p>
        <ul>
          <li><strong>Username:</strong> ${data.username}</li>
          ${data.password ? `<li><strong>Password:</strong> ${data.password}</li>` : ''}
        </ul>
        <p>You can log in to your account at <a href="http://localhost:5173/login">our login page</a>.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The POS System Team</p>
      </div>
    `;
  }

  /**
   * Render password reset email template
   * @param data Template data
   * @returns Rendered HTML
   */
  private renderPasswordResetTemplate(data: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Password Reset Request</h1>
        <p>Hello ${data.name},</p>
        <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <p style="text-align: center;">
          <a href="${data.resetLink}" style="background-color: #4a5568; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>
        <p>This link will expire in ${data.expiresIn}.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${data.resetLink}</p>
        <p>Best regards,<br>The POS System Team</p>
      </div>
    `;
  }

  /**
   * Render staff credentials email template
   * @param data Template data
   * @returns Rendered HTML
   */
  private renderStaffCredentialsTemplate(data: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Your POS System Account</h1>
        <p>Hello ${data.name},</p>
        <p>An account has been created for you in our POS System. You can use the following credentials to log in:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Username:</strong> ${data.username}</p>
          <p><strong>Password:</strong> ${data.password}</p>
          <p><strong>Role:</strong> ${data.role}</p>
        </div>
        <p>For security reasons, please change your password after your first login.</p>
        <p>You can log in to your account at <a href="http://localhost:5173/login">our login page</a>.</p>
        <p>If you have any questions, please contact your manager or the system administrator.</p>
        <p>Best regards,<br>The POS System Team</p>
      </div>
    `;
  }

  /**
   * Render order confirmation email template
   * @param data Template data
   * @returns Rendered HTML
   */
  private renderOrderConfirmationTemplate(data: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Order Confirmation</h1>
        <p>Hello ${data.customerName},</p>
        <p>Thank you for your order! We're processing it now.</p>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Order Date:</strong> ${data.orderDate}</p>
        <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
        <p>You can view your order details by logging into your account.</p>
        <p>Best regards,<br>The POS System Team</p>
      </div>
    `;
  }

  /**
   * Render invoice email template
   * @param data Template data
   * @returns Rendered HTML
   */
  private renderInvoiceTemplate(data: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a5568;">Invoice</h1>
        <p>Hello ${data.customerName},</p>
        <p>Please find attached your invoice for your recent purchase.</p>
        <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
        <p><strong>Invoice Date:</strong> ${data.invoiceDate}</p>
        <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
        <p>If you have any questions about this invoice, please contact our support team.</p>
        <p>Best regards,<br>The POS System Team</p>
      </div>
    `;
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

export default emailService;
