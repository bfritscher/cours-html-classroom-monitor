describe("Recette", () => {
  let image;
  beforeAll(async () => {
    await page.goto(process.env.TestURL, {waitUntil : "networkidle0" });
    await removeSandboxButton();
    image = await page.screenshot({
      path: `./public/screenshots/recette/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();
  validateCSScurrentPage();
  compareImage({
    customSnapshotIdentifier: "recette"
  }, image);
});
