// Puramar Chat Widget - v12 (Lógica de UI e API Corrigida)
(function() {
    var API_URL = 'https://puramar-ai.onrender.com/chat/web';
    var chatState = {
        userId: localStorage.getItem('puramar_chat_user_id' ) || 'web_' + Date.now(),
        history: []
    };
    localStorage.setItem('puramar_chat_user_id', chatState.userId);

    var elements = {
        input: document.querySelector('.chat-input'),
        sendButton: document.querySelector('.icon-send-button'),
        messagesDisplay: document.querySelector('.messages-display'),
        homeView: document.querySelector('.home-view'),
        chatView: document.querySelector('.chat-view'),
        typingIndicator: document.querySelector('.typing-indicator'),
        suggestionButtons: document.querySelectorAll('.suggestion-button'),
        backButton: document.querySelector('.back-btn'),
        closeButton: document.querySelector('.close-btn'),
        headerHome: document.querySelector('.header-content-home'),
        headerChat: document.querySelector('.header-content-chat')
    };

    function switchView(viewName) {
        elements.homeView.style.display = viewName === 'chat' ? 'none' : 'flex';
        elements.chatView.style.display = viewName === 'chat' ? 'flex' : 'none';
        elements.headerHome.style.display = viewName === 'chat' ? 'none' : 'flex';
        elements.headerChat.style.display = viewName === 'chat' ? 'flex' : 'none';
    }

    function addMessage(sender, text) {
        var msgGroup = document.createElement('div');
        msgGroup.className = 'message-group ' + sender;
        var msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble ' + sender;
        msgBubble.innerHTML = text.replace(/\n/g, '  
');
        if (sender === 'agent') {
            var msgInfo = document.createElement('div');
            msgInfo.className = 'message-info';
            msgInfo.textContent = 'Puramar';
            msgGroup.appendChild(msgInfo);
        }
        msgGroup.appendChild(msgBubble);
        elements.messagesDisplay.appendChild(msgGroup);
        elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
    }

    function sendMessage(textOverride) {
        var text = textOverride || elements.input.value.trim();
        if (!text) return;

        switchView('chat');
        addMessage('user', text);
        chatState.history.push({ role: 'user', content: text });
        elements.input.value = '';
        elements.input.style.height = 'auto';
        elements.sendButton.classList.remove('visible');
        elements.typingIndicator.style.display = 'block';

        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                elements.typingIndicator.style.display = 'none';
                var reply = 'Desculpe, não consegui conectar. Tente novamente. 🩵';
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        reply = data.reply;
                    } catch (e) { console.error("Erro ao decodificar JSON:", e); }
                }
                addMessage('agent', reply);
                chatState.history.push({ role: 'assistant', content: reply });
            }
        };
        xhr.send(JSON.stringify({
            message: text,
            history: chatState.history.slice(0, -1),
            user_id: chatState.userId
        }));
    }

    elements.input.addEventListener('input', function() {
        elements.sendButton.classList.toggle('visible', elements.input.value.trim() !== '');
        elements.input.style.height = 'auto';
        elements.input.style.height = elements.input.scrollHeight + 'px';
    });
    
    // CORREÇÃO: O botão de enviar agora chama a função sendMessage sem argumento
    elements.sendButton.addEventListener('click', function() { sendMessage(); });
    
    elements.input.addEventListener('keypress', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    
    elements.suggestionButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // CORREÇÃO: Passa o texto da sugestão diretamente para a função
            sendMessage(btn.getAttribute('data-suggestion'));
        });
    });

    elements.backButton.addEventListener('click', function() { switchView('home'); });
    elements.closeButton.addEventListener('click', function() { window.parent.postMessage('toggle-chat-close', '*'); });
    window.addEventListener('message', function(event) { if (event.data === 'open-chat') { window.parent.postMessage('toggle-chat-open', '*'); } });
})();
