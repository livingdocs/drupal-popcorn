<?php

/**
 * Implements hook_views_data_alter().
 */
function draggableviews_views_data_alter(&$data) {

  $data['draggableviews_structure']['weight'] = array(
    'title' => t('Draggable views weight'),
    'help' => t('Sort entities by the draggableviews weight teble field.'),
    'group' => t('Content'), // The group it appears in on the UI. Could be left out.
    'sort' => array(
      'handler' => 'draggableviews_handler_sort',
    ),
  );

  foreach (entity_get_info() as $entity_type => $info) {
    if (isset($info['base table']) && isset($data[$info['base table']])) {
      $data[$info['base table']]['draggableviews'] = array(
        'title' => t('Draggable views'),
        'help' => t('Provide a draggable functionality.'),
        'real field' => $info['entity keys']['id'],
        'field' => array(
          'handler' => 'draggableviews_handler_field_draggable',
          'click sortable' => FALSE,
        ),
      );

      // Explain to every entity how to join with draggableviews structure table.
      $data['draggableviews_structure']['table']['join'][$info['base table']] = array(
        'handler' => 'draggableviews_join_handler',
        'left_table' => $info['base table'], // Because this is a direct link it could be left out.
        'left_field' => $info['entity keys']['id'],
        'field' => 'entity_id',
      );
    }
  }
}
