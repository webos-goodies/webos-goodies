# Introduction #

This page describes how to install and use the Amazon Route 53 Apps Script. This script allows you following things in Google Spreadsheets.

  * Create a hosted zone.
  * Delete a hosted zone.
  * Edit resource records in each hosted zones.

You can use all Google Spreadsheets functionality to edit your resource records. I believe it is very useful. enjoy! :)

# Install #

At first, you should create a new spreadsheet to manage your hosted zones. Open [Google Docs](http://docs.google.com/) and create a new spreadsheet with the _Create new_ menu.

You can install Amazon Route 53 script in few clicks from Script Gallery. Select _Tools>Scripts>Insert_ to show Script Gallery and you should find “Amazon Route 53” script in the “Miscellaneous” category. Please click “Install” to install this script into your spreadsheet.

![http://cache.webos-goodies.jp/cache/farm5.static.flickr.com/4078/5432878856_e4b744c2a3_o.png](http://cache.webos-goodies.jp/cache/farm5.static.flickr.com/4078/5432878856_e4b744c2a3_o.png)

After few seconds, you should see _Route53_ item in the menu bar.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5260/5424819774_6f0999d33b_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5260/5424819774_6f0999d33b_o.png)

You should configure the script. Select _Route53>Settings_.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5092/5424819808_6b41a40b11_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5092/5424819808_6b41a40b11_o.png)

Please provide your access key and secret access key and click _OK_.

# Synchronize your resource records into the spreadsheet #

If you have your hosted zone(s) already, you can select _Route53>Sync all zones_ to create sheets contains resource records ([sample](https://spreadsheets.google.com/ccc?key=tKoicScxTKLu2RdhPo4enWw)). "Sync all zones" dialog is displayed. Please click _Continue_. New sheets will be created for each hosted zones.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5094/5424819844_63490899f7_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5094/5424819844_63490899f7_o.png)

If you have no hosted zone, you can create one. See [Create a new hosted zone](#Create_a_new_hosted_zone.md).

# Edit your resource records #

Once you have synchronized your zones, you can edit its resource records like a normal spreadsheet. You can use all Google Spreadsheets functionalities like find, sort, copy and paste etc... The format of resource records is described below (or see the [sample](https://spreadsheets.google.com/ccc?key=tKoicScxTKLu2RdhPo4enWw)).

&lt;wiki:gadget url="http://webos-goodies.googlecode.com/svn/trunk/products/appsscript/amazon\_route53/gadget.xml" width="600" height="440" border="1" /&gt;

After you have finished to edit, you should submit your changes to Amazon Route 53. To do this, select _Route53>Submit all zones_ and Click _Continue_ button at bottom of "Submit all zones" dialog.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5295/5424819892_30bf2a89e1_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5295/5424819892_30bf2a89e1_o.png)

You can close the dialog immediately after finished submitting, or you can check the status of your changes to click _Check Status_ button.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5295/5424219347_479af58bd6_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5295/5424219347_479af58bd6_o.png)

Because of limitation of Apps Script, you must click the _Check Status_ button repeatedly to update the status information.

# Create a new hosted zone #

You can create a new hosted zone by selecting _Route53>Create new zone_.

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5299/5424819986_9073da8f6a_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5299/5424819986_9073da8f6a_o.png)

Input a domain name and click "Create" button. Your new hosted zone and a corresponding sheet will be created and you may be charged $1 :)

![http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5299/5424819986_9073da8f6a_o.png](http://cache.webos-goodies.jp/cache/farm6.static.flickr.com/5299/5424819986_9073da8f6a_o.png)

You can also delete a hosted zone with _Route53>Delete this zone_.