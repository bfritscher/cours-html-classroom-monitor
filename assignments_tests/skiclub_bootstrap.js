describe("Ski Club FORM", () => {
  let image;
  beforeAll(async () => {
    await page.goto(process.env.TestURL, {waitUntil : "networkidle0" });
    await removeSandboxButton();
    image = await page.screenshot({
      path: `./public/screenshots/skiclub_bootstrap/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

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
    expect(texts).toEqual(["email", "type", "mdp1", "mdp2",  "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub", "deja_skiclub", "autre_skiclub", "commentaire"]);
  });

  it("Label for", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("label")].map(e => e.getAttribute("for"))
    );
    expect(texts).toEqual(["email", "type", "mdp1", "mdp2", "nom", "prenom", "photo", "ski_piste", "ski_rando", "apero", "deja_skiclub_non", "deja_skiclub_oui"]);
  });

  it("Sections du formulaire bonne marge", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("fieldset")].map(e => e.classList.contains("mb-5"))
    );
    expect(texts).toEqual([true, true, true]);
  });

  it("Titre de la card", async () => {
    const texts = await page.evaluate(() =>
      document.querySelector(".card .card-header").innerText
    );
    expect(texts).toEqual("Carte d'adhérant");
  });

  it("Bon nombre de row et marges", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll(".row.mb-3")].length
    );
    expect(texts).toEqual(6);
  });

  it("Bon nombre de col", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll(".row .col-md-6")].length
    );
    expect(texts).toEqual(9);
  });

  compareImage({
    customSnapshotIdentifier: "skiclub_bootstrap",
  },
  image);
});
