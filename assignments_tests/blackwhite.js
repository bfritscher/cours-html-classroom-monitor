describe("Black White", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await page.screenshot({
      path: `./public/screenshots/blackwhite/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  describe("index.html", () => {
    it("Lien vers black est relatif", async () => {
      const href = await getAttribute("#black", "href");
      await expect(hash(href)).toEqual("6dd59c735076a4f97bc672383d2d7d6edec77ad3a433b8e1257398c54845965e");
    });

    it("Lien vers white est absolut", async () => {
      const href = await getAttribute("#white", "href");
      await expect(hash(href)).toEqual("b400ff88502e3551d7dd69545d964fec7a3a0b0b47af60c2ba0f605650a678c6");
    });
  });

  describe("black", () => {
    beforeAll(async () => {
      await page.goto(process.env.TestURL + "/black/index.html");
    });

    it("Black lien vers scroll est relatif", async () => {
      const href = await getAttribute("#scroll", "href");
      await expect(hash(href)).toEqual("22029b6607deead97825d54e04737688381ed8a748088b9318fec7ddaffa4f97");
    });

    it("Black lien vers white est relatif", async () => {
      const href = await getAttribute("#white", "href");
      await expect(hash(href)).toEqual("ceefc00462531821ba6b1686ca979c71b14fe733cb93883575337647d9856d76");
    });

    it("Black lien retour est relatif", async () => {
      const href = await getAttribute("#retour", "href");
      await expect(hash(href)).toEqual("579ab2998552564d21fcb88b6675210553fd42fca94b9d90a648013dcaa6553f");
    });

  });

  describe("white", () => {
    beforeAll(async () => {
      await page.goto(process.env.TestURL + "/white/index.html");
    });

    it("White lien retour est absolut", async () => {
      const href = await getAttribute("#retour", "href");
      await expect(hash(href)).toEqual("213456c5dc963e03ec1f27600c46c954c70224985fa62603db2fb2ab1ca06d35");
    });

    it("White lien absolut vers secret", async () => {
      const href = await getAttribute("#secret", "href");
      await expect(hash(href)).toEqual("685ae9a4461f95cd215278a63d206beb93d30acc4565a84292b3eaf2679c7734");
    });

    it("White img est dans le lien", async () => {
      await expect(page).toMatchElement("a img");
    });

    it("White lien img est absolut", async () => {
      const href = await getAttribute("img", "src");
      await expect(hash(href)).toEqual("9dd6a730b406e33e34d3d97c3b48c5e1d26445062745d8cba241d8cabdf80740");
    });
  });

  describe("scroll", () => {
    beforeAll(async () => {
      // codesanbox hooks blocks hash nav...
      await page.goto(process.env.TestURL + "/black/scroll.html");
    });

    it("Scroll lien vers poisson", async () => {
      const href = await getAttribute("#find", "href");
      await expect(hash(href)).toEqual("b90742ffdfef820d329f47fd3d673c17a75bfcc79551a1d9f412497905e43d3d");
    });

    it("Scroll lien img poisson est relatif", async () => {
      const href = await getAttribute("#poisson", "src");
      await expect(hash(href)).toEqual("aa484adcd693dfe664f6f3c3a07a43fd365020600757882bb2296277bbf849aa");
    });

    it("Scroll lien img secret est relatif", async () => {
      const href = await getAttribute("#secret", "src");
      await expect(hash(href)).toEqual("77eaaf94fa9b7ed66e0196d14c6a76965c4492b213446a4c681356e1955bd691");
    });

    it("Scroll lien vers le haut de la page", async () => {
      const href = await getAttribute("#haut", "href");
      await expect(hash(href)).toEqual("916ce0de42350b80fb13a0cc3a79c043811905931dfba24d467f10d7803c3ff3");
    });
  });
});
