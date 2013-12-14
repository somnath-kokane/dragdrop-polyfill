// dragdrop-polyfill.js
// version 1.0
// (c) 2012-2013 Somnath Kokane. <in.somnath.kokane@gmail.com>
// DragDrop-Polyfill may be freely distributed under the MIT license.
(function($, dragdrop){
	
	var func = function(){
		this.init.apply(this, arguments);
	};
	func.prototype = dragdrop();
	func.prototype.constructor = func;
	
	$.fn.dragdrop = function(options, callbacks){
		options || (options = {});
		callbacks || (callbacks = {});
		options.el = this;
		this.dragdrop = new func(options);
		
		if(callbacks.dragstart){
			this.on('dragstart', $.proxy(callbacks, 'dragstart'));
		}
		return this;
	};
	
})(jQuery, function(){
	return (function(){
		var startX, startY, dragEvent, dataTransfer, originalObject, draggedObject, droppableObject, initialMouseX, initialMouseY;
		return {
			forceShim: false,
			init: function(options){
				options || (options = {});
				options.forceShim && (this.forceShim = options.forceShim);
				if (!this.forceShim) {
					var div	= document.createElement('div');
					if((('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))){
						return;
					}
				}
				this.options = options;
				this.el = options.el || null;
				this.docEl = document.documentElement || document.body;
				this.bindEvents();
			},
			bindEvents: function(){
				if(!this.el){
					return;
				}
				
				$(this.el).bind('mousedown.dragdrop touchstart.dragdrop', $.proxy(this, 'mouseDown'))
				
			},
			clientX: function(event){
				return event.clientX || event.originalEvent.changedTouches[0].clientX;
			},
			clientY: function(event){
				return event.clientY || event.originalEvent.changedTouches[0].clientY;
			},
			mouseDown: function(event){
				event || (event = window.event);
				event.preventDefault();
				this.capture(event.target, event);
				this.setPosition(0, 0);
				initialMouseX = this.clientX(event);
				initialMouseY = this.clientY(event);
				$(this.docEl).on('mousemove.dragdrop touchmove.dragdrop', $.proxy(this, 'mouseMove'));
				$(this.docEl).on('mouseup.dragdrop touchend.dragdrop', $.proxy(this, 'mouseUp'));
				return false;
			},
			mouseEnter: function(event){
				event || (event = window.event);
				event.preventDefault();
				return false;
			},
			mouseLeave: function(event){
				event || (event = window.event);
				event.preventDefault();
				return false;
			},
			mouseMove: function(event){
				event || (event = window.event);
				event.preventDefault();
				if(draggedObject){
					var dX = this.clientX(event) - initialMouseX,
						dY = this.clientY(event) - initialMouseY;
					this.setPosition(dX, dY);
				}
				return false;
			},
			mouseUp: function(event){ console.log('touchup', event, 'this', this);
				event || (event = window.event);
				event.preventDefault();
				$(this.docEl).off('mousemove.dragdrop mouseup.dragdrop touchmove.dragdrop touchend.dragdrop');
				this.release(event);
				return false;
			},
			setPosition: function(x, y){
				draggedObject.style.left = startX + x + 'px';
				draggedObject.style.top = startY + y + 'px';
			},
			capture: function(obj, event){ console.log('poly.capture');
				var e = dragEvent = this.createEvent('dragstart'), effectAllowed = '';
				e.dataTransfer = this.dataTransfer();
				e.target = event.target;
				this.trigger(obj, e);
				startX = obj.offsetLeft;
				startY = obj.offsetTop;
				originalObject = obj;
				effectAllowed = e.dataTransfer.effectAllowed.toLowerCase();
				if(effectAllowed == 'move'){
					draggedObject = obj;
				} else {
					draggedObject = obj.cloneNode(true);
					(this.docEl).appendChild(draggedObject);
				}
				
				draggedObject.style.position = 'absolute';
				draggedObject.style.left = obj.offsetLeft;
				draggedObject.style.top = obj.offsetTop;
				return this;
			},
			release: function(event){ console.log('poly.release');
				if(typeof draggedObject === 'undefined'){
					return;
				}
				var e;
				e = this.createEvent('dragend');
				e.dataTransfer = dragEvent.dataTransfer;
				e.target = dragEvent.target;
				e.clientX = this.clientX(event);
				e.clientY = this.clientY(event);
				this.trigger(originalObject, e);
				var effectAllowed = e.dataTransfer.effectAllowed.toLowerCase();
				if(effectAllowed === 'move'){
					draggedObject.style.position = draggedObject.style.left = draggedObject.style.top = '';
				} else {
					if(draggedObject.parentNode){
						draggedObject.parentNode.removeChild(draggedObject);
					}
				}
				droppableObject = null;
				var el = document.elementFromPoint(this.clientX(event), this.clientY(event));
				if($(el).attr('droppable') === "true"){ 
					droppableObject = el;
				}
				
				if(droppableObject){
					var dropEvent = this.createEvent('drop');
					dropEvent.dataTransfer = dragEvent.dataTransfer;
					dropEvent.target = event.target;
					this.trigger(droppableObject, dropEvent);
				}
				
				originalObject = draggedObject = droppableObject = dragEvent = null;
			},
			trigger: function(el, e){
				if(el.dispatchEvent){
					el.dispatchEvent(e);
				} else {
					el.fireEvent(e.eventType, e)
				}
				return this;
			},
			createEvent: function(name){
				var e;
				name = name.toLowerCase();
				if(document.createEvent){
					e = document.createEvent('HTMLEvents');
					e.initEvent(name, true, true);
				} else {
					e = document.createEventObject();
					e.eventType = 'on' + name;
				}
				
				return e;
			},
			dataTransfer: function(){
				return (function(){
					var items = {};
					
					function getFormat(format){
						format = format.toLowerCase();
						if(format === 'text'){
							format = 'text/plain';
						}
						if(format === 'url'){
							format = 'text/url-list';
						}
						return format;
					}
					
					return {
						dropEffect: 'copy',
						effectAllowed: 'copy',
						getData: function(format){
							return items[getFormat(format)];
						},
						setData: function(format, value){
							items[getFormat(format)] = value;
						},
						clearData: function(){
							if(typeof format === 'undefined'){
								items = {};
								return
							}
							delete items[getFormat(format)];
						}
					};
				})();
			}
		};
	}());
	
});