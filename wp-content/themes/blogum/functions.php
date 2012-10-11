<?php

add_theme_support('automatic-feed-links'); // Add default posts and comments RSS feed links to head

/*** Top navigation ***/

function register_menu() {
    register_nav_menu('Header', __('Header'));
}
add_action( 'init', 'register_menu' );

if ( !is_nav_menu('Header')) {
    $menu_id = wp_create_nav_menu('Header');
    wp_update_nav_menu_item($menu_id, 1);
}

/*** Comment list ***/

function commentlist($comment, $args, $depth) {
    $GLOBALS['comment'] = $comment;
    ?>
    <li id="li-comment-<?php comment_ID() ?>">
        <div class="comment_meta"><?php printf( __('%1$s'), get_comment_author_link()); ?> says: <span><?php printf( __('%1$s'), get_comment_date()); ?><em><?php printf( __('%1$s'), get_comment_time()); ?></em></span></div>
        <div class="comment_text"><?php comment_text() ?></div>
        <div class="clear"></div>
<?php
}

/*** Sidebar ***/

if ( function_exists('register_sidebar') )
    register_sidebar(array(
        'name' => 'Sidebar',
        'before_widget' => '<div id="%1$s" class="%2$s widget">',
        'after_widget' => '</div></div>',
        'before_title' => '<h3>',
        'after_title' => '</h3><div class="widget_body">',
    ));

/*** Misc ***/

function commentdata_fix($commentdata) {
    if ( $commentdata['comment_author_url'] == 'Website') {
        $commentdata['comment_author_url'] = '';
    }
    if ($commentdata['comment_content'] == 'Comment') {
        $commentdata['comment_content'] = '';
    }
    return $commentdata;
}
add_filter('preprocess_comment','commentdata_fix');

function getTinyUrl($url) {
    $tinyurl = file_get_contents("http://tinyurl.com/api-create.php?url=".$url);
    return $tinyurl;
}

function n_posts_link_attributes(){
	return 'class="nextpostslink"';
}
function p_posts_link_attributes(){
	return 'class="previouspostslink"';
}
add_filter('next_posts_link_attributes', 'n_posts_link_attributes');
add_filter('previous_posts_link_attributes', 'p_posts_link_attributes');

function get_comment_date_formatted($commentdate) {
    $commentdate =  explode(' ', $commentdate);
    $commentdate = explode('-', $commentdate[0]);
    echo $commentdate[2].'-'.$commentdate[1].'-'.$commentdate[0];
}

?>