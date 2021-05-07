
Onloads.push(async function () {
    const data = await api("blog/get/all");

    const mainElement = $id("main");
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
