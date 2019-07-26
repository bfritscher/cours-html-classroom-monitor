describe("Recette", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await page.screenshot({
      path: `./public/screenshots/recette/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();
  validateCSScurrentPage();
  compareImage({
    customSnapshotIdentifier: "recette"
  });
});

