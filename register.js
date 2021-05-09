
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
        body["age"] = 17;
        body["gender"] = "UNKNOWN";
        body["hobby"] = "UNKNOWN";
        api("register", body)
            .catch(buttonFailure(registerButton))
            .then(buttonSuccess(registerButton, () => {
                logout("/login.html");
            }));
    };
});
