# EmailJS Setup Instructions

## To receive notifications when someone fills out your contact form:

### 1. Create an EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

### 2. Set up Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID**

### 3. Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template structure:

```
Subject: New Contact Form Message from {{name}}

From: {{name}}
Email: {{email}}

Message:
{{message}}

---
This message was sent from your portfolio contact form.
```

4. Save the template and note down your **Template ID**

### 4. Get Your Public Key
1. Go to "Account" > "General" in your dashboard
2. Find your **Public Key** in the API Keys section

### 5. Update Your Environment Variables
1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=your_actual_service_id
VITE_EMAILJS_TEMPLATE_ID=your_actual_template_id  
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

### 6. Test Your Setup
1. Start your development server: `npm run dev`
2. Fill out the contact form on your website
3. Check your email - you should receive the message!

## Important Notes:
- Keep your `.env` file secure and never commit it to version control
- EmailJS free tier allows 200 emails per month
- Make sure your email service is properly configured in EmailJS dashboard
- Test the form after deployment to ensure it works in production

## Troubleshooting:
- If emails aren't sending, check the browser console for errors
- Verify all environment variables are correctly set
- Make sure your EmailJS service is active and properly configured
- Check your spam/junk folder for test emails
