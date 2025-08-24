# 📧 SendGrid Email Setup Guide

## ⚙️ **Configuration Options**

### **Toggle Email System On/Off:**

The email system can be easily enabled or disabled using the `ENABLE_EMAIL_SYSTEM` environment variable:

- **`ENABLE_EMAIL_SYSTEM=true`** → Full email functionality (asks for email, sends results)
- **`ENABLE_EMAIL_SYSTEM=false`** → No email functionality (assessment only, no email collection) **← DEFAULT**
- **No variable set** → Email system disabled (same as false)

### **What Happens When Disabled:**
- No email question in assessment
- No email sending
- Faster assessment completion
- Results shown only in the modal

### **What Happens When Enabled:**
- Email question appears first
- Full email functionality
- User receives beautiful results email
- Admin gets notification email

---

## 🚀 **Step 1: Create SendGrid Account**

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

## 🔑 **Step 2: Get API Key**

1. Navigate to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Full Access** or **Restricted Access** (Mail Send only)
4. Copy the generated API key

## 📝 **Step 3: Configure Environment Variables**

**💡 Note:** By default, the email system is **disabled** (`ENABLE_EMAIL_SYSTEM=false`). 
You only need to configure email variables if you want to enable the email functionality.

Create a `.env.local` file in your project root:

```bash
# Email System Configuration
ENABLE_EMAIL_SYSTEM=true                    # Set to 'false' to disable email system
SENDGRID_API_KEY=your_actual_api_key_here  # Only needed if ENABLE_EMAIL_SYSTEM=true
FROM_EMAIL=noreply@yourdomain.com          # Only needed if ENABLE_EMAIL_SYSTEM=true
ADMIN_EMAIL=admin@yourdomain.com           # Only needed if ENABLE_EMAIL_SYSTEM=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**💡 Quick Configuration Options:**

**Option 1: Enable Email System**
```bash
ENABLE_EMAIL_SYSTEM=true
SENDGRID_API_KEY=your_key_here
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

**Option 2: Disable Email System (Default)**
```bash
ENABLE_EMAIL_SYSTEM=false
# No other email variables needed
```

## 🌐 **Step 4: Verify Sender Domain (Optional but Recommended)**

1. Go to **Settings** → **Sender Authentication**
2. Choose **Domain Authentication** or **Single Sender Verification**
3. Follow the verification steps

## 🧪 **Step 5: Test the Integration**

1. Start your development server: `npm run dev`
2. Open the assessment modal
3. Complete the assessment with a real email
4. Check your email inbox for results
5. Check admin email for notification

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Invalid SendGrid API key"**
   - Check your API key is correct
   - Ensure the key has "Mail Send" permissions

2. **"Unauthorized" error**
   - Verify your SendGrid account is active
   - Check if you've hit the free tier limit

3. **Emails not received**
   - Check spam/junk folder
   - Verify sender email is properly configured
   - Check SendGrid activity logs

### **SendGrid Dashboard:**
- **Activity** → See all email activity
- **Stats** → Monitor delivery rates
- **Settings** → Configure webhooks, etc.

## 💰 **Pricing (Free Tier)**
- **100 emails/day** - Free forever
- **2,000 emails/month** - Free forever
- **Advanced features** - Paid plans start at $14.95/month

## 🔒 **Security Best Practices**
- Never commit API keys to version control
- Use environment variables
- Restrict API key permissions when possible
- Monitor email activity regularly

## 📞 **Support**
- SendGrid Documentation: [docs.sendgrid.com](https://docs.sendgrid.com)
- SendGrid Support: Available in paid plans
- Community: [community.sendgrid.com](https://community.sendgrid.com)

---

**🎯 Your assessment system is now ready to send real emails!**
