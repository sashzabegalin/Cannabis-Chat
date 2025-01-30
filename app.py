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

@app.route('/api/recommend', methods=['POST'])
@limiter.limit("10 per minute")
def recommend():
    try:
        data = request.json
        preferences = data.get('preferences', {})

        # Filter strains based on preferences
        matched_strains = filter_strains(preferences)

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
            "growing_time": strain["growing_time"]
        } for strain in matched_strains]

        return jsonify({
            "recommendations": detailed_recommendations,
            "description": description
        })

    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def filter_strains(preferences):
    filtered = strains

    if preferences.get('type'):
        filtered = [s for s in filtered if s['type'].lower() == preferences['type'].lower()]

    if preferences.get('effect'):
        filtered = [s for s in filtered if preferences['effect'].lower() in [e.lower() for e in s['effects']]]

    if preferences.get('flavor'):
        filtered = [s for s in filtered if preferences['flavor'].lower() in [f.lower() for f in s['flavors']]]

    # Sort by match score (number of matching effects and flavors)
    def calculate_match_score(strain):
        effect_match = sum(1 for e in strain['effects'] if preferences.get('effect', '').lower() in e.lower())
        flavor_match = sum(1 for f in strain['flavors'] if preferences.get('flavor', '').lower() in f.lower())
        return effect_match + flavor_match

    filtered.sort(key=calculate_match_score, reverse=True)
    return filtered[:3]  # Return top 3 matches

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