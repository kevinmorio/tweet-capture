# Tweet Capture

Tweet Capture allows capturing single tweets or conversations from Twitter.
This is accomplished using [Puppeteer](https://github.com/puppeteer/puppeteer).

## Features

- Capture a single tweet or conversation
- Support for using a dark colorscheme
- Support for high-res screenshots

## Usage

Clone the repository and install the dependencies.
Note that Puppeteer requires downloading a Chromium binary.

``` shell
$ git clone https://github.com/kevinmorio/tweet-capture
$ npm install
```

``` shell
$ ./tweet-capture.js --help
Positionals:
  tweet-url  The URL of the tweet or conversation                       [string]

Options:
      --version       Show version number                              [boolean]
  -t, --tweet         Capture single tweet only                        [boolean]
  -d, --dark          Use a dark colorscheme                           [boolean]
  -s, --scale-factor  Scale factor for the capture         [number] [default: 2]
  -h, --help          Show help                                        [boolean]
```


## Limitations

There seems to be no guarantee that all Tweets in a long conversation are loaded.
Moreover, the ordering of Tweets may change in multiple captures.

## Todos

- [ ] Add flag to specify output
- [ ] Add support for loading URLs from files
- [ ] Add tests
- [ ] Store tweet contents
- [ ] Add Dockerfile