define([
  'jquery',
  'underscore',
  'backbone',
  'PlumageRoot',
  'view/ModelView',
  'view/View',
  'text!view/templates/Popover.html'
], function($, _, Backbone, Plumage, ModelView, View, template) {

  return Plumage.view.Popover = ModelView.extend({

    template: template,

    className: 'popover fade',

    title: undefined,

    content: undefined,

    targetEl: undefined,

    /**
     * overrides automatic positioning. Values relative to targetEl's offset
     * eg [x, y]
     */
    position: undefined,

    placement: 'right',

    dynamicPlacement: true,

    events: {
      'mouseover': 'onMouseOver',
      'mouseout': 'onMouseOut',
      'click a': 'onLinkClick'
    },

    initialize: function(options) {


      ModelView.prototype.initialize.apply(this, arguments);

      if (this.title) {
        this.subViews = [
          new ModelView({selector: '.popover-title', template: this.title, replaceEl: true})
        ].concat(this.subViews || []);
      }

      if (this.content) {
        this.setContent(this.content);
      }
      if (this.targetEl) {
        var  targetEl = this.targetEl;
        delete this.targetEl;
        this.setTargetEl(targetEl);
      }
    },

    getTemplateData: function() {
      var data = ModelView.prototype.getTemplateData.apply(this, arguments);
      data.hasTitle = this.title !== undefined;
      return data;
    },

    setTargetEl: function(targetEl) {
      if (this.targetEl) {
        this.targetEl.removeClass('popovered');
      }
      this.targetEl = $(targetEl);
      if (this.$el.is(':visible')) {
        this.targetEl.addClass('popovered');
      }
    },

    setContent: function(content) {
      if (this.content && this.content.off) {
        this.content.off('afterRender', this.onAfterContentRender);
        this.subViews = _.select(this.subViews, function(view){
          return view.selector !== '.popover-content';
        });
      }

      if (typeof content === 'string') {
        content = new View({template: content});
      } else {
        content = new Plumage.ViewBuilder().buildView(content);
      }
      content.selector = '.popover-content';
      content.on('afterRender', this.onAfterContentRender.bind(this));
      this.content = content;

      this.subViews.push(this.content);
    },

    onRender: function() {
      ModelView.prototype.onRender.apply(this, arguments);

      if (this.$el.closest('html').length === 0) {
        $('body').append(this.$el);
      }
    },

    render: function() {
      ModelView.prototype.render.apply(this, arguments);
      this.updatePosition();
    },

    show: function() {
      this.cancelHide();
      this.render();
      if (!this.$el.hasClass('in')) {
        this.targetEl.addClass('popovered');
        this.$el.show();
        this.$el.addClass('in');
        this.onShow();
      }
    },

    cancelHide: function() {
      clearTimeout(this.hideTimeout);
      clearTimeout(this.fadeTimeout);
    },

    hide: function() {
      var el = this.$el, me = this;
      if (el.hasClass('in')) {
        this.cancelHide();
        this.fadeTimeout = setTimeout(function() {
          me.targetEl.removeClass('popovered');
          el.removeClass('in');
          me.onHide();
          me.hideTimeout = setTimeout(function() {
            el.hide();

          },200);
          me.trigger('hide', me);
        }, 300);
      }
    },

    hideIfOut: function(el, newEl) {
      el = $(el);
      newEl = $(newEl);

      if ($.contains(el, newEl) ||  // if newEl is a child element, it's not really out
        newEl.closest('.popover').is(this.$el)  //  don't hide if mouse moved to popover
      ) {
        return;
      }
      if (!newEl.is(this.targetEl)) {
        this.hide();
      }
    },

    /**
     * Event Handlers
     */
    update: function () {
      //do nothing
    },

    onMouseOver: function() {
      this.cancelHide();
    },

    onMouseOut: function(e) {
      var newEl = $(e.toElement || e.relatedTarget);
      if ($(this.targetEl).has(newEl).length > 0 || newEl.closest('.popover').is(this.$el)) {
        return;
      }

      $(this.targetEl).removeClass('active');
      this.hide();
    },

    onAfterContentRender: function() {
      this.updatePosition();
    },

    /**
     * Helpers
     */

    updatePosition: function () {
      var targetEl = this.targetEl;
      var placement = this.placement;

      var screenHeight = $(window).height();
      var screenWidth = $(window).width();

      var position = this.getPosition(targetEl, placement);

      //switch sides if not enough room
      if (this.dynamicPlacement &&
          ((placement === 'left' || placement === 'right') &&
          (position.left < 0 || position.left + this.$el.width() > screenWidth) ||
          (placement === 'top' || placement === 'bottom') &&
          (position.top < 0 || position.top + this.$el.height() > screenHeight))
      ) {
        placement = this.getOppositePlacement(placement);
        position = this.getPosition(targetEl, placement);
      }

      this.$el.removeClass('top right bottom left');
      this.$el.addClass(placement);

      this.$el.css({top: position.top, left: position.left});
      if (position.arrowLeft  !== undefined) {
        this.$('.arrow').css({left: position.arrowLeft});
      }
      if (position.arrowTop  !== undefined) {
        this.$('.arrow').css({top: position.arrowTop});
      }
    },

    getPosition: function(targetEl, placement) {
      var el = $(targetEl), elOffset = el.offset(), left, top, arrowTop, arrowLeft;

      var bbox = el[0].getBoundingClientRect(),
        targetWidth = bbox.width,
        targetHeight = bbox.height,
        screenWidth = $(window).width(),
        screenHeight = $(window).height(),
        width = this.$el.width(),
        height = this.$el.height();


      if (placement === 'top' || placement === 'bottom') {
        if (placement === 'top') {
          top = elOffset.top - this.$el.height();
        } else {
          top = elOffset.top + targetHeight;
        }
        left = elOffset.left + targetWidth/2 - width/2;
        if (left > screenWidth - width || left < 0) {
          var newLeft = Math.max(Math.min(left, screenWidth - width), 0);
          arrowTop = left - newLeft + width/2;
          left = newLeft;
        }
      } else if (placement === 'left' || placement === 'right') {

        if (placement === 'left') {
          left = elOffset.left - width;
        } else {
          left = elOffset.left + targetWidth;
        }
        top = elOffset.top + targetHeight/2 - height/2;
        if (top > screenHeight - height || top < 0) {
          var newTop = Math.max(Math.min(top, screenHeight - height), 0);
          arrowTop = top - newTop + height/2;
          top = newTop;
        }
      } else {
        throw 'Invalid placement';
      }

      var position = this.position;
      if (position) {
        if (placement === 'top' || placement === 'bottom') {
          left += position[0] - targetWidth/2;
          top += position[1];
        } else {
          left += position[0];
          top += position[1] - targetHeight/2;
        }
      }

      return {top: top, left: left, arrowTop: arrowTop, arrowLeft: arrowLeft};
    },

    getOppositePlacement: function(placement) {
      switch(placement)
      {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      }
      throw 'Invalid placement';
    }
  });
});

