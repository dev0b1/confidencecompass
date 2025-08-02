# Supabase Setup Guide

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Get Your Supabase API Key**

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/ssroptidwpmvgescjprf
2. **Navigate to Settings → API**
3. **Copy the "anon public" key** (starts with `eyJ...`)

### **Step 2: Add to Environment Variables**

1. **Create `.env` file** (if not exists):
```bash
cp .env.example .env
```

2. **Add your API key**:
```env
SUPABASE_URL=https://ssroptidwpmvgescjprf.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### **Step 3: Restart Servers**

```bash
# Stop current servers (Ctrl+C)
# Then restart
npm run dev:full
```

## ✅ **What This Enables**

### **With Supabase API Key**
- ✅ **Session Persistence**: Practice sessions saved to database
- ✅ **Progress Tracking**: Complete session history
- ✅ **Real Data**: Categories and questions from database
- ✅ **User Analytics**: Track improvement over time

### **Without Supabase API Key**
- ⚠️ **Fallback Mode**: Uses hardcoded data
- ⚠️ **No Persistence**: Sessions not saved
- ⚠️ **Empty History**: Session history will be empty
- ✅ **Still Functional**: All features work with fallback data

## 🔧 **Database Schema**

### **Tables Created**
- `practice_sessions` - Stores all practice sessions
- `users` - User management (ready for future)
- `categories` - Practice categories
- `questions` - Practice questions

### **Sample Data**
- **4 Categories**: Interview, Elevator Pitch, Presentation, Networking
- **13 Questions**: Pre-defined practice questions
- **Ready for Sessions**: Database ready to store practice data

## 🧪 **Testing**

### **Test Database Connection**
```bash
# Check if API key is working
curl http://localhost:5000/api/categories
```

### **Expected Response**
```json
[
  {
    "id": "interview",
    "name": "Interview Practice",
    "description": "Common interview questions and scenarios",
    "icon": "🎯"
  },
  // ... more categories
]
```

## 🚨 **Troubleshooting**

### **"supabaseKey is required" Error**
- **Cause**: Missing API key in `.env` file
- **Solution**: Add `SUPABASE_ANON_KEY=your_key_here` to `.env`

### **Empty Session History**
- **Cause**: No API key or no sessions recorded
- **Solution**: Add API key and record a practice session

### **Categories Not Loading**
- **Cause**: Database connection issue
- **Solution**: Check API key and restart servers

## 📊 **Database Features**

### **Session Storage**
```sql
-- Each practice session includes:
- transcript: Full speech transcript
- metrics: Filler words, speech rate, pause duration
- feedback: AI-generated improvement suggestions
- confidence_score: Overall confidence rating
- duration_seconds: Session length
- created_at: Timestamp
```

### **Progress Tracking**
- **Total Sessions**: Count of all practice sessions
- **Average Confidence**: Overall improvement trend
- **Session History**: Complete record of all practices
- **Category Performance**: Performance by practice type

## 🎯 **Next Steps**

### **Immediate**
1. **Add API Key**: Follow setup steps above
2. **Test Recording**: Record a practice session
3. **Check History**: Verify session appears in history

### **Future**
1. **User Authentication**: Add login/signup
2. **Advanced Analytics**: Progress charts and insights
3. **Custom Questions**: Add your own practice questions
4. **Export Data**: Download session data

---

**Your Supabase database is ready! Just add the API key to enable full functionality.** 🗄️✨ 