<div class="wrap">
<h2>Google Analytics</h2>

<form method="post" action="options.php">
<?php wp_nonce_field('update-options'); ?>
<?php settings_fields('googleanalytics'); ?>

<table class="form-table">

<tr valign="top">
<th scope="row">Web Property ID:</th>
<td><input type="text" name="web_property_id" value="<?php echo get_option('web_property_id'); ?>" /></td>
</tr>

<tr valign="top">
<th scape="row">Asynchronous Tracking:</th>
<td>
  <select name="asynchronous_tracking">
    <option value="yes" <?php if (get_option('asynchronous_tracking') == 'yes') echo "selected=selected" ?>>Yes</option>
    <option value="no"  <?php if (get_option('asynchronous_tracking') == 'no') echo "selected=selected" ?>>No</option>
  </select>
</td>
</tr>

</table>

<input type="hidden" name="action" value="update" />

<p class="submit">
<input type="submit" class="button-primary" value="<?php _e('Save Changes') ?>" />
</p>

</form>
</div>
