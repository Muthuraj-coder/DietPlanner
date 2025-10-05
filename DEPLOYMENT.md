# NutriFlow Deployment Guide
## Backend on Render + Frontend on Netlify

## Prerequisites
1. MongoDB Atlas account with database created
2. Render account (for backend)
3. Netlify account (for frontend)
4. GitHub repository with your code

---

## 🚀 PART 1: Deploy Backend to Render

### Step 1: Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Ensure your cluster is running
3. Go to **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
4. Go to **Database Access** → Verify user `muthurajd23cse` exists with password `Muthu4855`

### Step 2: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `https://github.com/YOUR_USERNAME/dietplanner`
4. Configure the service:
   - **Name**: `nutriflow-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables in Render
In the **Environment** section, add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://muthurajd23cse:Muthu4855@crud.ftlqkl0.mongodb.net/nutriflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-nutriflow-2024
EDAMAM_APP_ID=e4fffceb
EDAMAM_APP_KEY=be643d753fa54c259fceeb6f556d2bc7
EMAIL_USER=muthurajd.23cse@kongu.edu
EMAIL_PASS=yxjiilwlhwynrliv
FRONTEND_URL=https://nutriflow-app.netlify.app
```

### Step 4: Deploy Backend
1. Click **Create Web Service**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://nutriflow-backend.onrender.com`
4. Test health endpoint: `https://nutriflow-backend.onrender.com/api/health`

---

## 🌐 PART 2: Deploy Frontend to Netlify

### Step 1: Deploy to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **New site from Git**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Site name**: `nutriflow-app` (or your preferred name)

### Step 2: Add Environment Variables in Netlify
1. Go to **Site settings** → **Environment variables**
2. Add this variable:
   ```
   VITE_API_URL=https://nutriflow-backend.onrender.com/api
   ```
   ⚠️ **Important**: Replace `nutriflow-backend` with your actual Render service name

### Step 3: Deploy Frontend
1. Click **Deploy site**
2. Wait for build to complete (2-5 minutes)
3. Your frontend will be available at: `https://nutriflow-app.netlify.app`

### Step 4: Update Backend CORS (if needed)
If you used a different Netlify site name, update the backend CORS:
1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your actual Netlify URL
3. Redeploy backend service

---

## ✅ VERIFICATION STEPS

### Test Backend:
1. Visit: `https://YOUR_BACKEND_NAME.onrender.com/api/health`
2. Should return: `{"message": "NutriFlow API is running"}`

### Test Frontend:
1. Visit: `https://YOUR_SITE_NAME.netlify.app`
2. Try registering a new user
3. Try logging in
4. Generate a meal plan

### Test Integration:
1. Open browser developer tools → Network tab
2. Generate meal plan and verify API calls to Render backend
3. Check for CORS errors in console

---

## 🔧 TROUBLESHOOTING

### Backend Issues:
- **Build fails**: Check Node.js version in Render logs
- **MongoDB connection fails**: Verify connection string and IP whitelist
- **Environment variables**: Double-check all variables are set correctly

### Frontend Issues:
- **Build fails**: Check package.json dependencies
- **API calls fail**: Verify VITE_API_URL points to correct backend
- **Routing issues**: Ensure `_redirects` file exists for React Router

### CORS Issues:
- **Access blocked**: Update FRONTEND_URL in backend environment variables
- **Multiple domains**: Add your Netlify URL to CORS allowedOrigins

---

## 📋 FINAL CHECKLIST

- [ ] Backend deployed to Render successfully
- [ ] Frontend deployed to Netlify successfully  
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] All environment variables configured correctly
- [ ] Health endpoint responds correctly
- [ ] Frontend can register/login users
- [ ] Meal plan generation works
- [ ] Email notifications working
- [ ] No CORS errors in browser console

---

## 🌟 EXPECTED URLS

- **Backend API**: `https://nutriflow-backend.onrender.com`
- **Frontend App**: `https://nutriflow-app.netlify.app`
- **Health Check**: `https://nutriflow-backend.onrender.com/api/health`

Your NutriFlow app is now live with backend on Render and frontend on Netlify! 🎉
