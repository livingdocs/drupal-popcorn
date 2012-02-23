<?php

/**
 * @file
 * Bartik's theme implementation to display a node.
 *
 * Available variables:
 * - $title: the (sanitized) title of the node.
 * - $content: An array of node items. Use render($content) to print them all,
 *   or print a subset such as render($content['field_example']). Use
 *   hide($content['field_example']) to temporarily suppress the printing of a
 *   given element.
 * - $user_picture: The node author's picture from user-picture.tpl.php.
 * - $date: Formatted creation date. Preprocess functions can reformat it by
 *   calling format_date() with the desired parameters on the $created variable.
 * - $name: Themed username of node author output from theme_username().
 * - $node_url: Direct url of the current node.
 * - $display_submitted: Whether submission information should be displayed.
 * - $submitted: Submission information created from $name and $date during
 *   template_preprocess_node().
 * - $classes: String of classes that can be used to style contextually through
 *   CSS. It can be manipulated through the variable $classes_array from
 *   preprocess functions. The default values can be one or more of the
 *   following:
 *   - node: The current template type, i.e., "theming hook".
 *   - node-[type]: The current node type. For example, if the node is a
 *     "Blog entry" it would result in "node-blog". Note that the machine
 *     name will often be in a short form of the human readable label.
 *   - node-teaser: Nodes in teaser form.
 *   - node-preview: Nodes in preview mode.
 *   The following are controlled through the node publishing options.
 *   - node-promoted: Nodes promoted to the front page.
 *   - node-sticky: Nodes ordered above other non-sticky nodes in teaser
 *     listings.
 *   - node-unpublished: Unpublished nodes visible only to administrators.
 * - $title_prefix (array): An array containing additional output populated by
 *   modules, intended to be displayed in front of the main title tag that
 *   appears in the template.
 * - $title_suffix (array): An array containing additional output populated by
 *   modules, intended to be displayed after the main title tag that appears in
 *   the template.
 *
 * Other variables:
 * - $node: Full node object. Contains data that may not be safe.
 * - $type: Node type, i.e. story, page, blog, etc.
 * - $comment_count: Number of comments attached to the node.
 * - $uid: User ID of the node author.
 * - $created: Time the node was published formatted in Unix timestamp.
 * - $classes_array: Array of html class attribute values. It is flattened
 *   into a string within the variable $classes.
 * - $zebra: Outputs either "even" or "odd". Useful for zebra striping in
 *   teaser listings.
 * - $id: Position of the node. Increments each time it's output.
 *
 * Node status variables:
 * - $view_mode: View mode, e.g. 'full', 'teaser'...
 * - $teaser: Flag for the teaser state (shortcut for $view_mode == 'teaser').
 * - $page: Flag for the full page state.
 * - $promote: Flag for front page promotion state.
 * - $sticky: Flags for sticky post setting.
 * - $status: Flag for published status.
 * - $comment: State of comment settings for the node.
 * - $readmore: Flags true if the teaser content of the node cannot hold the
 *   main body content.
 * - $is_front: Flags true when presented in the front page.
 * - $logged_in: Flags true when the current user is a logged-in member.
 * - $is_admin: Flags true when the current user is an administrator.
 *
 * Field variables: for each field instance attached to the node a corresponding
 * variable is defined, e.g. $node->body becomes $body. When needing to access
 * a field's raw values, developers/themers are strongly encouraged to use these
 * variables. Otherwise they will have to explicitly specify the desired field
 * language, e.g. $node->body['en'], thus overriding any language negotiation
 * rule that was previously applied.
 *
 * @see template_preprocess()
 * @see template_preprocess_node()
 * @see template_process()
 */
hide($content['links']);
hide($content['field_thumbnail']);
if (isset($node->field_thumbnail['und'][0])){
    $thumbnail = theme('image_style', array('style_name' => 'teaser-thumbnail', 'path' => $node->field_thumbnail['und'][0]['uri']));
}
?>
<div id="node-<?php print $node->nid; ?>" class="<?php print $classes; ?> clearfix"  <?php print $attributes; ?>>

	<?php if ($teaser): ?>
		<h2><a href='#' class='popcorn-preview'><?php print $title; ?></a></h2>
	
		<div class='full-teaser'>
		<?php if (isset($thumbnail)) print l("<div class='field-thumbnail'>$thumbnail</div>", "node/" . $node->nid, array('html' => true, 'attributes' => array('class' => array('popcorn-action')))); ?>
			<div class="content clearfix"<?php print $content_attributes; ?>>
	            <?php print render($content); ?>
			</div>    
            <div class="link-wrapper">
              <?php print l(t('Watch video...'), 'node/' . $nid, array('attributes' => array('class' => t('popcorn-action')))); ?>
            </div>
			
		</div>
  
  <?php else: ?>
    
    <div class="content clearfix"<?php print $content_attributes; ?>>
  
	  <div id="video-container">
	    <div id='player-wrapper'>
	    <div id='main-player-wrapper'><video width="720" height="405" id="main-player" preload="auto" poster="/sites/all/themes/loo/images/throbber.gif" autoplay="autoplay"><?php 
	    foreach ($node->field_video_file['und'] as $video){
	      	print "<source src='" . file_create_url($video['uri']) . "' type='{$video['filemime']}' />";
	    } 
	    ?><div class='old-browser'>"This player utilizes many features of HTML5 and CSS3. Unfortunately, your browser does not support this. Please upgrade your browser to the latest version or use an alternate browser.</div></video></div>
	    </div>
	</div>
	    <div id='controls'>
			<div id='player-controls-taper'></div>
	      <div>
    	      <div class='play-button-wrapper'><button id='play-button' type='button' class='paused'></button></div><div id='player-controls'>
        	      <div id='trigger-zone'>
    	      
        	      </div>
        	      
        	      <div id='scrubb'>
            	      <div id='scrubber-length'>
                	      <div id='buffered' class='scrubber-bar'></div>
                	      <div id='played' class='scrubber-bar'></div>
            	      </div>
        	      </div>
        	  </div><div class='volume-button-wrapper'><button id='volume-button' type='button'></button></div><div id='volume-control'>
        	  		<div id='volume-wrapper'>
            	      <div id='volume-length'>
                	      <div id='volume-level'></div>
            	      </div>
            	    </div>
        	  </div><div id='highlight'></div>
	      </div>
	      
	      
      </div>
      
      <div id='shelf'>
        <ul id='shelf-controls'>
          <li><a href='#' id='by-subject' class='current-control'>by subject</a></li>
          <li><a href='#' id='by-type'>by type</a></li>
        </ul>
        <div id='kettle'>
        	<?php 
        	//add subject sections on page load?
        	//how to make them hidden until populated?
        	if (isset($node->field_track_events['und'])){
        	    foreach ($node->field_track_events['und'] as $index => $trackEvent){
        	        $event = field_collection_item_load($trackEvent['value']);
        	        $eventNode = node_load($event->field_event['und'][0]['nid']);
        	        $term = taxonomy_term_load($eventNode->field_subject['und'][0]['tid']);
        	        //print '<div id="' . str_replace(' ', '-', $term->name) . '"></div>';
        	    }
        	}
        	?>
        </div>
      </div>
	  

  
  <?php endif; ?>


</div>

<script src="//maps.google.com/maps?file=api&amp;v=2&amp;key=AIzaSyAVkTFPWaejdP6soprnHjxxG1C8h7SOtJk" type="text/javascript"></script>
