/**
 * Downloads an image attached to a GitHub README (github.com/user-attachments/assets/<id>).
 *
 * The attachment URL works from a normal machine. Some sandboxes block that path, so the
 * fallback asks the GitHub API for the rendered README, which carries a short lived signed
 * link to the same file. Set GITHUB_TOKEN if the repository is private.
 */
export async function readmeAttachment(download, repo, assetId) {
  try {
    return await download(`https://github.com/user-attachments/assets/${assetId}`);
  } catch {
    const headers = { accept: 'application/vnd.github.html' };
    if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const html = (await download(`https://api.github.com/repos/${repo}/readme`, headers)).toString('utf8');
    const signed = [...html.matchAll(/src="([^"]+)"/g)]
      .map((match) => match[1].replace(/&amp;/g, '&'))
      .find((src) => src.includes(assetId));
    if (!signed) throw new Error(`Attachment ${assetId} is not in the ${repo} README`);
    return download(signed);
  }
}
