
Onloads.push(async function () {
    const mainElement = $id("main");

    const match = window.location.pathname.match(/\/edit\/([0-9]+)$/);
    if (match === null) {
        return notFound(mainElement);
    }

    const blogId = match[1];
    const data = await
        api(`blog/get/by-id?${new URLSearchParams({ bid: blogId, })}`);

    if (data === null) {
        return notFound(mainElement);
    }

    const title = $id("title");
    const content = $id("content");
    title.innerText = data.title;
    content.innerText = data.content;

    /** @type {any} */
    const time = $id("time");
    time.dateTime = data.gmtModified;
    time.innerText = new Date(data.gmtModified).toLocaleDateString("en-US",
        { year: "numeric", month: "short", day: "numeric" });

    const update = $id("update");
    update.onclick = () => {
        updateBlog(parseInt(blogId), title.innerText, content.innerText, "PUBLIC")
            .then(buttonSuccess(update), buttonFailure(update));
    };
})
