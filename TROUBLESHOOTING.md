# 🔧 Troubleshooting USDA API 403 Errors

## Problem: Getting 403 Forbidden Errors from USDA API

If you're seeing errors like:
```
USDA API error: 403
Calling Supabase Edge Function failed: {"error":"USDA API error: 403"}
```

This means the USDA API key is not properly configured in your Supabase Edge Functions.

## ✅ Step-by-Step Fix

### 1. Verify Your USDA API Key

First, make sure your USDA API key is valid:

1. **Test your API key directly**:
   ```bash
   curl "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query":"apple","pageSize":5}'
   ```

2. **If this fails**, your API key might be:
   - Invalid or expired
   - Not activated yet (check your email)
   - Incorrectly copied

### 2. Configure API Key in Supabase Edge Functions

The API key must be set as an **environment variable** in your Supabase Edge Functions, NOT in your app's environment variables.

#### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Navigate to Edge Functions** in the left sidebar
3. **Click on Settings** or **Environment Variables**
4. **Add a new environment variable**:
   - **Name**: `USDA_API_KEY`
   - **Value**: Your actual USDA API key (without quotes)
5. **Save the changes**

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Set the environment variable
supabase secrets set USDA_API_KEY=your_actual_api_key_here

# Deploy the functions
supabase functions deploy usda-proxy
supabase functions deploy perplexity-proxy
```

### 3. Verify Edge Functions Are Deployed

Make sure your Edge Functions are properly deployed:

1. **Check in Supabase Dashboard**:
   - Go to Edge Functions
   - You should see `usda-proxy` and `perplexity-proxy` listed
   - They should show as "Active" or "Deployed"

2. **If they're not deployed**, you need to deploy them:
   ```bash
   # Using Supabase CLI
   supabase functions deploy usda-proxy
   supabase functions deploy perplexity-proxy
   ```

### 4. Test Edge Function Directly

Test your Edge Function directly to see if it's working:

1. **Get your Supabase URL and anon key** from your project settings
2. **Test the function**:
   ```bash
   curl "https://YOUR_PROJECT.supabase.co/functions/v1/usda-proxy/search" \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query":"apple","pageSize":5,"dataType":["Foundation"]}'
   ```

3. **If this works**, the problem is in your app configuration
4. **If this fails**, the problem is in your Supabase setup

### 5. Check Your App Configuration

Make sure your app has the correct Supabase credentials:

1. **Check your `.env` file** (for local development):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Check Netlify environment variables** (for production):
   - Go to your Netlify site settings
   - Navigate to Environment variables
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

### 6. Common Mistakes

❌ **Don't do this**:
- Setting `USDA_API_KEY` in your app's environment variables
- Setting `USDA_API_KEY` in Netlify environment variables
- Including quotes around the API key value

✅ **Do this**:
- Set `USDA_API_KEY` in Supabase Edge Functions environment variables
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your app
- Use the raw API key value without quotes

## 🔍 Debugging Steps

### Check Supabase Logs

1. **Go to Supabase Dashboard** → **Edge Functions** → **usda-proxy**
2. **Click on "Logs"** to see function execution logs
3. **Look for error messages** that might indicate:
   - Missing environment variables
   - API key format issues
   - Network connectivity problems

### Check Browser Network Tab

1. **Open browser developer tools** → **Network tab**
2. **Try searching for a food** in the app
3. **Look for the request** to `/functions/v1/usda-proxy/search`
4. **Check the response** for detailed error information

### Enable Debug Logging

Add this to your Edge Function to debug environment variables:

```typescript
// Temporary debug code - remove after fixing
console.log('Environment check:', {
  hasUsdaKey: !!Deno.env.get('USDA_API_KEY'),
  keyLength: Deno.env.get('USDA_API_KEY')?.length || 0,
  keyPrefix: Deno.env.get('USDA_API_KEY')?.substring(0, 8) || 'none'
})
```

## 🆘 Still Having Issues?

If you're still getting 403 errors after following these steps:

1. **Double-check your USDA API key** by testing it directly with curl
2. **Regenerate your USDA API key** if it's old or might be compromised
3. **Contact USDA support** if your API key isn't working
4. **Check Supabase status** at status.supabase.com
5. **Open a GitHub issue** with:
   - Your Supabase logs
   - Browser network tab screenshots
   - Steps you've already tried

## 🎯 Quick Checklist

- [ ] USDA API key is valid and working (test with curl)
- [ ] API key is set in Supabase Edge Functions environment variables
- [ ] Edge Functions are deployed and active
- [ ] Supabase URL and anon key are set in your app
- [ ] No API keys are set in app environment variables
- [ ] Tested Edge Function directly with curl
- [ ] Checked Supabase logs for errors

Remember: The API key should ONLY be in Supabase Edge Functions, never in your app's environment variables!