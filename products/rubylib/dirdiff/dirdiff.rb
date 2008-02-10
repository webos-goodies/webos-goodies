require 'fileutils'

class DirDiff

  def initialize(old_path = nil, new_path = nil, options = {})
    @entries = []
    if old_path
      raise ArgumentError.new('the second argument is required if you specify the first one.') unless new_path
      if scan(old_path, new_path, options) && block_given?
        yield(self)
      end
    end
  end

  # options は以下の値を持つハッシュです。
  # :shallow   true なら、ディレクトリが追加・削除された際にディレクトリの中身をスキャンしない。デフォルト false。
  # :ignore    無視するファイル名を表す文字列、正規表現、またはそれらの配列。
  def scan(old_path, new_path, options = {})
    old_path = old_path.to_s
    new_path = new_path.to_s
    @old_base = old_path.empty? ? './' : old_path.to_s.sub!(/\/*\z/n, '/')
    @new_base = new_path.empty? ? './' : new_path.to_s.sub!(/\/*\z/n, '/')
    @options  = options.clone
    @entries  = []
    scan_dir('')
    !empty?
  end

  def empty?
    @entries.empty?
  end

  def each(filter = nil)
    if !filter
      @entries.each do |entry|
        yield(entry[0], entry[1], entry[2])
      end
    else
      @entries.each do |entry|
        yield(entry[0], entry[1], entry[2]) if filter[entry[2]]
      end
    end
  end

  private

  # path must have a trailing slash.
  def scan_dir(path)
    old_files = dir_entries(@old_base + path)
    new_files = dir_entries(@new_base + path)
    old_files.each do |fname, type|
      unless new_files.has_key?(fname) && new_files[fname] == type
        delete_dir(path + fname + '/') if type == :directory && !@options[:shallow]
        @entries << [path + fname, type, :deleted]
      end
    end
    new_files.each do |fname, type|
      if old_files.has_key?(fname) && old_files[fname] == type
        if type == :directory
          scan_dir(path + fname + '/')
        else
          compare_file(path + fname, type)
        end
      else
        @entries << [path + fname, type, :added]
        add_dir(path + fname + '/') if type == :directory && !@options[:shallow]
      end
    end
  end

  # path must have a trailing slash.
  def dir_entries(path)
    entries = {}
    Dir.foreach(path) do |fname|
      path_fname = path + fname
      next if fname == '.' || fname == '..' || filter_fname(path_fname)
      entries[fname] = File.ftype(path_fname).to_sym
    end
    entries
  end

  def filter_fname(fname)
    cond = @options[:ignore]
    if Array === cond
      cond.each do |c|
        return true if c === fname
      end
      false
    else
      cond === fname
    end
  end

  def compare_file(fname, type)
    if type == :file
      old_fname = @old_base + fname
      new_fname = @new_base + fname
      if(File.size?(old_fname) != File.size?(new_fname) ||
         !FileUtils.cmp(old_fname, new_fname))
        @entries << [fname, type, :modified]
      end
    end
  end

  # path must have a trailing slash.
  def add_dir(path)
    Dir.foreach(@new_base + path) do |fname|
      path_fname = path + fname
      next if fname == '.' || fname == '..' || filter_fname(path_fname)
      type  = File.ftype(@new_base + path_fname).to_sym
      @entries << [path_fname, type, :added]
      add_dir(path_fname + '/') if type == :directory
    end
  end

  # path must have a trailing slash.
  def delete_dir(path)
    Dir.foreach(@old_base + path) do |fname|
      path_fname = path + fname
      next if fname == '.' || fname == '..' || filter_fname(path_fname)
      type  = File.ftype(@old_base + path_fname).to_sym
      delete_dir(path_fname + '/') if type == :directory
      @entries << [path_fname, type, :deleted]
    end
  end

end
