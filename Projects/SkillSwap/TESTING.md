# SkillSwap - Testing Checklist

Complete this checklist to verify all features work correctly.

## Pre-Testing Setup

- [ ] MongoDB running or MongoDB Atlas connected
- [ ] Backend installed: `cd server && npm install`
- [ ] Frontend installed: `cd client && npm install`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Sample data seeded: `node server/scripts/seedDatabase.js`

---

## Authentication Testing

### Signup
- [ ] Can create new account with valid data
- [ ] Get error with missing fields
- [ ] Get error with existing email
- [ ] Password hashed in database
- [ ] Receive JWT token after signup
- [ ] Redirected to dashboard

### Login
- [ ] Can login with correct credentials
- [ ] Get error with wrong password
- [ ] Get error with non-existent email
- [ ] Receive valid JWT token
- [ ] Token stored in localStorage
- [ ] Can access protected pages after login

### Logout
- [ ] Logout clears token
- [ ] Cannot access protected pages
- [ ] Redirected to login page

---

## User Profile Testing

### View Profile
- [ ] Can see own profile
- [ ] All fields display correctly
- [ ] Rating and stats show
- [ ] Profile image placeholder shows

### Update Profile
- [ ] Can edit name
- [ ] Can edit location
- [ ] Can edit bio
- [ ] Can change availability
- [ ] Updates saved to database
- [ ] Changes reflect immediately

### Change Password
- [ ] Can change password with current password
- [ ] Get error with wrong current password
- [ ] New password works for login
- [ ] Old password no longer works

---

## Skill Management Testing

### Add Skills Offered
- [ ] Can add new skill
- [ ] Can select level (Beginner/Intermediate/Expert)
- [ ] Can select mode (Online/Offline/Both)
- [ ] Skill appears in list
- [ ] Skill saved to database
- [ ] Can add multiple skills

### Add Skills Wanted
- [ ] Works same as offered skills
- [ ] Different from offered skills list
- [ ] Can add multiple skills

### Remove Skills
- [ ] Can remove offered skill
- [ ] Can remove wanted skill
- [ ] Immediately removed from list
- [ ] Removed from database

---

## Search & Discovery Testing

### Search Functionality
- [ ] Can search by skill name
- [ ] Can search by location
- [ ] Can filter by level
- [ ] Results display with cards
- [ ] Can search for multiple criteria
- [ ] Search returns relevant users
- [ ] Can view other user profiles

### Potential Matches
- [ ] Matches found correctly
- [ ] Shows users offering skills I want
- [ ] Shows users wanting skills I offer
- [ ] Displays matched skill name
- [ ] Shows all user skills
- [ ] Shows user rating
- [ ] Shows completed swaps count

---

## Swap Request Testing

### Create Swap Request
- [ ] Can see "Propose Swap" button on matches
- [ ] Can select skills to swap
- [ ] Can add message
- [ ] Costs 10 skill credits
- [ ] Request created successfully
- [ ] Recipient receives notification
- [ ] Initiator sees request in "Sent" tab

### Receive Swap Request
- [ ] Notifications show new requests
- [ ] Can view received requests
- [ ] Shows request details
- [ ] Shows initiator info
- [ ] Shows skills being offered

### Accept Swap Request
- [ ] Can click Accept button
- [ ] Request status changes to "accepted"
- [ ] Initiator receives notification
- [ ] Can now generate meeting link

### Reject Swap Request
- [ ] Can click Reject button
- [ ] Request status changes to "rejected"
- [ ] Initiator refunded 5 credits
- [ ] Initiator receives notification

### View Swap Requests
- [ ] Can view sent requests
- [ ] Can view received requests
- [ ] Can view all requests
- [ ] Filter by status works
- [ ] Shows request details
- [ ] Shows swap details clearly

---

## Meeting Link Testing

### Generate Meeting Link
- [ ] Link only available for accepted requests
- [ ] Can click "Generate Meeting Link"
- [ ] Link generated successfully
- [ ] Link saved to database
- [ ] Shows unique room ID
- [ ] Uses Jitsi Meet domain

### Access Meeting
- [ ] Can open meeting link
- [ ] Opens Jitsi Meet in new tab
- [ ] Can share screen
- [ ] Can enable/disable video
- [ ] Can enable/disable audio
- [ ] Can chat in meeting
- [ ] Other user can join same room

---

## Reputation & Reviews Testing

### Complete Swap
- [ ] Can mark swap as completed
- [ ] Both users see "completed" status
- [ ] Skill credits awarded (5 to each)
- [ ] Completed swaps count increases

### Submit Review
- [ ] Can submit review after completion
- [ ] Can rate 1-5 stars
- [ ] Can submit optional feedback
- [ ] Can rate skill quality
- [ ] Can rate communication
- [ ] Can rate punctuality
- [ ] Cannot review twice

### View Reputation
- [ ] Average rating calculated correctly
- [ ] Shows number of reviews
- [ ] Shows completed swap count
- [ ] Displays on profile
- [ ] Affects visibility (future feature)

---

## Notifications Testing

### Receive Notifications
- [ ] Notification created for new swap request
- [ ] Notification created for accepted request
- [ ] Notification created for rejected request
- [ ] Notification created for completed swap
- [ ] All in-app (no email)

### View Notifications
- [ ] Can see notification badge count
- [ ] Can open notifications panel
- [ ] Shows newest first
- [ ] Shows title and message
- [ ] Shows proper notification type

### Mark Read
- [ ] Can mark single notification as read
- [ ] Can mark all as read
- [ ] Read notifications visually different
- [ ] Count updates after marking

---

## Skill Credits System Testing

### Track Credits
- [ ] Start with 100 credits
- [ ] Display on dashboard
- [ ] Display in profile

### Spend Credits
- [ ] Creating swap request costs 10
- [ ] Cannot create request with <10 credits
- [ ] Credit deducted immediately

### Earn Credits
- [ ] Complete swap awards 5 credits
- [ ] Credits added to both users
- [ ] Balance updates on dashboard

---

## UI/UX Testing

### Navigation
- [ ] Navbar shows on all pages
- [ ] Links work correctly
- [ ] User name displays
- [ ] Logout button works
- [ ] Logo links to dashboard

### Dashboard
- [ ] Shows user greeting
- [ ] Displays stats (credits, swaps, rating)
- [ ] Shows skills preview
- [ ] Shows notifications
- [ ] Quick action buttons work

### Responsive Design
- [ ] Layout works on desktop (1920px)
- [ ] Layout works on tablet (768px)
- [ ] Layout works on mobile (375px)
- [ ] Touch buttons easily tappable
- [ ] Text readable on all sizes
- [ ] No overflow or cutoff content

### Forms
- [ ] All input fields accessible
- [ ] Error messages display
- [ ] Submit buttons working
- [ ] Form validation works
- [ ] Success messages show

---

## Error Handling Testing

### Invalid Inputs
- [ ] Missing email shows error
- [ ] Invalid email format shows error
- [ ] Short password shows error
- [ ] Empty required fields show errors

### Network Errors
- [ ] Offline: graceful error message
- [ ] Server down: error notification
- [ ] Invalid token: redirect to login
- [ ] Expired token: ask to re-login

### Validation
- [ ] XSS prevention (try `<script>` in text)
- [ ] SQL injection prevention (try SQL syntax)
- [ ] Does not expose database errors
- [ ] Returns user-friendly messages

---

## Performance Testing

### Load Times
- [ ] Initial page load: < 3 seconds
- [ ] Search results: < 1 second
- [ ] Dashboard load: < 1 second
- [ ] API responses: < 500ms

### Database
- [ ] Search scales to 100+ users
- [ ] No N+1 query problems
- [ ] Indexes working (queries fast)

### Frontend
- [ ] No unnecessary re-renders
- [ ] Smooth animations
- [ ] No memory leaks (DevTools)

---

## Security Testing

### Authentication
- [ ] Passwords hashed (not stored plain text)
- [ ] JWT token required for protected routes
- [ ] Invalid token blocked
- [ ] Expired token handled

### Data Privacy
- [ ] Cannot view other user passwords
- [ ] Cannot impersonate other users
- [ ] Meeting links secure (unique IDs)
- [ ] Email not exposed publicly

### Input Validation
- [ ] XSS attempts blocked
- [ ] SQL injection blocked
- [ ] File upload restrictions (if any)
- [ ] Rate limiting on login

---

## Database Testing

### User Collection
- [ ] Users saved correctly
- [ ] Passwords hashed
- [ ] Skills stored
- [ ] Credits tracked
- [ ] Rating calculated

### Skill Swap Collection
- [ ] Requests saved
- [ ] Status tracked
- [ ] Meeting link stored
- [ ] Notification reference correct

### Review Collection
- [ ] Reviews saved
- [ ] Links to swap request
- [ ] User ratings stored
- [ ] Feedback preserved

### Notification Collection
- [ ] Created for all events
- [ ] Links to swap request
- [ ] Read status tracked
- [ ] Type categorized correctly

---

## Deployment Testing

### Server Ready
- [ ] Can be deployed to Heroku
- [ ] Can be deployed to Replit
- [ ] Can be deployed to AWS
- [ ] Production mode works
- [ ] Error handling in production

### Database Ready
- [ ] Works with MongoDB Atlas
- [ ] Connection string secure
- [ ] Auto backup possible
- [ ] Can scale if needed

---

## End-to-End Scenario

Complete this real-world scenario:

1. [ ] Create two user accounts (Alice & Bob)
2. [ ] Alice adds Python skill (Expert, Online)
3. [ ] Alice wants Graphic Design skill
4. [ ] Bob adds Graphic Design (Expert, Online)
5. [ ] Bob wants Python skill
6. [ ] Alice searches for Bob
7. [ ] Alice sees Bob in matches
8. [ ] Alice proposes swap
9. [ ] Bob receives notification
10. [ ] Bob accepts swap
11. [ ] Alice sees accepted status
12. [ ] Alice generates meeting link
13. [ ] Both can access meeting link
14. [ ] Both mark swap complete
15. [ ] Alice rates Bob 5 stars
16. [ ] Bob rates Alice 5 stars
17. [ ] Both see updated ratings
18. [ ] Credits awarded to both

---

## Bugs Found

Record any bugs found during testing:

- [ ] Bug #1: [Description]
- [ ] Bug #2: [Description]
- [ ] Bug #3: [Description]

---

## Sign-Off

- **Tested By**: _________________
- **Date**: _________________
- **All Tests Pass**: Yes / No

---

**Testing Complete! 🎉**
