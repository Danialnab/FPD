const express = require("express");
const router = express.Router();
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");
const Req = require("../models/requests");

const downloadPath = path.resolve("./public/downloads");
let browser;
const delay = function (time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const startBroswer = async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 50, // slow down by 50ms
    args: [`--window-size=1200,1000`],
    defaultViewport: {
      width: 1200,
      height: 1000,
    },
    userDataDir: "./user-data-dir",
  });
};
startBroswer();

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/archive", async (req, res) => {
  const requests = await Req.find({}).populate("owner", "username");
  res.render("archive", { requests });
});

router.post("/req", async (req, res) => {
  let fileName;
  const mlink = req.body.link;
  if (!mlink.includes("www.freepik.com")) {
    req.flash("error", "Your entered link is not a freepik link");
    res.redirect("/");
    return;
  }
  const page = await browser.newPage();
  await page.goto(req.body.link);
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });
  const loginBtn = await page.$(".gr-auth--not-logged");
  if (loginBtn) {
    await page.click(".auth-link");
    const avatar = await page.$(".avatar");
    if (!avatar) {
      await page.$eval(
        "#login-username",
        (el) => (el.value = "daniyal.nabibakhsh@digitecham.com")
      );
      await page.$eval("#login-password", (el) => (el.value = "Dan677618!!"));
      await page.click("#auth-login-form-1");
    } else {
      await page.click(".avatar");
    }
  }
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
            const request = new Req({
              name: linkTitle,
              link: `/downloads/${realFileName}`,
              image: linkThumb,
              owner: req.user,
            });
            await request.save();
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
