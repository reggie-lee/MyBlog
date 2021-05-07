
Onloads.push(async function () {
    const match = window.location.pathname.match(/\/user\/(.+)$/);
    if (match === null) {
        return notFound($id("main"));
    }

    try {
        const username = match[1];
        const data = await api(get("user/get/by-username", { username }));
        $id("username-title").innerText = `@${data.username}`;
        $id("uid").innerText = data.userId;
        $id("username").innerText = data.username;
        $id("email").innerText = data.email;
    } catch {
        return notFound($id("main"));
    }
});
