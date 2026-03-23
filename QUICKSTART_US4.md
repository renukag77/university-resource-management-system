# 🚀 Quick Start - Event Management System (US#4)

## Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string available
- `.env` file in backend folder with:
  ```
  MONGODB_URI=mongodb://localhost:27017/campus-resource
  JWT_SECRET=your_secret_key_here
  PORT=5000
  ```

---

## 1️⃣ Start Backend Server

```bash
# Navigate to backend
cd backend

# Install dependencies (if needed)
npm install

# Start server
npm start
```

**Expected Output:**
```
MongoDB connected successfully
Server is running on port 5000
```

**To verify backend is working:**
```bash
curl http://localhost:5000/api/health
# Response: {"message":"Backend is running"}
```

---

## 2️⃣ Start Frontend Server

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies (if needed)
npm install

# Start React app
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 3️⃣ Create Test Accounts

Access the app at `http://localhost:3000` and register:

### Club Head Account
- **Email**: `clubhead@head.com`
- **ID Number**: `CH001`
- **Password**: `password123`

### Student Account
- **Email**: `student@student.com`
- **ID Number**: `ST001`
- **Password**: `password123`

---

## 4️⃣ Test Event Creation (Club Head)

1. **Login** with club head email
2. Go to **Club Head Dashboard** → **Create Event**
3. Fill the form:
   - Event Name: `Tech Workshop 2026`
   - Description: `Learn modern web development`
   - Venue: `Lab Building - Room 301`
   - Event Date: Pick a future date/time
   - Required Skills: `React, Node.js`
   - Capacity: `40`
4. Click **Create Event**
5. See success message ✅

---

## 5️⃣ Test Event Browsing (Student)

1. **Login** with student email
2. Go to **Student Dashboard** → **Home**
3. See preview of upcoming events
4. Go to **Browse Events**
5. See all created events displayed
6. Try features:
   - **Search** by event name
   - **Filter** by skill (if any skills exist)
   - **Apply** for an event

---

## 6️⃣ API Testing Commands

### Create Event (Requires Token)
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/club-head/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Python Bootcamp",
    "description": "Intensive Python training",
    "venue": "Auditorium A",
    "eventDate": "2026-05-20T10:00:00Z",
    "poster": "https://via.placeholder.com/300",
    "requiredSkills": ["python", "coding"],
    "capacity": 50
  }'
```

### Get All Events (Public)
```bash
curl http://localhost:5000/api/events
```

### Search Events
```bash
curl "http://localhost:5000/api/events?search=python"
```

### Filter by Skill
```bash
curl "http://localhost:5000/api/events?skill=coding"
```

### Get Token (for testing)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "clubhead@head.com",
    "password": "password123"
  }'
```

---

## 📊 Database Verification

### Check Events in MongoDB
```bash
# Connect to MongoDB
mongosh

# Switch to database
use campus-resource

# Check events collection
db.events.find().pretty()

# Filter by club head
db.events.find({title: "Tech Workshop 2026"}).pretty()

# Get event count
db.events.countDocuments({status: "active"})
```

---

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend accessible at http://localhost:3000
- [ ] Can register new club head account
- [ ] Can register new student account
- [ ] Club head can create event (form validates)
- [ ] Created event shows in database
- [ ] Student can see events on Browse page
- [ ] Student can search events
- [ ] Student can apply for events
- [ ] Events display with all information (venue, date, skills, etc.)
- [ ] Images/posters display correctly

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill process if needed
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
# Check .env file has correct MONGODB_URI
# For local: mongodb://localhost:27017/campus-resource
```

### Frontend Can't Connect to Backend
```bash
# Check if Backend is running first
curl http://localhost:5000/api/health

# Check REACT_APP_API_URL environment variable (if set)
# Default: http://localhost:5000
```

### Form Won't Submit
```bash
# Check browser console for errors (F12)
# Verify date is in the future
# Check all required fields are filled
```

---

## 📚 Key File Locations

- **Event Model**: `backend/models/Event.js`
- **Create Event API**: `backend/controllers/clubHeadController.js`
- **Event Routes**: `backend/routes/clubHead.js`
- **Event Service**: `frontend/src/services/eventService.js`
- **Create Form**: `frontend/src/pages/ClubHeadDashboard/CreateEvent.js`
- **Browse Page**: `frontend/src/pages/StudentDashboard/BrowseEvents.js`

---

## 🎓 How It Works

```
Club Head Flow:
1. Login with @head.com email
2. Navigate to Create Event
3. Fill event details (name, description, venue, date, etc.)
4. Submit form
5. Validation on frontend + backend
6. Event saved to MongoDB with status="active"
7. Event immediately visible to all students

Student Flow:
1. Login with @student.com email
2. See event preview on dashboard
3. Browse all events with search/filter
4. Apply for events
5. Get confirmation message
6. Application saved to StudentApplication collection
```

---

## 🎉 Success Indicators

✅ **Backend Indicators**
- Server starts without errors
- MongoDB connection successful
- New events appear in `events` collection

✅ **Frontend Indicators**
- Form submits successfully
- Success/error messages appear
- Events display with all information
- Images load if provided

✅ **Data Indicators**
- Event documents in MongoDB have all required fields
- EventDate is in ISO format
- ClubHeadId references valid User
- Event status is "active"

---

**You're all set! 🚀 Start creating and managing events!**

For detailed information, see `IMPLEMENTATION_GUIDE_US4.md`
