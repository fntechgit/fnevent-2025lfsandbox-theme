# Deployment Configuration

## Required Environment Variables

### GATSBY_PARTYTOWN_PROXY_URL

This environment variable is required for Gatsby's internal Partytown plugin to function correctly during the build process.

**Value**: `http://localhost/~partytown/`

**Why it's needed**: Gatsby 5.x includes Partytown as an internal plugin for optimizing third-party scripts. The plugin requires a valid proxy URL to be configured, otherwise the build will fail with an "Invalid URL" error.

## Setting Environment Variables

### For Heroku

Set the environment variable using the Heroku CLI:

```bash
heroku config:set GATSBY_PARTYTOWN_PROXY_URL=http://localhost/~partytown/
```

Or via the Heroku Dashboard:
1. Go to your app's Settings tab
2. Click "Reveal Config Vars"
3. Add a new config var:
   - KEY: `GATSBY_PARTYTOWN_PROXY_URL`
   - VALUE: `http://localhost/~partytown/`

### For Netlify

Add to your `netlify.toml`:

```toml
[build.environment]
  GATSBY_PARTYTOWN_PROXY_URL = "http://localhost/~partytown/"
```

Or set in Netlify UI:
1. Go to Site Settings > Build & deploy > Environment
2. Add environment variable

### For Local Development

Copy `.env.production.example` to `.env.production`:

```bash
cp .env.production.example .env.production
```

## Other Known Issues

### Sharp Module

If you encounter errors with the `sharp` module during build, this is typically due to network restrictions in the build environment preventing the download of native binaries. This is an environment-specific issue that may need to be resolved with your hosting provider.
