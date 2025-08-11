from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from extensions import mongo
import datetime
import joblib
import pandas as pd
from tensorflow.keras.models import load_model
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "nn_model.keras")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "..", "models", "preprocessor.pkl")

# Load model and preprocessor once
model = load_model(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)

# Expected feature order
FEATURE_ORDER = [
    "Age", "RestingBP", "Cholesterol", "MaxHR", "Oldpeak",
    "Sex", "ChestPainType", "RestingECG", "ExerciseAngina",
    "ST_Slope", "FastingBS"
]

# Baseline healthy ranges
HEALTHY_BASELINE = {
    "Age": 30,
    "RestingBP": 120,
    "Cholesterol": 180,
    "MaxHR": 140,
    "Oldpeak": 0,
    "Sex": "F",
    "ChestPainType": "ATA",
    "RestingECG": "Normal",
    "ExerciseAngina": "N",
    "ST_Slope": "Up",
    "FastingBS": 0
}

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():
    try:
        user_id = ObjectId(get_jwt_identity())
        data = request.get_json()
        input_df = pd.DataFrame([data], columns=FEATURE_ORDER)
        processed_input = preprocessor.transform(input_df)
        prediction_proba = float(model.predict(processed_input)[0][0])
        prediction = "High Risk" if prediction_proba >= 0.5 else "Low Risk"
        confidence = prediction_proba if prediction == "High Risk" else 1 - prediction_proba

        record = {
            "user_id": user_id,
            "input": data,
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "features": FEATURE_ORDER,
            "baseline": HEALTHY_BASELINE,
            "created_at": datetime.datetime.utcnow()
        }
        result = mongo.db.predictions.insert_one(record)

        return jsonify({
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "features": FEATURE_ORDER,
            "input": data,
            "baseline": HEALTHY_BASELINE,
            "record_id": str(result.inserted_id)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
