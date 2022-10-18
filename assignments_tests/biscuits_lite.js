describe("Biscuits lite", () => {
  let image;
  beforeAll(async () => {
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    });
    await page.goto(process.env.TestURL, {waitUntil : "networkidle0" });
    await removeSandboxButton();
    image = await page.screenshot({
      path: `./public/screenshots/biscuits_lite/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

  validateCSScurrentPage();

  // title
  /*
   it("Page", async () => {
    const css = await getCSSPropertyValues("body", "display", "flex-direction");
    expect(css["display"]).toBe("flex");
    expect(css["flex-direction"]).toBe("column");
  });
  */

  it("Menu principal avec majuscules CSS", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("nav a")].map(e => e.textContent)
    );
    expect(texts).toEqual(["Accueil", "Recettes", "Contact"]);
    const textsCSS = await page.evaluate(() =>
      [...document.querySelectorAll("nav a")].map(e => e.innerText)
    );
    expect(textsCSS).toEqual(["ACCUEIL", "RECETTES", "CONTACT"]);
  });

  it("Main: enfants centrés et horizontal", async () => {
    const css = await getCSSPropertyValues('main', 'flex', 'flex-wrap', 'align-items', 'justify-content');
    expect(css["align-items"] === "flex-start").toBe(true);
    expect(css["flex"] === "4 1 0%").toBe(true);
    expect(css["flex-wrap"] === "wrap").toBe(true);
    expect(css["justify-content"] === "center").toBe(true);
  });

  it("Aparté", async () => {
    const css = await getCSSPropertyValues("aside", "flex", "border", "border-radius", "color", "background-color");
    expect(css["color"]).toBe("rgb(231, 71, 107)");
    expect(css["background-color"]).toBe("rgb(20, 38, 78)");
    expect(css["border"]).toBe("3px solid rgb(231, 71, 107)");
    expect(css["border-radius"]).toBe("8px");
    expect(css["flex"]).toBe("1 1 0%");
  });

  compareImage({
    customSnapshotIdentifier: "biscuits_lite",
    failureThreshold: "0.05"
  }, image);
});
