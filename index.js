
function createEntry(blogId, title, content, gmtModified, username) {
    const date = new Date(gmtModified).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const div = document.createElement('div');
    div.innerHTML = `<h2><a href="/blog/${blogId}">${title}</a><time datetime="${gmtModified}" class="date">${date}</time></h2>
<p>${content}</p>
<p><b>Created by</b> <a href="/user/${username}">${username}</a></p>`;
    return div;
}

async function main() {
    const data = await api("blog/get/all");

    const mainElement = document.getElementById("main");
    for (const entry of reversed(data)) {
        mainElement.append(createEntry(
            entry.blogId,
            entry.title,
            entry.content,
            entry.gmtModified,
            entry.username,
        ), document.createElement('br'));
    }
}

window.onload = main;
