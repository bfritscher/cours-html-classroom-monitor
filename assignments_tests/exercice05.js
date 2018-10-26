describe("Exercice05", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await removeRemixButton();
    await page.screenshot({
      path: `./public/screenshots/exercice05/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

  validateCSScurrentPage();

  // title
  it("Titre", async () => {
    expect(await getInnerText("title")).toBe("Le monde des biscuits");
    expect(await getInnerText("h1")).toBe("Le monde des biscuits");
  });

  it("Corps", async () => {
    const css = await getCSSPropertyValues("body", "display", "font-family", "flex-direction", "background-image");
    expect(css["display"]).toBe("flex");
    expect(css["flex-direction"]).toBe("column");
    expect(css["background-image"]).toMatch(/Seamless-Space-Pattern/);
    expect(css["font-family"]).toMatch(/Inconsolata/);
  });

  it("En-tête", async () => {
    const css = await getCSSPropertyValues("header", "background-color");
    expect(css["background-color"]).toBe("rgb(231, 71, 107)");
  });

  it("Titre dans en-tête", async () => {
    const css = await getCSSPropertyValues("header h1", "font-family", "color");
    expect(css["font-family"]).toMatch(/Merriweather/);
    expect(css["color"]).toBe("rgb(255, 255, 255)");
  });

  it("Menu principal", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("nav a")].map(e => e.textContent)
    );
    expect(texts).toEqual(["Accueil", "Recettes", "Contact"]);
    const textsCSS = await page.evaluate(() =>
      [...document.querySelectorAll("nav a")].map(e => e.innerText)
    );
    expect(textsCSS).toEqual(["ACCUEIL", "RECETTES", "CONTACT"]);
  });


  it("Deux articles", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("article h2")].map(e => e.textContent)
    );
    expect(texts).toEqual(["Les biscuits ont une histoire", "Les étoiles à la cannelle en tête"]);
  });

  it("Texte autour de la figure", async () => {
    const css = await getCSSPropertyValues("figure", "float", "max-width");
    expect(css["float"]).toBe("left");
    expect(css["max-width"]).toBe("300px");
  });

  it("Section définition", async () => {
    expect(await getInnerText("section h2")).toBe("Définitions");
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("dl > dt")].map(e => e.innerText)
    );
    expect(texts).toEqual(["Abricoter", "Blanchir", "Concasser"]);
  });

  it("Aparté", async () => {
    const css = await getCSSPropertyValues("aside", "flex", "border", "border-radius", "color", "background-color");
    expect(css["color"]).toBe("rgb(231, 71, 107)");
    expect(css["background-color"]).toBe("rgb(20, 38, 78)");
    expect(css["border"]).toBe("3px solid rgb(231, 71, 107)");
    expect(css["border-radius"]).toBe("8px");
    expect(css["flex"]).toBe("1 1 0%");
  });

  it("Aparté liste", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("aside ul")].map(ol => ol.children.length)
    );
    expect(texts).toEqual([2]);
  });


  it("Pied de page", async () => {
    const css = await getCSSPropertyValues("footer", "background-color");
    expect(css["background-color"]).toBe("rgb(231, 71, 107)");
  });

  it("Image pied de page", async () => {
    const css = await getCSSPropertyValues("footer img", "vertical-align");
    expect(css["vertical-align"]).toBe("bottom");
  });

  it("Apparence est la même", async () => {
    const image = await page.screenshot({
      fullPage: true
    });
    expect(image).toMatchImageSnapshot();
  });
});
