from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from extensions import mongo

history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    # Fetch prediction history for the logged-in user
    user_id = get_jwt_identity()
    records = list(mongo.db.predictions.find(
        {"user_id": ObjectId(user_id)}).sort("created_at", -1))

    for r in records:
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
        r["created_at"] = r["created_at"].isoformat()

    return jsonify({"records": records}), 200


@history_bp.route("/history/<record_id>", methods=["DELETE"])
@jwt_required()
def delete_record(record_id):
    # Delete a specific prediction record by ID
    user_id = get_jwt_identity()
    try:
        result = mongo.db.predictions.delete_one(
            {"_id": ObjectId(record_id), "user_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Record not found"}), 404
        return jsonify({"msg": "Record deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@history_bp.route("/history", methods=["DELETE"])
@jwt_required()
def delete_all_history():
    # Delete all prediction records for the logged-in user.
    user_id = get_jwt_identity()
    try:
        result = mongo.db.predictions.delete_many(
            {"user_id": ObjectId(user_id)})
        return jsonify({"msg": f"Deleted {result.deleted_count} records."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
