# AWS CI/CD Deployment Guide

This document describes how the GitHub Actions → S3 + CloudFront deployment pipeline is set up for this project.

---

## Architecture

```
Browser → CloudFront (HTTPS, CDN, custom domain) → S3 (private bucket)
DNS (Hover) → CloudFront domain
GitHub Actions → builds app → syncs dist/ to S3 → invalidates CloudFront cache
```

**Why not use S3 static website hosting directly?**
Directly exposing an S3 bucket as a static website is the old approach. It doesn't support HTTPS and is considered poor practice. The correct modern approach is a *private* S3 bucket fronted by CloudFront, which handles HTTPS, caching, and custom domains.

---

## Step 1 — S3 Bucket

1. Go to **S3 → Create bucket**
2. Name it (e.g. `fringe-frets-app`) — it does not need to match your domain name
3. Choose a region (this project uses `us-east-1`)
4. **Block all public access**: leave this **ON** — CloudFront will access the bucket privately
5. Do **not** enable "Static website hosting" — CloudFront handles routing
6. Click **Create bucket**

> **Note:** The bucket will be empty at this point. The first GitHub Actions deploy will populate it. S3 returns `403 AccessDenied` (not 404) when a private bucket has no matching object, so visiting the site before the first deploy produces a confusing error — this is normal.

---

## Step 2 — ACM TLS Certificate

> **Critical:** You must create this certificate in the **us-east-1** region, even if your bucket is in another region. CloudFront only reads ACM certificates from `us-east-1`.

1. In the AWS console, switch your region to **US East (N. Virginia) / us-east-1**
2. Go to **Certificate Manager (ACM) → Request a certificate → Request a public certificate**
3. Add your domain names, e.g.:
   - `frets.fourfringe.com`
4. Choose **DNS validation** and click **Request**
5. Open the certificate and expand the domain — AWS shows you a CNAME record to add to your DNS to prove ownership

### Adding the CNAME in Hover

Hover's DNS editor asks for a **Hostname** and a **Target Name**. AWS gives you a name and a value, both of which include your full domain. Strip the domain and the trailing dot from the **name** to get the Hostname.

**Example:** AWS gives you:
```
name  = _fdece2996db99b804b880d2fb9a1fddd.frets.fourfringe.com.
value = _9bfab72a058cdea45b96afad23b448da.jkddzztszm.acm-validations.aws.
```

In Hover, enter:
- **Hostname**: `_fdece2996db99b804b880d2fb9a1fddd.frets`  ← strip `.fourfringe.com.` from the end
- **Target Name**: `_9bfab72a058cdea45b96afad23b448da.jkddzztszm.acm-validations.aws`  ← drop the trailing dot

ACM polls for this record and flips the certificate to **Issued** within a few minutes.

---

## Step 3 — CloudFront Distribution

1. Go to **CloudFront → Create distribution**
2. **Origin domain**: click the field and select your S3 bucket from the dropdown (the entry ending in `.s3.amazonaws.com`, *not* the website endpoint ending in `.s3-website-...amazonaws.com`)
3. **Origin access**: select **Origin access control settings (recommended)**
   - Click **Create new OAC**, accept defaults, click **Create**
4. **Alternate domain names (CNAMEs)**: add `frets.fourfringe.com`
5. Click **Create distribution**


### Apply the S3 bucket policy

After creating the distribution, CloudFront generates a bucket policy that grants it private read access to S3. You need to copy this and apply it to your bucket.

To find it:
1. Go to **CloudFront → your distribution → Origins tab**
2. Select your origin's radio button → click **Edit**
3. Scroll down to the **Origin access** section — there will be a blue banner with a **Copy policy** button
4. Click **Copy policy**
5. Go to **S3 → your bucket → Permissions → Bucket policy → Edit**
6. Paste the policy and save

The policy looks like this (it is named `PolicyForCloudFrontPrivateContent` by AWS):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

### Configure error pages for React Router

Because this is a React single-page app (client-side routing), any URL that isn't the root will return a 403 or 404 from S3 — which would break direct links and page refreshes. Fix this by returning `index.html` for all errors:

1. Go to **CloudFront → your distribution → Error pages tab → Create custom error response**
2. Add two entries:

| HTTP error code | Response page path | HTTP response code |
|---|---|---|
| `403` | `/index.html` | `200` |
| `404` | `/index.html` | `200` |

---

## Step 4 — DNS (Hover)

1. Log in to Hover → **DNS** for your domain
2. Add a **CNAME** record:
   - **Hostname**: `frets`
   - **Target Name**: your CloudFront domain, e.g. `d1234abcd.cloudfront.net`
3. DNS propagation can take a few minutes to an hour

---

## Step 5 — IAM Role for GitHub Actions (OIDC)

The GitHub Actions workflow authenticates to AWS using **OIDC** — this means no long-lived AWS access keys are stored in GitHub. Instead, GitHub exchanges a short-lived token for temporary AWS credentials at deploy time.

### 5a — Add GitHub as an OIDC Identity Provider

This is a one-time setup per AWS account.

1. Go to **IAM → Identity providers → Add provider**
2. Provider type: **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com` → click **Get thumbprint**
4. Audience: `sts.amazonaws.com`
5. Click **Add provider**

### 5b — Create the IAM Policy

1. Go to **IAM → Policies → Create policy**
2. Select the **JSON** editor and paste the following (replace the placeholders):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
    }
  ]
}
```

3. Click **Next**, give it a name like `fringe-frets-deploy-policy`, and click **Create policy**

### 5c — Create the IAM Role

1. Go to **IAM → Roles → Create role**
2. Trusted entity type: **Web identity**
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Next** to reach the **Add permissions** step
6. Search for your policy by name — **important:** the search defaults to showing only AWS managed policies. Change the filter dropdown from **AWS managed** to **Customer managed** to see policies you created yourself. Then select your policy.
7. Click **Next**, name the role `github-fringe-frets-deploy`, and click **Create role**

### 5d — Restrict the trust policy to this repository

After creating the role, click into it and select the **Trust relationships** tab → **Edit trust policy**. Replace the contents with:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR-ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR-GITHUB-USERNAME/fringe-frets:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

This ensures only the `main` branch of this specific repository can assume the role.

Copy the **Role ARN** from the role's summary page — you'll need it in the next step.

---

## Step 6 — GitHub Repository Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** and add these four secrets:

| Secret name | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | The Role ARN from Step 5, e.g. `arn:aws:iam::123456789:role/github-fringe-frets-deploy` |
| `AWS_REGION` | The region your bucket is in, e.g. `us-east-1` |
| `S3_BUCKET_NAME` | The bucket name, e.g. `fringe-frets-app` |
| `CLOUDFRONT_DISTRIBUTION_ID` | From the CloudFront console, e.g. `E1A2B3C4D5EFGH` |

---

## How the GitHub Actions Workflow Operates

The workflow lives at `.github/workflows/deploy.yml` and runs on every push to `main` (or manually via the GitHub Actions UI).

1. **Test job**: runs TypeScript type checking, ESLint, and Vitest unit tests
2. **Deploy job** (only runs if tests pass, only on `main`):
   - Builds the app with `yarn build` → outputs to `dist/`
   - Authenticates to AWS via OIDC (no stored keys)
   - Syncs `dist/` to S3:
     - Hashed asset files (JS, CSS) get a 1-year immutable cache header
     - `index.html` gets a no-cache header so browsers always fetch the latest
     - Files deleted locally are deleted from S3 (`--delete`)
   - Creates a CloudFront invalidation so users get the new version immediately

---

## Troubleshooting

**`AccessDenied` XML error when visiting the site**
- The bucket may be empty — this happens before the first successful deploy. Run the workflow or upload a file manually to confirm.
- The S3 bucket policy may not have been applied. Check **S3 → Permissions → Bucket policy** — it should contain `PolicyForCloudFrontPrivateContent` with your distribution's ARN in the condition.
- The CloudFront origin URL may be wrong. It must end in `.s3.REGION.amazonaws.com`, not `.s3-website-REGION.amazonaws.com`.
- Verify the OAC is set to **Sign requests** in the CloudFront origin settings.

**Certificate stuck in "Pending validation"**
- The DNS CNAME was not entered correctly. Remember to strip the domain suffix from the Hostname field in Hover (e.g. use `_abc123.frets`, not `_abc123.frets.fourfringe.com`).

**Custom policy missing from "Add permissions" during role creation**
- The filter defaults to **AWS managed** policies. Change the dropdown to **Customer managed** to see policies you created yourself.

**Deep links return errors after deploy**
- The CloudFront custom error pages for `403` and `404` were not configured. Add them both, pointing to `/index.html` with HTTP response code `200`.
