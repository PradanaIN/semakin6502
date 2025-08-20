export async function loadGuide(path = '/panduan/guide.md') {
  const res = await fetch(path);
  const text = await res.text();
  const lines = text.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1].trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections;
}
