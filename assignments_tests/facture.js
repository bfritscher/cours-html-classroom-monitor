describe("Facture", () => {
  beforeAll(async () => {
    await setSandboxCookie();
    await page.goto(process.env.TestURL);
    await page.screenshot({
      path: `./public/screenshots/facture/${process.env.TestUser}.png`,
      fullPage: true
    });
  });
  
  validateHTMLcurrentPage();

  it("Tableau possède une légende", async () => {
    expect(await getInnerText("caption")).toBe("Commande client");
  });

  it("En-tête du tableau", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("table > thead > tr > th")].map(
        e => e.innerText
      )
    );
    expect(texts.map(e => e.trim())).toEqual([
      "No article",
      "Article",
      "Qté",
      "Prix",
      "Montant"
    ]);
  });

  it("Contenu du tableau", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll("table > tbody > tr")].map(
        e => e.children.length
      )
    );
    expect(texts).toEqual([5, 5, 5, 5]);
  });

  it("Pied du tableau", async () => {
    const texts = await page.evaluate(() =>
      [
        ...document.querySelectorAll('table > tfoot > tr > th[colspan="4"] ')
      ].map(e => e.innerText)
    );
    expect(texts.map(e => e.trim())).toEqual(["Sous total", "Total"]);
  });

});
