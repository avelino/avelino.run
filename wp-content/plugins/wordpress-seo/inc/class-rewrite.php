<?php
/**
 * @package Frontend
 */

/**
 * This code handles the category rewrites.
 */
class WPSEO_Rewrite {

	/**
	 * Class constructor
	 */
	function __construct() {
		add_filter( 'query_vars', array( $this, 'query_vars' ) );
		add_filter( 'category_link', array( $this, 'no_category_base' ), 1000, 2 );
		add_filter( 'request', array( $this, 'no_category_base_request' ) );
		add_filter( 'category_rewrite_rules', array( $this, 'category_rewrite_rules' ) );
	}

	/**
	 * Override the category link to remove the category base.
	 *
	 * @param string $catlink     Unused, overridden by the function.
	 * @param int    $category_id ID of the category.
	 * @return string
	 */
	function no_category_base( $catlink, $category_id ) {
		$category = &get_category( $category_id );
		if ( is_wp_error( $category ) )
			return $category;
		$category_nicename = $category->slug;

		if ( $category->parent == $category_id ) // recursive recursion
			$category->parent = 0;
		elseif ( $category->parent != 0 )
			$category_nicename = get_category_parents( $category->parent, false, '/', true ) . $category_nicename;

		$blog_prefix = '';
		if ( function_exists( 'is_multisite' ) && is_multisite() && !is_subdomain_install() && is_main_site() )
			$blog_prefix = 'blog/';

		$catlink = trailingslashit( get_option( 'home' ) ) . $blog_prefix . user_trailingslashit( $category_nicename, 'category' );
		return $catlink;
	}

	/**
	 * Update the query vars with the redirect var when stripcategorybase is active
	 *
	 * @param $query_vars
	 * @return array
	 */
	function query_vars( $query_vars ) {
		$options = get_wpseo_options();

		if ( isset( $options['stripcategorybase'] ) && $options['stripcategorybase'] ) {
			$query_vars[] = 'wpseo_category_redirect';
		}

		return $query_vars;
	}

	/**
	 * Redirect the "old" category URL to the new one.
	 *
	 * @param array $query_vars Query vars to check for existence of redirect var
	 * @return array
	 */
	function no_category_base_request( $query_vars ) {
		if ( isset( $query_vars['wpseo_category_redirect'] ) ) {
			$catlink = trailingslashit( get_option( 'home' ) ) . user_trailingslashit( $query_vars['wpseo_category_redirect'], 'category' );
			wp_redirect( $catlink, 301 );
			exit;
		}
		return $query_vars;
	}

	/**
	 * This function taken and only slightly adapted from WP No Category Base plugin by Saurabh Gupta
	 *
	 * @return array
	 */
	function category_rewrite_rules() {
		global $wp_rewrite;

		$category_rewrite = array();
		$categories       = get_categories( array( 'hide_empty'=> false ) );

		$blog_prefix = '';
		if ( function_exists( 'is_multisite' ) && is_multisite() && !is_subdomain_install() && is_main_site() )
			$blog_prefix = 'blog/';

		foreach ( $categories as $category ) {
			$category_nicename = $category->slug;
			if ( $category->parent == $category->cat_ID ) // recursive recursion
				$category->parent = 0;
			elseif ( $category->parent != 0 )
				$category_nicename = get_category_parents( $category->parent, false, '/', true ) . $category_nicename;
			$category_rewrite[$blog_prefix . '(' . $category_nicename . ')/(?:feed/)?(feed|rdf|rss|rss2|atom)/?$'] = 'index.php?category_name=$matches[1]&feed=$matches[2]';
			$category_rewrite[$blog_prefix . '(' . $category_nicename . ')/page/?([0-9]{1,})/?$']                  = 'index.php?category_name=$matches[1]&paged=$matches[2]';
			$category_rewrite[$blog_prefix . '(' . $category_nicename . ')/?$']                                    = 'index.php?category_name=$matches[1]';
		}

		// Redirect support from Old Category Base
		$old_base                          = $wp_rewrite->get_category_permastruct();
		$old_base                          = str_replace( '%category%', '(.+)', $old_base );
		$old_base                          = trim( $old_base, '/' );
		$category_rewrite[$old_base . '$'] = 'index.php?wpseo_category_redirect=$matches[1]';

		return $category_rewrite;
	}
}
global $wpseo_rewrite;
$wpseo_rewrite = new WPSEO_Rewrite();
