
# Webflow Seamless Pagination (Robust)

A **production-ready PJAX-based script** that enables **seamless pagination for Webflow CMS** — no reloads, no flicker, and full compatibility with Webflow IX2 interactions.

This version adds dependency checks, safe reinitialization, query cleanup, and graceful fallbacks for older browsers.

---

## 🚀 Features
- ⚡ Instant CMS page transitions without reloading the page  
- 🧭 Keeps Webflow IX2 animations and interactions working  
- 🧩 Cleans up Webflow pagination query (`?xxxxx_page=2`) in URLs  
- 🧱 Safe guards for PJAX and container existence  
- 🎨 Optional fade animation for smoother UX  

---

## 📦 Installation

1. Add the following **before the closing `</body>` tag** in your Webflow project:

```html
<!-- Webflow Seamless Pagination [by Crystal The Developer Inc.] -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.pjax/2.0.1/jquery.pjax.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/webflow-seamless-pagination@v1.0.0/seamless-pagination.js"></script>
```

2. Make sure your CMS Collection List and pagination are wrapped in:

```html
<div id="seamless-replace">
  <!-- Webflow CMS Collection List -->
</div>
```

---

## 💻 Example Script

```js
// Webflow Seamless Pagination (robust)
// Repo: crystalthedeveloper/webflow-seamless-pagination
// Works on published Webflow sites (same-origin).
// Make sure jQuery and jQuery-PJAX load BEFORE this script.

(function ($) {
  // Wait until DOM is ready
  $(function () {
    var container = '#seamless-replace';
    var $container = $(container);

    // Guard: container must exist on the page
    if ($container.length === 0) {
      console.warn('[SeamlessPagination] Missing container:', container);
      return;
    }

    // Guard: PJAX must be loaded
    if (!$.support || !$.support.pjax) {
      console.warn('[SeamlessPagination] jQuery-PJAX not found. Load it before this script.');
      return;
    }

    // Attach PJAX to Webflow pagination links (delegated)
    $(document).pjax('.w-pagination-wrapper a[href]', container, {
      container: container,
      fragment: container,
      scrollTo: false,
      timeout: 4000
    });

    // Optional: simple fade hook
    $(document).on('pjax:send', function () {
      $container.addClass('is-loading');
    });
    $(document).on('pjax:complete', function () {
      $container.removeClass('is-loading');
    });

    // After the fragment is swapped
    $(document).on('pjax:complete', function () {
      // Reinit Webflow IX2 safely
      try {
        if (window.Webflow && typeof Webflow.require === 'function') {
          var ix = Webflow.require('ix2');
          if (ix && typeof ix.init === 'function') ix.init();
        }
      } catch (e) {
        console.warn('[SeamlessPagination] IX2 reinit warning:', e);
      }

      // Remove Webflow pagination query (?xxxxx_page=2) if present
      try {
        var url = new URL(window.location.href);
        var removed = false;
        Array.from(url.searchParams.keys()).forEach(function (key) {
          if (/_page$/.test(key)) {
            url.searchParams.delete(key);
            removed = true;
          }
        });
        if (removed) {
          var newQuery = url.searchParams.toString();
          var newUrl = url.pathname + (newQuery ? '?' + newQuery : '') + window.location.hash;
          window.history.replaceState(null, '', newUrl);
        }
      } catch (e) {
        // Older browsers fallback
        var cleaned = window.location.href.replace(/\?[^#]*?_page=\d+/, '');
        window.history.replaceState(null, '', cleaned);
      }
    });
  });
})(jQuery);
```

---

## 🎨 Optional CSS (for fade effect)

```css
#seamless-replace.is-loading {
  opacity: 0.3;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
#seamless-replace {
  transition: opacity 0.3s ease;
}
```

---

## 🧠 How It Works
PJAX (PushState + AJAX) replaces the CMS list content dynamically in the `#seamless-replace` container when users click pagination links.  
Webflow IX2 interactions are automatically reinitialized after each swap, preserving all animations and states without a full reload.

---

## 🧑‍💻 Author
**Crystal The Developer Inc.**  
🌐 [crystalthedeveloper.ca](https://www.crystalthedeveloper.ca)  
📧 contact@crystalthedeveloper.ca

---

## 📄 License
MIT License — free for personal and commercial use.
