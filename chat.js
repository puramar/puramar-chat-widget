// Puramar Chat Widget - Versão Final Corrigida
(function() {
    'use strict';
    
    // Configurações
    var API_URL = 'https://puramar-ai.onrender.com/chat/web';
    
    // Estado do chat
    var chatState = {
        userId: localStorage.getItem('puramar_chat_user_id') || 'web_' + Date.now(),
        history: []
    };
    
    // Salva o ID do usuário
    localStorage.setItem('puramar_chat_user_id', chatState.userId);

    // Elementos DOM
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

    // Função para trocar entre views
    function switchView(viewName) {
        if (viewName === 'chat') {
            elements.homeView.style.display = 'none';
            elements.chatView.style.display = 'flex';
            elements.headerHome.style.display = 'none';
            elements.headerChat.style.display = 'flex';
        } else {
            elements.homeView.style.display = 'flex';
            elements.chatView.style.display = 'none';
            elements.headerHome.style.display = 'flex';
            elements.headerChat.style.display = 'none';
        }
    }

    // Função para adicionar mensagem ao chat
    function addMessage(sender, text) {
        var msgGroup = document.createElement('div');
        msgGroup.className = 'message-group ' + sender;
        
        // Se for mensagem do agente, adiciona info do remetente
        if (sender === 'agent') {
            var msgInfo = document.createElement('div');
            msgInfo.className = 'message-info';
            msgInfo.textContent = 'Puramar';
            msgGroup.appendChild(msgInfo);
        }
        
        var msgBubble = document.createElement('div');
        msgBubble.className = 'message-bubble ' + sender;
        msgBubble.innerHTML = text.replace(/\n/g, '<br>');
        
        msgGroup.appendChild(msgBubble);
        elements.messagesDisplay.appendChild(msgGroup);
        
        // Scroll para a última mensagem
        elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
    }

    // Função para enviar mensagem
    function sendMessage(textOverride) {
        var text = textOverride || elements.input.value.trim();
        
        if (!text) return;

        // Muda para view do chat
        switchView('chat');
        
        // Adiciona mensagem do usuário
        addMessage('user', text);
        chatState.history.push({ role: 'user', content: text });
        
        // Limpa input
        elements.input.value = '';
        elements.input.style.height = 'auto';
        elements.sendButton.classList.remove('visible');
        
        // Mostra indicador de digitação
        elements.typingIndicator.style.display = 'block';

        // Faz requisição para API
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
                    } catch (e) {
                        console.error("Erro ao decodificar JSON:", e);
                    }
                }
                
                addMessage('agent', reply);
                chatState.history.push({ role: 'assistant', content: reply });
            }
        };
        
        xhr.send(JSON.stringify({
            message: text,
            history: chatState.history.slice(0, -1), // Envia histórico sem a última mensagem
            user_id: chatState.userId
        }));
    }

    // Event listeners para input
    elements.input.addEventListener('input', function() {
        var hasText = elements.input.value.trim() !== '';
        elements.sendButton.classList.toggle('visible', hasText);
        
        // Auto-resize do textarea
        elements.input.style.height = 'auto';
        elements.input.style.height = elements.input.scrollHeight + 'px';
    });
    
    // Event listener para botão de enviar
    elements.sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // Event listener para Enter no input
    elements.input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Event listeners para botões de sugestão
    elements.suggestionButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var suggestion = btn.getAttribute('data-suggestion');
            sendMessage(suggestion);
        });
    });

    // Event listener para botão voltar
    elements.backButton.addEventListener('click', function() {
        switchView('home');
    });
    
    // Event listener para botão fechar
    elements.closeButton.addEventListener('click', function() {
        // Envia mensagem para o parent (Shopify) fechar o chat
        window.parent.postMessage('toggle-chat-close', '*');
    });

    // Listener para mensagens do parent window
    window.addEventListener('message', function(event) {
        if (event.data === 'open-chat') {
            // Se receber mensagem para abrir chat, pode fazer alguma ação específica
            window.parent.postMessage('toggle-chat-open', '*');
        }
    });

    // Inicialização
    console.log('Puramar Chat Widget carregado com sucesso!');
})();
