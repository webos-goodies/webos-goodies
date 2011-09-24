# -*- mode:ruby -*-

namespace :closure do

  BASE_DIR        = File.expand_path(File.join(RAILS_ROOT, 'public/javascripts'))
  CLOSURE_LIB_DIR = File.join(BASE_DIR, 'closure-library')
  DEPSWRITER      = File.join(CLOSURE_LIB_DIR, 'closure/bin/build/depswriter.py')
  CLOSUREBUILDER  = File.join(CLOSURE_LIB_DIR, 'closure/bin/build/closurebuilder.py')
  COMPILER        = File.expand_path('~/lib/closure-compiler/compiler.jar')
  SCRIPT_DIRS     = ['wg', 'blog']
  DEPS_FILE       = File.join(BASE_DIR, 'deps.js')
  SCRIPT_FILE     = File.join(BASE_DIR, 'common2.js')
  EXTERNS         = File.join(RAILS_ROOT, 'public/javascripts/externs.js')

  task :deps do
    Dir.chdir(BASE_DIR) do
      root_opts = SCRIPT_DIRS.map{|d| "--root_with_prefix=\"#{d} ../../../#{d}\"" }.join(' ')
      print "python #{DEPSWRITER} #{root_opts} --output_file=#{DEPS_FILE}\n"
      sh "python #{DEPSWRITER} #{root_opts} --output_file=#{DEPS_FILE}"
    end
  end

  task :compile do
    Dir.chdir(BASE_DIR) do
      root_opts = (SCRIPT_DIRS+['closure-library']).map{|d| "--root=#{d}" }.join(' ')
      cmd = ["python #{CLOSUREBUILDER} -o compiled -c #{COMPILER} -n blog.App",
             root_opts,
             "-f \"--compilation_level=ADVANCED_OPTIMIZATIONS\"",
             "-f \"--externs=#{EXTERNS}\"",
             "-f \"--define=goog.DEBUG=false\""].join(' ')
      code  = ['(function(){', `#{cmd}`, '})();'].join('')
      File.open(SCRIPT_FILE, 'w') do |file|
        file.write(code)
      end
    end
  end

end
