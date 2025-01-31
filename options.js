document.addEventListener('DOMContentLoaded', async () => {
  const bookmarkList = document.getElementById('bookmarkList');
  
  const allBookmarks = await browser.bookmarks.getTree();
  displayBookmarkTree(allBookmarks[0], bookmarkList);
  
  function displayBookmarkTree(bookmarkItem, container) {
    if (bookmarkItem.url) {
      const bookmarkDiv = document.createElement('div');
      bookmarkDiv.className = 'bookmark-item';
      bookmarkDiv.innerHTML = `
        <div class="copyable" data-value="${bookmarkItem.title}">Title: ${bookmarkItem.title}</div>
        <div class="copyable" data-value="${bookmarkItem.url}">URL: ${bookmarkItem.url}</div>
        <div class="copyable" data-value="${bookmarkItem.id}">ID: ${bookmarkItem.id}</div>
      `;
      
      bookmarkDiv.querySelectorAll('.copyable').forEach(element => {
        element.addEventListener('click', async () => {
          const textToCopy = element.dataset.value;
          await navigator.clipboard.writeText(textToCopy);
          
          const originalText = element.textContent;
          element.textContent = 'Copied!';
          setTimeout(() => {
            element.textContent = originalText;
          }, 1000);
        });
      });
      
      container.appendChild(bookmarkDiv);
    }
    
    if (bookmarkItem.children) {
      bookmarkItem.children.forEach(child => {
        displayBookmarkTree(child, container);
      });
    }
  }
}); 