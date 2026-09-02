# Email Setup Guide for theforgelab.in

**Last Updated**: September 2, 2026  
**Domain**: theforgelab.in  
**Registrar**: Hostinger (domain registration only)  
**Website Hosting**: GitHub Pages

---

## Overview

This guide explains how to set up a professional email address (`hello@theforgelab.in`) for your ForgeLab contact form. Since the domain is registered with Hostinger but the website is hosted on GitHub Pages, you have multiple options for email hosting.

---

## Current Situation

- ✅ **Domain Owned**: `theforgelab.in` (registered with Hostinger)
- ✅ **Website**: Hosted on GitHub Pages
- ✅ **Contact Form**: Configured to use FormSubmit.co → `hello@theforgelab.in`
- ⏳ **Email**: Needs to be set up to receive FormSubmit messages

---

## Email Hosting Options

### Option 1: Cloudflare Email Routing (FREE) ⭐ Recommended for Starting

**Cost**: FREE

**Best for**:
- Solo founders or small teams
- Budget-conscious startups
- Simple email forwarding needs
- Working contact forms (like yours with FormSubmit)

**Features**:
- Forward `hello@theforgelab.in` to your existing Gmail/Outlook
- Unlimited email aliases
- Spam protection
- Reply from personal email or configure "Send As" in Gmail

**Limitations**:
- Email forwarding only (not a full mailbox)
- Need to use Gmail/Outlook "Send As" feature to reply from `hello@theforgelab.in`
- Requires moving DNS to Cloudflare (free, but takes 1-24 hours)

**Setup Time**: 10-30 minutes (plus DNS propagation)

**Setup Steps**:

1. **Create Cloudflare Account**
   - Go to [cloudflare.com](https://cloudflare.com)
   - Sign up for free account

2. **Add Domain to Cloudflare**
   - Click "Add a Site"
   - Enter `theforgelab.in`
   - Select FREE plan

3. **Update Nameservers at Hostinger**
   - Cloudflare will provide 2 nameservers (e.g., `clark.ns.cloudflare.com`)
   - Log into Hostinger → Domain settings
   - Update nameservers to Cloudflare's
   - Wait 1-24 hours for DNS propagation (usually 1-2 hours)

4. **Enable Email Routing in Cloudflare**
   - Go to Email → Email Routing
   - Click "Enable Email Routing"
   - Add destination email (your personal Gmail/Outlook)
   - Verify destination email via confirmation link

5. **Create Email Route**
   - Add custom address: `hello@theforgelab.in`
   - Forward to: your verified personal email
   - Save

6. **Test**
   - Send test email to `hello@theforgelab.in`
   - Check it arrives in your personal inbox
   - Submit contact form to verify FormSubmit delivery

**Send Email FROM hello@theforgelab.in** (Optional):
- In Gmail: Settings → Accounts → "Send mail as" → Add `hello@theforgelab.in`
- Use Cloudflare's SMTP relay or Gmail's "Send As" feature
- [Gmail Send As Guide](https://support.google.com/mail/answer/22370)

---

### Option 2: Hostinger Email Hosting (Easiest Integration)

**Cost**: ₹59-₹149/month (~$0.70-$1.80/month)

**Best for**:
- Need full mailbox (not just forwarding)
- Want everything in one dashboard (domain + email)
- Prefer automatic DNS configuration
- Need multiple email addresses

**Features**:
- Full IMAP/POP3 mailbox
- Webmail access (`webmail.hostinger.com`)
- Mobile app support (iOS/Android)
- Spam filtering and antivirus
- 10GB-100GB storage (depending on plan)

**Advantages**:
- ✅ Domain already at Hostinger → automatic DNS setup
- ✅ Single dashboard for domain and email
- ✅ No DNS migration needed
- ✅ Works alongside GitHub Pages hosting

**Setup Steps**:

1. **Log into Hostinger**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Log in with your credentials

2. **Purchase Email Hosting**
   - Navigate to "Emails" section
   - Select "Email Hosting" plan
   - Choose plan tier (Starter ₹59/mo is usually sufficient)
   - Complete purchase

3. **Create Email Account**
   - Go to Emails → Create Email Account
   - Username: `hello`
   - Domain: `theforgelab.in`
   - Set password
   - Click Create

4. **Access Your Email**
   - Webmail: `webmail.hostinger.com`
   - Or configure in email client:
     - IMAP: `imap.hostinger.com` (Port 993, SSL)
     - SMTP: `smtp.hostinger.com` (Port 465, SSL)

5. **Test**
   - Send test email to `hello@theforgelab.in`
   - Check webmail or email client
   - Submit contact form to verify FormSubmit delivery

**Email Client Setup** (Outlook, Thunderbird, iOS Mail, Android):
```
Incoming (IMAP):
Server: imap.hostinger.com
Port: 993
Security: SSL/TLS
Username: hello@theforgelab.in
Password: [your password]

Outgoing (SMTP):
Server: smtp.hostinger.com
Port: 465
Security: SSL/TLS
Username: hello@theforgelab.in
Password: [your password]
```

---

### Option 3: Google Workspace (Most Professional)

**Cost**: ₹125-₹672/month ($1.50-$8/month per user)

**Best for**:
- Growing teams (multiple users)
- Need professional business tools
- Want Gmail interface and reliability
- Plan to use Google Drive, Calendar, Meet

**Features**:
- Full Gmail interface and apps
- 30GB-5TB storage per user
- Google Drive, Docs, Sheets included
- Google Calendar and Meet (video conferencing)
- 99.9% uptime SLA
- Advanced spam protection
- Mobile apps (iOS/Android)

**Plans**:
- **Business Starter**: ₹125/user/mo (30GB storage)
- **Business Standard**: ₹672/user/mo (2TB storage + more features)

**Setup Steps**:

1. **Sign Up for Google Workspace**
   - Go to [workspace.google.com](https://workspace.google.com)
   - Click "Get Started"
   - Enter business details and domain name

2. **Verify Domain Ownership**
   - Google provides a TXT record
   - Add to DNS at Hostinger:
     - Type: TXT
     - Name: @ (or leave blank)
     - Value: [provided by Google]
   - Click "Verify" in Google Workspace

3. **Configure MX Records at Hostinger**
   - Google provides 5 MX records
   - Log into Hostinger DNS management
   - Delete existing MX records (if any)
   - Add Google's MX records:
     ```
     Priority 1:  ASPMX.L.GOOGLE.COM
     Priority 5:  ALT1.ASPMX.L.GOOGLE.COM
     Priority 5:  ALT2.ASPMX.L.GOOGLE.COM
     Priority 10: ALT3.ASPMX.L.GOOGLE.COM
     Priority 10: ALT4.ASPMX.L.GOOGLE.COM
     ```

4. **Create User Account**
   - In Google Workspace admin
   - Create user: `hello@theforgelab.in`
   - Set password
   - Access at [gmail.com](https://gmail.com)

5. **Test**
   - Send test email to `hello@theforgelab.in`
   - Check Gmail inbox
   - Submit contact form to verify FormSubmit delivery

**Additional Features to Enable**:
- Gmail mobile app
- Google Calendar sync
- Google Drive (shared team storage)
- Google Meet (video calls)

---

### Option 4: Microsoft 365 Business

**Cost**: ₹420-₹1,030/month ($5-$12.50/month per user)

**Best for**:
- Prefer Outlook over Gmail
- Need Office apps (Word, Excel, PowerPoint)
- Use Microsoft ecosystem (Teams, OneDrive)

**Features**:
- Outlook email client (web + desktop)
- Office 365 apps (Word, Excel, PowerPoint, etc.)
- OneDrive storage (1TB per user)
- Microsoft Teams for collaboration
- Advanced security features

**Setup**: Similar to Google Workspace
1. Sign up at [microsoft.com/microsoft-365/business](https://www.microsoft.com/microsoft-365/business)
2. Verify domain ownership (TXT record)
3. Configure MX records at Hostinger
4. Create users and access via Outlook

---

## Comparison Table

| Feature | Cloudflare Email | Hostinger Email | Google Workspace | Microsoft 365 |
|---------|------------------|-----------------|------------------|---------------|
| **Cost** | FREE | ₹59-149/mo | ₹125-672/mo | ₹420-1,030/mo |
| **Setup Difficulty** | Medium | Easy | Medium | Medium |
| **Full Mailbox** | ❌ (forwarding only) | ✅ | ✅ | ✅ |
| **Storage** | N/A | 10-100GB | 30GB-5TB | 50GB-1TB |
| **Webmail** | ❌ | ✅ | ✅ (Gmail) | ✅ (Outlook) |
| **Mobile Apps** | Via forwarded account | ✅ | ✅ | ✅ |
| **Multiple Users** | ✅ (unlimited aliases) | ✅ (paid per user) | ✅ (paid per user) | ✅ (paid per user) |
| **Business Tools** | ❌ | ❌ | ✅ (Drive, Calendar, Meet) | ✅ (Office, Teams, OneDrive) |
| **DNS Migration** | ✅ Required | ❌ Not required | ❌ Not required | ❌ Not required |
| **Spam Protection** | ✅ | ✅ | ✅ Advanced | ✅ Advanced |
| **Best For** | Solo/Startup | Small teams, budget | Growing business | Office ecosystem users |

---

## Recommended Path

### Immediate (Right Now): Cloudflare Email Routing
**Why**: 
- Zero cost
- Works perfectly with FormSubmit contact form
- Set up in 10-30 minutes
- Upgrade later when needed

**Action**:
1. Create Cloudflare account
2. Add domain and move nameservers
3. Enable Email Routing
4. Forward `hello@theforgelab.in` to personal Gmail/Outlook

### Short-term (Next 1-3 months): Evaluate Need
**Questions to ask**:
- Are you getting enough contact form submissions to need dedicated inbox?
- Do you need to send emails FROM `hello@theforgelab.in` regularly?
- Are you adding team members who need their own emails?

### Long-term (Growth Phase): Google Workspace or Hostinger
**When to upgrade**:
- Multiple team members need email addresses
- Need professional email client and tools
- Sending/receiving higher volume of emails
- Want integrated calendar, storage, and collaboration tools

**Recommendation**:
- **Small team, budget-conscious**: Hostinger Email (₹59/mo)
- **Growing business, professional tools**: Google Workspace (₹125+/mo)

---

## FormSubmit Integration

Your contact form is already configured to send to `hello@theforgelab.in`. Once you set up email hosting:

### First Submission (Activation)
1. User submits contact form
2. FormSubmit redirects to activation page
3. Check inbox for activation email from FormSubmit
4. Click activation link

### Subsequent Submissions
1. User submits contact form
2. FormSubmit sends email directly to `hello@theforgelab.in`
3. Email arrives in your inbox (forwarded or direct mailbox)
4. Reply to customer from your email client

**FormSubmit will work with ANY email option** (forwarding or full mailbox).

---

## DNS Records Reference

Depending on your choice, you'll need to configure these DNS records at Hostinger (or Cloudflare if using Option 1):

### For Cloudflare Email Routing
```
Type: MX
Name: @
Priority: [Cloudflare provides]
Value: [Cloudflare provides]

Type: TXT
Name: @
Value: v=spf1 include:_spf.mx.cloudflare.net ~all
```

### For Hostinger Email
```
Type: MX
Name: @
Priority: 10
Value: mx1.hostinger.com

Type: MX
Name: @
Priority: 20
Value: mx2.hostinger.com

Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all
```
*Note: Hostinger usually configures these automatically*

### For Google Workspace
```
Type: MX (Priority 1)
Value: ASPMX.L.GOOGLE.COM

Type: MX (Priority 5)
Value: ALT1.ASPMX.L.GOOGLE.COM

Type: MX (Priority 5)
Value: ALT2.ASPMX.L.GOOGLE.COM

Type: MX (Priority 10)
Value: ALT3.ASPMX.L.GOOGLE.COM

Type: MX (Priority 10)
Value: ALT4.ASPMX.L.GOOGLE.COM

Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

---

## Security Best Practices

Regardless of which option you choose:

1. **Enable Two-Factor Authentication (2FA)**
   - Protects against password theft
   - Available on all major email providers

2. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Use password manager (1Password, LastPass, Bitwarden)

3. **Configure SPF, DKIM, DMARC**
   - Prevents email spoofing
   - Improves deliverability
   - Most providers set these up automatically

4. **Monitor for Spam**
   - Regularly check spam folder
   - Mark legitimate emails as "Not Spam"
   - Report phishing attempts

5. **Regular Backups**
   - Export important emails periodically
   - Use email client with local storage (Outlook, Thunderbird)

---

## Troubleshooting

### Email Not Receiving
1. Check DNS propagation (24-48 hours after changes)
2. Verify MX records at [mxtoolbox.com](https://mxtoolbox.com)
3. Check spam folder
4. Verify email account is active
5. Test with direct email (not just contact form)

### FormSubmit Activation Email Not Arriving
1. Check spam/junk folder
2. Verify email is set up correctly
3. Wait 5-10 minutes (can be delayed)
4. Try submitting form again
5. Check FormSubmit status page

### Can't Send Email FROM hello@theforgelab.in
1. Verify SMTP settings (server, port, SSL)
2. Check username/password are correct
3. Enable "Less Secure Apps" if using Gmail forwarding
4. Configure "Send As" in Gmail settings
5. Check SPF/DKIM records are set up

### DNS Changes Not Taking Effect
1. DNS propagation can take 24-48 hours
2. Check current DNS: [whatsmydns.net](https://whatsmydns.net)
3. Clear local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
4. Try from different network/device
5. Contact registrar support if stuck

---

## Next Steps

1. **Choose your email option** based on budget and needs
2. **Follow setup steps** for your chosen option
3. **Activate FormSubmit** by submitting test contact form
4. **Test email delivery** by sending test emails
5. **Configure email client** (mobile/desktop) for easy access
6. **Update team documentation** with email access info

---

## Support Resources

### Cloudflare
- Docs: [developers.cloudflare.com/email-routing](https://developers.cloudflare.com/email-routing/)
- Support: [community.cloudflare.com](https://community.cloudflare.com)

### Hostinger
- Email Docs: [support.hostinger.com/en/collections/email](https://support.hostinger.com/en/collections/email)
- Support: Live chat in hPanel
- Phone: Available in India

### Google Workspace
- Setup Guide: [support.google.com/a/answer/6348666](https://support.google.com/a/answer/6348666)
- Admin Console: [admin.google.com](https://admin.google.com)
- Support: 24/7 for paid plans

### FormSubmit
- Docs: [formsubmit.co](https://formsubmit.co)
- FAQ: Available on homepage
- No direct support (service is free)

---

## Conclusion

For ForgeLab's current needs (single contact form, early stage), **Cloudflare Email Routing (FREE)** is the best starting point. It provides:

✅ Zero cost  
✅ Quick setup  
✅ Works perfectly with FormSubmit  
✅ Easy to upgrade later  

When you grow and need dedicated mailboxes or team accounts, upgrade to **Hostinger Email** (affordable) or **Google Workspace** (most professional).

---

**Questions or need help with setup?** Refer to the support resources above or reach out to your domain registrar (Hostinger) for DNS assistance.

