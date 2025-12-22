+++
title = "Quick setup: MongoDB on macOS with Homebrew"
date = 2023-06-16
[taxonomies]
tags = ["mongodb", "macos", "brew"]
[extra]
archive = "This post was published more than 2 years ago. It's content is most probably out of date!"
+++

On macOS, we can quickly setup a MongoDB server with the following CLI commands.

## Prerequisites

- [Homebrew](https://brew.sh/) installed and configured

## Install and launch MongoDB

In your terminal:
`brew install mongodb-community`

Then start it with:
`brew services start mongodb-community`

`brew services list` should now list your running mongodb service.

## Explore the MongoDB Shell

You can get a shell to interact with your database server with the command `mongosh`. It will connect to the default location of `127.0.0.1`, port `27017`. The `help` command will get you started.

```
show databases # list available databases
use <database_name> # switch to database_name
show collections # list all collections in db
db.<collection_name>.find() # list all items in collection
```

When you're done exploring, you can stop the service with `brew services stop mongodb-community`.
