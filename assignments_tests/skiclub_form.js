describe("Ski Club FORM", () => {
  let image;
  beforeAll(async () => {
    await setSandboxCookie();
    await page.goto(process.env.TestURL);
    image = await page.screenshot({
      path: `./public/screenshots/skiclub_form/${process.env.TestUser}.png`,
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
      return form.getAttributeNames().map(n => form.getAttribute(n).toLowerCase());
    });
    expect(texts).toContain("https://httpbin.org/post");
    expect(texts).toContain("post");
    expect(texts).toContain("multipart/form-data");
  });

  it("Sections du formulaire", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("fieldset legend")].map(e => e.innerText)
    );
    expect(texts).toEqual(["Données personnelles", "Statistiques: SwissSki", "Commentaires"]);
  });

  it("Nom des élements du formulaire", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("input, select, textarea")].map(e => e.getAttribute("name")).slice(0, 14)
    );
    expect(texts).toEqual(["email", "mdp1", "mdp2", "type", "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub", "deja_skiclub", "autre_skiclub", "commentaire"]);
  });

  // p label name
  it("Elements du formulaire dans un p et nom correct", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("p input, p select")].map(e => e.getAttribute("name"))
    );
    expect(texts).toEqual(["email", "mdp1", "mdp2", "type", "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub", "deja_skiclub", "autre_skiclub"]);
  });

  it("Label for", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("label")].map(e => e.getAttribute("for"))
    );
    expect(texts).toEqual(["email", "mdp1", "mdp2", "type", "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub_non", "deja_skiclub_oui"]);
  });

  compareImage({
    customSnapshotIdentifier: "skiclub_form",
  },
  image);
});
