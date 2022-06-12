document.getElementById("refresh").addEventListener("click", run);

let BOOKMARK_URL = 'https://intra.devfaq.com/network/websites/websites.json';
let website_name_prefix = 'Intranet - '
var configured_bookmarks = [];

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
    createBookmark.then(bookmark_created);
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
    website_name = website_name_prefix + website.name;
    if (website_name == configured_bookmark.title && website.url == configured_bookmark.url) {
        return true;
    } else if (website_name == configured_bookmark.title && website.url + '/' == configured_bookmark.url) {
        return true;
    }
    return false;
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
    fetch(BOOKMARK_URL).then(response => response.json()).then(data => sync_bookmarks(data['websites']));
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
        if (bookmarkItem.title.startsWith(website_name_prefix)) {
            configured_bookmarks.push(bookmarkItem);
        }
    }
    if (bookmarkItem.children) {
        for (child of bookmarkItem.children) {
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
    for (website of websites) {
        var found = false;
        var found_item = null;
        for (configured_bookmark of configured_bookmarks) {
            if (compare_bookmarks(website, configured_bookmark)) {
                found = true;
                found_item = configured_bookmark;
                break;
            }
        }
        if (!found) {
            website_name = website_name_prefix + website.name;
            add_bookmark(website_name, website.url);
        }
    }

    // Check if configured bookmark is still required.
    for (configured_bookmark of configured_bookmarks) {
        var found = false;
        for (website of websites) {
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
    let bookmarks = browser.bookmarks.getTree();
    bookmarks.then(process_log_tree, log_tree_failed);
    fetch_remote_bookmarks();
}

run();
