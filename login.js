
Onloads.push(async function () {
    const loginForm = $id("login-form");
    const loginButton = $id("login");
    loginForm.onsubmit = event => {
        event.preventDefault();
        // @ts-ignore
        const form = new FormData(loginForm);
        // @ts-ignore
        api(get("login", [...form.entries()]))
            .catch(buttonFailure(loginButton))
            .then(buttonSuccess(loginButton, () => {
                // @ts-ignore
                sessionStorage.setItem("username", form.get("username"));
                window.location.href = "/";
            }));
    };
});
