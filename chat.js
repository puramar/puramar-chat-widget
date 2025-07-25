// Puramar Chat Widget - Correções Mínimas UX
(function() {
    "use strict";
    
    console.log("Puramar Chat iniciado - Versão Estável");
    
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
    
    // CORREÇÃO: Função segura apenas para operações críticas
    function safeExecute(fn) {
        try {
            return fn();
        } catch (e) {
            console.warn("Chat - Operação segura falhou:", e.message);
            return false;
        }
    }
    
    // Gera ID único para o usuário
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // MANTIDO: Inicialização original que funcionava
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
            headerContentChat: document.querySelector(".header-content-chat"),
            chatInputArea: document.querySelector(".chat-input-area")
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
        
        // CORREÇÃO: Garante input sempre visível
        ensureInputVisible();
        
        // Configura event listeners
        setupEventListeners();
        
        // Configura input
        setupInput();
        
        // Garante que inicia na view home
        changeView("home");
        
        console.log("Chat configurado com sucesso");
    }
    
    // CORREÇÃO: Força input sempre visível
    function ensureInputVisible() {
        if (elements.chatInput) {
            elements.chatInput.style.display = "block";
            elements.chatInput.style.visibility = "visible";
            elements.chatInput.style.opacity = "1";
        }
        
        if (elements.chatInputArea) {
            elements.chatInputArea.style.display = "block";
            elements.chatInputArea.style.visibility = "visible";
        }
    }
    
    // MANTIDO: Função original de mudança de view
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
            
            // CORREÇÃO: Garante input visível no chat
            ensureInputVisible();
            
            // Foca no input após delay
            setTimeout(function() {
                if (elements.chatInput) {
                    // CORREÇÃO: Previne zoom no iOS
                    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        elements.chatInput.style.fontSize = "16px";
                    }
                    elements.chatInput.focus();
                }
            }, 100);
        }
        
        chatState.currentView = viewName;
        console.log("View alterada para:", viewName);
    }
    
    // MANTIDO: Função original de renderizar Markdown
    function renderMarkdown(text) {
        // Converte links em formato **[texto](url)** para HTML
        text = text.replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        
        // Converte texto em negrito **texto**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Converte quebras de linha
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // MANTIDO: Função original de adicionar mensagem
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
        setTimeout(function() {
            if (elements.messagesDisplay) {
                elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
            }
        }, 50);
        
        // Adiciona ao histórico
        chatState.history.push({
            role: sender === "user" ? "user" : "model",
            parts: [text]
        });
    }
    
    // MANTIDO: Função original de indicador de digitação
    function showTypingIndicator(show) {
        if (!elements.typingIndicator) return;
        
        elements.typingIndicator.style.display = show ? "block" : "none";
        chatState.isTyping = show;
        
        if (show && elements.messagesDisplay) {
            setTimeout(function() {
                elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
            }, 50);
        }
    }
    
    // CORREÇÃO: Função de sequência melhorada
    function processMessageSequence(messages, delay = 2500) {
        if (!messages || messages.length === 0) return;
        
        messages.forEach(function(message, index) {
            setTimeout(function() {
                showTypingIndicator(true);
                
                setTimeout(function() {
                    showTypingIndicator(false);
                    addMessage(message, "agent");
                }, 800);
                
            }, delay * index);
        });
    }
    
    // MANTIDO + CORREÇÃO: Função de enviar mensagem melhorada
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
            elements.chatInput.style.height = "auto";
            updateSendButton();
        }
        
        // Mostra indicador de digitação
        showTypingIndicator(true);
        
        // Prepara dados para API
        var data = {
            user_id: chatState.userId,
            message_history: chatState.history
        };
        
        // CORREÇÃO: Melhor handling de timeout
        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 25000; // 25 segundos
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                showTypingIndicator(false);
                
                var reply = "Estou com dificuldades técnicas no momento. Tente novamente em alguns instantes! 🤍";
                var sequence = [];
                
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.reply) {
                            reply = response.reply;
                            sequence = response.sequence || [];
                            console.log("Resposta recebida:", reply);
                            
                            // Se tem sequência
                            if (response.is_quick_topic && sequence.length > 0) {
                                console.log("Processando sequência de", sequence.length, "mensagens");
                            }
                        }
                    } catch (e) {
                        console.error("Erro ao processar resposta:", e);
                        reply = "Houve um problema ao processar sua mensagem. Pode tentar reformular? 🤍";
                    }
                } else if (xhr.status === 0) {
                    reply = "Sem conexão com o servidor. Verifique sua internet! 🤍";
                } else if (xhr.status >= 500) {
                    reply = "Nosso servidor pode estar 'acordando'... Tente novamente em 30 segundos! 🤍";
                } else {
                    console.error("Erro na requisição:", xhr.status, xhr.statusText);
                    reply = "Serviço temporariamente indisponível. Tente em alguns minutos! 🤍";
                }
                
                // Adiciona primeira resposta
                addMessage(reply, "agent");
                
                // Processa sequência se existir
                if (sequence.length > 0) {
                    processMessageSequence(sequence, 2200);
                }
            }
        };
        
        xhr.ontimeout = function() {
            showTypingIndicator(false);
            addMessage("O servidor está demorando para responder. Pode estar 'acordando' - tente novamente em 1 minuto! 🤍", "agent");
        };
        
        xhr.onerror = function() {
            showTypingIndicator(false);
            addMessage("Erro de conexão. Verifique sua internet e tente novamente! 🤍", "agent");
        };
        
        xhr.send(JSON.stringify(data));
    }
    
    // MANTIDO: Função original de atualizar botão
    function updateSendButton() {
        if (!elements.sendButton || !elements.chatInput) return;
        
        var hasText = elements.chatInput.value.trim().length > 0;
        
        if (hasText) {
            elements.sendButton.classList.add("visible");
        } else {
            elements.sendButton.classList.remove("visible");
        }
    }
    
    // MANTIDO + CORREÇÃO: Setup do input melhorado
    function setupInput() {
        if (!elements.chatInput) return;
        
        // Auto-resize do textarea
        elements.chatInput.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 100) + "px";
            updateSendButton();
        });
        
        // Enter para enviar
        elements.chatInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // CORREÇÃO: Previne zoom no iOS
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            elements.chatInput.addEventListener("focus", function() {
                this.style.fontSize = "16px";
                
                // CORREÇÃO: Controla viewport temporariamente
                var viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    var originalContent = viewport.getAttribute('content');
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    
                    // Restaura ao sair do foco
                    this.addEventListener("blur", function() {
                        if (originalContent) {
                            viewport.setAttribute('content', originalContent);
                        }
                    }, { once: true });
                }
            });
        }
        
        // CORREÇÃO: Força input sempre visível
        elements.chatInput.addEventListener("blur", function() {
            var self = this;
            setTimeout(function() {
                ensureInputVisible();
                // Re-foca se ainda estiver na view chat e não for por clique em botão
                if (chatState.currentView === "chat" && !document.activeElement.classList.contains('header-button')) {
                    self.focus();
                }
            }, 100);
        });
    }
    
    // MANTIDO: Event listeners originais
    function setupEventListeners() {
        // Botão de envio
        if (elements.sendButton) {
            elements.sendButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão enviar clicado");
                sendMessage();
            });
        }
        
        // Botões de sugestão
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
        
        // Botão voltar
        if (elements.backButton) {
            elements.backButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão voltar clicado");
                changeView("home");
            });
        }
        
        // Botão fechar
        if (elements.closeButton) {
            elements.closeButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão fechar clicado");
                
                safeExecute(function() {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage("toggle-chat-close", "*");
                    } else {
                        window.close();
                    }
                });
            });
        }
        
        // Listener para mensagens do parent
        window.addEventListener("message", function(event) {
            if (event.data === "focus-input" && elements.chatInput) {
                safeExecute(function() {
                    ensureInputVisible();
                    elements.chatInput.focus();
                });
            }
        });
    }
    
    // MANTIDO: Função de debug original
    function debugInfo() {
        return {
            currentView: chatState.currentView,
            userId: chatState.userId,
            historyLength: chatState.history.length,
            isTyping: chatState.isTyping,
            elementsFound: Object.keys(elements).filter(key => !!elements[key]).length,
            apiUrl: API_URL,
            inputVisible: elements.chatInput ? elements.chatInput.style.display !== "none" : false
        };
    }
    
    // Expõe função de debug globalmente
    window.puramarChatDebug = debugInfo;
    
    // MANTIDO: Inicialização original
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChat);
    } else {
        initChat();
    }
    
})();
