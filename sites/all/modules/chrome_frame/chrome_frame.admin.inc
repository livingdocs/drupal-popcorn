<?php

/**
 * @file
 * Provides the menu callback for the Chrome Frame administration.
 */

/**
 * Menu callback; Administer Chrome Frame settings.
 */
function chrome_frame_settings() {
  $form = array();
  $form['chrome_frame_prompt'] = array(
    '#title' => t('Prompt Chrome Frame installation'),
    '#description' => t('Should Chrome Frame prompt installation on IE users?'),
    '#type' => 'radios',
    '#options' => array(
      'disabled' => t('Don\'t Prompt'),
      'ie6orless' => t('IE 6 only'),
      'ie7orless' => t('IE 7 or lower'),
      'ie8orless' => t('IE 8 or lower'),
      'all' => t('Prompt for all versions of IE'),
    ),
    '#default_value' => variable_get('chrome_frame_prompt', 0),
  );
  $form['chrome_frame_mode'] = array(
    '#title' => t('Mode'),
    '#type' => 'select',
    '#options' => array(
      'inline' => t('Inline'),
      'overlay' => t('Overlay'),
      'popup' => t('Popup'),
    ),
    '#description' => t('How the user should be prompted when Google Chrome Frame is missing. Overlay will display a modal dialog. Using a Popup will result in creating a new window for the prompt.'),
    '#default_value' => variable_get('chrome_frame_mode', 'inline'),
  );
  return system_settings_form($form);
}
