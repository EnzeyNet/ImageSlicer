(function (angular) {
    "use strict";

	var module = angular.module('net.enzey.image-splicer', []);

	module.service('PrimaryImage', function() {
		var primaryImage = null;
		return {
			get: function() {
				return primaryImage;
			},
			set: function(_primaryImage) {
				primaryImage = _primaryImage;
			}
		}
	});

	module.directive("spinner", function ($compile, $parse) {
		return {
			scope: {},
			compile: function ($element, $attrs) {
				var directiveName = this.name;

				return {
					pre: function(scope, element, attrs) {
						var parsed = $parse(attrs.ngModel);
						scope.decrease = function($event) {
							var increment = 1;
							if ($event.ctrlKey) {increment = 5;}
							if ($event.shiftKey) {increment = 10;}
							parsed.assign(scope.$parent, parsed(scope.$parent) - increment);
						};
						scope.increase = function($event) {
							var increment = 1;
							if ($event.ctrlKey) {increment = 5;}
							if ($event.shiftKey) {increment = 10;}
							parsed.assign(scope.$parent, parsed(scope.$parent) + increment);
						};
						element.append($compile('<button ng-click="decrease($event)">&#9664;</button>')(scope));
						element.append($compile('<span>{{$parent.' + attrs.ngModel + '}}</span>')(scope));
						element.append($compile('<button ng-click="increase($event)">&#9654;</button>')(scope));
					},
					post: function (scope, element, attrs) {
					}
				};
			}
		}
	});

	module.directive("fileSelector", function ($parse) {
		return {
			compile: function ($element, $attrs) {
				var directiveName = this.name;

				return {
					pre: function(scope, element, attrs) {
						element.bind("change", function (changeEvent) {
							var selectedFile = changeEvent.target.files[0];
							$parse(attrs.ngModel).assign(scope, selectedFile);
							scope.$apply();
						});
					},
					post: function (scope, element, attrs) {
					}
				};
			}
		}
	});

	module.directive('canvasManager', function($parse, PrimaryImage) {
		return {
			restrict: 'AE',
			compile: function ($element, $attrs) {
				var directiveName = this.name;
				var canvas = $element[0].getContext('2d');

				var storedImage;
				var storedRegions;

			    var renderBackgroundImage = function(imageObj) {
					$element[0].setAttribute('width',imageObj.width);
					$element[0].setAttribute('height',imageObj.height);

					canvas.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
				};

				var renderRegions = function(regions) {
					regions.forEach(function(region) {
						canvas.beginPath();
						canvas.lineWidth="2";
						canvas.strokeStyle=region.color;
						canvas.rect(region.x, region.y, region.width, region.height);
						canvas.stroke();
					});
				};

			    var loadImage = function(file) {

					// load image from data url
					var imageObj = new Image();
					imageObj.onload = function() {
						storedImage = this;
						PrimaryImage.set(storedImage);
						refreshCanvas();
					};

					var fr = new FileReader();
					fr.onload = function(dataURL) {
						imageObj.src = fr.result;
					};
					fr.readAsDataURL(file);
			    }

				var refreshCanvas = function() {
					if (storedImage) {renderBackgroundImage(storedImage)};
					if (storedRegions) {renderRegions(storedRegions)};
				};

				return {
					pre: function(scope, element, attrs) {
						scope.$watch(attrs.ngModel, function(newVal, oldVal) {
							if (newVal) {
								loadImage(newVal);
							}
						});

						scope.$watch($attrs['regions'], function(newVal, oldVal) {
							if (angular.isArray(newVal)) {
								storedRegions = newVal;
								refreshCanvas();
							}
						}, true);

					},
					post: function (scope, element, attrs) {
						/*
						
		  // make ajax call to get image data url
		  var request = new XMLHttpRequest();
		  request.open('GET', 'http://www.html5canvastutorials.com/demos/assets/dataURL.txt', true);
		  request.onreadystatechange = function() {
			// Makes sure the document is ready to parse.
			if(request.readyState == 4) {
			  // Makes sure it's found the file.
			  if(request.status == 200) {
				loadCanvas(request.responseText);
			  }
			}
		  };
		  request.send(null);
						*/
					}
				};
			}
		};
	});

})(angular, JSZip);