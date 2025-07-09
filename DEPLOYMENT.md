# 🚀 Deployment Guide

This guide explains how to deploy CalorieClimb to both GitHub Pages and the custom domain (https://calorieclimb.com) using GitHub Actions and your preferred hosting provider.

## 🌍 Where is the App Deployed?

- **GitHub Pages:** [https://[your-username].github.io/calorieclimb.com/](https://[your-username].github.io/calorieclimb.com/)
- **Custom Domain:** [https://calorieclimb.com](https://calorieclimb.com)

## 📋 Prerequisites

- A GitHub repository with your CalorieClimb code
- Supabase project (for backend functions)
- Node.js 18+ for local development

## 🔧 Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

### 2. Configure Environment Variables

You need to configure Supabase connection details:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each variable:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (required)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (required)
   - `VITE_GA_MEASUREMENT_ID`: Your Google Analytics Measurement ID (optional)

**Note:** USDA and Perplexity API keys are stored securely in Supabase Edge Functions and don't need to be exposed in GitHub Actions or the client.

### 3. Push to Main Branch

The GitHub Actions workflow will automatically:
- Install dependencies
- Build the project
- Deploy to GitHub Pages

### 4. Deploy to Custom Domain (calorieclimb.com)

- Deploy the contents of the `dist` folder to your custom domain using your preferred hosting provider (e.g., Netlify, Vercel, etc.).
- Ensure the same environment variables are set in your hosting provider as in GitHub.

## 🔒 Security and Public Configuration

- Only public configuration (Supabase URL and anon key, Google Analytics ID) is exposed to the client.
- All sensitive API keys (USDA, Perplexity) are kept secure in Supabase Edge Functions.
- This repository is public; do not commit any sensitive secrets.

## 🌐 Accessing Your Deployed App

Your app will be available at:
- `https://[your-username].github.io/calorieclimb.com/`
- `https://calorieclimb.com`

---

## 🔄 How It Works

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file contains the automation:

1. **Triggers**: Runs on pushes to `main` branch and pull requests
2. **Build Job**: 
   - Sets up Node.js 18
   - Installs dependencies with `npm ci`
   - Builds the project with `npm run build`
   - Uploads the `dist` folder as a Pages artifact
3. **Deploy Job**:
   - Only runs on `main` branch pushes
   - Deploys the artifact to GitHub Pages

### Build Configuration

- **Production Build**: Uses `/calorieclimb.com/` as the base path for GitHub Pages
- **Development**: Uses `/` as the base path for local development
- **Routing**: Includes 404.html and redirect scripts for client-side routing

## 🌐 Accessing Your Deployed App

Your app will be available at:
```
https://[your-username].github.io/calorieclimb.com/
```

## 🔍 Troubleshooting

### Build Failures

1. **Check Actions Tab**: Go to your repository → Actions to see build logs
2. **Common Issues**:
   - Missing dependencies in package.json
   - TypeScript errors
   - Environment variable issues

### Routing Issues

If direct links don't work:
1. Ensure `public/404.html` exists
2. Check that the redirect script is in `index.html`
3. Verify the base path in `vite.config.ts`

### Environment Variables

If APIs aren't working:
1. Verify secrets are set in repository settings
2. Check that variable names match exactly
3. Ensure the workflow uses the correct secret names

## 🛠️ Local Development

For local development without GitHub Pages base path:

```bash
npm run dev  # Uses vite.config.dev.ts with root base path
```

For production testing:

```bash
npm run build
npm run preview
```

## 📝 Customization

### Changing the Repository Name

If you rename your repository, update:
1. `vite.config.ts` - Change the base path
2. `public/404.html` - Update the `pathSegmentsToKeep` variable
3. Update this documentation

### Adding Custom Domain

1. Add your domain to repository Settings → Pages
2. Update the base path in `vite.config.ts` to `/`
3. Configure DNS records as instructed by GitHub

## 🔒 Security Notes

- Repository secrets are encrypted and only accessible during workflow runs
- Never commit API keys to the repository
- Use environment variables for all sensitive configuration

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Configuration](https://vitejs.dev/config/)
- [React Router with GitHub Pages](https://github.com/rafgraph/spa-github-pages)