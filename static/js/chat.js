document.addEventListener('DOMContentLoaded', function() {
    const ageVerifyModal = document.getElementById('ageVerifyModal');
    const mainContent = document.getElementById('mainContent');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const buttonChoices = document.getElementById('buttonChoices');

    // Age verification handlers
    document.getElementById('verifyAge').addEventListener('click', function() {
        localStorage.setItem('ageVerified', 'true');
        ageVerifyModal.style.display = 'none';
        mainContent.style.display = 'flex';
        initializeChat();
    });

    document.getElementById('declineAge').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
    });

    // Check age verification status
    if (localStorage.getItem('ageVerified') === 'true') {
        ageVerifyModal.style.display = 'none';
        mainContent.style.display = 'flex';
        initializeChat();
    }

    let conversationState = {
        step: 'welcome',
        preferences: {}
    };

    function initializeChat() {
        // Initial welcome message
        addBotMessage(`Welcome to your personal cannabis wellness guide! 👋

I'm here to help you discover the perfect cannabis products for your needs. I can assist with:

• Finding strains based on desired effects
• Learning about different consumption methods
• Understanding terpenes and cannabinoids
• Exploring medical benefits

What would you like to know more about?`, [
            "Find the right strain",
            "Learn about cannabis",
            "Consumption methods",
            "Medical benefits"
        ]);
    }

    function addMessage(message, isBot = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'} animate__animated animate__fadeIn`;
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getEffectIcon(effect) {
        // Map of common effects to their base icons
        const effectMap = {
            'relaxed': 'relaxation',
            'happy': 'creativity',
            'euphoric': 'energy',
            'creative': 'creativity',
            'focused': 'energy',
            'energetic': 'energy',
            'sleepy': 'relaxation',
            'uplifted': 'energy',
            'hungry': 'relaxation',
            'pain relief': 'relaxation'
        };

        const baseEffect = effectMap[effect.toLowerCase()] || 'relaxation';
        return `
            <div class="effect-icon">
                <img src="/static/images/effects/${baseEffect}.svg" alt="${effect} effect" />
                <span>${effect}</span>
            </div>
        `;
    }

    function createStrainCard(strain) {
        const effectIcons = strain.effects.map(effect => getEffectIcon(effect)).join('');

        return `
            <div class="strain-card animate__animated animate__fadeIn">
                <h3>${strain.name}</h3>
                <div class="strain-type">${strain.type}</div>
                <div class="strain-effect-icons">
                    ${effectIcons}
                </div>
                <div class="strain-content">
                    <div class="strain-info">
                        <p><strong>THC:</strong> ${strain.thc_content}</p>
                        <p><strong>CBD:</strong> ${strain.cbd_content}</p>
                    </div>
                    <div class="strain-details">
                        <p><strong>Effects:</strong> ${strain.effects.join(', ')}</p>
                        <p><strong>Flavors:</strong> ${strain.flavors.join(', ')}</p>
                        <p><strong>Medical Benefits:</strong> ${strain.medical_benefits.join(', ')}</p>
                        <p><strong>Growing Time:</strong> ${strain.growing_time}</p>
                    </div>
                    <div class="strain-description">
                        <p>${strain.description}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function addBotMessage(message, choices = null) {
        addMessage(message, true);
        if (choices) {
            displayChoices(choices);
        }
    }

    function displayChoices(choices) {
        buttonChoices.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button animate__animated animate__fadeIn';
            button.textContent = choice;
            button.onclick = () => handleChoice(choice);
            buttonChoices.appendChild(button);
        });
    }

    function handleChoice(choice) {
        addMessage(choice, false);

        switch(choice) {
            case "Find the right strain":
                conversationState.step = 'experience_level';
                addBotMessage("Great! Before we begin, what's your experience level with cannabis?", [
                    "New to cannabis",
                    "Occasional user",
                    "Experienced user"
                ]);
                break;

            case "Learn about cannabis":
                addBotMessage(`Cannabis education is important for responsible use. What would you like to learn about?`, [
                    "Cannabinoids (THC/CBD)",
                    "Terpenes",
                    "Strain types",
                    "Find the right strain"
                ]);
                break;

            case "Consumption methods":
                addBotMessage(`There are several ways to consume cannabis. Which method interests you?`, [
                    "Smoking",
                    "Vaping",
                    "Edibles",
                    "Tinctures",
                    "Back to main menu"
                ]);
                break;

            case "Medical benefits":
                addBotMessage(`Cannabis can help with various conditions. What are you looking to address?`, [
                    "Pain management",
                    "Anxiety/Stress",
                    "Sleep issues",
                    "Other conditions",
                    "Find the right strain"
                ]);
                break;

            // Experience level responses
            case "New to cannabis":
            case "Occasional user":
            case "Experienced user":
                conversationState.preferences.experience = choice;
                conversationState.step = 'desired_effect';
                addBotMessage("What effect are you looking for?", [
                    "Relaxation",
                    "Energy & Focus",
                    "Creativity",
                    "Pain Relief",
                    "Sleep Aid"
                ]);
                break;

            // Effect choices
            case "Relaxation":
            case "Energy & Focus":
            case "Creativity":
            case "Pain Relief":
            case "Sleep Aid":
                conversationState.preferences.effect = choice;
                getRecommendation();
                break;

            case "Back to main menu":
                conversationState.step = 'welcome';
                conversationState.preferences = {};
                initializeChat();
                break;

            default:
                if (conversationState.step === 'recommendation') {
                    if (choice === "Yes") {
                        conversationState.step = 'welcome';
                        conversationState.preferences = {};
                        initializeChat();
                    } else {
                        addBotMessage("Thank you for using our service! Feel free to come back anytime you need guidance.");
                    }
                }
        }
    }

    async function getRecommendation() {
        try {
            addBotMessage("Let me find the perfect products for you... 🔍");

            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: conversationState.preferences
                })
            });

            const data = await response.json();

            if (response.ok) {
                const recommendations = data.recommendations;
                const description = data.description;

                addBotMessage(description);

                if (recommendations.length > 0) {
                    const strainCards = recommendations.map(strain => createStrainCard(strain)).join('');
                    addBotMessage(strainCards);
                }

                conversationState.step = 'recommendation';
                addBotMessage("Would you like to explore more products or learn about something else?", [
                    "Find another strain",
                    "Learn about cannabis",
                    "No, I'm good"
                ]);
            } else {
                addBotMessage("I couldn't find any matching products right now. Would you like to try a different approach?", [
                    "Try again",
                    "Learn about cannabis",
                    "No, thanks"
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            addBotMessage("I encountered an issue while searching. Would you like to try again?", ["Yes", "No"]);
        }
    }
});