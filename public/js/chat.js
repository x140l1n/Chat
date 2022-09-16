 document.addEventListener("DOMContentLoaded", function () {
    const form_message = document.querySelector("#form-message");
    const input_message = document.querySelector("#input-message");
    const nickname = document.querySelector("#nickname").innerText;
    const content_messages = document.querySelector("#chat-content > .content-messages");
    const writing_info = document.querySelector("#writing-info");

    let auto_scroll_bottom = true;
    let users_writting = [];

    const socket = create_socket();

    form_message.addEventListener("submit", (e) => {
        e.preventDefault();

        let message = input_message.value;

        if (message.trim()) {
            input_message.value = "";
            auto_scroll_bottom = true;

            let data = {
                nickname: nickname,
                message: message,
            };

            append_message(data, true);

            socket.emit("send-message", data);

            socket.emit("writting", {
                nickname: nickname,
                is_writting: false
            });
        }
    });

    content_messages.addEventListener("scroll", (e) => {
        auto_scroll_bottom = e.target.scrollTop === (e.target.scrollHeight - e.target.offsetHeight);
    });

    input_message.addEventListener("input", (e) => {
        const message = e.target.value.trim();

        socket.emit("writting", {
            nickname: nickname,
            is_writting: message.length !== 0
        });
    });

    window.addEventListener("beforeunload", () => {
        socket.emit("user-disconnected");
    });

    function create_socket() {
        const socket = io();

        socket.emit("user-connected", {
            nickname: nickname
        });

        socket.on("user-connected", (nickname) => {
            append_message_hint(nickname + " is connected.");
        });

        socket.on("received-message", (data) => {
            append_message(data, false);
        });

        socket.on("user-writting", (data) => {
            writing_info.innerHTML = " ";

            if (!users_writting.includes(data.nickname)) users_writting.push(data.nickname);

            if (!data.is_writting) users_writting = users_writting.splice(0, users_writting.indexOf(data.nickname));

            if (users_writting.length) writing_info.innerHTML = `${users_writting.join(", ")} está escribiendo...`;
        });

        socket.on("user-disconnected", (nickname) => {
            append_message_hint(nickname + " is disconnected.");
        });

        return socket;
    }

    function append_message(data, self_message) {
        if (self_message)
        {
            const now = new Date();

            content_messages.innerHTML += `<div class="wrap-message"><div class="self-message"><span class="time-message">${now.getHours()}:${now.getMinutes()}</span>${data.message}</div></div>`;
        }
        else
        {
            content_messages.innerHTML += `<div class="wrap-message">
                                                <div class="other-message">
                                                    <small>${data.nickname}</small>
                                                    <span class="time-message">
                                                        ${data.time}
                                                    </span>
                                                    ${data.message}
                                                </div>
                                            </div>`;
        }

        if (auto_scroll_bottom) content_messages.scrollTo(0, content.scrollHeight);
    }


    function append_message_hint(message) {
        content_messages.innerHTML += `<div class="wrap-message">
                                <div class="message-hint">
                                    ${message}
                                </div>
                            </div>`

        if (auto_scroll_bottom) content_messages.scrollTo(0, content.scrollHeight);
    }
});