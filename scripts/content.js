(function () {
  'use strict';

  if (!window.location.href.includes('google.com/search')) {
    return;
  }

  console.log('Google search results improved!');
  console.log(
    ['modifyEligibleBase64Images', 'addMenuItem'].map((fn) => fn + '()')
  );

  // Observe the DOM for dynamically loaded content
  const observer = new MutationObserver(() => {
    modifyEligibleBase64Images();
  });

  // Start observing the DOM
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial check in case images are already present
  modifyEligibleBase64Images();
  addMenuItem();
})();

function getMapsUrl() {
  const searchInput = document.querySelector(
    'input[name="q"], textarea[name="q"]'
  );
  const searchQuery = searchInput ? searchInput.value : '';
  return searchQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`
    : '';
}

// Helper function to modify eligible Base64 images
function modifyEligibleBase64Images() {
  const mapsUrl = getMapsUrl();

  const images = Array.from(document.images).filter((img) => {
    return (
      img.src.startsWith('data:image/') && // Base64 image
      img.naturalWidth > 50 && // Width > 50px
      img.naturalHeight > 50 && // Height > 50px
      !img.closest('a[href], [role="button"]') // Not inside an <a href>
    );
  });

  images.forEach((img) => {
    // console.log(images);
    if (!img.dataset.modified) {
      img.dataset.modified = true; // Avoid modifying the same image multiple times

      if (mapsUrl) {
        img.title = mapsUrl; // Set the title attribute to the Maps URL
      }

      // Update: Maps image is now in an `<a>` element without href
      const link = img.closest('a:not([href])');
      if (link) {
        link.title = mapsUrl;
        link.href = mapsUrl;
        link.target = '_blank';
      }

      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        console.log('click');
        if (mapsUrl) {
          window.open(mapsUrl, '_blank');
        } else {
          alert('No search query found!');
        }
      });
    }
  });
}

function addMenuItem() {
  const link = document.querySelector('[role="navigation"] a[href*="/search"');
  const html = `${link.parentNode.innerHTML}`;
  const text = link.innerText;
  const newLink = `<div id="google-maps-link">${html.replace(text, 'Google Maps')}</div>`;
  link.parentNode.parentNode.appendChild(
    document.createElement('div')
  ).outerHTML = newLink;
  document.querySelector('#google-maps-link a').href = getMapsUrl();
}
