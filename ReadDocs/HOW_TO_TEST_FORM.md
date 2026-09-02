# How to Test the Contact Form

## The Issue You Experienced

You saw this error: **"Unable to submit form - Make sure you open this page through a web server"**

This happened because you opened the HTML file directly (`file://` protocol), but FormSubmit requires the page to be served through HTTP (`http://` protocol) for security reasons.

## Solution: Access via Local Server

Since a server is already running on port 5500, simply:

1. **Open your browser**
2. **Navigate to:** `http://localhost:5500/`
3. **Scroll to the Contact section**
4. **Fill out and submit the form**

## It Should Work Now!

When you submit through `http://localhost:5500/`, FormSubmit will:
- Accept the submission
- Send a confirmation email to `hello@theforgelab.in` (first time only)
- After you click the activation link in that email, all future submissions will be forwarded automatically

## Next Steps

1. ✅ Test form at `http://localhost:5500/`
2. ✅ Check email for FormSubmit activation link
3. ✅ Click activation link
4. ✅ Form is now live and ready!

## Why This Matters

- **Direct file access** (`file://`) = Browser security blocks form submissions
- **HTTP server access** (`http://localhost:5500/`) = Form submissions work properly

This is standard for all modern form services (FormSubmit, Formspree, Web3Forms, etc.).
