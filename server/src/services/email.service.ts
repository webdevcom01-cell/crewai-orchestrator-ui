import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Email configuration
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@crewai-orchestrator.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'CrewAI Orchestrator';

// Email template IDs (create these in SendGrid dashboard)
const TEMPLATES = {
  WELCOME: process.env.SENDGRID_TEMPLATE_WELCOME || '',
  PASSWORD_RESET: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET || '',
  RUN_COMPLETED: process.env.SENDGRID_TEMPLATE_RUN_COMPLETED || '',
  RUN_FAILED: process.env.SENDGRID_TEMPLATE_RUN_FAILED || '',
  INVITATION: process.env.SENDGRID_TEMPLATE_INVITATION || '',
  SUBSCRIPTION_CREATED: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION || '',
  SUBSCRIPTION_CANCELLED: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION_CANCELLED || '',
} as const;

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicData?: Record<string, unknown>;
}

class EmailService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(process.env.SENDGRID_API_KEY);
    if (!this.isConfigured) {
      console.warn('[EmailService] SendGrid API key not configured. Emails will not be sent.');
    }
  }

  // ============================================
  // Core Email Methods
  // ============================================

  /**
   * Send a custom email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('[EmailService] Skipping email (not configured):', options.subject);
      return false;
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const msg: sgMail.MailDataRequired = {
        to: recipients.map((r) => ({
          email: r.email,
          name: r.name,
        })),
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: options.subject,
      };

      // Use template or raw content
      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicData || {};
      } else {
        msg.text = options.text || '';
        msg.html = options.html || options.text || '';
      }

      await sgMail.send(msg);
      console.log('[EmailService] Email sent to:', recipients.map((r) => r.email).join(', '));
      return true;
    } catch (error: any) {
      console.error('[EmailService] Error sending email:', error.response?.body || error.message);
      return false;
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(
    to: EmailRecipient | EmailRecipient[],
    templateId: string,
    dynamicData: Record<string, unknown>
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: '', // Subject comes from template
      templateId,
      dynamicData,
    });
  }

  // ============================================
  // Pre-built Email Types
  // ============================================

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: { email: string; name: string }): Promise<boolean> {
    if (TEMPLATES.WELCOME) {
      return this.sendTemplateEmail(
        { email: user.email, name: user.name },
        TEMPLATES.WELCOME,
        {
          name: user.name,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
          docsUrl: `${process.env.FRONTEND_URL}/docs`,
        }
      );
    }

    // Fallback to raw email
    return this.sendEmail({
      to: { email: user.email, name: user.name },
      subject: 'Welcome to CrewAI Orchestrator! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CrewAI Orchestrator! 🤖</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>Thank you for joining CrewAI Orchestrator! We're excited to have you on board.</p>
              <p>With our platform, you can:</p>
              <ul>
                <li>🤖 Create and manage AI agents</li>
                <li>📋 Define tasks and workflows</li>
                <li>🔄 Build powerful crews for automation</li>
                <li>📊 Monitor runs in real-time</li>
              </ul>
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CrewAI Orchestrator. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    user: { email: string; name: string },
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (TEMPLATES.PASSWORD_RESET) {
      return this.sendTemplateEmail(
        { email: user.email, name: user.name },
        TEMPLATES.PASSWORD_RESET,
        {
          name: user.name,
          resetUrl,
          expiresIn: '1 hour',
        }
      );
    }

    return this.sendEmail({
      to: { email: user.email, name: user.name },
      subject: 'Reset Your Password - CrewAI Orchestrator',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .warning { background: #fef3cd; padding: 15px; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <strong>⚠️ This link expires in 1 hour.</strong>
                <p>If you didn't request this reset, you can safely ignore this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send run completion notification
   */
  async sendRunCompletedEmail(
    user: { email: string; name: string },
    run: { id: string; crewName: string; duration: number; taskCount: number }
  ): Promise<boolean> {
    const runUrl = `${process.env.FRONTEND_URL}/runs/${run.id}`;

    if (TEMPLATES.RUN_COMPLETED) {
      return this.sendTemplateEmail(
        { email: user.email, name: user.name },
        TEMPLATES.RUN_COMPLETED,
        {
          name: user.name,
          crewName: run.crewName,
          runId: run.id,
          duration: this.formatDuration(run.duration),
          taskCount: run.taskCount,
          runUrl,
        }
      );
    }

    return this.sendEmail({
      to: { email: user.email, name: user.name },
      subject: `✅ Crew Run Completed - ${run.crewName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Run Completed Successfully!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>Great news! Your crew <strong>${run.crewName}</strong> has finished running.</p>
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${run.taskCount}</div>
                  <div>Tasks Completed</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${this.formatDuration(run.duration)}</div>
                  <div>Duration</div>
                </div>
              </div>
              <p style="text-align: center;">
                <a href="${runUrl}" class="button">View Results</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send run failure notification
   */
  async sendRunFailedEmail(
    user: { email: string; name: string },
    run: { id: string; crewName: string; error: string }
  ): Promise<boolean> {
    const runUrl = `${process.env.FRONTEND_URL}/runs/${run.id}`;

    if (TEMPLATES.RUN_FAILED) {
      return this.sendTemplateEmail(
        { email: user.email, name: user.name },
        TEMPLATES.RUN_FAILED,
        {
          name: user.name,
          crewName: run.crewName,
          error: run.error,
          runUrl,
        }
      );
    }

    return this.sendEmail({
      to: { email: user.email, name: user.name },
      subject: `❌ Crew Run Failed - ${run.crewName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .error-box { background: #fee2e2; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Run Failed</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>Unfortunately, your crew <strong>${run.crewName}</strong> encountered an error.</p>
              <div class="error-box">
                <strong>Error Details:</strong>
                <p>${run.error}</p>
              </div>
              <p style="text-align: center;">
                <a href="${runUrl}" class="button">View Run Details</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  /**
   * Send workspace invitation email
   */
  async sendInvitationEmail(
    invitee: { email: string; name?: string },
    workspace: { name: string; inviterName: string },
    inviteToken: string
  ): Promise<boolean> {
    const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${inviteToken}`;

    if (TEMPLATES.INVITATION) {
      return this.sendTemplateEmail(
        { email: invitee.email, name: invitee.name },
        TEMPLATES.INVITATION,
        {
          inviteeName: invitee.name || invitee.email,
          workspaceName: workspace.name,
          inviterName: workspace.inviterName,
          inviteUrl,
        }
      );
    }

    return this.sendEmail({
      to: { email: invitee.email, name: invitee.name },
      subject: `You're invited to join ${workspace.name} on CrewAI Orchestrator`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${invitee.name || 'there'},</p>
              <p><strong>${workspace.inviterName}</strong> has invited you to join <strong>${workspace.name}</strong> on CrewAI Orchestrator.</p>
              <p>Join the team to collaborate on AI agents, tasks, and crews!</p>
              <p style="text-align: center;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This invitation link expires in 7 days.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  // ============================================
  // Utility Methods
  // ============================================

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
}

export const emailService = new EmailService();
export default emailService;
