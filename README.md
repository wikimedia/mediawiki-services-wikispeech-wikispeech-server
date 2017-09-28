# Server for wikispeech tts.

## Prerequisites:
```
sudo apt install opus-tools
sudo apt install python3-pip
sudo pip3 install -r requirements.txt

mkdir wikispeech_server/tmp
```



## Usage:
```
python3 bin/wikispeech
```

## Configuration:

For local configuration, make a copy of wikispeech_server/default.conf,
name it ```<username>-<hostname>.conf```, and edit it as needed.

The file contains settings for:
* Server
  * server port (default: 10000)
  * log_level (default: warning)
  * debug_mode: python flask setting to reload when files are edited. (default: False)
* Audio settings
  * audio_tmpdir: output directory for soundfiles. This directory needs to exist. (default: ./wikispeech_server/tmp)
  * audio_url_prefix: how the soundfiles should be served. Change this for production, and serve through eg. apache. (default: http://localhost:10000/audio)
* Services
  * lexicon: url to lexicon server. (default: http://localhost:8787)
  * marytts: url to marytts server. (default: http://localhost:59125/process)
* Tests
  * run_startup_test: Run or don't run a lot of tests - they may fail if configuration is incorrect, or lexicon/marytts servers are not found. (default: True)
  * quit_on_error: Quit if a test fails. (default: False)

To test the config file, the script can be run with a config file as argument:
```
python3 bin/wikispeech <config-file>
```


## Test:

```
google-chrome test.html
```
(may not work to load the audio, depends on setup)

```

google-chrome "http://localhost:10000/wikispeech/"
```
(for usage information)

```
google-chrome "http://localhost:10000/wikispeech/?lang=sv&input=Ett+test"
```
(example api call)


## Documentation:

started in https://github.com/stts-se/wikispeech_mockup/wiki


## Apache setup:

#### 1. (required)
Link the audio file directory in ```<webroot>```, as defined in default.conf or your local configuration file:
```
$ cd <webroot>; sudo ln -s <audio_tmpdir> <audio_url_prefix>
```

example:
```
$ cd /var/www/html; sudo ln -s ~/git/wikispeech_mockup/wikispeech_server/tmp/ audio
```

Audio files generated by the TTS should now be accessible through: http://localhost/audio/ and from outside at ```http://<HOSTNAME>/audio```



#### 2. (optional - to avoid unwanted access)

Disallow access to non-opus files by adding a .htaccess-file ```<audio_tmpdir>``` with the following content

```
<FilesMatch "\.*$">
  Deny from all
</FilesMatch>
<FilesMatch "\.opus$">
  Order deny,allow
  Allow from all
</FilesMatch>
```

Remove directory listing by adding a index.html file in ```<audio_tmpdir>``` with something like the following content:

This is a service to serve Wikispeech audio files. There is really never any reason to see this page.

To also display this page in the root directory (instead of apache default): $ cd /var/www/html/; sudo rm index.html; sudo ln -s audio/index.html

#### 3. (optional - for access through apache)


To access the wikispeech server through apache:
Add something like this to your apache config file (for example "/etc/apache2/sites-enabled/000-default.conf") and restart
apache (for example with "sudo apache2ctl restart"). You may need to run "sudo a2enmod proxy" and  "sudo a2enmod proxy_http" first.

```
ProxyPreserveHost On
ProxyPass         /wikispeech/  http://127.0.1.1:10000/wikispeech/
ProxyPassReverse  /wikispeech/  http://127.0.1.1:10000/wikispeech/
ProxyRequests     Off

ProxyPreserveHost On
ProxyPass /ws_service/ http://127.0.1.1:8787/
ProxyPassReverse /ws_service/ http://127.0.1.1:8787/
ProxyRequests Off
```

#### 4. (optional - for testing through apache)

Link this directory in apache's document root, for example: 
```
cd /var/www/html; sudo ln -s ~/git/wikispeech_mockup
```

Test:
```
google-chrome http://localhost/wikispeech_mockup/test.html
```
```
google-chrome http://localhost/wikispeech_mockup/workflow_demo/test.html
```
