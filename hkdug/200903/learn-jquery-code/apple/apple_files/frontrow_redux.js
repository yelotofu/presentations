
if (typeof(AC) == 'undefined') { AC = {}; }

AC.FrontRow = Class.create();
Object.extend(Object.extend(AC.FrontRow.prototype, Event.Listener), {

	sections: null,
	currentSection: null,
	currentMovie: null,
	currentController: null,
	displayPanel: null,
	descriptionPanel: null,
	options: null,
	hasQuicktime: false,

	initialize: function(movie, displayPanel, descriptionPanel, sections, options) {
		
		this.currentMovie = movie;
		this.sections = sections;
		this.displayPanel = displayPanel;
		this.descriptionPanel = descriptionPanel;
		this.options = options || {};
		
		if (this.options.controller) {
			this.currentController = this.options.controller;
		}
		
		for(var i = 0; i < this.sections.length; i++) {
			this.listenForEvent(this.sections[i], 'activate', false, function(evt) {
				var section = evt.event_data.data;
				this.show(section);
			});
			
		}
		
		this.hasQuicktime = AC.Detector.isValidQTAvailable(this.options.requiredQT || "7");
		
		Event.observe(window, 'unload', function() {
			this.currentController = null;
			this.currentMovie = null;
		}.bind(this));
		
	},
	
	showFirst: function() {
		this.show(this.sections[0]);
	},
	
	showNext: function(wrap) {
		
		var next = this.sections.indexOf(this.currentSection) + 1;
		if (this.sections.length > next) {
			this.show(this.sections[next]);
		} else if(wrap) {
			this.show(this.sections[0])
		}
	},
	
	showPrevious: function(wrap) {
		
		var previous = this.sections.indexOf(this.currentSection) - 1;
		if (previous >= 0) {
			this.show(this.sections[previous]);
		} else if (wrap) {
			this.show(this.sections.last());
		}
	},
	
	show: function(section) {
		
		//if we're already showing it don't try to again unless forced to
		if (!this.options.forceShow && (section == this.currentSection && this.isPlaying())) {
			return;
		}
		
		var showDescription = function(description) {
			
			if (!this.descriptionPanel) {
				return;
			}
			
			if (typeof(description) == 'string') {
				this.descriptionPanel.innerHTML = description;
			} else {
				this.descriptionPanel.innerHTML = '';
				this.descriptionPanel.appendChild(description.cloneNode(true));
			}
		}.bind(this);
		
		var showMovie = function(movieUrl) {
			
			this.currentController.SetURL(movieUrl);
			
			//don't deactivate it if it was the same section we 
			//were reactivating because it wasn't playing
			if (section != this.currentSection) {
				this.currentSection.deactivate();
			}
			
		}.bind(this);
		
		var showStaticContent = function(content) {

			if (this.currentSection) {
				this.currentSection.deactivate();
			}
			
			this.displayPanel.innerHTML = '';
			
			if(content) {
				this.displayPanel.appendChild(content.cloneNode(true));
			}
			
		}.bind(this);
		
		//indicate active status early so there is less delay
		section.activate();
		
		if (typeof(this.options.beforeStartMovie) == 'function') {
			this.options.beforeStartMovie(section);
		}
		
		showDescription(section.description);
		
		if (this.hasQuicktime && section.movieUrl != null) {
			
			if(!this.currentSection) {
				this.displayPanel.appendChild(this.currentMovie);
				
				if (!this.currentController) {
					this.currentController = new AC.QuicktimeController(this.currentMovie);
				}
				
			} else {
				showMovie(section.movieUrl);
			}
			
		} else {
			showStaticContent(section.options.staticContent);
		}
		
		this.currentSection = section;
		
		if (typeof(this.options.onStartMovie) == 'function') {
			this.options.onStartMovie(this.currentSection);
		}
	},
	
	isPlaying: function() {
		return this.currentController.isPlaying();
	}
	
});

/**
 * Individual section within FrontRow that has all the information needed to
 * display a given section
 */
AC.FrontRowSection = Class.create();
Object.extend(Object.extend(AC.FrontRowSection.prototype, Event.Publisher), {

	trigger: null,
	title: null,
	movieUrl: null,
	description: null,
	options: null,
	
	/**
	 * intiialize section with necessary information
	 */
	initialize: function(trigger, title, movieUrl, description, options) {
		
		this.trigger = trigger;
		this.title = title;
		this.movieUrl = movieUrl;
		this.description = description;
		this.options = options || {};
		
		Event.observe(this.trigger, 'mouseover', function() {
			Element.addClassName(this.trigger, 'hover');
		}.bind(this), false);
		
		Event.observe(this.trigger, 'mouseout', function() {
			Element.removeClassName(this.trigger, 'hover');
		}.bind(this), false);
		
		Event.observe(this.trigger, 'click', function(evt) {
			//if opera there's no way the SetURL would work so when triggered
			//just follow the link on the trigger which if we're being good
			//should reload the page at a URL which will open the correct
			//section initially
			if(!AC.Detector.isOpera()) {
				Event.stop(evt);
 				this.dispatchEvent('activate', this);
			}
		}.bind(this), false)
		
	},

	/**
	 * Sets the trigger to indicate the correct state and attaches to movie
	 * NOTE: the movie has to be in the DOM for the attaching to work
	 */
	activate: function() {
		Element.addClassName(this.trigger, 'active');
	},
	
	/**
	 * Sets the trigger to indicate the correct state and rewinds movie
	 */
	deactivate: function() {
		Element.removeClassName(this.trigger, 'active');
	}
	
});