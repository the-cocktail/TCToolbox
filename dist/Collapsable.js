





if(!this.TCT) this.TCT = {};
this.TCT.Collapsable = (function(TCT){

  var Collapsable = function(element,options) {
    this.options = $.extend({}, this.defaults, options);
    this.element = $(element);
    this.expanded = false;
    this.triggers = this.element.find(this.options.triggers);
    this.content = this.element.find(this.options.content);
    this.group = this.options.group ? this.options.group : this.element.data("collapsable-group");
    this.addElementClasses();
    this.init();
  };

  Collapsable.triggerStrategies = {};

  //extiendo mis funciones en mi prototipo
  $.extend(Collapsable.prototype,{
    defaults:{
      triggers: "[data-collapsable-toggle]",
      content: "[data-collapsable-content]",
      expandedClass: "tct-collapsable--expanded",
      collapsedClass: "tct-collapsable--collapsed",
      contentClass: "tct-collapsable__content",
      triggerWith: "click",
      animated: false,
      group: undefined,
      goToLink: false,
      offset: 0
    },
    init:function() {
      this.setElementClasses();
      this.notify();
      var triggerStrategy = this.getTriggerStrategy();
      triggerStrategy.init();
    },
    getTriggerStrategy: function(){
      var triggerClass = Collapsable.triggerStrategies[this.options.triggerWith];
      return new triggerClass(this);
    },
    addElementClasses: function(){
      this.content
            .addClass(this.options.contentClass);
    },
    setElementClasses: function(){
      var removed, added;
      if(this.expanded){
        removed = this.options.collapsedClass;
        added = this.options.expandedClass;
      }else{
        removed = this.options.expandedClass;
        added = this.options.collapsedClass;
      }
      this.element.addClass(added);
      this.element.removeClass(removed);
    },
    notify:function(){
      this.element.trigger($.Event(this.expanded ? 'expanded' : 'collapsed'));
    },
    collapse: function(){
      if(!this.expanded) return;
      this.changeState(false);
    },
    expand: function() {
      if(this.expanded) return;
      this.closeGroup();
      this.changeState(true);

      if(this.options.goToLink){
        $("."+this.options.contentClass+".visible").css({"display": "none"});
        $("html, body").animate({ scrollTop: ($(this.element).offset().top - this.options.offset) }, 300);
        $("."+this.options.contentClass+".visible").css({"display": "block"});
      }
    },
    closeGroup: function(){
      if(this.group){
        var group_elements = $("[data-collapsable-group="+this.group+"]").filter("."+this.options.expandedClass);

        group_elements.each(function(){
          element = $(this).data("collapsable");
          if(element.expanded)
            element.collapse();
          else
            element.expand();
        });
      }
    },
    changeState: function(state){
      this.expanded = state;
      this.setElementClasses();
      this.notify();
    }
  });
  return Collapsable;
})();
this.TCT.CollapsableAnimated = (function(sup){
  var CollapsableAnimated = function(element, options){
    this.defaults = $.extend({}, sup.prototype.defaults, this.defaults);
    this.uid = _.uniqueId();
    this.windowSize = {};
    this.updateWindowSize();
    _.bindAll(this, 'onWindowResize');
    sup.call(this, element, options);
  };

  var tmp = function(){};
  tmp.prototype = sup.prototype;
  CollapsableAnimated.prototype = new tmp();
  CollapsableAnimated.prototype.constructor = CollapsableAnimated;

  $.extend(CollapsableAnimated.prototype, {
    defaults: {
      animatedClass: "tct-collapsable__content--animated",
      noTransitionClass: "tct-collapsable__content--no-transition"
    },
    init: function(){
      sup.prototype.init.call(this);
    },
    addElementClasses: function(){
      this.element.find(this.options.content)
            .addClass(this.options.animatedClass);
      sup.prototype.addElementClasses.call(this);
    },
    expand: function(){
      this.calcContentHeight();
      sup.prototype.expand.call(this);
      this.startResizeListening();
    },
    collapse: function(){
      this.stopResizeListening();
      this.content.css("height", "");
      sup.prototype.collapse.call(this);
    },
    onWindowResize: function(e){
      var ww = $(window).width(),
          wh = $(window).height();
      if(this.expanded && (this.windowSize.width != ww || this.windowSize.height != wh)){
        this.updateWindowSize(ww, wh);
        this.calcContentHeight();
      }
    },
    updateWindowSize: function(ww, wh){
      this.windowSize.width = ww || $(window).width();
      this.windowSize.height = wh || $(window).height();
    },
    stopResizeListening: function(){
      $(window).off(".resize_collapsable_"+this.uid);
    },
    startResizeListening: function(){
      $(window).on("resize.resize_collapsable_"+this.uid, _.debounce(this.onWindowResize, 100));
    },
    calcContentHeight: function(transition){
      var element = this.content,
          current_height = element.outerHeight(),
          noTransitionClass = this.options.noTransitionClass,
          real_height;
      element.addClass(noTransitionClass).css("height","auto");
      real_height = element.outerHeight();
      if(transition === false){
        element
            .css("height",real_height);
        _.defer(function(){
          element.removeClass(noTransitionClass);
        });
      }else{
        element
          .css("height",current_height)
            .removeClass("hidden").addClass("visible");
        _.defer(function(){
          element
            .removeClass(noTransitionClass)
            .css("height", real_height);
        });
      }
    }
  });

  return CollapsableAnimated;
})(TCT.Collapsable);
this.TCT.CollapsableTriggerStrategy = (function(){
  var CollapsableTriggerStrategy = function(collapsable, options){
    this.options = $.extend({}, this.defaults, options);
    this.collapsable = collapsable;
  };

  $.extend(CollapsableTriggerStrategy.prototype, {
    init: function(){
      this.listen();
    }
  });

  return CollapsableTriggerStrategy;
})();

this.TCT.ClickCollapsableStrategy = (function(sup){
  
  var ClickCollapsableStrategy = function(collapsable){
    _.bindAll(this, "onToggle");
    sup.call(this, collapsable);
  };

  var tmp = function(){};
  tmp.prototype = sup.prototype;
  ClickCollapsableStrategy.prototype = new tmp();
  ClickCollapsableStrategy.prototype.constructor = ClickCollapsableStrategy;

  $.extend(ClickCollapsableStrategy.prototype, {
    listen: function(){
      this.collapsable.triggers.on('click',this.onToggle);
    },
    onToggle:function(e){
      e.preventDefault();
      if(this.collapsable.expanded){
        this.collapsable.collapse();
      }else{
        this.collapsable.expand();
      }
    }
  });

  TCT.Collapsable.triggerStrategies.click = ClickCollapsableStrategy;

  return ClickCollapsableStrategy;

})(this.TCT.CollapsableTriggerStrategy);
this.TCT.HoverCollapsableStrategy = (function(sup){
  
  var HoverCollapsableStrategy = function(collapsable){
    _.bindAll(this, "onTap", "onMouseOver", "onMouseOut");
    this.touched = false;
    sup.call(this, collapsable);
  };

  var tmp = function(){};
  tmp.prototype = sup.prototype;
  HoverCollapsableStrategy.prototype = new tmp();
  HoverCollapsableStrategy.prototype.constructor = HoverCollapsableStrategy;

  $.extend(HoverCollapsableStrategy.prototype, {
    listen: function(){
      this.collapsable.triggers
        .on('mouseenter',this.onMouseOver)
        .on('tap', this.onTap);
      this.collapsable.element
        .on('mouseleave',this.onMouseOut)
        .on('touchstart touchmove touchend', function (event) {
            event.preventDefault();
        });
    },
    onMouseOver: function(e){
      var self = this;
      _.delay(function(){
        if(self.touched){
          e.preventDefault();
          self.touched = false;
        }else{
          self.collapsable.expand();
        }        
      }, 150);
    },
    onMouseOut: function(e){
      var self = this;
      _.delay(function(){
        if(self.touched){
          e.preventDefault();
          self.touched = false;
        }else{
          self.collapsable.collapse();
        }        
      }, 150);
    },
    onTap:function(e){
      this.touched = true;
      e.preventDefault();
      if(this.collapsable.expanded){
        this.collapsable.collapse();
      }else{
        this.collapsable.expand();
      }
    }
  });

  TCT.Collapsable.triggerStrategies.hover = HoverCollapsableStrategy;

  return HoverCollapsableStrategy;

})(this.TCT.CollapsableTriggerStrategy);
$.fn.collapsable = function(options){
  var collapsableClass = (options && options.animated) ? TCT.CollapsableAnimated : TCT.Collapsable;
  return $(this).each(function(){
    var self = $(this);
    if(!self.data("collapsable")){
      self.data("collapsable", new collapsableClass(this, options));
    }
  });
};