// Puramar Chat Widget - Versão Final com Debug
(function() {
    'use strict';
    
    console.log('🚀 Puramar Chat JS iniciado');
    
    // Configurações
    var API_URL = 'https://puramar-ai.onrender.com/chat/web';
    
    // Estado do chat
    var chatState = {
        userId: localStorage.getItem('puramar_chat_user_id') || 'web_' + Date.now(),
        history: []
    };
    
    // Salva o ID do usuário
    localStorage.setItem('puramar_chat_user_id', chatState.userId);
    console.log('👤 User ID:', chatState.userId);

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

    // Verifica se todos os elementos foram encontrados
    console.log('📋 Elementos encontrados:', {
        input: !!elements.input,
        sendButton: !!elements.sendButton,
        homeView: !!elements.homeView,
        chatView: !!elements.chatView,
        suggestionButtons: elements.suggestionButtons.length
    });

    // Função para trocar entre views
    function switchView(viewName) {
        console.log('🔄 Trocando para view:', viewName);
        
        if (viewName === 'chat') {
            elements.homeView.style.display = 'none';
            elements.chatView.style.display = 'flex';
            if (elements.headerHome) elements.headerHome.style.display = 'none';
            if (elements.headerChat) elements.headerChat.style.display = 'flex';
            console.log('✅ Mudou para chat view');
        } else {
            elements.homeView.style.display = 'flex';
            elements.chatView.style.display = 'none';
            if (elements.headerHome) elements.headerHome.style.display = 'flex';
            if (elements.headerChat) elements.headerChat.style.display = 'none';
            console.log('✅ Mudou para home view');
        }
    }

    // Função para adicionar mensagem ao chat
    function addMessage(sender, text) {
        console.log('💬 Adicionando mensagem:', sender, text.substring(0, 50) + '...');
        
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
        console.log('✅ Mensagem adicionada');
    }

    // Função para enviar mensagem
    function sendMessage(textOverride) {
        var text = textOverride || elements.input.value.trim();
        console.log('📤 Enviando mensagem:', text);
        
        if (!text) {
            console.log('❌ Texto vazio, não enviando');
            return;
        }

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
        console.log('⌨️ Mostrando indicador de digitação');

        // Faz requisição para API
        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log('📡 Resposta da API:', xhr.status);
                elements.typingIndicator.style.display = 'none';
                
                var reply = 'Desculpe, não consegui conectar. Tente novamente. 💝';
                
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        reply = data.reply;
                        console.log('✅ Resposta recebida da API');
                    } catch (e) {
                        console.error("❌ Erro ao decodificar JSON:", e);
                    }
                } else {
                    console.error("❌ Erro na requisição:", xhr.status);
                }
                
                addMessage('agent', reply);
                chatState.history.push({ role: 'assistant', content: reply });
            }
        };
        
        var payload = {
            message: text,
            history: chatState.history.slice(0, -1),
            user_id: chatState.userId
        };
        
        console.log('📡 Enviando para API:', payload);
        xhr.send(JSON.stringify(payload));
    }

    // Event listeners para input
    if (elements.input) {
        elements.input.addEventListener('input', function() {
            var hasText = elements.input.value.trim() !== '';
            elements.sendButton.classList.toggle('visible', hasText);
            
            // Auto-resize do textarea
            elements.input.style.height = 'auto';
            elements.input.style.height = elements.input.scrollHeight + 'px';
        });
        
        // Event listener para Enter no input
        elements.input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('⏎ Enter pressionado no input');
                sendMessage();
            }
        });
        
        console.log('✅ Event listeners do input configurados');
    }
    
    // Event listener para botão de enviar
    if (elements.sendButton) {
        elements.sendButton.addEventListener('click', function() {
            console.log('🖱️ Botão de enviar clicado');
            sendMessage();
        });
        console.log('✅ Event listener do botão enviar configurado');
    }
    
    // Event listeners para botões de sugestão
    if (elements.suggestionButtons.length > 0) {
        elements.suggestionButtons.forEach(function(btn, index) {
            btn.addEventListener('click', function() {
                var suggestion = btn.getAttribute('data-suggestion');
                console.log('💡 Sugestão clicada:', suggestion);
                sendMessage(suggestion);
            });
        });
        console.log('✅ Event listeners das sugestões configurados:', elements.suggestionButtons.length);
    }

    // Event listener para botão voltar
    if (elements.backButton) {
        elements.backButton.addEventListener('click', function() {
            console.log('⬅️ Botão voltar clicado');
            switchView('home');
        });
        console.log('✅ Event listener do botão voltar configurado');
    }
    
    // Event listener para botão fechar
    if (elements.closeButton) {
        elements.closeButton.addEventListener('click', function() {
            console.log('❌ Botão fechar clicado');
            // Envia mensagem para o parent (Shopify) fechar o chat
            window.parent.postMessage('toggle-chat-close', '*');
        });
        console.log('✅ Event listener do botão fechar configurado');
    }

    // Listener para mensagens do parent window
    window.addEventListener('message', function(event) {
        console.log('📨 Mensagem recebida do parent:', event.data);
        if (event.data === 'open-chat') {
            window.parent.postMessage('toggle-chat-open', '*');
        }
    });

    // Teste inicial - verificar se está funcionando
    setTimeout(function() {
        console.log('🔍 Verificação inicial:');
        console.log('- Home view visível:', elements.homeView.style.display !== 'none');
        console.log('- Chat view visível:', elements.chatView.style.display === 'flex');
        console.log('- Input funcionando:', !!elements.input);
        console.log('- Botões de sugestão:', elements.suggestionButtons.length);
    }, 1000);

    console.log('✅ Puramar Chat Widget carregado com sucesso!');
})();
