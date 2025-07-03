# Lunar Watch: NASA Data Explorer

Lunar Watch is a full-stack web application that lets you explore NASA's open APIs in a visually engaging and interactive way. Built with React (frontend) and Node.js/Express (backend), it showcases space data through images, charts, timelines, and more.

## 🌟 Features

- **Astronomy Picture of the Day (APOD):** View NASA's daily space photo with explanations.
- **Mars Rover Photos:** Search by rover, sol (Martian day), and camera. Visualize photo counts per camera.
- **Asteroid Tracker:** Track near-Earth objects, browse asteroid data, and view threat assessments.
- **VIPER Mission Timeline:** Explore and filter key events in NASA's upcoming lunar rover mission.
- **Interactive 3D Moon:** Simulate the VIPER rover's path on a 3D lunar surface.
- **Mission Log:** Add and view your own mission log entries.
- **Did You Know?:** Share and discover fun space facts.
- **Data Visualizations:** Charts and graphs for Mars Rover stats, asteroid threats, ISS tracking, and more.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### 1. Clone the Repository

```bash
git clone 
cd Nasa
```

### 2. Install Frontend Dependencies

```bash
cd front
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. NASA API Key

- Get a free NASA API key from [https://api.nasa.gov/](https://api.nasa.gov/)
- Create a `.env` file in `/backend` with:
  ```
  NASA_KEY=your_nasa_api_key_here
  PORT=5001
  ```

### 5. Start the Backend

```bash
cd backend
npm start
```

### 6. Start the Frontend

```bash
cd ../front
npm start
```

- The frontend runs on [http://localhost:3000](http://localhost:3000)
- The backend runs on [http://localhost:5001](http://localhost:5001)

## 🛰️ Deployment

- Deploy the frontend (e.g., Vercel, Netlify)
- Deploy the backend (e.g., Render, Heroku)
- Update the API base URL in `front/src/api/nasaApi.js` if deploying

## 🧪 Testing

- Frontend: `npm test` (React Testing Library)
- Backend: `npm test` (Jest)

## 📁 Project Structure

```
├── front/      # React frontend
├── backend/    # Node.js/Express backend
└── README.md   # Project overview and instructions
```

## 📋 License

MIT

---

Built for the Bounce Insights Software