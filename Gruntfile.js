module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	var tBuild = Date.now();
	var pkg =  grunt.file.readJSON('package.json');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			js: {
				src: [
					'public/app/main/module.js',
					'tmp/templates.js',
					'public/app/main/**/*.js',
					'public/app/accounting/module.js',
					'public/app/accounting/**/*.js',
					'public/app/collaboration/module.js',
					'public/app/collaboration/**/*.js',
					'public/app/flow/module.js',
					'public/app/flow/**/*.js',
					'public/app/identity/module.js',
					'public/app/identity/**/*.js',
					'public/app/organizations/module.js',
					'public/app/organizations/**/*.js',
					'public/app/people/module.js',
					'public/app/people/**/*.js',
					'public/app/kanbanize/module.js',
					'public/app/kanbanize/**/*.js',
					'!**/*.spec.js'
				],
				dest: 'build/js/app-' + pkg.version + '-' + tBuild + '.js'
			},
			css: {
				src: 'public/app/**/*.css',
				dest: 'build/css/style.css'
			}
		},
		uglify: {
			options: {
				preserveComments: false
			},
			js: {
				files: {
					['build/js/app-' + pkg.version + '-' + tBuild + '.min.js']: ['build/js/app-' + pkg.version + '-' + tBuild + '.js']
				}
			}
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'build/css/style.min.css': ['build/css/style.css']
				}
			}
		},
		clean: {
			build: [
				'build'
			],
			tmp: [
				'tmp'
			]
		},
		jshint: {
			app: {
				options: {
					funcscope:true
				},
				files:{
					src:['public/app/**/*.js']
				}
			}
		},
		processhtml: {
			options: {
				data: {
					ver: pkg.version,
					t: tBuild
				}
    		},
			dist: {
				files: {
					'build/index.html': ['public/index.html']
				}
			}
		},
		ngtemplates: {
			app: {
				cwd:  'public',
				src:  'app/**/*.html',
				dest: 'tmp/templates.js',
				options:    {
					htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
				}
			}
		},
		copy: {
			main: {
				files: [
					{src: 'public/icon-set.svg', dest: 'build/icon-set.svg'},
					{src: 'public/robots.txt', dest: 'build/robots.txt'},
					{src: 'public/components/angular-material/angular-material.min.css', dest: 'build/components/angular-material/angular-material.min.css'},
					{src: 'public/components/jquery/dist/jquery.min.js', dest: 'build/components/jquery/dist/jquery.min.js'},
					{src: 'public/components/angular/angular.min.js', dest: 'build/components/angular/angular.min.js'},
					{src: 'public/components/angular-resource/angular-resource.min.js', dest: 'build/components/angular-resource/angular-resource.min.js'},
					{src: 'public/components/angular-sanitize/angular-sanitize.min.js', dest: 'build/components/angular-sanitize/angular-sanitize.min.js'},
					{src: 'public/components/angular-aria/angular-aria.min.js', dest: 'build/components/angular-aria/angular-aria.min.js'},
					{src: 'public/components/angular-animate/angular-animate.min.js', dest: 'build/components/angular-animate/angular-animate.min.js'},
					{src: 'public/components/angular-messages/angular-messages.min.js', dest: 'build/components/angular-messages/angular-messages.min.js'},
					{src: 'public/components/angular-cookies/angular-cookies.min.js', dest: 'build/components/angular-cookies/angular-cookies.min.js'},
					{src: 'public/components/angular-cookies/angular-cookies.min.js', dest: 'build/components/angular-cookies/angular-cookies.min.js'},
					{src: 'public/components/angular-material/angular-material.min.js', dest: 'build/components/angular-material/angular-material.min.js'},
					{src: 'public/components/angular-ui-router/release/angular-ui-router.min.js', dest: 'build/components/angular-ui-router/release/angular-ui-router.min.js'},
					{src: 'public/components/moment/min/moment.min.js', dest: 'build/components/moment/min/moment.min.js'},
					{src: 'public/components/angular-moment/angular-moment.min.js', dest: 'build/components/angular-moment/angular-moment.min.js'},
					{src: 'public/components/ngInfiniteScroll/build/ng-infinite-scroll.min.js', dest: 'build/components/ngInfiniteScroll/build/ng-infinite-scroll.min.js'},
					{src: 'public/components/lodash/dist/lodash.min.js', dest: 'build/components/lodash/dist/lodash.min.js'},
					{expand: true, cwd: 'public/img/', src: ['**'], dest: 'build/img/'}
				]

			},
		},
		shell: {
			testSingle: {
				command: 'npm run test-single-run'
			}
		},
		watch: {
			scripts: {
				tasks: ['jshint','shell:testSingle'],
				files: ['public/**/*.js'],
			}
		},
		shell: {
	        deploy_staging: {
	            command: 'rsync ./build/* cocoon-test:/var/www/vhosts/welo-prod/public --rsh ssh -r --verbose --rsync-path="sudo rsync"'
	        },
			deploy_prod: {
				command: 'rsync ./build/* cocoon:/var/www/vhosts/welo-prod/public --rsh ssh -r --verbose --rsync-path="sudo rsync"'
			}
	    }
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('build', ['jshint', 'clean:build', 'ngtemplates', 'concat', 'uglify', 'cssmin', 'processhtml', 'copy', 'clean:tmp']);
	grunt.registerTask('deploy_staging', ['build', 'shell:deploy_staging']);
	grunt.registerTask('deploy', ['build', 'shell:deploy_prod']);
};
