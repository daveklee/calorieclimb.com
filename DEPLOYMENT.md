# 🚀 Secure Deployment Guide for Calorie Climb

This guide explains how to securely deploy Calorie Climb with proper API key management using Supabase Edge Functions as secure proxies.

## 🔐 Security Architecture

**Problem**: Vite environment variables with `VITE_` prefix are exposed in the client bundle, making API keys visible to anyone.

**Solution**: Use Supabase Edge Functions as secure server-side proxies that keep API keys completely hidden from the client.

### Architecture Overview

```
Client App → Supabase Edge Functions → External APIs (USDA, Perplexity)
```

- ✅ **API keys stored securely** in Supabase Edge Functions (server-side)
- ✅ **No API keys in client code** or environment variables
- ✅ **Rate limiting and filtering** can be implemented server-side
- ✅ **CORS handling** built into Edge Functions

## 🚀 Deployment Steps

### Step 1: Set Up Supabase Project

1. **Create a Supabase account** at [supabase.com](https://supabase.com)

2. **Create a new project**:
   - Choose a project name
   - Set a database password
   - Select a region

3. **Get your project credentials**:
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

### Step 2: Configure Edge Functions

1. **Set up API keys in Supabase**:
   - Go to Settings → Edge Functions
   - Add environment variables:
     - `USDA_API_KEY`: Your USDA Food Data Central API key
     - `PERPLEXITY_API_KEY`: Your Perplexity AI API key

2. **Deploy the Edge Functions** (already included in the project):
   - `supabase/functions/usda-proxy/`: Proxies USDA API calls
   - `supabase/functions/perplexity-proxy/`: Proxies Perplexity AI calls

### Step 3: Configure Your App

1. **Set up local environment**:
   ```bash
   cp .env.example .env
   ```

2. **Add Supabase credentials to `.env`**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Step 4: Deploy to Netlify

1. **Connect repository to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Set environment variables in Netlify**:
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `VITE_GA_MEASUREMENT_ID`: Your Google Analytics ID (optional)

3. **Deploy your site**:
   - Build command: `npm run build`
   - Publish directory: `dist`

## 🔑 Getting API Keys

### USDA Food Data Central API Key (Free)

1. Visit [USDA Food Data Central API Guide](https://fdc.nal.usda.gov/api-guide.html)
2. Click "Get an API Key"
3. Fill out the registration form
4. Check your email for the API key
5. **Add to Supabase Edge Functions environment variables**

### Perplexity AI API Key (Paid)

1. Visit [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Go to API settings
4. Generate an API key
5. **Add to Supabase Edge Functions environment variables**

### Google Analytics 4 Measurement ID (Free)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Get your Measurement ID (format: G-XXXXXXXXXX)
4. **Add to Netlify environment variables** (this one is safe to expose)

## 🛡️ Security Benefits

### ✅ What's Secure Now:
- **API keys never exposed** to client-side code
- **Server-side rate limiting** and filtering possible
- **CORS protection** built into Edge Functions
- **Audit trail** of API usage in Supabase logs
- **Easy key rotation** without code changes

### ✅ What's Safe to Expose:
- **Supabase URL and anon key**: Designed to be public
- **Google Analytics ID**: Meant to be public
- **All other app configuration**: No sensitive data

## 🔄 How It Works

1. **Client makes request** to your app
2. **App calls Supabase Edge Function** (e.g., `/functions/v1/usda-proxy/search`)
3. **Edge Function uses stored API key** to call external API
4. **Response filtered and returned** to client
5. **API keys never leave** the secure server environment

## 🚨 Migration from Direct API Calls

If you were previously using direct API calls:

1. **Remove API keys** from `.env` and Netlify environment variables
2. **Update code** to use the new proxy endpoints (already done)
3. **Configure Supabase** with your API keys
4. **Redeploy** your application

## 📊 Monitoring and Debugging

### Supabase Dashboard:
- **Edge Function logs**: Monitor API calls and errors
- **Usage metrics**: Track function invocations
- **Environment variables**: Manage API keys securely

### Client-side debugging:
- **Network tab**: See calls to Supabase Edge Functions
- **Console logs**: Debug proxy responses
- **No API keys visible** anywhere in client code

## 🔧 Troubleshooting

### App Works Locally But Not in Production

1. **Check Supabase configuration** in Netlify environment variables
2. **Verify Edge Functions** are deployed and configured
3. **Check Supabase logs** for Edge Function errors
4. **Ensure API keys** are set in Supabase Edge Functions

### API Rate Limits

- **USDA API**: 3,600 requests/hour - implement caching in Edge Functions
- **Perplexity AI**: Varies by plan - monitor usage in Supabase logs
- **Graceful fallback**: App works in offline mode if APIs fail

### Edge Function Errors

1. **Check Supabase logs** for detailed error messages
2. **Verify API keys** are correctly set in Edge Functions
3. **Test Edge Functions** directly in Supabase dashboard
4. **Check CORS configuration** if seeing network errors

## 📞 Support

If you encounter issues:

1. **Check Supabase documentation** for Edge Functions
2. **Review browser console** for client-side errors
3. **Check Supabase logs** for server-side errors
4. **Open GitHub issue** with detailed error information

---

**Key Takeaway**: Your API keys are now completely secure and never exposed to users, while maintaining full functionality! 🔐✨