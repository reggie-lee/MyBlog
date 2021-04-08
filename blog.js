
window.onload = async function () {
    const mainElement = $id("main");

    const match = window.location.pathname.match(/\/blog\/([0-9]+)$/);
    if (match === null) {
        return notFound(mainElement);
    }

    const blogId = match[1];
    const prev = $id("prev");
    const next = $id("next");
    const bid = parseInt(blogId);
    // @ts-ignore
    prev.href = `/blog/${bid - 1}`, next.href = `/blog/${bid + 1}`;

    const data = await
        api(`blog/get/by-id?${new URLSearchParams({ bid: blogId, })}`);

    if (data === null) {
        return notFound(mainElement);
    }

    document.title = `${data.title} | My Blog`;

    mainElement.append(createEntry(
        data.blogId,
        data.title,
        data.content,
        data.gmtModified,
        data.username,
        generateContent
    ), $new('br'));
}
