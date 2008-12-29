module Parser

  BASE_DIR = File.join(RAILS_ROOT, 'app/parsers')

  class Base
    @@environment = :debug
    @@parsers     = nil

    def self.set_environment(sym)
      @@environment = sym
    end

    def self.load_parser(name)
      name = name.camelize
      path = File.expand_path(File.join(BASE_DIR, name.underscore + '.rb'))
      Object.__send__(:remove_const, name) if Object.const_defined?(name)
      load(path)
      name.constantize
    end

    def self.find(name)
      unless Object.const_defined?(name)
        self.load_parser(name)
      else
        name.constantize
      end
    end

    def self.all_parsers()
      if !@@parsers || @@environment == :debug
        @@parsers = []
        Dir.glob(File.join(BASE_DIR, '*_parser.rb')).map do |path|
          @@parsers << self.load_parser(File.basename(path, '.rb'))
        end
      end
      @@parsers
    end

    def parse(*documents) raise 'You have to override this method.' end

  end

end
