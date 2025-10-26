# Deployment Configuration

## Environment Variables

### GATSBY_PARTYTOWN_PROXY_URL (Optional)

This environment variable is used by Gatsby's internal Partytown plugin for optimizing third-party scripts.

**Default Value**: `http://localhost/~partytown/` (automatically set in `gatsby-config.js`)

**Why it exists**: Gatsby 5.x includes Partytown as an internal plugin. A default value is now configured in `gatsby-config.js`, so the build will work out of the box without any manual configuration.

**When to override**: You only need to set this environment variable if you want to use a different proxy URL than the default.

## Setting Environment Variables (Optional)

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

No configuration needed! The default value in `gatsby-config.js` will be used automatically.

If you want to override the default, create a `.env.production` file:

```bash
cp .env.production.example .env.production
# Then edit .env.production with your custom value
```

## Other Known Issues

### Sharp Module

If you encounter errors with the `sharp` module during build, this is typically due to network restrictions in the build environment preventing the download of native binaries. This is an environment-specific issue that may need to be resolved with your hosting provider.
