import { expect, test } from "@playwright/test";

/**
 * Layout and boot contract for Fernweh. The happy-dom suite in `tests/`
 * covers the rules; these checks cover what only a real browser sees: the
 * bundle boots, the clue shop lays out without scrolling sideways, and a
 * guess either reveals the country or lands in the wrong-guess list.
 */

const LAPTOP = { width: 1280, height: 757 };

test("the app boots into a round", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await expect(page).toHaveTitle(/Fernweh/);
  await expect(page.getByRole("heading", { name: /Fernweh/ })).toBeVisible();
  await expect(page.getByText(/Runde 1 \/ 8/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Postkarte/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Land raten" })).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test("a bought clue becomes a paper card and costs points", async ({
  page,
}) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await expect(page.getByText("1000 von 1000 Punkten")).toBeVisible();
  await page.getByRole("button", { name: /Postkarte/ }).click();

  await expect(page.getByText("740 von 1000 Punkten")).toBeVisible();
  await expect(page.locator(".clue-card")).toHaveCount(1);
});

test("a typed guess is judged", async ({ page }) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  await page.getByRole("textbox", { name: "Land raten" }).fill("Deu");
  await page.getByRole("button", { name: "Deutschland", exact: true }).click();

  // Either the answer was Germany (reveal) or it was not (struck-through chip).
  await expect(page.locator(".reveal, .wrong")).toBeVisible();
});

test("the shop fits the laptop viewport without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize(LAPTOP);
  await page.goto("/");

  const doc = await page.evaluate(() => {
    const el = document.scrollingElement;
    return {
      scrollWidth: el?.scrollWidth ?? 0,
      innerWidth: window.innerWidth,
    };
  });
  expect(doc.scrollWidth).toBeLessThanOrEqual(doc.innerWidth);
});
