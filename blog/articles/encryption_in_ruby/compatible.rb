#! /usr/bin/ruby
# -*- coding: utf-8 -*-

require 'openssl'

def encrypt_data(data, password, salt)
  cipher = OpenSSL::Cipher::Cipher.new("AES-256-CBC")
  cipher.encrypt
  cipher.pkcs5_keyivgen(password, salt, 1)
  cipher.update(data) + cipher.final
end

def decrypt_data(data, password, salt)
  cipher = OpenSSL::Cipher::Cipher.new("AES-256-CBC")
  cipher.decrypt
  cipher.pkcs5_keyivgen(password, salt, 1)
  cipher.update(data) + cipher.final
end

def print_help
  print "encrypt.rb コマンド 入力ファイル名\n"
  print "    コマンドは e で暗号化、 d で復号化\n"
end

command = { 'e' => 0, 'd' => 1}[(ARGV[0]||'').strip.downcase]
data    = ARGV[1] && IO.read(ARGV[1])

if command && data

  $stderr << "Password: "
  password = $stdin.gets.strip

  if command == 0
    salt = OpenSSL::Random.random_bytes(8)
    $stdout << "Salted__" + salt + encrypt_data(data, password, salt)
  else command == 1
    $stdout << decrypt_data(data[16, data.size], password, data[8, 8])
  end

else

  print_help()
  exit(1)

end
