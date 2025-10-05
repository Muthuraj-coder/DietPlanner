# 🚀 Quick Deployment Checklist

## Before You Start
- [ ] Push all code to GitHub repository
- [ ] MongoDB Atlas cluster is running
- [ ] Have Render and Netlify accounts ready

## 🔥 QUICK STEPS

### 1. Deploy Backend to Render (5 minutes)
```bash
# Your render.yaml is ready - just connect to Render!
```
1. Go to [render.com](https://dashboard.render.com/) → New → Web Service
2. Connect GitHub repo
3. Name: `nutriflow-backend`
4. Build: `cd backend && npm install`
5. Start: `cd backend && npm start`
6. Add environment variables (copy from DEPLOYMENT.md)
7. Deploy!

### 2. Deploy Frontend to Netlify (3 minutes)
```bash
# Your netlify.toml is ready!
```
1. Go to [netlify.com](https://app.netlify.com/) → New site from Git
2. Connect GitHub repo
3. Build: `npm run build`
4. Publish: `dist`
5. Add env var: `VITE_API_URL=https://nutriflow-backend-3v30.onrender.com/api`
6. Deploy!

### 3. Test Everything (2 minutes)
- [ ] Backend health: `https://nutriflow-backend-3v30.onrender.com/api/health`
- [ ] Frontend loads: `https://YOUR_SITE.netlify.app`
- [ ] Can register/login
- [ ] Can generate meal plans

## 🎉 DONE!
Your NutriFlow app is now live on the internet!

**Backend**: Render (Free tier)
**Frontend**: Netlify (Free tier)
**Database**: MongoDB Atlas (Free tier)

Total cost: **$0/month** 💰
