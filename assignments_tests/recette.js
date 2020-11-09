describe("Recette", () => {
  let image;
  let pageSource;
  beforeAll(async () => {
    const response = await page.goto(process.env.TestURL, {waitUntil : "networkidle0" });
    pageSource = await response.text();
    await removeSandboxButton();
    image = await page.screenshot({
      path: `./public/screenshots/recette/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  const orangered = "rgb(255, 69, 0)";
  const white = "rgb(255, 255, 255)";

  // check has link to css
  it("Lien vers fichier CSS", async () => {
    expect(pageSource.includes('rel="stylesheet"')).toBe(true);
  });

  it("Pas de style dans le html", async () => {
    expect(pageSource.includes("style=")).toBe(false);
    expect(pageSource.includes("<style>")).toBe(false);
  });

  it("h1 police et couleur", async () => {
    const css = await getCSSPropertyValues("h1", "font-family", "text-align", "color");
    expect(css["font-family"]).toMatch(/Cantata One/);
    expect(css["text-align"]).toEqual("center");
    expect(css["color"]).toEqual(orangered);
  });

  it("h2 police bordures", async () => {
    const css = await getCSSPropertyValues("h2", "font-family", "border-bottom-width", "border-bottom-style", "border-bottom-color", "margin-right");
    expect(css["font-family"]).toMatch(/Charmonman/);
    expect(css["border-bottom-width"]).toEqual("1px");
    expect(css["border-bottom-style"]).toEqual("solid");
    expect(css["border-bottom-color"]).toEqual(orangered);
    expect(css["margin-right"]).toEqual("0px");
  });

  it("Liste sans puces", async () => {
    const css = await getCSSPropertyValues("li", "list-style-type");
    expect(css["list-style-type"]).toEqual("none");
  });

  it("Classe qte est correcte", async () => {
    const css = await getCSSPropertyValues(".qte", "font-weight", "color");
    expect(css["font-weight"]).toEqual("700");
    expect(css["color"]).toEqual(white);
  });

  it("Classe prepartion police et couleur", async () => {
    const css = await getCSSPropertyValues(".preparation", "background-color","color", "font-family", "padding");
    expect(css["font-family"]).toMatch(/Cantata One/);
    expect(css["color"]).toEqual(orangered);
    expect(css["background-color"]).toEqual(white);
  });

  it("id source est correcte", async () => {
    const css = await getCSSPropertyValues("#source", "margin-top", "text-align");
    expect(css["text-align"]).toEqual("right");
    expect(css["margin-top"]).toEqual("32px");
  });

  validateHTMLcurrentPage();
  validateCSScurrentPage();
  compareImage({
    customSnapshotIdentifier: "recette"
  }, image);

});
