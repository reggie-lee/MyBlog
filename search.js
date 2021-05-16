

Onloads.push(async function () {
    const mainElement = $id("main");

    const match = window.location.pathname.match(/\/search\/(.*)$/);
    if (match === null) {
        return notFound(mainElement);
    }

    const keyword = decodeURI(match[1]);

    let data;
    try {
        data = [await api(get("blog/get/by-title", { title: keyword }))];
    } catch {
        data = [];
    }

    if (data.length == 0) {
        const empty = $new("p");
        empty.innerText = "No blogs found.";
        mainElement.append(empty, $new("br"));
    } else {
        for (const entry of data) {
            mainElement.append(createEntry(
                entry.blogId,
                entry.title,
                entry.content,
                entry.gmtModified,
                entry.username,
                generateSummary,
                entry.likeNum
            ), $new("br"));
        }
    }
});
