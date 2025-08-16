# EcoWise+

> **NOTE:** **This is a forked repository for deployment. I was the backend developer for the original project.**

A basic prototype chatbot assistant that answers questions about pollution control. Built with Angular frontend and NestJS backend, powered by IBM Watson AI.

**Note:** This is a minimal working prototype and not a production-ready application.

## Overview

EcoWise+ is an environmental chatbot that provides information and answers questions related to pollution control. Users can ask about various pollution-related topics and receive AI-generated responses from a Watson-trained agent.

## Architecture

```
.
├── frontend/     # Angular 17 application
├── backend/      # NestJS backend API
└── README.md
```

### Frontend
- **Framework:** Angular 17
- **Styling:** Tailwind CSS
- **UI:** Responsive chat interface
- **Deployment:** Vercel

### Backend
- **Framework:** NestJS
- **AI Integration:** IBM Watson AI (watsonx)
- **API Endpoint:** `/watson/query`
- **Deployment:** Render

## Features

- Real-time chat interface
- AI-powered responses about pollution control
- Server health monitoring with retry functionality
- Mobile-responsive design
- Quick category buttons for common topics

## Prerequisites

- Node.js v20.10.0 or higher
- npm package manager
- IBM Watson API credentials

## Installation

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file with required variables:
   ```
   WATSON_API_KEY=your_watson_api_key
   WATSON_SCORING_URL=your_watson_scoring_url
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open browser to `http://localhost:4200`

## API Documentation

### POST `/watson/query`

Sends a user prompt to the Watson AI agent and returns the response.

**Request Body:**
```json
{
  "prompt": "What are the effects of air pollution?"
}
```

**Response:**
```json
{
  "role": "assistant",
  "message": "AI-generated response about air pollution effects..."
}
```

## Deployment

### Frontend (Vercel)
- Deployed automatically from the `frontend/` directory
- Build command: `ng build`
- Output directory: `dist/`

### Backend (Render)
- Deployed from the `backend/` directory
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

## Current Limitations

- No user authentication
- No chat history persistence (chats disappear on page reload)
- No offline functionality
- Basic error handling
- Limited to pollution-related topics

## Development Notes

- The backend simplifies the Watson streaming response into a complete message
- Server health monitoring is implemented to handle backend connectivity issues
- Mobile-first responsive design with safe area handling for modern devices

## Future Development

This prototype serves as the foundation for a full-fledged AI assistant for pollution control, with plans to add:
- User authentication and accounts
- Chat history persistence
- Advanced features and capabilities
- Production-ready optimizations

## Technology Stack

**Frontend:**
- Angular 17
- TypeScript
- Tailwind CSS
- RxJS

**Backend:**
- NestJS
- TypeScript
- IBM Watson AI (watsonx)

**Deployment:**
- Frontend: Vercel
- Backend: Render

## Contributing

This is a prototype project. For any issues or suggestions, please contact the development team.

