
/** @param {string} id */
function $id(id) {
    return document.getElementById(id);
}

function $new(tag) {
    return document.createElement(tag);
}

/** @param {string} text */
function generateSummary(text) {
    return `<p>${text.slice(0, 700)}</p>`;
}

/** @param {string} text */
function generateContent(text) {
    return text.split('\n').map(t => `<p>${t}</p>`).join("");
}

/**
 * @param {Response} resp
 * @param {string | object} text
 */
function CodeMsg(resp, text) {
    let json;
    if (typeof text === "string") {
        try {
            json = JSON.parse(text);
        } catch {
            return Error(`${resp.status}: ${text}`);
        }
    } else {
        json = text;
        text = JSON.stringify(json);
    }
    if (typeof json.code !== "undefined"
        && typeof json.msg !== "undefined")
        return Error(`${json.code}: ${json.msg}`);
    else if (typeof json.status !== "undefined"
        && typeof json.error !== "undefined")
        return Error(`${json.status}: ${json.error}`);
    else
        return Error(`${resp.status}: ${text}`);
}

/**
 * @param {string} url
 * @param {object} [body]
 */
async function api(url, body) {
    const resp = await (
        typeof body === "undefined" ?
            fetch(`/api/${url}`) :
            fetch(`/api/${url}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
    );
    if (!resp.ok) {
        throw CodeMsg(resp, await resp.text());
    }
    const json = await resp.json();
    if (typeof json.data === "undefined") {
        throw CodeMsg(resp, json);
    }
    return json.data;
}

function publishBlog(
    username,
    title,
    content,
    status
) {
    return api("/blog/add", {
        username,
        title,
        content,
        status
    });
}

function updateBlog(
    blogId,
    title,
    content,
    status
) {
    return api("/blog/update", {
        blogId,
        title,
        content,
        status
    });
}

function deleteBlog(bid) {
    return api(`/blog/delete?${new URLSearchParams({ bid })}`);
}

function reversed(list) {
    return {
        index: list.length,
        next: function () {
            return {
                done: this.index-- == 0,
                value: list[this.index],
            }
        },
        [Symbol.iterator]: function () {
            return this;
        }
    }
}

function deleteEntry(element, bid) {
    deleteBlog(bid).then(
        () => { element.parentNode.parentNode.remove(); },
        reason => { console.log(reason); }
    );
}

/**
 * @param {number | null} blogId
 * @param {string} title
 * @param {string} content
 * @param {number} gmtModified
 * @param {string} username
 * @param {(text: string) => string} formatter
 * @returns {HTMLDivElement}
 */
function createEntry(blogId, title, content, gmtModified, username, formatter) {
    const date = new Date(gmtModified).toLocaleDateString("en-US",
        { year: "numeric", month: "short", day: "numeric" });
    const div = $new('div');
    if (typeof blogId !== "number") {
        div.innerHTML = `<h2>${title}` +
            `<time datetime="${gmtModified}" class="date">${date}</time></h2>` +
            `${formatter(content)}<p>` +
            `<b>Created by</b> ` +
            `<a href="/user/${username}">${username}</a></p>`;
    } else {
        div.innerHTML = `<h2><a href="/blog/${blogId}">${title}</a>` +
            `<time datetime="${gmtModified}" class="date">${date}</time></h2>` +
            `${formatter(content)}<p><a href="/edit/${blogId}"><b>Edit</b></a>` +
            `<span class="vbar"></span><a href="javascript:void(0)" ` +
            `onclick="deleteEntry(this, ${blogId})"><b>Delete</b></a>` +
            `<span class="vbar"></span><b>Created by</b> ` +
            `<a href="/user/${username}">${username}</a></p>`;
    }
    return div;
}

/** @param {HTMLElement} mainElement */
function notFound(mainElement) {
    document.title = "Not Found | My Blog";
    mainElement.append(createEntry(
        null,
        "Not Found",
        "The blog may not exist.",
        Date.now(),
        "admin",
        generateContent
    ), $new('br'));
}

function buttonFailure(button) {
    return reason => {
        const text = button.innerText;
        console.error(reason);
        button.disabled = true;
        button.innerText = `${text} Failure`;
        setTimeout(() => {
            button.disabled = false;
            button.innerText = text;
        }, 1500);
        throw Error(`${text} failure`);
    }
}

function buttonSuccess(button) {
    return result => {
        button.disabled = true;
        button.innerText = "Success";
        console.log(result);
        setTimeout(() => {
            window.location.href = `/blog/${result.blogId}`;
        }, 500);
    }
}
