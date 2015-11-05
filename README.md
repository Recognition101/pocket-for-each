# Pocket For-Each

This is a small CLI utility that will run any command line program for each URL that is currently unread (non-archived) in your [pocket](https://getpocket.com) account.

## Usage

First, `cd` to the pocketForEach directory, and install node and all dependencies:

```
brew install node
npm install
```

Then, run the setup process in order to authenticate (follow all instructions it gives you, which include opening a browser and registering/authenticating a pocket app):

```
node setupPocketForEach.js
```

Once that is set up, you can use it simply with:

```
node pocketForEach.js <command-with-placeholder>
```

Where `<command-with-placeholder>` is a CLI command with `{{url}}` where you want the URL to be placed. For instance, if we wanted to echo every URL (pausing for a second between each echo), we could run:

```
node pocketForEach.js "sleep 1 && echo '{{url}}'"
```
