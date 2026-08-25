# ----------------------------
# ----------------------------
# CONFIGURATION
# ----------------------------


"""
Backend Service for Green Score Application
Handles:
1. Monthly energy data updates (run via systemd timer)
2. Badge achievement system via Flask API
"""

import os
import csv
import datetime
import sys
from flask import Flask,make_response, request, jsonify
from supabase import create_client, Client

# ----------------------------
# CONFIGURATION
# ----------------------------

# Supabase Configuration
SUPABASE_URL = "https://txvyegrofdgnbzuxysou.supabase.co"
SUPABASE_KEY = "sb_publishable_m7k1lg1IJDx0jlpa-c-2sQ_ebvK7JS8"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# File paths for data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ELECTRICITY_FILE = os.path.join(BASE_DIR, "data", "Electricity_Data.csv")
GAS_FILE = os.path.join(BASE_DIR, "data", "Gas_Data.csv")
MAP_FILE = os.path.join(BASE_DIR, "data", "Map_Data.csv")

# Service start date
SERVICE_START_DATE = datetime.date(2022, 1, 1)

# Flask app for handling badge requests
app = Flask(__name__)

# ----------------------------
# BADGE DEFINITIONS
# ----------------------------

class BadgeConditions:
    """
    Defines all badge conditions and their requirements.
    Each badge has an ID, name, description, and condition check function.
    """

    @staticmethod
    def first_login(profile):
        """Badge: First Steps - User logs in for the first time"""
        return True  # Always true on first check

    @staticmethod
    def green_novice(profile):
        """Badge: Green Novice - Reach 50 green score"""
        return (profile.get('green_score', 0)) >= 50

    @staticmethod
    def green_champion(profile):
        """Badge: Green Champion - Reach 100 green score"""
        return (profile.get('green_score', 0)) >= 100

    @staticmethod
    def green_legend(profile):
        """Badge: Green Legend - Reach 250 green score"""
        return (profile.get('green_score', 0)) >= 250


    @staticmethod
    def reward_redeemer(profile):
        """Badge: Reward Redeemer - Redeem first reward"""
        rewards = profile.get('rewards', [])
        return len(rewards) >= 1

    @staticmethod
    def generous_soul(profile):
        """Badge: Generous Soul - Redeem 3 rewards"""
        rewards = profile.get('rewards', [])
        return len(rewards) >= 3

# Mapping of badge IDs to their condition functions
BADGE_CONDITIONS = {
    1: {
        "name": "First Steps", 
        "description": "Complete your first login to the platform",
        "check": BadgeConditions.first_login
    },
    2: {
        "name": "Green Novice", 
        "description": "Reach a green score of 50 points",
        "check": BadgeConditions.green_novice
    },
    3: {
        "name": "Green Champion", 
        "description": "Reach a green score of 100 points", 
        "check": BadgeConditions.green_champion
    },
    4: {
        "name": "Green Legend", 
        "description": "Reach a green score of 250 points",
        "check": BadgeConditions.green_legend
    },
    5: {
        "name": "Reward Redeemer", 
        "description": "Redeem your first reward",
        "check": BadgeConditions.reward_redeemer
    },
    6: {
        "name": "Generous Soul", 
        "description": "Redeem 3 or more rewards",
        "check": BadgeConditions.generous_soul
    },
}


# ----------------------------
# DATA LOADING HELPERS
# ----------------------------

def load_csv_data(filepath, column_name, key_field="Town"):
    """
    Reads a CSV file and returns {Town: value} for the given month column.

    Args:
        filepath: Path to the CSV file
        column_name: Column name to extract (e.g., "2024.1" for Jan 2024)
        key_field: The field to use as key (default: "Town")

    Returns:
        Dictionary mapping town names to their energy usage values
    """
    data = {}

    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return data

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            town = row[key_field]
            value = row.get(column_name)

            # Skip empty or invalid values
            if not value or value.strip() == "-":
                continue

            try:
                usage = float(value)
                data[town] = usage
            except ValueError:
                continue

    print(f"✅ Loaded {len(data)} towns from {os.path.basename(filepath)} ({column_name})")
    return data


def load_map_csv_data(filepath, key_field="Town"):
    """
    Loads map vertex data for polygon rendering.

    Args:
        filepath: Path to the map CSV file
        key_field: The field to use as key (default: "Town")

    Returns:
        Dictionary mapping town names to arrays of vertex coordinates
    """
    data = {}
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return data

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            town = row[key_field]
            value = row.get('vertices')

            if not value or value.strip() == "-":
                continue

            try:
                # Parse vertices format: "lat1,lon1|lat2,lon2|lat3,lon3"
                vertices_array = value.split('|')
                save_arr = []
                for vertex in vertices_array:
                    for coord in vertex.split(','):
                        save_arr.append(float(coord))

                data[town] = save_arr

            except ValueError:
                continue

    print(f"✅ Loaded {len(data)} towns from {os.path.basename(filepath)}")
    return data


# ----------------------------
# MONTHLY DATA UPDATE (CLI)
# ----------------------------

def upload_energy_data(year, month):
    """
    Uploads monthly energy data (electricity and gas) to Supabase scoreboard.
    Calculates green scores based on usage and updates database.

    This function is called by the systemd timer.

    Args:
        year: Year of the data (e.g., 2024)
        month: Month of the data (1-12)
    """
    column_name = f"{year}.{month}".strip()
    print(f"📅 Uploading data for: {column_name}")

    # Load data from both files
    electricity_data = load_csv_data(ELECTRICITY_FILE, column_name)
    gas_data = load_csv_data(GAS_FILE, column_name)

    # Get all unique towns from both datasets
    all_towns = set(electricity_data.keys()) | set(gas_data.keys())
    print(f"🏘️ Found total {len(all_towns)} towns to update")

    # Update each town in the database
    success_count = 0
    error_count = 0

    for town in all_towns:
        update_payload = {}
        elec_score = 0
        gas_score = 0

        # Add electricity data if available
        if town in electricity_data:
            update_payload["electricity"] = electricity_data[town]
            # Electricity score formula: decreases as usage increases (baseline: 410 kWh)
            elec_score = 100 / (1 + (electricity_data[town] / 410)) ** 1.3

        # Add gas data if available
        if town in gas_data:
            update_payload["gas"] = gas_data[town]
            # Gas score formula: decreases as usage increases (baseline: 70 units)
            gas_score = 100 / (1 + (gas_data[town] / 70)) ** 1.0

        # Calculate overall green score (average of electricity and gas scores)
        green_score = round((elec_score + gas_score) / 2, 1)
        update_payload["green_score"] = green_score

        # Skip if no data to update
        if not update_payload:
            continue

        try:
            # Update the scoreboard table in Supabase
            response = (
                    supabase.table("scoreboard")
                    .update(update_payload)
                    .eq("town_name", town)
                    .execute()
                    )

            print(f"⬆️ Updated {town}: {update_payload}")
            success_count += 1

        except Exception as e:
            print(f"⚠️ Error updating {town}: {str(e)}")
            error_count += 1

    print(f"🎉 Monthly data upload complete! ✅ {success_count} succeeded, ❌ {error_count} failed")
    return success_count, error_count


# ----------------------------
# BADGE CHECKING SYSTEM
# ----------------------------

def check_and_award_badges(profile):
    """
    Checks all badge conditions for a user and awards new badges.

    Args:
        profile: Dictionary containing user profile data

    Returns:
        List of newly awarded badge IDs
    """
    # Get user's current badges
    #current_badges = profile.get('badges', [])

    nric = profile['nric']
    # Check each badge condition
    for badge_id, badge_info in BADGE_CONDITIONS.items():
        # Skip if user already has this badge
        # Check if user meets the condition
        try:
            if badge_info["check"](profile):
                print(f"User {nric} earned badge: {badge_info['name']}")

                # Check if this badge already exists for the user's NRIC
                existing_badge = supabase.table("badges")\
                    .select("badge_id")\
                    .eq("nric", nric)\
                    .eq("badge_id", badge_id)\
                    .execute()

                print('Existing badges : ',existing_badge)
                # Only insert if the badge doesn't already exist for this NRIC
                if len(existing_badge.data) == 0:
                    print('inserting')
                    supabase.table("badges").insert({
                        "badge_id": badge_id,
                        "badge_name": badge_info['name'],
                        "nric": nric,
                        "description": badge_info['description']
                        }).execute()
                    print(f"Added new badge '{badge_id}' for NRIC {nric}")
                else:
                    print(f"Badge '{badge_id}' already exists for NRIC {nric}")

        except Exception as e:
            print(f"⚠️ Error checking badge {badge_id}: {str(e)}")



# ----------------------------
# FLASK API ENDPOINTS
# ----------------------------

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify service is running"""
    return jsonify({
        "status": "healthy",
        "service": "Green Score Backend",
        "timestamp": datetime.datetime.now().isoformat()
        }), 200


#    curl -X POST \
#      -H "Content-Type: application/json" \
#      -d '{"profile" : {"nric": "S1234567I", "green_score": "200","rewards":"["1","2"]"} }' \
#      http://127.0.0.1:9090/api/check-badges

@app.route('/api/check-badges', methods=['POST'])
def check_badges_endpoint():
    """
    Endpoint to check and award badges for a user.

    Expected JSON payload:
    {
        "profile": {
            "nric":...,
            "green_score": 50,
            "rewards": [...],
        }
    }

    
    """
    try:
        # Parse request data
        data = request.get_json()

            
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
                }), 400

        profile = data.get('profile')

        # Validate required fields
        if not profile:
            return jsonify({
                "success": False,
                "error": "Missing profile"
                }), 400

        # Check and award badges
        print(profile)
        check_and_award_badges(profile) # Our db will be updated accordingly
       # Access-Control-Allow-Origin
       # return 'Successfully updated ',200
        response = make_response("Success!",200)
        response.headers.add("Access-Control-Allow-Origin", "*")  # Or specific origin like "http://localhost:3000"
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        return response


    except Exception as e:
        print(f"Error in check_badges_endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
            }), 500


# ----------------------------
# WEEKLY QUIZ ASSIGNMENT
# ----------------------------

def assign_weekly_quiz_ids():
    quizzes = supabase.table("challenges") \
        .select("id") \
        .execute()

    all_ids = [q["id"] for q in quizzes.data]

    import random
    selected = random.sample(all_ids, 5)
    print("Weekly quiz IDs:", selected)
    payload = { str(qid): "" for qid in selected }

    # assign to all users
    supabase.table("userprofile") \
        .update({ "quiz_answers": payload }) \
        .neq("id", "") \
        .execute()

    return payload



# ----------------------------
# CLI MODE FOR SYSTEMD TIMER
# ----------------------------

def run_cli_update():
    """
    CLI mode for running monthly updates via systemd timer.
    Usage: python script.py update [year] [month]
    """
    if len(sys.argv) < 2:
        print("Usage: python script.py [update|server]")
        print("  update [year] [month] - Run monthly data update")
        print("  server                - Start Flask API server")
        sys.exit(1)

    command = sys.argv[1]

    if command == "update":
        # Get year and month from args or use current date
        now = datetime.datetime.now()
        year = int(sys.argv[2]) if len(sys.argv) > 2 else now.year
        month = int(sys.argv[3]) if len(sys.argv) > 3 else now.month

        print(f"🚀 Starting monthly update for {year}-{month}")
        success, errors = upload_energy_data(year, month)

        # Exit with appropriate code for systemd
        sys.exit(0 if errors == 0 else 1)

    elif command == "server":
        # Start Flask API server
        print("🌐 Starting Flask API server...")
        port = int(os.getenv('PORT', 8080))
        app.run(
                host='0.0.0.0',
                port=port,
                threaded=True,
                debug=os.getenv('DEBUG', 'False').lower() == 'true'
                )
        
    elif command == "weekly_quiz":
        print("Assigning weekly quiz questions...")
        assign_weekly_quiz_ids()
        sys.exit(0)

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


# ----------------------------
# MAIN APPLICATION
# ----------------------------

if __name__ == "__main__":
    run_cli_update()
