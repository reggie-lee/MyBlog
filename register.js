
Onloads.push(async function () {
    const registerForm = $id("register-form");
    const registerButton = $id("register");
    registerForm.onsubmit = event => {
        event.preventDefault();
        // @ts-ignore
        const form = new FormData(registerForm);
        const body = Object.fromEntries(form.entries());
        body["userIdentity"] = "BLOGGER";
        // @ts-ignore
        body["age"] = 10;
        body["gender"] = "UNKNOWN";
        body["hobby"] = "UNKNOWN";
        // @ts-ignore
        api("user/insert", body)
            .catch(buttonFailure(registerButton))
            .then(buttonSuccess(registerButton, () => {
                // @ts-ignore
                sessionStorage.setItem("username", form.get("username"));
                window.location.href = "/";
            }));
    };
});
