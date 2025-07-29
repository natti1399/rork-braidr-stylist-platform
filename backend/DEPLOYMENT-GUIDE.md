# 🚀 Braidr Backend - Mobile Booking App API

## 📱 **Perfect for a0.dev Mobile Development**

This backend is specifically designed for mobile braiding booking apps with:
- ✅ **No Payment Processing** - Pure booking system
- ✅ **Mobile-First API Design** - Simple, fast responses
- ✅ **Real-time Features** - Messaging & notifications ready
- ✅ **Location-Based Services** - Stylist search by proximity
- ✅ **Supabase Integration** - Modern backend-as-a-service

## 🏗️ **Architecture Overview**

```
📦 braidr-backend/
├── 📁 src/
│   ├── 🎯 controllers/     # API request handlers
│   ├── ⚙️ services/        # Business logic
│   ├── 🛣️ routes/         # API endpoints
│   ├── 📋 types/          # TypeScript interfaces
│   ├── 🔒 middleware/     # Auth & validation
│   ├── 🛠️ utils/         # Helper functions
│   └── ⚙️ config/        # Environment settings
├── 📄 package.json       # Dependencies
├── 📄 tsconfig.json      # TypeScript config
└── 📄 .env.example       # Environment template
```

## 🌟 **Key Features for Mobile App**

### 🔍 **Stylist Discovery**
- Location-based search with radius filtering
- Service category filtering (box braids, cornrows, etc.)
- Availability checking by date/time
- Portfolio image galleries

### 📅 **Appointment Booking**
- Simple booking flow (no payment complexity)
- Date/time validation
- Customer address capture for mobile services
- Automatic conflict detection

### 💬 **Real-time Messaging**
- Customer ↔ Stylist chat
- Image sharing support
- Read receipts
- Unread message counts

### ⭐ **Review System**
- Post-appointment reviews
- 1-5 star ratings
- Review moderation
- Stylist statistics

### 👤 **User Management**
- Dual roles: Customer/Stylist/Both
- Profile management
- Business hours for stylists
- Specialty/skill tagging

## 🚀 **Quick Start for a0.dev**

### 1. **Upload to GitHub**
```bash
# Create new repo in GitHub
# Upload this entire braidr-backend folder
```

### 2. **Environment Setup**
Copy `.env.example` to `.env` and configure:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8081
```

### 3. **Database Schema Setup**
Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone_number VARCHAR,
    profile_picture_url VARCHAR,
    user_type VARCHAR CHECK (user_type IN ('customer', 'stylist', 'both')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Stylist profiles
CREATE TABLE stylist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR,
    bio TEXT,
    specialties TEXT[],
    years_of_experience INTEGER,
    is_mobile BOOLEAN DEFAULT false,
    business_address JSONB,
    business_hours JSONB,
    portfolio_images TEXT[],
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Braiding services
CREATE TABLE braiding_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stylist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    estimated_duration INTEGER NOT NULL, -- minutes
    category VARCHAR NOT NULL,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    requirements TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES braiding_services(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    special_instructions TEXT,
    location JSONB NOT NULL, -- customer address
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP DEFAULT now(),
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR CHECK (message_type IN ('text', 'image')) DEFAULT 'text',
    attachment_url VARCHAR,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);
```

## 📱 **API Endpoints for Mobile Frontend**

### **Authentication**
```
POST /api/auth/register      # User registration
POST /api/auth/login         # User login  
POST /api/auth/refresh       # Refresh token
POST /api/auth/verify-email  # Email verification
```

### **Stylist Discovery**
```
GET /api/stylists/search?lat=X&lng=Y&radius=25&category=box-braids
GET /api/stylists/:id        # Stylist profile
GET /api/stylists/:id/services # Stylist services
GET /api/stylists/:id/reviews  # Stylist reviews
```

### **Appointment Booking**
```
POST /api/appointments       # Create booking
GET /api/appointments        # User's appointments  
PUT /api/appointments/:id    # Update appointment
DELETE /api/appointments/:id # Cancel appointment
```

### **Messaging**
```
GET /api/messages/conversations    # User's conversations
GET /api/messages/:conversationId # Conversation messages
POST /api/messages/:conversationId # Send message
```

### **Reviews**
```
POST /api/reviews           # Create review
GET /api/reviews/stylist/:id # Stylist reviews
GET /api/reviews/user       # User's reviews
```

## 🔄 **Real-time Features**

Supabase provides built-in real-time subscriptions for:
- **New Messages** - Instant chat updates
- **Appointment Status** - Booking confirmations
- **Stylist Availability** - Live availability updates

## 📲 **Mobile App Integration**

### **Response Format**
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { ... } // For lists
}
```

### **Error Handling**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### **Location Services**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY 10001"
  }
}
```

## 🎯 **Perfect for a0.dev Because:**

1. **🚀 Simple Setup** - Just connect GitHub repo
2. **📱 Mobile-First** - Designed for mobile app consumption  
3. **⚡ Fast Responses** - Lightweight data structures
4. **🔄 Real-time Ready** - Supabase subscriptions built-in
5. **🎨 No Complex Business Logic** - Easy to understand and modify
6. **📊 Great Documentation** - Clear API contracts

## 🛠️ **Development Commands**

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
```

## 🔧 **Customization Tips for a0.dev**

1. **Add New Endpoints** - Follow existing controller patterns
2. **Modify Data Models** - Update TypeScript interfaces in `/types`
3. **Add Real-time Features** - Use Supabase subscriptions
4. **File Uploads** - Supabase Storage already configured
5. **Push Notifications** - Add Firebase integration

---

## 🎉 **Ready to Launch!**

This backend is production-ready and optimized for mobile booking apps. Upload to GitHub, connect with a0.dev, and start building your mobile frontend! 🚀📱