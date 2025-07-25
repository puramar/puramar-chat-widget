// Puramar Chat Widget - Otimização Android + Correção Input
(function() {
    "use strict";
    
    console.log("Puramar Chat iniciado - Versão Android Otimizada");
    
    // Configurações
    var API_URL = "https://puramar-ai.onrender.com/chat/web";
    
    // Detecção de dispositivo
    var isAndroid = /Android/i.test(navigator.userAgent);
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    var isChrome = /Chrome/i.test(navigator.userAgent);
    var isGoogleApp = /GoogleApp/i.test(navigator.userAgent);
    
    console.log("Dispositivo detectado:", {
        isAndroid: isAndroid,
        isMobile: isMobile,
        isChrome: isChrome,
        isGoogleApp: isGoogleApp,
        userAgent: navigator.userAgent
    });
    
    // Estado do chat
    var chatState = {
        userId: null,
        history: [],
        currentView: "home",
        isTyping: false,
        inputForced: false
    };
    
    // Elementos DOM
    var elements = {};
    
    // CORREÇÃO ANDROID: Função para forçar input visível
    function forceInputVisible() {
        if (!elements.chatInput || !elements.chatInputArea || !elements.chatInputWrapper) {
            return false;
        }
        
        try {
            // Força área do input
            elements.chatInputArea.style.display = "block";
            elements.chatInputArea.style.visibility = "visible";
            elements.chatInputArea.style.opacity = "1";
            elements.chatInputArea.style.position = isMobile ? "fixed" : "relative";
            elements.chatInputArea.style.bottom = isMobile ? "0" : "auto";
            elements.chatInputArea.style.left = isMobile ? "0" : "auto";
            elements.chatInputArea.style.right = isMobile ? "0" : "auto";
            elements.chatInputArea.style.width = isMobile ? "100%" : "auto";
            elements.chatInputArea.style.zIndex = isMobile ? "9999" : "200";
            elements.chatInputArea.style.minHeight = "72px";
            
            // Força wrapper do input
            elements.chatInputWrapper.style.display = "flex";
            elements.chatInputWrapper.style.visibility = "visible";
            elements.chatInputWrapper.style.opacity = "1";
            elements.chatInputWrapper.style.minHeight = "48px";
            
            // Força textarea
            elements.chatInput.style.display = "block";
            elements.chatInput.style.visibility = "visible";
            elements.chatInput.style.opacity = "1";
            elements.chatInput.style.border = "none";
            elements.chatInput.style.outline = "none";
            elements.chatInput.style.background = "transparent";
            elements.chatInput.style.fontSize = "16px"; // Previne zoom
            elements.chatInput.style.minHeight = "32px";
            elements.chatInput.style.height = "32px";
            
            chatState.inputForced = true;
            console.log("✅ Android: Input forçado a aparecer");
            return true;
            
        } catch (e) {
            console.error("❌ Erro ao forçar input visível:", e);
            return false;
        }
    }
    
    // CORREÇÃO ANDROID: Múltiplas tentativas de forçar input
    function ensureInputAlwaysVisible() {
        forceInputVisible();
        
        // CORREÇÃO ANDROID: Tentativas redundantes para garantir
        setTimeout(forceInputVisible, 100);
        setTimeout(forceInputVisible, 300);
        setTimeout(forceInputVisible, 500);
        setTimeout(forceInputVisible, 1000);
        
        // CORREÇÃO ANDROID: Específico para Android com observação contínua
        if (isAndroid) {
            var checkInputInterval = setInterval(function() {
                if (chatState.currentView === "chat" && elements.chatInput) {
                    var inputVisible = elements.chatInput.offsetHeight > 0 && 
                                     elements.chatInput.offsetWidth > 0 &&
                                     getComputedStyle(elements.chatInput).display !== "none" &&
                                     getComputedStyle(elements.chatInput).visibility !== "hidden";
                    
                    if (!inputVisible) {
                        console.warn("⚠️ Android: Input sumiu, forçando novamente");
                        forceInputVisible();
                    }
                }
            }, 2000); // Verifica a cada 2 segundos
            
            // Para o interval quando sair do chat
            window.addEventListener('beforeunload', function() {
                clearInterval(checkInputInterval);
            });
        }
    }
    
    // Gera ID único para o usuário
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // CORREÇÃO ANDROID: Inicialização com tratamento específico
    function initChat() {
        console.log("Iniciando elementos do chat - Android Otimizado");
        
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
            chatInputArea: document.querySelector(".chat-input-area"),
            chatInputWrapper: document.querySelector(".chat-input-wrapper")
        };
        
        console.log("Elementos encontrados:", {
            chatInput: !!elements.chatInput,
            sendButton: !!elements.sendButton,
            homeView: !!elements.homeView,
            chatView: !!elements.chatView,
            backButton: !!elements.backButton,
            closeButton: !!elements.closeButton,
            chatInputArea: !!elements.chatInputArea,
            chatInputWrapper: !!elements.chatInputWrapper
        });
        
        if (!elements.chatInput || !elements.sendButton || !elements.homeView || !elements.chatView) {
            console.error("Elementos essenciais não encontrados");
            return;
        }
        
        // Inicializa estado
        chatState.userId = generateUserId();
        
        // CORREÇÃO ANDROID: Força input desde o início
        ensureInputAlwaysVisible();
        
        // Configura event listeners
        setupEventListeners();
        
        // Configura input específico para Android
        setupAndroidInput();
        
        // Garante que inicia na view home
        changeView("home");
        
        console.log("Chat configurado com sucesso - Android Otimizado");
    }
    
    // CORREÇÃO ANDROID: Setup específico para input no Android
    function setupAndroidInput() {
        if (!isAndroid || !elements.chatInput) return;
        
        console.log("Configurando input específico para Android");
        
        // CORREÇÃO ANDROID: Previne zoom e melhora comportamento
        elements.chatInput.style.fontSize = "16px";
        elements.chatInput.style.webkitUserSelect = "text";
        elements.chatInput.style.userSelect = "text";
        elements.chatInput.style.webkitTouchCallout = "default";
        elements.chatInput.style.touchAction = "manipulation";
        
        // CORREÇÃO ANDROID: Handlers específicos para teclado virtual
        elements.chatInput.addEventListener('focus', function() {
            console.log("🎯 Android: Input em foco");
            
            // Força visibilidade quando ganha foco
            forceInputVisible();
            
            // CORREÇÃO ANDROID: Scroll para garantir que input está visível
            setTimeout(function() {
                if (elements.chatInputArea) {
                    elements.chatInputArea.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end',
                        inline: 'nearest'
                    });
                }
            }, 100);
            
            // CORREÇÃO ANDROID: Ajusta viewport se necessário
            var viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                var originalContent = viewport.getAttribute('content');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                
                // Restaura viewport ao perder foco
                elements.chatInput.addEventListener('blur', function() {
                    if (originalContent) {
                        viewport.setAttribute('content', originalContent);
                    }
                }, { once: true });
            }
        });
        
        elements.chatInput.addEventListener('blur', function() {
            console.log("📱 Android: Input perdeu foco");
            
            // Força visibilidade mesmo após perder foco
            setTimeout(forceInputVisible, 100);
        });
        
        // CORREÇÃO ANDROID: Detecta mudanças de viewport para teclado virtual
        var initialHeight = window.innerHeight;
        
        window.addEventListener('resize', function() {
            var currentHeight = window.innerHeight;
            var heightDiff = initialHeight - currentHeight;
            
            // Se altura diminuiu mais que 150px = teclado virtual aberto
            if (heightDiff > 150) {
                console.log("⌨️ Android: Teclado virtual detectado");
                
                // Força input visível quando teclado abre
                setTimeout(function() {
                    forceInputVisible();
                    
                    // Ajusta altura do chat se necessário
                    if (elements.chatView && chatState.currentView === "chat") {
                        elements.chatView.style.height = currentHeight + 'px';
                        elements.chatView.style.maxHeight = currentHeight + 'px';
                    }
                }, 100);
                
            } else if (heightDiff < 50) {
                console.log("📱 Android: Teclado virtual fechado");
                
                // Restaura altura quando teclado fecha
                setTimeout(function() {
                    forceInputVisible();
                    
                    if (elements.chatView && chatState.currentView === "chat") {
                        elements.chatView.style.height = "";
                        elements.chatView.style.maxHeight = "";
                    }
                }, 100);
            }
        });
    }
    
    // MANTIDO: Função original de mudança de view com melhorias Android
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
            
            // CORREÇÃO ANDROID: Força input visível no chat
            ensureInputAlwaysVisible();
            
            // CORREÇÃO ANDROID: Ajusta layout para mobile
            if (isMobile && elements.chatBody) {
                elements.chatBody = document.querySelector('.chat-body');
                if (elements.chatBody) {
                    elements.chatBody.style.paddingBottom = "0";
                    elements.chatBody.style.height = "calc(100vh - 60px - 72px)";
                    elements.chatBody.style.maxHeight = "calc(100vh - 60px - 72px)";
                }
            }
            
            // Foca no input após delay
            setTimeout(function() {
                if (elements.chatInput) {
                    try {
                        elements.chatInput.focus();
                        console.log("✅ Input focado após mudança para chat");
                    } catch (e) {
                        console.warn("⚠️ Erro ao focar input:", e);
                    }
                }
            }, isAndroid ? 500 : 100); // Mais delay no Android
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
    
    // CORREÇÃO ANDROID: Função de sequência melhorada
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
    
    // CORREÇÃO ANDROID: Função de enviar mensagem melhorada
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
        
        // CORREÇÃO ANDROID: Garante que input continua visível após enviar
        setTimeout(forceInputVisible, 100);
        
        // Mostra indicador de digitação
        showTypingIndicator(true);
        
        // Prepara dados para API
        var data = {
            user_id: chatState.userId,
            message_history: chatState.history
        };
        
        // CORREÇÃO ANDROID: Timeout maior para conexões móveis instáveis
        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = isAndroid ? 30000 : 25000; // 30s no Android vs 25s outros
        
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
                    processMessageSequence(sequence, isAndroid ? 2500 : 2200); // Mais tempo no Android
                }
                
                // CORREÇÃO ANDROID: Garante input visível após resposta
                setTimeout(forceInputVisible, 500);
            }
        };
        
        xhr.ontimeout = function() {
            showTypingIndicator(false);
            addMessage("O servidor está demorando para responder. Pode estar 'acordando' - tente novamente em 1 minuto! 🤍", "agent");
            setTimeout(forceInputVisible, 500);
        };
        
        xhr.onerror = function() {
            showTypingIndicator(false);
            addMessage("Erro de conexão. Verifique sua internet e tente novamente! 🤍", "agent");
            setTimeout(forceInputVisible, 500);
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
    
    // CORREÇÃO ANDROID: Setup do input melhorado
    function setupInput() {
        if (!elements.chatInput) return;
        
        // Auto-resize do textarea
        elements.chatInput.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 100) + "px";
            updateSendButton();
            
            // CORREÇÃO ANDROID: Garante que input continua visível
            if (isAndroid) {
                setTimeout(forceInputVisible, 50);
            }
        });
        
        // Enter para enviar
        elements.chatInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // CORREÇÃO ANDROID: Força input sempre visível
        elements.chatInput.addEventListener("blur", function() {
            var self = this;
            setTimeout(function() {
                forceInputVisible();
                
                // Re-foca se ainda estiver na view chat e não for por clique em botão
                if (chatState.currentView === "chat" && 
                    !document.activeElement.classList.contains('header-button') &&
                    !document.activeElement.classList.contains('icon-send-button')) {
                    self.focus();
                }
            }, isAndroid ? 200 : 100);
        });
    }
    
    // MANTIDO: Event listeners originais com melhorias Android
    function setupEventListeners() {
        // Botão de envio
        if (elements.sendButton) {
            elements.sendButton.addEventListener("click", function(e) {
                e.preventDefault();
                console.log("Botão enviar clicado");
                sendMessage();
                
                // CORREÇÃO ANDROID: Mantém foco no input após enviar
                setTimeout(function() {
                    if (elements.chatInput && chatState.currentView === "chat") {
                        elements.chatInput.focus();
                    }
                }, isAndroid ? 300 : 100);
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
                
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage("toggle-chat-close", "*");
                    } else {
                        window.close();
                    }
                } catch (err) {
                    console.warn("Erro ao fechar:", err);
                }
            });
        }
        
        // Listener para mensagens do parent
        window.addEventListener("message", function(event) {
            if (event.data === "focus-input" && elements.chatInput) {
                try {
                    forceInputVisible();
                    elements.chatInput.focus();
                } catch (err) {
                    console.warn("Erro ao focar input:", err);
                }
            }
        });
        
        // CORREÇÃO ANDROID: Setup específico para input
        setupInput();
        
        // CORREÇÃO ANDROID: Listeners específicos para eventos de teclado
        if (isAndroid) {
            document.addEventListener('focusin', function(e) {
                if (e.target === elements.chatInput) {
                    setTimeout(forceInputVisible, 100);
                }
            });
            
            document.addEventListener('focusout', function(e) {
                if (e.target === elements.chatInput) {
                    setTimeout(forceInputVisible, 100);
                }
            });
            
            // CORREÇÃO ANDROID: Detecta mudanças de orientação
            window.addEventListener('orientationchange', function() {
                setTimeout(function() {
                    forceInputVisible();
                    if (chatState.currentView === "chat" && elements.chatInput) {
                        elements.chatInput.focus();
                    }
                }, 500);
            });
        }
    }
    
    // MANTIDO: Função de debug original com informações Android
    function debugInfo() {
        return {
            currentView: chatState.currentView,
            userId: chatState.userId,
            historyLength: chatState.history.length,
            isTyping: chatState.isTyping,
            inputForced: chatState.inputForced,
            elementsFound: Object.keys(elements).filter(key => !!elements[key]).length,
            apiUrl: API_URL,
            inputVisible: elements.chatInput ? elements.chatInput.style.display !== "none" : false,
            device: {
                isAndroid: isAndroid,
                isMobile: isMobile,
                isChrome: isChrome,
                isGoogleApp: isGoogleApp
            },
            inputDimensions: elements.chatInput ? {
                offsetHeight: elements.chatInput.offsetHeight,
                offsetWidth: elements.chatInput.offsetWidth,
                display: getComputedStyle(elements.chatInput).display,
                visibility: getComputedStyle(elements.chatInput).visibility
            } : null,
            version: "Android Optimized"
        };
    }
    
    // Expõe função de debug globalmente
    window.puramarChatDebug = debugInfo;
    
    // CORREÇÃO ANDROID: Inicialização com timing otimizado
    function startInit() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function() {
                setTimeout(initChat, isAndroid ? 800 : 300);
            });
        } else {
            setTimeout(initChat, isAndroid ? 800 : 300);
        }
    }
    
    // Inicia inicialização
    startInit();
    
    // CORREÇÃO ANDROID: Verificação contínua pós-inicialização
    setTimeout(function() {
        if (isAndroid && chatState.currentView === "chat") {
            console.log("🔍 Android: Verificação pós-inicialização");
            forceInputVisible();
        }
    }, 3000);
    
})();
