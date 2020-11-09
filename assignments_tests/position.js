describe("Position", () => {
  let image;
  let pageSource;
  beforeAll(async () => {
    const response = await page.goto(process.env.TestURL, {waitUntil : "networkidle0" });
    pageSource = await response.text();
    await removeSandboxButton();
    image = await page.screenshot({
      path: `./public/screenshots/position/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  it("Pas de style dans le html", async () => {
    expect(pageSource.includes("style=")).toBe(false);
    expect(pageSource.includes("<style>")).toBe(false);
  });

  validateHTMLcurrentPage();
  validateCSScurrentPage();
  compareImage({
    customSnapshotIdentifier: "position",
    failureThreshold: "0.0"
  }, image);

});
