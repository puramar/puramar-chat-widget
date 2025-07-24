// Puramar Chat Widget - Versão Livre de Conflitos
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
        
        console.log("Elementos encontrados:", {
            chatInput: !!chatInput,
            sendButton: !!sendButton,
            homeView: !!homeView,
            chatView: !!chatView
        });

        // Função para mudar views
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
            }
        }

        // Função para adicionar mensagem
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
            msgBubble.innerHTML = text.replace(/\n/g, "<br>");
            
            msgGroup.appendChild(msgBubble);
            messagesDisplay.appendChild(msgGroup);
            messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
        }

        // Função para enviar mensagem
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

            // Faz requisição
            var xhr = new XMLHttpRequest();
            xhr.open("POST", API_URL, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (typingIndicator) typingIndicator.style.display = "none";
                    
                    var reply = "Desculpe, não consegui conectar. Tente novamente. 💙";
                    
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            reply = data.reply;
                        } catch (e) {
                            console.error("Erro JSON:", e);
                        }
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

        // Event listeners
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
        
        // Botões de sugestão
        var suggestionButtons = document.querySelectorAll(".suggestion-button");
        for (var i = 0; i < suggestionButtons.length; i++) {
            suggestionButtons[i].addEventListener("click", function() {
                var suggestion = this.getAttribute("data-suggestion");
                console.log("Sugestão clicada:", suggestion);
                sendMessage(suggestion);
            });
        }
        
        if (backButton) {
            backButton.addEventListener("click", function() {
                changeView("home");
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

    // Inicializa quando DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChat);
    } else {
        initChat();
    }

})();
