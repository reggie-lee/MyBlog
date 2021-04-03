
async function publishBlog(
    username,
    title,
    content,
    status
) {
    return await api("/blog/add", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            title,
            content,
            status
        })
    });
}

function failure(reason) {
    console.error(reason);

    /** @type {any} */
    const publish = $id("publish");
    publish.disabled = true;
    publish.innerText = "Publish Failure";
    setTimeout(() => {
        publish.disabled = false;
        publish.innerText = "Publish";
    }, 1500);

    throw Error("Publish failure");
}

function success(result) {
    /** @type {any} */
    const publish = $id("publish");
    publish.disabled = true;
    publish.innerText = "Success";
    console.log(result);
    setTimeout(() => {
        window.location.href = `/blog/${result.blogId}`;
    }, 500);
}

function main() {
    const title = $id("title");
    const content = $id("content");
    const publish = $id("publish");
    publish.onclick = () => {
        publishBlog("admin", title.innerText, content.innerText, "PUBLIC")
            .catch(failure).then(success);
    };
}

window.onload = main;
