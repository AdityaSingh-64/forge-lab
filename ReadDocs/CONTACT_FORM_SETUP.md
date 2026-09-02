# Contact Form Setup

## Quick Start

1. **Start the local server:**
   ```bash
   node server.js
   ```

2. **Open in browser:**
   ```
   http://localhost:5500/
   ```

3. **Test the contact form** - Navigate to the Contact section and submit

## ⚠️ Important: FormSubmit Requires a Web Server

FormSubmit **will NOT work** when opening files directly (`file://` protocol). You **must** use a web server:

- ✅ **WORKS:** `http://localhost:5500/`
- ❌ **FAILS:** `file:///C:/Code/ForgeLabs/forge-lab/index.html`

This is a security requirement of modern form submission services.

## First-Time Activation

The first time someone submits the form, FormSubmit will send a **confirmation email** to `hello@theforgelab.in`. 

### Steps:
1. Submit a test message through `http://localhost:5500/`
2. Check `hello@theforgelab.in` inbox
3. Look for an email from FormSubmit
4. Click the activation link
5. Form is now active permanently

## How It Works

1. **User fills out the form** with their name, email, and message
2. **Form submits via HTTP POST** to `https://formsubmit.co/hello@theforgelab.in`
3. **FormSubmit forwards the email** to your inbox
4. **No "Open with" dialogs** - works seamlessly in all browsers

## Features Configured

- ✅ **No CAPTCHA** - Better UX, honeypot spam protection instead
- ✅ **Custom subject line** - "New Contact from ForgeLab Website"
- ✅ **Box template** - Clean, formatted email layout
- ✅ **Honeypot field** - Hidden `_honey` field catches spam bots
- ✅ **No redirect** - Uses FormSubmit's default success page

## Deployment

When you deploy to a real hosting service (Netlify, Vercel, GitHub Pages, etc.), the form will work automatically at your production URL (e.g., `https://theforgelab.in`).

## Local Development Servers

### Option 1: Node.js (Built-in)
```bash
node server.js
# Server runs at http://localhost:5500/
```

### Option 2: VS Code Live Server Extension
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"
3. Opens at `http://127.0.0.1:5500/`

### Option 3: Python (if installed)
```bash
python -m http.server 8080
# Server runs at http://localhost:8080/
```

## Optional Enhancements

Add these hidden fields to customize behavior:

```html
<!-- Redirect to your own thank-you page -->
<input type="hidden" name="_next" value="https://theforgelab.in/thank-you.html">

<!-- Send a copy to a second email -->
<input type="hidden" name="_cc" value="second@email.com">

<!-- Disable reCAPTCHA (already done) -->
<input type="hidden" name="_captcha" value="false">
```

## Advantages Over mailto:

| mailto: (old) | FormSubmit (new) |
|---------------|------------------|
| Opens "Open with" dialog | Works directly in browser |
| Requires email client | No software needed |
| Exposes user's default email | Privacy-friendly |
| Unreliable on mobile | Works everywhere |
| No submission tracking | Reliable delivery |

## Cost & Privacy

- **FREE** - No limits, no signup required
- **Privacy-friendly** - FormSubmit doesn't store messages, they're forwarded immediately

## Alternative Services

If you need to switch:
- **Web3Forms** - https://web3forms.com (requires API key)
- **Formspree** - https://formspree.io (50 submissions/month free)
- **Basin** - https://usebasin.com (100 submissions/month free)
- **Netlify Forms** - Built-in if you deploy on Netlify

## Troubleshooting

### "Unable to submit form" error
- **Cause:** Opening file directly (`file://` protocol)
- **Fix:** Use `http://localhost:5500/` instead

### Port 5500 already in use
- **Cause:** Server already running or port occupied
- **Fix:** Stop existing server or use different port in `server.js`

### Email not received
- **Cause:** Email not activated yet
- **Fix:** Check spam folder, wait for activation email, click link

