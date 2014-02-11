blokr
=====

A 2D Carousel UI Grid

Blokr.js is a jQuery plugin that creates a square grid from a list of items. Users can then scroll infinitely through this list by dragging rows and columns.

![blokr_demo](http://i.imgur.com/HXLUWZh.gif)

[Demo](http://andrewlaskey.github.io/blokr/)

##Setting up

Include [hammer.js](https://github.com/EightMedia/hammer.js/)(this makes blokr work on touch devices) and Blokr's javascript and css.

```HTML
<link rel="stylesheet" href="stylesheets/blokr.css" type="text/css">

<script src="js/jquery.hammer.min.js" type="text/javascript"></script>
<script src="js/jquery.blokr.js" type="text/javascript"></script>
```

Set up your grid. The data-size attribute is the length of your rows and columns. Anything can go inside the grid block.

```HTML
<ul id="myBlocks" class="blocks" data-size="2">
	<li><div>Block</div></li>
	<li><img src="http://placecage.com/200/200" alt="place cage" /></li>
	<li><img src="http://www.fillmurray.com/200/200" alt="fill murray" /></li>
	<li><div>Block</div></li>
</ul>
```

Initialize the plugin.

```JavaScript
$('#myBlocks').blokr();
```

That's it!
