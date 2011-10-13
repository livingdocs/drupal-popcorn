(function ($) {

/**
 * Move menu items from parent to parent respecting the settings for allowable parents.
 *
 * This behavior is dependent on the tableDrag behavior, since it uses the
 * objects initialized in that behavior to update the row.
 */
Drupal.behaviors.nodehierarchyMenuDrag = {
  attach: function (context, settings) {
    var table = $('table#menu-overview');

    if (!Drupal.tableDrag) return;
  
    Drupal.tableDrag.prototype.onDrag = function() {
    console.log(this.rowObject);
      if ($(this.rowObject.element).hasClass('nodehierarchy-menu-item')) {
        highlightAllowedParents(this.rowObject.element);
      }
    }
    Drupal.tableDrag.prototype.onDrop = function() {
      clearAllowedParentsHighlight();
    }
  }
};

  Drupal.tableDrag.prototype.row.prototype.menuIsValidSwap = Drupal.tableDrag.prototype.row.prototype.isValidSwap;
  Drupal.tableDrag.prototype.row.prototype.isValidSwap = function(row) {
    if ($(this.element).hasClass('nodehierarchy-menu-item')) {
      var prevRow, nextRow;
      if (this.direction == 'down') {
        prevRow = row;
        nextRow = $(row).next('tr').get(0);
      }
      else {
        prevRow = $(row).prev('tr').get(0);
        nextRow = row;
      }
      var prev_parent_row = getParentRow(prevRow);
      var next_parent_row = getParentRow(nextRow);

      var valid_parent = false;
      var depth = 0;
      if (canBeParent(prevRow, this.element)) {
        valid_parent = prevRow;
      }
      if (canBeParent(next_parent_row, this.element)) {
        valid_parent = next_parent_row;
      }
      if (canBeParent(prev_parent_row, this.element)) {
        valid_parent = prev_parent_row;
      }

      // If the given parent was not allowed return null.
      if (!valid_parent) {
        return null;
      }

      // Get the valid indent interval.
      var parent_depth = $('.indentation', valid_parent).length;
      this.interval = {min: parent_depth+1, max: parent_depth+1};
//      this.interval = this.validIndentInterval(prevRow, nextRow);

      // If the next item is indented, check that it can be a child.
      var prevRowDepth = $('.indentation', prevRow).length;
      var nextRowDepth = $('.indentation', nextRow).length;
      if (nextRow && nextRowDepth > this.interval.max && !canBeParent(this.element, nextRow)) {
        return null;
      }

      return true;
    }
    else {
      return this.menuIsValidSwap(row);
    }
  };

  Drupal.tableDrag.prototype.row.prototype.menuIndent = Drupal.tableDrag.prototype.row.prototype.indent;
  Drupal.tableDrag.prototype.row.prototype.indent = function(indentDiff) {
    if ($(this.element).hasClass('nodehierarchy-menu-item')) {
      var indent = $('.indentation', this.element).size();
      indent += indentDiff;

      // Find the parent that this indent represents
      var previousRow = $(this.element).prev('tr');
      while (previousRow.length && $('.indentation', previousRow).length >= indent) {
        previousRow = previousRow.prev('tr');
      }
      // If we found a potential parent.
      if (previousRow.length) {
        if (canBeParent(previousRow[0], this.element)) {
          var parent_depth = $('.indentation', previousRow).length;
          this.interval = {'min':parent_depth + 1, 'max':parent_depth + 1};
        }
      }
      // Otherwise we went all the way to the left of the table without finding
      // a parent, meaning this item has been placed at the root level.
      else {
        nextRow = $(this.group).filter(':last').next('tr').get(0);
        // Dont orphan the next item.
        if (!nextRow || $('.indentation', nextRow).length == 0) {
          this.interval = {'min': 0, 'max':0};
        }
      }

      return this.menuIndent(indentDiff);
    }
    else {
      return this.menuIndent(indentDiff);
    }
  };

  Drupal.tableDrag.prototype.row.prototype.menuValidIndentInterval = Drupal.tableDrag.prototype.row.prototype.validIndentInterval;
  Drupal.tableDrag.prototype.row.prototype.validIndentInterval = function(prevRow, nextRow) {
    if ($(this.element).hasClass('nodehierarchy-menu-item')) {
      var out = this.menuValidIndentInterval(prevRow, nextRow);
      // Check that the previous item can be a parent if it's indented.
      var prev_depth = $('.indentation', prevRow).length;
      if (out.max > prev_depth && !canBeParent(prevRow, this.element)) {
        out.max = prev_depth;
      }
      // Check that the next item can be a child if it's outdented.
      var next_depth = $('.indentation', nextRow).length;
      if (out.min > next_depth && !canBeParent(this, nextRow)) {
        out.min = next_depth;
      }
      return out;
    }
    else {
      return this.menuValidIndentInterval(prevRow, nextRow);
    }
  };

  var getParentFromPosition = function(prevRow, depth) {
    // Find the parent that this indent represents
    while (prevRow.length && $('.indentation', prevRow).length >= depth) {
      prevRow = prevRow.prev('tr');
    }
    // If we found a potential parent.
    if (prevRow.length) {
      if (canBeParent(prevRow[0], this.element)) {
        return prevRow;
      }
    }
    return null;
  };

  var getParentRow = function(row) {
    return $('#mlid-' + $('.menu-plid', row).attr('value'));
  };

  var rowIsType = function(row, type) {
    return $(row).hasClass('node-type-' + type);
  };

  var getAllowedParents = function(row) {
    for (var type in Drupal.settings.nodehierarchyMenuDrag['allowed-parents']) {
      if (rowIsType(row, type)) {
        return Drupal.settings.nodehierarchyMenuDrag['allowed-parents'][type];
      }
    }
    return [];
  };

  var canBeParent = function(parent_row, child) {
    var valid_parent = false;
    var allowed_parents = getAllowedParents(child);
    // Are we allowed to set this as a child of the swap item's parent
    for (var type in allowed_parents) {
      if (rowIsType(parent_row, allowed_parents[type])) {
        valid_parent = true;
      }
    }
    return valid_parent;
  };

  var highlightAllowedParents = function(row) {
    var allowed_parents = getAllowedParents(row);
    for (var type in allowed_parents) {
      $('.node-type-' + allowed_parents[type]).addClass('nodehierarchy-allowed-parent');
    }
    $('#menu-overview').addClass('nodehierarchy-table-dragging');
  };
  var clearAllowedParentsHighlight = function() {
    $('tr').removeClass('nodehierarchy-allowed-parent');
    $('#menu-overview').removeClass('nodehierarchy-table-dragging');
  };


})(jQuery);
