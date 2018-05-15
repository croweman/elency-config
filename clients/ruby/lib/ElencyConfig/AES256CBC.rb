require 'base64'
require 'openssl'

class AES256CBC

  def encrypt(value, password, iv)
    aes = ::OpenSSL::Cipher::Cipher.new("AES-256-CBC")
    aes.padding = 1
    aes.encrypt
    aes.key = password
    aes.iv = iv
    encrypted = aes.update(value) + aes.final
    hexed = encrypted.unpack('H*')[0]
    return [hexed, iv]
  end

  def decrypt(encrypted, password)
    aes = ::OpenSSL::Cipher::Cipher.new("AES-256-CBC")
    aes.padding = 1
    aes.decrypt
    aes.key = password
    aes.iv = encrypted[1]

    dehexed = [encrypted[0]].pack('H*')
    decrypted = aes.update(dehexed) + aes.final
    return decrypted
  end

end