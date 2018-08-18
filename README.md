# spatialitebrowser

May not work in IE.

## query default DB
* http://jvail.github.io/spatiasql.js/?qry=SELECT%20*%20FROM%20toscana


## load a DB via db={url} (requires cors enabled)
* http://jvail.github.io/spatiasql.js/?db=assets/db/empty_wgs84_initialized.sqlite&qry=SELECT%20*%20FROM%20spatial_ref_sys


## load a (small & zipped) DB via db={dataURI}

http://jvail.github.io/spatiasql.js/?qry=SELECT%20*%20FROM%20hello_world&db=data%3Aapplication%2Fzip%3Bbase64%2CUEsDBBQAAgAIAEVvEk34a%2F5KyQAAAAAgAAAMAAAAZW1wdHkuc3FsaXRl7dnNCoJAEAfwWbPAQyQUdF3wUhBdegGt9ubF8h5GZoUimNClS71Fr9Kpp%2BkxIj%2BIJJGIrv8fs8wOO%2FMAw84tcxu7fB1GgRPzEanEGOmcE5GSHIne0lou1Iy%2BU2jIL820uXWlJAAAAAAAAADgJ1PW6Goas2Jn6bsb1%2FfDxSGM%2FFXhKk1mwrAFt42xKXjhoRfsvYHnhkE%2F3813lAQAAAAAAAAA%2FO3UZrJ27mRbOM%2B2cGJ39fUqbh9Zf%2BVjjfK%2F9jpVNpeGKnJp7vEEUEsBAj8DFAACAAgARW8STfhr%2FkrJAAAAACAAAAwAAAAAAAAAAAAAAKSBAAAAAGVtcHR5LnNxbGl0ZVBLBQYAAAAAAQABADoAAADzAAAAAAA%3D



A way to create a dataURI

```javascript
fetch('assets/db/empty.sqlite')
    .then(data => {
        data.arrayBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                console.log(reader.result);
            };
        });
    });
```
