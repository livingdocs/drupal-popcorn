<?php
/**
 * @file
 * Contains the node from URL argument default plugin.
 */

/**
 * Default argument plugin to extract an ancestor node id of the currently active node.
 */
class views_plugin_argument_default_ancestor extends views_plugin_argument_default {

  function argument_form(&$form, &$form_state) {
    $form['default_argument_ancestor_depth'] = array(
      '#title' => t('Ancestor Depth'),
      '#type' => 'textfield',
      '#default_value' => isset($this->argument->options['default_argument_ancestor_depth']) ? $this->argument->options['default_argument_ancestor_depth'] : -1,
      '#description' => t('Specify a the depth of the ancestor to use. You can specify from the top of the ancestor chain with a positive integer or from the bottom with a negative integer. For example: 1 would be the top level ancester, while -1 would be the current node\'s immediate parent.'),
      '#process' => array('views_process_dependency'),
      '#dependency' => array(
        'radio:options[default_action]' => array('default'),
        'radio:options[default_argument_type]' => array($this->id),
      ),
      '#dependency_count' => 2,
    );
  }

  function get_argument() {
    foreach (range(1, 3) as $i) {
      $node = menu_get_object('node', $i);
      if (!empty($node) && $ancestors = nodehierarchy_get_node_ancestor_nids($node->nid)) {
        $idx = $this->argument->options['default_argument_ancestor_depth'];
        if ($idx < 0) {
          $idx = count($ancestors) + $idx - 1;
        }
        return $ancestors[$idx];
      }
    }
    return NULL;
  }
}

