# Webflow Seamless Pagination (Crystal Build)

A tiny attribute-driven script that lets the Webflow pagination button behave like “Load more.” It fetches the next CMS page in the background, appends the new items beneath the existing ones, re-runs your Webflow interactions (IX2, Lottie, Dropdown), and scrubs the `_page` query from the URL so the address bar stays clean.

---

## Features
- One-click load-more behaviour using your existing Webflow pagination link.
- Automatically appends new `.w-dyn-item` elements to the same list so previous items stay visible.
- Reinitialises Webflow IX2, Lottie animations, dropdowns, and any queued `Webflow.ready()` functions after every append.
- Adds a loading state to the button to prevent double taps and removes it entirely on the last page.
- Cleans Webflow’s `?xxxx_page=2` style query string out of the URL after each load.

---

## Requirements
- jQuery (3.x recommended)
- Webflow pagination enabled on the Collection List
- A wrapper with the id `cltd-pagination`

---

## Install
Place the scripts near the bottom of your Webflow site (before `</body>`):

```html
<!-- webflow seamless pagination [by Crystal The Developer Inc.] -->
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/webflow-seamless-pagination@v1.0.3/seamless-pagination.js"></script>
<!-- webflow seamless pagination min [by Crystal The Developer Inc.] -->
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/webflow-seamless-pagination@v1.0.3/seamless-pagination.min.js"></script>
```

Ensure your Collection List and pagination markup looks like this (Webflow’s default structure with a custom wrapper):

```html
<div id="cltd-pagination">
  <div class="w-dyn-list">
    <div class="w-dyn-items">
      <!-- CMS items render here -->
    </div>
  </div>

  <!-- Webflow’s pagination button (can keep default text and href) -->
  <a class="w-pagination-next" href="?b9686d70_page=2">Load more</a>
</div>
```

You can optionally add `data-cltd-next` to the button if you want to target it more directly, but the script already listens for `.w-pagination-next`.

---

## Script (v2)

```js
(function ($) {
  $(function () {
    const container = '#cltd-pagination';
    const nextSel = '[data-cltd-next], .w-pagination-next';

    console.log('[cltdPagination] ✅ Initialized using container:', container);

    const $container = $(container);
    const $list = $container.find('.w-dyn-items').first();

    if (!$list.length) {
      console.warn('[cltdPagination] ❌ Missing .w-dyn-items inside container.');
      return;
    }

    $(document).on('click', nextSel, function (e) {
      e.preventDefault();
      const $btn = $(this);
      const href = $btn.attr('href');
      if (!href) return;

      if ($btn.hasClass('is-loading')) return;
      $btn.addClass('is-loading');
      console.log('[cltdPagination] 🔘 Load More clicked:', href);

      fetch(href)
        .then(res => res.text())
        .then(html => {
          const $response = $('<div>').html(html);
          const $newList = $response.find(container).find('.w-dyn-items').first();
          const $newItems = $newList.find('.w-dyn-item');
          const $newNext = $response.find(container).find(nextSel).first();

          console.log(`[cltdPagination] 🧱 Found ${$newItems.length} new items.`);

          if ($newItems.length) {
            $list.append($newItems.clone(true, true));
            console.log(`[cltdPagination] ✅ Appended ${$newItems.length} new CMS items.`);
            reinitWebflow();
          } else {
            console.warn('[cltdPagination] ⚠️ No new CMS items found.');
          }

          if ($newNext.length) {
            $btn.replaceWith($newNext);
          } else {
            $btn.remove();
            console.log('[cltdPagination] 🏁 No next page, removing button.');
          }

          cleanURL();
        })
        .catch(err => console.error('[cltdPagination] ❌ Fetch error:', err))
        .finally(() => $btn.removeClass('is-loading'));
    });

    function reinitWebflow() {
      try {
        if (window.Webflow && typeof Webflow.require === 'function') {
          const ix2 = Webflow.require('ix2');
          if (ix2 && typeof ix2.init === 'function') ix2.init();
          const lottie = Webflow.require('lottie');
          if (lottie && typeof lottie.ready === 'function') lottie.ready();
          const dropdown = Webflow.require('dropdown');
          if (dropdown && typeof dropdown.ready === 'function') dropdown.ready();
        }

        if (window.Webflow && Array.isArray(window.Webflow.ready)) {
          window.Webflow.ready.forEach(fn => typeof fn === 'function' && fn());
        }

        $list.find('.w-dyn-item').css({ opacity: 0 }).animate({ opacity: 1 }, 500);
      } catch (e) {
        console.warn('[cltdPagination] ⚠️ Webflow reinit warning:', e);
      }
    }

    function cleanURL() {
      try {
        const clean = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', clean);
        console.log('[cltdPagination] 🧹 Cleaned URL:', clean);
      } catch (e) {
        console.warn('[cltdPagination] ⚠️ URL cleanup failed:', e);
      }
    }
  });
})(jQuery);
```

---

## Behaviour
| Action | Result |
| ------ | ------ |
| First click | Fetches the next CMS page, appends the items beneath the existing ones, and fades them in. |
| Subsequent clicks | Keeps stacking new items while leaving the earlier batches in place. |
| Final page | Removes the pagination button when no further pages are returned. |
| Interactions | Reinitialises IX2, Lottie, dropdowns, and queued `Webflow.ready()` functions. |
| URL | Cleans the `_page` parameter via `history.replaceState`. |

---

## Styling Tip

```css
.w-pagination-next.is-loading,
[data-cltd-next].is-loading {
  pointer-events: none;
  opacity: 0.5;
}
```

---

## Author
**Crystal The Developer Inc.** — https://www.crystalthedeveloper.ca

---

## License
MIT
