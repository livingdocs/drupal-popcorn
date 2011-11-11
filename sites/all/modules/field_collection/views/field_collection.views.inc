<?php

/**
 * Implements hook_field_views_data().
 *
 * Views integration for field-collection fields. Adds a relationship to the
 * default field data.
 *
 * @see field_views_field_default_views_data()
 */
function field_collection_field_views_data($field) {
  $data = field_views_field_default_views_data($field);

  foreach ($data as $table_name => $table_data) {
    foreach ($table_data as $field_name => $field_data) {
      // Only operate on the "field_api_field_name"_value column.
      if (strrpos($field_name, '_value') === (strlen($field_name) - strlen('_value'))) {
        $data[$table_name][$field_name]['relationship'] = array(
          'handler' => 'views_handler_relationship',
          'base' => 'field_collection_item',
          'base field' => 'item_id',
          'label' => t('field-collection item from !field_name', array('!field_name' => $field['field_name'])),
        );
      }
    }
  }
  return $data;
}
