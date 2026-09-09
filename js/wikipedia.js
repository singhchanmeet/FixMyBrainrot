import { $, escapeHtml } from './shared.js';
async function nextArticle() {
  const status = $('#article-status');
  status.textContent = 'Loading an article…'; status.className = 'status';
  $('#article').hidden = true;
  try {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|info&inprop=url&exintro=1&explaintext=1&format=json&origin=*';
    const data = await fetch(url).then(response => { if (!response.ok) throw new Error(); return response.json(); });
    const page = Object.values(data.query?.pages || {})[0];
    if (!page) throw new Error();
    $('#article-title').textContent = page.title;
    $('#article-extract').textContent = page.extract || 'This article does not have a short extract.';
    $('#article-link').href = page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
    $('#article').hidden = false; status.textContent = '';
  } catch { status.textContent = 'The article could not be loaded. Please try again.'; status.className = 'status error'; }
}
$('#next-article').addEventListener('click', nextArticle);
nextArticle();


