<?php

class Hum_Theme {
	public function __construct() {
		// Late priority, to run after the parent theme's hook.
		add_action( 'after_setup_theme', array( $this, 'after_setup_theme' ), 20 );
		add_action( 'customize_register', array( $this, 'customize_register' ), 20 );
	}

	public function after_setup_theme() {
		// Disable Twenty Eleven's theme options page.
		remove_action( 'admin_menu', 'twentyeleven_theme_options_add_page' );
	}

	// Remove Twenty Eleven's layout and color scheme customizer controls.
	public function customize_register( $wp_customize ) {
		$wp_customize->remove_section( 'twentyeleven_layout' );
		$wp_customize->remove_control( 'twentyeleven_color_scheme' );
	}
};

new Hum_Theme;