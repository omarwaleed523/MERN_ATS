const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configure nodemailer with email settings
const createTransporter = async () => {
  // First, check if we have real email credentials
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      // Try to create a real email transporter with extended timeout
      const realTransporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 60000, // 60 seconds connection timeout
        greetingTimeout: 30000,   // 30 seconds greeting timeout
        socketTimeout: 60000      // 60 seconds socket timeout
      });
      
      // Verify connection
      await realTransporter.verify();
      console.log('Real email service connected successfully');
      return { transporter: realTransporter, isTest: false };
    } catch (error) {
      console.warn(`Could not connect to real email service: ${error.message}`);
      // Fall back to test account if real email fails
    }
  }
  
  // Create a test account with Ethereal Email if real credentials fail or aren't provided
  try {
    console.log('Creating test email account with Ethereal...');
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a test transporter
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      connectionTimeout: 30000, // 30 seconds timeout
      greetingTimeout: 15000
    });
    
    console.log('Ethereal Email test account created successfully');
    console.log(`Email preview URL: https://ethereal.email/login`);
    console.log(`Username: ${testAccount.user}`);
    console.log(`Password: ${testAccount.pass}`);
    
    return { transporter: testTransporter, isTest: true, testAccount };
  } catch (error) {
    console.error(`Could not create test email account: ${error.message}`);
    return { transporter: null, isTest: false };
  }
};

// Create the email service
let emailService = {
  transporter: null,
  isTest: false,
  testAccount: null,
  initialized: false
};

// Initialize the email service asynchronously
const initializeEmailService = async () => {
  if (!emailService.initialized) {
    const result = await createTransporter();
    emailService = { ...result, initialized: true };
    
    if (emailService.isTest) {
      console.log('==========================================');
      console.log('📧 USING TEST EMAIL SERVICE');
      console.log('Emails will be sent to a test inbox that you can view at:');
      console.log('https://ethereal.email/login');
      console.log(`Username: ${emailService.testAccount.user}`);
      console.log(`Password: ${emailService.testAccount.pass}`);
      console.log('==========================================');
    }
  }
  return emailService;
};

// Initialize immediately
initializeEmailService();

// Gets recruiter contact info to add to emails
const getRecruiterContactInfoSection = (recruiterInfo) => {
  if (!recruiterInfo || (!recruiterInfo.name && !recruiterInfo.email && !recruiterInfo.phone)) {
    return '';
  }

  let contactInfo = 'Recruiter Contact Information:\n';
  
  if (recruiterInfo.name) {
    contactInfo += `Name: ${recruiterInfo.name}\n`;
  }
  
  if (recruiterInfo.email) {
    contactInfo += `Email: ${recruiterInfo.email}\n`;
  }
  
  if (recruiterInfo.phone) {
    contactInfo += `Phone: ${recruiterInfo.phone}\n`;
  }
  
  if (recruiterInfo.company) {
    contactInfo += `Company: ${recruiterInfo.company}\n`;
  }
  
  return `\n${contactInfo}`;
};

// Email templates for different application statuses
const emailTemplates = {
  'Submitted': {
    subject: 'Application Received - Thank You!',
    text: (data) => `
Dear ${data.candidateName},

Thank you for submitting your application for the ${data.jobTitle} position at ${data.company}. 

Your application has been received and is now in our system. Our team will review your qualifications and experience carefully.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Application ID: ${data.applicationId}
- Submitted on: ${new Date(data.appliedAt).toLocaleDateString()}

What's Next?
We'll review your application and update its status as it progresses through our hiring workflow. You can log into your candidate dashboard at any time to check your application status.

If you have any questions, please don't hesitate to contact us.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Under Review': {
    subject: 'Your Application is Under Review',
    text: (data) => `
Dear ${data.candidateName},

We wanted to let you know that your application for the ${data.jobTitle} position at ${data.company} is now under review by our hiring team.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Under Review

What's Next?
Our team is carefully reviewing your qualifications against the requirements for this role. This process typically takes 1-2 weeks. We'll notify you when there's an update to your application status.

Thank you for your patience during our review process.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Shortlisted': {
    subject: 'Congratulations! Your Application Has Been Shortlisted',
    text: (data) => `
Dear ${data.candidateName},

Great news! Your application for the ${data.jobTitle} position at ${data.company} has been shortlisted.

This means your qualifications and experience have stood out to our hiring team, and we're interested in learning more about you.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Shortlisted

What's Next?
A member of our recruitment team will be in touch soon to discuss the next steps in the hiring process, which may include scheduling an interview or an assessment.

Thank you for your interest in joining our team. We look forward to getting to know you better!
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Interview Scheduled': {
    subject: 'Interview Scheduled for Your Application',
    text: (data) => `
Dear ${data.candidateName},

We're pleased to inform you that we'd like to interview you for the ${data.jobTitle} position at ${data.company}.

${data.nextSteps ? `Interview Details:\n${data.nextSteps}\n` : ''}

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Interview Scheduled

Please confirm this interview time by replying to this email. If you need to reschedule, please let us know as soon as possible.

Tips for your interview:
- Research our company and the role beforehand
- Prepare examples that highlight your relevant skills and experiences
- Have questions ready to ask the interviewer
- Arrive (or log in) 5-10 minutes early
${getRecruiterContactInfoSection(data.recruiterInfo)}

We look forward to speaking with you!

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Interviewed': {
    subject: 'Thank You for Your Interview',
    text: (data) => `
Dear ${data.candidateName},

Thank you for attending the interview for the ${data.jobTitle} position at ${data.company}.

We appreciate the time you took to speak with our team and share more about your experience and qualifications.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Interviewed

What's Next?
Our team is evaluating all candidates. We expect to make a decision within the next week and will contact you regardless of the outcome.

Thank you again for your interest in joining our company.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Assessment': {
    subject: 'Assessment Stage: Next Steps for Your Application',
    text: (data) => `
Dear ${data.candidateName},

Your application for the ${data.jobTitle} position at ${data.company} has progressed to the assessment stage.

${data.nextSteps ? `Assessment Details:\n${data.nextSteps}\n` : ''}

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Assessment

Please follow the instructions carefully and complete the assessment by the given deadline. This is an important step in our evaluation process.

If you have any questions about the assessment, please don't hesitate to contact us.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Reference Check': {
    subject: 'Reference Check for Your Application',
    text: (data) => `
Dear ${data.candidateName},

We hope this email finds you well. Your application for the ${data.jobTitle} position at ${data.company} has advanced to the reference check stage.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Reference Check

We'll be contacting the references you provided in your application. If you need to update your reference information or have any questions about this process, please let us know.

This is one of the final stages in our hiring process, and we appreciate your continued interest in the role.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Offer Extended': {
    subject: 'Job Offer for the ${jobTitle} Position',
    text: (data) => `
Dear ${data.candidateName},

Congratulations! We're delighted to offer you the ${data.jobTitle} position at ${data.company}.

${data.nextSteps ? `Offer Details:\n${data.nextSteps}\n` : ''}

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Offer Extended

A formal offer letter with complete details about your compensation, benefits, and start date will be sent to you shortly. Once you receive it, please review it carefully.

We're excited about the possibility of you joining our team and look forward to your response.

If you have any questions about the offer or need additional information, please don't hesitate to contact us.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Offer Accepted': {
    subject: 'Welcome to the Team!',
    text: (data) => `
Dear ${data.candidateName},

Thank you for accepting our offer for the ${data.jobTitle} position at ${data.company}! We're thrilled that you'll be joining our team.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Offer Accepted

${data.nextSteps ? `Next Steps:\n${data.nextSteps}\n` : ''}

Our HR team will be in touch soon with onboarding details and to help make your transition as smooth as possible.

We're looking forward to your contributions and to welcoming you on your first day!
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Offer Declined': {
    subject: 'Regarding Your Decision on Our Offer',
    text: (data) => `
Dear ${data.candidateName},

We appreciate you considering our offer for the ${data.jobTitle} position at ${data.company}. While we're disappointed that you've decided not to accept the position, we respect your decision.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Offer Declined

We value the time you invested in the application process and would be happy to keep your information on file for future opportunities that might better align with your career goals.

We wish you all the best in your future endeavors.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Hired': {
    subject: 'Your Start Date and Onboarding Information',
    text: (data) => `
Dear ${data.candidateName},

We're excited to confirm that all the necessary steps have been completed, and you are officially hired for the ${data.jobTitle} position at ${data.company}!

${data.nextSteps ? `Onboarding Details:\n${data.nextSteps}\n` : ''}

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Hired

Please expect further communications from our HR department with specific details about your first day and onboarding process.

We're looking forward to having you on our team and to your future contributions!
${getRecruiterContactInfoSection(data.recruiterInfo)}

Warm welcome,
The Team at ${data.company}
    `
  },
  'Rejected': {
    subject: 'Update on Your Application',
    text: (data) => `
Dear ${data.candidateName},

Thank you for your interest in the ${data.jobTitle} position at ${data.company} and for taking the time to go through our application process.

After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications better match our current needs.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Not Selected

${data.rejectionReason ? `Feedback:\n${data.rejectionReason}\n\n` : ''}

${data.missingSkills ? `Areas for Development Based on Our Requirements:\n${data.missingSkills}\n\n` : ''}

${data.improvementSuggestions ? `Improvement Suggestions:\n${data.improvementSuggestions}\n\n` : ''}

This decision is not a reflection on your skills or experience. We encourage you to apply for future positions that align with your qualifications.

We appreciate your interest in our company and wish you the best in your job search.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  },
  'Withdrawn': {
    subject: 'Confirmation of Application Withdrawal',
    text: (data) => `
Dear ${data.candidateName},

This email confirms that your application for the ${data.jobTitle} position at ${data.company} has been withdrawn as requested.

Application Details:
- Position: ${data.jobTitle}
- Company: ${data.company}
- Current Status: Withdrawn

If you withdrew your application by mistake, please contact us immediately.

We appreciate your interest in our company and wish you success in your career endeavors.
${getRecruiterContactInfoSection(data.recruiterInfo)}

Best regards,
The Recruitment Team at ${data.company}
    `
  }
};

/**
 * Send application status notification email with retries
 * @param {Object} application - The application object with populated relations
 * @param {string} previousStatus - The previous status, used for conditional notifications
 * @returns {Promise<boolean>} - Success status of email sending
 */
const sendApplicationStatusEmail = async (application, previousStatus) => {
  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  // Delay between retries in milliseconds (starting with 1s, then 2s, then 4s - exponential backoff)
  const BASE_RETRY_DELAY = 1000;
  
  try {
    // Ensure application has populated relations
    if (!application.userId || !application.jobPostId) {
      console.error('Cannot send email: application relations not populated');
      return false;
    }

    // Skip email for Draft status or if template doesn't exist
    if (application.status === 'Draft' || !emailTemplates[application.status]) {
      return false;
    }

    const template = emailTemplates[application.status];
    const candidateName = application.userId.name || 'Candidate';
    const candidateEmail = application.userId.email;

    if (!candidateEmail) {
      console.error('Cannot send email: candidate email not found');
      return false;
    }

    // Fetch recruiter information if the job post has a recruiter
    let recruiterInfo = null;
    if (application.jobPostId.recruiter) {
      try {
        // Try to get the populated recruiter if it exists
        const recruiterUser = application.jobPostId.recruiter;
        recruiterInfo = {
          name: recruiterUser.name,
          email: recruiterUser.email,
          phone: recruiterUser.phone || null,
          company: application.jobPostId.company
        };
      } catch (err) {
        console.warn('Unable to fetch recruiter details for email', err);
      }
    }

    // Prepare data for email template
    const emailData = {
      candidateName,
      jobTitle: application.jobPostId.jobTitle || 'Position',
      company: application.jobPostId.company || 'Our Company',
      applicationId: application._id,
      appliedAt: application.appliedAt,
      nextSteps: application.nextSteps || '',
      rejectionReason: application.rejectionReason || '',
      missingSkills: application.missingSkills || '',
      improvementSuggestions: application.improvementSuggestions || '',
      recruiterInfo: recruiterInfo
    };
    
    // Make sure email service is initialized
    await initializeEmailService();
    
    // If transporter is not available, just log the email that would have been sent
    if (!emailService.transporter) {
      console.log('Email notification would have been sent (mail not configured):');
      console.log('To:', candidateEmail);
      console.log('Subject:', template.subject.replace('${jobTitle}', emailData.jobTitle));
      console.log('Body:', template.text(emailData).substring(0, 150) + '...');
      return true; // Return true so the application can still update its notification status
    }

    // Prepare email options with appropriate from address
    const mailOptions = {
      from: emailService.isTest 
        ? `"${process.env.EMAIL_FROM_NAME || emailData.company + ' Recruitment'}" <${emailService.testAccount.user}>`
        : `"${process.env.EMAIL_FROM_NAME || emailData.company + ' Recruitment'}" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: template.subject.replace('${jobTitle}', emailData.jobTitle),
      text: template.text(emailData),
      // Can add HTML version here if needed
    };

    // Implement retry logic for sending emails
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Send email
        const info = await emailService.transporter.sendMail(mailOptions);
        
        if (emailService.isTest) {
          console.log('Email sent to test account (Ethereal Email):');
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          console.log('To view this email, go to https://ethereal.email/login');
          console.log(`Username: ${emailService.testAccount.user}`);
          console.log(`Password: ${emailService.testAccount.pass}`);
        } else {
          console.log(`Email sent for application status change to ${application.status}: ${info.messageId}`);
        }
        
        return true; // Success, exit the retry loop
      } catch (error) {
        lastError = error;
        console.error(`Error sending email (attempt ${attempt + 1}/${MAX_RETRIES}):`, error.message);
        
        // Check if we should retry
        if (attempt < MAX_RETRIES - 1) {
          // Calculate delay with exponential backoff
          const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
          console.log(`Retrying in ${delay / 1000} seconds...`);
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // If this was a connection error, recreate the transporter
          if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
            console.log('Connection issue detected, recreating email transporter...');
            await initializeEmailService();
          }
        }
      }
    }
    
    // If we get here, all retry attempts failed
    console.error(`Failed to send email after ${MAX_RETRIES} attempts:`, lastError);
    throw lastError; // Re-throw to be caught by the outer try/catch
  } catch (error) {
    console.error('Error sending application status email:', error);
    
    // Log specific details for connection errors
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error(`Connection error (${error.code}) to ${error.address}:${error.port}`);
    }
    
    return false; // Return false to indicate failure
  }
};

// Add a queue for failed emails to retry later
const failedEmailQueue = [];

// Function to add a failed email to the queue
const addToEmailQueue = (application, previousStatus) => {
  failedEmailQueue.push({
    application,
    previousStatus,
    addedAt: new Date(),
    attempts: 0
  });
  console.log(`Added email to retry queue for application ${application._id}. Queue size: ${failedEmailQueue.length}`);
};

// Function to process the failed email queue
const processEmailQueue = async () => {
  if (failedEmailQueue.length === 0) return;
  
  console.log(`Processing email retry queue. ${failedEmailQueue.length} emails to retry.`);
  
  const MAX_QUEUE_ATTEMPTS = 5;
  
  // Process emails in the queue
  for (let i = 0; i < failedEmailQueue.length; i++) {
    const item = failedEmailQueue[i];
    
    // Skip items that have exceeded max attempts
    if (item.attempts >= MAX_QUEUE_ATTEMPTS) {
      console.log(`Email for application ${item.application._id} has failed ${item.attempts} times. Removing from queue.`);
      failedEmailQueue.splice(i, 1);
      i--; // Adjust index after removal
      continue;
    }
    
    console.log(`Retrying email for application ${item.application._id} (attempt ${item.attempts + 1}/${MAX_QUEUE_ATTEMPTS})`);
    
    try {
      // Try to send the email
      const success = await sendApplicationStatusEmail(item.application, item.previousStatus);
      
      if (success) {
        console.log(`Successfully sent queued email for application ${item.application._id}`);
        // Remove from queue if successful
        failedEmailQueue.splice(i, 1);
        i--; // Adjust index after removal
      } else {
        // Increment attempts and keep in queue
        item.attempts++;
        console.log(`Failed to send queued email for application ${item.application._id}. Will retry later.`);
      }
    } catch (error) {
      // Increment attempts and keep in queue
      item.attempts++;
      console.error(`Error processing queued email for application ${item.application._id}:`, error);
    }
    
    // Add a small delay between processing queue items to avoid overwhelming the email server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

// Set up queue processing interval (every 5 minutes)
setInterval(processEmailQueue, 5 * 60 * 1000);

module.exports = {
  sendApplicationStatusEmail,
  addToEmailQueue,
  processEmailQueue
};