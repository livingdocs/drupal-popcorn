<?php
/**
 * Sort handler for ordering by width
 */
class draggableviews_handler_sort extends views_handler_sort {
  function query() {
    $this->ensure_my_table();
    $this->query->add_orderby($this->table_alias, $this->real_field);
  }

  function option_definition() {
    $options = parent::option_definition();

    // This handler invokes few times for one view,
    // in the first time the $this->view->name is empty,
    // so we need this check.
    if (is_object($this->view)) {
      $options['view_name'] = array('default' => $this->view->name);
    }
    else {
      $options['view_name'] = array('default' => NULL);
    }

    return $options;
  }

  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Take list of all views using CTools function.
    $views_list = ctools_export_crud_load_all('views_view');
    $options = array();

    // Convert list of objects to options for the form.
    foreach ($views_list as $view_name => $view_object) {
      $options[$view_name] = $view_name;
    }

    $form['view_name'] = array(
      '#type' => 'select',
      '#title' => t('Display operations as'),
      '#default_value' => $this->options['view_name'],
      '#options' => $options,
    );
  }
}
