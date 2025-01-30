document.addEventListener('DOMContentLoaded', function() {
    const ageVerifyModal = document.getElementById('ageVerifyModal');
    const mainContent = document.getElementById('mainContent');
    const chatMessages = document.getElementById('chatMessages');
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
        addBotMessage("Welcome! What would you like to explore?", [
            "Find the right strain",
            "Learn about cannabis",
            "Medical benefits"
        ]);
    }

    function addThinkingAnimation() {
        const thinking = document.createElement('div');
        thinking.className = 'thinking animate__animated animate__fadeIn';
        thinking.innerHTML = `
            Thinking<div class="thinking-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatMessages.appendChild(thinking);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return thinking;
    }

    function addMessage(message, isBot = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'} animate__animated animate__fadeIn`;
        messageDiv.innerHTML = message;
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
                        <p>THC: ${strain.thc_content}</p>
                        <p>CBD: ${strain.cbd_content}</p>
                    </div>
                    <div class="strain-details">
                        <p><strong>Effects:</strong> ${strain.effects.join(', ')}</p>
                        <p><strong>Flavors:</strong> ${strain.flavors.join(', ')}</p>
                    </div>
                    <div class="strain-description">
                        ${strain.description}
                    </div>
                </div>
            </div>
        `;
    }

    async function addBotMessage(message, choices = null) {
        const thinking = addThinkingAnimation();
        await new Promise(resolve => setTimeout(resolve, 1000));
        thinking.remove();

        addMessage(message, true);

        if (choices) {
            await new Promise(resolve => setTimeout(resolve, 300));
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
        buttonChoices.innerHTML = '';

        switch(choice) {
            case "Find the right strain":
                conversationState.step = 'experience_level';
                addBotMessage("What's your experience level?", [
                    "New to cannabis",
                    "Occasional user",
                    "Experienced user"
                ]);
                break;

            case "Learn about cannabis":
                addBotMessage("What would you like to learn about?", [
                    "Strain types",
                    "THC vs CBD",
                    "Find the right strain"
                ]);
                break;

            case "Medical benefits":
                addBotMessage("What are you looking to address?", [
                    "Pain management",
                    "Anxiety/Stress",
                    "Sleep issues",
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
                    "Energy",
                    "Creativity",
                    "Sleep",
                    "Pain Relief"
                ]);
                break;

            // Effect choices
            case "Relaxation":
            case "Energy":
            case "Creativity":
            case "Sleep":
            case "Pain Relief":
                conversationState.preferences.effect = choice;
                getRecommendation();
                break;

            case "Start over":
                conversationState.step = 'welcome';
                conversationState.preferences = {};
                initializeChat();
                break;

            default:
                if (choice === "Find another strain") {
                    conversationState.step = 'experience_level';
                    addBotMessage("What's your experience level?", [
                        "New to cannabis",
                        "Occasional user",
                        "Experienced user"
                    ]);
                } else if (choice === "No, I'm good") {
                    addBotMessage("Thanks for using our service! Feel free to start over when you're ready.", [
                        "Start over"
                    ]);
                }
        }
    }

    async function getRecommendation() {
        try {
            const thinking = addThinkingAnimation();

            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    preferences: conversationState.preferences
                })
            });

            thinking.remove();
            const data = await response.json();

            if (response.ok) {
                const recommendations = data.recommendations;

                if (recommendations.length > 0) {
                    addBotMessage("Here are your personalized recommendations:");
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const strainCards = recommendations.map(strain => createStrainCard(strain)).join('');
                    addBotMessage(strainCards);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
                addBotMessage("Would you like to explore more options?", [
                    "Find another strain",
                    "No, I'm good"
                ]);
            } else {
                addBotMessage("I couldn't find matching products. Let's try again.", [
                    "Start over",
                    "No, thanks"
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            addBotMessage("Something went wrong. Would you like to try again?", [
                "Start over",
                "No, thanks"
            ]);
        }
    }
});