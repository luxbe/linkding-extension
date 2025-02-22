import { getBrowser } from "./browser";
import { search } from "./linkding";
import { getConfiguration, isConfigurationComplete } from "./configuration";

const browser = getBrowser();

browser.omnibox.onInputStarted.addListener(() => {
  const hasCompleteConfiguration = isConfigurationComplete();
  const description = hasCompleteConfiguration
    ? "Search bookmarks in linkding"
    : "⚠️ Please configure the linkding extension first";

  browser.omnibox.setDefaultSuggestion({ description });
});

browser.omnibox.onInputChanged.addListener((text, suggest) => {
  search(text, { limit: 5 })
    .then(results => {
      const bookmarkSuggestions = results.map(bookmark => ({
        content: bookmark.url,
        description: bookmark.title || bookmark.website_title || bookmark.url
      }));
      suggest(bookmarkSuggestions);
    })
    .catch(error => {
      console.error(error);
    });
});

browser.omnibox.onInputEntered.addListener((content, disposition) => {
  if (!content) return;

  const configuration = getConfiguration();
  const isUrl = /^http(s)?:\/\//.test(content);
  const url = isUrl ? content : `${configuration.baseUrl}/bookmarks?q=${encodeURIComponent(content)}`;

  switch (disposition) {
    case "currentTab":
      browser.tabs.update({ url });
      break;
    case "newForegroundTab":
      browser.tabs.create({ url });
      break;
    case "newBackgroundTab":
      browser.tabs.create({ url, active: false });
      break;
  }
});