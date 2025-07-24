// Puramar Chat Widget - Versão Otimizada e Robusta
(function() {
    "use strict";
    
    console.log("Puramar Chat iniciado");
    
    // Configurações
    var API_URL = "https://puramar-ai.onrender.com/chat/web";
    
    // Estado do chat
    var chatState = {
        userId: null,
        history: [],
        currentView: "home",
        isTyping: false
    };
    
    // Elementos DOM
    var elements = {};
    
    // Gera ID único para o usuário
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Aguarda o DOM carregar
    function initChat() {
        console.log("Iniciando elementos do chat");
        
        // Busca elementos
        elements = {
            chatInput: document.querySelector(".chat-input"),
            sendButton: document.querySelector(".icon-send-button"),
            homeView: document.querySelector(".home-view"),
            chatView: document.querySelector(".chat-view"),
            messagesDisplay: document.querySelector(".messages-display"),
            typingIndicator: document.querySelector(".typing-indicator"),
            suggestionButtons: document.querySelectorAll(".suggestion-button"),
            backButton: document.querySelector(".back-btn"),
            closeButton: document.querySelector(".close-btn"),
            headerContentHome: document.querySelector(".header-content-home"),
            headerContentChat: document.querySelector(".header-content-chat")
        };
        
        console.log("Elementos encontrados:", {
            chatInput: !!elements.chatInput,
            sendButton: !!elements.sendButton,
            homeView: !!elements.homeView,
            chatView: !!elements.chatView
        });
        
        if (!elements.chatInput || !elements.sendButton || !elements.homeView || !elements.chatView) {
            console.error("Elementos essenciais não encontrados");
            return;
        }
        
        // Inicializa estado
        chatState.userId = generateUserId();
        
        // Configura event listeners
        setupEventListeners();
        
        // Configura input
        setupInput();
        
        console.log("Chat configurado com sucesso");
    }
    
    // Função para trocar views
    function changeView(viewName) {
        console.log("Mudando para view:", viewName);
        
        if (viewName === "home") {
            elements.homeView.style.display = "flex";
            elements.chatView.style.display = "none";
            elements.headerContentHome.style.display = "block";
            elements.headerContentChat.style.display = "none";
            
            // Limpa mensagens ao voltar para home
            if (elements.messagesDisplay) {
                elements.messagesDisplay.innerHTML = "";
            }
            chatState.history = [];
            
        } else if (viewName === "chat") {
            elements.homeView.style.display = "none";
            elements.chatView.style.display = "flex";
            elements.headerContentHome.style.display = "none";
            elements.headerContentChat.style.display = "block";
        }
        
        chatState.currentView = viewName;
        console.log("Mudou para", viewName);
    }
    
    // Função para renderizar Markdown simples
    function renderMarkdown(text) {
        // Converte links em formato **[texto](url)** para HTML
        text = text.replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        // Converte texto em negrito **texto**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Converte quebras de linha
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // Função para adicionar mensagem
    function addMessage(text, sender) {
        console.log("Adicionando mensagem:", sender);
        
        if (!elements.messagesDisplay) return;
        
        var messageGroup = document.createElement("div");
        messageGroup.className = "message-group " + sender;
        
        var messageBubble = document.createElement("div");
        messageBubble.className = "message-bubble " + sender;
        
        // Renderiza Markdown apenas para mensagens do agente
        if (sender === "agent") {
            messageBubble.innerHTML = renderMarkdown(text);
        } else {
            messageBubble.textContent = text;
        }
        
        messageGroup.appendChild(messageBubble);
        elements.messagesDisplay.appendChild(messageGroup);
        
        // Scroll para baixo
        elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
        
        // Adiciona ao histórico
        chatState.history.push({
            role: sender === "user" ? "user" : "model",
            parts: [text]
        });
    }
    
    // Função para mostrar/esconder indicador de digitação
    function showTypingIndicator(show) {
        if (!elements.typingIndicator) return;
        
        elements.typingIndicator.style.display = show ? "block" : "none";
        chatState.isTyping = show;
        
        if (show && elements.messagesDisplay) {
            elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
        }
    }
    
    // Função para enviar mensagem
    function sendMessage(text) {
        if (!text) text = elements.chatInput ? elements.chatInput.value.trim() : "";
        if (!text) return;
        
        console.log("Enviando:", text);
        
        // Muda para view de chat se não estiver
        if (chatState.currentView !== "chat") {
            changeView("chat");
        }
        
        // Adiciona mensagem do usuário
        addMessage(text, "user");
        
        // Limpa input
        if (elements.chatInput) {
            elements.chatInput.value = "";
            updateSendButton();
        }
        
        // Mostra indicador de digitação
        showTypingIndicator(true);
        
        // Envia para API
        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                showTypingIndicator(false);
                
                var reply = "Desculpe, não consegui processar sua mensagem no momento. Tente novamente em alguns instantes. 🤍";
                
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.reply) {
                            reply = response.reply;
                            console.log("Resposta recebida do CrmAgent:", reply);
                        }
                    } catch (e) {
                        console.error("Erro ao processar resposta:", e);
                    }
                } else {
                    console.error("Erro na requisição:", xhr.status, xhr.statusText);
                }
                
                // Adiciona resposta
                addMessage(reply, "agent");
            }
        };
        
        // Dados para enviar
        var data = {
            user_id: chatState.userId,
            message_history: chatState.history
        };
        
        xhr.send(JSON.stringify(data));
    }
    
    // Função para atualizar botão de envio
    function updateSendButton() {
        if (!elements.sendButton || !elements.chatInput) return;
        
        var hasText = elements.chatInput.value.trim().length > 0;
        
        if (hasText) {
            elements.sendButton.classList.add("visible");
        } else {
            elements.sendButton.classList.remove("visible");
        }
    }
    
    // Função para configurar input
    function setupInput() {
        if (!elements.chatInput) return;
        
        // Auto-resize do textarea
        elements.chatInput.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 100) + "px";
            updateSendButton();
        });
        
        // Enter para enviar (Shift+Enter para nova linha)
        elements.chatInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Foco inicial
        setTimeout(function() {
            if (elements.chatInput && chatState.currentView === "chat") {
                elements.chatInput.focus();
            }
        }, 100);
    }
    
    // Função para configurar event listeners
    function setupEventListeners() {
        // Botão de envio
        if (elements.sendButton) {
            elements.sendButton.addEventListener("click", function() {
                sendMessage();
            });
        }
        
        // Botões de sugestão
        elements.suggestionButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                var suggestion = this.getAttribute("data-suggestion");
                console.log("Sugestão clicada:", suggestion);
                sendMessage(suggestion);
            });
        });
        
        // Botão voltar
        if (elements.backButton) {
            elements.backButton.addEventListener("click", function() {
                console.log("⬅️ Botão voltar clicado");
                changeView("home");
            });
        }
        
        // Botão fechar
        if (elements.closeButton) {
            elements.closeButton.addEventListener("click", function() {
                console.log("❌ Botão fechar clicado");
                // Envia mensagem para o parent (Shopify)
                if (window.parent) {
                    window.parent.postMessage("toggle-chat-close", "*");
                }
            });
        }
        
        // Listener para mensagens do parent
        window.addEventListener("message", function(event) {
            if (event.data === "focus-input" && elements.chatInput) {
                elements.chatInput.focus();
            }
        });
        
        // Previne zoom no iOS ao focar input
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            if (elements.chatInput) {
                elements.chatInput.addEventListener("focus", function() {
                    this.style.fontSize = "16px";
                });
                
                elements.chatInput.addEventListener("blur", function() {
                    this.style.fontSize = "";
                });
            }
        }
    }
    
    // Função para debug
    function debugInfo() {
        return {
            currentView: chatState.currentView,
            userId: chatState.userId,
            historyLength: chatState.history.length,
            isTyping: chatState.isTyping,
            elementsFound: Object.keys(elements).filter(key => !!elements[key]).length
        };
    }
    
    // Expõe função de debug globalmente
    window.puramarChatDebug = debugInfo;
    
    // Inicialização
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChat);
    } else {
        initChat();
    }
    
})();

