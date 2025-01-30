document.addEventListener('DOMContentLoaded', function() {
    const ageVerifyModal = document.getElementById('ageVerifyModal');
    const mainContent = document.getElementById('mainContent');
    const chatMessages = document.getElementById('chatMessages');
    const buttonChoices = document.getElementById('buttonChoices');

    let conversationState = {
        step: 'welcome',
        preferences: {},
        experience: null // Store experience level persistently
    };

    document.getElementById('verifyAge').addEventListener('click', function() {
        localStorage.setItem('ageVerified', 'true');
        ageVerifyModal.style.display = 'none';
        mainContent.style.display = 'flex';
        initializeChat();
    });

    document.getElementById('declineAge').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
    });

    if (localStorage.getItem('ageVerified') === 'true') {
        ageVerifyModal.style.display = 'none';
        mainContent.style.display = 'flex';
        initializeChat();
    }

    function initializeChat() {
        addBotMessage("Hey there! 👋 Ready to find your perfect strain? Let's start with your experience level:", [
            "🌱 New to cannabis",
            "🌿 Occasional user",
            "🍃 Experienced user"
        ]);
    }

    function addThinkingAnimation() {
        const thinking = document.createElement('div');
        thinking.className = 'thinking animate__animated animate__fadeIn';
        thinking.innerHTML = `
            Finding the perfect match<div class="thinking-dots">
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

        if (isBot) {
            messageDiv.innerHTML = `
                <div class="bot-title">🤖 Cannabis Chat</div>
                ${message}
            `;
        } else {
            messageDiv.innerHTML = message;
        }

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
                        <p>🔍 THC: ${strain.thc_content}</p>
                        <p>💊 CBD: ${strain.cbd_content}</p>
                    </div>
                    <div class="strain-details">
                        <p><strong>✨ Effects:</strong> ${strain.effects.join(', ')}</p>
                        <p><strong>🌺 Flavors:</strong> ${strain.flavors.join(', ')}</p>
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
        const cleanChoice = choice.replace(/[🌱🌿🍃✨💫🌙💪🎨🔍✌️🌟]/g, '').trim();
        addMessage(choice, false);
        buttonChoices.innerHTML = '';

        switch(cleanChoice) {
            case "New to cannabis":
            case "Occasional user":
            case "Experienced user":
                conversationState.experience = cleanChoice; // Store experience level
                conversationState.preferences.experience = cleanChoice;
                addBotMessage("Great! What effect are you looking for? 🤔", [
                    "✨ Relaxation",
                    "💫 Energy",
                    "🎨 Creativity",
                    "🌙 Sleep",
                    "💪 Pain Relief"
                ]);
                break;

            case "Relaxation":
            case "Energy":
            case "Creativity":
            case "Sleep":
            case "Pain Relief":
                conversationState.preferences.effect = cleanChoice;
                getRecommendation();
                break;

            case "Find another strain":
                // Use stored experience level to skip directly to effects
                addBotMessage(`Based on your experience level (${conversationState.experience}), what effect are you looking for? 🤔`, [
                    "✨ Relaxation",
                    "💫 Energy",
                    "🎨 Creativity",
                    "🌙 Sleep",
                    "💪 Pain Relief"
                ]);
                break;

            case "No, I'm good":
                addBotMessage("Thanks for chatting! Come back anytime! ✌️", [
                    "Start Fresh 🌟"
                ]);
                break;

            case "Start Fresh":
                conversationState.experience = null; // Reset experience level
                initializeChat();
                break;
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
                    addBotMessage("✨ Here are your perfect matches:");
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const strainCards = recommendations.map(strain => createStrainCard(strain)).join('');
                    addBotMessage(strainCards);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
                addBotMessage("Want to explore more options? 🌿", [
                    "Find another strain 🔍",
                    "No, I'm good ✌️"
                ]);
            } else {
                addBotMessage("Oops! Let's try again! 🔄", [
                    "Start Fresh 🌟"
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            addBotMessage("Something went wrong! Let's start over! 🔄", [
                "Start Fresh 🌟"
            ]);
        }
    }
});