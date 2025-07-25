// Puramar Chat Widget - Versão Corrigida para Bugs de UX
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
        isTyping: false,
        isInitialized: false
    };
    
    // Elementos DOM
    var elements = {};
    
    // CORREÇÃO: Previne conflitos com outros scripts
    function safeExecute(fn, context) {
        try {
            return fn.call(context);
        } catch (e) {
            console.warn("Erro seguro capturado:", e.message);
            return null;
        }
    }
    
    // Gera ID único para o usuário
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // CORREÇÃO: Inicialização mais robusta
    function initChat() {
        console.log("Iniciando elementos do chat");
        
        // Aguarda um pouco para evitar conflitos com Shopify
        setTimeout(function() {
            safeExecute(function() {
                initChatElements();
            });
        }, 500);
    }
    
    function initChatElements() {
        // Busca elementos com verificação de segurança
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
            chatBody: document.querySelector(".chat-body"),
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
            console.error("Elementos essenciais não encontrados - tentando novamente em 1s");
            setTimeout(initChatElements, 1000);
            return;
        }
        
        // Inicializa estado
        chatState.userId = generateUserId();
        
        // CORREÇÃO: Força elementos visíveis
        ensureElementsVisible();
        
        // Configura event listeners
        setupEventListeners();
        
        // Configura input
        setupInput();
        
        // Garante que inicia na view home
        changeView("home");
        
        // CORREÇÃO: Previne zoom em iOS
        preventIOSZoom();
        
        chatState.isInitialized = true;
        console.log("Chat configurado com sucesso");
    }
    
    // CORREÇÃO: Garante que elementos críticos estão visíveis
    function ensureElementsVisible() {
        // Força input area sempre visível
        if (elements.chatInputArea) {
            elements.chatInputArea.style.display = "block";
            elements.chatInputArea.style.visibility = "visible";
            elements.chatInputArea.style.opacity = "1";
        }
        
        // Força input sempre visível
        if (elements.chatInput) {
            elements.chatInput.style.display = "block";
            elements.chatInput.style.visibility = "visible";
            elements.chatInput.style.opacity = "1";
        }
        
        // Força botão de envio posicionado
        if (elements.sendButton) {
            elements.sendButton.style.position = "relative";
        }
    }
    
    // CORREÇÃO: Previne zoom em iOS
    function preventIOSZoom() {
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // Previne zoom ao focar input
            if (elements.chatInput) {
                elements.chatInput.addEventListener("focus", function() {
                    this.style.fontSize = "16px";
                    this.style.transformOrigin = "center";
                    // Força viewport estável
                    var viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        var originalContent = viewport.getAttribute('content');
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                        
                        // Restaura depois
                        this.addEventListener("blur", function() {
                            if (originalContent) {
                                viewport.setAttribute('content', originalContent);
                            }
                        }, { once: true });
                    }
                });
            }
        }
    }
    
    // CORREÇÃO: Função para trocar views com verificações extras
    function changeView(viewName) {
        console.log("Mudando para view:", viewName);
        
        if (!chatState.isInitialized) {
            console.warn("Chat não inicializado ainda");
            return;
        }
        
        safeExecute(function() {
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
                ensureElementsVisible();
                
                // Foca no input após delay
                setTimeout(function() {
                    if (elements.chatInput && elements.chatInput.style.display !== "none") {
                        elements.chatInput.focus();
                    }
                }, 200);
            }
            
            chatState.currentView = viewName;
            console.log("View alterada para:", viewName);
        });
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
        
        if (!elements.messagesDisplay) {
            console.warn("messagesDisplay não encontrado");
            return;
        }
        
        safeExecute(function() {
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
            
            // Scroll para baixo com delay
            setTimeout(function() {
                if (elements.messagesDisplay) {
                    elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
                }
            }, 100);
            
            // Adiciona ao histórico
            chatState.history.push({
                role: sender === "user" ? "user" : "model",
                parts: [text]
            });
        });
    }
    
    // Função para mostrar/esconder indicador de digitação
    function showTypingIndicator(show) {
        if (!elements.typingIndicator) return;
        
        safeExecute(function() {
            elements.typingIndicator.style.display = show ? "block" : "none";
            chatState.isTyping = show;
            
            if (show && elements.messagesDisplay) {
                setTimeout(function() {
                    elements.messagesDisplay.scrollTop = elements.messagesDisplay.scrollHeight;
                }, 100);
            }
        });
    }
    
    // CORREÇÃO: Função para processar sequência de mensagens com melhor timing
    function processMessageSequence(messages, delay = 2500) {
        if (!messages || messages.length === 0) return;
        
        messages.forEach(function(message, index) {
            setTimeout(function() {
                showTypingIndicator(true);
                
                // Delay menor para mostrar "digitando"
                setTimeout(function() {
                    showTypingIndicator(false);
                    addMessage(message, "agent");
                }, 800);
                
            }, delay * index);
        });
    }
    
    // CORREÇÃO: Função para enviar mensagem com melhor error handling
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
        
        // CORREÇÃO: Timeout mais curto e melhor error handling
        var xhr = new XMLHttpRequest();
        xhr.open("POST", API_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 25000; // 25 segundos
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                showTypingIndicator(false);
                
                var reply = "Estou com dificuldades técnicas no momento. Aguarde um minutinho e tente novamente! 🤍";
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
                    reply = "Nosso servidor está acordando... Tente novamente em 30 segundos! 🤍";
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
            addMessage("O servidor está demorando para responder. Nosso sistema pode estar 'acordando' - tente novamente em 1 minuto! 🤍", "agent");
        };
        
        xhr.onerror = function() {
            showTypingIndicator(false);
            addMessage("Erro de conexão. Verifique sua internet e tente novamente! 🤍", "agent");
        };
        
        xhr.send(JSON.stringify(data));
    }
    
    // Função para atualizar botão de envio
    function updateSendButton() {
        if (!elements.sendButton || !elements.chatInput) return;
        
        safeExecute(function() {
            var hasText = elements.chatInput.value.trim().length > 0;
            
            if (hasText) {
                elements.sendButton.classList.add("visible");
            } else {
                elements.sendButton.classList.remove("visible");
            }
        });
    }
    
    // CORREÇÃO: Setup do input mais robusto
    function setupInput() {
        if (!elements.chatInput) return;
        
        // Auto-resize do textarea
        elements.chatInput.addEventListener("input", function() {
            safeExecute(function() {
                this.style.height = "auto";
                this.style.height = Math.min(this.scrollHeight, 100) + "px";
                updateSendButton();
            }.bind(this));
        });
        
        // Enter para enviar
        elements.chatInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // CORREÇÃO: Previne perda de foco
        elements.chatInput.addEventListener("blur", function() {
            // Re-foca após pequeno delay se estiver na view chat
            setTimeout(function() {
                if (chatState.currentView === "chat" && document.activeElement !== elements.chatInput) {
                    // Só re-foca se não for por causa de clique em botão
                    if (!document.activeElement || !document.activeElement.classList.contains('header-button')) {
                        elements.chatInput.focus();
                    }
                }
            }, 100);
        });
    }
    
    // CORREÇÃO: Event listeners com melhor error handling
    function setupEventListeners() {
        // Botão de envio
        if (elements.sendButton) {
            elements.sendButton.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Botão enviar clicado");
                sendMessage();
            });
        }
        
        // Botões de sugestão
        elements.suggestionButtons.forEach(function(button) {
            button.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
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
                e.stopPropagation();
                console.log("Botão voltar clicado");
                changeView("home");
            });
        }
        
        // Botão fechar
        if (elements.closeButton) {
            elements.closeButton.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
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
                    elements.chatInput.focus();
                });
            }
        });
    }
    
    // Função para debug
    function debugInfo() {
        return {
            currentView: chatState.currentView,
            userId: chatState.userId,
            historyLength: chatState.history.length,
            isTyping: chatState.isTyping,
            isInitialized: chatState.isInitialized,
            elementsFound: Object.keys(elements).filter(key => !!elements[key]).length,
            apiUrl: API_URL,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                zoom: window.devicePixelRatio
            }
        };
    }
    
    // Expõe função de debug globalmente
    window.puramarChatDebug = debugInfo;
    
    // CORREÇÃO: Inicialização mais segura
    function safeInit() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initChat);
        } else {
            // Aguarda um pouco para evitar conflitos
            setTimeout(initChat, 300);
        }
    }
    
    // Inicializa quando seguro
    safeInit();
    
})();
