const express = require("express");
const router = express.Router();
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");

router.get("/", async (req, res) => {
  res.render("dlpage");
});

const downloadPath = path.resolve("./public/downloads");

const delay = function (time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const waitFile = async function (filename) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(filename)) {
      await delay(3000);
      await waitFile(filename);
      resolve();
    } else {
      console.log(`${filename} is downloaded`);
      resolve();
    }
  });
};

let browser;

const startBroswer = async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 100, // slow down by 250ms
    args: [`--window-size=1200,1000`],
    defaultViewport: {
      width: 1200,
      height: 1000,
    },
    userDataDir: "./user-data-dir",
  });
};
startBroswer();

router.post("/req", async (req, res) => {
  let fileName;
  const page = await browser.newPage();

  await page.goto(req.body.link);
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });
  const loginBtn = await page.$(".gr-auth--not-logged");
  if (loginBtn) {
    await page.click(".auth-link");
    await page.$eval(
      "#login-username",
      (el) => (el.value = "daniyal.nabibakhsh@digitecham.com")
    );
    await page.$eval("#login-password", (el) => (el.value = "Dan677618!!"));
    await page.click("#auth-login-form-1");
  }
  const linkThumb = await page.$eval(".thumb", (el) => el.src);
  await page.click("#download-file");
  await page.click(".download-button");
  page.on("response", (response) => {
    const url = response.request().url();
    const contentType = response.headers()["content-type"];
    if (contentType === "application/zip") {
      rawFileName = path.basename(response.request().url());
      fileName = rawFileName.split("?")[0];
      console.log(fileName);
      async () => {
        await waitFile(`./public/downloads/${fileName}`);
      };
    }
  });

  //   res.status(301).redirect(linkThumb);
});

module.exports = router;
