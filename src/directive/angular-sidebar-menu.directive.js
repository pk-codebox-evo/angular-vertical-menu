
    'use strict';
    
angular.module('angularSidebarMenu').directive('sidebarMenu', SidebarMenu);

/**
 * 
 * 
 */
function SidebarMenu() {

    function compile( element, attributes) {
	// get the height of an individual sub menu item, to be used in
	// animation definition
	var height = element.find('li')[1].offsetHeight;
	return {
	        post: function postLink(scope, iElement, iAttrs, controller) {
	            if (controller.config.animation) {
	        	controller.setupAnimation(height);
	            }
	        }
	};
    }
    
    var ddo = {
	restrict : 'EA',
	replace : true,
	scope : {
	},
	controller : SidebarMenuController,
	controllerAs : 'vm',
	bindToController : {
	    id : '@',
	    config : '='
	},
	templateUrl : 'templates/angular-sidebar-menu.directive.html',
	compile : compile
    };
    return ddo;
}

SidebarMenuController.$inject = [ '$rootScope', '$location' ];

/**
 * 
 * @param $scope
 * @param $location
 * @param $timeout
 */
function SidebarMenuController($rootScope, $location) {
    
    var vm = this;
    /**
     * Default bullet icon associated with the second level items with no
     * specified icon
     */
    vm.DEFAULT_BULLET_ICON = 'fa-circle-o';
    
    var DEFAULT_ANIMATION = {
	    duration : 0.4,
	    timing : 'ease'
    }
    
    function getKeyframesRules(item, height, id) {
	var height = height * item.children.length;
    	var expandRule = '@-webkit-keyframes expand-' + id + ' { from { max-height: 0px; } to { max-height: ' + height + 'px; } } \
    		    @keyframes expand-' + id + ' { from { max-height: 0px; } to { max-height: ' + height + 'px; } }';
    	var collapseRule = '@-webkit-keyframes collapse-' + id + ' { from { max-height: ' + height + 'px; } to { max-height: 0px; } } \
    		    @keyframes collapse-' + id + ' { from { max-height: ' + height + 'px; } to { max-height: 0px; }}';
    	return expandRule + collapseRule;	
    };
    
    function getAnimationRules(id){
	var animation = angular.copy(DEFAULT_ANIMATION);
	if (angular.isObject(vm.config.animation)) {
	    animation = angular.extend({}, animation, vm.config.animation);
	}
	
	return '.sidebar-menu .sbm-collapse-' + id + ' { \
			-webkit-animation-duration: ' + animation.duration + 's; \
			animation-duration: ' + animation.duration + '5s; \
			-webkit-animation-timing-function: ' + animation.timing + '; \
                	animation-timing-function: ' + animation.timing + '; \
        		-webkit-animation-fill-mode: backwards; \
                	animation-fill-mode: backwards; \
        		overflow: hidden; \
        		opacity: 1; \
        	} \
                .sidebar-menu .sbm-collapse-' + id + '.ng-enter {\
                    visibility: hidden;\
                    -webkit-animation-name: expand-' + id + ';\
                            animation-name: expand-' + id + ';\
                    -webkit-animation-play-state: paused;\
                            animation-play-state: paused;\
                }\
        	.sidebar-menu .sbm-collapse-' + id + '.ng-enter.ng-enter-active {\
                    visibility: visible;\
                    -webkit-animation-play-state: running;\
                            animation-play-state: running;\
        	}\
                .sidebar-menu .sbm-collapse-' + id + '.ng-leave {\
                    -webkit-animation-name: collapse-' + id + ';\
                            animation-name: collapse-' + id + ';\
                    -webkit-animation-play-state: paused;\
                            animation-play-state: paused;\
                }\
                .sidebar-menu .sbm-collapse-' + id + '.ng-leave.ng-leave-active {\
                    -webkit-animation-play-state: running;\
                            animation-play-state: running;\
                }';
    }
    
    
    vm.setupAnimation = function(height) {
	    var styleElt = document.createElement('style');
	    styleElt.type = 'text/css';
	    var items = vm.config.data;
	    var head = document.head || document.getElementsByTagName('head')[0];
	    var css, item, id = null;
	    for (var i=0; i < items.length; i++) {
		item = items[i];
		if (item.children && item.children.length > 0) {
		    id = vm.getId(i);
		    styleElt.appendChild(document.createTextNode(getAnimationRules(id)));
		    css = getKeyframesRules(items[i], height, id);
		    styleElt.appendChild(document.createTextNode(css));
		}
	    }
	    head.appendChild(styleElt);
    };
    
    /**
     * 
     */
    vm.toggle = function(event, item) {
	event.stopPropagation();
	if (vm.hasChildren(item)) {
	    item.active = !item.active;
	} else if (item.href) {
	    $rootScope.$evalAsync(function() {
		$location.path(item.href);
	    });
	} else if (item.callback) {
	    item.callback(item);
	}
	return false;
    };
    
    /**
     * Returns <code>true</code> if the specified item has some children,
     * <code>false</code> otherwise.
     * 
     * @param {Object}
     *                item - A menu item.
     * @returns {boolean} <code>true</code> if the item has some children,
     *          <code>false</code> otherwise
     */
    vm.hasChildren = function(item) {
	return !!item.children;
    };

    /**
     * Returns the icon associated with the specified item or if none exists the
     * default bullet icon value.
     * 
     * @param {Object}
     *                item - A menu item.
     * @returns {string} the icon associated with the item
     */
    vm.getItemIcon = function(item) {
	return item.icon || vm.getDefaultIcon();
    };
    
    /**
     * Returns the default bullet icon specified by the
     * <code>config.default.icon</code> property or if none is specified the
     * internally defined default bullet icon.
     * 
     * @returns {string} the default bullet icon
     */
    vm.getDefaultIcon = function(){
	var icon = vm.DEFAULT_BULLET_ICON;
	if (vm.config.default && vm.config.default.icon){
	    icon = vm.config.default.icon;
	}
	return icon ;
    };
    /**
     * 
     */
    vm.getId = function(index){
	var id = vm.id || '';
	id += index;
	return id;
    }
}

