# Bookmark Sync

A crude toolbar that can sync bookmarks with a JSON file the location of which can
be configured.

## Configuration

By typing `about:addon` in the address bar the following attributes can be modified:

### Bookmarks Index

The web location of a JSON file that holds the bookmarks. This must be in the format:

```JSON
{
  "websites": [{
    "name": "Google",
    "url": "https://google.com"
  }, {
    "name": "Microsoft",
    "url": "https://microsoft.com"
  }]
}
```

### Bookmark Prefix

A prefix that is prepended to the name in the JSON file when adding the bookmark.

### Bookmark Suffix

A prefix that is appended to the name in the JSON file when adding the bookmark.

## Notes

Be careful to ensure that a prefix and suffix is specified, if none are specified
you may lose all of your bookmarks.
