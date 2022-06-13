function save_options(event) {
    /*
    Save options.

    Args:
        event: Event
     */
    event.preventDefault();
    browser.storage.sync.set({
        bookmarks_index: document.querySelector("#bookmarks_index").value,
        bookmark_prefix: document.querySelector("#bookmark_prefix").value,
        bookmark_suffix: document.querySelector("#bookmark_suffix").value
    });
}

function restore_options() {
    /* Handler to restore saved options. */

    function set_option(result) {
        /*
        Handle success on fetching data for populating options page.

        Args:
            result: Options.
         */
        document.querySelector("#bookmarks_index").value = result.bookmarks_index || "https://intra.devfaq.com/network/websites/websites.json";
        document.querySelector("#bookmark_prefix").value = result.bookmark_prefix || "Bookmark";
        document.querySelector("#bookmark_suffix").value = result.bookmark_suffix || "";
    }

    function set_option_error(error) {
        /*
        Handler to show failure when trying to populate options page.

        Args:
            error: Error showing why a populating the options page failed.
        */
        console.log('Setting option on options page failed - ' + error);
    }

    let get_option = browser.storage.sync.get(["bookmarks_index", "bookmark_prefix", "bookmark_suffix"]);
    get_option.then(set_option, set_option_error);
}

document.addEventListener("DOMContentLoaded", restore_options);
document.querySelector("form").addEventListener("submit", save_options);
