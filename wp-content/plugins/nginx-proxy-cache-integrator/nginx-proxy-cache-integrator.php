<?php
/**
 * @package Wordpress Nginx Integration
 * @author Dan Collis-Puro
 * @version 0.1
 */
/*
Plugin Name: Wordpress Nginx proxy cache integrator
Plugin URI: http://www.collispuro.com
Description: This integrates your blog with nginx as a frontend proxy cache. DO NOT DISABLE THIS PLUGIN UNLESS YOU KNOW WHAT YOU'RE DOING.
Author: Dan Collis-Puro
Version: 0.1
Author URI: http://collispuro.com
*/

function add_xaccel_header() {
	# Set the X-Accel-Expires header to never cache the page if it looks like the page needs to be tailored for a user.
	$user_cookie_there = false;
	foreach($_COOKIE as $key => $value){
		if( preg_match('/wordpress_(?!test_cookie)|comment_author|wp-postpass/', $key) ){
			$user_cookie_there = true;
		}
	}
	if($user_cookie_there){
		header("X-Accel-Expires: 0");
	}
}

add_action('init','add_xaccel_header');

?>
