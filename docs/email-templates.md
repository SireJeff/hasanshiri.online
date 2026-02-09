# Supabase Auth Email Templates

Ready-to-use email templates for Mailtrap + Supabase Auth.

**Design Features:**
- Purple gradient theme matching your portfolio
- Responsive design (works on mobile)
- Inline styles for maximum email client compatibility
- 600px max width for optimal display

---

## How to Use These Templates

### Recommended: Paste Directly into Supabase (No Mailtrap Templates Needed)

1. Go to **Supabase** → **Auth** → **Templates**
2. Select the template type (e.g., "Confirm signup")
3. Click **"Use custom template"**
4. Copy the **Subject** line and **HTML** code below
5. Paste into Supabase's template editor
6. Save

**Note:** Supabase will automatically replace `{{ .ConfirmationURL }}` and other variables with the actual values when sending emails.

### Alternative: Using Mailtrap Templates

If you want to use Mailtrap's template feature, you need to escape the Supabase variables. Change:
- `{{ .ConfirmationURL }}` → `{{ "{{" }} .ConfirmationURL {{ "}}" }}`
- `{{ .Email }}` → `{{ "{{" }} .Email {{ "}}" }}`

**However, the direct Supabase method above is simpler and recommended.**

---

## Template 1: Confirm Sign Up

**Subject:** `Confirm your email address`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Confirm Your Email</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">Welcome to <strong>Hasan Shiri Portfolio</strong>! We're excited to have you on board.</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">Please click the button below to confirm your email address and complete your registration:</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Confirm Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 2: Invite User

**Subject:** `You're invited to join Hasan Shiri Portfolio`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">You're Invited!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">You've been invited to join <strong>Hasan Shiri Portfolio</strong> as a collaborator.</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">Click the button below to accept the invitation and create your account:</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">This invitation will expire in 7 days.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 3: Magic Link (Passwordless Sign In)

**Subject:** `Your sign-in link for Hasan Shiri Portfolio`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Sign In to Your Account</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">Welcome back! Click the button below to sign in to <strong>Hasan Shiri Portfolio</strong>.</p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 14px; line-height: 1.6;">🔒 This is a secure one-time link that will expire in 1 hour.</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Sign In</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">If you didn't request this link, you can safely ignore this email.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 4: Change Email Address

**Subject:** `Confirm your new email address`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm New Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Confirm Your New Email</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">You're changing the email address associated with your <strong>Hasan Shiri Portfolio</strong> account to:</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;"><strong style="color: #667eea; font-size: 18px;">{{ .Email }}</strong></p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">Please click the button below to confirm this change:</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Confirm New Email</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">If you didn't request this change, please contact support immediately.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 5: Reset Password

**Subject:** `Reset your password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your <strong>Hasan Shiri Portfolio</strong> account.</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">Click the button below to create a new password:</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">⏱️ This link will expire in 1 hour for your security.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Template 6: Reauthentication

**Subject:** `Confirm your identity`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Identity</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Confirm Your Identity</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">You're performing a sensitive action on <strong>Hasan Shiri Portfolio</strong> that requires verification.</p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">For your security, please confirm your identity by clicking the button below:</p>
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">Confirm Identity</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">Or copy and paste this link into your browser:<br><a href="{{ .ConfirmationURL }}" style="color: #667eea; word-break: break-all;">{{ .ConfirmationURL }}</a></p>
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">⏱️ This link will expire in 1 hour for your security.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center;">If you didn't initiate this action, please secure your account immediately.</p>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 13px; text-align: center;">© 2025 Hasan Shiri Portfolio. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Quick Reference

| Template | Purpose | Supabase Variable |
|----------|---------|-------------------|
| Confirm Signup | Email verification after registration | `{{ .ConfirmationURL }}` |
| Invite User | Send invitation to new users | `{{ .ConfirmationURL }}` |
| Magic Link | Passwordless sign-in | `{{ .ConfirmationURL }}` |
| Change Email | Verify new email address | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Reset Password | Password reset link | `{{ .ConfirmationURL }}` |
| Reauthentication | Verify sensitive actions | `{{ .ConfirmationURL }}` |

---

## Connecting to Supabase

### Direct Paste Method (Recommended - No Parsing Errors)

1. Go to **Supabase** → **Auth** → **Templates** (https://supabase.com/dashboard/project/onmoggkvfptemrriaqal/auth/templates)
2. Select a template type (Confirm signup, Invite user, Magic link, etc.)
3. Click **"Use custom template"**
4. Copy the **Subject** from this document
5. Copy the **HTML** code block
6. Paste both into Supabase's template editor
7. Click **Save**
8. Repeat for each template type

**Why this works:** Supabase natively supports the `{{ .ConfirmationURL }}` syntax and will replace it with the actual URL when sending emails through your SMTP provider (Mailtrap).

---

## Notes

- All templates use the purple gradient (`#667eea` to `#764ba2`) matching your portfolio
- Responsive design works on mobile and desktop
- Inline styles ensure compatibility with all email clients
- Each template includes fallback link in case CTA button doesn't work
- Footer includes security notices where appropriate

---

## Troubleshooting

**Error: "Parse error" or "Expecting ID, got SEP"**
- This happens when pasting into Mailtrap's template editor
- Solution: Paste templates directly into Supabase instead (see "Connecting to Supabase" above)
- Supabase will handle the `{{ .ConfirmationURL }}` variable replacement

- All templates use the purple gradient (`#667eea` to `#764ba2`) matching your portfolio
- Responsive design works on mobile and desktop
- Inline styles ensure compatibility with all email clients
- Each template includes fallback link in case CTA button doesn't work
- Footer includes security notices where appropriate
