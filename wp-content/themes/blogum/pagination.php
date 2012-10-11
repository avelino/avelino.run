<div class="pagination">
    <?php
        if (function_exists('wp_pagenavi')) {
            wp_pagenavi();
        } elseif (get_previous_posts_link() || get_next_posts_link()) {
            previous_posts_link(__('Previous'));
            next_posts_link(__('Next'));
        }
    ?>
</div>