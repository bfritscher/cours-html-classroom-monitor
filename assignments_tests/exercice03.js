describe("Exercice03", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    // remove remix button
    await removeRemix()
    await page.screenshot({
      path: `./public/screenshots/exercice03/${process.env.TestUser}.png`,
      fullPage: true,
    })
  });

  it("Tableau possède une légende", async () => {
    expect(await getInnerText("caption")).toBe("Commande client");
  });

  it("En-tête de la table", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll("table > thead > tr > th")].map(e => e.innerText));
    expect(texts.map(e => e.trim())).toEqual(["No article", "Article", "Qté", "Prix", "Montant"]);
  });

  it("Body de la table", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll("table > tbody > tr")].map(e => e.children.length));
    expect(texts).toEqual([5, 5, 5, 5]);
  });

  it("Pied de la table", async () => {
    const texts = await page.evaluate(() => [...document.querySelectorAll('table > tfoot > tr > th[colspan="4"] ')].map(e => e.innerText));
    expect(texts.map(e => e.trim())).toEqual(["Sous total", "Total"]);
  });

  validateHTMLcurrentPage();

});
