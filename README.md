# Cannabis Product Guide Chatbot 🌿

An MVP (Minimum Viable Product) demonstrating an AI-powered cannabis strain recommendation chatbot designed to help users find their perfect cannabis strain through an intuitive conversational interface.

## Overview

This project showcases how AI chatbots can revolutionize the cannabis retail experience by:
- Providing personalized strain recommendations based on user experience and desired effects
- Offering an approachable, emoji-rich interface that makes cannabis exploration less intimidating
- Demonstrating how cannabis companies can leverage AI to improve customer service and product matching

## Features

- 🔒 Age verification system
- 👤 Experience-level based recommendations
- 🎯 Effect-based strain matching
- 💬 Natural conversational flow
- 🎨 Aesthetically pleasing interface with transparent brown theme
- 📱 Responsive design for all devices
- 🔄 Persistent user preferences during chat session

## Technical Stack

- Backend: Flask (Python)
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Data: Mock strain database with detailed strain information
- UI Framework: Bootstrap
- Animations: Animate.css

## How It Works

1. Users verify their age (21+ or medical card)
2. The chatbot asks about cannabis experience level:
   - 🌱 New to cannabis
   - 🌿 Occasional user
   - 🍃 Experienced user
3. Users select their desired effect:
   - ✨ Relaxation
   - 💫 Energy
   - 🎨 Creativity
   - 🌙 Sleep
   - 💪 Pain Relief
4. The system provides personalized strain recommendations
5. Users can explore more options while maintaining their experience level preference

## Business Value

This MVP demonstrates how cannabis companies can:
- Improve customer satisfaction through personalized recommendations
- Reduce staff training needs with AI-powered product guidance
- Increase sales through better product matching
- Provide 24/7 product guidance to customers
- Gather valuable data about customer preferences and needs

## Future Enhancements

- Integration with real inventory systems
- User accounts and preference saving
- Detailed analytics dashboard for businesses
- Integration with e-commerce systems
- Enhanced strain information and effects database
- Multi-language support

## Getting Started

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
FLASK_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

3. Run the application:
```bash
python main.py
```

The application will be available at `http://localhost:5000`

## Demo

The chatbot guides users through a series of questions about their experience level and desired effects, then provides personalized strain recommendations complete with detailed information about THC/CBD content, effects, and flavors.

## Target Users

1. Cannabis Retailers
   - Dispensaries looking to enhance customer service
   - Online cannabis marketplaces
   - Medical marijuana providers

2. End Users
   - First-time cannabis users seeking guidance
   - Medical marijuana patients
   - Recreational users looking for specific effects

## License

This project is licensed under the MIT License - see the LICENSE file for details.
