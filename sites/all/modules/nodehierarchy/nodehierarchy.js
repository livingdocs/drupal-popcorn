(function ($) {
  $(document).ready(function() {
    $('.nodehierarchy-menu-link').each(function() {
      var self = this;

      $('.nodehierarchy-parent-delete', self).each(function() {
        if ($(this).attr('checked')) {
          // Set display none instead of using hide(), because hide() doesn't work when parent is hidden.
          $('.form-item', self).not($(this).parents()).css('display', 'none');
        }
      });
      $('.nodehierarchy-parent-delete', self).bind('click', function () {
        if ($(this).attr('checked')) {
          $('.form-item', self).not($(this).parents()).slideUp('fast');
        }
        else {
          $('.form-item', self).not($(this).parents()).slideDown('fast');
        }
      });

      if (!$('.nodehierarchy-menu-enable', self).attr('checked')) {
        // Set display none instead of using hide(), because hide() doesn't work when parent is hidden.
        $('.nodehierarchy-menu-settings', self).css('display', 'none');
      }
      $('.nodehierarchy-menu-enable', self).bind('click', function() {
        if ($(this).attr('checked')) {
          $('.nodehierarchy-menu-settings', self).slideDown('fast');
        }
        else {
          $('.nodehierarchy-menu-settings', self).slideUp('fast');
        }
      });

      if (!$('.nodehierarchy-menu-customize', self).attr('checked')) {
        // Set display none instead of using hide(), because hide() doesn't work when parent is hidden.
        $('.nodehierarchy-menu-title', self).css('display', 'none');
      }
      $('.nodehierarchy-menu-customize', self).bind('click', function() {
        if ($(this).attr('checked')) {
          $('.nodehierarchy-menu-title', self).slideDown('fast');
        }
        else {
          $('.nodehierarchy-menu-title', self).slideUp('fast');
        }
      });

      if ($('.nodehierarchy-parent-selector', self).length && $('.nodehierarchy-parent-selector', self).attr("selectedIndex") != 0) {
        // Set display none instead of using hide(), because hide() doesn't work when parent is hidden.
        $('.nodehierarchy-menu-name', self).css('display', 'none');
      }
      $('.nodehierarchy-parent-selector', self).change(function() {
        if ($(this).attr("selectedIndex") == 0) {
          $('.nodehierarchy-menu-name', self).slideDown('fast');
        }
        else {
          $('.nodehierarchy-menu-name', self).slideUp('fast');
        }
      });
    });
  });
})(jQuery);

