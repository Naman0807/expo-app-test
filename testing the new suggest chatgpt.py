from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
import tempfile
import logging
from contextlib import contextmanager
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime
import random
import base64
from io import BytesIO
from PIL import Image
import openai
import json
import re
from openai import OpenAI

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logging.getLogger("pymongo").setLevel(logging.WARNING)
# Initialize Flask app and load environment variables
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

# Configure MongoDB connection
app.config["MONGO_URI"] = "mongodb://127.0.0.1:27017/AIClothSuggestion"
mongo = PyMongo(app)

# Configure CORS to accept requests from any origin during development
CORS(
    app, origins=["*"], supports_credentials=True, resources={r"/*": {"origins": ["*"]}}
)

# Load environment variables
load_dotenv()

# Configure Google Generative AI
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY not found in environment variables")

genai.configure(api_key=api_key)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


@contextmanager
def safe_tempfile(**kwargs):
    """Context manager for safely handling temporary files"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, **kwargs)
    try:
        yield temp_file
    finally:
        temp_file.close()
        try:
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
        except Exception as e:
            logger.warning(f"Failed to delete temporary file {temp_file.name}: {e}")


def analyze_image(image_path):
    """Analyze image using Google's Generative AI"""
    try:
        logger.info(f"Analyzing image at path: {image_path}")

        # Upload image using the File API
        uploaded_file = genai.upload_file(image_path)
        logger.info("Successfully uploaded file to Google AI")

        prompt = (
            "Analyze the clothing in this image and provide:\n"
            "1. A description with color, clothing type, wear, fit, type, and key features, separated by commas.\n"
            "2. Generate appropriate tags from these categories:\n"
            "   - Clothing type (e.g., jeans, shirt, dress)\n"
            "   - Color (e.g., blue, black, white)\n"
            "   - Wear (e.g., Topwear, Bottomwear, Footwear)\n"
            "   - Fit (e.g., slim fit, regular fit, loose)\n"
            "   - Type (e.g., Casual, Formal, Party, Sport)\n"
            "\n"
            "Format the response exactly like this:\n"
            "DESCRIPTION: [comma-separated description]\n"
            "TAGS: [tag1], [tag2], [tag3], [tag4]"
        )

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([uploaded_file, prompt])
        logger.info("Received response from Gemini model")

        text = response.text
        logger.debug(f"Raw response text: {text}")

        # Parse the response
        description = ""
        tags = []

        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("DESCRIPTION:"):
                description = line.replace("DESCRIPTION:", "").strip()
            elif line.startswith("TAGS:"):
                tags = [tag.strip() for tag in line.replace("TAGS:", "").split(",")]

        return {"description": description, "tags": tags}

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise


@app.route("/", methods=["GET"])
def test():
    """Test endpoint to verify server is running and accessible"""
    return jsonify({"status": "ok", "message": "Server is running"})


@app.route("/upload", methods=["POST", "OPTIONS"])
def upload():
    """Handle image upload and analysis"""
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers.update(
            {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
        return response

    logger.info("Received upload request")
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    if not image.filename:
        return jsonify({"error": "Invalid image file"}), 400

    try:
        with safe_tempfile(suffix=".jpg") as temp_file:
            image.save(temp_file.name)
            result = analyze_image(temp_file.name)
            return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route("/save_item", methods=["POST"])
def save_item():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided in the request"}), 400

    base64_image = data.get("imageBase64")
    description = data.get("description")
    tags = data.get("tags", [])

    if not base64_image or not description:
        return jsonify({"error": "Image data and description are required"}), 400

    try:
        clothing_item = {
            "image_data": base64_image,
            "description": description,
            "tags": tags,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        # Insert document into MongoDB
        item_id = mongo.db.clothing.insert_one(clothing_item).inserted_id

        return jsonify({"message": "Item saved successfully", "id": str(item_id)}), 201
    except Exception as e:
        logger.error(f"Error saving item to MongoDB: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to save item"}), 500


@app.route("/clothing", methods=["GET"])
def get_all_items():
    """Fetch all clothing items from the database"""
    try:
        items = mongo.db.clothing.find()
        items_list = []
        for item in items:
            items_list.append(
                {
                    "_id": str(item["_id"]),
                    "image_uri": f"data:image/jpeg;base64,{item['image_data']}",
                    "description": item["description"],
                    "tags": item["tags"],
                }
            )
        return jsonify(items_list), 200
    except Exception as e:
        logger.error(f"Error fetching clothing items: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch items"}), 500


@app.route("/clothing/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    """Delete a clothing item from the database"""
    try:
        mongo.db.clothing.delete_one({"_id": ObjectId(item_id)})
        return jsonify({"message": "Item deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting clothing item: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete item"}), 500


@app.route("/save-outfit", methods=["POST"])
def save_outfit():
    """Save a generated outfit"""
    try:
        data = request.get_json()
        if not data or "items" not in data:
            return jsonify({"error": "No outfit data provided"}), 400

        outfit_data = {
            "items": data["items"],
            "date": datetime.fromisoformat(data["date"]),
            "created_at": datetime.utcnow(),
        }

        result = mongo.db.saved_outfits.insert_one(outfit_data)
        return (
            jsonify(
                {"message": "Outfit saved successfully", "id": str(result.inserted_id)}
            ),
            201,
        )

    except Exception as e:
        logger.error(f"Error saving outfit: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to save outfit"}), 500


@app.route("/saved-outfits", methods=["GET"])
def get_saved_outfits():
    """Get all saved outfits"""
    try:
        outfits = mongo.db.saved_outfits.find().sort("created_at", -1)
        formatted_outfits = []

        for outfit in outfits:
            formatted_outfits.append(
                {
                    "_id": str(outfit["_id"]),
                    "items": outfit["items"],
                    "date": outfit["date"].isoformat(),
                }
            )

        return jsonify(formatted_outfits), 200

    except Exception as e:
        logger.error(f"Error fetching saved outfits: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to fetch saved outfits"}), 500


@app.route("/saved-outfits/<outfit_id>", methods=["DELETE"])
def delete_saved_outfit(outfit_id):
    """Delete a saved outfit"""
    try:
        result = mongo.db.saved_outfits.delete_one({"_id": ObjectId(outfit_id)})
        if result.deleted_count:
            return jsonify({"message": "Outfit deleted successfully"}), 200
        return jsonify({"error": "Outfit not found"}), 404

    except Exception as e:
        logger.error(f"Error deleting saved outfit: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to delete outfit"}), 500


if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host="0.0.0.0", debug=True, port=5000, use_reloader=False)
