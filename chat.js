// Puramar Chat Widget - SEU CÓDIGO + Correções Pontuais
(function() {
    "use strict";
    
    console.log("Puramar Chat iniciado");
    
    // Configurações
    var API_URL = "https://puramar-ai.onrender.com/chat/web";
    
    // Estado do chat
    var chatState = {
        userId: null,
        history: []
    };
    
    // Inicializa o user ID
    try {
        chatState.userId = localStorage.getItem("puramar_chat_user_id") || "web_" + Date.now();
        localStorage.setItem("puramar_chat_user_id", chatState.userId);
    } catch (e) {
        chatState.userId = "web_" + Date.now();
    }

    // Aguarda o DOM carregar
    function initChat() {
        console.log("Iniciando elementos do chat");
        
        // Busca elementos
        var chatInput = document.querySelector(".chat-input");
        var sendButton = document.querySelector(".icon-send-button");
        var messagesDisplay = document.querySelector(".messages-display");
        var homeView = document.querySelector(".home-view");
        var chatView = document.querySelector(".chat-view");
        var typingIndicator = document.querySelector(".typing-indicator");
        var backButton = document.querySelector(".back-btn");
        var closeButton = document.querySelector(".close-btn");
        var headerHome = document.querySelector(".header-content-home");
        var headerChat = document.querySelector(".header-content-chat");
        var chatInputArea = document.querySelector(".chat-input-area");
        var chatInputWrapper = document.querySelector(".chat-input-wrapper");
        
        console.log("Elementos encontrados:", {
            chatInput: !!chatInput,
            sendButton: !!sendButton,
            homeView: !!homeView,
            chatView: !!chatView,
            chatInputArea: !!chatInputArea,
            chatInputWrapper: !!chatInputWrapper
        });
        
        // Força visibilidade do input em mobile
        var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && chatInputArea) {
            chatInputArea.style.display = "block";
            chatInputArea.style.visibility = "visible";
            chatInputArea.style.opacity = "1";
            console.log("Input área forçada para mobile");
        }

        // Função para mudar views (SUA VERSÃO + correção de limpeza)
        function changeView(viewName) {
            console.log("Mudando para view:", viewName);
            
            if (viewName === "chat") {
                if (homeView) homeView.style.display = "none";
                if (chatView) chatView.style.display = "flex";
                if (headerHome) headerHome.style.display = "none";
                if (headerChat) headerChat.style.display = "flex";
                console.log("Mudou para chat");
            } else {
                if (homeView) homeView.style.display = "flex";
                if (chatView) chatView.style.display = "none";
                if (headerHome) headerHome.style.display = "flex";
                if (headerChat) headerChat.style.display = "none";
                console.log("Mudou para home");
                
                // CORREÇÃO: Limpa mensagens ao voltar para home
                if (messagesDisplay) {
                    messagesDisplay.innerHTML = "";
                    console.log("✅ Mensagens limpas");
                }
            }
        }

        // CORREÇÃO: Função para converter Markdown melhorada
        function renderMarkdown(text) {
            // Converte links em formato **[texto](url)** para HTML
            text = text.replace(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '<a href="$2" target="_blank" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">$1</a>');
            
            // Converte texto em negrito **texto**
            text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Converte quebras de linha
            text = text.replace(/\n/g, '<br>');
            
            return text;
        }

        // Função para adicionar mensagem (SUA VERSÃO + correção do renderMarkdown)
        function addMessage(sender, text) {
            console.log("Adicionando mensagem:", sender);
            
            if (!messagesDisplay) return;
            
            var msgGroup = document.createElement("div");
            msgGroup.className = "message-group " + sender;
            
            if (sender === "agent") {
                var msgInfo = document.createElement("div");
                msgInfo.className = "message-info";
                msgInfo.textContent = "Puramar";
                msgGroup.appendChild(msgInfo);
            }
            
            var msgBubble = document.createElement("div");
            msgBubble.className = "message-bubble " + sender;
            
            // CORREÇÃO: Renderiza Markdown MELHORADO para mensagens do agente
            if (sender === "agent") {
                msgBubble.innerHTML = renderMarkdown(text);
            } else {
                msgBubble.innerHTML = text.replace(/\n/g, "<br>");
            }
            
            msgGroup.appendChild(msgBubble);
            messagesDisplay.appendChild(msgGroup);
            messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
        }

        // Função para enviar mensagem (SUA VERSÃO + correção do coração)
        function sendMessage(text) {
            if (!text) text = chatInput ? chatInput.value.trim() : "";
            if (!text) return;
            
            console.log("Enviando:", text);
            
            changeView("chat");
            addMessage("user", text);
            chatState.history.push({ role: "user", content: text });
            
            if (chatInput) {
                chatInput.value = "";
                chatInput.style.height = "auto";
            }
            if (sendButton) sendButton.classList.remove("visible");
            if (typingIndicator) typingIndicator.style.display = "block";

            // Requisição para API
            var xhr = new XMLHttpRequest();
            xhr.open("POST", API_URL, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (typingIndicator) typingIndicator.style.display = "none";
                    
                    // CORREÇÃO: Coração branco em caso de erro
                    var reply = "Desculpe, não consegui conectar. Tente novamente. 🤍";
                    
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            reply = data.reply;
                            console.log("Resposta recebida do CrmAgent:", reply);
                        } catch (e) {
                            console.error("Erro JSON:", e);
                        }
                    } else {
                        console.error("Erro CORS/API:", xhr.status);
                    }
                    
                    addMessage("agent", reply);
                    chatState.history.push({ role: "assistant", content: reply });
                }
            };
            
            xhr.send(JSON.stringify({
                message: text,
                history: chatState.history.slice(0, -1),
                user_id: chatState.userId
            }));
        }

        // Event listeners (SUA VERSÃO - mantida igual)
        if (chatInput) {
            chatInput.addEventListener("input", function() {
                var hasText = chatInput.value.trim() !== "";
                if (sendButton) {
                    sendButton.classList.toggle("visible", hasText);
                }
                chatInput.style.height = "auto";
                chatInput.style.height = chatInput.scrollHeight + "px";
            });
            
            chatInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener("click", function() {
                sendMessage();
            });
        }
        
        // Botões de sugestão (SUA VERSÃO - mantida igual)
        var suggestionButtons = document.querySelectorAll(".suggestion-button");
        for (var i = 0; i < suggestionButtons.length; i++) {
            suggestionButtons[i].addEventListener("click", function() {
                var suggestion = this.getAttribute("data-suggestion");
                console.log("Sugestão clicada:", suggestion);
                sendMessage(suggestion);
            });
        }
        
        // CORREÇÃO: Botão voltar agora limpa mensagens
        if (backButton) {
            backButton.addEventListener("click", function() {
                console.log("⬅️ Botão voltar clicado");
                changeView("home"); // Já limpa as mensagens dentro desta função
            });
        }
        
        if (closeButton) {
            closeButton.addEventListener("click", function() {
                console.log("Fechando chat");
                window.parent.postMessage("toggle-chat-close", "*");
            });
        }

        console.log("Chat configurado com sucesso");
    }

    // Inicializa quando DOM estiver pronto (SUA VERSÃO - mantida igual)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChat);
    } else {
        initChat();
    }

})();
