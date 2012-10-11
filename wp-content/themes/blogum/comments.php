<?php if ( comments_open() ) : ?>
<div id="comments">
    <?php if ( post_password_required() ) : ?>
                    <p class="nopassword"><?php _e('This post is password protected. Enter the password to view any comments.'); ?></p>
                </div><!-- #comments -->
    <?php
            /* Stop the rest of comments.php from being processed,
             * but don't kill the script entirely -- we still have
             * to fully load the template.
             */
            return;
        endif;
    ?>

    <?php
        // You can start editing here -- including this comment!
    ?>

        <div class="comments_heading clear">
            <div class="comment_qty"><?php
                printf( _n('1 comment', '%1$s comments', get_comments_number()),
                number_format_i18n( get_comments_number() ), '' );
                ?></div>
            <div class="add_comment"><a href="#respond">Submit yours</a></div>
        </div>

    <?php if (have_comments()) : ?>

        <div class="comment_list">
            <ol>
            <?php
                wp_list_comments(array('callback' => 'commentlist'));
            ?>
            </ol>
        </div>

    <?php endif; // end have_comments() ?>

    <?php if ('open' == $post->comment_status) : ?>

    <div id="respond" class="clear">
        <div class="respond_meta">Submit comment</div>
        <div class="comment_form">

        <?php if ( get_option('comment_registration') && !$user_ID ) : ?>
            <p class="comment_message">You must be <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?redirect_to=<?php echo urlencode(get_permalink()); ?>">logged in</a> to post a comment.</p>
        <?php else : ?>

            <form action="<?php echo get_option('siteurl'); ?>/wp-comments-post.php" method="post" id="commentform" onSubmit="return checkFields();">

                <?php if ( $user_ID ) : ?>

                    <p class="comment_message">Logged in as <a href="<?php echo get_option('siteurl'); ?>/wp-admin/profile.php"><?php echo $user_identity; ?></a>. <a href="<?php echo wp_logout_url(get_permalink()); ?>" title="Log out of this account">Log out &raquo;</a></p>

                <?php else : ?>
                    <div class="user_data">
                        <p><input id="author" type="text" name="author" class="focus" onfocus="if(this.value=='Name') this.value='';" onblur="if(this.value=='') this.value='Name';" value="Name" tabindex="1" /></p>
                        <p><input id="email" type="text" name="email" class="focus" onfocus="if(this.value=='Email') this.value='';" onblur="if(this.value=='') this.value='Email';" value="Email" tabindex="2" /></p>
                        <p><input id="url" type="text" name="url" class="focus" onfocus="if(this.value=='Website') this.value='';" onblur="if(this.value=='') this.value='Website';" value="Website" tabindex="3" /></p>
                    </div>
                <?php endif; ?>

                <!--<p class="comment_message"><small><strong>XHTML:</strong> You can use these tags: <code><?php echo allowed_tags(); ?></code></small></p>-->

                <div class="comment_field">
                    <textarea name="comment" class="focus" id="comment" cols="50" rows="10" tabindex="4" onfocus="if(this.innerHTML=='Comment') this.innerHTML='';">Comment</textarea>
                </div>

                <p class="comment_submit"><input name="submit" type="submit" id="submit" tabindex="5" value="Submit" />
                <?php comment_id_fields(); ?>
                </p>
                <?php do_action('comment_form', $post->ID); ?>

            </form>

        <?php endif; // If registration required and not logged in ?>

        </div>

        <?php endif; // if you delete this the sky will fall on your head ?>

    </div>

</div>
<?php endif; // end ! comments_open() ?>
<!-- #comments -->
