#!/usr/bin/env node
const puppeteer = require("puppeteer");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");

let urlToSlug = (url) => {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\//g, "-");
};

(async () => {
  const argv = yargs(hideBin(process.argv))
    .option("tweet", {
      alias: "t",
      description: "Capture single tweet only",
      type: "boolean",
    })
    .option("dark", {
      alias: "d",
      description: "Use a dark colorscheme",
      type: "boolean",
    })
    .option("scale-factor", {
      alias: "s",
      description: "Scale factor for the capture",
      type: "number",
      default: 2,
    })
    .positional("tweet-url", {
      description: "The URL of the tweet or conversation",
      type: "string",
    })
    .help()
    .alias("help", "h").argv;

  const url = argv._[0];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Update user agent to recent Chrome user agent.
  // Otherwise, Twitter shows a deprecation warning when using the default Chromium instance of Puppeteer.
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
  );

  if (argv.dark) {
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "dark" },
    ]);
  }

  await page.setViewport({
    width: 1280,
    height: 1920,
    deviceScaleFactor: argv["scale-factor"],
  });

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  if (argv.tweet) {
    await captureTweet(page, url, `${urlToSlug(url)}-tweet.png`);
  } else {
    await captureConversation(page, url, `${urlToSlug(url)}-convo.png`);
  }

  await browser.close();
})();

const captureConversation = async (page, url, path) => {
  await page.evaluate(async () => {
    // Remove sign-in banner
    let banner = document.querySelector("#layers");
    banner.parentNode.removeChild(banner);

    let scrollPosition = 0;
    let documentHeight = document.body.scrollHeight;

    while (documentHeight > scrollPosition + window.innerHeight) {
      window.scrollBy(0, window.innerHeight);

      await new Promise((resolve) => {
        setTimeout(resolve, window.innerHeight);
      });

      scrollPosition = window.pageYOffset;
      documentHeight = document.body.scrollHeight;
    }
  });

  const primaryColumn = await page.$('[data-testid="primaryColumn"]');
  const boundingBox = await primaryColumn.boundingBox();

  const tweets = await page.$$(
    '[aria-label="Timeline: Conversation"] > div > div'
  );
  const lastTweetBoundingBox = await tweets[tweets.length - 1].boundingBox();

  await primaryColumn.screenshot({
    path: path,
    clip: {
      x: boundingBox.x,
      y: 0,
      width: boundingBox.width,
      height: Math.abs(boundingBox.y) + lastTweetBoundingBox.y,
    },
  });

  console.log(
    chalk`Conversation {yellow ${url}} {bold (${
      tweets.length - 1
    } tweets)} captured in {green ${path}}`
  );
};

const captureTweet = async (page, url, path) => {
  await page.evaluate(() => {
    // Remove sign-in banner
    let banner = document.querySelector("#layers");
    banner.parentNode.removeChild(banner);
  });

  const tweet = await page.$(
    '[aria-label="Timeline: Conversation"] > div > div'
  );

  await tweet.screenshot({ path: path });

  console.log(chalk`Tweet {yellow ${url}} captured in {green ${path}}`);
};