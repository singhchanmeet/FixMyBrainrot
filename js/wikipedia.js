import { $ } from './shared.js';

const MIN_PREVIEW_WORDS = 80;
const MAX_PREVIEW_WORDS = 280;
const MAX_REQUESTS = 3;

function wordCount(text) { return text.trim().split(/\s+/).filter(Boolean).length; }
function isLowValuePage(page) { return /\b(disambiguation|list of|index of)\b/i.test(page.title || ''); }
function isSuitableArticle(page) { return Boolean(page?.title && page?.extract && !isLowValuePage(page) && wordCount(page.extract) >= MIN_PREVIEW_WORDS); }
function previewText(text) { const words = text.trim().split(/\s+/); return words.length > MAX_PREVIEW_WORDS ? `${words.slice(0, MAX_PREVIEW_WORDS).join(' ')}…` : text.trim(); }
async function fetchCandidates() {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=10&prop=extracts|info&inprop=url&exintro=1&explaintext=1&format=json&origin=*';
  const data = await fetch(url).then(response => { if (!response.ok) throw new Error(); return response.json(); });
  return Object.values(data.query?.pages || {});
}
async function findArticle() {
  let fallback = null;
  for (let attempt = 0; attempt < MAX_REQUESTS; attempt++) {
    const candidates = await fetchCandidates();
    const usable = candidates.filter(page => !isLowValuePage(page) && page.extract);
    fallback = usable.sort((a, b) => wordCount(b.extract) - wordCount(a.extract))[0] || fallback;
    const article = candidates.find(isSuitableArticle);
    if (article) return article;
  }
  if (fallback && wordCount(fallback.extract) >= 40) return fallback;
  throw new Error('No suitable article found.');
}
async function nextArticle() {
  const status = $('#article-status');
  status.textContent = 'Loading an article…'; status.className = 'status';
  $('#article').hidden = true;
  try {
    const page = await findArticle();
    $('#article-title').textContent = page.title;
    $('#article-extract').textContent = previewText(page.extract);
    $('#article-link').href = page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}`;
    $('#article').hidden = false; status.textContent = '';
  } catch { status.textContent = 'A suitable article could not be loaded. Please try again.'; status.className = 'status error'; }
}
$('#next-article').addEventListener('click', nextArticle);
nextArticle();
