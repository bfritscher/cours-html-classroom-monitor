describe("Donations", () => {
  beforeAll(async () => {
    await setSandboxCookie();
    await page.goto(process.env.TestURL, { waitUntil: "networkidle0" });
  });

  validateHTMLcurrentPage();

  it("Ajouter ajoute un li et total", async () => {
    const text = await page.evaluate(() => {
      document.getElementById("montant").value = "10";
      document.querySelector(".btn").click();
      return document.querySelector("li:last-child").innerText;
    });

    const textTotal = await page.evaluate(() => {
      return document.querySelector("p").innerText;
    });

    expect(text).toBe("10");
    expect(textTotal).toContain("Total: 10");
  });

  it("Montant est vide après ajout", async () => {
    const text = await page.evaluate(() => {
      return document.querySelector("#montant").value;
    });
    expect(text).toBe("");
  });

  it("Ajouter un deuxième li et mise à jour du total", async () => {
    const text = await page.evaluate(() => {
      document.getElementById("montant").value = "20";
      document.querySelector(".btn").click();
      return document.querySelector("li:last-child").innerText;
    });

    const textTotal = await page.evaluate(() => {
      return document.querySelector("p").innerText;
    });

    expect(text).toBe("20");
    expect(textTotal).toContain("Total: 30");
  });
  describe("image", () => {
    let image;
    beforeEach(async () => {
      await removeSandboxButton();
      image = await page.screenshot({
        path: `./public/screenshots/donations/${process.env.TestUser}.png`,
        fullPage: true,
      });
    });
    compareImage(
      {
        customSnapshotIdentifier: "donations",
        failureThreshold: "0.0",
      },
      image
    );
  });
});
