# AI Cloth Suggestion App 👚👖

A smart wardrobe management system that combines AI-powered clothing analysis with personalized outfit suggestions. Built with React Native (Expo) frontend and Flask backend.

## Features

- 📸 Upload and analyze clothing items using Google's Generative AI
- 🏷️ Automatic tagging and description generation for clothing items
- 👕 Smart wardrobe organization with filterable categories
- ✨ AI-powered outfit suggestions based on your wardrobe
- 💾 Save and manage favorite outfits
- 📱 Cross-platform mobile app (iOS & Android)

## Tech Stack

### Frontend

- React Native with Expo
- TypeScript
- Expo Router for navigation
- React Native Reanimated for animations
- Axios for API communication

### Backend

- Flask (Python)
- Google Generative AI for image analysis
- MongoDB for data storage
- Flask-CORS for cross-origin support
- Python-dotenv for environment management

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- MongoDB installed and running
- Google Generative AI API key
- Expo Go app (for mobile testing)

## Getting Started

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/Naman0807/expo-app-test
cd expo-app-test
```

2. Set up Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory:

```bash
API_KEY=your_google_generative_ai_api_key
```

5. Start MongoDB service on your machine

6. Run the Flask server:

```bash
python tempbackend.py
```

The backend will be available at `http://127.0.0.1:5000`

### Frontend Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Update the API URL:
   Navigate to these files and update the API_URL constant with your Flask server address.

3. Start the Expo development server:

```bash
npx expo start
```

## API Endpoints

- `GET /`: Test endpoint
- `POST /upload`: Upload and analyze clothing images
- `GET /clothing`: Retrieve all clothing items
- `DELETE /clothing/<item_id>`: Delete a clothing item
- `GET /suggest`: Get AI-powered outfit suggestions
- `POST /save_outfit`: Save an outfit combination
- `GET /saved_outfits`: Retrieve saved outfits
- `DELETE /saved_outfits/<outfit_id>`: Delete a saved outfit

## Project Structure

- `/app`: React Native frontend code
  - `/(tabs)`: Main tab navigation screens
  - `/(savedcloth)`: Saved outfits screens
- `/backend`: Flask backend code
- `/components`: Reusable React components
- `/hooks`: Custom React hooks
- `/constants`: App constants and theme configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
