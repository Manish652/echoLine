# Chat App - Real-time Messaging Application

A modern, full-stack chat application built with React, Node.js, Express, Socket.io, and Cloudinary for image handling.

## 🚀 Features

- **Real-time Messaging**: Instant chat using Socket.io
- **Image Sharing**: Upload and share images via Cloudinary
- **User Authentication**: Secure signup/login with JWT
- **Profile Management**: Update profile pictures
- **Online Status**: See who's online
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Emoji Support**: Built-in emoji picker

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- DaisyUI
- Socket.io Client
- Axios
- React Router
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary
- Multer (for file uploads)
- bcryptjs

## 📁 Project Structure

```
CHART-APPnew/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── lib/            # Utilities and configurations
│   │   └── index.js        # Server entry point
│   ├── .env.example        # Environment variables template
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── lib/            # Utilities
│   │   └── main.jsx        # App entry point
│   ├── .env.example        # Environment variables template
│   ├── .gitignore
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CHART-APPnew
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Variables (Backend)**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/chat_db
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Environment Variables (Frontend)**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` if needed:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status
- `PUT /api/auth/update-profile` - Update profile picture

### Messages
- `GET /api/messages/users` - Get all users for sidebar
- `GET /api/messages/chat/:chatId` - Get messages with specific user
- `POST /api/messages/send/:receiverId` - Send message

## 🔧 Configuration

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

### MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to your `.env` file

## 🎯 Key Features Implementation

### Cloudinary Integration
- All images are uploaded to Cloudinary
- Automatic image optimization and resizing
- No local file storage required
- Supports profile pictures and chat images

### Real-time Communication
- Socket.io for instant messaging
- Online user tracking
- Real-time message delivery
- Automatic reconnection handling

### Security
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MONGODB_URL in `.env`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Cloudinary Upload Error**
   - Verify your Cloudinary credentials
   - Check your Cloudinary account limits

3. **Socket Connection Issues**
   - Ensure backend is running on correct port
   - Check CORS configuration

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 📞 Support

For support, please open an issue in the repository or contact the development team.
