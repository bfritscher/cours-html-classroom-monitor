describe("Exercice04", () => {
  beforeAll(async () => {
    await page.goto(process.env.TestURL);
    await removeRemixButton();
    await page.screenshot({
      path: `./public/screenshots/exercice04/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();
  validateCSScurrentPage();
  compareImage({
    customSnapshotIdentifier: "exercice04"
  });
});

