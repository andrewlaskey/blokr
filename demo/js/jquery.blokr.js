/**
 * Blokr
 * Version: 0.1
 * URL: http://idiom.co
 * Description: A 2D Carousel UI Grid
 * Requires: jQuery, hammer.js
 * Author: Andrew Laskey (http://portfolio.andrewlaskey.com)
 * Copyright: Copyright 2013 Andrew Laskey
 * License: 
 */

// Plugin closure wrapper
// Uses dollar, but calls jQuery to prevent conflicts with other libraries
// Semicolon to prevent breakage with concatenation
// Pass in window as local variable for efficiency (could do same for document)
// Pass in undefined to prevent mutation in ES3
;(function($, document, window, undefined) {
    // Optional, but considered best practice by some
    "use strict";

    // Name the plugin so it's only in one place
    var pluginName = 'blokr';

    // Default options for the plugin as a simple object
    var defaults = {
        js_sizing: true,
        stop_img_drag: true
    };

    // Plugin constructor
    // This is the boilerplate to set up the plugin to keep our actual logic in one place
    function Plugin(element, options) {
        this.element = element;
        this.$element = $(this.element);

        this.opts = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        // Initialization code to get the ball rolling
        // If your plugin is simple, this may not be necessary and
        // you could place your implementation here
        this.init();
    }

    Plugin.prototype = {
        // Public functions accessible to users
        // Prototype methods are shared across all elements
        // You have access to this.options and this.element
        // If your plugin is complex, you can split functionality into more
        // methods like this one

        init: function() {
            var self = this;

            //for calculating drag amount
            this.last_delta = 0;

            //get size of grid
            this.gridSize = parseInt(this.$element.attr('data-size'), 10);

            //make sure children fit
            this.$blocks = this.$element.children();
            var numBlocks = this.$blocks.length;

            if (numBlocks % this.gridSize !== 0) {
                console.log("ERROR: You don't have an even grid to fit all the blocks");
            } else {
                console.log("grid fits; move on");

                this.buildGrid();

                this.buildEnds();

                //update $blocks with new children;
                this.$blocks = this.$element.children();

                this.$blocks.hammer({drag_lock_to_axis: true})
                        .on("release dragup dragdown dragleft dragright swipeup swipedown swipeleft swiperight", 
                            function(ev) {
                                self.handleHammer(this, ev, self);
                            });

                if (this.opts.stop_img_drag) {
                    //trick - stop the browser from dragging images
                    this.$blocks.find('img').on('dragstart', function(event) { event.preventDefault(); });
                }

            }
           
        },
        buildGrid: function() {
            var self = this;
            var col = 1;
            var row = 1;

            this.blockSizePercent = 100;

            //set size dynamically
            if (self.opts.js_sizing) {
                self.blockSizePercent = (1 / self.gridSize) * 100;

                self.$blocks.css({
                    'width': self.blockSizePercent + '%',
                    'height': self.blockSizePercent + '%'
                });
            }

            this.blockSize = self.$blocks.outerWidth();

            self.$blocks.each(function(i) {
                $(this)
                    .attr('data-row', row)
                    .attr('data-col', col);

                //set position dynamically
                if (self.opts.js_sizing) {
                    $(this).css({
                        'top': self.blockSizePercent * (row -1) + '%',
                        'left': self.blockSizePercent * (col -1) + '%'
                    });
                }

                //iterate through the rows and columns 
                row++;
                if (row === self.gridSize + 1) {

                    row = 1;
                    col++;
                }
            });
        },
        buildEnds: function() {
            var self = this;
            var data;
            var outerEdge = self.gridSize + 1;

            //bottom edge
            self.$element.find('[data-row=1]').each(function() {    
                var $edgeBlock = $(this)
                                    .clone()
                                    .attr('data-row', outerEdge);

                if (self.opts.js_sizing) {
                    $edgeBlock.css('top', '100%');
                }
                
                self.$element.append($edgeBlock);
            });

            //top edge
            self.$element.find('[data-row=' + self.gridSize + ']').each(function() {    
                var $edgeBlock = $(this)
                                    .clone()
                                    .attr('data-row', 0);

                if (self.opts.js_sizing) {
                    $edgeBlock.css('top', '-' + self.blockSizePercent + '%');
                }
                
                self.$element.append($edgeBlock);
            });

            //left edge
            self.$element.find('[data-col=1]').each(function(i) {

                //prevent corners from being generated
                if ( i <= self.gridSize - 1 ) { 
                    var $edgeBlock = $(this)
                                        .clone()
                                        .attr('data-col', outerEdge);

                    if (self.opts.js_sizing) {
                        $edgeBlock.css('left', '100%');
                    }
                    
                    self.$element.append($edgeBlock);
                }
            });

            //right edge
            self.$element.find('[data-col=' + self.gridSize + ']').each(function(i) {

                //prevent corners from being generated
                if ( i <= self.gridSize - 1 ) {     
                    var $edgeBlock = $(this)
                                        .clone()
                                        .attr('data-col', 0);

                    if (self.opts.js_sizing) {
                        $edgeBlock.css('left', '-' + self.blockSizePercent + '%');
                    }
                    
                    self.$element.append($edgeBlock);
                }
            });
        },
        attachHammer: function() {
            var self = this;

            
        },
        handleHammer: function(block, ev, self) {
            ev.gesture.preventDefault();

            var drag_offset_x = ev.gesture.deltaX;
            var drag_offset_y = ev.gesture.deltaY;


            switch(ev.type) {
                case 'dragright':
                case 'dragleft':
                    var currentRow = $(block).attr('data-row');

                    if (Math.abs(drag_offset_x - self.last_delta) >= self.blockSize) {
                        updateRow(currentRow, ev.type, self);
                        updateEnds(self);
                        self.last_delta = truncate(drag_offset_x);
                    }

                    drag_offset_x = (drag_offset_x - self.last_delta);

                    setRowOffset(self.$element, currentRow, drag_offset_x);
                    
                    
                    break;
                case 'dragup':
                case 'dragdown':
                    var currentCol = $(block).attr('data-col');

                    if (Math.abs(drag_offset_y - self.last_delta) >= self.blockSize) {
                        updateColumn(currentCol, ev.type, self);
                        updateEnds(self);
                        self.last_delta = truncate(drag_offset_y);
                    }

                    drag_offset_y = (drag_offset_y - self.last_delta);

                    setColumnOffset(self.$element, currentCol, drag_offset_y);

                    break;
                case 'swipeup':
                    //updateColumn($(this).attr('data-col'),1);
                    break;
                case 'swipedown':
                    //updateColumn($(this).attr('data-col'),-1);
                    break;
                case 'release':
                    self.last_delta = 0;
                    self.$element.addClass('animate');
                    self.$blocks.css("transform", "translate3d(0,0,0)");
                    break;
            }
        }

    };

    $.fn[pluginName] = function(options) {
        // Iterate through each DOM element and return it
        return this.each(function() {
            // prevent multiple instantiations
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

    
    var truncate = function(n) {
        return n | 0; // bitwise operators convert operands to 32-bit integers
    }

    var setRowOffset = function($el,row,offset) {
        $el.removeClass('animate');

        $el.children('[data-row=' + row + ']').css("transform", "translate3d(" + offset + "px,0,0)");
    }

    var setColumnOffset = function($el,col,offset) {
        $el.removeClass('animate');

        $el.children('[data-col=' + col + ']').css("transform", "translate3d(0," + offset + "px,0)");
    }

    var updateRow = function(row, dir, self) {
        var shift = 1;
        var outerEdge = self.gridSize + 1;

        if (dir === 'dragleft') {
            shift = -1;
        }

        self.$element.children('[data-row=' + row + ']').each( function() {
            var offset = 0;
            var col = parseInt($(this).attr('data-col'),10);
            if (col + shift < 0) {
                offset = outerEdge;
            } else if (col + shift > outerEdge) {
                offset = 0;
            } else {
                offset = col + shift;
            }
            $(this).attr('data-col', offset);

            if (self.opts.js_sizing) {
                $(this).css({
                    'left': self.blockSizePercent * (offset - 1) + '%'
                });
            }

            $(this).css("transform", "translate3d(0,0,0)");

        });
    }

    var updateColumn = function(col, dir, self) {
        var shift = 1;
        var outerEdge = self.gridSize + 1;

        if (dir === 'dragup') {
            shift = -1;
        }

        self.$element.children('[data-col=' + col + ']').each( function() {
            var offset = 0;
            var row = parseInt($(this).attr('data-row'),10);
            if (row + shift < 0) {
                offset = outerEdge;
            } else if (row + shift > outerEdge) {
                offset = 0;
            } else {
                offset = row + shift;
            }
            $(this).attr('data-row', offset);

            if (self.opts.js_sizing) {
                $(this).css({
                    'top': self.blockSizePercent * (offset - 1) + '%'
                });
            }

            $(this).css("transform", "translate3d(0,0,0)");

        });
    }

    var updateEnds = function(self) {
        self.$element.removeClass('animate');

        var outerEdge = self.gridSize + 1;
        var data;

        //set bottom outside row
        self.$element.children('[data-row=1]').each(function() {
            data = $(this).html();
            var col = $(this).attr('data-col');

            self.$element.children('[data-row=' + outerEdge + '][data-col=' + col + ']').html(data);
        });

        //set top outside row
        self.$element.children('[data-row=' + self.gridSize + ']').each(function() {
            data = $(this).html();
            var col = $(this).attr('data-col');

            self.$element.children('[data-row=0][data-col=' + col + ']').html(data);
        });

        //set right outside row
        self.$element.children('[data-col=1]').each(function() {
            data = $(this).html();
            var row = $(this).attr('data-row');

            self.$element.children('[data-row=' + row + '][data-col=' + outerEdge + ']').html(data);
        });

        //set left outside row
        self.$element.children('[data-col=' + self.gridSize + ']').each(function() {
            data = $(this).html();
            var row = $(this).attr('data-row');

            self.$element.children('[data-row=' + row + '][data-col=0]').html(data);
        });

        //stop all newly created images from dragging
        if (self.opts.stop_img_drag) {
            //trick - stop the browser from dragging images
            self.$blocks.find('img').on('dragstart', function(event) { event.preventDefault(); });
        }
    }



})(jQuery, document, window);