define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'PlumageRoot',
  'view/form/fields/Field',
  'view/form/fields/Select',
  'RequestManager',
  'text!view/form/fields/templates/TypeAhead.html',
  'text!view/form/fields/templates/TypeAheadMenu.html'
], function($, _, Backbone, Handlebars, Plumage, Field, Select, requestManager, template, menuTemplate) {

  return Plumage.view.form.fields.TypeAhead = Select.extend(
  /** @lends Plumage.view.form.fields.TypeAhead.prototype */
  {

    template: template,

    menuTemplate: menuTemplate,

    tagName: 'span',

    valueAttr: 'name',
    labelAttr: 'name',

    itemTemplate: '<li data-value="{{value}}" class="{{value}}{{#selected}} active{{/selected}}"><a href="#">{{label}}</a></li>',

    shown: false,

    /**
     * @constructs
     * @extends Plumage.view.form.fields.Select
     */
    initialize:function() {
      Select.prototype.initialize.apply(this, arguments);
      this.menuTemplate = this.initTemplate(menuTemplate);
    },

    events: {
      'keypress input': 'onKeyPress',
      'click button': 'onClearClick'
    },

    getTemplateData: function() {
      var data = Select.prototype.getTemplateData.apply(this, arguments),
        listModel = this.listModel,
        query = listModel ? listModel.get('query') : undefined;
      if (query) {
        data.value = query;
      }
      data.menuShown = this.menuShown;
      data.loading = this.loading;
      return data;
    },

    onRender:function () {
      Select.prototype.onRender.apply(this, arguments);
      this.renderMenu();
      this.updateCancelButton();
    },

    setValue: function(value) {
      Select.prototype.setValue.apply(this, arguments);
      this.listModel.set('query', undefined);
    },

    /*
     * SelectedId represents the current selection in the menu, not the current value
     */
    setSelectedId: function(newId) {
      if (newId !== this.selectedId) {
        this.selectedId = newId;
        this.updateMenu();
      }
    },

    update: function(isLoad) {
      Select.prototype.update.apply(this, arguments);
      if(this.listModel) {
        this.updateCancelButton();
      }
    },

    delegateEvents: function(events) {

      events = events || _.result(this, 'events');
      var selector = '.dropdown-menu';
      events = _.clone(events || {});
      events['mousedown ' +selector] = 'onMenuMouseDown';
      events['click ' +selector] = 'onMenuClick';

      Field.prototype.delegateEvents.apply(this, [events]);
    },

    undelegateEvents: function(events) {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
    },

    /*
     * Menu
     *****************/

    renderMenu: function() {
      var data = this.getTemplateData();
      this.$('.dropdown-menu').html(this.menuTemplate(data));
    },

    updateMenu: function() {
      if (this.listModel) {
        var liEls = this.$('.dropdown-menu').find('li');
        liEls.removeClass('active');
        if (this.selectedId) {
          var index = this.listModel.indexOf(this.listModel.getById(this.selectedId));
          if (index !== -1) {
            $(liEls[index]).addClass('active');
          } else {
            this.selectedId = undefined;
          }
        }
      }
    },

    showMenu: function() {
      this.$('> span').addClass('open');
      this.menuShown = true;
    },

    hideMenu: function() {
      this.$('> span').removeClass('open');
      this.menuShown = false;
    },

    getItemData: function(instance) {
      return {
        value: instance.id,
        label: instance.get(this.labelAttr),
        selected: instance.id === this.selectedId
      };
    },

    next: function (event) {
      var listModel = this.listModel,
        index = 0;

      if (listModel && listModel.size()) {
        if (this.selectedId) {
          index = listModel.indexOf(listModel.getById(this.selectedId));
          index = (index+1) % listModel.size();
        }
        this.setSelectedId(listModel.at(index).get('name'));
      }
    },

    prev: function (event) {
      var listModel = this.listModel,
        index = 0;

      if (listModel && listModel.size()) {
        if (this.selectedId) {
          index = listModel.indexOf(listModel.getById(this.selectedId));
          index -= 1;
          index = index < 0 ? index + listModel.size() : index;
        }
        this.setSelectedId(listModel.at(index).get('name'));
      }
    },

    select: function () {
      this.setValue(this.selectedId);
      this.listModel.set('query', undefined);
      this.getInputEl().blur();
      this.hideMenu();
      this.triggerChange();
    },

    resetInput: function() {
      this.$('input').val(this.getValue());
    },

    /*
     * Event Handlers
     *****************/

    onModelLoad: function (collection, resp) {
      Select.prototype.onModelLoad.apply(this, arguments);
      this.update(true);
    },

    onKeyDown: function (e) {
      this.suppressKeyPressRepeat = !$.inArray(e.keyCode, [40,38,9,13,27]);

      if (!this.shown) { return; }

      e.stopPropagation();
      switch(e.keyCode)
      {
      case 9: // tab
        e.preventDefault();
        break;
      case 13: // enter
        if (this.shown || this.loading) {
          e.preventDefault();
          this.select();
        }
        break;
      case 27: // escape
        if (this.shown) {
          e.preventDefault();
          this.resetInput();
          this.hideMenu();
        }
        break;
      case 38: // up arrow
        e.preventDefault();
        this.prev();
        break;
      case 40: // down arrow
        e.preventDefault();
        this.next();
        break;
      }
    },

    onChange: function (e) {
      //do nothing
    },

    onInput: function (e) {
      this.listModel.set({query: this.getValueFromDom()});
      this.updateQuery();
      this.showMenu();
    },

    onFocus: function (e) {
      this.updateQuery();
      this.showMenu();
    },

    onBlur: function (e) {
      this.hideMenu();
      this.resetInput();
    },

    /**
     * Prevent onBlur when clicking the menu.
     */
    onMenuMouseDown: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    onMenuClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      var li = $(e.target).parent('li');
      if (li.length) {
        var value = li.data('value');
        if (value) {
          this.setSelectedId(value);
          this.select();
        }
      }
    },

    updateQuery: function() {
      if (!this.listModel) {
        return;
      }
      requestManager.loadModel(this.listModel, {
        data: {
          limit: 10, //change this to actual value
          offset: 0
        }
      });
      this.loading = true;
    },

    updateCancelButton: function() {
      if (!this.$input) {
        return;
      }
      var value = this.$input.val();
      if (value.length === 0) {
        this.$('button').attr('disabled', 'disabled');
      } else {
        this.$('button').removeAttr('disabled');
      }

    },

    onClearClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var value = this.getValue();
      if (value && value.length > 0) {
        this.setValue('');
        this.updateQuery();
        this.hideMenu();
        this.blur();
        this.update();
        this.triggerChange();
      }
      this.updateCancelButton();
    },

    /**
     * For override
     */

    setModel: function(rootModel, parentModel) {
      Select.prototype.setModel.apply(this, arguments);
    },

    /*
     * Override Select
     ********************************/

    onListModelChange: function(event, model) {
      //don't update, just rerender the menu
      this.renderMenu();
    },

    onListModelLoad: function(listModel, request) {
      var query = listModel.get('query') ? listModel.get('query') : '';

      //discard result if query has already changed
      if (query !== this.$('input').val()) {
        return;
      }

      if (this.listModel.size() && (!this.selectedId || this.listModel.getById(this.selectedId) === undefined) ) {
        this.selectedId = this.listModel.at(0).id;
        console.log('autoselecting: ' + this.selectedId);
      }
      this.loading = false;
      this.renderMenu();
    }
  });
});