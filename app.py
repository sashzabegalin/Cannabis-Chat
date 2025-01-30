import os
import logging
from flask import Flask, render_template, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from openai import OpenAI
import json
from mock_data import strains

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "cannabis_chat_secret_key")

# Setup rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Initialize OpenAI client
# the newest OpenAI model is "gpt-4o" which was released May 13, 2024
openai = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route('/')
def index():
    return render_template('index.html')

def filter_strains(preferences):
    filtered = strains
    logger.debug(f"Starting strain filtering with preferences: {preferences}")
    logger.debug(f"Initial number of strains: {len(filtered)}")

    # Map experience levels to recommended effects
    experience_effect_map = {
        "New to cannabis": ["Relaxed", "Happy", "Mild", "Balanced"],
        "Occasional user": ["Creative", "Uplifted", "Focused", "Energetic"],
        "Experienced user": ["Euphoric", "Potent", "Intense", "Strong"]
    }

    # Add experience-based effects to the search
    if preferences.get('experience'):
        exp_effects = experience_effect_map.get(preferences.get('experience'), [])
        logger.debug(f"Adding experience effects: {exp_effects}")
        if preferences.get('effect'):
            exp_effects.append(preferences.get('effect'))
        preferences['effect'] = exp_effects

    if preferences.get('type'):
        filtered = [s for s in filtered if s['type'].lower() == preferences['type'].lower()]
        logger.debug(f"After type filter: {len(filtered)} strains")

    if preferences.get('effect'):
        if isinstance(preferences['effect'], list):
            effects = preferences['effect']
        else:
            effects = [preferences['effect']]

        filtered = [s for s in filtered if any(
            any(desired.lower() in actual.lower() for actual in s['effects'])
            for desired in effects
        )]
        logger.debug(f"After effect filter: {len(filtered)} strains")

    # Calculate match score based on effects and experience level
    def calculate_match_score(strain):
        effect_score = 0
        if preferences.get('effect'):
            effects = preferences['effect'] if isinstance(preferences['effect'], list) else [preferences['effect']]
            effect_score = sum(1 for e in strain['effects'] if 
                             any(desired.lower() in e.lower() for desired in effects))

        experience_score = 0
        if preferences.get('experience'):
            exp_level = preferences['experience']
            if exp_level == "New to cannabis" and float(strain['thc_content'].split('-')[0]) < 18:
                experience_score += 2
            elif exp_level == "Occasional user" and 18 <= float(strain['thc_content'].split('-')[0]) <= 22:
                experience_score += 2
            elif exp_level == "Experienced user" and float(strain['thc_content'].split('-')[0]) > 22:
                experience_score += 2

        return effect_score + experience_score

    filtered.sort(key=calculate_match_score, reverse=True)
    logger.debug(f"Final number of filtered strains: {len(filtered)}")
    return filtered[:3]  # Return top 3 matches

@app.route('/api/recommend', methods=['POST'])
@limiter.limit("10 per minute")
def recommend():
    try:
        data = request.json
        preferences = data.get('preferences', {})
        logger.debug(f"Received preferences: {preferences}")

        # Filter strains based on preferences
        matched_strains = filter_strains(preferences)
        logger.debug(f"Found {len(matched_strains)} matching strains")

        if not matched_strains:
            return jsonify({
                "error": "No matching strains found",
                "recommendations": []
            }), 404

        # Get personalized description using OpenAI
        description = generate_strain_description(matched_strains[0], preferences)

        # Enhance strain data with detailed information
        detailed_recommendations = [{
            "name": strain["name"],
            "type": strain["type"],
            "effects": strain["effects"],
            "flavors": strain["flavors"],
            "thc_content": strain["thc_content"],
            "cbd_content": strain["cbd_content"],
            "description": strain["description"],
            "medical_benefits": strain["medical_benefits"],
            "growing_time": strain["growing_time"],
            "terpenes": strain.get("terpenes", []),
            "potency_level": strain.get("potency_level", "Medium"),
            "average_price": strain.get("average_price", "Market price varies"),
            "grow_difficulty": strain.get("grow_difficulty", "Moderate")
        } for strain in matched_strains]

        return jsonify({
            "recommendations": detailed_recommendations,
            "description": description
        })

    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def generate_strain_description(strain, preferences):
    try:
        prompt = f"""Generate a personalized cannabis strain recommendation description for:
        Strain: {strain['name']}
        Type: {strain['type']}
        Effects: {', '.join(strain['effects'])}
        Flavors: {', '.join(strain['flavors'])}
        User preferences: {json.dumps(preferences)}
        
        Keep the response conversational and informative."""

        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        logger.error(f"Error generating description: {str(e)}")
        return f"Based on your preferences, {strain['name']} ({strain['type']}) might be a good choice for you."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)