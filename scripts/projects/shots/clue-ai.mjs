/**
 * Clue.ai: the assistant with a student's buggy Python and question filled in, ready for guidance.
 * The project is discontinued and its model key has no credit left, so no answer is shown.
 * Source: https://clue-ai.vercel.app
 */
const CODE = `def average(scores):
    """Return the mean of a list of test scores."""
    total = 0
    for i in range(1, len(scores)):
        total += scores[i]
    return total / len(scores)


def letter_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score > 70:
        return "C"
    return "F"


scores = [92, 85, 71, 64, 99]
print(average(scores), letter_grade(average(scores)))`;

const QUESTION = 'My average is always too low and a 70 gets an F. I do not want the answer, just a hint.';

export async function capture({ openPage }) {
  const page = await openPage({ width: 1280, height: 800, scale: 2 });
  await page.goto('https://clue-ai.vercel.app', { waitUntil: 'networkidle', timeout: 90_000 });
  // Until React hydrates, the page falls back to the system colour scheme. Wait for its own theme.
  await page.waitForFunction(() => document.documentElement.classList.contains('theme-dark'));
  await page.locator('textarea').first().fill(CODE);
  await page.getByPlaceholder(/Describe/i).first().fill(QUESTION);
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  return { png: await page.screenshot() };
}
