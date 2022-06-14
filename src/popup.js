document.getElementById("refresh").addEventListener("click", run);

let bookmark_url = 'https://intra.devfaq.com/network/websites/websites.json';
let bookmark_prefix = 'Intranet - '
let bookmark_suffix = ''
let configured_bookmarks = [];

function add_bookmark(title, url){
    /*
    Add the given bookmark.

    Args:
        title: Title of the bookmark.
        url: URL for the bookmark.
     */
    let createBookmark = browser.bookmarks.create(
        {
            title: title,
            url: url
        }
    );
    createBookmark.then(bookmark_created, bookmark_create_failed);
}

function bookmark_created(bookmark_item) {
    /*
    Handler to show success of adding a bookmark.

    Args:
        node: Node added.
     */
    console.log('Added bookmark - ' + bookmark_item.title);
}

function bookmark_create_failed(error) {
    /*
    Handler to show failure of adding a bookmark.

    Args:
        error: Error showing why a bookmark failed to create.
     */
    console.log('Bookmark creation failed - ' + error);
}

function bookmark_deleted() {
    /* Handler to show success of deleting a bookmark. */
    console.log('Bookmark removed');
}

function bookmark_delete_failed(error) {
    /*
    Handler to show failure of deleting a bookmark.

    Args:
        error: Error showing why a bookmark failed to delete.
     */
    console.log('Bookmark deletion failed - ' + error);
}

function compare_bookmarks(website, configured_bookmark) {
    /*
    Check if a configured bookmark matches a fetched bookmark.

    Args:
        website: Website fetched from the endpoint.
        configured_bookmark: Bookmark configured in the browser.

     Returns:
        True if matches otherwise false.
     */
    const website_name = get_website_name(website.name);
    if (website_name === configured_bookmark.title && website.url === configured_bookmark.url) {
        return true;
    } else if (website_name === configured_bookmark.title && website.url + '/' === configured_bookmark.url) {
        return true;
    }
    return false;
}

function get_website_name(original_name) {
    /*
    Formulate the website name with prefix and suffix.

    Args:
        original_name: The original website name.

     Returns:
        Website name with prefix and suffix.
     */
    return bookmark_prefix + original_name + bookmark_suffix;
}

function delete_bookmark(bookmark_item){
    /*
    Delete a given bookmark.

    Args:
        bookmarkItem: Object for the bookmark to delete.
     */
    let remove_bookmark = browser.bookmarks.remove(bookmark_item.id);
    remove_bookmark.then(bookmark_deleted, bookmark_delete_failed);
}

function fetch_remote_bookmarks(){
    /*Fetch the URL's from the remote server.*/
    fetch(bookmark_url).then(response => response.json()).then(data => sync_bookmarks(data['websites']));
}

function fetched_options(options) {
    /*
    Handler for success on fetching options.

    Args:
        options: Fetched options
     */
    if (options.bookmarks_index) {
        bookmark_url = options.bookmarks_index;
    }
    if (options.bookmark_prefix) {
        bookmark_prefix = options.bookmark_prefix;
    }
    if (options.bookmark_suffix) {
        bookmark_suffix = options.bookmark_suffix;
    }
}

function fetch_options_failed(error) {
    /*
    Handler to show failure of fetching options.

    Args:
        error: Error showing why options failed to fetch.
     */
    console.log('Fetching options failed - ' + error);
}

function log_tree_failed(error) {
    /*
    Handle rejected request for receiving bookmarks.

    Args:
        error: Passed error message when request failed.
     */
    console.log('Request failed ' + error);
}

function process_bookmark_item(bookmarkItem) {
    /*
    Process an individiual bookmark item.

    Args:
        bookmarkItem: Bookmark item to process.
     */
    if (bookmarkItem.url) {
        if (bookmarkItem.title.startsWith(bookmark_prefix) && bookmarkItem.title.endsWith(bookmark_suffix)) {
            configured_bookmarks.push(bookmarkItem);
        }
    }
    if (bookmarkItem.children) {
        for (let child of bookmarkItem.children) {
            process_bookmark_item(child);
        }
    }
}

function process_log_tree(bookmarkItems) {
    /*
    Entry point for processing log tree from the browser.

    Args:
        bookmarkItems: Bookmark array.
     */
    process_bookmark_item(bookmarkItems[0]);
}

function sync_bookmarks(websites){
    /*
    Sync the fetched bookmarks with those configured in the browser.

    Args:
        websites: List of dictionaries.
     */

    // Check if any new bookmarks are required.
    for (let website of websites) {
        let found = false;
        let found_item = null;
        for (let configured_bookmark of configured_bookmarks) {
            if (compare_bookmarks(website, configured_bookmark)) {
                found = true;
                found_item = configured_bookmark;
                break;
            }
        }
        if (!found) {
            let website_name = get_website_name(website.name);
            add_bookmark(website_name, website.url);
        }
    }

    // Check if configured bookmark is still required.
    for (let configured_bookmark of configured_bookmarks) {
        let found = false;
        for (let website of websites) {
            if (compare_bookmarks(website, configured_bookmark)) {
                found = true;
                break;
            }
        }
        if (!found) {
            delete_bookmark(configured_bookmark);
        }
    }
}

function run(){
    /* Entry point. */

    // Reset configured bookmarks.
    configured_bookmarks = [];

    // Fetch bookmark index URL.
    let get_bookmark_url = browser.storage.sync.get(["bookmarks_index", "bookmark_prefix", "bookmark_suffix"]);
    get_bookmark_url.then(fetched_options, fetch_options_failed);

    // Fetch bookmarks in the browser.
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(process_log_tree, log_tree_failed);

    // Fetch bookmarks from remote URL.
    fetch_remote_bookmarks();
}

run();
