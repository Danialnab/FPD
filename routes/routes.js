const express = require("express");
const router = express.Router();
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");
const res = require("express/lib/response");
const req = require("express/lib/request");

router.get("/", async (req, res) => {
  res.render("index");
});

const downloadPath = path.resolve("./public/downloads");

const delay = function (time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
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
  const mlink = req.body.link;
  const page = await browser.newPage();
  await page.goto(req.body.link);
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });
  //   const loginBtn = await page.$(".gr-auth--not-logged");
  //   if (loginBtn) {
  //     await page.click(".auth-link");
  //     await page.$eval(
  //       "#login-username",
  //       (el) => (el.value = "daniyal.nabibakhsh@digitecham.com")
  //     );
  //     await page.$eval("#login-password", (el) => (el.value = "Dan677618!!"));
  //     await page.click("#auth-login-form-1");
  //   }
  const linkThumb = await page.$eval(".thumb", (el) => el.src);
  const linkTitle = await page.$eval("h1", (el) => el.innerText);
  await page.click("#download-file");
  await page.click(".download-button");
  page.on("response", (response) => {
    const url = response.request().url();
    const contentType = response.headers()["content-type"];
    if (contentType === "application/zip") {
      rawFileName = path.basename(response.request().url());
      fileName = rawFileName.split("?")[0];
      const waitFile = async function (
        nName,
        realFileName,
        mlink,
        linkThumb,
        linkTitle
      ) {
        return new Promise(async (resolve, reject) => {
          const mdata = {
            mlink,
            linkThumb,
            linkTitle,
            realFileName,
          };
          if (!fs.existsSync(nName)) {
            await delay(3000);
            await waitFile(nName, realFileName, mlink, linkThumb, linkTitle);
            resolve();
          } else {
            await page.close();
            resolve();
            res.render("confirmpage", { mdata });
          }
        });
      };
      waitFile(
        `./public/downloads/${fileName}`,
        fileName,
        mlink,
        linkThumb,
        linkTitle
      );
    }
  });
});



module.exports = router;
