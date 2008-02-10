require 'test/unit'
require '../dirdiff'

Dir.chdir(File.dirname(__FILE__) + '/fixture')

class TC_DirDiff < Test::Unit::TestCase

  def test_add_file
    expect = ['new_file', :file, :added]
    result = []
    old_path = 'add_file/old'
    new_path = 'add_file/new'
    DirDiff.new(old_path, new_path, :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
    assert_equal('add_file/old', old_path)
    assert_equal('add_file/new', new_path)

    result.clear
    Dir.chdir('add_file/new') do
      diff = DirDiff.new
      diff.scan('../old', '', :ignore => /(^|\/)\.svn\z/)
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_add_dir
    expect = ['new_dir1', :directory, :added,
              'new_dir1/new_dir2', :directory, :added,
              'new_dir1/new_dir2/new_file2', :file, :added,
              'new_dir1/new_file1', :file, :added]
    result = []
    DirDiff.new('add_dir/old', 'add_dir/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_add_dir_shallow
    expect = ['new_dir1', :directory, :added]
    result = []
    DirDiff.new('add_dir/old', 'add_dir/new', :shallow => true, :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_delete_file
    expect = ['lost_file', :file, :deleted]
    result = []
    DirDiff.new('delete_file/old', 'delete_file/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_delete_dir
    expect = ['lost_dir1/lost_dir2/lost_file2', :file, :deleted,
              'lost_dir1/lost_dir2', :directory, :deleted,
              'lost_dir1/lost_file1', :file, :deleted,
              'lost_dir1', :directory, :deleted]
    result = []
    DirDiff.new('delete_dir/old', 'delete_dir/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_delete_dir_shallow
    expect = ['lost_dir1', :directory, :deleted]
    result = []
    DirDiff.new('delete_dir/old', 'delete_dir/new', :shallow => true, :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_modification
    expect = ['dir/modified_file2', :file, :modified,
              'modified_file1', :file, :modified]
    result = []
    DirDiff.new('modification/old', 'modification/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_dot_files
    expect = ['.lost_dir/.lost_file', :file, :deleted,
              '.lost_dir', :directory, :deleted,
              '.new_dir', :directory, :added,
              '.new_dir/.new_file', :file, :added,
              '.modified_file', :file, :modified]
    result = []
    DirDiff.new('dot_files/old', 'dot_files/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

  def test_filter
    expect = ['.modified_file', :file, :modified]
    result = []
    DirDiff.new('dot_files/old', 'dot_files/new', :ignore => /(^|\/)\.svn\z/) do |diff|
      diff.each(:modified => true) do |fname, type, operation|
        result << fname << type << operation
      end
    end
    assert_equal(expect, result)
  end

end
