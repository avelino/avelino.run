<?php get_header(); ?>

<div id="content">

    <div class="archive_title clear">
        <div class="archive_title_meta">Archive</div>

        <?php $post = $posts[0]; // Hack. Set $post so that the_date() works. ?>
        <?php /* If this is a category archive */ if (is_category()) { ?>
        <div class="archive_title_name"><?php printf(__('%s'), single_cat_title('', false)); ?></div>
        <?php /* If this is a tag archive */ } elseif( is_tag() ) { ?>
        <div class="archive_title_name"><?php printf(__('Tag "%s"'), single_tag_title('', false) ); ?></div>
        <?php /* If this is a daily archive */ } elseif (is_day()) { ?>
        <div class="archive_title_name"><?php printf(_c('%s Daily archive'), get_the_time(__('F jS, Y'))); ?></div>
        <?php /* If this is a monthly archive */ } elseif (is_month()) { ?>
        <div class="archive_title_name"><?php printf(_c('%s Monthly archive'), get_the_time(__('F, Y'))); ?></div>
        <?php /* If this is a yearly archive */ } elseif (is_year()) { ?>
        <div class="archive_title_name"><?php printf(_c('%s Yearly archive'), get_the_time(__('Y'))); ?></div>
        <?php /* If this is an author archive */ } elseif (is_author()) { ?>
        <div class="archive_title_name"><?php _e('Author Archive'); ?></div>
        <?php /* If this is a paged archive */ } elseif (isset($_GET['paged']) && !empty($_GET['paged'])) { ?>
        <div class="archive_title_name"><?php _e('Blog Archives'); ?></div>
        <?php } ?>

    </div>

    <?php get_template_part('loop'); ?>

    <?php get_template_part('pagination'); ?>

</div>

<?php get_sidebar(); ?>

<?php get_footer(); ?>