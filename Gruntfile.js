module.exports = function (grunt) {

  'use strict';
  
  var path = require('path');

  // load local tasks ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-jade');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-phonegap-build');
  grunt.loadNpmTasks('grunt-yui-compressor');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-shell');
  
  // project configuration ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  
  grunt.initConfig({
    build: { out: 'out' },
    deploy: {
      ios: { 
        root: '<%=build.out%>/ios',
        run: {
          device: '', //TODO(?): yup, what's the command line for this, huh?
          emulator: ''
        }
      },
      android: { 
        root: '<%=build.out%>/android',
        run: {
          //TODO(?): Package name is defined by the Cordova setup command; genericise
          device: 'adb -d install <%=deploy.android.root%>/bin/TodoApp-debug.apk', 
          //TODO(?): Assumes you have an emulator running (cmd line stuff here: http://tinyurl.com/d53heol)
          emulator: 'adb install <%=deploy.android.root%>/bin/TodoApp-debug.apk'
        }
      }
    }, 
    // basic operations ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    copy:{
      dist:{
        files:[
          // makes all src relative to cwd
          {expand: true, cwd:'app/', src:['**'],                                                  dest:'mobile/'},
          // copy & rename files
          {src: ['app/lib/angular/angular.min.js'],                             filter: 'isFile', dest: 'mobile/js/angular.min.js'},
          {src: ['app/lib/lungo-angular-bridge/src/lungo-angular-bridge.js'],   filter: 'isFile', dest: 'mobile/js/lungo-angular-bridge.js'},
          {src: ['app/lib/moment/min/langs.min.js'],                            filter: 'isFile', dest: 'mobile/js/moment-langs.min.js'},
          {src: ['app/lib/moment/min/moment.min.js'],                           filter: 'isFile', dest: 'mobile/js/moment.min.js'},
          {src: ['app/lib/quojs/quo.js'],                                       filter: 'isFile', dest: 'mobile/js/quo.min.js'},
        ]
      }
    },
          
    //zip the mobile folder
    compress: {
      main: {
        options: {
          archive: 'out/app.zip'
        },
        expand: true,
        cwd: 'app/',
        src: ['**/*']
      }
    },          
 
    // build cleanup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    clean: {
      'build-ios': ['<%= deploy.ios.root%>'],
      'build-android': ['<%= deploy.android.root %>']
    },

    //TODO(otupman) - the following are near-identical; should genericise it.
    //TODO(otupman) - create a generic grunt module for all of this so we can use it everywhere
    shell: {
      options: {stdout: true},
      bower: { command: 'bower install'},
      server: { command: 'python -m SimpleHTTPServer' },
      //Bower build stuff
      'build-ios': { command: "unzip -o <%= build.out%>/app.zip -d <%=deploy.ios.root%>/www/"},
      'build-android': { command: [
          "unzip -o <%= build.out%>/app.zip -d <%=deploy.android.root%>/assets/www/",
          'ant -buildfile <%=deploy.android.root%>/build.xml debug'
        ].join('&&')
      },
      'setup-ios': {
        command: [
          process.env.CORDOVA_HOME + '/lib/ios/bin/create <%=deploy.ios.root%> com.centralway.todoapp TodoApp'
        ].join('&&')
      },
      'setup-android': {
        command: [
          process.env.CORDOVA_HOME + '/lib/android/bin/create <%=deploy.android.root%> com.centralway.todoapp TodoApp',
          'cp <%=deploy.android.root%>/assets/www/cordova-2.7.0.js <%=deploy.android.root%>/assets/www/phonegap.js'
        ].join('&&')
      },
      'deploy-android-device': {
        command: [
          'adb -d uninstall com.centralway.todoapp',
          'adb -d install <%=deploy.android.root%>/bin/TodoApp-debug.apk'
        ].join('&&')
      }
    }
  });
    
  // grunt tasks  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  grunt.registerTask('default', 'Default Build', ['shell:bower', 'compress']);
  
  grunt.registerTask('server', '', ['shell:server']);
  
  grunt.registerTask('build-android-deploy', '', ['build-android', 'shell:deploy-android-device']);
  
  grunt.registerTask('setup-local-phonegap', 'Sets up for PG local builds', function(platform) {
    if(!process.env.CORDOVA_HOME) {
      grunt.fail.fatal('Set CORDOVA_HOME environment variable to build device-specific stuff');
      return;
    }
    var root = grunt.config.get('deploy.' + platform + '.root');
    if(!root) {
      grunt.verbose.writeln('Supported platforms: ' + JSON.stringify(grunt.config.get('deploy')));
      grunt.fail.fatal('No configuration for platform ' + platform);
    }
    var targetDir = path.normalize(__dirname + '/' + root);
    grunt.task.run('clean:build-' + platform);
    grunt.file.mkdir(targetDir);
    grunt.task.run('shell:setup-' + platform);    
  });
  
  grunt.registerTask('build-ios', [
     'default', 'shell:build-ios'
  ]);
  grunt.registerTask('build-android', [
     'default', 'shell:build-android'
  ]);
 
};
