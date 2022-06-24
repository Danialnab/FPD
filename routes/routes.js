const express = require("express");
const router = express.Router();
const path = require("path");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const Req = require("../models/requests");
const uniqId = require("uniqid");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Log = require("../models/logs");

const delay = function (time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/show/:id", async (req, res) => {
  const { id } = req.params;
  const foundReq = await Req.findById(id).populate("owner");
  res.render("show", { foundReq });
});

router.get("/archive", async (req, res) => {
  const requests = await Req.find({}).populate("owner", "username");
  res.render("archive", { requests });
});

let browser;

puppeteerExtra.use(stealthPlugin());

const browserstart = async () => {
  browser = await puppeteerExtra.launch({
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

browserstart();

router.post("/req", async (req, res) => {
  const { link } = req.body;

  if (!link.includes("www.freepik.com")) {
    req.flash("error", "Your entered link is not a freepik link");
    res.redirect("/");
    return;
  }

  const uid = uniqId();
  const dir = `./public/downloads/${uid}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const uDownloadPath = path.resolve(dir);

  const page = await browser.newPage();
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: uDownloadPath,
  });
  await page.goto(req.body.link);
  // const loginBtn = await page.$(".gr-auth--not-logged");
  // if (loginBtn) {
  //   await page.click(".auth-link");
  //   const avatar = await page.$(".avatar");
  //   if (!avatar) {
  //     await page.$eval(
  //       "#login-username",
  //       (el) => (el.value = "daniyal.nabibakhsh@digitecham.com")
  //     );
  //     await page.$eval("#login-password", (el) => (el.value = "Dan677618!!"));
  //     await page.click("#auth-login-form-1");
  //   } else {
  //     await page.click(".avatar");
  //   }
  // }
  const thumbLink = await page.$eval(".thumb", (el) => el.src);
  const title = await page.$eval("h1", (el) => el.innerText);
  await page.click(".download-button");
  await delay(2500);

  let curFileName;
  let fileExtension;

  const getFileName = async () => {
    const files = await readdir(dir);
    const fileNameArr = files[0].split(".");
    curFileName = fileNameArr[0];
    fileExtension = fileNameArr[fileNameArr.length - 1];
    if (fileExtension !== "crdownload") {
      const mdata = {
        mlink: link,
        linkThumb: thumbLink,
        linkTitle: title,
        realFileName: `/downloads/${uid}/${curFileName}.${fileExtension}`,
      };
      const request = new Req({
        name: title,
        link: `/downloads/${uid}/${curFileName}.${fileExtension}`,
        image: thumbLink,
        owner: req.user,
      });
      const newLog = new Log({
        action: `${req.user.username} requested the download of ${request.id}`,
        owner: req.user,
      });
      await newLog.save();
      await request.save();
      await page.close();
      res.render("confirmpage", { mdata });
    } else {
      await delay(2500);
      getFileName();
    }
  };
  getFileName();
});

module.exports = router;