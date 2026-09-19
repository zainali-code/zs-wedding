# Free Backend + Google Drive Setup

This project is designed for a zero-paid-infrastructure wedding deployment on Vercel Hobby or Netlify Free.

## Request flow

1. Guest enters an email on `/upload`.
2. `/api/upload-init` issues a short-lived signed session token.
3. `/api/upload/session` authenticates to Google with the Service Account and opens a Google Drive resumable-upload session.
4. The browser uploads the photo/video directly to Google's resumable upload URL. Large files do **not** pass through Vercel or Netlify.
5. `/api/upload/complete` records the upload metadata in the private Google Sheet.

## Google Service Account

Enable these APIs in the Google Cloud project:

- Google Drive API
- Google Sheets API

Create a Service Account and keep its JSON key private. Only copy its `client_email` and `private_key` values into your hosting environment variables.

### Drive destination

A service account does not have normal personal Google Drive storage quota. Use one of these two modes:

**Mode A — Google Workspace Shared Drive (recommended)**

- Put the destination folder inside a Shared Drive.
- Add the service account as a Content manager/member of that Shared Drive.
- Set `GOOGLE_DRIVE_PARENT_FOLDER_ID` to the folder ID.
- Leave `GOOGLE_IMPERSONATED_USER_EMAIL` empty.

**Mode B — Domain-Wide Delegation**

- Enable Domain-Wide Delegation for the service account in Google Cloud.
- Ask the Google Workspace administrator to authorize the Drive and Sheets scopes for the service account client ID.
- Set `GOOGLE_IMPERSONATED_USER_EMAIL` to the Workspace user to impersonate.

A personal `@gmail.com` My Drive folder is not suitable for a service-account-only upload flow. For personal Gmail, use user OAuth instead.

## Google Sheet datastore

Create a private spreadsheet with two tabs:

### `Guests`

`timestamp | email | session_id | ip_hash`

### `Uploads`

`timestamp | session_id | email | file_name | mime_type | size_bytes | drive_file_id | status`

Share the sheet with the Service Account as Editor and set `GOOGLE_SHEETS_ID`.

## Environment variables

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_IMPERSONATED_USER_EMAIL=
GOOGLE_DRIVE_PARENT_FOLDER_ID=...
GOOGLE_SHEETS_ID=...
UPLOAD_TOKEN_SECRET=...
SITE_URL=https://your-domain.example
```

Generate `UPLOAD_TOKEN_SECRET` locally with:

```bash
openssl rand -hex 32
```

## Vercel

Use Vercel for the simplest Next.js deployment:

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add all environment variables under **Project -> Settings -> Environment Variables**.
4. Deploy.
5. Set `SITE_URL` to the final production URL and redeploy.

## Netlify

The same Next.js project can run on Netlify Free. Add the same environment variables in the site configuration. The direct-to-Google upload design is retained so large photos/videos do not hit serverless request-body limits.

## Why this stays free

- Static site assets/CDN: Vercel Hobby or Netlify Free.
- API layer: small serverless metadata requests only.
- File bytes: direct browser-to-Google Drive upload.
- Database: Google Sheet for this small workload.
- Google Drive/Sheets APIs: no separate server required.

Free plans are quota-limited. Monitor hosting usage and Google Drive storage before the wedding, especially if guests may upload many large videos.
