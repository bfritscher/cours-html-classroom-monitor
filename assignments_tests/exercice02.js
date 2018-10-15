describe("Exercice02", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await removeRemixButton()
    await page.screenshot({
      path: `./public/screenshots/exercice02/${process.env.TestUser}.png`,
      fullPage: true,
    })
  });

  it("Titre de la page", async () => {
    expect(await getInnerText("h1")).toBe("Recette crack pie");
  });

  it("Image de titre", async () => {
    await expect(page).toMatchElement('img[src="Crackpie.jpg"]')
  });

  it("Sections de la page", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll("h2")].map(e => e.innerText));
    expect(texts).toEqual(["Informations", "Ingrédients", "Etapes"]);
  });

  it("Liste à numéros", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll("ol")].map(ol => ol.children.length));
    expect(texts).toEqual([3, 8]);
  });

  it("Liste de liste", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll("ol > li > ul")].map(ol => ol.children.length));
    expect(texts).toEqual([10, 2, 8]);
  });

  it("Liens source", async () => {
    expect(await getInnerText('a[href="https://www.eliseditatable.com/2015/05/crack-pie.html"')).toBe("Elise dit à Table!");
  });

  validateHTMLcurrentPage();

/*
  it("Apparence", async () => {
    const image = await page.screenshot({
        fullPage: true,
    });
    expect(image).toMatchImageSnapshot();
  });

  it("Correct Image", async () => {
    const image = await (await page.$('img')).screenshot();
    expect(image).toMatchImageSnapshot();
  });
*/
});
