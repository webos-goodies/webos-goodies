require 'net/ftp'
require 'stringio.so'

class Net::FTP
  LS_RE = /^ +(\S+) +(\d+) +(\S+) +(\S+) +(\d+) +(\S+) +(\d+) +(\S+) +(.+)$/

  class Stat
	attr_reader :name, :size, :user, :gid

	def initialize(info)
	  @name       = info[9]
	  @size       = info[5].to_i
	  @user       = info[3]
	  @group      = info[4]
	  @directory  = info[1][0] == 'd'[0]
	  @readable   = info[1].include?('r')
	  @writable   = info[1].include?('w')
	  @executable = info[1].include?('x')
	end

	def ftype() @directory ? "directory" : "file" end
	def to_s() @name end
	def directory?() @directory end
	def file?() !@directory end
	def readable?() @readable end
	def writable?() @writable end
	def executable?() @executable end
	def zero?() @size == 0 end
	def size?() @size != 0 end
  end

  def chmod(mode, filename)
	mode = mode.oct if mode.is_a?(String)
	sendcmd("SITE CHMOD #{sprintf('%03o', mode)} #{filename}")
  end

  def putbinarystring(str, remotefile, blocksize = DEFAULT_BLOCKSIZE, &block)
	if @resume
	  begin
		rest_offset = sizeof(remotefile)
	  rescue Net::FTPPermError
		rest_offset = nil
	  end
	else
	  rest_offset = nil
	end
	StringIO.open(str, 'r') do |file|
	  storbinary('STOR ' + remotefile, file, blocksize, rest_offset, &block)
	end
  end

  def foreach(path, &block)
	sendcmd("STAT #{path}").each do |line|
	  next unless info = LS_RE.match(line)
	  block.call(Stat.new(info))
	end
  end

  def rm_r(name)
	isdir = false
	foreach(name) do |stat|
	  fname = (name + '/' + stat.to_s).gsub(/\/+/, '/')
	  if stat.file?
		delete(isdir ? fname : stat.to_s)
	  elsif stat.to_s == '.'
		isdir = true
	  elsif stat.to_s != '..'
		rm_r(fname)
	  end
	end
	rmdir(name) if isdir
  end
end
