# Natours API 🌲

> **Note:** This project is currently a **Work in Progress (WIP)**. I am building this as part of Jonas Schmedtmann's "Node.js, Express, MongoDB & More" Bootcamp.

## 📖 About the Project

Natours is a robust RESTful API built for a tour booking application. The goal is to allow users to browse tours, write reviews, and manage their profiles, while administrators can manage tour data and users.

This project focuses heavily on **backend logic**, **data security**, and following the **MVC (Model-View-Controller)** architecture pattern.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with MongoDB Atlas)
* **ODM:** Mongoose
* **Authentication:** JWT (JSON Web Tokens)
* **Security:** bcrypt, express-rate-limit, helmet, express-mongo-sanitize, xss-clean, hpp

## ✨ Current Features

### Tours
* **CRUD Operations:** Create, Read, Update, and Delete tours
* **Advanced Filtering:** Filter by price, difficulty, duration, rating, and more
* **Sorting & Pagination:** Efficient data retrieval for large datasets
* **Field Limiting:** Select only specific fields to return in responses
* **Geospatial Queries:** Find tours within a certain radius (e.g., "Tours within 500km of Cairo")
* **Aggregation Pipelines:** Calculate statistics like average ratings, busiest months, and tour stats

### Users & Authentication
* **User Registration:** Secure signup with encrypted passwords
* **Login System:** JWT-based authentication with HTTP-only cookies
* **Password Management:** Secure password hashing with bcrypt and password reset functionality
* **Authorization:** Role-based access control (User, Guide, Lead-Guide, Admin)
* **Protected Routes:** Middleware to protect sensitive endpoints
* **Account Management:** Users can update their profile and deactivate their accounts

### Reviews
* **Review System:** Users can create, read, update, and delete reviews for tours
* **Nested Routes:** Access reviews through tour endpoints
* **Review Restrictions:** Users can only review tours once and can only modify their own reviews
* **Average Ratings:** Automatic calculation of tour ratings based on reviews

### Error Handling & Security
* **Global Error Controller:** Centralized error handling for operational vs. programming errors
* **Security Best Practices:** Rate limiting, data sanitization, HTTP parameter pollution protection
* **Uncaught Exception Handling:** Safety nets for synchronous and asynchronous errors
* **Development vs. Production Errors:** Different error responses based on environment

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Make sure you have **Node.js** installed (v14 or higher recommended).
```bash
node -v
```

### 2. Clone the Repository
```bash
git clone https://github.com/Louaf/natours.git
cd natours
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configuration (config.env)
**⚠️ Important:** You need to create a `config.env` file in the root directory to store your environment variables. The app will not start without this file, as these secrets are ignored by Git for security reasons.

Create a file named `config.env` in the root directory and add the following:

```env
NODE_ENV=development
PORT=3000

# MongoDB Configuration
DATABASE=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@cluster0.mongodb.net/natours?retryWrites=true&w=majority
DATABASE_PASSWORD=your_actual_mongodb_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

**How to get your MongoDB connection string:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<YOUR_USERNAME>` and `<YOUR_PASSWORD>` with your database credentials
5. Make sure to whitelist your IP address in MongoDB Atlas Network Access

**Security Note:** 
- Never commit `config.env` to Git (it's already in `.gitignore`)
- Use a strong, random JWT_SECRET (at least 32 characters)

### 5. Run the Server
```bash
npm start
```

The server should now be running at `http://127.0.0.1:3000`

You should see output like:
```
App running on port 3000...
DB connection successful!
```

## 📚 API Documentation

Since the frontend is not yet built, you can test the API using **Postman**, **Insomnia**, or **Thunder Client** (VS Code extension).

### Base URL
```
http://127.0.0.1:3000/api/v1
```

### Tours Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tours` | Get all tours (supports filtering, sorting, pagination) | No |
| GET | `/tours/:id` | Get a single tour by ID | No |
| POST | `/tours` | Create a new tour | Yes (Admin) |
| PATCH | `/tours/:id` | Update a tour | Yes (Admin) |
| DELETE | `/tours/:id` | Delete a tour | Yes (Admin) |
| GET | `/tours/top-5-cheap` | Get 5 cheapest tours (aliasing example) | No |
| GET | `/tours/tour-stats` | Get tour statistics (aggregation) | No |
| GET | `/tours/monthly-plan/:year` | Get monthly tour plan | Yes (Admin/Guide) |
| GET | `/tours/tours-within/:distance/center/:latlng/unit/:unit` | Get tours within radius | No |

**Example Query:**
```
GET /api/v1/tours?difficulty=easy&price[lte]=500&sort=price
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | Register a new user |
| POST | `/users/login` | Login and receive JWT token |
| GET | `/users/logout` | Logout user |
| POST | `/users/forgotPassword` | Request password reset |
| PATCH | `/users/resetPassword/:token` | Reset password with token |

**Example Signup Request:**
```json
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "pass1234",
  "passwordConfirm": "pass1234"
}
```

### User Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/users/updateMyPassword` | Update current user's password |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/updateMe` | Update current user data (not password) |
| DELETE | `/users/deleteMe` | Deactivate current user account |

**Note:** Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Reviews Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews` | Get all reviews | No |
| POST | `/reviews` | Create a review | Yes (User) |
| GET | `/reviews/:id` | Get a single review | No |
| PATCH | `/reviews/:id` | Update a review | Yes (Owner/Admin) |
| DELETE | `/reviews/:id` | Delete a review | Yes (Owner/Admin) |
| GET | `/tours/:tourId/reviews` | Get all reviews for a tour | No |
| POST | `/tours/:tourId/reviews` | Create a review for a tour | Yes (User) |

## 📁 Project Structure

```
natours/
├── controllers/           # Route handlers and business logic
│   ├── authController.js    # Authentication logic
│   ├── errorController.js   # Global error handling
│   ├── handlerFactory.js    # Factory functions for CRUD operations (DRY principle)
│   ├── reviewController.js  # Review operations
│   ├── tourController.js    # Tour operations
│   └── userController.js    # User operations
├── models/               # Mongoose schemas and models
│   ├── reviewModel.js      # Review data model
│   ├── tourModel.js        # Tour data model
│   └── userModel.js        # User data model
├── routes/               # Express route definitions
│   ├── reviewRoutes.js     # Review endpoints
│   ├── tourRoutes.js       # Tour endpoints
│   └── userRoutes.js       # User endpoints
├── utils/                # Helper functions and utilities
│   ├── apiFeatures.js      # Query features class (filter, sort, paginate)
│   ├── appError.js         # Custom error class
│   └── catchAsync.js       # Async error wrapper
├── public/               # Static assets (CSS, JS, images)
├── app.js                # Express app configuration
├── server.js             # Server entry point and DB connection
├── package.json          # Dependencies and scripts
├── config.env            # Environment variables (create this!)
└── .gitignore            # Git ignore rules
```

## 🧪 Testing the API

### Using Postman (Recommended)
1. Download [Postman](https://www.postman.com/downloads/)
2. Import the API endpoints manually or create a new collection
3. Set the base URL as a collection variable: `{{URL}}` = `http://127.0.0.1:3000/api/v1`
4. For protected routes, save the JWT token from login and use it in Authorization headers

### Example Workflow
1. **Sign up** a new user → Receive JWT token
2. **Log in** with credentials → Receive JWT token
3. **Get all tours** → No authentication needed
4. **Create a review** → Use JWT token in Authorization header
5. **Update your profile** → Use JWT token

## 🔜 Upcoming Features

These features are planned as I continue through the course:

- [ ] **Booking System:** Allow users to book tours with payment integration (Stripe)
- [ ] **Email Functionality:** Welcome emails, password reset emails, and booking confirmations
- [ ] **File Uploads:** User profile photos and tour images using Multer and Sharp
- [ ] **Server-Side Rendering:** Dynamic web pages with Pug templates
- [ ] **Advanced Authentication:** Two-factor authentication and OAuth integration
- [ ] **Payment Processing:** Full Stripe integration for secure payments
- [ ] **Map Integration:** Interactive maps showing tour locations using Mapbox

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are always welcome! If you find any bugs or have ideas for improvement:

1. Open an issue describing the problem or suggestion
2. If you'd like to contribute code, fork the repo and create a pull request

## 👨‍💻 Author

**Louaf**
- GitHub: [@Louaf](https://github.com/Louaf)

## 🙏 Acknowledgments

- **Jonas Schmedtmann** - Course instructor and project inspiration ([Node.js Bootcamp](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/))
- **MongoDB University** - Excellent free courses on MongoDB
- **Express.js & Node.js** communities for amazing documentation

