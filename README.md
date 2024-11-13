# Welcome to AI Cloth Suggestion App 👚👖

This project is a combination of a Flask API backend and an Expo-based React Native frontend for a clothing recommendation and wardrobe management system.

## Backend (Flask API)

The backend is built with Flask and uses Google Generative AI for image analysis and MongoDB for data storage.

### Get started with the backend

1. Clone this repository

   ```bash
   git clone https://github.com/Naman0807/expo-app-test
   cd testapp
   ```

2. Set up your virtual environment

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory with your Google Generative AI API key:

   ```bash
   API_KEY=your_google_api_key
   ```

5. Start the Flask server

   ```bash
   python app.py
   ```

The backend will be available at `http://127.0.0.1:5000`.

### Endpoints

- `GET /`: Test endpoint to check if the server is running.
- `POST /upload`: Upload an image to analyze its contents (clothing type, description, and tags).
- `POST /save_item`: Save clothing items with an image URI, description, and tags into MongoDB.
- `GET /clothing`: Get all clothing items from the database.
- `DELETE /clothing/<item_id>`: Delete a clothing item from the database.

## Frontend (React Native with Expo)

The frontend is built using React Native and Expo, allowing users to upload images, view their wardrobe, and interact with the Flask API.

### Get started with the frontend

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

This will open a development environment where you can run the app in an emulator or physical device.

### Project Structure

- `app`: Contains the React Native code for the frontend.
- `backend`: Contains the Flask API code for image analysis and database interactions.

## Learn more

To learn more about developing your project with Flask and Expo, check out the following resources:

- [Flask documentation](https://flask.palletsprojects.com/en/2.3.x/)
- [Google Generative AI documentation](https://developers.google.com/ai)
- [MongoDB documentation](https://www.mongodb.com/docs/)
- [Expo documentation](https://docs.expo.dev/)

## Join the community

Join the community of developers building apps with Expo and Flask.

- [Expo on GitHub](https://github.com/expo/expo)
- [Flask on GitHub](https://github.com/pallets/flask)
- [MongoDB Community](https://www.mongodb.com/community)

## License

This project is licensed under the MIT License.
