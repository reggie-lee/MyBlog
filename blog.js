
function createArticle(title, content, gmtModified, username) {
    const date = new Date(gmtModified).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const div = $new('div');
    div.innerHTML = `<h2>${title}<time datetime="${gmtModified}" class="date">${date}</time></h2>` +
        `${generateContent(content)}<p><b>Created by</b> <a href="/user/${username}">${username}</a></p>`;
    return div;
}

async function main() {
    const mainElement = $id("main");

    function notFound() {
        document.title = "Not Found | My Blog";
        mainElement.append(createArticle(
            "Not Found",
            "The blog may not exist.",
            Date.now(),
            "admin",
        ), $new('br'));
    }

    const match = window.location.pathname.match(/\/blog\/([0-9]+)$/);
    if (match === null) {
        return notFound();
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
        return notFound();
    }

    document.title = `${data.title} | My Blog`;

    mainElement.append(createArticle(
        data.title,
        data.content,
        data.gmtModified,
        data.username,
    ), $new('br'));
}

window.onload = main;
