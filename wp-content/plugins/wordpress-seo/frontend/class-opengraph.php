<?php
/**
 * @package Frontend
 *
 * This code handles the OpenGraph output.
 */

/**
 * Adds the OpenGraph output
 */
class WPSEO_OpenGraph extends WPSEO_Frontend {

	/**
	 * @var array $options Options for the OpenGraph Settings
	 */
	var $options = array();

	/**
	 * Class constructor.
	 */
	public function __construct() {
		$this->options = get_option('wpseo_social');
		
		add_action( 'wpseo_head', array( $this, 'opengraph' ) );
		add_filter( 'language_attributes', array( $this, 'add_opengraph_namespace' ) );
	}

	/**
	 * Main OpenGraph output.
	 */
	public function opengraph() {
		wp_reset_query();
		
		$this->locale();
		$this->site_owner();
		$this->og_title();
		$this->description();
		$this->url();
		$this->site_name();
		$this->type();
		$this->image();
		do_action('wpseo_opengraph');
	}

	/**
	 * Filter for the namespace, adding the OpenGraph namespace.
	 *
	 * @param string $input The input namespace string.
	 * @return string
	 */
	public function add_opengraph_namespace( $input ) {
		return $input . ' xmlns:og="http://opengraphprotocol.org/schema/"';
	}

	/**
	 * Outputs the site owner
	 */
	public function site_owner() {
		if ( isset( $this->options['fbadminapp'] ) && 0 != $this->options['fbadminapp'] ) {
			echo "<meta property='fb:app_id' content='".esc_attr( $this->options['fbadminapp'] )."'/>\n";
		} else if ( isset( $this->options['fb_admins'] ) && is_array( $this->options['fb_admins'] ) && ( count( $this->options['fb_admins'] ) > 0 )  ) {
			$adminstr = '';
			foreach ( $this->options['fb_admins'] as $admin_id => $admin ) {
				if ( !empty($adminstr) )
					$adminstr .= ','.$admin_id;
				else
					$adminstr = $admin_id;
			}
			echo "<meta property='fb:admins' content='".esc_attr( $adminstr )."'/>\n";
		}
	}

	/**
	 * Outputs the SEO title as OpenGraph title.
	 */
	public function og_title() {
		$title = $this->title('');
		echo "<meta property='og:title' content='".esc_attr( $title )."'/>\n";
	}

	/**
	 * Outputs the canonical URL as OpenGraph URL, which consolidates likes and shares.
	 */
	public function url() {
		echo "<meta property='og:url' content='".esc_attr( $this->canonical( false ) )."'/>\n";
	}

	/**
	 * Output the locale, doing some conversions to make sure the proper Facebook locale is outputted.
	 */
	public function locale() {
		$locale = apply_filters( 'wpseo_locale', strtolower( get_locale() ) );
		
		// catch some weird locales served out by WP.
		$locales = array(
			'ar'=> 'ar_ar',
			'ca'=> 'ca_es',
			'en'=> 'en_us',
			'el'=> 'el_gr',
			'et'=> 'et_ee',
			'fi'=> 'fi_fi',
			'ja'=> 'ja_jp',
			'sq'=> 'sq_al',
			'uk'=> 'uk_ua',
			'vi'=> 'vi_vn',
			'zh'=> 'zh_cn'
		);
		
		if ( isset( $locales[ $locale ] ) ) 
			$locale = $locales[$locale];
		
		echo "<meta property='og:locale' content='".esc_attr( $locale )."'/>\n";
	}

	/**
	 * Output the OpenGraph type.
	 */
	public function type() {
		if ( is_singular() ) {
			$type = wpseo_get_value('og_type');
			if (!$type || $type == '')
				$type = 'article';
		} else {
			$type = 'website';
		}
		$type = apply_filters( 'wpseo_opengraph_type', $type );
		echo "<meta property='og:type' content='".esc_attr( $type )."'/>\n";
	}

	/**
	 * Output the OpenGraph image elements for all the images within the current post/page.
	 *
	 * @return bool
	 */
	public function image() {
		if ( is_singular() ) {
			global $post;

			$shown_images = array();

			if ( is_front_page() ) {
				if ( is_front_page() ) {
					$og_image = '';
					if ( isset( $this->options['og_frontpage_image'] ) )
						$og_image = $this->options['og_frontpage_image'];
						
					$og_image = apply_filters( 'wpseo_opengraph_image', $og_image );

					if ( isset( $og_image ) && $og_image != '' ) 
						echo "<meta property='og:image' content='".esc_attr( $og_image )."'/>\n";
				}				
			} 
			
			if ( function_exists('has_post_thumbnail') && has_post_thumbnail( $post->ID ) ) {
				$featured_img = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), apply_filters( 'wpseo_opengraph_image_size', 'medium' ) );
				
				if ( $featured_img ) {
					$img = apply_filters( 'wpseo_opengraph_image', $featured_img[0] );
					echo "<meta property='og:image' content='".esc_attr( $img )."'/>\n";
					$shown_images[] = $img;
				}
			} 
			
			if ( preg_match_all( '/<img [^>]+>/', $post->post_content, $matches ) ) {
				foreach ( $matches[0] as $img ) {
					if ( preg_match( '/src=("|\')([^"|\']+)("|\')/', $img, $match ) ) {
						$img = $match[2];
						
						if ( in_array( $img, $shown_images ) )
							continue;
							
						if ( strpos($img, 'http') !== 0 ) {
							if ( $img[0] != '/' )
								continue;
							$img = get_bloginfo('url') . $img;
						}

						if ( $img != esc_url( $img ) )
							continue;

						$img = apply_filters( 'wpseo_opengraph_image', $img );
						
						echo "<meta property='og:image' content='".esc_attr( $img )."'/>\n";
						
						$shown_images[] = $img;
					}
				}
			}
			if ( count( $shown_images ) > 0 )
				return true;
		} 
		

		$og_image = '';
		
		if ( is_front_page() ) {
			if ( isset( $this->options['og_frontpage_image'] ) )
				$og_image = $this->options['og_frontpage_image'];
			if ( isset( $this->options['gp_frontpage_image'] ) )
				$gp_image = $this->options['gp_frontpage_image'];
		}

		if ( empty( $og_image ) && isset( $this->options['og_default_image'] ) )
			$og_image = $this->options['og_default_image'];

		$og_image = apply_filters( 'wpseo_opengraph_image', $og_image );

		if ( isset( $og_image ) && $og_image != '' ) 
			echo "<meta property='og:image' content='".esc_attr( $og_image )."'/>\n";

        // @TODO add G+ image stuff
	}

	/**
	 * Output the OpenGraph description, specific OG description first, if not, grab the meta description.
	 */
	public function description() {
		$ogdesc = wpseo_get_value('opengraph-description');
		
		if ( !$ogdesc )
			$ogdesc = $this->metadesc( false );

		if ( $ogdesc && $ogdesc != '' )
			echo "<meta property='og:description' content='".esc_attr( $ogdesc )."'/>\n";
	}

	/**
	 * Output the site name straight from the blog info.
	 */
	public function site_name() {
		echo "<meta property='og:site_name' content='".esc_attr( get_bloginfo('name') )."'/>\n";
	}
}
global $wpseo_og;
$wpseo_og = new WPSEO_OpenGraph;