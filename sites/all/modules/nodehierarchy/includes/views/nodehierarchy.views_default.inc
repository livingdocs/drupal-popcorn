<?php
/**
 * @file
 *   Provide default views for nodehierarchy_views
 */

/**
 * Implements hook_views_default_views().
 */
function nodehierarchy_views_default_views() {
  $view = new view;
  $view->name = 'nodehierarchy_children_teasers';
  $view->description = 'Display a node\'s children as teasers';
  $view->tag = '';
  $view->view_php = '';
  $view->base_table = 'node';
  $view->is_cacheable = '0';
  $view->api_version = 2;
  $view->disabled = FALSE; // Edit this to TRUE to make a default view disabled initially
  $handler = $view->new_display('default', 'Defaults', 'default');
  $handler->override_option('sorts', array(
    'weight' => array(
      'id' => 'weight',
      'table' => 'nh_menu_links',
      'field' => 'weight',
      'order' => 'ASC',
    ),
  ));
  $handler->override_option('arguments', array(
    'parent' => array(
      'id' => 'parent',
      'table' => 'nh_parent',
      'field' => 'nid',
      'default_action' => 'not found',
      'style_plugin' => 'default_summary',
      'style_options' => array(),
      'wildcard' => 'all',
      'wildcard_substitution' => 'All',
      'title' => '',
    ),
  ));
  $handler->override_option('filters', array(
    'status' => array(
      'id' => 'status',
      'table' => 'node',
      'field' => 'status',
      'operator' => '=',
      'value' => 1,
      'group' => 0,
      'exposed' => FALSE,
      'expose' => array(
        'operator' => FALSE,
        'label' => '',
      ),
      'expose_button' => array(
        'button' => 'Expose',
      ),
    ),
  ));
  $handler->override_option('access', array(
    'type' => 'none',
  ));
  $handler->override_option('use_pager', '1');
  $handler->override_option('row_plugin', 'node');
  $handler->override_option('row_options', array(
    'teaser' => 1,
  ));
  $views[$view->name] = $view;

  // duplicate the view
  $view = unserialize(serialize($view));
  $view->display['default']->display_options['style_plugin'] = 'list';
  $view->display['default']->display_options['style_options'] = array('type' => 'ul');
  $view->display['default']->display_options['row_plugin'] = 'fields';
  $view->display['default']->display_options['fields'] =
      array(
    'title' => array(
      'id' => 'title',
      'table' => 'node',
      'field' => 'title',
      'label' => 'Title',
      'link_to_node' => 1,
    ),
  );
  $view->name = 'nodehierarchy_children_list';
  $view->description = t('Display a node\'s children as a list');
  $views[$view->name] = $view;


  return $views;
}
