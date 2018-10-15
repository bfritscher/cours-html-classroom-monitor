describe("Exercice01", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await removeRemixButton();
    await page.screenshot({
      path: `./public/screenshots/exercice01/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  describe("index.html (page 1)", () => {
    it("Titre de la page", async () => {
      expect(await getInnerText("h1")).toBe(
        "LES PETITES CENTRALES HYDRAULIQUES ET LA PROTECTION DE L'ENVIRONNEMENT"
      );
    });

    it("Sections de la page", async () => {
      const nb = await page.evaluate(
        () => document.querySelectorAll("h2").length
      );
      expect(nb).toEqual(1);
    });
    it("Sous-sections de la page", async () => {
      const nb = await page.evaluate(
        () => document.querySelectorAll("h3").length
      );
      expect(nb).toEqual(2);
    });

    it("Image figure 1", async () => {
      await expect(page).toMatchElement('img[src="images/figure1.png"]');
    });

    it("Lien source", async () => {
      expect(page).toMatchElement(
        'a[href="http://www.fischnetz.ch/index_f.htm"'
      );
    });

    validateHTMLcurrentPage();

    it("Lien vers la page 2", async () => {
      await expect(page).toClick('a[href="page2.html"]');
      await page.waitForSelector("html");
      await removeRemixButton();
    });
  });

  describe("page2.html", () => {
    it("Sections de la page", async () => {
      const nb = await page.evaluate(
        () => document.querySelectorAll("h2").length
      );
      expect(nb).toEqual(2);
    });
    it("Image figure 2", async () => {
      await expect(page).toMatchElement('img[src="images/figure2.png"]');
    });

    it("Lien vers la page index.html", async () => {
      await expect(page).toMatchElement('a[href="index.html"]');
    });
    validateHTMLcurrentPage();

    it("Lien vers la page 3", async () => {
      await expect(page).toClick('a[href="page3.html"]');
      await page.waitForSelector("html");
      await removeRemixButton();
    });
  });

  describe("page3.html", () => {
    it("Sections de la page", async () => {
      const nb = await page.evaluate(
        () => document.querySelectorAll("h2").length
      );
      expect(nb).toEqual(2);
    });
    it("Sous-sections de la page", async () => {
      const nb = await page.evaluate(
        () => document.querySelectorAll("h3").length
      );
      expect(nb).toEqual(2);
    });

    it("Image veveyse", async () => {
      await expect(page).toMatchElement('img[src="images/veveyse.jpg"]');
    });

    it("Image pch_jura", async () => {
      await expect(page).toMatchElement('img[src="images/pch_jura.jpg"]');
    });

    it("Lien vers note de bas de page #note1", async () => {
      await expect(page).toMatchElement('a[href="#note1"]');
    });

    it("Liste alphabétique", async () => {
      const nb = await page.evaluate(() =>
        [...document.querySelectorAll('ol[type="a"]')].map(
          ol => ol.children.length
        )
      );
      expect(nb).toEqual([4]);
    });

    it("Liste à puces", async () => {
      const nb = await page.evaluate(() =>
        [...document.querySelectorAll("ul")].map(ol => ol.children.length)
      );
      expect(nb).toEqual([7]);
    });

    it("Lien vers la page 2", async () => {
      await expect(page).toMatchElement('a[href="page2.html"]');
    });

    validateHTMLcurrentPage();
  });
});
