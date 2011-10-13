<?php
/**
 * @file
 *   Implementations of Views 2 Hooks for nodehierarchy_views module
 */

/**
 * Implements hook_views_handlers().
 */
function nodehierarchy_views_handlers() {
  return array(
    'info' => array(
      'path' => drupal_get_path('module', 'nodehierarchy') . '/includes/views',
    ),
    'handlers' => array(
      'views_handler_field_nodehierarchy_actions' => array(
        'parent' => 'views_handler_field',
      ),
      'views_handler_field_nodehierarchy_parent' => array(
        'parent' => 'views_handler_field',
      ),
      'views_handler_argument_nodehierarchy_ancestor' => array(
        'parent' => 'views_handler_argument',
      ),
    ),
  );
}

/**
 * Implements hook_views_data().
 */
function nodehierarchy_views_data() {

  // Basic table information.
  $data['nodehierarchy_menu_links']['table']['group']  = t('Node Hierarchy');
  $data['nodehierarchy_menu_links']['table']['join'] = array(
    'node' => array(
      'left_field' => 'nid',
      'field' => 'nid',
    ),
  );

  // An aliased table to connect {menu_links} to {nodes}
  $data['nh_menu_links']['table']['group'] = t('Node Hierarchy');
  $data['nh_menu_links']['table']['join'] = array(
    'node' => array(
      'table' => 'menu_links',
      'left_table' => 'nodehierarchy_menu_links',
      'left_field' => 'mlid',
      'field' => 'mlid',
    ),
  );

  $data['nh_menu_links']['weight'] = array(
    'title' => t('Child Weight'),
    'help' => t('The sort order of the child node.'),
    'field' => array(
      'handler' => 'views_handler_field_numeric',
      'click sortable' => TRUE,
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );

  // Link back to the node table via plid to get the parent node.
  $data['nh_parent']['table']['group'] = t('Node Hierarchy');
  $data['nh_parent']['table']['join'] = array(
    'node' => array(
      'table' => 'nodehierarchy_menu_links',
      'left_table' => 'nh_menu_links',
      'left_field' => 'plid',
      'field' => 'mlid',
    ),
  );

  // Parent nid.
  $data['nh_parent']['nid'] = array(
    'title' => t('Parent Node ID'),
    'help' => t('The parent id of the node.'),
    // Information for accepting a parent as an argument.
    'argument' => array(
      'field' => 'nid',
      'handler' => 'views_handler_argument_node_nid',
      'click sortable' => TRUE,
    ),
    'relationship' => array(
      'base' => 'node',
      'field' => 'nid',
      'handler' => 'views_handler_relationship',
      'label' => t('Parent Node'),
    ),
  );

  // Bogus fields for aliasing purposes.
  // Link back to the node table via plid to get the parent node.
  $data['nh_ancestor']['table']['group'] = t('Node Hierarchy');
  $data['nh_ancestor']['table']['join'] = array(
    'node' => array(
      'handler' => 'views_handler_join_nodehierarchy_ancestor',
      'arguments' => array(
        'table' => 'nodehierarchy_menu_links',
        'left_table' => 'nh_menu_links',
        'left_field' => 'plid',
        'field' => 'mlid',
      ),
    ),
  );
  $data['nh_ancestor']['nid'] = array(
    'title' => t('Ancestor Node ID'),
    'help' => t('Use this if you want to display any descendant of the given node'),
    // Information for accepting a parent as an argument.
    'argument' => array(
      'field' => 'nid',
      'handler' => 'views_handler_argument_node_nid',
      'click sortable' => TRUE,
    ),
    'relationship' => array(
      'base' => 'node',
      'field' => 'nid',
      'handler' => 'views_handler_relationship',
      'label' => t('Ancestor Node'),
    ),
  );

  return $data;
}

class views_handler_join_nodehierarchy_ancestor extends views_join {
  function build_join($select_query, $table, $view_query) {
    $left =  $view_query->get_table_info($this->left_table);
    $right_table = "{" . $this->table . "}";

    $on = array();
    for ($i = 1; $i < MENU_MAX_DEPTH; $i++) {
      $on[] = "$left[alias].p$i = $table[alias].mlid";
    }
    $select_query->addJoin($this->type, $right_table, $table['alias'], '(' . implode(' OR ', $on) . ") AND $left[alias].mlid != $table[alias].mlid", array());
  }
}


