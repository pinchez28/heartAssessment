import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from extensions import mongo, bcrypt
from routes.auth_routes import auth_bp
from routes.analyze_routes import analyze_bp
from routes.history_routes import history_bp

# Load environment variables
load_dotenv()


def create_app():
    app = Flask(__name__)

    # Config from .env
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        hours=6)  # Tokens expire in 6 hours

    # Initialize extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {
        "origins": "http://localhost:5173",
        "supports_credentials": True
    }})

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(analyze_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")

    return app


# Entry point
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5050)
