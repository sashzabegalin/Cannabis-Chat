document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const buttonChoices = document.getElementById('buttonChoices');

    let conversationState = {
        step: 'welcome',
        preferences: {}
    };

    // Initial welcome message
    addBotMessage("Welcome to Cannabis Chat! I'm here to help you find the perfect strain. What type of cannabis are you interested in?", [
        "Indica",
        "Sativa",
        "Hybrid"
    ]);

    function addMessage(message, isBot = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'} animate__animated animate__fadeIn`;
        messageDiv.innerHTML = message; // Changed from textContent to innerHTML to support HTML content
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createStrainCard(strain) {
        return `
            <div class="strain-card animate__animated animate__fadeIn">
                <h3>${strain.name}</h3>
                <div class="strain-type">${strain.type}</div>
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

        switch(conversationState.step) {
            case 'welcome':
                conversationState.preferences.type = choice;
                conversationState.step = 'effect';
                addBotMessage("What effect are you looking for?", [
                    "Relaxed",
                    "Energetic",
                    "Creative",
                    "Sleepy",
                    "Happy"
                ]);
                break;

            case 'effect':
                conversationState.preferences.effect = choice;
                conversationState.step = 'flavor';
                addBotMessage("What flavor profile do you prefer?", [
                    "Earthy",
                    "Sweet",
                    "Citrus",
                    "Berry",
                    "Pine"
                ]);
                break;

            case 'flavor':
                conversationState.preferences.flavor = choice;
                conversationState.step = 'recommendation';
                getRecommendation();
                break;
        }
    }

    async function getRecommendation() {
        try {
            addBotMessage("Let me find the perfect strain for you...");

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

                // Reset conversation
                conversationState.step = 'welcome';
                addBotMessage("Would you like to find another strain?", ["Yes", "No"]);
            } else {
                addBotMessage("I'm sorry, I couldn't find any matching strains. Would you like to try again?", ["Yes", "No"]);
            }
        } catch (error) {
            console.error('Error:', error);
            addBotMessage("I'm sorry, something went wrong. Would you like to try again?", ["Yes", "No"]);
        }
    }
});