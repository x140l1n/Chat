document.addEventListener("DOMContentLoaded", function () {
    const form_message = document.querySelector("#form-message");
    const input_message = form_message.querySelector("#input-message");
    const nickname = document.querySelector("#nickname").innerText;

    const socket = create_socket(nickname);

    form_message.addEventListener("submit", (e) => {
        e.preventDefault();

        let message = input_message.value;

        if (message.trim()) {
            append_message({message: message}, true);

            socket.emit("send-message", { nickname: nickname, message: message });

            input_message.value = "";
        }
    });

    window.addEventListener("beforeunload", () => {
        socket.emit("user-disconnected");
    });
});

function create_socket(nickname) {
    const socket = io();

    socket.emit("user-connected", { nickname: nickname });

    socket.on("user-connected", (nickname) => {
        append_message_hint(nickname + " is connected.");
    });

    socket.on("received-message", (data) => {
        append_message(data, false);
    });

    socket.on("user-disconnected", (nickname) => {
        append_message_hint(nickname + " is disconnected.");
    });

    return socket;
}

function append_message(data, self_message) {
    const content = document.querySelector("#chat-content");

    if (self_message)
        content.innerHTML += `<div class="wrap-message"><div class="self-message">${data.message}</div></div>`;
    else
        content.innerHTML += `<div class="wrap-message">
                                <div class="other-message">
                                <small>${data.nickname}</small>
                                    ${data.message}
                                </div>
                            </div>`;
}


function append_message_hint(message) {
    const content = document.querySelector("#chat-content");

    content.innerHTML += `<div class="wrap-message">
                            <div class="message-hint">
                                ${message}
                            </div>
                        </div>`
}