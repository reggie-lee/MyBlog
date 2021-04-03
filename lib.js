
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
 * @param {RequestInit} [init]
 */
async function api(url, init) {
    const resp = await fetch(`/api/${url}`, init);
    if (!resp.ok) {
        throw CodeMsg(resp, await resp.text());
    }
    const json = await resp.json();
    if (typeof json.data === "undefined") {
        throw CodeMsg(resp, json);
    }
    return json.data;
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
