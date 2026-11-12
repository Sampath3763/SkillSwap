# SkillSwap - FAQ & Troubleshooting

## Frequently Asked Questions

### Getting Started

**Q: Do I need MongoDB installed locally?**
A: No! You can use MongoDB Atlas (cloud). Create a free account at https://www.mongodb.com/cloud/atlas and use the connection string in `.env`

**Q: Can I use this with a different database?**
A: The current version uses MongoDB/Mongoose. You'd need to refactor the models for SQL databases.

**Q: What's the cost to run this?**
A: Free! MongoDB Atlas has a free tier, Jitsi Meet is free, Node.js is free. Only pay for hosting.

**Q: How many users can this support?**
A: With MongoDB Atlas free tier: ~1000 concurrent users. Scale up with paid plans.

---

### Technical Issues

**Q: I get "MongoDB connection refused"**
A: 
1. Check if MongoDB is running: `mongod`
2. Use MongoDB Atlas instead: Get connection string and update `.env`
3. Verify connection string format

**Q: "Port 3000 already in use"**
A:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

**Q: CORS errors in browser console**
A:
1. Make sure server is running on port 5000
2. Check `.env` CORS_ORIGIN matches your frontend URL
3. Restart server after changing `.env`

**Q: "Invalid token" error when trying swap requests**
A:
1. Clear browser localStorage: DevTools → Application → Clear All
2. Login again to get fresh token
3. Check token is being sent in API requests

**Q: Meeting link not generating**
A:
1. Ensure swap request is marked as "accepted"
2. Check JITSI_DOMAIN in `.env`
3. You should have internet connection

**Q: Skills not showing up after adding**
A:
1. Check browser console for errors (F12)
2. Verify API response has the skill
3. Try refreshing the page
4. Clear browser cache

---

### Frontend Issues

**Q: React app won't start ("npm start fails")**
A:
```bash
# Delete node_modules and reinstall
cd client
rm -rf node_modules
npm install
npm start
```

**Q: Blank page or white screen**
A:
1. Open DevTools (F12) → Console tab
2. Check for JavaScript errors
3. Ensure backend is running: `http://localhost:5000/health`
4. Check `.env` has correct API URL

**Q: User not logged in after refresh**
A:
1. Token is stored in localStorage
2. Check localStorage is enabled in browser
3. Check browser private/incognito mode (disables localStorage)

---

### Backend Issues

**Q: Server crashes on startup**
A:
1. Check all required packages installed: `npm install`
2. Check `.env` file exists with correct values
3. Check port 5000 isn't already in use
4. Look at server logs for specific error

**Q: API returns error 500**
A:
1. Check server console for error details
2. Verify MongoDB is running
3. Check request format matches API specs
4. Verify JWT token is valid

**Q: Notifications not showing**
A:
1. Check Notification model creation in code
2. Verify notification is created when request sent
3. Refresh page to get latest notifications
4. Check API returns notifications

---

### Database Issues

**Q: "Database is locked" error**
A: This means MongoDB is running but accepting connections. Solution:
1. Restart MongoDB server
2. Check for other processes using MongoDB

**Q: Data not persisting**
A:
1. Check MongoDB actually saved the data
2. Use MongoDB Compass to inspect database
3. Try using MongoDB Atlas instead of local

**Q: How to backup my data?**
A:
```bash
# Export data
mongodump --uri="mongodb://localhost:27017/skillswap"

# Restore data
mongorestore --uri="mongodb://localhost:27017/skillswap" dump/
```

---

### Deployment Issues

**Q: How do I deploy to Heroku?**
A:
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create skillswap-api

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

**Q: How do I deploy to Replit?**
A:
1. Import from GitHub
2. Create `.env` file (use mongo URI from Atlas)
3. Click "Run" to start server
4. Use Replit's web preview

**Q: My deployment is slow**
A:
1. Check database performance
2. Enable caching
3. Use CDN for static files
4. Monitor API response times
5. Optimize database queries

---

##FeatureSpecific Questions

### Skill Credits

**Q: How many credits do I start with?**
A: 100 credits

**Q: How much does a swap request cost?**
A: 10 credits

**Q: How much do I earn from completing a swap?**
A: 5 credits

**Q: What happens if I run out of credits?**
A: You can't create new swap requests until you earn more by completing swaps

**Q: Can I get credits without completing swaps?**
A: Currently no. Only completing swaps and receiving positive feedback earns credits.

### Reputation System

**Q: How is my rating calculated?**
A: Average of all reviews received (1-5 stars)

**Q: Does my rating affect visibility?**
A: Not currently, but it's shown on your profile. Low ratings may reduce visibility in future versions.

**Q: Can I remove bad reviews?**
A: Not directly, but you can respond by doing more successful swaps to improve your rating.

**Q: How many reviews do I need to be "trusted"?**
A: No specific minimum. More reviews = stronger reputation.

### Matching

**Q: How does matching work?**
A: We find users who offer skills you want AND want skills you offer.

**Q: Why can't I find matches?**
A: Add more skills you want and offer. Matches improve with more skills.

**Q: Can I manually search instead of finding matches?**
A: Yes! Use the Search page to find users by skill name and location.

### Meetings

**Q: What if I don't want a video call?**
A: You can skip the meeting link. The swap request doesn't require it.

**Q: Is the meeting link secure?**
A: Yes! Only you and the other person can access the link. It expires in 24 hours.

**Q: Can I use my own video platform?**
A: Currently integrated with Jitsi, but you can share your own link in the message.

**Q: Do I need an account for Jitsi?**
A: No! Just click the meeting link and you're in.

---

## Useful Commands

### Development
```bash
# Start server (from server folder)
npm start

# Start client (from client folder)
npm start

# Seed database (from server folder)
node scripts/seedDatabase.js
```

### Database
```bash
# Connect to local MongoDB
mongosh

# View collections
show collections

# View documents
db.users.find()

# Delete all data
db.users.deleteMany({})
```

### Debugging
```bash
# Check if port is in use
netstat -ano | findstr :3000

# Check MongoDB status
mongo --eval "db.adminCommand('ping')"

# View server logs
npm start (watch console)

# View API requests
Use Network tab in DevTools (F12)
```

---

## Performance Tips

1. **Database**: Add indexes for frequently queried fields
2. **Frontend**: Use React DevTools to find component re-renders
3. **Backend**: Use monitoring tools like New Relic
4. **API**: Design for pagination (don't return 1000+ records)
5. **Caching**: Store user data and notifications locally

---

## Security Best Practices

1. ✅ Never commit `.env` with real secrets
2. ✅ Use strong, unique JWT secret
3. ✅ Always hash passwords with bcryptjs
4. ✅ Validate all user input
5. ✅ Use HTTPS in production
6. ✅ Keep dependencies updated
7. ✅ Monitor for suspicious activity
8. ✅ Use rate limiting for login attempts
9. ✅ Implement API throttling
10. ✅ Regular security audits

---

## Getting Help

1. **GitHub Issues**: Report bugs
2. **Stack Overflow**: Ask coding questions with tag `skillswap`
3. **MongoDB Docs**: Database questions
4. **Express Docs**: Backend questions
5. **React Docs**: Frontend questions

---

## Contributing Improvements

Have an idea? Found a bug? Want to improve something?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Version History

**v1.0.0** (Initial Release)
- User authentication
- Skill management
- Skill swap matching
- Reputation system
- Virtual meetings
- Notifications
- Reviews & ratings

**Future v1.1**
- Group swaps
- Advanced search filters
- Message boards
- Skill verification

---

## License & Attribution

This project is open source under the MIT License. Built with ❤️ for the community!

---

**Still stuck? Check the main README.md or QUICKSTART.md files!**
