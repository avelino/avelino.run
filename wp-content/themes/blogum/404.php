<?php get_header(); ?>

<div id="content">
    <div class="error404 clear">
        <div class="error404_meta">404</div>
        <div class="error404_text">
            <p>The page <?php echo $_SERVER['REQUEST_URI']; ?> could not be located on this web­site.
We recommend using the navigation bar to get back on track within our site. If you feel you
have reached this page in error, please contact a site operator. Thank you!</p>
            <a href="<?php bloginfo('home'); ?>" class="error404_back">Return to the Front Page</a>
        </div>
    </div>
</div>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
