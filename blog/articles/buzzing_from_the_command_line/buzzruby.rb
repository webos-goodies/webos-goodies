#! /usr/bin/ruby
# -*- coding: utf-8 -*-

EMAIL    = 'youraccount@gmail.com'
PASSWORD = 'password'

require "openssl"
require "net/smtp"
require 'nkf'

class Buzzruby

  def initialize(user, password)
    @user     = user + (user.index('@') ? '' : '@gmail.com')
    @password = password
  end

  def post(buzz)
    # Windows では以下のようにしてください
    #buzz = NKF.nkf('-Swm0MB', buzz).gsub(/\s/, '')
    buzz = NKF.nkf('-Wwm0MB', buzz).gsub(/\s/, '')

    SMTP.start('smtp.gmail.com', 587,
               'localhost.localdomain', @user, @password, :plain) do |smtp|
      smtp.send_mail(<<EOS, @user, 'buzz@gmail.com')
From: #{@user}
To: buzz@gmail.com
Subject: =?UTF-8?B?#{buzz}?=

EOS
    end
  end

  #-----------------------------------------------------------
  # Following class is borrowed from:
  #   http://21croissants.blogspot.com/2007/08/configuring-rails-to-use-gmails-smtp.html
  #   http://wwwaku.com/blog_part2/2007/10/29/railsでgmailをsmtpサーバーとして使う方法/
  class SMTP < Net::SMTP
    private
    def do_start(helodomain, user, secret, authtype)
      raise IOError, 'SMTP session already started' if @started
      check_auth_args user, secret, authtype if user or secret

      sock = timeout(@open_timeout) { TCPSocket.open(@address, @port) }
      @socket = Net::InternetMessageIO.new(sock)
      @socket.read_timeout = 60 #@read_timeout

      check_response(critical { recv_response() })
      do_helo(helodomain)

      if starttls
        raise 'openssl library not installed' unless defined?(OpenSSL)
        ssl = OpenSSL::SSL::SSLSocket.new(sock)
        ssl.sync_close = true
        ssl.connect
        @socket = Net::InternetMessageIO.new(ssl)
        @socket.read_timeout = 60 #@read_timeout
        do_helo(helodomain)
      end

      authenticate user, secret, authtype if user
      @started = true
    ensure
      unless @started
        # authentication failed, cancel connection.
        @socket.close if not @started and @socket and not @socket.closed?
        @socket = nil
      end
    end

    def do_helo(helodomain)
      begin
        if @esmtp
          ehlo helodomain
        else
          helo helodomain
        end
      rescue Net::ProtocolError
        if @esmtp
          @esmtp = false
          @error_occured = false
          retry
        end
        raise
      end
    end

    def starttls
      getok('STARTTLS') rescue return false
      return true
    end

    def quit
      begin
        getok('QUIT')
      rescue EOFError, OpenSSL::SSL::SSLError
      end
    end
  end
  #-----------------------------------------------------------

end

unless buzz = $*[0]
  buzz = $stdin.gets
end

buzzruby = Buzzruby.new(EMAIL, PASSWORD)
buzzruby.post(buzz)
