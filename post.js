
Onloads.push(function () {
    /** @type {any} */
    const time = $id("time");
    const now = new Date();
    time.dateTime = now.getTime().toString();
    time.innerText = now.toLocaleDateString("en-US",
        { year: "numeric", month: "short", day: "numeric" });

    const title = $id("title");
    const content = $id("content");
    const publish = $id("publish");
    publish.onclick = () => {
        publishBlog("Admin", title.innerText, content.innerText, "PUBLIC")
            .catch(buttonFailure(publish)).then(buttonSuccess(publish));
    };
})
