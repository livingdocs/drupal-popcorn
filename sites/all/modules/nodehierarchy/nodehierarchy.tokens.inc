<?php

/**
 * @file
 * token integration functions for nodehierarchy.module
 */

/**
 * Implements hook_token_info().
 */
function nodehierarchy_token_info() {
  // Node tokens.
  $info['types']['nodehierarchy'] = array(
    'name' => t("Node Hierarchy"),
    'description' => t("Tokens related to a node's hierarchy."),
    'needs-data' => 'node',
  );
  $info['tokens']['node']['nodehierarchy'] = array(
    'name' => t('Node Hierarchy'),
    'description' => t("The source node for this current node's translation set."),
    'type' => 'nodehierarchy',
  );
  $info['tokens']['nodehierarchy']['parent'] = array(
    'name' => t('Parent Node'),
    'description' => t('The primary parent of the node.'),
    'type' => 'node',
  );
  return $info;
}

/**
 * Implements hook_tokens().
 */
function nodehierarchy_tokens($type, $tokens, array $data = array(), array $options = array()) {
  $url_options = array('absolute' => TRUE);
  if (isset($options['language'])) {
    $url_options['language'] = $options['language'];
    $language_code = $options['language']->language;
  }
  else {
    $language_code = NULL;
  }
  $sanitize = !empty($options['sanitize']);

  $replacements = array();
  if ($type == 'node' && !empty($data['node'])) {
    $parent_node = NULL;
    $node = $data['node'];

    // Load the parent node if we're going to need any parent tokens.
    $hierarchy_tokens = token_find_with_prefix($tokens, 'nodehierarchy');
    if ($hierarchy_tokens && !empty($node->nodehierarchy_menu_links[0]['pnid'])) {
      $parent_node = node_load($node->nodehierarchy_menu_links[0]['pnid']);
    }

    foreach ($hierarchy_tokens as $name => $original) {
      // Chained token relationships.
      if ($parent_node && $parent_tokens = token_find_with_prefix($hierarchy_tokens, 'parent')) {
        $replacements += token_generate('node', $parent_tokens, array('node' => $parent_node), $options);
      }
    }
  }

  return $replacements;
}
