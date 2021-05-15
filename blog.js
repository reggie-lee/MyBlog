
/**
 * @param {string | number} bid
 * @param {number} rel
 */
async function getBid(bid, rel) {
    const data = await api(`blog/get/${rel > 0 ? "next" : "previous"}?bid=${bid}`);
    return data.blogId;
}

/**
 * @param {Date} date
 */
function formatDate(date) {
    const time = date.toLocaleDateString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h24",
    });
    return `${time}`;
}

function createComment(username, content, gmtCreate) {
    const date = formatDate(new Date(gmtCreate));
    return `<div><p><b>@${username}: </b><span>${content}</span><time datetime="${gmtCreate}" class="float-right">${date}</time></p></div>`;
}

/**
 * @param {HTMLElement} div
 */
async function renderComments(div, bid) {
    const comments = await api(get("comment/get/by-id", { bid }));
    let html = "";
    for (const comment of comments) {
        html += createComment(comment.username, comment.content, comment.gmtCreate);
    }
    div.innerHTML = html;
}

/**
 * @param {number} blogId
 * @param {string} content
 * @param {HTMLElement} button
 */
function submitComment(blogId, content, button) {
    api("comment/add", {
        blogId,
        username: sessionStorage.getItem("username"),
        content,
        parentCommentId: 0,
    }).catch(buttonFailure(button)).then(buttonSuccess(button,
        () => window.location.reload()));
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
    const bid = parseInt(blogId);

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

    const submitButton = $id("submit-comment");
    submitButton.onclick = () => {
        submitComment(
            bid,
            /** @type {HTMLInputElement} */($id("your-comment")).value,
            submitButton
        );
    };

    renderComments($id("comments"), bid);
})
