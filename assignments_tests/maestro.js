describe("Maestro", () => {
  beforeAll(async () => {
    await setSandboxCookie();
    await page.goto(process.env.TestURL);
    await page.screenshot({
      path: `./public/screenshots/maestro/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

  it("Titre dans le navigateur", async () => {
    expect(await getInnerText("title")).toBe("Conditions et règlements");
  });

  it("Titre de la page", async () => {
    expect(await getInnerText("h1")).toBe("Conditions d'utilisation de la carte Maestro");
  });

  it("Règle horizontale", async () => {
    const tag = await page.evaluate(() =>
      document.querySelector("h1 + hr")
    );
    expect(tag).not.toBeNull();
  });

  it("Sections de la page", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("h2")].map(e => e.innerText)
    );
    expect(texts).toEqual(["Dispositions générales", "La carte maestro comme carte de prélèvement d'argent comptant et de paiement"]);
  });

  it("Sous-sections de la page", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("h3")].map(e => e.innerText)
    );
    expect(texts).toEqual(["Possibilités d'utilisation (fonctions)", "Compte bancaire", "Ayants droit à la carte", "Propriété", "Frais", "Devoirs de diligence de l'ayant droit à la carte", "Fonctions de prélèvement d'argent comptant", "Fonction de paiement"]);
  });

  it("Liste à puce", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("ul")].map(ol => ol.children.length)
    );
    expect(texts).toEqual([3]);
  });

  it("Liste alphabétique", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll('ol[type="a"]')].map(ol => ol.children.length)
    );
    expect(texts).toEqual([4]);
  });

});
