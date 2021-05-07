
/**
 * @param {string | number} bid
 * @param {number} rel
 */
async function getBid(bid, rel) {
    const data = await api(`blog/get/${rel > 0 ? "next" : "previous"}?bid=${bid}`);
    return data.blogId;
}

Onloads.push(async function () {
    const mainElement = $id("main");

    const match = window.location.pathname.match(/\/blog\/([0-9]+)$/);
    if (match === null) {
        return notFound(mainElement);
    }

    const blogId = match[1];
    const prev = $id("prev");
    const next = $id("next");
    //const bid = parseInt(blogId);

    try {
        // @ts-ignore
        prev.href = `/blog/${await getBid(blogId, -1)}`;
    } catch {
        // @ts-ignore
        prev.href = "/";
    }

    try {
        // @ts-ignore
        next.href = `/blog/${await getBid(blogId, +1)}`;
    } catch {
        // @ts-ignore
        next.href = "/";
    }

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
})
