# Webflow Seamless Pagination (Robust)

A **production-ready PJAX-based script** that enables **seamless pagination for Webflow CMS** — no reloads, no flicker, and full compatibility with Webflow IX2 interactions and dropdowns.

This version adds dependency checks, safe reinitialization, query cleanup, and graceful fallbacks for older browsers.

---

## 🚀 Features
- ⚡ Instant CMS page transitions without reloading the page  
- 🧭 Keeps **Webflow IX2 animations**, **dropdowns**, **tabs**, and **sliders** working after pagination  
- 🧩 Cleans up Webflow pagination query (`?xxxxx_page=2`) in URLs  
- 🧱 Safe guards for PJAX and container existence  
- 🎨 Optional fade animation for smoother UX  
- 🔁 Reinitializes custom scripts (like FAQ toggles) after “Load more”  

---

## 📦 Installation

1. Add the following **before the closing `</body>` tag** in your Webflow project:

```html
<!-- Webflow Seamless Pagination [by Crystal The Developer Inc.] -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.pjax/2.0.1/jquery.pjax.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/crystalthedeveloper/webflow-seamless-pagination@v1.0.1/seamless-pagination.js"></script>
```

2. Make sure your CMS Collection List and pagination are wrapped in:

```html
<div id="seamless-replace">
  <!-- Webflow CMS Collection List -->
</div>
```

---

## 💻 Example Script (v1.1.0)

```js
// Webflow Seamless Pagination (enhanced with full reinitialization)
// Repo: crystalthedeveloper/webflow-seamless-pagination
// Works on published Webflow sites (same-origin).
// Make sure jQuery and jQuery-PJAX load BEFORE this script.

(function ($) {
  $(function () {
    var container = '#seamless-replace';
    var $container = $(container);

    if ($container.length === 0) {
      console.warn('[SeamlessPagination] Missing container:', container);
      return;
    }

    if (!$.support || !$.support.pjax) {
      console.warn('[SeamlessPagination] jQuery-PJAX not found. Load it before this script.');
      return;
    }

    $(document).pjax('.w-pagination-wrapper a[href]', container, {
      container: container,
      fragment: container,
      scrollTo: false,
      timeout: 4000
    });

    $(document).on('pjax:send', function () {
      $container.addClass('is-loading');
    });
    $(document).on('pjax:complete', function () {
      $container.removeClass('is-loading');
    });

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

      // Reinit Webflow components
      try {
        if (window.Webflow && typeof window.Webflow.ready === 'function') {
          window.Webflow.ready();
        }
        if (window.Webflow && Array.isArray(window.Webflow.ready)) {
          window.Webflow.ready.forEach(function (fn) {
            if (typeof fn === 'function') fn();
          });
        }
        if (window.Webflow && typeof window.Webflow.require === 'function') {
          var dropdown = Webflow.require('dropdown');
          if (dropdown && typeof dropdown.ready === 'function') dropdown.ready();
        }
      } catch (e) {
        console.warn('[SeamlessPagination] Webflow component reinit warning:', e);
      }

      // Optional: custom reinit for FAQs or accordions
      if (typeof initFAQDropdowns === 'function') {
        try {
          initFAQDropdowns();
        } catch (e) {
          console.warn('[SeamlessPagination] FAQ reinit skipped:', e);
        }
      }

      // Clean up Webflow pagination query (?xxxxx_page=2)
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
After each load, Webflow’s built-in components and any custom scripts are reinitialized automatically — ensuring **dropdowns, sliders, tabs, and animations** continue working seamlessly without a page reload.

---

## 🧾 Changelog
**v1.1.0** — Added full Webflow component reinitialization (dropdowns, sliders, tabs, custom scripts).  
Fixes FAQ dropdown issue after PJAX load.

---

## 🧑‍💻 Author
**Crystal The Developer Inc.**  
🌐 [crystalthedeveloper.ca](https://www.crystalthedeveloper.ca)  
📧 contact@crystalthedeveloper.ca  

---

## 📄 License
MIT License — free for personal and commercial use.
