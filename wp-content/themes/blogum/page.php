<?php get_header(); ?>

<div id="content">

    <?php if ( have_posts() ) : ?>
    <?php while ( have_posts() ) : the_post(); ?>

        <div <?php post_class('clear'); ?> id="post_<?php the_ID(); ?>">
            <div class="post_meta">
                <div class="post_data">
                    <h2><?php the_title(); ?></h2>
                </div>
            </div>
            <div class="post_content">
                <?php the_content(); ?>
                <div class="post_tags clear">
                    <?php
                        if (get_the_tag_list()) {
                            echo get_the_tag_list('<ul><li>','</li><li>','</li></ul>');
                        }
                    ?>
                </div>
            </div>
        </div>

    <?php endwhile; ?>
<?php endif; ?>

</div>

<?php get_sidebar(); ?>

<?php comments_template(); ?>

<?php get_footer(); ?>
