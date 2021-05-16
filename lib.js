
/** @param {string} id */
function $id(id) {
    return document.getElementById(id);
}

/** @param {string} id */
function $class(id) {
    return document.getElementsByClassName(id);
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

/** @param {Response} resp */
async function unwrap(resp) {
    if (resp.status == 401) {
        window.location.href = "/login.html";
    }
    if (!resp.ok) {
        throw resp;
    }
    const json = await resp.json();
    if (typeof json.code !== "number"
        || typeof json.msg !== "string") {
        throw json;
    }
    if (json.code != 200) {
        throw [json.code, json.msg];
    }
    return json.data;
}

/**
 * @param {string} url
 * @param {object} [body]
 */
async function api(url, body) {
    const resp = await (
        typeof body === "undefined" ?
            fetch(`/api/${url}`, {
                method: "GET",
                credentials: "same-origin"
            }) :
            fetch(`/api/${url}`, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
    );
    return unwrap(resp);
}

/**
 * @param {string} url
 * @param {string | string[][] | Record<string, string> | URLSearchParams} params
 */
function get(url, params) {
    return url.toString() + "?" + new URLSearchParams(params).toString();
}

function publishBlog(
    username,
    title,
    content,
    status
) {
    return api("blog/add/blog", {
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
    return api("blog/update/blog", {
        username: "Admin",
        blogId,
        title,
        content,
        status
    });
}

function deleteBlog(bid) {
    return api(get("blog/delete/blog", { bid }));
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
 * @param {string | number} bid
 */
function getBlog(bid) {
    return api(get(`blog/get/by-id`, { bid: bid.toString() }));
}

/**
 * @param {HTMLElement} element
 * @param {number} bid
 */
function likeBlog(element, bid) {
    api(get("blog/add/like", { bid: bid.toString() })).catch().then(async () => {
        const likes = (await getBlog(bid)).likeNum;
        element.innerHTML = `<b>Unlike(${likes})</b>`;
        element.onclick = () => unlikeBlog(element, bid);
    });
}

function unlikeBlog(element, bid) {
    api(get("blog/delete/like", { bid: bid.toString() })).catch().then(async () => {
        const likes = (await getBlog(bid)).likeNum;
        element.innerHTML = `<b>Like(${likes})</b>`;
        element.onclick = () => likeBlog(element, bid);
    });
}

/**
 * @param {number | null} blogId
 * @param {string} title
 * @param {string} content
 * @param {number} gmtModified
 * @param {string} username
 * @param {(text: string) => string} formatter
 * @param {number} [likes]
 * @returns {HTMLDivElement}
 */
function createEntry(blogId, title, content, gmtModified, username, formatter, likes) {
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
            `<span class="vbar"></span>` +
            `<a class="like-button" href="javascript:void(0)"` +
            `onclick="likeBlog(this, ${blogId})"><b>Like(${likes})</b></a>` +
            `<span class="vbar"></span><b>Created by</b> ` +
            `<a href="/user/${username}">${username}</a></p>`;
    }
    return div;
}

/** @param {HTMLElement} mainElement */
function notFound(mainElement) {
    document.title = "Not Found | My Blog";
    mainElement.replaceWith(createEntry(
        null,
        "Not Found",
        "The blog may not exist.",
        Date.now(),
        "admin",
        generateContent
    ));
}

function buttonFailure(button, func) {
    const text = button.innerText;
    if (typeof func === "undefined") {
        func = () => {
            button.disabled = false;
            button.innerText = text;
        };
    }
    return reason => {
        console.error(reason);
        button.disabled = true;
        button.innerText = `${text} Failure`;
        setTimeout(func, 1500, reason);
        throw Error(`${text} failure`);
    }
}

function buttonSuccess(button, func) {
    if (typeof func === "undefined") {
        func = result => {
            window.location.href = `/blog/${result.blogId}`;
        };
    }
    return result => {
        button.disabled = true;
        button.innerText = "Success";
        console.log(result);
        setTimeout(func, 500, result);
    }
}

function logout(redirect) {
    const clear = () => {
        sessionStorage.clear();
        if (typeof redirect === "string") {
            window.location.href = redirect;
        } else {
            window.location.reload();
        }
    };
    api("logout").catch(clear).then(clear);
}

class Onloads {
    static onloads = [];
    static push(func) {
        Onloads.onloads.push(func);
    }
}

window.onload = e => {
    for (const f of Onloads.onloads) {
        try {
            f(e);
        } catch (err) {
            console.error(err);
        }
    }
};

Onloads.push(function () {
    const navbar = $id("navbar");
    const username = sessionStorage.getItem("username");
    if (typeof username === "string") {
        const anchor = /** @type {HTMLAnchorElement} */ (navbar.children[1]);
        anchor.innerText = `@${username}`;
        anchor.href = `/user/${username}`;
        anchor.insertAdjacentHTML("beforebegin",
            `<a id="logout" href="javascript:void(0)">Log Out</a>`);
        $id("logout").onclick = () => logout();
    } else {
        const anchor = /** @type {HTMLAnchorElement} */ (navbar.children[0]);
        anchor.href = "/register.html";
        anchor.innerText = "Register";
    }
});

Onloads.push(function () {
    const searchBox = /** @type {HTMLInputElement} */ ($id("search"));
    searchBox.onkeydown = e => {
        if (e.code == "Enter") {
            window.location.href = "/search/" + encodeURI(searchBox.value);
        }
    };
});
