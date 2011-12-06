!SLIDE
# Where did we get Express?

!SLIDE screenshot npm center
# [http://npmjs.org](http://npmjs.org)

!SLIDE commandline incremental
# Installing a Package

    $ npm install express 
    express@2.5.1 ./node_modules/express
    ├── qs@0.4.0
    ├── mkdirp@0.0.7
    ├── mime@1.2.4
    └── connect@1.8.2
    $ ls node_modules
    total 0
    drwxr-xr-x  13 rudy  staff   442B Dec  5 22:30 express/

!SLIDE
# package.json

    @@@ javascript
    {
      "name" : "nodebro.js",
      "version" : "0.0.1",
      "dependencies" : {
        "express" : "2.5"
      }
    }

!SLIDE commandline incremental
# Install Packages

    $npm install
    express@2.5.1 ./node_modules/express
    ├── qs@0.4.0
    ├── mkdirp@0.0.7
    ├── mime@1.2.4
    └── connect@1.8.2

!SLIDE
# Packages
