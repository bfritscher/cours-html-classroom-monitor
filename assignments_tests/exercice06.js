describe("Exercice06", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await removeRemixButton();
    await page.screenshot({
      path: `./public/screenshots/exercice06/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

  validateCSScurrentPage();

  it("Titre de la page", async () => {
    expect(await getInnerText("header h1")).toBe("Ski Club HEG");
  });

  it("Metadonnées du formulaire", async () => {
    const texts = await page.evaluate(() => {
      const form = document.querySelector("form");
      return form.getAttributeNames().map(n => form.getAttribute(n));
    });
    expect(texts).toEqual(["https://hec.unil.ch/info1ere/echo/", "post", "multipart/form-data"]);
  });

  it("Sections du formulaire", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("fieldset legend")].map(e => e.innerText)
    );
    expect(texts).toEqual(["Données personnelles", "Statistiques: SwissSki", "Commentaires"]);
  });

  // p label name
  it("Elements du formulaire", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("p label input, p label select, textarea")].map(e => e.getAttribute("name"))
    );
    expect(texts).toEqual(["email", "mdp1", "mdp2", "type", "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub", "deja_skiclub", "commentaire"]);
  });


  it("Apparence est la même", async () => {
    const image = await page.screenshot({
      fullPage: true
    });
    // font rendering not the same allow small difference
    expect(image).toMatchImageSnapshot({
      failureThreshold: "0.02",
      failureThresholdType: "percent"
    });
  });
});
