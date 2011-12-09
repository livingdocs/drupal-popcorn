<?php

/**
* @file
* Views field handler. Contains all relevant VBO options and related logic.
* Implements the Views Form API.
*/

class draggableviews_handler_field_draggable extends views_handler_field {

  function option_definition() {
    $options = parent::option_definition();

    $options['draggableviews'] = array(
      'contains' => array(
        'save_button_label' => array('default' => 'Save'),
      ),
    );

    return $options;
  }

  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // Remove not needed settings options.
    $form['alter']['#access'] = FALSE;
    $form['style_settings']['#access'] = FALSE;
    $form['empty_field_behavior']['#access'] = FALSE;

    $form['draggableviews'] = array(
      '#type' => 'fieldset',
      '#title' => t('Draggable Views'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
    );

    $form['draggableviews']['save_button_label'] = array(
      '#type' => 'textfield',
      '#title' => t('Custom Save button label'),
      '#description' => t("Allow to change Save button Label."),
      '#default_value' => $this->options['draggableviews']['save_button_label'],
    );
  }

  function render($values) {
    return '<!--form-item-' . $this->options['id'] . '--' . $this->view->row_index . '-->';
  }

  /**
   * The form which replaces the placeholder from render().
   */
  function views_form(&$form, &$form_state) {
    // The view is empty, abort.
    if (empty($this->view->result)) {
      return;
    }

    // Pass view object to submit handler.
    $form['view'] = array(
      '#type' => 'value',
      '#value' => $this->view,
    );

    $form[$this->options['id']] = array(
      '#tree' => TRUE,
    );
    $range = count($this->view->result);
    // At this point, the query has already been run, so we can access the results
    // in order to get the base key value (for example, nid for nodes).
    foreach ($this->view->result as $row_index => $row) {
      $entity_id = $this->get_value($row);

      $form[$this->options['id']][$row_index] = array(
        '#tree' => TRUE,
      );
      // Weight field selectbox.
      $form[$this->options['id']][$row_index]['weight'] = array(
        '#type' => 'select',
        '#options' => range(-$range, $range),
        '#attributes' => array('class' => array('draggableviews-weight')),
        '#default_value' => (isset($row->draggableviews_structure_weight)) ?
          $row->draggableviews_structure_weight : 0,
      );
      // Item to keep id of the entity.
      $form[$this->options['id']][$row_index]['id'] = array(
        '#type' => 'value',
        '#value' => $this->view->result[$row_index]->{$this->view->base_field},
      );
    }
  }

}