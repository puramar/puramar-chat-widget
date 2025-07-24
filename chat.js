// Puramar Chat Widget - Versão Final Corrigida
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
        
        // Busca elementos - CORRIGIDO
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
            chatView: !!elements.chatView,
            backButton: !!elements.backButton,
            closeButton: !!elements.closeButton
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
        
        // Garante que inicia na view home
        changeView("home");
        
        console.log("Chat configurado com sucesso");
    }
    
    // CORREÇÃO: Função para trocar views completamente corrigida
    function changeView(viewName) {
        console.log("Mudando para view:", viewName);
        
        // Esconde todas as views primeiro
        if (elements.homeView) elements.homeView.style.display = "none";
        if (elements.chatView) elements.chatView.style.display = "none";
        if (elements.headerContentHome) elements.headerContentHome.style.display = "none";
        if (elements.headerContentChat) elements.headerContentChat.style.display = "none";
        
        if (viewName === "home") {
            // Mostra home view
            if (elements.homeView) elements.homeView.style.display = "flex";
            if (elements.headerContentHome) elements.headerContentHome.style.display = "flex";
            
            // Limpa mensagens ao voltar para home
            if (elements.messagesDisplay) {
                elements.messagesDisplay.innerHTML = "";
            }
            chatState.history = [];
            
            // Esconde indicador de digitação
            showTypingIndicator(false);
            
        } else if (viewName === "chat") {
            // Mostra chat view
            if (elements.chatView) elements.chatView.style.display = "flex";
            if (elements.headerContentChat) elements.headerContentChat.style.display = "flex";
            
            // Foca no input após um pequeno delay
            setTimeout(function() {
                if (elements.chatInput) {
                    elements.chatInput.focus();
                }
            }, 100);
        }
        
        chatState.currentView = viewName;
        console.log("View alterada para:", viewName);
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
    
    // CORREÇÃO: Função para processar sequência de mensagens
    function processMessageSequence(messages, delay = 2000) {
        if (!messages || messages.length === 0) return;
        
        messages.forEach(function(message, index) {
            setTimeout(function() {
                showTypingIndicator(true);
                
                // Pequeno delay para mostrar "digitando"
                setTimeout(function() {
                    showTypingIndicator(false);
                    addMessage(message, "agent");
                }, 1000);
                
            }, delay * index);
        });
    }
    
    // CORREÇÃO: Função para enviar mensagem totalmente corrigida
    function sendMessage(text) {
        if (!text) text = elements.chatInput ? elements.chatInput.value.trim() : "";
        if (!text) return;
        
        console.log("Enviando mensagem:", text);
        
        // SEMPRE muda para view de chat ao enviar mensagem
        changeView("chat");
        
        // Adiciona mensagem do usuário
        addMessage(text, "user");
        
        // Limpa input
        if (elements.chatInput) {
            elements.chatInput.value = "";
            elements.chatInput.style.height = "auto"; // Reset altura
            updateSendButton();
        }
        
        // Mostra indicador de digitação
        showTypingIndicator(true);
        
        // Prepara dados para API
        var data = {
            user_id: chatState.userId,
            message_history: chatState.history
        };
        
        // CORREÇÃO: Melhor tratamento de requisição
        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 30000; // 30 segundos
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                showTypingIndicator(false);
                
                var reply = "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes. 🤍";
                var sequence = [];
                
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.reply) {
                            reply = response.reply;
                            sequence = response.sequence || [];
                            console.log("Resposta recebida:", reply);
                            
                            // Se tem sequência, é tópico rápido
                            if (response.is_quick_topic && sequence.length > 0) {
                                console.log("Processando sequência de", sequence.length, "mensagens");
                            }
                        }
                    } catch (e) {
                        console.error("Erro ao processar resposta:", e);
                        reply = "Houve um problema ao processar sua mensagem. Tente reformular sua pergunta. 🤍";
                    }
                } else if (xhr.status === 0) {
                    reply = "Sem conexão com o servidor. Verifique sua internet e tente novamente. 🤍";
                } else {
                    console.error("Erro na requisição:", xhr.status, xhr.statusText);
                    reply = "Serviço temporariamente indisponível. Tente novamente em alguns minutos. 🤍";
                }
                
                // Adiciona primeira resposta
                addMessage(reply, "agent");
                
                // Processa sequência se existir
                if (sequence.length > 0) {
                    processMessageSequence(sequence, 2500);
                }
            }
        };
        
        xhr.ontimeout = function() {
            showTypingIndicator(false);
            addMessage("A resposta está demorando mais que o esperado. Tente novamente. 🤍", "agent");
        };
        
        xhr.onerror = function() {
            showTypingIndicator(false);
            addMessage("Erro de conexão. Verifique sua internet e tente novamente. 🤍", "agent");
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
        
        // Placeholder dinâmico baseado na view
        elements.chatInput.setAttribute("placeholder", "Digite sua mensagem...");
    }
    
    // CORREÇÃO: Event listeners completamente corrigidos
    function setupEventListeners() {
        // Botão de envio
        if (elements.sendButton) {
            elements.sendButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão enviar clicado");
                sendMessage();
            });
        }
        
        // Botões de sugestão - vão direto para o chat
        elements.suggestionButtons.forEach(function(button) {
            button.addEventListener("click", function(e) {
                e.preventDefault();
                var suggestion = this.getAttribute("data-suggestion");
                console.log("Sugestão clicada:", suggestion);
                if (suggestion) {
                    sendMessage(suggestion);
                }
            });
        });
        
        // Botão voltar - CORRIGIDO
        if (elements.backButton) {
            elements.backButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão voltar clicado");
                changeView("home");
            });
        }
        
        // Botão fechar - CORRIGIDO
        if (elements.closeButton) {
            elements.closeButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão fechar clicado");
                
                // Envia mensagem para o parent (widget principal)
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage("toggle-chat-close", "*");
                    } else {
                        // Fallback
                        window.close();
                    }
                } catch (err) {
                    console.log("Erro ao comunicar com parent:", err);
                }
            });
        }
        
        // Listener para mensagens do parent
        window.addEventListener("message", function(event) {
            if (event.data === "focus-input" && elements.chatInput) {
                elements.chatInput.focus();
            }
        });
        
        // CORREÇÃO: Previne zoom no iOS ao focar input
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
            elementsFound: Object.keys(elements).filter(key => !!elements[key]).length,
            apiUrl: API_URL,
            elements: elements
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
