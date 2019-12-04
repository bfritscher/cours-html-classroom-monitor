require("expect-puppeteer");
jest.setTimeout(30000)

const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });
const request = require("request-promise-native");
const crypto = require("crypto");

global.hash = (str) => crypto.createHash("sha256").update(str).digest("hex");

global.getValidationJSON = url => {
  return request({
    uri: "https://validator.w3.org/nu/",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    qs: {
      out: "json",
      level: "error",
      doc: url
    },
    json: true
  });
};

global.validateHTMLcurrentPage = () => {
  it("Aucune erreur de validation HTML", async () => {
    const results = await global.getValidationJSON(page.url());
    expect(results.messages.length).toStrictEqual(0);
  });
};

global.getCSSValidation = url => {
  return request({
    uri: "https://jigsaw.w3.org/css-validator/validator",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
    },
    qs: {
      uri: url,
      profile: "css3svg",
      usermedium: "all",
      warning: "no",
      lang: "fr",
      output: "text"
    }
  });
};

global.validateCSScurrentPage = () => {
  it("Aucune erreur de validation CSS", async () => {
    const res = await global.getCSSValidation(page.url());
    expect(
      res.includes("Félicitations ! Aucune erreur trouvée.") &&
        !res.includes("Désolé ! Les erreurs suivantes ont été trouvées")
    ).toBeTruthy();
  });
};

global.getInnerText = selector => {
  return page.evaluate(selector => {
    const el = document.querySelector(selector);
    if (el) {
      return el.innerText;
    }
    return "";
  }, selector);
};

global.getAttribute = (selector, attribute) => {
  return page.evaluate((selector, attribute) => {
    const el = document.querySelector(selector);
    if (el) {
      return el.getAttribute(attribute);
    }
    return "";
  }, selector, attribute);
};

global.getCSSPropertyValues = (selector, ...cssList) => {
  return page.evaluate((selector, cssList) => {
    const domCSS = window.getComputedStyle(document.querySelector(selector));
    return cssList.reduce((r, propName) => {
      r[propName] = domCSS.getPropertyValue(propName);
      return r;
    }, {});
  }, selector, cssList);
};

global.compareImage = (options = {}) => {
  it("Apparence est la même", async () => {
    const image = await page.screenshot({
      fullPage: true
    });
    options = Object.assign({
      customDiffDir: `./public/screenshots/${options.customSnapshotIdentifier}/${process.env.TestUser}`,
      failureThreshold: "0.04",
      failureThresholdType: "percent"
    }, options);
    expect(image).toMatchImageSnapshot(options);
  });
};
