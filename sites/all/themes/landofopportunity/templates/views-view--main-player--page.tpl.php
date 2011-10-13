<?php
/**
 * @file views-view.tpl.php
 * Main view template
 *
 * Variables available:
 * - $classes_array: An array of classes determined in
 *   template_preprocess_views_view(). Default classes are:
 *     .view
 *     .view-[css_name]
 *     .view-id-[view_name]
 *     .view-display-id-[display_name]
 *     .view-dom-id-[dom_id]
 * - $classes: A string version of $classes_array for use in the class attribute
 * - $css_name: A css-safe version of the view name.
 * - $css_class: The user-specified classes names, if any
 * - $header: The view header
 * - $footer: The view footer
 * - $rows: The results of the view query, if any
 * - $empty: The empty text to display if the view is empty
 * - $pager: The pager next/prev links to display, if any
 * - $exposed: Exposed widget form/info to display
 * - $feed_icon: Feed icon to display, if any
 * - $more: A link to view more, if any
 *
 * @ingroup views_templates
 */
?>
<div class="<?php print $classes; ?>">
  
  <div class="video-js-box vim-css">
    <video width="720" height="486" class="video-js" preload="true">
    <?php
      
      drupal_add_js('sites/all/libraries/video-js/video.js');
      drupal_add_css('sites/all/libraries/video-js/video-js.css');
      drupal_add_css('sites/all/libraries/video-js/skins/vim.css');
      
      foreach ($view->result as $rowid => $row) {
        
        foreach ($row->field_field_video_file as $vidid => $video) {
          
          $pathinfo = pathinfo($video['raw']['filename']);
          
          switch ($pathinfo['extension']) {
            case 'mp4':
                $video['raw']['typestring'] = "{$video['raw']['filemime']}; codecs=\"avc1.42E01E, mp4a.40.2\"";
              break;
            case 'ogv':
                $video['raw']['typestring'] = "{$video['raw']['filemime']}; codecs=\"theora, vorbis\"";
              break;
            case 'webm':
                $video['raw']['typestring'] = "{$video['raw']['filemime']}; codecs=\"vp8, vorbis\"";
              break;
            default:
              continue;
          }
          
          echo '    <source src="' . file_create_url($video['raw']['uri']) . "\" type='{$video['raw']['typestring']}'>";
          
        }
        
      }
      
    ?>
    </video>
  </div>
  
  <script>
    VideoJS.setupAllWhenReady();
  </script>

</div> <?php /* class view */ ?>