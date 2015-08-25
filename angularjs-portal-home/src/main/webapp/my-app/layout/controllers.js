'use strict';

define(['angular', 'jquery'], function(angular, $) {

    var app = angular.module('my-app.layout.controllers', []);

    app.controller('DefaultViewController', [
      '$scope',
      '$location',
      '$localStorage',
      '$sessionStorage',
      'APP_FLAGS',
      function($scope, $location, $localStorage, $sessionStorage, APP_FLAGS){
        $scope.loading = [];
        if(!APP_FLAGS[$localStorage.layoutMode]) {
          //layout mode set weird, reset to default
          $localStorage.layoutMode = APP_FLAGS.defaultView;
        }
        $location.path('/' + $localStorage.layoutMode);
    }]);

    app.controller('LayoutController', [
        '$location',
        '$localStorage',
        '$sessionStorage',
        '$scope',
        '$rootScope',
        'layoutService',
        'miscService',
        'sharedPortletService',
        function($location,
                 $localStorage,
                 $sessionStorage,
                 $scope,
                 $rootScope,
                 layoutService,
                 miscService,
                 sharedPortletService) {
            if(typeof $rootScope.layout === 'undefined' || $rootScope.layout == null) {

                $rootScope.layout = [];
                $scope.layoutEmpty = false;

                layoutService.getLayout().then(function(data){
                    $rootScope.layout = data.layout;
                    if(data.layout && data.layout.length == 0) {
                        $scope.layoutEmpty = true;
                    }
                });
            }

            this.portletType = function portletType(portlet) {
                if (portlet.staticContent != null
                    && portlet.altMaxUrl == false) {
                    return "SIMPLE";
                } else if(portlet.altMaxUrl == false && $localStorage.webPortletRender){
                    return "EXCLUSIVE";
                }else {
                    return "NORMAL";
                }
            };

            this.maxStaticPortlet = function gotoMaxStaticPortlet(portlet) {
                sharedPortletService.setProperty(portlet);
                $location.path('/static/'+portlet.fname);
            };

            this.directToPortlet = function directToPortlet(url) {
                $location.path(url);
            };
            this.removePortlet = function removePortletFunction(nodeId, title) {
                layoutService.removeFromHome(nodeId, title).success(function(){
                    $scope.$apply(function(request, text){
                        var result = $.grep($scope.layout, function(e) { return e.nodeId === nodeId});
                        var index = $.inArray(result[0], $scope.layout);
                        //remove
                        $scope.layout.splice(index,1);
                        if($sessionStorage.marketplace != null) {
                            var marketplaceEntries = $.grep($sessionStorage.marketplace, function(e) { return e.fname === result[0].fname});
                            if(marketplaceEntries.length > 0) {
                                marketplaceEntries[0].hasInLayout = false;
                            }
                        }
                    });
                }).error(
                function(request, text, error){
                    alert('Issue deleting ' + title + ' from your list of favorites, try again later.');
                });
            };

            $scope.sortableOptions = {
                delay:250,
                cursorAt : {top: 30, left: 30},
                stop: function(e, ui) {
                    if(ui.item.sortable.dropindex != ui.item.sortable.index) {

                        var node = $scope.layout[ui.item.sortable.dropindex];
                        console.log("Change happened, logging move of " + node.fname + " from " + ui.item.sortable.index + " to " + ui.item.sortable.dropindex);
                        //index, length, movingNodeId, previousNodeId, nextNodeId
                        var prevNodeId = ui.item.sortable.dropindex != 0 ? $scope.layout[ui.item.sortable.dropindex - 1].nodeId : "";
                        var nextNodeId = ui.item.sortable.dropindex != $scope.layout.length - 1 ? $scope.layout[ui.item.sortable.dropindex + 1].nodeId : "";
                        layoutService.moveStuff(ui.item.sortable.dropindex, $scope.layout.length, node.nodeId, prevNodeId, nextNodeId);

                    }
                }
            };

        }]);


    app.controller('WidgetController', [
        '$location',
        '$localStorage',
        '$sessionStorage',
        '$scope',
        '$rootScope',
        'layoutService',
        'miscService',
        'sharedPortletService',
        function($location,
                 $localStorage,
                 $sessionStorage,
                 $scope,
                 $rootScope,
                 layoutService,
                 miscService,
                 sharedPortletService) {
            if(typeof $rootScope.layout === 'undefined' || $rootScope.layout == null) {

                $rootScope.layout = [];

                layoutService.getLayout().then(function(data){
                    $rootScope.layout = data.layout;
                });
            }

            this.portletType = function portletType(portlet) {
                if (portlet.widgetType) {
                    if('option-link' === portlet.widgetType) {
                        return "OPTION_LINK";
                    } else if('weather' === portlet.widgetType) {
                        return "WEATHER";
                    } else if('generic' === portlet.widgetType) {
                        return "GENERIC";
                    } else if('rss' === portlet.widgetType) {
                        return "RSS";
                    } else {
                        return "WIDGET";
                    }

                }else if(portlet.pithyStaticContent != null) {
                    return "PITHY";
                } else if (portlet.staticContent != null
                    && portlet.altMaxUrl == false) {
                    return "SIMPLE";
                } else {
                    return "NORMAL";
                }
            };

            this.maxStaticPortlet = function gotoMaxStaticPortlet(portlet) {
                sharedPortletService.setProperty(portlet);
                $location.path('/static/'+portlet.fname);
            };

            this.directToPortlet = function directToPortlet(url) {
                $location.path(url);
            };
            this.removePortlet = function removePortletFunction(nodeId, title) {
                layoutService.removeFromHome(nodeId, title).success(function(){
                    $scope.$apply(function(request, text){
                        var result = $.grep($scope.layout, function(e) { return e.nodeId === nodeId});
                        var index = $.inArray(result[0], $scope.layout);
                        //remove
                        $scope.layout.splice(index,1);
                        if($sessionStorage.marketplace != null) {
                            var marketplaceEntries = $.grep($sessionStorage.marketplace, function(e) { return e.fname === result[0].fname});
                            if(marketplaceEntries.length > 0) {
                                marketplaceEntries[0].hasInLayout = false;
                            }
                        }
                    });
                }).error(
                function(request, text, error){
                    alert('Issue deleting ' + title + ' from your list of favorites, try again later.');
                });
            };

            $scope.sortableOptions = {
                delay:250,
                cursorAt : {top: 30, left: 30},
                stop: function(e, ui) {
                    if(ui.item.sortable.dropindex != ui.item.sortable.index) {

                        var node = $scope.layout[ui.item.sortable.dropindex];
                        console.log("Change happened, logging move of " + node.fname + " from " + ui.item.sortable.index + " to " + ui.item.sortable.dropindex);
                        //index, length, movingNodeId, previousNodeId, nextNodeId
                        var prevNodeId = ui.item.sortable.dropindex != 0 ? $scope.layout[ui.item.sortable.dropindex - 1].nodeId : "";
                        var nextNodeId = ui.item.sortable.dropindex != $scope.layout.length - 1 ? $scope.layout[ui.item.sortable.dropindex + 1].nodeId : "";
                        layoutService.moveStuff(ui.item.sortable.dropindex, $scope.layout.length, node.nodeId, prevNodeId, nextNodeId);

                    }
                }
            };

        }]);

    app.controller('NewStuffController', ['$scope', 'layoutService', function ($scope, layoutService){
        $scope.newStuffArray = [];
        layoutService.getNewStuffFeed().then(function(result){
            $scope.newStuffArray = result;
        });

        this.show = function(stuff) {
            var date = new Date(stuff.expireYr, stuff.expireMon, stuff.expireDay);
            var today = new Date();
            return date >= today;
        }
    }]);
    
    app.controller('GoToAppsController', ['$location',function($location){
      this.redirectToApps = function(){$location.path("/apps");};
    }]);

    app.controller('ToggleController',[
        '$localStorage',
        '$scope',
        '$location',
        'miscService',
        'APP_FLAGS', function($localStorage,
                              $scope,
                              $location,
                              miscService,
                              APP_FLAGS){
            //scope functions
            $scope.switchMode = function(mode) {
                $localStorage.layoutMode = mode;
                $location.path('/' + mode);
                miscService.pushGAEvent('Widgets', 'View', mode);
            };

            $scope.modeIs = function(mode) {
                return $localStorage.layoutMode === mode;
            };

            //local functions
            this.init = function() {
                $scope.toggle = APP_FLAGS.enableToggle;
                if($localStorage.layoutMode
                    && $location.url().indexOf($localStorage.layoutMode) == -1) {
                    //opps, we are in the wrong mode, switch!
                    if(APP_FLAGS[$localStorage.layoutMode]) { //check to make sure that mode is active
                        $location.path('/' + $localStorage.layoutMode);
                    } else {
                        console.log("Something is weird, resetting to default layout view");
                        $scope.switchMode(APP_FLAGS.defaultView);
                    }
                } else {
                    //all is well, ga pageview, go
                    miscService.pushPageview();
                }
            };
            this.init();
        }
    ]);

    return app;


    // replacement position factory for tooltip fix
    angular.module('ui.bootstrap.position',[]).factory('$position', ['$document', '$window', function ($document, $window) {
        function getStyle(el, cssprops) {
            if (el.currentStyle) { //IE
                return el.currentStyle[cssprops];
            } else if ($window.getComputedStyle) {
                return $window.getComputedStyle(el)[cssprops];
            }
            // finally try and get inline style
            return el.style[cssprops];
        }

        /**
         * Checks if a given element is statically positioned
         * @param element - raw DOM element
         */
        function isStaticPositioned(element) {
            return (getStyle(element, 'position') || 'static' ) === 'static';
        }

        /**
         * returns the closest, non-statically positioned parentOffset of a given element
         * @param element
         */
        var parentOffsetEl = function (element) {
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

        return {
        /*
         * Privides read-only equivalent of jQuery's position function:
         * http://api.jquery.com/position/
         */
            position: function (element) {
                var elBCR = this.offset(element);
                var offsetParentBCR = { top: 0, left: 0 };
                var offsetParentEl = parentOffsetEl(element[0]);
                if (offsetParentEl != $document[0]) {
                 offsetParentBCR = this.offset(angular.element(offsetParentEl));
                 offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                 offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                }

                var boundingClientRect = element[0].getBoundingClientRect();

                return {
                 width: boundingClientRect.width || element.prop('offsetWidth'),
                 height: boundingClientRect.height || element.prop('offsetHeight'),
                 top: elBCR.top - offsetParentBCR.top,
                 left: elBCR.left - offsetParentBCR.left
                };
            },

        /*
         * Provides read-only equivalent of jQuery's offset function:
         * http://api.jquery.com/offset/
         */
            offset: function (element) {
                var boundingClientRect = element[0].getBoundingClientRect();
                return {
                    width: boundingClientRect.width || element.prop('offsetWidth'),
                    height: boundingClientRect.height || element.prop('offsetHeight'),
                    top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                    left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                };
            },

        /*
         * Provides coordinates for the targetEl in relation to hostEl
         */
             positionElement: function (hostEl, targetEl, positionStr, appendToBody) {
                var positionStrParts = positionStr.split('-');
                var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

                var hostElPos, targetElWidth, targetElHeight, targetElPos, windowEl;
                hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
                targetElWidth = targetEl.prop('offsetWidth');
                targetElHeight = targetEl.prop('offsetHeight');
                windowEl = {width: $window.outerWidth };

                var shiftWidth = {
                    center: function() {
                        var toReturn = hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                        // This is the fix for running off the sides of the Screens
                        if (appenToBody) {
                            var targetElRight = toReturn + targetElWidth;
                            //if the host is within the window but a negative
                            if (toReturn < 0) {
                                targetEl.addClass("top-offset-left");
                                toReturn = 0;
                            }
                        }
                        return toReturn;
                    },
                    left: function() {
                        return hostElPos.left;
                    },
                    right: function() {
                        return hostElPos.left + hostElPos.width;
                    }
                };

                var shiftHight = {
                    center: function () {
                                return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                    },
                    top: function () {
                        return hostElPos.top;
                    },
                    bottom: function () {
                        return hostElPos.top + hostElPos.height;
                    }
                };
                switch (pos0) {
                    case 'right':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: shiftWidth[pos0]()
                        };
                        break;
                    case 'left':
                        targetElPos = {
                            top: shiftHeight[pos1](),
                            left: hostElPos.left - targetElWidth
                        };
                        break;
                    case 'bottom':
                        targetElPos = {
                            top: shiftHeight[pos0](),
                            left: shiftWidth[pos1]()
                        };
                        break;
                    default:
                        targetElPos = {
                            top: hostElPos.top - targetElHeight,
                            left: shiftWidth[pos1]()
                        };
                        break;
                    }
                    return targetElPos;
                }
            };
    }]);
});
