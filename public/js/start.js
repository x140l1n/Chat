document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#form");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let nickname = document.getElementById("nickname").value;

        if (nickname === "") {
            notify({ message: "The nickname is required...", color: "danger", timeout: 3000 });
        } else {
            window.location.replace(`/chat/${nickname}`);
        }
    });
});