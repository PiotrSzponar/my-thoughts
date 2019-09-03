const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url, info = undefined) {
    this.to = user.email;
    this.name = user.name;
    this.info = info;
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`;
  }

  // Check env and choose how to handle emails
  // DEV: Trapmail
  // PROD: SendGrid
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'Sendgrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Trapmail
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send the actual email
  async send(subject, html) {
    // 1) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html
    };

    // 2) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Email address verification message
  async sendVerification() {
    await this.send(
      'Welcome to My Thoughts! Confirm Your Email Address.',
      `
      <center>
      <h1>.::My Thoughts::.</h1>
      <h3>Welcome ${this.name}! We're glad you're with us.</h3>
      <p>Please verify Your Email Address by clicking the link below.</p>
      <p><a href="${this.url}">Confirm Your Email Address</a></p>
      <br>
      <hr>
      <p>If you didn't request this, please ignore this email.</p>
      </center>
      `
    );
  }

  // Reset password message
  async sendResetPassword() {
    await this.send(
      'Reset password of My Thoughts account.',
      `
      <center>
      <h1>.::My Thoughts::.</h1>
      <h3>Welcome ${this.name}! Have you forgotten your password?</h3>
      <p>Please go to the page below and use reset password form.</p>
      <p><a href="${this.url}">Reset your password!</a></p>
      <br>
      <hr>
      <p>If you didn't request this, please ignore this email.</p>
      </center>
      `
    );
  }

  async sendFriendInformation() {
    await this.send(
      `My Thoughts - ${this.info.name} has ${this.info.status} your invitation to become friends!`,
      `
      <center>
      <h1>.::My Thoughts::.</h1>
      <h3>Welcome ${this.name}! Your invitation to ${this.info.name} has been ${this.info.status}</h3>
      <br>
      <hr>
      <p>If you didn't request this, please ignore this email.</p>
      </center>
      `
    );
  }

  async sendFriendInvitation() {
    await this.send(
      `My Thoughts - ${this.info.name} has sent you invitation to become friends!`,
      `
      <center>
      <h1>.::My Thoughts::.</h1>
      <h3>Welcome ${this.name}! You have new invitation</h3>
      <p>${this.info.name} wants to be your friend</p>
      <p><a href="${this.info.accept}">ACCEPT!</a></p>
      <p><a href="${this.info.reject}">REJECT!</a></p>
      <br>
      <hr>
      <p>If you didn't request this, please ignore this email.</p>
      </center>
      `
    );
  }
};
