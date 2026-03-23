# 📡 Event Management API Reference

## Base URL
```
http://localhost:5000/api
https://sepmbackend.vercel.app/api (Production)
```

---

## Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
```

All endpoints marked with 🔒 require authentication.

---

# 🎯 API Endpoints

## 1. Create Event (Club Head Only)
**🔒 Requires Authentication**

```http
POST /club-head/events
```

### Request Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "title": "Introduction to React",
  "description": "Learn React fundamentals and hooks",
  "venue": "Computer Lab B",
  "eventDate": "2026-05-15T14:00:00Z",
  "poster": "https://example.com/react-poster.jpg",
  "requiredSkills": ["JavaScript", "React"],
  "capacity": 50
}
```

### Request Parameters

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | String | ✅ Yes | Not empty, max 255 chars |
| `description` | String | ✅ Yes | Not empty, max 5000 chars |
| `venue` | String | ✅ Yes | Not empty, max 255 chars |
| `eventDate` | ISO Date | ✅ Yes | Must be in future |
| `poster` | String | ❌ No | Valid URL format |
| `requiredSkills` | Array | ❌ No | Array of strings |
| `capacity` | Number | ❌ No | Positive integer |

### Success Response (201 Created)
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to React",
    "description": "Learn React fundamentals and hooks",
    "venue": "Computer Lab B",
    "eventDate": "2026-05-15T14:00:00.000Z",
    "poster": "https://example.com/react-poster.jpg",
    "clubHeadId": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@head.com"
    },
    "requiredSkills": ["JavaScript", "React"],
    "capacity": 50,
    "status": "active",
    "createdAt": "2026-03-23T12:30:45.000Z",
    "updatedAt": "2026-03-23T12:30:45.000Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Event name is required"
}
```

### Error Response (403 Forbidden)
```json
{
  "message": "Access denied. Only club heads can create events"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "message": "Server error",
  "error": "Error details here"
}
```

---

## 2. Get All Events (Public)
**✅ No Authentication Required**

```http
GET /events
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | String | Search by event title | `?search=workshop` |
| `skill` | String | Filter by required skill | `?skill=JavaScript` |

### Example URLs
```
GET /events
GET /events?search=python
GET /events?skill=teamwork
GET /events?search=tech&skill=networking
```

### Success Response (200 OK)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to React",
    "description": "Learn React fundamentals and hooks",
    "venue": "Computer Lab B",
    "eventDate": "2026-05-15T14:00:00.000Z",
    "poster": "https://example.com/react-poster.jpg",
    "clubHeadId": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@head.com"
    },
    "requiredSkills": ["JavaScript", "React"],
    "capacity": 50,
    "status": "active",
    "createdAt": "2026-03-23T12:30:45.000Z",
    "updatedAt": "2026-03-23T12:30:45.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Python Bootcamp",
    "description": "Master Python programming",
    "venue": "Lab A",
    "eventDate": "2026-06-01T10:00:00.000Z",
    "poster": null,
    "clubHeadId": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Jane Smith",
      "email": "jane@head.com"
    },
    "requiredSkills": ["Python", "OOP"],
    "capacity": 40,
    "status": "active",
    "createdAt": "2026-03-23T15:20:10.000Z",
    "updatedAt": "2026-03-23T15:20:10.000Z"
  }
]
```

### Empty Response (200 OK)
```json
[]
```

### Error Response (500 Internal Server Error)
```json
{
  "message": "Server error",
  "error": "Error details here"
}
```

---

## 3. Get Student Events (Authenticated)
**🔒 Requires Authentication**

```http
GET /student/events
```

### Request Headers
```json
{
  "Authorization": "Bearer {token}"
}
```

### Query Parameters
Same as Get All Events (search, skill)

### Success Response (200 OK)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to React",
    "description": "Learn React fundamentals and hooks",
    "venue": "Computer Lab B",
    "eventDate": "2026-05-15T14:00:00.000Z",
    "poster": "https://example.com/react-poster.jpg",
    "clubHeadId": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@head.com"
    },
    "requiredSkills": ["JavaScript", "React"],
    "capacity": 50,
    "status": "active",
    "createdAt": "2026-03-23T12:30:45.000Z",
    "updatedAt": "2026-03-23T12:30:45.000Z"
  }
]
```

---

## 4. Apply for Event (Student Only)
**🔒 Requires Authentication**

```http
POST /student/apply
```

### Request Headers
```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "eventId": "507f1f77bcf86cd799439011",
  "skills": ["JavaScript", "React"]
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | String | ✅ Yes | MongoDB ObjectId of event |
| `skills` | Array | ❌ No | Student's relevant skills |

### Success Response (201 Created)
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "507f1f77bcf86cd799439050",
    "userId": "507f1f77bcf86cd799439001",
    "eventId": "507f1f77bcf86cd799439011",
    "userSkills": ["JavaScript", "React"],
    "status": "pending",
    "appliedAt": "2026-03-23T13:45:30.000Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "You have already applied for this event"
}
```

### Error Response (404 Not Found)
```json
{
  "message": "Event not found"
}
```

---

## 5. Get Club Head Dashboard
**🔒 Requires Authentication (Club Head Only)**

```http
GET /club-head/dashboard
```

### Request Headers
```json
{
  "Authorization": "Bearer {token}"
}
```

### Success Response (200 OK)
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "email": "john@head.com",
    "role": "club_head",
    "idNumber": "CH001"
  },
  "club": {
    "_id": "507f1f77bcf86cd799439100",
    "name": "Tech Club",
    "headId": "507f1f77bcf86cd799439010",
    "members": [...]
  },
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Introduction to React",
      ...
    }
  ]
}
```

### Error Response (403 Forbidden)
```json
{
  "message": "Access denied"
}
```

---

# 📊 Data Types

## Event Object
```json
{
  "_id": "string (MongoDB ObjectId)",
  "title": "string (required)",
  "description": "string (required)",
  "venue": "string (required)",
  "eventDate": "string (ISO 8601 date)",
  "poster": "string (URL or null)",
  "clubHeadId": "string (MongoDB ObjectId)",
  "requiredSkills": ["string"],
  "capacity": "number",
  "status": "string (enum: draft, active, completed, cancelled)",
  "createdAt": "string (ISO 8601 date)",
  "updatedAt": "string (ISO 8601 date)"
}
```

## User Object
```json
{
  "_id": "string (MongoDB ObjectId)",
  "name": "string",
  "email": "string",
  "role": "string (student, club_head, admin)",
  "idNumber": "string",
  "password": "string (hashed)"
}
```

## StudentApplication Object
```json
{
  "_id": "string (MongoDB ObjectId)",
  "userId": "string (MongoDB ObjectId)",
  "eventId": "string (MongoDB ObjectId)",
  "userSkills": ["string"],
  "status": "string (pending, accepted, rejected, withdrawn)",
  "appliedAt": "string (ISO 8601 date)",
  "respondedAt": "string (ISO 8601 date or null)"
}
```

---

# 🔐 Authentication

## Login Endpoint
```http
POST /auth/login
```

### Request Body
```json
{
  "email": "user@head.com",
  "password": "password123"
}
```

### Success Response
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "John Doe",
    "email": "john@head.com",
    "role": "club_head",
    "idNumber": "CH001"
  }
}
```

### Accessing Protected Endpoints
```bash
curl -H "Authorization: Bearer {token}" http://localhost:5000/api/club-head/dashboard
```

---

# ✨ Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation failed |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

# 🧪 cURL Examples

### Create Event
```bash
curl -X POST http://localhost:5000/api/club-head/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Workshop",
    "description": "Learn modern web development",
    "venue": "Lab A",
    "eventDate": "2026-05-20T10:00:00Z",
    "requiredSkills": ["JavaScript", "HTML"],
    "capacity": 50
  }'
```

### Get All Events
```bash
curl http://localhost:5000/api/events
```

### Search Events
```bash
curl "http://localhost:5000/api/events?search=workshop&skill=JavaScript"
```

### Apply for Event
```bash
curl -X POST http://localhost:5000/api/student/apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "507f1f77bcf86cd799439011",
    "skills": ["JavaScript"]
  }'
```

---

# 🚀 Rate Limiting
Currently no rate limiting implemented. Consider adding for production:
- 100 requests per 15 minutes for public endpoints
- 50 requests per 15 minutes for authenticated endpoints

---

# 📝 Changelog

### Version 1.0.0 (March 23, 2026)
- Initial implementation of event creation API
- Event listing and search API
- Student application API
- Full validation and error handling

---

# 🔄 Future API Enhancements

1. **Event Editing**
   - `PUT /club-head/events/:eventId` - Update event
   - `DELETE /club-head/events/:eventId` - Delete event

2. **Event Filtering**
   - `GET /events?dateFrom=X&dateTo=Y` - Date range filter
   - `GET /events?venue=X` - Venue search

3. **Applications**
   - `GET /club-head/events/:eventId/applications` - View applications
   - `PUT /applications/:appId/accept` - Accept application
   - `PUT /applications/:appId/reject` - Reject application

4. **Pagination**
   - `GET /events?page=1&limit=10` - Paginated results

---

**Last Updated**: March 23, 2026 | **Version**: 1.0.0
