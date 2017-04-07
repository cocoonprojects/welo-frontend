module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

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
					'public/app/kanbanize/**/*.js'
				],
				dest: 'build/js/app.js'
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
					'build/js/app.min.js': ['build/js/app.js']
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
					{src: 'public/icon-set.svg',dest: 'build/icon-set.svg'},
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
	            command: 'rsync ./build/* cocoon@10.250.2.44:/var/www/vhosts/welo-stage/public --rsh ssh -r --verbose'
	        },
			deploy_prod: {
				command: 'rsync ./build/* cocoon@10.250.2.44:/var/www/vhosts/welo-prod/public --rsh ssh -r --verbose'
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
