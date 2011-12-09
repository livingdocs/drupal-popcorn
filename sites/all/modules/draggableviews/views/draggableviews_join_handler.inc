<?php
/**
 * Join handler for extra join conditions.
 */
class draggableviews_join_handler extends views_join {
  /**
   * Build the SQL for the join this object represents.
   *
   * @param $select_query
   *   An implementation of SelectQueryInterface.
   * @param $table
   *   The base table to join.
   * @param $view_query
   *   The source query, implementation of views_plugin_query.
   * @return
   *
   */
  function build_join($select_query, $table, $view_query) {
    if (empty($this->definition['table formula'])) {
      $right_table = $this->table;
    }
    else {
      $right_table = $this->definition['table formula'];
    }

    if ($this->left_table) {
      $left = $view_query->get_table_info($this->left_table);
      $left_field = "$left[alias].$this->left_field";
    }
    else {
      // This can be used if left_field is a formula or something. It should be used only *very* rarely.
      $left_field = $this->left_field;
    }

    $condition = "$left_field = $table[alias].$this->field";
    $condition .= " AND $table[alias].view_name = :view_name";
    //$condition .= " AND $table[alias].view_display = :view_display";

    $arguments[':view_name'] = $view_query->view->sort['weight']->options['view_name'];
    //$arguments[':view_display'] = $view_query->view->current_display;

    $select_query->addJoin($this->type, $right_table, $table['alias'], $condition, $arguments);
//    dsm($select_query->__toString(), 'raw query');
  }
}