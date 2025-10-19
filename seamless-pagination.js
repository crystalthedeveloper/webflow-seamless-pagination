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
