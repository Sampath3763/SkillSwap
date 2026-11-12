# API Testing Guide

This guide shows you how to test all SkillSwap API endpoints.

## Setup

Make sure your server is running on `http://localhost:5000`

### Get Access Token

1. Sign up or login to get a JWT token
2. Use the token in the Authorization header: `Authorization: Bearer YOUR_TOKEN`

---

## Testing Endpoints

### 1. Authentication

#### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "location": "San Francisco, CA"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

---

### 2. User Profile

#### Get Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Name",
    "location": "San Jose, CA",
    "bio": "Updated bio",
    "availability": "both"
  }'
```

---

### 3. Skill Management

#### Add Skill
```bash
curl -X POST http://localhost:5000/api/users/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "skillType": "offered",
    "skill": {
      "name": "JavaScript",
      "level": "Expert",
      "mode": "Online"
    }
  }'
```

#### Remove Skill
```bash
curl -X DELETE http://localhost:5000/api/users/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "skillType": "offered",
    "skillIndex": 0
  }'
```

#### Search Users
```bash
curl -X GET "http://localhost:5000/api/users/search?skillName=Python&location=San%20Francisco&level=Expert" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Skill Swaps

#### Create Swap Request
```bash
curl -X POST http://localhost:5000/api/swaps/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "initiatorOffersSkill": {
      "name": "Python",
      "level": "Expert",
      "mode": "Online"
    },
    "initiatorWantsSkill": {
      "name": "Graphic Design",
      "level": "Intermediate",
      "mode": "Both"
    },
    "message": "Hi! I noticed you design graphics. I can teach you Python!"
  }'
```

#### Get Swap Requests
```bash
curl -X GET "http://localhost:5000/api/swaps/requests?type=sent&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Respond to Swap Request
```bash
curl -X POST http://localhost:5000/api/swaps/request/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "swapRequestId": "SWAP_REQUEST_ID",
    "response": "accepted"
  }'
```

#### Get Potential Matches
```bash
curl -X GET http://localhost:5000/api/swaps/matches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Mark Swap as Completed
```bash
curl -X POST http://localhost:5000/api/swaps/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "swapRequestId": "SWAP_REQUEST_ID"
  }'
```

#### Generate Meeting Link
```bash
curl -X POST http://localhost:5000/api/swaps/meeting-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "swapRequestId": "SWAP_REQUEST_ID"
  }'
```

---

### 5. Reviews & Reputation

#### Submit Review
```bash
curl -X POST http://localhost:5000/api/reviews/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "swapRequestId": "SWAP_REQUEST_ID",
    "revieweeId": "REVIEWER_USER_ID",
    "rating": 5,
    "feedback": "Great swap! Learned a lot.",
    "skillQuality": 5,
    "communication": 5,
    "punctuality": 5
  }'
```

#### Get Reviews for User
```bash
curl -X GET http://localhost:5000/api/reviews/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Reviews for a Swap
```bash
curl -X GET http://localhost:5000/api/reviews/swap/SWAP_REQUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Notifications

#### Get Notifications
```bash
curl -X GET "http://localhost:5000/api/notifications?unreadOnly=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Mark as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "notificationId": "NOTIFICATION_ID"
  }'
```

#### Mark All as Read
```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## E2E Test Scenario

Here's a complete user flow to test:

### 1. Create Two Users
- Sign up as alice@example.com
- Sign up as bob@example.com

### 2. Set Up Skills
- Alice adds: Python (Expert, Online)
- Alice wants: Graphic Design

- Bob adds: Graphic Design (Expert, Online)
- Bob wants: Python

### 3. Find Matches
- Alice calls GET /swaps/matches → should find Bob
- Bob calls GET /swaps/matches → should find Alice

### 4. Create & Accept Swap
- Alice creates request to Bob
- Bob accepts the request
- Check notification was created

### 5. Generate Meeting
- Alice generates meeting link
- System creates Jitsi room

### 6. Complete & Rate
- Mark swap as completed
- Alice rates Bob 5 stars
- Check Bob's rating updated

---

## Using Postman

1. Download [Postman](https://www.postman.com/download/)
2. Import the collection from `postman-collection.json`
3. Set your token in the collection variables
4. Run endpoints with one click

---

## Response Examples

### Success Response
```json
{
  "message": "Success",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice",
    "email": "alice@example.com",
    "location": "San Francisco, CA",
    "skillCredits": 95,
    "averageRating": 5.0,
    "completedSwaps": 1
  }
}
```

### Error Response
```json
{
  "message": "Invalid credentials"
}
```

---

## Debugging Tips

1. **Check Logs**: Watch server terminal for errors
2. **Check Console**: Open browser DevTools (F12) for frontend errors
3. **Token Issues**: Make sure token is included in Authorization header
4. **CORS Errors**: Ensure CORS_ORIGIN in .env matches your frontend URL
5. **DB Connection**: Verify MongoDB is running

---

**Happy Testing! 🎉**
