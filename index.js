
Onloads.push(async function () {
    const mainElement = $id("main");

    const searchBox = $id("search");
    searchBox.onkeydown = e => {
        if (e.code == "Enter") {
            // @ts-ignore
            window.location.href = "/search/" + encodeURI(searchBox.value);
        }
    };

    const data = await api("blog/get/all");
    for (const entry of data.content) {
        mainElement.append(createEntry(
            entry.blogId,
            entry.title,
            entry.content,
            entry.gmtModified,
            entry.username,
            generateSummary
        ), $new('br'));
    }
})
