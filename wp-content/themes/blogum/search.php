<?php get_header(); ?>

<div id="content">

    <div class="archive_title clear">
        <div class="archive_title_meta">Search Results</div>
        <div class="archive_title_name"><?php the_search_query(); ?></div>

    </div>

    <?php if ( have_posts() ) : ?>
        <?php while ( have_posts() ) : the_post(); ?>

            <div <?php post_class('clear'); ?> id="post_<?php the_ID(); ?>">
                <div class="post_meta">
                    <h2><a href="<?php the_permalink() ?>" title="<?php printf( esc_attr__('Permalink to %s'), the_title_attribute('echo=0') ); ?>" rel="bookmark"><?php the_title(); ?></a></h2>
                    <div class="post_data">
                        <div class="post_author">By: <?php the_author_link() ?></div>
                        <div class="post_date"><?php the_time(__('d-m-Y')) ?></div>
                        <div class="post_categories"><?php the_category(', '); ?></div>
                    </div>
                </div>
                <div class="post_content">
                    <?php the_content(false); ?>
                    <a href="<?php the_permalink() ?>#more" class="more">Read More</a>
                </div>
            </div>

        <?php endwhile; ?>
    <?php else :?>
    
        <div <?php post_class('clear'); ?> id="post_<?php the_ID(); ?>">
            <div class="post_content">
                <p><?php _e('Sorry, but nothing matched your search criteria. Please try again with some different keywords.'); ?></p>
            </div>
        </div>
    
    <?php endif; ?>

    <?php get_template_part('pagination'); ?>

</div>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
