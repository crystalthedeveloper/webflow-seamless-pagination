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

    // ---- CLICK HANDLER --------------------------------------------------
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

    // ---- REINIT WEBFLOW INTERACTIONS (IX2 + LOTTIE + DROPDOWNS) ---------
    function reinitWebflow() {
      try {
        if (window.Webflow && typeof Webflow.require === 'function') {
          // Re-init IX2
          const ix2 = Webflow.require('ix2');
          if (ix2 && typeof ix2.init === 'function') ix2.init();
          console.log('[cltdPagination] ♻️ IX2 reinitialized.');

          // Re-init Lottie animations (important for your JSON icons)
          const lottie = Webflow.require('lottie');
          if (lottie && typeof lottie.ready === 'function') lottie.ready();
          console.log('[cltdPagination] 🎞️ Lottie animations reinitialized.');

          // Re-init Webflow dropdown component
          const dropdown = Webflow.require('dropdown');
          if (dropdown && typeof dropdown.ready === 'function') dropdown.ready();
          console.log('[cltdPagination] 🔽 Dropdowns reinitialized.');
        }

        // Force-run any queued Webflow ready() scripts
        if (window.Webflow && Array.isArray(window.Webflow.ready)) {
          window.Webflow.ready.forEach(fn => {
            if (typeof fn === 'function') fn();
          });
        }

        // Optional: fade-in new CMS items
        $list.find('.w-dyn-item').css({opacity: 0}).animate({opacity: 1}, 500);
      } catch (e) {
        console.warn('[cltdPagination] ⚠️ Webflow reinit warning:', e);
      }
    }

    // ---- CLEAN URL ------------------------------------------------------
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
