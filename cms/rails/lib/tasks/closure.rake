# -*- mode:ruby -*-

namespace :closure do

  CLOSURE_LIB_DIR = File.expand_path(File.join(RAILS_ROOT, 'public/javascripts/closure'))
  WG_LIB_DIR      = '../../wg'
  PYTHON          = 'python'
  CALCDEPS        = File.join(CLOSURE_LIB_DIR, 'bin/calcdeps.py')
  COMPILER        = File.expand_path('~/lib/closure-compiler/compiler.jar')
  JSFILES         = FileList[File.join(RAILS_ROOT, 'public/javascripts/*-debug.js')]
  EXTERNS         = File.join(RAILS_ROOT, 'public/javascripts/externs.js')

  task :deps do
    Dir.chdir(File.join(CLOSURE_LIB_DIR, 'goog')) do
      sh "#{PYTHON} #{CALCDEPS} -p #{WG_LIB_DIR} -o deps > #{WG_LIB_DIR}/deps.js"
    end
  end

  task :compile do
    Dir.chdir(File.join(CLOSURE_LIB_DIR, 'goog')) do
      JSFILES.each do |sname|
        dname = sname.sub(/-debug\.js$/, '.js')
        cmd   = ["#{PYTHON} #{CALCDEPS} -o compiled -c #{COMPILER} -i #{sname}",
                 "-p #{CLOSURE_LIB_DIR}/goog -p #{WG_LIB_DIR}",
                 "-f \"--compilation_level=ADVANCED_OPTIMIZATIONS\"",
                 "-f \"--externs=#{EXTERNS}\"",
                 ENV['PRETTY_PRINT'] ? "-f \"--formatting=PRETTY_PRINT\"" : '',
                 "-f \"--define=goog.DEBUG=false\""].join(' ')
        code  = ['(function(){', `#{cmd}`, '})();'].join('')
        File.open(dname, 'w') do |file|
          file.write(code)
        end
      end
    end
  end

end
