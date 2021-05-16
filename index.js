
Onloads.push(async function () {
    const mainElement = $id("main");

    const match = window.location.pathname.match(/\/index\/([0-9]+)$/);
    const page = match === null ? 1 : parseInt(match[1]);
    if (page < 1) {
        window.location.href = `/index/1`;
    }

    const prev = /** @type {HTMLAnchorElement} */ ($id("prev"));
    const next = /** @type {HTMLAnchorElement} */ ($id("next"));
    if (page == 1) {
        prev.href = `#`;
    } else {
        prev.href = `/index/${page - 1}`;
    }

    const searchBox = $id("search");
    searchBox.onkeydown = e => {
        if (e.code == "Enter") {
            // @ts-ignore
            window.location.href = "/search/" + encodeURI(searchBox.value);
        }
    };

    const data = await api(get("blog/get/all", { page: page.toString() }));

    const totalPages = data.totalPages;
    if (typeof totalPages !== "number") {
        next.href = "#";
    } else {
        if (page > totalPages) {
            window.location.href = `/index/${totalPages}`;
        }
        if (page < totalPages) {
            next.href = `/index/${page + 1}`;
        } else {
            next.href = "#";
        }
    }

    for (const entry of data.content) {
        mainElement.append(createEntry(
            entry.blogId,
            entry.title,
            entry.content,
            entry.gmtModified,
            entry.username,
            generateSummary,
            entry.likeNum
        ));
    }
})
