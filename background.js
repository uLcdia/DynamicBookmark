let managedBookmarks;
(async function init() {
  managedBookmarks = await loadConfig('managed_bookmarks.json');
  console.debug('managedBookmarks:', managedBookmarks);
})();

browser.webNavigation.onCompleted.addListener(main);

async function main(details) {
  // Only process main frame navigation
  if (details.frameId !== 0) return;

  const currentUrl = new URL(details.url);
  console.debug('Processing URL:', currentUrl);

  for (const [bookmarkId, urlRegex] of Object.entries(managedBookmarks)) {
    console.debug('Processing Bookmark:', bookmarkId);

    if (!matchRegex(urlRegex, currentUrl)) {
      continue;
    }

    await updateBookmark(bookmarkId, currentUrl);

    console.debug('Finished processing Bookmark:', bookmarkId);
  }
  console.debug('Finished processing URL:', currentUrl);
}

function matchRegex(urlRegex, currentUrl) {
  let regex;
  try {
    regex = new RegExp(urlRegex);
  } catch (error) {
    console.error('Invalid regex pattern:', urlRegex, error);
    return false;
  }

  console.debug('Regex:', regex);

  if (regex.test(currentUrl)) {
    console.log('URL matches regex');
    return true;
  }
  console.log('URL does not match regex');
  return false;
}

async function updateBookmark(bookmarkId, currentUrl) {
  const bookmarks = await browser.bookmarks.get(bookmarkId);
  const bookmarkUrl = new URL(bookmarks[0].url);
  console.debug('Bookmark URL:', bookmarkUrl);

  await browser.bookmarks.update(bookmarkId, { url: currentUrl.href })
    .then(() => {
      console.log(`Updated bookmark ${bookmarkId} URL to ${currentUrl.href}`);
    });
}

async function loadConfig(configPath) {
  try {
    const response = await fetch(configPath);
    const data = await response.json();
    console.debug('Loaded config from', configPath);
    return data;
  } catch (error) {
    console.error('Error loading config:', error);
    return {};
  }
}
