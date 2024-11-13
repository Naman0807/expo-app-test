from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
import tempfile
import logging
from contextlib import contextmanager
from flask_sqlalchemy import SQLAlchemy

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app and load environment variables
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # Limit upload size to 16 MB

# db = SQLAlchemy(app)

# Configure CORS to accept requests from any origin during development
CORS(
    app, origins=["*"], supports_credentials=True, resources={r"/*": {"origins": ["*"]}}
)

# Load environment variables
load_dotenv()


# class Clothing(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     image_uri = db.Column(db.String(255), nullable=False)
#     description = db.Column(db.String(255), nullable=False)
#     tags = db.Column(db.String(255), nullable=True)


# Configure Google Generative AI
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY not found in environment variables")

genai.configure(api_key=api_key)


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
            "1. A description with color, length, fit, and key features, separated by commas.\n"
            "2. Generate appropriate tags from these categories:\n"
            "   - Clothing type (e.g., jeans, shirt, dress)\n"
            "   - Color (e.g., blue, black, white)\n"
            "   - Fit (e.g., slim fit, regular fit, loose)\n"
            "   - Category (e.g., Top Piece, Bottom Piece, Full Piece)\n"
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
    logger.debug(f"Request headers: {dict(request.headers)}")
    logger.debug(f"Request files: {dict(request.files)}")

    if "image" not in request.files:
        logger.warning("No image file in request")
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]
    if not image.filename:
        logger.warning("Empty filename")
        return jsonify({"error": "Invalid image file"}), 400

    try:
        with safe_tempfile(suffix=".jpg") as temp_file:
            image.save(temp_file.name)
            logger.info(f"Saved image to temporary file: {temp_file.name}")

            result = analyze_image(temp_file.name)
            logger.info("Successfully analyzed image")

            return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route("/save_item", methods=["POST"])
def save_item():
    data = request.json
    image_uri = data.get("imageUri")
    description = data.get("description")
    tags = ", ".join(
        data.get("tags", [])
    )  # Convert list of tags to a comma-separated string

    if not image_uri or not description:
        return jsonify({"error": "Image URI and description are required"}), 400

    # Save to database
    # new_item = Clothing(image_uri=image_uri, description=description, tags=tags)
    # db.session.add(new_item)
    # db.session.commit()

    return jsonify({"message": "Item saved successfully", "id": new_item.id})


if __name__ == "__main__":
    logger.info("Starting Flask server...")
    app.run(host="0.0.0.0", debug=True, port=5000, use_reloader=False)
