// Webflow Seamless Pagination (enhanced with full reinitialization)
// Repo: crystalthedeveloper/webflow-seamless-pagination
// Works on published Webflow sites (same-origin).
// Make sure jQuery and jQuery-PJAX load BEFORE this script.

(function ($) {
  $(function () {
    var container = '#seamless-replace';
    var $container = $(container);

    // ✅ Guard: container must exist
    if ($container.length === 0) {
      console.warn('[SeamlessPagination] Missing container:', container);
      return;
    }

    // ✅ Guard: PJAX must be loaded
    if (!$.support || !$.support.pjax) {
      console.warn('[SeamlessPagination] jQuery-PJAX not found. Load it before this script.');
      return;
    }

    // ✅ Attach PJAX to Webflow pagination links (delegated)
    $(document).pjax('.w-pagination-wrapper a[href]', container, {
      container: container,
      fragment: container,
      scrollTo: false,
      timeout: 4000
    });

    // ✅ Optional: loading class hooks
    $(document).on('pjax:send', function () {
      $container.addClass('is-loading');
    });
    $(document).on('pjax:complete', function () {
      $container.removeClass('is-loading');
    });

    // ✅ Reinitialization after PJAX content swap
    $(document).on('pjax:complete', function () {
      // --- 1️⃣ Reinit Webflow IX2 animations ---
      try {
        if (window.Webflow && typeof Webflow.require === 'function') {
          var ix = Webflow.require('ix2');
          if (ix && typeof ix.init === 'function') ix.init();
        }
      } catch (e) {
        console.warn('[SeamlessPagination] IX2 reinit warning:', e);
      }

      // --- 2️⃣ Reinit Webflow components (dropdowns, sliders, tabs, etc.) ---
      try {
        if (window.Webflow && typeof window.Webflow.ready === 'function') {
          window.Webflow.ready();
        }
        // Run all queued ready functions if available
        if (window.Webflow && Array.isArray(window.Webflow.ready)) {
          window.Webflow.ready.forEach(function (fn) {
            if (typeof fn === 'function') fn();
          });
        }
        // Rebind dropdowns specifically (Webflow component)
        if (window.Webflow && typeof window.Webflow.require === 'function') {
          var dropdown = Webflow.require('dropdown');
          if (dropdown && typeof dropdown.ready === 'function') dropdown.ready();
        }
      } catch (e) {
        console.warn('[SeamlessPagination] Webflow component reinit warning:', e);
      }

      // --- 3️⃣ (Optional) Rebind custom FAQ toggles or scripts ---
      // Example: Replace with your FAQ toggle logic if needed
      if (typeof initFAQDropdowns === 'function') {
        try {
          initFAQDropdowns();
        } catch (e) {
          console.warn('[SeamlessPagination] FAQ reinit skipped:', e);
        }
      }

      // --- 4️⃣ Clean up URL query (?xxxxx_page=2) ---
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
        // Older browser fallback
        var cleaned = window.location.href.replace(/\?[^#]*?_page=\d+/, '');
        window.history.replaceState(null, '', cleaned);
      }
    });
  });
})(jQuery);
