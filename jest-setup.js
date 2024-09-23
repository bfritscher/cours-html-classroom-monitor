require("expect-puppeteer");
jest.setTimeout(30000);

const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });
const fetch = require("node-fetch");
const crypto = require("crypto");
const { glob } = require("fs");

global.hash = (str) => crypto.createHash("sha256").update(str).digest("hex");

global.getValidationJSON = async (url) => {
  const response = await fetch(
    `https://validator.w3.org/nu/?out=json&level=error&doc=${url}`
  );
  return response.json();
};

global.validateHTMLcurrentPage = () => {
  it("Aucune erreur de validation HTML", async () => {
    const results = await global.getValidationJSON(page.url());
    expect(results.messages.length).toStrictEqual(0);
  });
};

global.getCSSValidation = async (url) => {
  const response = await fetch(
    `https://jigsaw.w3.org/css-validator/validator?profile=css3svg&usermedium=all&warning=no&lang=fr&output=text&uri=${url}`
  );
  return response.text();
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

global.getInnerText = (selector) => {
  return page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      return el.innerText;
    }
    return "";
  }, selector);
};

global.getAttribute = (selector, attribute) => {
  return page.evaluate(
    (selector, attribute) => {
      const el = document.querySelector(selector);
      if (el) {
        return el.getAttribute(attribute);
      }
      return "";
    },
    selector,
    attribute
  );
};

global.getCSSPropertyValues = (selector, ...cssList) => {
  return page.evaluate(
    (selector, cssList) => {
      const domCSS = window.getComputedStyle(document.querySelector(selector));
      return cssList.reduce((r, propName) => {
        r[propName] = domCSS.getPropertyValue(propName);
        return r;
      }, {});
    },
    selector,
    cssList
  );
};

global.compareImage = (options = {}, image = null) => {
  it("Apparence est la même", async () => {
    if (!image) {
      await removeSandboxButton();
      image = await page.screenshot({
        fullPage: true,
      });
    }
    options = Object.assign(
      {
        customDiffDir: `./public/screenshots/${options.customSnapshotIdentifier}/${process.env.TestUser}`,
        failureThreshold: "0.02",
        failureThresholdType: "percent",
      },
      options
    );
    expect(image).toMatchImageSnapshot(options);
  });
};

global.removeSandboxButton = async () => {
  await page.waitForSelector("iframe");
  return page.evaluate(() => {
    const fishing = document.querySelector("iframe");
    if (fishing) {
      fishing.remove();
    }
    const button = document.querySelector("iframe");
    if (button) {
      button.remove();
    }
    return button;
  });
};

global.setSandboxCookie = async () => {
  return page.setCookie({
    name: "csb_is_trusted",
    value: "true",
    domain: new URL(process.env.TestURL).hostname,
  });
};

