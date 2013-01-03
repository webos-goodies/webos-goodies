#! /usr/bin/ruby

require 'rubygems'
require 'yaml'
require 'optparse'
require 'aws-sdk'
require 'mime/types'

class RRSUpload

  attr_reader   :s3_client
  attr_accessor :time_compare
  attr_accessor :verbose

  def initialize(config)
    @s3_client    = AWS::S3.new(config)
    @time_compare = false
    @verbose      = false
  end

  def upload_dir(local_path, s3_path, opts={})
    Dir.chdir(local_path) do
      Dir.glob('**/*') do |path|
        if File.file?(path)
          upload_file(path, File.join(s3_path, path))
        end
      end
    end
  end

  def upload_file(local_path, s3_path, opts={})
    bucket_name, key = split_s3_path(s3_path)
    object = s3_client.buckets[bucket_name].objects[key]
    if !@time_compare || modified?(local_path, object)
      print "#{local_path} => #{bucket_name}:#{key}\n" if @verbose
      opts = {
        :reduced_redundancy => true,
        :content_type => get_content_type(local_path)
      }.merge(opts)
      object.write(Pathname.new(local_path), opts)
    end
  end

  private

  def split_s3_path(path)
    rv = path.gsub(/\A\/+|\/+\z/u, path).split('/', 2)
    raise "A file must be in any bucket." if rv.size <= 1
    rv
  end

  def get_content_type(path)
    types = MIME::Types.type_for(path)
    if types.empty?
      'application/octet-stream'
    elsif types[0].extensions.include?('js')
      'text/javascript'
    else
      types[0].to_s
    end
  end

  def modified?(local_path, object)
    begin
      File.mtime(local_path) > object.last_modified
    rescue
      true
    end
  end

end


$options = {
  :conf_path    => File.join(File.dirname(__FILE__), 'rrs_upload.yml'),
  :time_compare => false,
  :verbose      => false,
  :help         => false
}

OptionParser.new("Usage: rrs_upload.rb [options] <local_path> <s3_path>", 20) do |opt|
  abort = false
  opt.on('-h', '--help', 'Show this message.') { $options[:help] = true }
  opt.on('-c', '--config PATH',
         'Load configurations from PATH.') {|path| $options[:conf_path] = path }
  opt.on('-t', 'Skip older files.') { $options[:time_compare] = true }
  opt.on('-v', 'Verbose mode.') { $options[:verbose] = true }
  opt.parse!(ARGV)

  if $options[:help] || ARGV.size != 2
    $stderr << opt.help
    exit(1)
  end
end

if $options[:verbose]
  $stderr << "Configuration file: #{$options[:conf_path]}\n"
  $stderr << "If local file is older than s3: #{$options[:time_compare] ? 'skipped' : 'uploaded' }\n"
end

conf = YAML.load_file($options[:conf_path])
rrs_upload = RRSUpload.new(:access_key_id     => conf['access_key_id'],
                           :secret_access_key => conf['secret_access_key'])
rrs_upload.time_compare = $options[:time_compare]
rrs_upload.verbose      = $options[:verbose]

if File.directory?(ARGV[0])
  rrs_upload.upload_dir(ARGV[0], ARGV[1])
elsif File.file?(ARGV[0])
  rrs_upload.upload_file(ARGV[0], ARGV[1])
else
  $stderr << "#{ARGV[0]} is not a file nor a directory."
end
