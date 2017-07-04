# cachestore

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5d0b3507599946679d1e37302facb607)](https://www.codacy.com/app/syblackwell/cachestore?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=anywhichway/cachestore&amp;utm_campaign=Badge_Grade)

A standalone memory cache and wrapper for storage engines supporting the localStore, Redis or similar APIs

# installation

npm install cachestore

# usage

`new CacheStore(<StorageProvider>)`

`new CacheStore(new BlockStore("./db",true,"utf8"))` // reads of over 200,000 rec/sec have been clocked with this server side combination

Note, when using `get` CacheStore may return either `null` or `undefined` if the record doe snot exist, depending on what the underlying storage provider returns.

# Release History (reverse chronological order)

v0.0.5 2017-07-04 Fixed count request forwarding to underlying store.

v0.0.4 2017-07-04 Codacy driven style improvements. Added unit tests.

v0.0.3 2017-07-02 Improved delegation code

v0.0.2 2017-07-01 Fixed issues related to compatibility with localStorage API

v0.0.1 2017-07-01 First public release (Still needs work an LRU scavenging)

# License

MIT
