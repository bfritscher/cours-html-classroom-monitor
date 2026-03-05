describe("Bootstrap Grid", () => {
  let image;

  beforeAll(async () => {
    await setSandboxCookie();
    await page.goto(process.env.TestURL);
    image = await page.screenshot({
      path: `./public/screenshots/bootstrap_grid/${process.env.TestUser}.png`,
      fullPage: true
    });
  });

  validateHTMLcurrentPage();

  it("Pas d'élément supplémentaire dans la grille", async () => {
    const structure = await page.evaluate(() => {
      const container = document.querySelector(".container");
      const directChildren = container ? [...container.children] : [];
      const studentRows = container ? [...container.querySelectorAll(":scope > .row:not(.header)")] : [];

      return {
        containerChildrenCount: directChildren.length,
        allChildrenAreRows: directChildren.every((element) => element.classList.contains("row")),
        studentRowsCount: studentRows.length,
        studentRowCols: studentRows.map((row) => row.querySelectorAll(":scope > div").length),
        studentCellsTotal: studentRows.reduce((total, row) => total + row.querySelectorAll(":scope > div").length, 0),
        studentTexts: studentRows.flatMap((row) => [...row.querySelectorAll(":scope > div")].map((element) => element.textContent.trim()))
      };
    });

    expect(structure.containerChildrenCount).toBe(4);
    expect(structure.allChildrenAreRows).toBe(true);
    expect(structure.studentRowsCount).toBe(3);
    expect(structure.studentRowCols).toEqual([2, 3, 3]);
    expect(structure.studentCellsTotal).toBe(8);
    expect(structure.studentTexts).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  });

  it("Ligne 1", async () => {
    const cols = await page.evaluate(() =>
      [...document.querySelectorAll(".container > .row:not(.header):nth-of-type(2) > div")].map((element) => ({
        text: element.textContent.trim(),
        classes: [...element.classList]
      }))
    );

    expect(cols).toHaveLength(2);
    expect(cols[0].text).toBe("A");
    expect(cols[0].classes).toEqual(expect.arrayContaining(["col-6", "col-md-3", "col-lg-2"]));
    expect(cols[1].text).toBe("B");
    expect(cols[1].classes).toEqual(expect.arrayContaining(["col-md-9", "col-lg-10"]));
  });

  it("Ligne 2", async () => {
    const cols = await page.evaluate(() =>
      [...document.querySelectorAll(".container > .row:not(.header):nth-of-type(3) > div")].map((element) => ({
        text: element.textContent.trim(),
        classes: [...element.classList]
      }))
    );

    expect(cols).toHaveLength(3);
    expect(cols[0].text).toBe("C");
    expect(cols[0].classes).toEqual(expect.arrayContaining(["col-md-2", "col-lg-3"]));
    expect(cols[1].text).toBe("D");
    expect(cols[1].classes).toEqual(expect.arrayContaining(["col-md-8", "col-lg-6"]));
    expect(cols[2].text).toBe("E");
    expect(cols[2].classes).toEqual(expect.arrayContaining(["col-md-2"]));
  });

  it("Ligne 3", async () => {
    const cols = await page.evaluate(() =>
      [...document.querySelectorAll(".container > .row:not(.header):nth-of-type(4) > div")].map((element) => ({
        text: element.textContent.trim(),
        classes: [...element.classList]
      }))
    );

    expect(cols).toHaveLength(3);
    expect(cols[0].text).toBe("F");
    expect(cols[0].classes).toEqual(expect.arrayContaining(["col-md-5", "col-lg-3"]));
    expect(cols[1].text).toBe("G");
    expect(cols[1].classes).toEqual(expect.arrayContaining(["col-6", "col-lg-4"]));
    expect(cols[2].text).toBe("H");
    expect(cols[2].classes).toEqual(expect.arrayContaining(["col-md-1", "col-lg-5"]));
  });

  it("Ordre des cellules", async () => {
    const texts = await page.evaluate(() =>
      [...document.querySelectorAll(".container > .row:not(.header) > div")].map((element) => element.textContent.trim())
    );
    expect(texts).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  });

});
