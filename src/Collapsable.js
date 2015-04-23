//= require_self
//= require partials/CollapsableAnimated
//= require partials/CollapsableTriggerStrategy
//= require partials/ClickCollapsableStrategy
//= require partials/HoverCollapsableStrategy
//= require partials/$.fn.collapsable.js
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