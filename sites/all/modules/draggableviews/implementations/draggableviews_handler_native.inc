<?php

/**
 * @file
 * The default implementation of draggableviews handlers.
 */

/*
 * Default Implementation: storage done by draggableviews
 */
class draggableviews_handler_native extends draggableviews_handler {
  function init($field_name, &$view) {
    parent::init($field_name, $view);
    $this->delta = $this->view->field[$field_name]->definition['draggableviews_delta'];
  }

  function save($nid, $value) {
    $args = '';

    if (!empty($this->view->style_plugin->options['draggableviews_arguments']['use_args'])) {
      $args = implode('/', $this->view->args);
    }

    // TODO Please review the conversion of this statement to the D7 database API syntax.
    /* db_query("DELETE FROM {draggableviews_structure} WHERE view_name='%s' AND nid=%d AND delta=%d AND args='%s'", $this->view->name, $nid, $this->delta, $args) */
    db_delete('draggableviews_structure')
  ->condition('view_name', $this->view->name)
  ->condition('nid', $nid)
  ->condition('delta', $this->delta)
  ->condition('args', $args)
  ->execute();
    // TODO Please convert this statement to the D7 database API syntax.
    /* db_query("INSERT INTO {draggableviews_structure}(view_name, nid, delta, value, args) VALUES('%s', %d, %d, %d, '%s')", $this->view->name, $nid, $this->delta, $value, $args) */
    $record = array(
      'view_name' => $this->view->name,
      'nid' => $nid,
      'delta' => $this->delta,
      'value' => $value,
      'args' => $args,
    );
    drupal_write_record('draggableviews_structure', $record);
  }
}
