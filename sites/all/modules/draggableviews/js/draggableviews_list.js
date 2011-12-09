/**
 * @file
 * Adds draggable functionality to the html list display of the view.
 */

(function ($) {
 Drupal.behaviors.draggableViews = {
  attach: function (context, settings) {
    $('.views-form .' + Drupal.settings.draggableviews_row_class + ':not(.draggableviews-processed)', context)
    // Add class for theming.
    .addClass('draggableviews-processed')
    // Add sortable effect.
    .sortable({
      update: function(event, ui) {
        $( ".draggableviews-weight" ).each(function (i, Val) {
          $(this).val(i);
        });
      },
      containment: 'parent',
      cursor: 'move'
    });
  }
 }
})(jQuery);
