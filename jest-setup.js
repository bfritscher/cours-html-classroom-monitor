require("expect-puppeteer");
jest.setTimeout(30000);

const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });
const crypto = require("crypto");
const htmlValidatorUrl =
  process.env.HTML_VALIDATOR_URL || "https://validator.w3.org/nu/";

global.hash = (str) => crypto.createHash("sha256").update(str).digest("hex");

global.fetchJsonWithDetails = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status} ${response.statusText}) for ${url}. Response body: ${body.slice(
        0,
        500
      )}`
    );
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(
      `Invalid JSON response (${response.status} ${response.statusText}) for ${url}. Response body: ${body.slice(
        0,
        500
      )}`
    );
  }
};

global.validateHTMLcurrentPage = () => {
  it("Aucune erreur de validation HTML", async () => {
    const pageContent = await page.content();
    const strippedContent = pageContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<link\b[^>]*as=["']script["'][^>]*>/gi, "");
    const results = await global.fetchJsonWithDetails(
      `${htmlValidatorUrl}?out=json&level=error`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
        body: strippedContent,
      }
    );
    expect(results.messages.length).toStrictEqual(0);
  });
};

global.validateCSScurrentPage = () => {
  it("Aucune erreur de validation CSS", async () => {
    const stylesheetUrl = await page.evaluate(() => {
      const firstStylesheet = document.querySelector('link[rel~="stylesheet"][href]');
      if (!firstStylesheet) {
        return "";
      }
      return new URL(firstStylesheet.getAttribute("href"), document.baseURI).toString();
    });

    if (!stylesheetUrl) {
      throw new Error("No stylesheet found on current page");
    }

    const stylesheetResponse = await fetch(stylesheetUrl);
    const stylesheetContent = await stylesheetResponse.text();
    if (!stylesheetResponse.ok) {
      throw new Error(
        `Failed to fetch stylesheet (${stylesheetResponse.status} ${stylesheetResponse.statusText}) from ${stylesheetUrl}. Response body: ${stylesheetContent.slice(
          0,
          500
        )}`
      );
    }

    const validationResult = await global.fetchJsonWithDetails(`${htmlValidatorUrl}?out=json&level=error`, {
      method: "POST",
      headers: {
        "Content-Type": "text/css; charset=utf-8",
      },
      body: stylesheetContent,
    });

    const cssErrors = (validationResult.messages || []).filter(
      message => message.type === "error"
    );
    expect(cssErrors.length).toBe(0);
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
