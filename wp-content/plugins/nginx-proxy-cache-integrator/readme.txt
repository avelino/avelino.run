=== Wordpress Nginx proxy cache integrator  ===
Contributors: djcp
Donate link: 
Tags: cache, performance, nginx, caching, wpmu
Requires at least: 1.5
Tested up to: 2.9.1
Stable tag: trunk

Enables your blog to work properly with an nginx frontend static proxy cache. ASTRONOMICAL performance is yours!

== Description ==

# Need for Speed?

This plugin handles the wordpress/php side of a statically cached nginx-fronted wordpress (or wordpress mu) site. It makes Wordpress emit an "X-Accel-Expires: 0" header when a user is logged in or has taken actions that should cause them to get a customized page on your frontend.  This - along with the nginx configuration below - will ensure logged-in users aren't impacted by your static nginx cache.

Why would you want to statically cache wordpress with [nginx?](http://www.nginx.org)

* INSANE performance. Hardware that could generate 6 pages / second can now generate many thousands.
* Low resource usage. Even on very busy servers, nginx uses only a handful of RAM.
* Unobtrusiveness. You plop nginx in front of wordpress and that's pretty much it. This plugin (and nginx) is all you need to make your site digg- and slashdot- proof.
* Stability. Nginx is rock solid.
* Faster is better. All the web gurus agree - visitors like faster sites, even when the differences are slight.
* Do more with less. Using a frontend proxy lets you keep your heavy wordpress apaches lightly loaded, letting you handle more concurrent connections and use less RAM.

We've been using a caching nginx proxy at the fairly busy [blogs.law.harvard.edu](http://blogs.law.harvard.edu) since September, 2009. The results have been dramatic: we've halved the amount of RAM we need, doubled our outgoing network throughput (nginx is fast!) and have had essentially no significant load spikes.

# Drawbacks

There are a few.

* Plugins that rely on php code running on each page view won't work properly. This is similar to wp-supercache or any of the other static caching plugins. Stats, image rotation,  etc. You should implement these features via javascript or third-party services, depending. 
* You need to install and configure an nginx frontend proxy - but see the "installation" tab. It's really not that hard.

# Notes

* It is completely harmless to install and activate this plugin before you've got the nginx side set up.
* YOU MUST keep this plugin activated as long as you've got an nginx frontend proxy active - otherwise, you'll end up caching too much of your site, and authenticated users won't see customized pages.
* This plugin helps speed up access for authenticated users mainly because it makes all other traffic a negligible resource drain. I suggest installing [apc](http://php.net/manual/en/book.apc.php) (or another opcode cache) and - alternatively - a wordpress object cache. Definitely install an opcode cache - leave the object cache for later. You may find you don't need it!

== Installation ==

It is harmless to install and activate this plugin before you've got the nginx proxy set up. To install:

1. Upload this plugin to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. [Install the latest stable nginx](http://wiki.nginx.org/NginxInstall) - currently 0.7.64. The 0.8 branch should work fine, too. Set it up as a frontend proxy.
1. Reconfigure your apache server to act as a backend proxy.

# Sample nginx configuration

	# The main config file, probably /etc/nginx/nginx.conf
	user nginx;
	worker_processes  4;
	error_log  /var/log/nginx/error.log;
	pid        /var/run/nginx.pid;
	events {
		#A maximum of 1024 concurrent connections.
		worker_connections  1024;
	}
	http {
		server_tokens off;
		include       /etc/nginx/mime.types;
		default_type  application/octet-stream;
		access_log  /var/log/nginx/access.log;
		client_body_temp_path /var/lib/nginx/body 1 2;
		gzip_buffers 32 8k;
		sendfile        on;
		keepalive_timeout  65;
		tcp_nodelay        on;
		#gzipping lets you serve more requests quicker. 
		gzip  on;
		gzip_types text/html application/javascript text/javascript text/css text/xml application/atom+xml application/xml;
		include /etc/nginx/sites-enabled/*;
	}


	# And then in the file /etc/nginx/sites-enabled/default
	# This file shows you a few ways you can tweak your caching policies by inspecting URLs.
	# The most important rule is to leave admin-looking URLs uncached, otherwise you won't be able to log in.
	# From there, please feel free to set longer or shorter cache times based on your particular traffic.
	 
	# set some parameters: two levels deep for the filesystem
	# set the name of the cache to "staticfilecache", giving it a maximum cache time of 3 hours and 500meg in size.
	proxy_cache_path  /var/lib/nginx/cache  levels=1:2   keys_zone=staticfilecache:180m  max_size=500m;
	proxy_temp_path /var/lib/nginx/proxy;
	proxy_connect_timeout 30;
	proxy_read_timeout 120;
	proxy_send_timeout 120;
	
	#IMPORTANT - this sets the basic cache key that's used in the static file cache.
	proxy_cache_key "$scheme://$host$request_uri";
	
	upstream wordpressapache {
	        #The upstream apache server. You can have many of these and weight them accordingly,
	        #allowing nginx to function as a caching load balancer (oh my. Awesomeness abounds.)
	        server 127.0.0.1:8200 weight=1 fail_timeout=120s;
	}
	
	server {
	        #Only cache 200 responses, and for a default of 20 minutes.
	        proxy_cache_valid 200 20m;
	
	        #Listen to your public IP
	        listen 111.11.111.111:80;
	
	        #Probably not needed, as the proxy will pass back the host in "proxy_set_header"
	        server_name blog.example.org;
	
	        # "combined" matches apache's concept of "combined". Neat.
	        access_log  /var/log/apache2/nginx-access.log combined;
	        # Set the real IP.
	        proxy_set_header X-Real-IP  $remote_addr;
	
	        # Set the hostname
	        proxy_set_header Host $host;
	
	        #Set the forwarded-for header.
	        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	
	        location / {
	                        # If logged in, don't cache.
	                        if ($http_cookie ~* "comment_author_|wordpress_(?!test_cookie)|wp-postpass_" ) {
	                                set $do_not_cache 1;
	                        }
	                        proxy_cache_key "$scheme://$host$request_uri $do_not_cache";
	                        proxy_cache staticfilecache;
	                        proxy_pass http://wordpressapache;
	        }
	
	        location ~* wp\-.*\.php|wp\-admin {
	                        # Don't static file cache admin-looking things.
	                        proxy_pass http://wordpressapache;
	        }
	
	        location ~* \.(jpg|png|gif|jpeg|css|js|mp3|wav|swf|mov|doc|pdf|xls|ppt|docx|pptx|xlsx)$ {
	                        # Cache static-looking files for 120 minutes, setting a 10 day expiry time in the HTTP header,
	                        # whether logged in or not (may be too heavy-handed).
	                        proxy_cache_valid 200 120m;
	                        expires 864000;
	                        proxy_pass http://wordpressapache;
	                        proxy_cache staticfilecache;
	        }
	
	        location ~* \/[^\/]+\/(feed|\.xml)\/? {
	                        # Cache RSS looking feeds for 45 minutes unless logged in.
	                        if ($http_cookie ~* "comment_author_|wordpress_(?!test_cookie)|wp-postpass_" ) {
	                                set $do_not_cache 1;
	                        }
	                        proxy_cache_key "$scheme://$host$request_uri $do_not_cache";
	                        proxy_cache_valid 200 45m;
	                        proxy_cache staticfilecache;
	                        proxy_pass http://wordpressapache;
	        }
	
	        location = /50x.html {
	                root   /var/www/nginx-default;
	        }
	
	        # No access to .htaccess files.
	        location ~ /\.ht {
	                deny  all;
	        }
	}

# And a sample apache configuration

	########## Backend Apache
	# This apache only listens on localhost to port 8200.
	# It also has php and mod_rpaf installed. It does not gzip/deflate or access.log. It *Does* error log.
	# Basically, your backend apache is fairly normal. You should disable keepalive too by setting
	# Keepalive Off
	# in your main config.
	# mod_rpaf allows your backend apache to see the real IP address of the request, instead of the address of 
	# your frontend proxy.
	
	<VirtualHost 127.0.0.1:8200>
	        ServerName blog.example.org
	        RewriteEngine on
	        DocumentRoot /home/wp/wordpress/
	        ServerAdmin you@example.com
		
		#block POSTS without referrers. 
	        RewriteCond %{REQUEST_METHOD} POST
	        RewriteCond %{REQUEST_URI} .wp-comments-post\.php*
	        RewriteCond %{HTTP_REFERER} !.*blog.example.org.* [OR]
	        RewriteCond %{HTTP_USER_AGENT} ^$
	        RewriteRule (.*) - [R=403,L]
	</VirtualHost>

It's less intimidating than it looks.

== Frequently Asked Questions ==

= Why this and not the myriad of other caching plugins? =

It's super stable, very high performance and - another benefit - generically useful. Once you learn how nginx proxy caching works, you've got another tool in your toolbox you can deploy for any app, not just wordpress. Why learn the ins-and-outs of some of the heavyweight wordpress-only options, when nginx can probably handle all your caching (and even load-balancing) needs?

Also - there's something to be said for a caching layer that doesn't interfere with what it's caching. Separating the caching / load balancing layer from the apache backend gives you more deployment and tuning options.

= If I use this, do I need any other caching plugins? =

Maybe, but probably not. It depends on the capabilities of your server(s) and the number of authenticated users you sustain at any given time. Definitely install an opcode cache. You might want to use wp-cache or some other object-only caching system as well.

== The Future ==

This plugin could be set up to allow you to manage caching policies entirely from a wordpress control panel. We'd do this by manipulating the timeout in the "X-Accel-Expires" header based on the type of resource that's been requested.

It'd be nice to de-cache when pages change via some call from the backend to the nginx frontend.

== Changelog ==

= 0.1 =
* First public release.

== Upgrade Notice ==

= 0.1 =
* First public release

