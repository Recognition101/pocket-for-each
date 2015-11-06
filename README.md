# Pocket For-Each

This is a small CLI utility that will run any command line program for each URL that is currently unread (non-archived) in your [pocket](https://getpocket.com) account.

## Setup

First, `cd` to the pocketForEach directory, and install node and all dependencies:

```
brew install node
npm install
```

Then, run the setup process in order to authenticate (follow all instructions it gives you, which include opening a browser and registering/authenticating a pocket app):

```
node setupPocketForEach.js
```

## Usage

```
Usage: pocketForEach [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -o, --once [filename]    An optional JSON file that maintains a list of URLs that have been run already, and will not be used again in successive runs.
    -c, --command [command]  The command to run for each URL. Instances of {{url}} will be replaced with each url.
```

You must provide the `-c, --command` option, which is a CLI command with `{{url}}` where you want each URL to be inserted. For instance, if we wanted to simply echo each URL with a 1 second pause between each output, we could run:

```
node pocketForEach.js -c "sleep 1 && echo '{{url}}'"
```

The `--once` option can be used to specify a JSON file that will be used to store which URLs have had a command run on them, and not allow any further commands to run on those URLs. This is useful if you run this script periodically and never want a command to execute on the same URL twice. For instance, if we run this command once:

```
node pocketForEach.js -c "echo '{{url}}'" -o ~/.pocketForEachLog.json
```

Then it will output each URL and store each URL in the file `~/.pocketForEachLog.json`. If we were to run that command again, it would not output anything, since every URL was already encountered once according to `~/.pocketForEachLog.json`.
